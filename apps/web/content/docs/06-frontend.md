---
slug: frontend
title: Frontend Guide
description: How the Next.js 15 frontend connects to the contracts — wagmi, Zama SDK, SIWE auth, and TokenOps integration.
group: Architecture
order: 6
kicker: CH06
source: apps/web/
---

The Anima frontend is a Next.js 15 app served at port 3210. It connects to three Sepolia contracts through wagmi + RainbowKit, performs client-side FHE encryption via `@zama-fhe/react-sdk`, and offers a TokenOps-powered confidential distribution flow.

## Tech stack

| Layer | Library | Purpose |
|---|---|---|
| Framework | Next.js 15 (Turbopack) | SSR/ISR, routing, API routes |
| Wallet | RainbowKit + wagmi v2 | Wallet connection, contract reads/writes |
| FHE | `@zama-fhe/react-sdk` + `@zama-fhe/sdk` | Client-side encrypt/decrypt, `useConfidentialBalance`, `useShield` |
| Distribution | `@tokenops/sdk` | `createConfidentialAirdrop`, vesting, on-chain proofs |
| Auth | iron-session + SIWE (EIP-4361) | Session-based authentication |

## Key pages

| Route | Features |
|---|---|
| `/` | Landing page with hero + section animations |
| `/payroll` | Role switcher (employee/CFO/auditor), balance decrypt, pay salary, withdraw, grant observer |
| `/payroll/earn` | Yield sub-account deposit/withdraw (internal FHE accounting) |
| `/payroll/views` | Dedicated role dashboards |
| `/registry` | Pair table from official Zama registry, wrap/unwrap, faucet |
| `/disperse` | Create confidential distribution, CSV import, risk calculator, vesting |
| `/console` | Operator dashboard with on-chain metrics |
| `/docs` | Documentation |

## API routes

| Route | Purpose |
|---|---|
| `/api/auth/nonce` | Generate SIWE nonce |
| `/api/auth/verify` | Verify SIWE signature, create session |
| `/api/auth/me` | Get current session |
| `/api/auth/logout` | Clear session |
| `/api/relayer/[chainId]` | Proxy Zama relayer requests (API key server-side) |

## Environment variables

Copy `apps/web/.env.local.example` to `apps/web/.env.local` and set:

- `NEXT_PUBLIC_RPC_URL` — Sepolia RPC endpoint
- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect Cloud project ID
- `ZAMA_API_KEY` — Zama API key (stays server-side)
- `SESSION_SECRET` — iron-session secret (min 32 chars)
- `TOKENOPS_API_KEY` — TokenOps API key
