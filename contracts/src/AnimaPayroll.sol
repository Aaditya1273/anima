// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title  AnimaPayroll
/// @notice Confidential payroll vault with programmable compliance.
///
///         Three roles:
///           • CFO / employer  — records salary, grants observer addresses
///           • Employee        — sees and withdraws their own balance
///           • Observer        — auditor or regulator, granted selective
///                               FHE.allow on specific employee balances
///
///         Token custody: AnimaPayroll is a compliance / record-keeping layer.
///         It records encrypted salary allocations using FHE but does NOT hold
///         or transfer tokens. The actual FHERC20 token movement happens via
///         the Zama SDK (shield / confidentialTransfer) directly.
///
///         FHE-gated operations use the FHE.select cmux pattern to
///         conditionally update encrypted balances without decrypting.
///         This is the standard fhevm/solidity approach (FHE does not
///         support branching on ebool).
///
///         Every state-mutating function that touches an encrypted value calls:
///           FHE.allowThis(value)         — so THIS contract can reuse it
///           FHE.allow(value, recipient)  — so recipient can decrypt off-chain
///
/// @dev    Submitted to the Zama Developer Program Season 3 — Builder Track.
///         Inherits ZamaEthereumConfig to wire the Sepolia FHEVM gateway.
contract AnimaPayroll is ZamaEthereumConfig, ReentrancyGuard {

    // ─── Events ──────────────────────────────────────────────────────────────

    /// @notice Emitted whenever a salary payment is recorded (amount stays private)
    event SalaryPaid(address indexed payer, address indexed employee, address indexed token);

    /// @notice Emitted when an employee withdraws (amount stays private)
    event Withdrawal(address indexed employee, address indexed token);

    /// @notice Emitted when salary is moved into yield sub-account
    event YieldDeposited(address indexed employee, address indexed morphoVault);

    /// @notice Emitted when yield position is unwound back to balance
    event YieldWithdrawn(address indexed employee, address indexed morphoVault);

    /// @notice Emitted when an observer address is granted or revoked
    event ObserverUpdated(address indexed granter, address indexed observer, bool granted);

    // ─── Storage ─────────────────────────────────────────────────────────────

    /// token → employee → encrypted salary allocation record
    mapping(address token => mapping(address employee => euint64 balance)) private _balances;

    /// token → employee → encrypted yield balance (tracked internally)
    mapping(address token => mapping(address employee => euint64 yieldBalance)) private _yieldBalances;

    /// employer-level observers (auditors / regulators)
    /// granter → observer → active
    mapping(address granter => mapping(address observer => bool active)) private _observers;

    /// granter → list of active observer addresses (for iteration)
    mapping(address granter => address[]) private _observerList;

    // ─── CFO / employer operations ───────────────────────────────────────────

    /// @notice Grant or revoke an observer address selective FHE.allow access.
    function grantObserver(address observer, bool granted) external {
        if (granted && !_observers[msg.sender][observer]) {
            _observers[msg.sender][observer] = true;
            _observerList[msg.sender].push(observer);
        } else if (!granted) {
            _observers[msg.sender][observer] = false;
        }
        emit ObserverUpdated(msg.sender, observer, granted);
    }

    /// @notice Record a salary payment for compliance / auditability.
    ///
    ///         This function does NOT transfer tokens. The CFO must separately
    ///         transfer FHERC20 tokens to the employee via the Zama SDK.
    ///         This records the encrypted amount so the employee can verify
    ///         their salary and auditors can inspect via EIP-712 decrypt.
    function paySalary(
        address token,
        address employee,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);
        _balances[token][employee] = FHE.add(_balances[token][employee], amount);

        FHE.allowThis(_balances[token][employee]);
        FHE.allow(_balances[token][employee], employee);
        _grantObservers(token, employee, msg.sender);

        emit SalaryPaid(msg.sender, employee, token);
    }

    // ─── Employee operations ─────────────────────────────────────────────────

    /// @notice Record a withdrawal from the employee's encrypted balance.
    ///         FHE-gated via FHE.select cmux: if amount > balance, balance
    ///         stays unchanged. No tokenn transfer — the FHE guard only
    ///         protects the internal accounting records.
    function withdraw(
        address token,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);
        ebool canWithdraw = FHE.le(amount, _balances[token][msg.sender]);

        // FHE-guarded: only deduct if amount <= balance
        _balances[token][msg.sender] = FHE.select(
            canWithdraw,
            FHE.sub(_balances[token][msg.sender], amount),
            _balances[token][msg.sender]
        );

        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        emit Withdrawal(msg.sender, token);
    }

    /// @notice Move shielded salary into an internal yield tracking sub-account.
    ///         This is an internal FHE accounting split between _balances and
    ///         _yieldBalances. No external vault is called — the Morpho vault
    ///         integration is a future milestone pending the release of a live
    ///         confidential yield vault that accepts ERC-7984 handles.
    ///         FHE-gated: only deducts from balance if amount <= balance.
    function earnYield(
        address token,
        address morphoVault,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);
        ebool canDeposit = FHE.le(amount, _balances[token][msg.sender]);

        // FHE-guarded: only move from balance to yield if sufficient balance
        _balances[token][msg.sender] = FHE.select(
            canDeposit,
            FHE.sub(_balances[token][msg.sender], amount),
            _balances[token][msg.sender]
        );
        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        _yieldBalances[token][msg.sender] = FHE.select(
            canDeposit,
            FHE.add(_yieldBalances[token][msg.sender], amount),
            _yieldBalances[token][msg.sender]
        );
        FHE.allowThis(_yieldBalances[token][msg.sender]);
        FHE.allow(_yieldBalances[token][msg.sender], msg.sender);

        emit YieldDeposited(msg.sender, morphoVault);
    }

    /// @notice Unwind an internal yield tracking position back to the main balance.
    ///         Only transfers FHE accounting between internal storage mappings.
    ///         No external vault interaction occurs.
    function withdrawYield(
        address token,
        address morphoVault,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);
        ebool canWithdraw = FHE.le(amount, _yieldBalances[token][msg.sender]);

        _yieldBalances[token][msg.sender] = FHE.select(
            canWithdraw,
            FHE.sub(_yieldBalances[token][msg.sender], amount),
            _yieldBalances[token][msg.sender]
        );
        FHE.allowThis(_yieldBalances[token][msg.sender]);
        FHE.allow(_yieldBalances[token][msg.sender], msg.sender);

        _balances[token][msg.sender] = FHE.select(
            canWithdraw,
            FHE.add(_balances[token][msg.sender], amount),
            _balances[token][msg.sender]
        );
        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        emit YieldWithdrawn(msg.sender, morphoVault);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /// @notice Returns the caller's encrypted balance handle.
    function getBalance(address token) external view returns (euint64) {
        return _balances[token][msg.sender];
    }

    /// @notice Returns the caller's encrypted yield balance handle.
    function getYieldBalance(address token) external view returns (euint64) {
        return _yieldBalances[token][msg.sender];
    }

    /// @notice Returns true if observer is active for granter.
    function isObserver(address granter, address observer) external view returns (bool) {
        return _observers[granter][observer];
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    /// @dev Grant FHE.allow to all active observers registered by `granter`.
    function _grantObservers(address token, address employee, address granter) internal {
        address[] storage list = _observerList[granter];
        uint256 len = list.length;
        for (uint256 i = 0; i < len; ) {
            address obs = list[i];
            if (_observers[granter][obs]) {
                FHE.allow(_balances[token][employee], obs);
            }
            unchecked { ++i; }
        }
    }
}
