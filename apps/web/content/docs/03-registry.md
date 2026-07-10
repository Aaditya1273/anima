---
slug: registry
title: Wrapper Registry
description: Reading official Zama ERC-20 ↔ ERC-7984 pairs, wrapping, unwrapping, and the cTokenMock faucet.
group: Contracts
order: 3
kicker: CH03
source: contracts/src/AnimaRegistryRouter.sol
---

AnimaRegistryRouter is a thin router that surfaces the official Zama Wrappers Registry on Sepolia. It does **not** duplicate registry state — every pair lookup delegates to the canonical Zama contract.

## Design philosophy

The Zama Bounty Track brief asks for a contract that "surfaces every ERC-20 ↔ ERC-7984 wrapper pair from the official Zama Wrappers Registry." Writing your own registry would fragment the ecosystem — the router reads the canonical source.

`officialPairCount()` returns the same value as `cast call <ZAMA_REGISTRY> "pairCount()(uint256)"`.

## Functions

### `officialPairCount()` — returns the number of official pairs

Mirrors the Zama Wrappers Registry directly. No off-by-one, no stale cache.

### `getPair(id)` — returns pair metadata

Returns `(erc20, erc7984, name, symbol, decimals)` for a given pair ID.

### `wrap(pairId, erc20Amount)` — prepare a wrap

Pulls ERC-20 from the caller and approves the official ERC-7984 wrapper. The caller then calls `wrapper.wrap(encAmount, proof)` directly (FHE proofs are contract-bound and cannot be forwarded).

### `unwrap(pairId, erc20Amount)` — prepare an unwrap

Approves the wrapper to spend the caller's ERC-7984 tokens. The caller then calls `wrapper.unwrap(encAmount, proof)` directly.

### `faucet(token, amount)` — mint cTokenMocks

Mints official Sepolia cTokenMocks for testing. Max 10,000 tokens per call.

## EIP-712 decryption

Every ERC-7984 wrapper's `mint` and `transfer` functions already call `FHE.allow(handle, recipient)`, so decryption works out of the box via the EIP-712 user-decryption flow. No extra on-chain call needed.

## Contract

Deployed at `0xE39423560aD4c6ab59A71d38cB16FcE18afecA84` on Sepolia. View on [Etherscan](https://sepolia.etherscan.io/address/0xE39423560aD4c6ab59A71d38cB16FcE18afecA84).
