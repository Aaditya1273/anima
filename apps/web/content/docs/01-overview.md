---
slug: overview
title: Overview
description: What Anima is and how confidential finance works on Ethereum Sepolia using Zama FHE.
group: Getting Started
order: 1
kicker: CH01
source: README.md
---

Anima is a programmable confidential finance platform on Ethereum Sepolia. It uses **Fully Homomorphic Encryption (FHE)** to keep balances, transfer amounts, and distribution allocations encrypted on-chain — the blockchain sees the transaction, but never the value.

## Why confidential finance?

Public blockchains expose everything. Every salary, every investor distribution, every treasury movement is visible to competitors, bots, and regulators simultaneously. This is why institutions won't put payroll or treasury on-chain — not because the technology is wrong, but because **complete transparency is a dealbreaker for business**.

Anima solves this with **Zama FHEVM**. Balances are stored as `euint64` handles — encrypted values that the contract can _compute over_ without ever decrypting.

## Three contracts, three tracks

| Contract | Track | Purpose |
|---|---|---|
| `AnimaPayroll` | Builder | Confidential payroll vault with employee/CFO/auditor roles and selective FHE.allow disclosure |
| `AnimaRegistryRouter` | Bounty | Thin router over the official Zama Wrappers Registry — reads pairs live without duplicating state |
| `AnimaDisperse` | Special Bounty × TokenOps | Confidential distribution engine with encrypted per-recipient allocations and vesting |

All three are deployed on Sepolia (chainId 11155111) and verified on Etherscan.

## Key concepts

**FHE pattern** — every state-changing function follows the same four steps:

1. Accept encrypted input + ZKPoK proof
2. Verify proof via `FHE.fromExternal(encAmount, proof)` → `euint64`
3. Operate homomorphically (`FHE.add`, `FHE.sub`, `FHE.lte`, `FHE.select`)
4. Grant permissions (`FHE.allowThis` + `FHE.allow`)

**Client-side encryption** — amounts are encrypted in the browser via `@zama-fhe/react-sdk`. No plaintext touches the server.

**EIP-712 decryption** — users decrypt their own balances by signing a typed data message in their wallet. The SDK calls Zama's relayer to perform the actual decryption.
