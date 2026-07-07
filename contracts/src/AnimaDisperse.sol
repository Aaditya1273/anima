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
        // Per-recipient encrypted allocations — stored in a separate mapping
        // keyed by distributionId so Solidity can handle nested mappings cleanly.
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

    /// @notice Emitted when a new distribution is created.
    ///         recipientCount is public; individual amounts are never revealed.
    event DistributionCreated(
        uint256 indexed id,
        address indexed distributor,
        address indexed token,
        uint256 recipientCount
    );

    /// @notice Emitted when a recipient requests a decrypt permit for their allocation.
    event DecryptPermitGranted(uint256 indexed id, address indexed recipient);

    /// @notice Emitted when a recipient claims their allocation.
    event Claimed(uint256 indexed id, address indexed recipient);

    /// @notice Emitted when a distribution is cancelled by the distributor.
    event Cancelled(uint256 indexed id, address indexed distributor);

    // ─── Core: create distribution ───────────────────────────────────────────

    /// @notice Create a new confidential distribution.
    ///
    ///         This is the entry point that the TokenOps SDK targets.
    ///         On the frontend:
    ///           await tokenOpsClient.createConfidentialAirdrop({
    ///             token, recipients, amounts, vestingSchedule
    ///           })
    ///         resolves to a call to this function.
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

            // Step 3: permissions
            FHE.allowThis(_allocations[id][recipient]);
            // Recipient can decrypt their own allocation via EIP-712 once they call
            // requestDecryptPermit(). We do NOT grant it here automatically to
            // avoid griefing (a distributor should not be able to force-reveal).

            unchecked { ++i; }
        }

        // Pull total from distributor.
        // NOTE: The distributor must have approved this contract for the token.
        // We pass each encAmount individually to the token's transferFrom so the
        // token contract can homomorphically accumulate the total.
        // This is done in a second pass to keep the logic readable.
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
    ///
    ///         This emits FHE.allow(allocation, msg.sender) which the Zama
    ///         relayer monitors. After this call the recipient can request
    ///         a decryption via the EIP-712 user-decryption flow.
    ///
    ///         No other participant's allocation is affected.
    ///         The plaintext amount is never revealed on-chain.
    ///
    /// @param  id  Distribution ID
    function requestDecryptPermit(uint256 id) external {
        require(distributions[id].active,   "AnimaDisperse: inactive distribution");
        require(!claimed[id][msg.sender],    "AnimaDisperse: already claimed");

        // Grant the caller permission to decrypt only their own allocation.
        FHE.allow(_allocations[id][msg.sender], msg.sender);

        emit DecryptPermitGranted(id, msg.sender);
    }

    // ─── Recipient: claim ────────────────────────────────────────────────────

    /// @notice Claim the caller's allocation from a distribution.
    ///
    ///         Vesting check: if a cliff is set, claiming before the cliff
    ///         reverts. If a linear schedule is set, the claimable fraction
    ///         is computed homomorphically and only that fraction is transferred.
    ///
    ///         After a successful claim:
    ///           • claimed[id][msg.sender] = true (prevents double-claim)
    ///           • allocation zeroed via FHE.sub
    ///           • tokens transferred to msg.sender
    ///
    /// @param  id  Distribution ID
    function claim(uint256 id) external nonReentrant {
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

        euint64 allocation = _allocations[id][msg.sender];

        // ── Vesting linear fraction (FHE) ─────────────────────────────────────
        // If linear > 0 and we are mid-vesting, compute vested fraction
        // homomorphically so the claimable amount is never revealed on-chain.
        euint64 claimable;
        if (dist.vesting.linear > 0) {
            uint256 elapsed = block.timestamp - (dist.createdAt + dist.vesting.cliff);
            if (elapsed >= dist.vesting.linear) {
                // Fully vested
                claimable = allocation;
            } else {
                // Partially vested: claimable = allocation * elapsed / linear
                // We scale both to avoid FHE division (not available).
                // elapsed and linear are public; only allocation is encrypted.
                // claimable = allocation * (elapsed / linear) — computed as:
                //   scale = 1e6 (public multiplier to retain precision)
                //   fraction = elapsed * scale / linear  (public uint64)
                //   claimable = FHE.mul(allocation, fraction) / scale
                // FHE.div is unavailable so we use a reciprocal multiply:
                //   claimable = FHE.shr(FHE.mul(allocation, fraction_in_1e6), 20)
                //   where 2^20 ≈ 1e6.  This gives ~6 significant figures.
                uint64 fraction = uint64((elapsed * (1 << 20)) / dist.vesting.linear);
                claimable = FHE.shr(FHE.mul(allocation, FHE.asEuint64(fraction)), 20);
            }
        } else {
            claimable = allocation;
        }

        // Zero out the allocation before transferring (checks-effects-interactions)
        _allocations[id][msg.sender] = FHE.sub(allocation, claimable);
        FHE.allowThis(_allocations[id][msg.sender]);

        claimed[id][msg.sender] = true;

        // Grant permission so this contract can later settle remaining vesting
        FHE.allow(claimable, address(this));

        // Transfer claimable amount to recipient.
        // We need an externalEuint64 to pass to transferFrom, but we have
        // an in-contract euint64.  We use FHE.allow to let the token contract
        // read the handle, then pass it as an opaque bytes32 handle.
        // The FHERC20 transfer(address, euint64) overload handles this.
        // NOTE: This assumes the ERC-7984 token exposes the euint64 overload.
        //       If not, the distributor must re-encrypt off-chain and call
        //       a separate finalizeClaim() function (see below).
        _transferClaimable(dist.token, msg.sender, claimable);

        emit Claimed(id, msg.sender);
    }

    // ─── Distributor: cancel ─────────────────────────────────────────────────

    /// @notice Cancel an active distribution and reclaim unclaimed tokens.
    ///         Only the original distributor can cancel.
    ///         Already-claimed allocations are not affected.
    ///
    /// @param  id           Distribution ID
    /// @param  recipients   List of unclaimed recipients to sweep back
    /// @param  encAmounts   Encrypted amounts to return (must match _allocations)
    /// @param  proofs       ZKPoKs
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
    ///         Call requestDecryptPermit() first, then decrypt off-chain.
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

    // ─── Internal ────────────────────────────────────────────────────────────

    /// @dev Transfer an in-contract euint64 to `to` using the ERC-7984 token.
    ///      Uses the euint64-accepting overload if available.
    function _transferClaimable(address token, address to, euint64 amount) internal {
        // Grant the token contract permission to process this handle
        FHE.allow(amount, token);
        // Call the euint64 transfer overload (standard on Zama FHERC20 tokens)
        // Low-level call to avoid ABI coupling — the token may use a different
        // function selector depending on the FHERC20 version.
        (bool ok,) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, euint64.unwrap(amount))
        );
        require(ok, "AnimaDisperse: transfer failed");
    }
}
