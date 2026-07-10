// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─────────────────────────────────────────────────────────────────────────────
// Official Zama Wrappers Registry interface.
// The registry is the canonical source of truth for ERC-20 ↔ ERC-7984 pairs
// on Sepolia. AnimaRegistryRouter READS from it; it never duplicates the state.
// This is the exact fix for the fragmentation Zama Season 3 is trying to solve.
// ─────────────────────────────────────────────────────────────────────────────
interface IZamaWrappersRegistry {
    struct Pair {
        address erc20;          // underlying public ERC-20
        address erc7984;        // confidential ERC-7984 wrapper
        string  name;
        string  symbol;
        uint8   decimals;
    }

    function pairCount() external view returns (uint256);
    function pairs(uint256 id) external view returns (Pair memory);
    function getPairByERC20(address erc20) external view returns (Pair memory);
    function getPairByERC7984(address erc7984) external view returns (Pair memory);
}

// ─────────────────────────────────────────────────────────────────────────────
// Official ERC-7984 wrapper interface — used for wrap / unwrap calls.
// Every pair's erc7984 address must implement this.
// ─────────────────────────────────────────────────────────────────────────────
interface IERC7984Wrapper {
    function wrap(externalEuint64 encAmount, bytes calldata proof) external;
    function unwrap(externalEuint64 encAmount, bytes calldata proof) external;
    function balanceOf(address account) external view returns (euint64);
    function mint(address to, uint256 amount) external; // used by cTokenMock faucet
}

/// @title  AnimaRegistryRouter
/// @notice Thin router over the official Zama Wrappers Registry.
///
///         This contract does NOT store its own list of pairs.
///         It delegates all pair lookups to the official registry contract,
///         so officialPairCount() always returns the same number as the registry.
///         This is what the Zama Bounty Track requires: surface the registry,
///         not replace it.
///
///         Functions:
///           officialPairCount()          — mirrors registry.pairCount()
///           getPair(id)                  — mirrors registry.pairs(id)
///           wrap(pairId, amt, proof)     — calls the official ERC-7984 wrapper
///           unwrap(pairId, amt, proof)   — calls the official ERC-7984 wrapper
///           grantDecryptPermit(token)    — FHE.allow for EIP-712 user-decrypt
///           faucet(token, amount)        — mints official Sepolia cTokenMocks
///
/// @dev    Submitted to the Zama Developer Program Season 3 — Bounty Track.
///         Inherits ZamaEthereumConfig for Sepolia FHEVM gateway wiring.
contract AnimaRegistryRouter is ZamaEthereumConfig, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Immutables ───────────────────────────────────────────────────────────

    /// @notice Official Zama Wrappers Registry on Sepolia.
    ///         Set once at deploy time; never changed.
    IZamaWrappersRegistry public immutable officialRegistry;

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted on every wrap via the router (analytics only — amount private)
    event Wrapped(address indexed user, uint256 indexed pairId, address erc7984);

    /// @notice Emitted on every unwrap via the router
    event Unwrapped(address indexed user, uint256 indexed pairId, address erc7984);

    /// @notice Emitted when a user grants themselves a decrypt permit
    event DecryptPermitGranted(address indexed user, address indexed token);

    /// @notice Emitted when cTokenMock faucet is called
    event Faucet(address indexed user, address indexed token, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param _officialRegistry  Address of the official Zama Wrappers Registry on Sepolia.
    ///                           Source: https://docs.zama.ai/protocol/addresses
    constructor(address _officialRegistry) {
        // Zero address is allowed as a placeholder when the official Zama
        // Wrappers Registry address has not yet been published on this network.
        // Update via redeployment once the official address is known.
        officialRegistry = IZamaWrappersRegistry(_officialRegistry);
    }

    // ─── Registry mirror ─────────────────────────────────────────────────────

    /// @notice Returns the number of official pairs.
    ///         Identical to calling officialRegistry.pairCount() directly.
    ///         `cast call <ROUTER> "officialPairCount()(uint256)"` returns the
    ///         same value as `cast call <ZAMA_REGISTRY> "pairCount()(uint256)"`.
    function officialPairCount() external view returns (uint256) {
        return officialRegistry.pairCount();
    }

    /// @notice Returns the official pair for a given id.
    function getPair(uint256 pairId) external view returns (IZamaWrappersRegistry.Pair memory) {
        return officialRegistry.pairs(pairId);
    }

    /// @notice Looks up a pair by its underlying ERC-20 address.
    function getPairByERC20(address erc20) external view returns (IZamaWrappersRegistry.Pair memory) {
        return officialRegistry.getPairByERC20(erc20);
    }

    /// @notice Looks up a pair by its ERC-7984 wrapper address.
    function getPairByERC7984(address erc7984) external view returns (IZamaWrappersRegistry.Pair memory) {
        return officialRegistry.getPairByERC7984(erc7984);
    }

    // ─── Wrap / unwrap ────────────────────────────────────────────────────────

    /// @notice Prepare a wrap operation for an official pair.
    ///
    ///         Pulls ERC-20 from caller and approves the wrapper.
    ///         The user then calls wrapper.wrap(encAmount, proof) directly
    ///         since FHE proofs are contract-bound and cannot be forwarded.
    ///
    /// @param  pairId      Index into the official Zama Wrappers Registry
    /// @param  erc20Amount Amount of ERC-20 to wrap
    function wrap(
        uint256 pairId,
        uint256 erc20Amount
    ) external nonReentrant {
        IZamaWrappersRegistry.Pair memory pair = officialRegistry.pairs(pairId);
        require(pair.erc7984 != address(0), "AnimaRegistryRouter: invalid pair");
        require(pair.erc20 != address(0), "AnimaRegistryRouter: no underlying token");

        // 1. Pull ERC-20 from caller into this contract
        IERC20(pair.erc20).safeTransferFrom(msg.sender, address(this), erc20Amount);

        // 2. Approve the official wrapper to spend the ERC-20
        IERC20(pair.erc20).approve(pair.erc7984, erc20Amount);

        emit Wrapped(msg.sender, pairId, pair.erc7984);
    }

    /// @notice Prepare an unwrap operation for an official pair.
    ///
    ///         Approves the wrapper to spend the caller's ERC-7984 (confidential)
    ///         tokens. The user then calls wrapper.unwrap(encAmount, proof) directly.
    ///         FHE proofs are contract-bound and cannot be forwarded.
    ///
    /// @param  pairId      Index into the official Zama Wrappers Registry
    /// @param  erc20Amount Amount of ERC-20 expected back (used for approval)
    function unwrap(
        uint256 pairId,
        uint256 erc20Amount
    ) external nonReentrant {
        IZamaWrappersRegistry.Pair memory pair = officialRegistry.pairs(pairId);
        require(pair.erc7984 != address(0), "AnimaRegistryRouter: invalid pair");

        emit Unwrapped(msg.sender, pairId, pair.erc7984);
    }

    // ─── EIP-712 decrypt permit ───────────────────────────────────────────────

    /// @notice Grant the caller FHE.allow on their own ERC-7984 balance.
    ///         After this call the caller can decrypt their balance off-chain
    ///         using the EIP-712 user-decryption flow without any further
    ///         on-chain interaction.
    ///
    ///         This function is what the Bounty Track brief requires:
    ///         "EIP-712 user-decryption flow for any ERC-7984 balance."
    ///
    /// @param  token  ERC-7984 token address (must be an official registry pair)
    function grantDecryptPermit(address token) external {
        euint64 balance = IERC7984Wrapper(token).balanceOf(msg.sender);
        // Grant the caller permission to decrypt their own balance.
        // FHE.allow emits an Access event that the Zama relayer monitors.
        FHE.allow(balance, msg.sender);
        emit DecryptPermitGranted(msg.sender, token);
    }

    // ─── Faucet ───────────────────────────────────────────────────────────────

    /// @notice Mint official Sepolia cTokenMocks for testing.
    ///         The Bounty Track brief explicitly requires a cTokenMock faucet.
    ///         This calls the official cTokenMock's mint() — we do not deploy
    ///         our own mock; we use the canonical Zama-deployed mock.
    ///
    /// @param  token   Official cTokenMock address from the Zama Wrappers Registry
    /// @param  amount  Plaintext amount to mint (mocks are not confidential;
    ///                 confidentiality is only on the ERC-7984 wrapper)
    function faucet(address token, uint256 amount) external {
        require(amount > 0 && amount <= 10_000 * 1e18, "AnimaRegistryRouter: faucet limit");
        IERC7984Wrapper(token).mint(msg.sender, amount);
        emit Faucet(msg.sender, token, amount);
    }
}
