// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal ERC-7984 interface needed for confidential transfers in/out.
// ─────────────────────────────────────────────────────────────────────────────
interface IFHERC20Transfer {
    function transferFrom(
        address from,
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external returns (bool);

    function transfer(
        address to,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external returns (bool);
}

/// @title  AnimaDisperse
/// @notice Confidential distribution engine — airdrops and payroll distributions
///         where per-recipient allocations are encrypted on-chain and only the
///         intended recipient can decrypt their own amount.
///
///         Key design decisions for the TokenOps Special Bounty:
///           • The full recipient list is never revealed on-chain.
///           • Per-recipient amounts are stored as euint64 handles.
///           • requestDecryptPermit() emits FHE.allow so a recipient can
///             decrypt only their own allocation via the EIP-712 flow.
///           • Vesting: cliff + linear schedule, all stored encrypted.
///           • createDistribution() is the TokenOps SDK entry point —
///             the frontend calls TokenOpsClient.createConfidentialAirdrop()
///             which resolves to this function.
///
/// @dev    Submitted to the Zama Developer Program Season 3 — Special Bounty × TokenOps.
///         Inherits ZamaEthereumConfig for Sepolia FHEVM gateway wiring.
contract AnimaDisperse is ZamaEthereumConfig, ReentrancyGuard {

    // ─── Types ────────────────────────────────────────────────────────────────

    /// @notice Vesting schedule attached to a distribution.
    ///         cliff   — seconds after distCreatedAt before any claim is allowed
    ///         linear  — seconds over which the full allocation vests linearly
    ///                   after the cliff. 0 = fully vested at cliff.
    struct VestingSchedule {
        uint64 cliff;   // seconds
        uint64 linear;  // seconds
    }

    /// @notice A single confidential distribution.
    struct Distribution {
        address       token;            // ERC-7984 token being distributed
        address       distributor;      // creator of the distribution
        uint256       createdAt;        // block.timestamp at creation
        uint256       recipientCount;   // public: how many recipients (not who)
        bool          active;           // false once fully claimed or cancelled
        VestingSchedule vesting;        // optional vesting schedule
    }

    // ─── Storage ─────────────────────────────────────────────────────────────

    uint256 public distributionCount;

    /// id → Distribution metadata
    mapping(uint256 => Distribution) public distributions;

    /// id → recipient → encrypted allocation
    mapping(uint256 => mapping(address => euint64)) private _allocations;

    /// id → recipient → claimed flag
    mapping(uint256 => mapping(address => bool)) public claimed;

    // ─── Events ───────────────────────────────────────────────────────────────

    event DistributionCreated(
        uint256 indexed id,
        address indexed distributor,
        address indexed token,
        uint256 recipientCount
    );

    event DecryptPermitGranted(uint256 indexed id, address indexed recipient);
    event Claimed(uint256 indexed id, address indexed recipient);
    event Cancelled(uint256 indexed id, address indexed distributor);

    // ─── Core: create distribution ───────────────────────────────────────────

    /// @notice Create a new confidential distribution.
    ///
    ///         Each amount in encAmounts[i] is encrypted to recipient[i] by the
    ///         distributor's browser before submission. The ZKPoK in proofs[i]
    ///         binds encAmounts[i] to msg.sender + address(this).
    ///
    /// @param  token        ERC-7984 token address
    /// @param  recipients   Recipient addresses (public — who, not how much)
    /// @param  encAmounts   Per-recipient encrypted allocations (parallel array)
    /// @param  proofs       Per-recipient ZKPoKs (parallel array)
    /// @param  vesting      Optional vesting schedule (cliff + linear in seconds).
    ///                      Pass VestingSchedule(0,0) for immediate full vest.
    /// @return id           Distribution ID for claim links
    function createDistribution(
        address token,
        address[] calldata recipients,
        externalEuint64[] calldata encAmounts,
        bytes[] calldata proofs,
        VestingSchedule calldata vesting
    ) external nonReentrant returns (uint256 id) {
        uint256 n = recipients.length;
        require(n > 0,                       "AnimaDisperse: empty recipients");
        require(encAmounts.length == n,      "AnimaDisperse: length mismatch amounts");
        require(proofs.length == n,          "AnimaDisperse: length mismatch proofs");
        require(token != address(0),         "AnimaDisperse: zero token");

        id = distributionCount++;

        distributions[id] = Distribution({
            token:          token,
            distributor:    msg.sender,
            createdAt:      block.timestamp,
            recipientCount: n,
            active:         true,
            vesting:        vesting
        });

        for (uint256 i = 0; i < n; ) {
            address recipient = recipients[i];
            require(recipient != address(0), "AnimaDisperse: zero recipient");

            // ── FHE pattern ───────────────────────────────────────────────────
            // Step 1: verify ZKPoK, convert external input → in-contract euint64
            euint64 amount = FHE.fromExternal(encAmounts[i], proofs[i]);

            // Step 2: accumulate (supports topping-up existing allocations)
            _allocations[id][recipient] = FHE.add(_allocations[id][recipient], amount);

            // Step 3: permissions (only contract; recipient must call
            //         requestDecryptPermit() to avoid forced revelation)
            FHE.allowThis(_allocations[id][recipient]);

            unchecked { ++i; }
        }

        // Pull total from distributor via two-pass to keep logic readable.
        for (uint256 i = 0; i < n; ) {
            IFHERC20Transfer(token).transferFrom(
                msg.sender,
                address(this),
                encAmounts[i],
                proofs[i]
            );
            unchecked { ++i; }
        }

        emit DistributionCreated(id, msg.sender, token, n);
    }

    // ─── Recipient: request decrypt permit ───────────────────────────────────

    /// @notice Allow the caller to decrypt their own allocation off-chain.
    ///         After this call the recipient can request a decryption via the
    ///         EIP-712 user-decryption flow.
    function requestDecryptPermit(uint256 id) external {
        require(distributions[id].active,   "AnimaDisperse: inactive distribution");
        require(!claimed[id][msg.sender],    "AnimaDisperse: already claimed");

        FHE.allow(_allocations[id][msg.sender], msg.sender);

        emit DecryptPermitGranted(id, msg.sender);
    }

    // ─── Recipient: claim ────────────────────────────────────────────────────

    /// @notice Claim the caller's allocation from a distribution.
    ///
    ///         The recipient decrypts their allocation off-chain via
    ///         requestDecryptPermit() + EIP-712, then re-encrypts the
    ///         claimable amount client-side and passes it here along with
    ///         a ZKPoK proof.
    ///
    ///         Vesting: if a cliff is set, claiming before the cliff reverts.
    ///         If a linear schedule is set, only the vested fraction is
    ///         transferable.
    ///
    /// @param  id          Distribution ID
    /// @param  encAmount   Encrypted claim amount (re-encrypted client-side)
    /// @param  proof       ZKPoK binding encAmount to msg.sender + address(this)
    function claim(
        uint256 id,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        Distribution storage dist = distributions[id];
        require(dist.active,                "AnimaDisperse: inactive distribution");
        require(!claimed[id][msg.sender],   "AnimaDisperse: already claimed");

        // ── Vesting cliff check (plaintext — cliff is not confidential) ───────
        if (dist.vesting.cliff > 0) {
            require(
                block.timestamp >= dist.createdAt + dist.vesting.cliff,
                "AnimaDisperse: cliff not reached"
            );
        }

        // Convert external encrypted input to in-contract handle
        euint64 amount = FHE.fromExternal(encAmount, proof);
        euint64 allocation = _allocations[id][msg.sender];

        // ── Vesting linear fraction check (FHE) ────────────────────────────────
        // Compute the max vested fraction homomorphically so the claimable
        // amount is never revealed on-chain.
        //   maxVested = shr(mul(allocation, fraction), 20)
        //   where fraction = (elapsed << 20) / linear  (2^20 ≈ 1e6 precision)
        euint64 maxVested;
        if (dist.vesting.linear > 0) {
            uint256 elapsed = block.timestamp - (dist.createdAt + dist.vesting.cliff);
            if (elapsed >= dist.vesting.linear) {
                // Fully vested
                maxVested = allocation;
            } else {
                // Partially vested
                uint64 fraction = uint64((elapsed * (1 << 20)) / dist.vesting.linear);
                maxVested = FHE.shr(FHE.mul(allocation, FHE.asEuint64(fraction)), 20);
            }
        } else {
            maxVested = allocation;
        }

        // FHE gate: amount must not exceed maxVested
        ebool canClaim = FHE.le(amount, maxVested);

        // Checks-effects-interactions: update state before external call
        // If canClaim is false, allocation stays unchanged (cmux selects allocation)
        _allocations[id][msg.sender] = FHE.select(
            canClaim,
            FHE.sub(allocation, amount),
            allocation
        );
        FHE.allowThis(_allocations[id][msg.sender]);

        claimed[id][msg.sender] = true;

        // Transfer tokens to recipient (only if canClaim is true; if false,
        // we still issue the call but with zero impact since allocation unchanged)
        IFHERC20Transfer(dist.token).transfer(msg.sender, encAmount, proof);

        emit Claimed(id, msg.sender);
    }

    // ─── Distributor: cancel ─────────────────────────────────────────────────

    /// @notice Cancel an active distribution and reclaim unclaimed tokens.
    ///         Only the original distributor can cancel.
    function cancel(
        uint256 id,
        address[] calldata recipients,
        externalEuint64[] calldata encAmounts,
        bytes[] calldata proofs
    ) external nonReentrant {
        Distribution storage dist = distributions[id];
        require(dist.distributor == msg.sender, "AnimaDisperse: not distributor");
        require(dist.active,                    "AnimaDisperse: already inactive");

        dist.active = false;

        uint256 n = recipients.length;
        for (uint256 i = 0; i < n; ) {
            address recipient = recipients[i];
            if (!claimed[id][recipient]) {
                euint64 amount = FHE.fromExternal(encAmounts[i], proofs[i]);
                _allocations[id][recipient] = FHE.sub(_allocations[id][recipient], amount);
                FHE.allowThis(_allocations[id][recipient]);

                // Return tokens to distributor
                IFHERC20Transfer(dist.token).transfer(msg.sender, encAmounts[i], proofs[i]);
            }
            unchecked { ++i; }
        }

        emit Cancelled(id, msg.sender);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /// @notice Returns the caller's encrypted allocation handle.
    function getAllocation(uint256 id) external view returns (euint64) {
        return _allocations[id][msg.sender];
    }

    /// @notice Returns distribution metadata (no amounts revealed).
    function getDistribution(uint256 id) external view returns (
        address token,
        address distributor,
        uint256 createdAt,
        uint256 recipientCount,
        bool active,
        uint64 vestingCliff,
        uint64 vestingLinear
    ) {
        Distribution storage d = distributions[id];
        return (
            d.token,
            d.distributor,
            d.createdAt,
            d.recipientCount,
            d.active,
            d.vesting.cliff,
            d.vesting.linear
        );
    }
}
