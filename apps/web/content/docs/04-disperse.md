---
slug: disperse
title: Confidential Distribution
description: Encrypted airdrops, per-recipient allocations, MEV risk calculator, and vesting curves.
group: Contracts
order: 4
kicker: CH04
source: contracts/src/AnimaDisperse.sol
---

AnimaDisperse is a confidential distribution engine — airdrops and payroll distributions where per-recipient allocations are encrypted on-chain.

## Why encrypted distributions?

Public airdrops expose amounts to MEV bots. Average price drawdown: **~17% within 72 hours**. Anima keeps every allocation encrypted — the recipient list is public (who gets tokens), but individual amounts are `euint64` handles visible only to the intended recipient.

## How it works

### Create a distribution

1. The distributor imports recipients via CSV or manual entry
2. The **Signaling-Risk Calculator** shows estimated MEV front-run cost before deploying
3. Each amount is encrypted client-side via `@zama-fhe/react-sdk`
4. `createDistribution()` stores each encrypted allocation — the recipient list is never revealed on-chain
5. Optional vesting: cliff + linear schedule, all encrypted

### Claim (recipient)

1. Visit `/disperse/[distId]` and connect wallet
2. Call `requestDecryptPermit(distId)` to get `FHE.allow` on your allocation
3. Sign one EIP-712 — only your amount decrypts, in your browser only
4. Call `claim()` to record the claim

### Vesting

Vesting schedules are stored encrypted. The contract computes the vested fraction homomorphically:

- **Cliff**: seconds before any claim is allowed (plaintext check)
- **Linear**: seconds over which the full allocation vests linearly after the cliff
- The max vested amount is computed via `FHE.shr(FHE.mul(allocation, fraction), 20)` — never decrypted on-chain

### Cancel (distributor only)

The original distributor can cancel an active distribution and reclaim unclaimed tokens by providing the encrypted amounts + proofs for each unclaimed recipient.

## Contract

Deployed at `0x43195F579aE215d5A90A2811A379B6535f51C599` on Sepolia. View on [Etherscan](https://sepolia.etherscan.io/address/0x43195F579aE215d5A90A2811A379B6535f51C599).
