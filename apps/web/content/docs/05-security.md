---
slug: security
title: Security Model
description: How Anima keeps data private — client-side encryption, ZKPoK binding, relayer proxy, and the no-backdoor compliance model.
group: Architecture
order: 5
kicker: CH05
source: contracts/src/
---

Anima's security model is built on three principles: **client-side encryption**, **ZKPoK binding**, and **programmable compliance without backdoors**.

## Client-side encryption

Plaintext amounts never leave the browser. `@zama-fhe/react-sdk` encrypts inputs using FHE artifacts cached in IndexedDB and sends only ciphertext + ZKPoK to the chain.

## ZKPoK binding

`FHE.fromExternal(encValue, proof)` verifies two things:
1. The ciphertext was encrypted by `msg.sender` — prevents replay from another account
2. The ciphertext is bound to `address(this)` — prevents cross-contract replay

Without both checks, an attacker could reuse a ciphertext from another user or another contract.

## Relayer proxy

`/api/relayer/[chainId]` forwards FHE relayer requests server-side. The Zama API key lives in `ZAMA_API_KEY` on the server — it never reaches the browser.

## Programmable compliance, not backdoors

Auditor access is granted explicitly via `grantObserver(address)` by the CFO. It uses the same `FHE.allow` mechanism as employee self-decryption — there is **no privileged key, no admin function, no secret path**. An auditor cannot decrypt anything they were not explicitly granted.

## SIWE sessions

`iron-session` + EIP-4361 SIWE authentication. Sessions use `httpOnly`, `sameSite: lax`, `secure` in production, with 7-day expiry.

## No admin keys, no upgrades

All Anima contracts are **non-upgradeable**. No owner function, no proxy, no emergency pause. The contracts deployed on Sepolia are the final code — no one can change them.

## FHE permission model

Every state-mutating function that touches an encrypted value calls **both**:

```solidity
FHE.allowThis(value)      // contract can reuse this value in future ops
FHE.allow(value, caller)   // caller can decrypt off-chain via EIP-712
```

Missing `FHE.allowThis` → the contract can never update the value again (silent regression). Missing `FHE.allow(value, caller)` → the caller cannot decrypt their own balance (silent permission denial).
