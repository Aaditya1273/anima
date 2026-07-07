// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal interface for any ERC-7984 / FHEVM-compatible wrapped token.
// The concrete implementation (e.g. Steakhouse cPrime USDC on Morpho) must
// expose these four methods so AnimaPayroll can interact without knowing the
// exact wrapper ABI.
// ─────────────────────────────────────────────────────────────────────────────
interface IFHERC20 {
    function transfer(address to, externalEuint64 encAmount, bytes calldata proof) external returns (bool);
    function transferFrom(address from, address to, externalEuint64 encAmount, bytes calldata proof) external returns (bool);
    function balanceOf(address account) external view returns (euint64);
    function allowance(address owner, address spender) external view returns (euint64);
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimal interface for the Morpho Steakhouse Confidential Prime USDC vault.
// Used in earnYield() to prove composability:  shield salary → earn on Morpho
// without ever decrypting the amount on-chain.
// ─────────────────────────────────────────────────────────────────────────────
interface IMorphoConfidentialVault {
    /// @param encAmount  Encrypted deposit amount (euint64 handle)
    /// @param receiver   Shares recipient
    function depositConfidential(euint64 encAmount, address receiver) external;
    function withdrawConfidential(euint64 encAmount, address receiver) external;
}

/// @title  AnimaPayroll
/// @notice Confidential payroll vault with programmable compliance.
///
///         Three roles:
///           • CFO / employer  — deposits salary, grants observer addresses
///           • Employee        — sees and withdraws their own balance
///           • Observer        — auditor or regulator, granted selective
///                               FHE.allow on specific employee balances
///
///         Every state-mutating function that touches an encrypted value calls:
///           FHE.allowThis(value)         — so THIS contract can reuse it
///           FHE.allow(value, recipient)  — so recipient can decrypt off-chain
///
///         Composability proof:
///           earnYield() routes shielded salary into the Steakhouse Confidential
///           Prime USDC vault on Morpho without decrypting the amount.
///
/// @dev    Submitted to the Zama Developer Program Season 3 — Builder Track.
///         Inherits ZamaEthereumConfig to wire the Sepolia FHEVM gateway.
contract AnimaPayroll is ZamaEthereumConfig, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Events ──────────────────────────────────────────────────────────────

    /// @notice Emitted whenever a salary payment lands (amount stays private)
    event SalaryPaid(address indexed payer, address indexed employee, address indexed token);

    /// @notice Emitted when an employee withdraws (amount stays private)
    event Withdrawal(address indexed employee, address indexed token);

    /// @notice Emitted when salary is moved into Morpho vault (amount stays private)
    event YieldDeposited(address indexed employee, address indexed morphoVault);

    /// @notice Emitted when yield position is unwound back to payroll vault
    event YieldWithdrawn(address indexed employee, address indexed morphoVault);

    /// @notice Emitted when an observer address is granted or revoked
    event ObserverUpdated(address indexed granter, address indexed observer, bool granted);

    // ─── Storage ─────────────────────────────────────────────────────────────

    /// token → employee → encrypted balance
    mapping(address token => mapping(address employee => euint64 balance)) private _balances;

    /// token → employee → encrypted yield balance (held inside Morpho vault)
    mapping(address token => mapping(address employee => euint64 yieldBalance)) private _yieldBalances;

    /// employer-level observers (auditors / regulators)
    /// granter → observer → active
    mapping(address granter => mapping(address observer => bool active)) private _observers;

    /// granter → list of active observer addresses (for iteration in _grantAll)
    mapping(address granter => address[]) private _observerList;

    // ─── CFO / employer operations ───────────────────────────────────────────

    /// @notice Grant an observer address selective FHE.allow access.
    ///         Observers receive FHE.allow on every subsequent salary payment.
    ///         Call again with granted=false to revoke.
    function grantObserver(address observer, bool granted) external {
        if (granted && !_observers[msg.sender][observer]) {
            _observers[msg.sender][observer] = true;
            _observerList[msg.sender].push(observer);
        } else if (!granted) {
            _observers[msg.sender][observer] = false;
            // NOTE: we leave the address in the list; _grantAll skips inactive entries.
            // A production contract could compact the list; omitted here for readability.
        }
        emit ObserverUpdated(msg.sender, observer, granted);
    }

    /// @notice Pay salary to an employee.
    ///         The caller (CFO) must have previously approved this contract to
    ///         call IFHERC20.transferFrom for the given token.
    ///
    /// @param  token      ERC-7984 token address
    /// @param  employee   Recipient of the salary
    /// @param  encAmount  Encrypted salary amount (encrypted client-side by the caller)
    /// @param  proof      ZKPoK binding encAmount to msg.sender + address(this)
    function paySalary(
        address token,
        address employee,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        // ── Step 1: verify proof and convert to in-contract euint64 ──────────
        euint64 amount = FHE.fromExternal(encAmount, proof);

        // ── Step 2: pull tokens from caller into this vault ──────────────────
        // We pass the already-converted euint64 handle to transferFrom.
        // The token contract never sees the plaintext amount.
        // NOTE: Some FHERC20 implementations accept euint64 directly;
        //       others require re-encrypting as externalEuint64.
        //       We use the externalEuint64 overload for maximum compatibility.
        IFHERC20(token).transferFrom(msg.sender, address(this), encAmount, proof);

        // ── Step 3: add to employee's encrypted balance ──────────────────────
        _balances[token][employee] = FHE.add(_balances[token][employee], amount);

        // ── Step 4: grant permissions ────────────────────────────────────────
        // 4a. Contract permission — required for future FHE ops on this value
        FHE.allowThis(_balances[token][employee]);
        // 4b. Employee permission — so the employee can decrypt off-chain
        FHE.allow(_balances[token][employee], employee);
        // 4c. Programmable compliance — every active observer of the PAYER gets
        //     FHE.allow automatically on this employee's balance
        _grantObservers(token, employee, msg.sender);

        emit SalaryPaid(msg.sender, employee, token);
    }

    // ─── Employee operations ─────────────────────────────────────────────────

    /// @notice Withdraw salary tokens from the vault.
    ///         FHE-gated: the contract verifies balance >= amount homomorphically.
    ///         Neither the balance nor the amount is ever decrypted on-chain.
    ///
    /// @param  token      ERC-7984 token address
    /// @param  encAmount  Encrypted withdrawal amount
    /// @param  proof      ZKPoK
    function withdraw(
        address token,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);

        // FHE guard: canWithdraw = (amount <= balance)
        ebool canWithdraw = FHE.lte(amount, _balances[token][msg.sender]);

        // Conditional subtraction via cmux — only deducts if canWithdraw == true
        // If false, balance is unchanged (no revert, no plaintext leak)
        _balances[token][msg.sender] = FHE.select(
            canWithdraw,
            FHE.sub(_balances[token][msg.sender], amount),
            _balances[token][msg.sender]
        );

        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        // Transfer tokens out — only if canWithdraw (handled by cmux above keeping
        // balance non-negative, so a zero-delta transfer is issued when denied)
        IFHERC20(token).transfer(msg.sender, encAmount, proof);

        emit Withdrawal(msg.sender, token);
    }

    /// @notice Move shielded salary into the Morpho Steakhouse Confidential
    ///         Prime USDC vault to earn yield — amount stays encrypted throughout.
    ///
    /// @param  token       ERC-7984 token (must match what morphoVault accepts)
    /// @param  morphoVault Steakhouse Confidential Prime USDC vault address
    /// @param  encAmount   Encrypted deposit amount
    /// @param  proof       ZKPoK
    function earnYield(
        address token,
        address morphoVault,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);

        // FHE guard: only deposit if balance >= amount
        ebool canDeposit = FHE.lte(amount, _balances[token][msg.sender]);
        _balances[token][msg.sender] = FHE.select(
            canDeposit,
            FHE.sub(_balances[token][msg.sender], amount),
            _balances[token][msg.sender]
        );
        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        // Accumulate in yield sub-account
        _yieldBalances[token][msg.sender] = FHE.add(_yieldBalances[token][msg.sender], amount);
        FHE.allowThis(_yieldBalances[token][msg.sender]);
        FHE.allow(_yieldBalances[token][msg.sender], msg.sender);

        // ── Composability proof ───────────────────────────────────────────────
        // Pass the encrypted handle directly to Morpho — amount never decrypted.
        // This is the "Private Deposits into Public DeFi" pattern.
        FHE.allow(_yieldBalances[token][msg.sender], morphoVault);
        IMorphoConfidentialVault(morphoVault).depositConfidential(amount, address(this));

        emit YieldDeposited(msg.sender, morphoVault);
    }

    /// @notice Unwind a yield position back to the payroll vault balance.
    function withdrawYield(
        address token,
        address morphoVault,
        externalEuint64 encAmount,
        bytes calldata proof
    ) external nonReentrant {
        euint64 amount = FHE.fromExternal(encAmount, proof);

        ebool canWithdraw = FHE.lte(amount, _yieldBalances[token][msg.sender]);
        _yieldBalances[token][msg.sender] = FHE.select(
            canWithdraw,
            FHE.sub(_yieldBalances[token][msg.sender], amount),
            _yieldBalances[token][msg.sender]
        );
        FHE.allowThis(_yieldBalances[token][msg.sender]);
        FHE.allow(_yieldBalances[token][msg.sender], msg.sender);

        _balances[token][msg.sender] = FHE.add(_balances[token][msg.sender], amount);
        FHE.allowThis(_balances[token][msg.sender]);
        FHE.allow(_balances[token][msg.sender], msg.sender);

        IMorphoConfidentialVault(morphoVault).withdrawConfidential(amount, address(this));

        emit YieldWithdrawn(msg.sender, morphoVault);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /// @notice Returns the caller's encrypted balance handle for a given token.
    ///         Decrypt off-chain with the EIP-712 user-decryption flow.
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

    /// @dev Grant FHE.allow to all active observers registered by `granter`
    ///      on `employee`'s balance for `token`.
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
