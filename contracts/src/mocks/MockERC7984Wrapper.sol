// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @notice Mock ERC-7984 wrapper for AnimaRegistryRouter tests.
///         Tracks call counts and stores encrypted balances.
contract MockERC7984Wrapper is ZamaEthereumConfig {
    string public name;
    string public symbol;
    uint8 public decimals;
    address public underlying;

    mapping(address => euint64) private _balances;

    uint256 public wrapCallCount;
    uint256 public unwrapCallCount;
    uint256 public mintCallCount;

    event Wrap(address indexed user, externalEuint64 encAmount);
    event Unwrap(address indexed user, externalEuint64 encAmount);

    constructor(
        string memory name_,
        string memory symbol_,
        address underlying_
    ) {
        name = name_;
        symbol = symbol_;
        decimals = 6;
        underlying = underlying_;
    }

    /// @notice Wraps ERC-20 → ERC-7984 (mock: just records the call + stores balance)
    function wrap(externalEuint64 encAmount, bytes calldata proof) external {
        wrapCallCount++;
        euint64 amount = FHE.fromExternal(encAmount, proof);
        _balances[msg.sender] = FHE.add(_balances[msg.sender], amount);
        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);
        emit Wrap(msg.sender, encAmount);
    }

    /// @notice Unwraps ERC-7984 → ERC-20 (mock: just records the call)
    function unwrap(externalEuint64 encAmount, bytes calldata proof) external {
        unwrapCallCount++;
        euint64 amount = FHE.fromExternal(encAmount, proof);
        _balances[msg.sender] = FHE.sub(_balances[msg.sender], amount);
        FHE.allowThis(_balances[msg.sender]);
        FHE.allow(_balances[msg.sender], msg.sender);
        emit Unwrap(msg.sender, encAmount);
    }

    /// @notice Returns encrypted balance.
    function balanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    /// @notice Mint encrypted tokens (used by faucet in tests).
    function mint(address to, uint256 amount) external {
        mintCallCount++;
        _balances[to] = FHE.add(_balances[to], FHE.asEuint64(uint64(amount)));
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
    }

    /// @notice Mint encrypted tokens (used by grantDecryptPermit test).
    function mintEncrypted(address to, uint256 amount) external {
        _balances[to] = FHE.add(_balances[to], FHE.asEuint64(uint64(amount)));
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
    }
}
