---
slug: payroll
title: Confidential Payroll
description: Using the AnimaPayroll vault — roles, salary payments, FHE-gated withdrawals, and auditor access.
group: Contracts
order: 2
kicker: CH02
source: contracts/src/AnimaPayroll.sol
---

AnimaPayroll is a confidential payroll vault with three roles and programmable compliance.

## Roles

**CFO / Employer** — records salary payments and grants observer (auditor) addresses. Sees encrypted aggregate only.

**Employee** — sees and withdraws their own encrypted balance. Only they can decrypt via EIP-712.

**Observer** — auditor or regulator, granted `FHE.allow` on specific employee balances by the CFO. Decrypts via EIP-712 on demand.

## How it works

### Pay salary (CFO)

1. The CFO shields public ERC-20 → cUSDC (the confidential ERC-7984 wrapper)
2. The CFO calls `paySalary(token, employee, encAmount, proof)` — the amount is encrypted client-side
3. The contract stores the encrypted amount via `FHE.add` to the employee's `_balances` mapping
4. `FHE.allow` is granted to the employee AND all active observers automatically

### Withdraw (employee)

1. The employee encrypts their withdrawal amount client-side
2. The contract verifies `balance >= amount` via `FHE.lte` — neither value is decrypted
3. If sufficient, `FHE.sub` deducts the amount via `FHE.select` cmux
4. The employee decrypts their new balance via EIP-712

### Grant observer access (CFO)

The CFO calls `grantObserver(auditor, true)`. All future salary payments automatically include `FHE.allow` for the observer. Observer access is `FHE.allow`-based — there is no privileged key or admin function.

## Composability: yield sub-account

Shielded salary can be moved into a separate yield tracking sub-account via `earnYield()` and `withdrawYield()`. This is internal FHE accounting — the balance stays encrypted throughout. A future upgrade could route these calls to an external yield vault that accepts ERC-7984 handle deposits.

## Contract

Deployed at `0x2B7b67a1470F382078c1A3f58d5004d94E7D9299` on Sepolia. View on [Etherscan](https://sepolia.etherscan.io/address/0x2B7b67a1470F382078c1A3f58d5004d94E7D9299).
