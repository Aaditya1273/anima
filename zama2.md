# Overview

**Welcome to the Zama SDK!**

{% hint style="info" %}
**Looking for the legacy Relayer SDK?**

This is the new default SDK for building on the Zama Protocol. The legacy `@zama-fhe/relayer-sdk` lives at [github.com/zama-ai/relayer-sdk](https://github.com/zama-ai/relayer-sdk).
{% endhint %}

## Where to go next

If you're new to the Zama Protocol, start with the [Litepaper](https://docs.zama.org/protocol/zama-protocol-litepaper) or the [Protocol Overview](https://docs.zama.org/protocol) to understand the foundations.

Otherwise:

🟨 Go to [**Quick start**](/protocol/sdk/getting-started/quick-start.md) to get from zero to a working confidential transfer in under 5 minutes.

🟨 Go to [**Build your first confidential dApp**](/protocol/sdk/getting-started/first-confidential-dapp.md) for an end-to-end React tutorial.

🟨 Go to [**Configuration**](/protocol/sdk/guides/configuration.md) for step-by-step instructions on shielding, transfers, balances, and more.

🟨 Go to [**SDK reference**](/protocol/sdk/api-references/sdk.md) for the full core SDK API.

🟨 Go to [**React reference**](/protocol/sdk/api-references/react.md) for all React hooks and components.

## Features

### Shield & unshield

Convert public ERC-20 tokens into encrypted form and back. The SDK handles approvals, encryption, and the two-step unshield flow.

### Confidential transfers

Encrypt amounts client-side before submitting on-chain. On-chain observers see the transaction but never the value.

### React hooks

TanStack Query-based hooks with cached decryption, automatic cache invalidation, and one-signature permit management.

## Two packages, one import

| Package                                                                     | Use when...                                                                   |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`@zama-fhe/sdk`](/protocol/sdk/api-references/sdk/zamasdk.md)              | You are building with vanilla TypeScript, Node.js, or any non-React framework |
| [`@zama-fhe/react-sdk`](/protocol/sdk/api-references/react/zamaprovider.md) | You are building a React app (hooks and React-specific providers)             |

If you are using React, install both packages: `@zama-fhe/react-sdk` provides the hooks and `ZamaProvider`, while `@zama-fhe/sdk` is a peer dependency that provides core utilities, relayer factories, chain presets, and error helpers. For wagmi apps, build the config with `createConfig` from `@zama-fhe/react-sdk/wagmi` and pass it to `<ZamaProvider config={zamaConfig}>`. For non-React apps, use `createConfig` from `@zama-fhe/sdk/viem` or `@zama-fhe/sdk/ethers`.

## Install

{% tabs %}
{% tab title="pnpm" %}

```sh
# React app
pnpm add @zama-fhe/react-sdk @zama-fhe/sdk @tanstack/react-query

# Vanilla TypeScript / Node.js
pnpm add @zama-fhe/sdk
```

{% endtab %}

{% tab title="npm" %}

```sh
# React app
npm install @zama-fhe/react-sdk @zama-fhe/sdk @tanstack/react-query

# Vanilla TypeScript / Node.js
npm install @zama-fhe/sdk
```

{% endtab %}

{% tab title="yarn" %}

```sh
# React app
yarn add @zama-fhe/react-sdk @zama-fhe/sdk @tanstack/react-query

# Vanilla TypeScript / Node.js
yarn add @zama-fhe/sdk
```

{% endtab %}
{% endtabs %}

## Your first confidential transfer in 30 seconds

```ts
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const publicClient = createPublicClient({ chain: sepolia, transport: http() });
const walletClient = createWalletClient({ chain: sepolia, transport: custom(window.ethereum!) });

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  relayers: { [mySepolia.id]: web() },
});

const sdk = new ZamaSDK(config);
const wrappedToken = sdk.createWrappedToken("0xYourWrappedToken");

await wrappedToken.shield(1000n); // deposit public tokens
const [address] = await walletClient.getAddresses();
const balance = await wrappedToken.balanceOf(address); // decrypt your balance
await wrappedToken.confidentialTransfer("0xRecipient", 500n); // private send
await wrappedToken.unshield(500n); // withdraw back to public
```

Ready to build? Jump to the [Quick start](/protocol/sdk/getting-started/quick-start.md) for a full working example with your stack.

## Help center

Ask technical questions, discuss with the community, or report a bug.

* [Community forum](https://community.zama.org/c/zama-protocol/15)
* [Discord channel](https://discord.com/invite/zama)
* [Open an issue](https://github.com/zama-ai/sdk/issues) on the SDK repository




# Quick start

{% hint style="info" %}
**Looking for the legacy Relayer SDK?**

This is the new default SDK for building on the Zama Protocol. The legacy `@zama-fhe/relayer-sdk` lives at [github.com/zama-ai/relayer-sdk](https://github.com/zama-ai/relayer-sdk).
{% endhint %}

Pick your stack. Each tab gets you from install to a working confidential transfer.

The first three tabs are for **browser apps** (React dApp, vanilla viem, or ethers). The **Node.js** tabs are for backend services, scripts, and bots that operate on confidential tokens server-side — they use native worker threads instead of a Web Worker and store keys in memory.

In browser apps, prefix client-side variables with `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite) so the bundler exposes them.

## Authentication

The relayer requires an API key. In browser apps, proxy requests through your backend so the key stays server-side. Override `relayerUrl` in the chain definition to point at your proxy:

```ts
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

// Browser apps: proxy through your backend (recommended)
const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;
```

See [Authentication](/protocol/sdk/guides/authentication.md) for a backend proxy example.

## Install

{% tabs %}
{% tab title="React + wagmi" %}

```bash
pnpm add @zama-fhe/sdk @zama-fhe/react-sdk @tanstack/react-query wagmi viem
```

{% endtab %}

{% tab title="viem" %}

```bash
pnpm add @zama-fhe/sdk viem
```

{% endtab %}

{% tab title="ethers" %}

```bash
pnpm add @zama-fhe/sdk ethers
```

{% endtab %}

{% tab title="Node.js (viem)" %}

```bash
pnpm add @zama-fhe/sdk viem
```

{% endtab %}

{% tab title="Node.js (ethers)" %}

```bash
pnpm add @zama-fhe/sdk ethers
```

{% endtab %}
{% endtabs %}

## Set up the SDK

{% tabs %}
{% tab title="React + wagmi" %}

```tsx
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/YOUR_KEY"),
  },
});

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>
          <MyTokenPage />
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

{% endtab %}

{% tab title="viem" %}

```ts
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://sepolia.infura.io/v3/YOUR_KEY"),
});
const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  relayers: {
    [mySepolia.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="ethers" %}

```ts
import { createConfig } from "@zama-fhe/sdk/ethers";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  ethereum: window.ethereum!,
  relayers: {
    [mySepolia.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="Node.js (viem)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia as sepoliaViem } from "viem/chains";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({
  chain: sepoliaViem,
  transport: http(process.env.RPC_URL),
});
const walletClient = createWalletClient({
  account,
  chain: sepoliaViem,
  transport: http(process.env.RPC_URL),
});

const mySepolia = { ...sepolia, network: process.env.RPC_URL! } as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="Node.js (ethers)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/ethers";
import { ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { Wallet, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

const mySepolia = { ...sepolia, network: process.env.RPC_URL! } as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  signer: wallet,
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
**FHE artifact caching** — Both `web()` and `node()` relayers automatically cache the multi-MB FHE encryption key and parameters so they are not re-downloaded on every startup. Browser uses IndexedDB (persists across reloads), Node.js uses in-memory storage (lost on restart). The cache revalidates against the CDN every 24 hours. Configure it via the options passed to `web()` / `node()`. See [FheArtifactCache](/protocol/sdk/api-references/sdk/fheartifactcache.md) for details.
{% endhint %}

## Your first confidential transfer

{% tabs %}
{% tab title="React + wagmi" %}

```tsx
import { type FormEvent } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  useConfidentialBalance,
  useConfidentialTransfer,
  useShield,
  useMetadata,
} from "@zama-fhe/react-sdk";

function MyTokenPage() {
  const WRAPPER = "0xYourWrappedToken";
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: meta } = useMetadata(WRAPPER);
  const { data: balance, isLoading } = useConfidentialBalance({
    address: WRAPPER,
    account: address,
  });
  const { mutateAsync: shield, isPending: isShielding } = useShield({
    address: WRAPPER,
  });
  const { mutateAsync: transfer, isPending: isSending } = useConfidentialTransfer({
    address: WRAPPER,
  });

  if (!isConnected) {
    return <button onClick={() => connect({ connector: injected() })}>Connect Wallet</button>;
  }

  async function handleShield(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = new FormData(e.currentTarget).get("amount") as string;
    await shield({ amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  async function handleTransfer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const to = data.get("to") as string;
    const amount = data.get("amount") as string;
    await transfer({ to: to as `0x${string}`, amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  return (
    <div>
      <p>Connected: {address}</p>
      {meta && (
        <p>
          Token: {meta.name} ({meta.symbol})
        </p>
      )}
      <p>Balance: {isLoading ? "Decrypting…" : balance?.toString()}</p>

      <form onSubmit={handleShield}>
        <fieldset disabled={isShielding}>
          <legend>Shield</legend>
          <input name="amount" type="number" placeholder="Amount" required />
          <button type="submit">{isShielding ? "Shielding…" : "Shield"}</button>
        </fieldset>
      </form>

      <form onSubmit={handleTransfer}>
        <fieldset disabled={isSending}>
          <legend>Confidential Transfer</legend>
          <input name="to" type="text" placeholder="Recipient (0x…)" required />
          <input name="amount" type="number" placeholder="Amount" required />
          <button type="submit">{isSending ? "Sending…" : "Send"}</button>
        </fieldset>
      </form>

      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
```

{% endtab %}

{% tab title="viem" %}

```ts
const wrappedToken = sdk.createWrappedToken("0xYourWrappedToken");

// Shield 1,000 public tokens into confidential form
await wrappedToken.shield(1000n);

// Decrypt your balance (first call prompts a wallet signature)
const [address] = await walletClient.getAddresses();
const balance = await wrappedToken.balanceOf(address);
console.log("Confidential balance:", balance);

// Send 500 tokens privately
await wrappedToken.confidentialTransfer("0xRecipient", 500n);

// Withdraw back to public ERC-20
await wrappedToken.unshield(500n);
```

{% endtab %}

{% tab title="ethers" %}

```ts
const wrappedToken = sdk.createWrappedToken("0xYourWrappedToken");

// Shield 1,000 public tokens into confidential form
await wrappedToken.shield(1000n);

// Decrypt your balance (first call prompts a wallet signature)
const [address] = (await window.ethereum!.request({ method: "eth_accounts" })) as string[];
const balance = await wrappedToken.balanceOf(address as `0x${string}`);
console.log("Confidential balance:", balance);

// Send 500 tokens privately
await wrappedToken.confidentialTransfer("0xRecipient", 500n);

// Withdraw back to public ERC-20
await wrappedToken.unshield(500n);
```

{% endtab %}

{% tab title="Node.js (viem)" %}

```ts
const wrappedToken = sdk.createWrappedToken(process.env.WRAPPER_ADDRESS!);

try {
  // Shield 1,000 public tokens into confidential form
  await wrappedToken.shield(1000n);

  // Decrypt your balance
  const balance = await wrappedToken.balanceOf(account.address);
  console.log("Confidential balance:", balance);

  // Send 500 tokens privately
  await wrappedToken.confidentialTransfer("0xRecipient", 500n);

  // Withdraw back to public ERC-20
  await wrappedToken.unshield(500n);
} finally {
  sdk.terminate(); // clean up worker threads
}
```

{% endtab %}

{% tab title="Node.js (ethers)" %}

```ts
const wrappedToken = sdk.createWrappedToken(process.env.WRAPPER_ADDRESS!);

try {
  // Shield 1,000 public tokens into confidential form
  await wrappedToken.shield(1000n);

  // Decrypt your balance
  const balance = await wrappedToken.balanceOf(wallet.address as `0x${string}`);
  console.log("Confidential balance:", balance);

  // Send 500 tokens privately
  await wrappedToken.confidentialTransfer("0xRecipient", 500n);

  // Withdraw back to public ERC-20
  await wrappedToken.unshield(500n);
} finally {
  sdk.terminate(); // clean up worker threads
}
```

{% endtab %}
{% endtabs %}

The hooks and SDK methods handle FHE encryption, wallet signing, ERC-20 approvals, and cache invalidation automatically.

## Next steps

* [Configuration](/protocol/sdk/guides/configuration.md) -- chains, relayers, provider, signer, storage, and authentication setup
* [Shield Tokens](/protocol/sdk/guides/shield-tokens.md) -- move tokens into confidential form
* [Chain Objects](/protocol/sdk/api-references/sdk/network-presets.md) -- pre-configured chain definitions for Sepolia, Mainnet, and more
* [React Hooks](/protocol/sdk/api-references/react/zamaprovider.md) -- provider setup and all available hooks
* [Security Model](/protocol/sdk/concepts/security-model.md) -- understand the cryptography and trust assumptions




# First confidential dApp

We'll build a token dashboard that shows a confidential balance, lets users shield tokens, transfer privately, and unshield. The finished app uses React, wagmi, and the Zama React SDK.

## What you'll build

A single-page dashboard where a connected wallet can manage confidential ERC-20 tokens -- shield, view balance, transfer, and unshield -- all from one screen.

## Prerequisites

* Node.js 18+
* A wallet browser extension (MetaMask or similar)
* Testnet ETH on Sepolia
* An encrypted ERC-20 token address deployed on Sepolia

## 1. Create the project

Scaffold a new Vite project with React and TypeScript:

```bash
pnpm create vite@latest my-confidential-dapp -- --template react-ts
cd my-confidential-dapp
```

## 2. Install dependencies

```bash
pnpm add @zama-fhe/sdk @zama-fhe/react-sdk @tanstack/react-query wagmi viem
```

`@zama-fhe/react-sdk` provides React hooks. Core SDK symbols (classes, types, chain presets, relayer factories) are imported from `@zama-fhe/sdk` directly.

## 3. Configure wagmi and the SDK

Create `src/config.ts`. This file sets up wagmi, the signer, and the relayer -- the three pieces every Zama app needs.

{% tabs %}
{% tab title="src/config.ts" %}

```ts
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/YOUR_KEY"),
  },
});

export const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

export const queryClient = new QueryClient();

export const TOKEN_ADDRESS = "0xYourEncryptedERC20" as const;

// If your token uses a separate wrapper contract, set it here.
// Omit if the token address is also the wrapper.
export const WRAPPER_ADDRESS = "0xYourWrapperAddress" as const;
```

{% endtab %}
{% endtabs %}

Replace `YOUR_KEY` with your Infura (or Alchemy) project ID, and update the relayer URL to point at your backend proxy. See the [Authentication guide](/protocol/sdk/guides/authentication.md) for proxy setup details.

## 4. Create the App layout with providers

Replace the contents of `src/App.tsx`. We wrap the app in three providers: wagmi for wallet state, React Query for async caching, and `ZamaProvider` for FHE operations. The Zama config is built by `createConfig` from `@zama-fhe/react-sdk/wagmi`, which derives the signer from your wagmi config so it tracks connection state automatically.

{% tabs %}
{% tab title="src/App.tsx" %}

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { wagmiConfig, queryClient, zamaConfig } from "./config";
import { Dashboard } from "./Dashboard";

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>
          <h1>Confidential Token Dashboard</h1>
          <Dashboard />
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

{% endtab %}
{% endtabs %}

## 5. Build the balance display

Create `src/BalanceDisplay.tsx`. The `useConfidentialBalance` hook decrypts the on-chain balance. It polls the encrypted value cheaply and only triggers full decryption when the balance changes.

{% tabs %}
{% tab title="src/BalanceDisplay.tsx" %}

```tsx
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { TOKEN_ADDRESS } from "./config";

export function BalanceDisplay() {
  const { address } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useConfidentialBalance({
    address: TOKEN_ADDRESS,
    account: address,
  });

  if (error) return <p>Failed to load balance.</p>;

  return (
    <div>
      <h2>Confidential Balance</h2>
      <p>{isLoading ? "Decrypting..." : balance?.toString()}</p>
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

The first call prompts the wallet for a signature to generate FHE decrypt permits. Subsequent calls reuse cached permits silently.

## 6. Add shielding

Create `src/ShieldForm.tsx`. Shielding converts public ERC-20 tokens into their encrypted form. The SDK handles the ERC-20 approval automatically.

{% tabs %}
{% tab title="src/ShieldForm.tsx" %}

```tsx
import { type FormEvent } from "react";
import { useShield } from "@zama-fhe/react-sdk";
import { WRAPPER_ADDRESS } from "./config";

export function ShieldForm() {
  const { mutateAsync: shield, isPending } = useShield({
    address: WRAPPER_ADDRESS,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amount = data.get("amount") as string;
    await shield({ amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Shield Tokens</legend>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount to shield" required />
        </label>
        <button type="submit">{isPending ? "Shielding…" : "Shield"}</button>
      </fieldset>
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

After a successful shield, the balance display updates automatically -- mutation hooks invalidate the relevant caches.

## 7. Add confidential transfers

Create `src/TransferForm.tsx`. The transfer amount is encrypted before it reaches the chain. Nobody can see how much was sent.

{% tabs %}
{% tab title="src/TransferForm.tsx" %}

```tsx
import { type FormEvent } from "react";
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";
import { TOKEN_ADDRESS } from "./config";

export function TransferForm() {
  const { mutateAsync: transfer, isPending } = useConfidentialTransfer({
    address: TOKEN_ADDRESS,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const to = data.get("to") as string;
    const amount = data.get("amount") as string;
    await transfer({ to: to as `0x${string}`, amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Confidential Transfer</legend>
        <label>
          Recipient
          <input name="to" type="text" placeholder="0x…" required />
        </label>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount" required />
        </label>
        <button type="submit">{isPending ? "Sending…" : "Send"}</button>
      </fieldset>
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

## 8. Add unshielding

Create `src/UnshieldForm.tsx`. Unshielding withdraws confidential tokens back to public ERC-20. This is a two-step on-chain process (unwrap + finalize), but the hook orchestrates it in a single call. We use progress callbacks to update the UI.

{% tabs %}
{% tab title="src/UnshieldForm.tsx" %}

```tsx
import { useState, type FormEvent } from "react";
import { useUnshield } from "@zama-fhe/react-sdk";
import { WRAPPER_ADDRESS } from "./config";

export function UnshieldForm() {
  const [status, setStatus] = useState("");
  const { mutateAsync: unshield, isPending } = useUnshield(WRAPPER_ADDRESS);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amount = data.get("amount") as string;
    setStatus("Submitting unwrap…");
    await unshield({
      amount: BigInt(amount),
      onUnwrapSubmitted: (txHash) => setStatus(`Unwrap submitted: ${txHash}`),
      onFinalizing: () => setStatus("Waiting for decryption proof…"),
      onFinalizeSubmitted: (txHash) => setStatus(`Complete: ${txHash}`),
    });
    e.currentTarget.reset();
    setStatus("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Unshield Tokens</legend>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount to unshield" required />
        </label>
        <button type="submit">{isPending ? "Unshielding…" : "Unshield"}</button>
      </fieldset>
      {status && <p>{status}</p>}
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

See [Hooks > useUnshield](/protocol/sdk/api-references/react/useunshield.md) for the full callback reference.

## 9. Add error handling

Create `src/ErrorMessage.tsx`. The `matchZamaError` utility maps SDK error codes to user-friendly messages without long `instanceof` chains. See [Error Handling](/protocol/sdk/guides/handle-errors.md) for the full list of error codes.

{% tabs %}
{% tab title="src/ErrorMessage.tsx" %}

```tsx
import { matchZamaError } from "@zama-fhe/sdk";

export function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;

  const message = matchZamaError(error, {
    SIGNING_REJECTED: () => "Transaction cancelled -- please approve in your wallet.",
    ENCRYPTION_FAILED: () => "Encryption failed -- try again.",
    TRANSACTION_REVERTED: () => "Transaction failed on-chain -- check your balance.",
    KEYPAIR_EXPIRED: () => "Transport key pair expired -- sign again to continue.",
    _: (e) => e.message,
  });

  return <p style={{ color: "red" }}>{message ?? "An unexpected error occurred."}</p>;
}
```

{% endtab %}
{% endtabs %}

Use this component alongside any mutation hook. Pass the hook's `error` property:

```tsx
const { mutateAsync: shield, isPending, error } = useShield({ address: WRAPPER_ADDRESS });

// In your JSX:
<ErrorMessage error={error} />;
```

## 10. Wire it up

Create `src/Dashboard.tsx` to bring all components together.

{% tabs %}
{% tab title="src/Dashboard.tsx" %}

```tsx
import { BalanceDisplay } from "./BalanceDisplay";
import { ShieldForm } from "./ShieldForm";
import { TransferForm } from "./TransferForm";
import { UnshieldForm } from "./UnshieldForm";

export function Dashboard() {
  return (
    <div>
      <BalanceDisplay />
      <hr />
      <ShieldForm />
      <hr />
      <TransferForm />
      <hr />
      <UnshieldForm />
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

Start the dev server:

```bash
pnpm dev
```

Open the app in your browser, connect your wallet, and try the full flow: shield some tokens, check the balance, send a confidential transfer, then unshield.

## Next steps

* [Configuration](/protocol/sdk/guides/configuration.md) -- customize authentication, storage backends, and network presets
* [Error Handling](/protocol/sdk/guides/handle-errors.md) -- handle every SDK error type
* [React Hooks](/protocol/sdk/api-references/react/query-keys.md) -- explore all available hooks
* [Core SDK](/protocol/sdk/api-references/sdk/zamasdk.md) -- use the imperative API for non-React apps



# First confidential dApp

We'll build a token dashboard that shows a confidential balance, lets users shield tokens, transfer privately, and unshield. The finished app uses React, wagmi, and the Zama React SDK.

## What you'll build

A single-page dashboard where a connected wallet can manage confidential ERC-20 tokens -- shield, view balance, transfer, and unshield -- all from one screen.

## Prerequisites

* Node.js 18+
* A wallet browser extension (MetaMask or similar)
* Testnet ETH on Sepolia
* An encrypted ERC-20 token address deployed on Sepolia

## 1. Create the project

Scaffold a new Vite project with React and TypeScript:

```bash
pnpm create vite@latest my-confidential-dapp -- --template react-ts
cd my-confidential-dapp
```

## 2. Install dependencies

```bash
pnpm add @zama-fhe/sdk @zama-fhe/react-sdk @tanstack/react-query wagmi viem
```

`@zama-fhe/react-sdk` provides React hooks. Core SDK symbols (classes, types, chain presets, relayer factories) are imported from `@zama-fhe/sdk` directly.

## 3. Configure wagmi and the SDK

Create `src/config.ts`. This file sets up wagmi, the signer, and the relayer -- the three pieces every Zama app needs.

{% tabs %}
{% tab title="src/config.ts" %}

```ts
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/YOUR_KEY"),
  },
});

export const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

export const queryClient = new QueryClient();

export const TOKEN_ADDRESS = "0xYourEncryptedERC20" as const;

// If your token uses a separate wrapper contract, set it here.
// Omit if the token address is also the wrapper.
export const WRAPPER_ADDRESS = "0xYourWrapperAddress" as const;
```

{% endtab %}
{% endtabs %}

Replace `YOUR_KEY` with your Infura (or Alchemy) project ID, and update the relayer URL to point at your backend proxy. See the [Authentication guide](/protocol/sdk/guides/authentication.md) for proxy setup details.

## 4. Create the App layout with providers

Replace the contents of `src/App.tsx`. We wrap the app in three providers: wagmi for wallet state, React Query for async caching, and `ZamaProvider` for FHE operations. The Zama config is built by `createConfig` from `@zama-fhe/react-sdk/wagmi`, which derives the signer from your wagmi config so it tracks connection state automatically.

{% tabs %}
{% tab title="src/App.tsx" %}

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { wagmiConfig, queryClient, zamaConfig } from "./config";
import { Dashboard } from "./Dashboard";

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>
          <h1>Confidential Token Dashboard</h1>
          <Dashboard />
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

{% endtab %}
{% endtabs %}

## 5. Build the balance display

Create `src/BalanceDisplay.tsx`. The `useConfidentialBalance` hook decrypts the on-chain balance. It polls the encrypted value cheaply and only triggers full decryption when the balance changes.

{% tabs %}
{% tab title="src/BalanceDisplay.tsx" %}

```tsx
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { TOKEN_ADDRESS } from "./config";

export function BalanceDisplay() {
  const { address } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useConfidentialBalance({
    address: TOKEN_ADDRESS,
    account: address,
  });

  if (error) return <p>Failed to load balance.</p>;

  return (
    <div>
      <h2>Confidential Balance</h2>
      <p>{isLoading ? "Decrypting..." : balance?.toString()}</p>
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

The first call prompts the wallet for a signature to generate FHE decrypt permits. Subsequent calls reuse cached permits silently.

## 6. Add shielding

Create `src/ShieldForm.tsx`. Shielding converts public ERC-20 tokens into their encrypted form. The SDK handles the ERC-20 approval automatically.

{% tabs %}
{% tab title="src/ShieldForm.tsx" %}

```tsx
import { type FormEvent } from "react";
import { useShield } from "@zama-fhe/react-sdk";
import { WRAPPER_ADDRESS } from "./config";

export function ShieldForm() {
  const { mutateAsync: shield, isPending } = useShield({
    address: WRAPPER_ADDRESS,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amount = data.get("amount") as string;
    await shield({ amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Shield Tokens</legend>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount to shield" required />
        </label>
        <button type="submit">{isPending ? "Shielding…" : "Shield"}</button>
      </fieldset>
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

After a successful shield, the balance display updates automatically -- mutation hooks invalidate the relevant caches.

## 7. Add confidential transfers

Create `src/TransferForm.tsx`. The transfer amount is encrypted before it reaches the chain. Nobody can see how much was sent.

{% tabs %}
{% tab title="src/TransferForm.tsx" %}

```tsx
import { type FormEvent } from "react";
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";
import { TOKEN_ADDRESS } from "./config";

export function TransferForm() {
  const { mutateAsync: transfer, isPending } = useConfidentialTransfer({
    address: TOKEN_ADDRESS,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const to = data.get("to") as string;
    const amount = data.get("amount") as string;
    await transfer({ to: to as `0x${string}`, amount: BigInt(amount) });
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Confidential Transfer</legend>
        <label>
          Recipient
          <input name="to" type="text" placeholder="0x…" required />
        </label>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount" required />
        </label>
        <button type="submit">{isPending ? "Sending…" : "Send"}</button>
      </fieldset>
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

## 8. Add unshielding

Create `src/UnshieldForm.tsx`. Unshielding withdraws confidential tokens back to public ERC-20. This is a two-step on-chain process (unwrap + finalize), but the hook orchestrates it in a single call. We use progress callbacks to update the UI.

{% tabs %}
{% tab title="src/UnshieldForm.tsx" %}

```tsx
import { useState, type FormEvent } from "react";
import { useUnshield } from "@zama-fhe/react-sdk";
import { WRAPPER_ADDRESS } from "./config";

export function UnshieldForm() {
  const [status, setStatus] = useState("");
  const { mutateAsync: unshield, isPending } = useUnshield(WRAPPER_ADDRESS);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const amount = data.get("amount") as string;
    setStatus("Submitting unwrap…");
    await unshield({
      amount: BigInt(amount),
      onUnwrapSubmitted: (txHash) => setStatus(`Unwrap submitted: ${txHash}`),
      onFinalizing: () => setStatus("Waiting for decryption proof…"),
      onFinalizeSubmitted: (txHash) => setStatus(`Complete: ${txHash}`),
    });
    e.currentTarget.reset();
    setStatus("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isPending}>
        <legend>Unshield Tokens</legend>
        <label>
          Amount
          <input name="amount" type="number" placeholder="Amount to unshield" required />
        </label>
        <button type="submit">{isPending ? "Unshielding…" : "Unshield"}</button>
      </fieldset>
      {status && <p>{status}</p>}
    </form>
  );
}
```

{% endtab %}
{% endtabs %}

See [Hooks > useUnshield](/protocol/sdk/api-references/react/useunshield.md) for the full callback reference.

## 9. Add error handling

Create `src/ErrorMessage.tsx`. The `matchZamaError` utility maps SDK error codes to user-friendly messages without long `instanceof` chains. See [Error Handling](/protocol/sdk/guides/handle-errors.md) for the full list of error codes.

{% tabs %}
{% tab title="src/ErrorMessage.tsx" %}

```tsx
import { matchZamaError } from "@zama-fhe/sdk";

export function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;

  const message = matchZamaError(error, {
    SIGNING_REJECTED: () => "Transaction cancelled -- please approve in your wallet.",
    ENCRYPTION_FAILED: () => "Encryption failed -- try again.",
    TRANSACTION_REVERTED: () => "Transaction failed on-chain -- check your balance.",
    KEYPAIR_EXPIRED: () => "Transport key pair expired -- sign again to continue.",
    _: (e) => e.message,
  });

  return <p style={{ color: "red" }}>{message ?? "An unexpected error occurred."}</p>;
}
```

{% endtab %}
{% endtabs %}

Use this component alongside any mutation hook. Pass the hook's `error` property:

```tsx
const { mutateAsync: shield, isPending, error } = useShield({ address: WRAPPER_ADDRESS });

// In your JSX:
<ErrorMessage error={error} />;
```

## 10. Wire it up

Create `src/Dashboard.tsx` to bring all components together.

{% tabs %}
{% tab title="src/Dashboard.tsx" %}

```tsx
import { BalanceDisplay } from "./BalanceDisplay";
import { ShieldForm } from "./ShieldForm";
import { TransferForm } from "./TransferForm";
import { UnshieldForm } from "./UnshieldForm";

export function Dashboard() {
  return (
    <div>
      <BalanceDisplay />
      <hr />
      <ShieldForm />
      <hr />
      <TransferForm />
      <hr />
      <UnshieldForm />
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

Start the dev server:

```bash
pnpm dev
```

Open the app in your browser, connect your wallet, and try the full flow: shield some tokens, check the balance, send a confidential transfer, then unshield.

## Next steps

* [Configuration](/protocol/sdk/guides/configuration.md) -- customize authentication, storage backends, and network presets
* [Error Handling](/protocol/sdk/guides/handle-errors.md) -- handle every SDK error type
* [React Hooks](/protocol/sdk/api-references/react/query-keys.md) -- explore all available hooks
* [Core SDK](/protocol/sdk/api-references/sdk/zamasdk.md) -- use the imperative API for non-React apps


# Wallet & exchange integration

This guide is for wallet developers, dApp developers, and exchanges who want to support confidential tokens on the Zama Protocol. It covers ERC-7984 wallet flows (showing decrypted balances, sending transfers with encrypted inputs), the Confidential Token Wrappers Registry, and wrapping/unwrapping between ERC-20 and ERC-7984.

By the end of this guide, you will be able to:

* Initialize the Zama SDK in a wallet, browser app, or backend.
* Display ERC-7984 confidential balances by user-decrypting on the user's behalf.
* Build ERC-7984 transfers using encrypted inputs.
* Discover wrapped token pairs via the Wrappers Registry.
* Implement wrap and unwrap flows between ERC-20 and ERC-7984.

## Core concepts

While building support for [ERC-7984 confidential tokens](https://eips.ethereum.org/EIPS/eip-7984) you will encounter the following terminology. For a deeper architectural overview, see [Architecture](/protocol/sdk/concepts/architecture.md).

* **FHEVM** — Zama's library for computations on encrypted values. Each **encrypted value** is represented on-chain as a `bytes32` reference (also called a "handle" in Solidity / FHE.sol).
* **Host chain** — the EVM network your users connect to (e.g. Ethereum mainnet, Sepolia).
* **Gateway chain** — Zama's L3 chain that coordinates encryptions and decryptions.
* **Relayer** — off-chain service that registers encrypted inputs, coordinates decryptions, and returns results. Wallets and dApps talk to the Relayer via the Zama SDK.
* **ACL** — access control for encrypted values. Contracts grant per-address permissions so a user can read data they should have access to.
* **Native confidential token** — an ERC-7984 token where balances and transfer amounts are encrypted by default. Not derived from an underlying ERC-20.
* **Wrapped confidential token** — a standard ERC-20 wrapped into ERC-7984 form via a wrapper contract. The underlying ERC-20 is unchanged.
* **Confidential Token Wrappers Registry** — on-chain registry mapping ERC-20s to their ERC-7984 wrappers.

## Integration at a glance

You do **not** need to run FHE infrastructure to integrate. Wallets and exchanges interact with the protocol entirely through the Zama SDK:

1. Install and configure `@zama-fhe/sdk` (or `@zama-fhe/react-sdk` for React apps). See [Quick start](/protocol/sdk/getting-started/quick-start.md) for stack-by-stack setup.
2. Initialize a `ZamaSDK` instance with a relayer, signer, and storage. See the [`ZamaSDK` reference](/protocol/sdk/api-references/sdk/zamasdk.md).
3. For each confidential token contract, create a `Token` instance via `sdk.createToken(address)`.
4. Read encrypted balances, build transfers, and manage operators using the `Token` API or React hooks.

## What wallets and exchanges should support

* **Transfers**: Support the ERC-7984 transfer variants documented by OpenZeppelin, including forms that use an input proof and optional receiver callbacks. The SDK's [`Token.confidentialTransfer`](/protocol/sdk/api-references/sdk/token.md) and [`useConfidentialTransfer`](/protocol/sdk/api-references/react/useconfidentialtransfer.md) handle the encrypted input pipeline for you. See [Transfer privately](/protocol/sdk/guides/transfer-privately.md).
* **Operators**: Operators can move any amount during an active window. UX must capture an expiry, show risk clearly, and make revoke easy. See [Operator approvals](/protocol/sdk/guides/operator-approvals.md).
* **Events and metadata**: Names and symbols behave like conventional ERC-20s, but on-chain amounts remain encrypted. Render user-specific amounts only after user-decrypting them.

## Display confidential balances

Balances are stored on-chain as encrypted values. To display one, the user authorizes the wallet's session via an EIP-712 signature, after which the SDK performs **user decryption** to obtain the cleartext value. The session signature is cached, so subsequent decryptions for authorized contracts complete without prompting.

{% hint style="warning" %}
**Don't trigger the first signature automatically.** Gate the initial EIP-712 prompt behind an explicit user action — a "View balance" or "Authorize" button — so users opt into the wallet popup instead of being surprised by it. Once the session is cached, balance reads in other components decrypt silently.
{% endhint %}

{% tabs %}
{% tab title="SDK" %}

```ts
import { ZamaSDK } from "@zama-fhe/sdk";

const sdk = new ZamaSDK(config); // config from createConfig()
const token = sdk.createToken("0xConfidentialToken");

// First call prompts the wallet for an EIP-712 session signature;
// invoke it from a user action, not on app start.
const [owner] = await walletClient.getAddresses();
const balance = await token.balanceOf(owner); // connected wallet
const peer = await token.balanceOf("0xUserAddr"); // explicit holder
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useGrantPermit, useHasPermit, useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

const TOKEN = "0xConfidentialToken" as const;

function Balance() {
  const { address } = useAccount();
  const { mutate: grantPermit, isPending: isGranting } = useGrantPermit();
  const { data: hasPermit } = useHasPermit({ contractAddresses: [TOKEN] });

  const { data, isPending, error } = useConfidentialBalance(
    { address: TOKEN, account: address },
    { enabled: !!hasPermit },
  );

  if (!hasPermit) {
    return (
      <button onClick={() => grantPermit([TOKEN])} disabled={isGranting}>
        {isGranting ? "Signing…" : "View balance"}
      </button>
    );
  }
  if (isPending) return <span>Decrypting…</span>;
  if (error) return <span>{error.message}</span>;
  return <span>{data?.toString()}</span>;
}
```

{% endtab %}
{% endtabs %}

A common pattern is to call `useGrantPermit` once when the user first connects (covering every confidential contract you'll touch), then read balances anywhere in the app without further prompts. Credentials persist in IndexedDB and survive page reloads. See [Encrypt & decrypt](/protocol/sdk/guides/encrypt-decrypt.md) for the full pre-authorization pattern, and [Check balances](/protocol/sdk/guides/check-balances.md) for batch decryption across multiple tokens.

## Send a confidential transfer

Amounts are encrypted client-side before submission. The SDK builds the input proof, registers it with the relayer, and submits the transaction.

{% tabs %}
{% tab title="SDK" %}

```ts
const { txHash, receipt } = await token.confidentialTransfer("0xRecipient", 500n);
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";

const { mutate, isPending } = useConfidentialTransfer({ address: tokenAddress });
mutate({ to: "0xRecipient", amount: 500n });
```

{% endtab %}
{% endtabs %}

For operator transfers (`transferFrom`-style with delegated authority), see [`useConfidentialTransferFrom`](/protocol/sdk/api-references/react/useconfidentialtransferfrom.md) and [Operator approvals](/protocol/sdk/guides/operator-approvals.md).

## Wrapping and unwrapping

Wrapped confidential tokens let users convert standard ERC-20s into ERC-7984 form. Once wrapped, balances and transfer amounts are encrypted on-chain. The underlying ERC-20 is unchanged and recoverable by unwrapping.

### Fungibility framing for exchanges

A wrapped confidential token should be treated as **fungible with its underlying ERC-20** from the user's perspective. A user who deposits USDT and a user who deposits cUSDT are depositing the same underlying asset; the exchange handles wrap/unwrap internally.

Common flows:

* **User deposits ERC-20** (e.g. USDT): exchange wraps to confidential form (cUSDT) if needed for on-chain operations.
* **User deposits confidential token** (e.g. cUSDT): no wrapping needed; credit the same underlying balance.
* **User withdraws as ERC-20**: exchange unwraps and sends standard ERC-20.
* **User withdraws as confidential token**: exchange sends the confidential token directly.

In all cases, the user sees a single unified balance for the underlying asset.

### Shield (wrap)

`WrappedToken.shield` wraps a standard ERC-20 into its ERC-7984 form. The SDK handles the wrapping flow internally — using `transferAndCall` for ERC-1363 underlyings (one transaction) or `approve` + `wrap` for everything else (two transactions). The encrypted balance lands in the recipient's address (defaulting to the connected wallet). See [Shielding paths](/protocol/sdk/guides/shield-tokens.md#shielding-paths) for which currently-wrapped tokens use which path.

{% tabs %}
{% tab title="SDK" %}

```ts
const wrappedToken = sdk.createWrappedToken(confidentialTokenAddress);

// Exact-amount approval (default)
await wrappedToken.shield(1000n);

// Custom recipient (e.g. exchange's hot wallet)
await wrappedToken.shield(1000n, { to: "0xExchangeWallet" });

// Skip approval if you've already approved the wrapper
await wrappedToken.shield(1000n, { approvalStrategy: "skip" });
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useShield } from "@zama-fhe/react-sdk";

const { mutate, isPending } = useShield({ address: confidentialTokenAddress });
mutate({ amount: 1000n });
```

{% endtab %}
{% endtabs %}

See [Shield tokens](/protocol/sdk/guides/shield-tokens.md) for the full options surface, including custom approval strategies and progress callbacks.

### Unshield (unwrap)

Unwrapping is a **two-step asynchronous process** at the contract level: an unwrap request burns the encrypted amount, then a finalize call sends the cleartext amount of underlying ERC-20 once the gateway has publicly decrypted it. `WrappedToken.unshield` does both steps in one SDK call, including waiting for the decryption proof.

{% tabs %}
{% tab title="SDK" %}

```ts
const wrappedToken = sdk.createWrappedToken(confidentialTokenAddress);

const { txHash, receipt } = await wrappedToken.unshield(500n);

// Track each phase for UI updates
await wrappedToken.unshield(500n, {
  onUnwrapSubmitted: (h) => updateUI("Unwrap submitted…"),
  onFinalizing: () => updateUI("Waiting for decryption proof…"),
  onFinalizeSubmitted: (h) => updateUI("Unshield complete!"),
});

// Drain the entire balance
await wrappedToken.unshieldAll();
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useUnshield, useUnshieldAll } from "@zama-fhe/react-sdk";

const { mutate } = useUnshield(confidentialTokenAddress);
mutate({ amount: 500n });
```

{% endtab %}
{% endtabs %}

If the user closes the page between unwrap and finalize, resume with `WrappedToken.resumeUnshield` / [`useResumeUnshield`](/protocol/sdk/api-references/react/useresumeunshield.md). See [Unshield tokens](/protocol/sdk/guides/unshield-tokens.md) for the full flow.

### Decimal conversion in your UI

Wrappers enforce a maximum of **6 decimals** on the confidential side. When wrapping a higher-precision underlying (e.g. 18-decimal tokens), amounts are rounded down and excess underlying is refunded to the caller.

| Underlying decimals | Wrapper decimals | Conversion rate | Effect                                  |
| ------------------- | ---------------- | --------------- | --------------------------------------- |
| 18                  | 6                | 10^12           | 1 wrapper unit = 10^12 underlying units |
| 6                   | 6                | 1               | 1:1                                     |
| 2                   | 2                | 1               | 1:1                                     |

Display balances in the underlying asset's decimals when possible — your users think in USDT, not cUSDT-with-6-decimals. The wrapper contract itself exposes `decimals()` and `rate()` views (read them from the confidential token address, not the underlying ERC-20) for these UI conversions.

## Discover wrapped tokens via the Registry

The Confidential Token Wrappers Registry is an on-chain contract that maps ERC-20s to their ERC-7984 wrappers. It's the canonical directory for wallets and exchanges to discover which underlying tokens have official confidential wrappers.

The SDK exposes it via `sdk.registry`. See the [`WrappersRegistry` reference](/protocol/sdk/api-references/sdk/wrappersregistry.md) for the full surface.

{% hint style="warning" %}
**Always check validity.** A non-zero wrapper address may have been revoked. Treat `isValid: false` as no wrapper for that token.
{% endhint %}

### Look up a wrapper for an ERC-20

{% tabs %}
{% tab title="SDK" %}

```ts
const result = await sdk.registry.getConfidentialToken("0xUSDC");
if (result?.isValid) {
  const cUsdc = sdk.createWrappedToken(result.confidentialTokenAddress);
}
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useConfidentialTokenAddress } from "@zama-fhe/react-sdk";

const { data } = useConfidentialTokenAddress({ tokenAddress: "0xUSDC" });
// data: readonly [isValid: boolean, confidentialTokenAddress: Address]
```

{% endtab %}
{% endtabs %}

### Reverse lookup (confidential → underlying)

{% tabs %}
{% tab title="SDK" %}

```ts
const result = await sdk.registry.getUnderlyingToken("0xConfidentialToken");
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useTokenAddress } from "@zama-fhe/react-sdk";

const { data } = useTokenAddress({ confidentialTokenAddress });
```

{% endtab %}
{% endtabs %}

### List all registered pairs (paginated)

{% tabs %}
{% tab title="SDK" %}

```ts
const page = await sdk.registry.listPairs({
  page: 1,
  pageSize: 20,
  metadata: true, // include name/symbol/decimals/totalSupply
});
for (const pair of page.items) {
  console.log(pair.underlying.symbol, "→", pair.confidential.symbol);
}
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useListPairs } from "@zama-fhe/react-sdk";

const { data } = useListPairs({ page: 1, pageSize: 20, metadata: true });
```

{% endtab %}
{% endtabs %}

### Currently registered tokens

The following wrapped confidential tokens are registered on Ethereum mainnet:

| Confidential token | Address                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| cUSDC              | [`0xe978F22157048E5DB8E5d07971376e86671672B2`](https://etherscan.io/address/0xe978F22157048E5DB8E5d07971376e86671672B2) |
| cUSDT              | [`0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50`](https://etherscan.io/address/0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50) |
| cWETH              | [`0xda9396b82634Ea99243cE51258B6A5Ae512D4893`](https://etherscan.io/address/0xda9396b82634Ea99243cE51258B6A5Ae512D4893) |
| cBRON              | [`0x85dE671c3bec1aDeD752c3Cea943521181C826bc`](https://etherscan.io/address/0x85dE671c3bec1aDeD752c3Cea943521181C826bc) |
| cZAMA              | [`0x80CB147Fd86dC6dEe3Eee7e4Cee33d1397d98071`](https://etherscan.io/address/0x80CB147Fd86dC6dEe3Eee7e4Cee33d1397d98071) |
| cTGBP              | [`0xa873750ccbafd5ec7dd13bfd5237d7129832edd9`](https://etherscan.io/address/0xa873750ccbafd5ec7dd13bfd5237d7129832edd9) |

Look up the underlying ERC-20 for each via `sdk.registry.getUnderlyingToken(address)`.

## End-to-end example

For a runnable React dApp using these APIs end-to-end, follow [Build your first confidential dApp](/protocol/sdk/getting-started/first-confidential-dapp.md).

## UI and UX recommendations

* **Caching**: Decrypted values are cached client-side for the session lifetime. Offer a refresh action that repeats the decrypt flow.
* **Permissions**: Treat user decryption as a permission grant with scope and duration. Show which contracts are included and when access expires. The SDK's permit model is described in [Permit model](/protocol/sdk/concepts/permit-model.md).
* **Indicators**: Use distinct icons or badges for encrypted amounts. Avoid showing zero when a value is simply undisclosed.
* **Operator visibility**: Always show current operator approvals with expiry and a one-tap revoke (call `setOperator` with a past timestamp to revoke). See [`useConfidentialIsOperator`](/protocol/sdk/api-references/react/useconfidentialisoperator.md) and [`useConfidentialSetOperator`](/protocol/sdk/api-references/react/useconfidentialsetoperator.md).
* **Wrapping/unwrapping**: Clearly indicate which token a user is converting between. Show the underlying ERC-20's name and symbol alongside the confidential token.
* **Failure modes**: Differentiate between decryption denied, missing ACL grant, and expired session. Offer guided recovery actions. See [Handle errors](/protocol/sdk/guides/handle-errors.md).

## Testing and environments

* For local development against a Hardhat chain with no relayer, use [`RelayerCleartext`](/protocol/sdk/api-references/sdk/relayercleartext.md). See [Local development](/protocol/sdk/guides/local-development.md).
* For testnet, use the SDK's built-in Sepolia config or any other supported network — see [Network presets](/protocol/sdk/api-references/sdk/network-presets.md).
* Keep chain selection in a single source of truth in your app.

## Further reading

* [OpenZeppelin Confidential Contracts documentation](https://docs.openzeppelin.com/confidential-contracts) — ERC-7984 transfer variants, receiver callbacks, and operator semantics.
* [`Token` reference](/protocol/sdk/api-references/sdk/token.md) — full method surface for shield, unshield, transfer, approve, and balance operations.
* [`WrappersRegistry` reference](/protocol/sdk/api-references/sdk/wrappersregistry.md) — registry construction, caching, and pagination.
* [Architecture](/protocol/sdk/concepts/architecture.md) — how the SDK, relayer, and gateway fit together.



# Build with an LLM

Give your coding agent a grounded view of the Zama SDK so it writes correct FHEVM code instead of guessing. The fastest way is to install the Zama skills; otherwise point your agent at the SDK's [`llms.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt) files or connect the docs over MCP.

## Install the Zama skills

The Zama skills give your agent expert, always-current guidance on the protocol and SDK. They live in [`zama-ai/skills`](https://github.com/zama-ai/skills) (separate from this repo) and install as one bundle of three skills that route automatically by what you're working on:

1. **`zama-typescript`** — the TypeScript SDK, React, browser, and Node.js integration. This is the skill that drives SDK work.
2. `zama-solidity` — encrypted Solidity, FHE types, ACL, and ERC-7984.
3. `zama-protocol` — FHEVM concepts, protocol architecture, and planning.

Install once and your agent has all three; ask an SDK question and `zama-typescript` loads automatically.

{% tabs %}
{% tab title="Claude Code" %}

```
/plugin marketplace add zama-ai/skills
/plugin install zama-protocol@zama-skills
```

{% endtab %}

{% tab title="Other agents (npx)" %}

```
npx skills add zama-ai/skills
```

Works with most skill-aware agents. Add `--list` to choose which skills to install.
{% endtab %}
{% endtabs %}

For Codex, Cursor, or manual setup, see the [skills README](https://github.com/zama-ai/skills).

{% hint style="info" %}
No skill support? Point your agent at the [`llms.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt) files below instead.
{% endhint %}

## Give guidance to AI agents / LLMs

The Zama SDK ships as `@zama-fhe/sdk` (and `@zama-fhe/react-sdk` for React) — **not** the legacy `@zama-fhe/relayer-sdk` that most LLM training data still defaults to. Point your agent at the SDK's LLM-ready files to ground it on the current API when it can't use skills — or to pull a specific doc on demand. They give a grounded map of the public docs, approved examples, and SDK reference without cloning the repo.

| File                                                                                | Use it when                                                                                  | Your agent gets                                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`llms.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt)           | the agent needs to **discover** the right guide, example, or reference, then fetch only that | a compact map of guides, concepts, SDK and React reference pages, and approved examples   |
| [`llms-full.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms-full.txt) | the agent has a **large context window** and you want the whole public corpus in one paste   | the complete docs bundle plus approved examples and README context (API reports excluded) |

Start with [`llms.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt) for normal coding tasks; reach for [`llms-full.txt`](https://raw.githubusercontent.com/zama-ai/sdk/main/llms-full.txt) only when you want everything loaded at once. The `source_path` values such as `docs/gitbook/src/...` are provenance metadata, not local paths — if you haven't cloned the repo, use the raw GitHub URLs.

### Example prompts

To ground an agent, paste:

> You're building with the Zama SDK — `@zama-fhe/sdk` (and `@zama-fhe/react-sdk` for React), not the legacy `@zama-fhe/relayer-sdk`. Read <https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt> and follow its links to the relevant guides and approved examples before writing any code. Treat the official docs as the source of truth, prefer the official examples listed in llms.txt over ad hoc implementations, and use the API reference only to confirm exact signatures.

Then give it a task. (With the skills installed your agent is already grounded — skip straight here.)

{% tabs %}
{% tab title="React (wagmi)" %}

> Read <https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt> and follow its links to the relevant Zama SDK guides and approved examples before writing any code.
>
> Add confidential balances and transfers to this Next.js app, following the approved `react-wagmi` example.
> {% endtab %}

{% tab title="Node.js" %}

> Read <https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt> and follow its links to the relevant Zama SDK guides and approved examples before writing any code.
>
> Build a Node.js backend with the `node()` transport and per-request isolation, following the approved `node-viem` example.
> {% endtab %}

{% tab title="Debugging" %}

> Read <https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt> and follow its links to the relevant Zama SDK guides and approved examples before writing any code.
>
> Debug this Zama SDK integration: read the error handling guide (<https://docs.zama.org/protocol/sdk/guides/handle-errors.md>) — it covers catching, matching, and recovering from SDK errors — diagnose against it, then compare with the closest official example.
> {% endtab %}
> {% endtabs %}

## Connect the docs over MCP

Every page in these docs has a **Copy ▾** menu (top-right) with built-in agent connectors — reach for these when you want live access to the current docs rather than a static paste:

* **Connect with MCP** — add the docs as an MCP server in Claude Code, Cursor, VS Code, or Codex for live, searchable access to the current API. Stronger than `llms.txt` for MCP-capable agents, since it always reflects the published docs.
* **Open in ChatGPT** / **Open in Claude** — start a chat already grounded on the page you're viewing.
* **Copy page as Markdown** / **View as Markdown** — grab a single page as plain markdown for your agent, or append `.md` to any docs URL (e.g. `https://docs.zama.org/protocol/sdk/overview.md`).



# Migrate from v2 to v3

This guide upgrades an application that uses `@zama-fhe/sdk` and `@zama-fhe/react-sdk` from **2.5.0** (the last 2.x release) to the **3.x** line. Each step has an explicit *Before (2.x)* / *After (3.x)* pair and a find/replace rule, so it works whether you migrate by hand or hand it to an [AI coding agent](#migrate-with-an-ai-coding-agent).

**The happy path:** for most apps it's **Step 1 (config)** plus mechanical renames — the high-level `Token` flow API keeps its signatures. Only three surfaces actually moved: `approve` → operators (Step 4), token delegation → `sdk.delegations.*` (Step 3), and `balanceOf` now takes the holder (Step 4).

{% hint style="info" %}
**Before you start.** This assumes a working app on `@zama-fhe/sdk` / `@zama-fhe/react-sdk` **2.5.0** (upgrade to 2.5.0 first if you're below it), a clean git tree so you can review the migration as a diff, and Node 22+. The API here is complete as of **3.1.x**; the 3.0 major bump was an on-chain wrapper/registry upgrade (Step 6), not a TypeScript change. It's a code-only migration — to roll back, discard the diff and reinstall `@^2` (the deployed Step 6 contract upgrade isn't something your app reverts).
{% endhint %}

## Migrate with an AI coding agent

This guide is built to be executed by an AI coding agent (Claude Code, Cursor, Copilot, …). The fastest path is to point an agent at your repository with the prompt below. Read the rest of this page if you'd rather migrate by hand — or to review what the agent is doing.

{% hint style="warning" %}
Agents trained before this SDK existed routinely confuse `@zama-fhe/sdk` (this **high-level** SDK) with the legacy low-level `@zama-fhe/relayer-sdk` (`createInstance` / `initSDK`). The prompt forbids that — keep the instruction to treat this guide as the source of truth.
{% endhint %}

```
Upgrade this repository from @zama-fhe/sdk and @zama-fhe/react-sdk v2.x to v3.x.

SOURCE OF TRUTH — follow it exactly:
https://docs.zama.org/protocol/sdk/migration/migrate-v2-to-v3.md

Rules:
1. Fetch and read that guide BEFORE doing anything. It is authoritative. Do NOT
   rely on prior knowledge of the "Zama SDK": this is the high-level
   @zama-fhe/sdk, NOT the legacy @zama-fhe/relayer-sdk (createInstance/initSDK).
   For any symbol you're unsure about, use the guide's symbol-mapping table; for
   anything it doesn't cover, fetch
   https://raw.githubusercontent.com/zama-ai/sdk/main/llms.txt and follow its links.
2. First print a short PLAN: list every file importing @zama-fhe/sdk or
   @zama-fhe/react-sdk and which guide Steps apply to each. Then proceed.
3. Apply the Steps IN ORDER, starting with Step 1 (configuration) — it unblocks
   the rest. Use the symbol table for renames. Respect the per-symbol notes: the
   React hook calling convention is MIXED — see the Step 4 convention table (most
   hooks are positional `useX(address)`, the rest take `{ address }`, and the old
   `{ tokenAddress }` field is gone), and several signatures changed (e.g.
   balanceOf(owner), isOperator(holder, spender)).
4. Do NOT change app logic or unrelated code. The high-level Token flow API
   (shield, confidentialTransfer, unshield, …) is unchanged except where the
   guide says otherwise.
5. Bump the @zama-fhe/* deps to ^3 using this repo's package manager.
6. VALIDATE: run the type checker and the guide's final leftover-symbol `rg`
   sweep; fix until both are clean. Inspect the false-positive cases the guide
   calls out (.chainId on viem/EIP-1193 objects, token.approve on the underlying
   ERC-20, tokenAddress in your own variable names) instead of blind-replacing.
7. Show the result as a diff and flag anything ambiguous for human review.
```

No repo access (a plain chat assistant)? Paste this page as the source of truth, then the contents of your SDK-using files, and ask for the v3 rewrite of each under the same rules.

## Step 0 — Install

```bash
pnpm add @zama-fhe/sdk@^3 @zama-fhe/react-sdk@^3
# the react-sdk peer-depends on @zama-fhe/sdk@^3
```

## Symbol mapping (quick reference)

The tables below are the authoritative list of renames. Skim for the symbol you need and jump to the cited **Step**, or read Steps 1→7 in order for a full migration.

### `@zama-fhe/sdk` (core)

| 2.x                                                                                       | 3.x                                                                                                              | Step                                                        |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `ZamaSDKConfig`                                                                           | `ZamaConfig` (+ `ZamaConfigViem`/`ZamaConfigEthers`/`ZamaConfigWagmi`)                                           | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `new ZamaSDK({ relayer, signer, storage })`                                               | `new ZamaSDK(createConfig({ chains, …client, relayers, storage }))`                                              | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `SepoliaConfig` / `MainnetConfig` / `HardhatConfig` (from `@zama-fhe/sdk`)                | `sepolia` / `mainnet` / `hardhat` (+ `hoodi`, `anvil`, `ingenTestnet`, `bscTestnet`) from `@zama-fhe/sdk/chains` | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `<chainConfig>.chainId`                                                                   | `<chain>.id`                                                                                                     | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `ViemSigner` / `EthersSigner` (constructed)                                               | pass `publicClient`/`walletClient` (or ethers `provider`/`signer`) to `createConfig`                             | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `keypairTTL` (config option)                                                              | `transportKeyPairTTL`                                                                                            | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `new RelayerWeb(...)`                                                                     | `web()` from `@zama-fhe/sdk/web`                                                                                 | [2 · Relayer](#step-2-migrate-the-relayer)                  |
| `new RelayerNode(...)`                                                                    | `node()` from `@zama-fhe/sdk/node`                                                                               | [2 · Relayer](#step-2-migrate-the-relayer)                  |
| `CredentialsManager` / `DelegatedCredentialsManager`                                      | `Permits` / `Delegations` / `Decryption`                                                                         | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `CredentialsManagerConfig`, `Credentials*Event`, `StoredCredentials`, `StoredKeypair`     | `Permission`, `StoredTransportKeyPair` (+ permit events)                                                         | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `token.approve(spender[, expiry])`                                                        | `token.setOperator(operator[, expiry])`                                                                          | [4 · Operators](#step-4-approvals-operators)                |
| `token.isApproved(spender[, owner])`                                                      | `token.isOperator(holder, spender)`                                                                              | [4 · Operators](#step-4-approvals-operators)                |
| `token.balanceOf()` (self default)                                                        | `token.balanceOf(owner)` — owner address now required                                                            | [4 · Operators](#step-4-approvals-operators)                |
| `EncryptResult.handles` (bytes)                                                           | `EncryptResult.encryptedValues` (hex; `inputProof` is now hex too)                                               | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `extractEncryptedHandles(...)`                                                            | **removed** — read `result.encryptedValues`                                                                      | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `Handle` (type), `ClearValueType`                                                         | `EncryptedValue` (term), `ClearValue`                                                                            | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `ZERO_HANDLE` / `isZeroHandle()`                                                          | `ZERO_ENCRYPTED_VALUE` / `isEncryptedValueZero()`                                                                | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `UserDecryptParams`, `PublicDecryptResult`, `DelegatedUserDecryptParams`, `DecryptHandle` | `DecryptValuesParams`, `DecryptPublicValuesResult`, `DelegatedDecryptValuesParams`, `DecryptInput`               | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `applyDecryptedValues`, `DecryptCache`                                                    | **removed** — handled by the SDK's internal cache                                                                | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `KeypairType` / `Keypair`; `generateKeypair()` / `warmKeypair()`                          | `TransportKeyPair`; `generateTransportKeyPair()` / `warmTransportKeyPair()`                                      | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| relayer `getPublicKey()`; `PublicKeyData`                                                 | `fetchFheEncryptionKeyBytes()`; `FheEncryptionKey`                                                               | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `KeypairExpiredError` / `InvalidKeypairError`                                             | `TransportKeyPairExpiredError` / `InvalidTransportKeyPairError`                                                  | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `sdk.createReadonlyToken(addr)`; `sdk.createToken(addr, wrapper?)`                        | `sdk.createToken(addr)` (read/transfer); `sdk.createWrappedToken(addr)` (wrap/shield/unshield)                   | [6 · Tokens](#step-6-token-wrappedtoken-upgraded-contracts) |
| `ReadonlyToken`                                                                           | `Token` (read/transfer) / `WrappedToken` (wrap)                                                                  | [6 · Tokens](#step-6-token-wrappedtoken-upgraded-contracts) |
| `decodeUnwrappedFinalized`, `UnwrappedFinalizedEvent`                                     | `decodeUnwrapFinalized`, `UnwrapFinalizedEvent`                                                                  | [6 · Tokens](#step-6-token-wrappedtoken-upgraded-contracts) |
| `decodeUnwrappedStarted`, `UnwrappedStartedEvent`                                         | **removed**                                                                                                      | [6 · Tokens](#step-6-token-wrappedtoken-upgraded-contracts) |
| `parseActivityFeed`, `ActivityItem`, `ActivityAmount`, `ActivityType`                     | **removed** (activity feed dropped)                                                                              | [7 · Removed](#step-7-removed-with-no-replacement)          |
| `totalSupplyContract`, `matchAclRevert`, `sortByBlockNumber`                              | **removed**                                                                                                      | [7 · Removed](#step-7-removed-with-no-replacement)          |

### `@zama-fhe/react-sdk` (hooks)

| 2.x                                                                | 3.x                                                                                               | Step                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `<ZamaProvider relayer signer storage sessionStorage onEvent>`     | `<ZamaProvider config={createConfig({…})}>` (no `sessionStorage`)                                 | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `new WagmiSigner({ config })`                                      | `createConfig` from `@zama-fhe/react-sdk/wagmi`                                                   | [1 · Config](#step-1-migrate-the-sdk-configuration)         |
| `useAllow` / `useIsAllowed`                                        | `useGrantPermit` / `useHasPermit`                                                                 | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useGenerateKeypair`                                               | **removed** — permits are managed by the SDK                                                      | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useCreateEIP712` / `useCreateDelegatedUserDecryptEIP712`          | **removed** — use `useGrantPermit`                                                                | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useDelegatedUserDecrypt`                                          | `useDelegatedDecryptValues`                                                                       | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useRevoke`                                                        | `useRevokePermits` — revoke permits, keep the transport key pair                                  | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useRevokeSession`                                                 | `useClearCredentials` — full logout (also wipes the transport key pair)                           | [3 · Permits](#step-3-permits-delegated-decryption)         |
| `useConfidentialApprove`                                           | `useConfidentialSetOperator`                                                                      | [4 · Operators](#step-4-approvals-operators)                |
| `useConfidentialIsApproved` (+ `Suspense`)                         | `useConfidentialIsOperator` (+ `Suspense`)                                                        | [4 · Operators](#step-4-approvals-operators)                |
| token hooks taking `{ tokenAddress }`                              | positional `(address)` or `{ address }` — see the [convention table](#step-4-approvals-operators) | [4 · Operators](#step-4-approvals-operators)                |
| `useUserDecrypt({ handles })`                                      | `useDecryptValues(inputs)` — renamed + arg shape change, see Step 5                               | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `usePublicDecrypt`                                                 | `useDecryptPublicValues` — public-decrypt mutation, see Step 5                                    | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `usePublicKey`, `usePublicParams`, `useRequestZKProofVerification` | **removed** — low-level key/proof hooks; the SDK handles these                                    | [5 · Encrypt/decrypt](#step-5-encrypt-hex-decrypt-glossary) |
| `useReadonlyToken`                                                 | `useWrappedToken`                                                                                 | [6 · Tokens](#step-6-token-wrappedtoken-upgraded-contracts) |
| `useActivityFeed`                                                  | **removed** (activity feed dropped)                                                               | [7 · Removed](#step-7-removed-with-no-replacement)          |

***

## Step 1 — Migrate the SDK configuration

This is the central change and affects every integration. The imperative "construct a `Signer`, construct a `Relayer`, pass them in" pattern is replaced by a single declarative `createConfig({ chains, …client, relayers, storage })`.

**Why:** v2 bound one relayer to one active chain (a second chain meant a second `ZamaSDK`); `createConfig` declares every chain and its relayer once, making multichain first-class.

Key shifts:

* Chain presets move to `@zama-fhe/sdk/chains` and expose `.id` (not `.chainId`).
* You no longer construct `ViemSigner` / `EthersSigner` / `WagmiSigner`. You pass the underlying clients (`publicClient` + `walletClient`, ethers `provider` + `signer`, or `wagmiConfig`) to `createConfig`.
* Relayers become factories (`web()` / `node()`) placed in a `relayers` map keyed by each chain's `id`. See [Step 2](#step-2-migrate-the-relayer).
* `new ZamaSDK(config)` / `<ZamaProvider config={config}>` take the object returned by `createConfig`.

### Node / backend (viem)

{% tabs %}
{% tab title="Before (2.x)" %}

```ts
import { MemoryStorage, ZamaSDK } from "@zama-fhe/sdk";
import { ViemSigner } from "@zama-fhe/sdk/viem";
import { RelayerNode } from "@zama-fhe/sdk/node";
import { sepolia } from "viem/chains";

const signer = new ViemSigner({ walletClient, publicClient });

const auth = RELAYER_API_KEY
  ? { __type: "ApiKeyHeader" as const, value: RELAYER_API_KEY }
  : undefined;

const relayer = new RelayerNode({
  getChainId: async () => sepolia.id,
  transports: {
    [sepolia.id]: { network: SEPOLIA_RPC_URL, ...(auth && { auth }) },
  },
});

using sdk = new ZamaSDK({ relayer, signer, storage: new MemoryStorage() });
```

{% endtab %}

{% tab title="After (3.x)" %}

```ts
import { MemoryStorage, ZamaSDK } from "@zama-fhe/sdk";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { createConfig } from "@zama-fhe/sdk/viem";
import { node } from "@zama-fhe/sdk/node";

const zamaSepolia = {
  ...sepolia,
  network: SEPOLIA_RPC_URL,
  ...(RELAYER_API_KEY && {
    auth: { __type: "ApiKeyHeader" as const, value: RELAYER_API_KEY },
  }),
} as const satisfies FheChain;

using sdk = new ZamaSDK(
  createConfig({
    chains: [zamaSepolia],
    publicClient,
    walletClient,
    storage: new MemoryStorage(),
    relayers: { [zamaSepolia.id]: node() },
  }),
);
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
If you also construct viem clients here (`createPublicClient` / `createWalletClient`), import viem's own `sepolia` under an alias (e.g. `sepolia as viemSepolia`) to avoid colliding with the `sepolia` preset from `@zama-fhe/sdk/chains`.
{% endhint %}

### React (wagmi)

{% tabs %}
{% tab title="Before (2.x)" %}

```tsx
import { ZamaProvider, RelayerWeb, indexedDBStorage, IndexedDBStorage } from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";
import { SepoliaConfig } from "@zama-fhe/sdk";

const signer = new WagmiSigner({ config: wagmiConfig });
const sessionDBStorage = new IndexedDBStorage("SessionStore");

const relayer = useMemo(
  () =>
    new RelayerWeb({
      getChainId: () => signer.getChainId(),
      transports: {
        [SepoliaConfig.chainId]: {
          ...SepoliaConfig,
          relayerUrl: `${window.location.origin}/api/relayer`,
          network: SEPOLIA_RPC_URL,
        },
      },
    }),
  [],
);

<WagmiProvider config={wagmiConfig}>
  <ZamaProvider
    relayer={relayer}
    signer={signer}
    storage={indexedDBStorage}
    sessionStorage={sessionDBStorage}
    onEvent={handleEvent}
  >
    {children}
  </ZamaProvider>
</WagmiProvider>;
```

{% endtab %}

{% tab title="After (3.x)" %}

```tsx
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { indexedDBStorage } from "@zama-fhe/sdk";
import { sepolia as fheSepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { web } from "@zama-fhe/sdk/web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const mySepolia = {
  ...fheSepolia,
  relayerUrl: "/api/relayer",
  network: SEPOLIA_RPC_URL,
} as const satisfies FheChain;

const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
  storage: indexedDBStorage,
  // permitStorage defaults to `storage`; pass it only to split the backing store.
  onEvent: handleEvent,
});

<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <ZamaProvider config={zamaConfig}>{children}</ZamaProvider>
  </QueryClientProvider>
</WagmiProvider>;
```

The `react-sdk` hooks use TanStack Query internally, so the host app must wrap `<ZamaProvider>` in a `QueryClientProvider` (a no-op change if your app already has one). This is the one piece of required wiring that is not captured by `createConfig`.
{% endtab %}
{% endtabs %}

Notes:

* The wagmi adapter creates the SDK signer/provider and subscribes to wagmi connection changes internally — no `useMemo` for the relayer and no `walletKey` remount pattern needed.
* The 2.x `sessionStorage` prop is **removed**. There is now a single `storage` option (permits reuse it via `permitStorage`, which defaults to `storage`), so the separate `new IndexedDBStorage("SessionStore")` is no longer required.
* All wiring (`relayer`, `signer`, `storage`, `onEvent`) moves into `createConfig`; `<ZamaProvider>` takes a single `config` prop.

### Other adapters

| Adapter       | `createConfig` import       | Clients to pass                                       |
| ------------- | --------------------------- | ----------------------------------------------------- |
| viem          | `@zama-fhe/sdk/viem`        | `publicClient`, `walletClient`                        |
| ethers        | `@zama-fhe/sdk/ethers`      | `provider`, `signer`                                  |
| wagmi (React) | `@zama-fhe/react-sdk/wagmi` | `wagmiConfig`                                         |
| generic       | `@zama-fhe/sdk`             | `provider`, `signer` (`GenericProvider`/`BaseSigner`) |

## Step 2 — Migrate the relayer

Relayers are no longer classes you instantiate; they are factories placed in a `relayers` map keyed by each chain's `id`, inside `createConfig`.

| 2.x                      | 3.x           | Import               |
| ------------------------ | ------------- | -------------------- |
| `new RelayerWeb({...})`  | `web()`       | `@zama-fhe/sdk/web`  |
| `new RelayerNode({...})` | `node()`      | `@zama-fhe/sdk/node` |
| *(new in v3)*            | `cleartext()` | `@zama-fhe/sdk`      |

`cleartext()` is **new in v3** — the relayer for cleartext-mode chains (no FHE, KMS, or gateway): local dev (`hardhat`) and the cleartext testnets (`hoodi`, `ingenTestnet`, `bscTestnet`).

```ts
// Before
const relayer = new RelayerWeb({ getChainId, transports: { [id]: { network, relayerUrl } } });

// After — per-chain network/auth now lives on the chain preset (Step 1),
// the factory only selects the runtime.
relayers: { [chain.id]: web() }
```

The `getChainId` / `transports` plumbing is gone: the network endpoint, relayer URL and auth are configured on the `FheChain` object (`network`, `relayerUrl`, `auth`) and the SDK resolves the right relayer per chain via `RelayerDispatcher`.

{% hint style="info" %}
**Imported the relayer config types directly?** They followed the constructor → factory move: `node()` / `web()` / `cleartext()` return `NodeRelayerConfig` / `WebRelayerConfig` / `CleartextRelayerConfig` (all extend `RelayerConfig`). The relayer-sdk-level `RelayerWebConfig` / `RelayerWebSecurityConfig` are unchanged but now live under `@zama-fhe/sdk/web`.
{% endhint %}

{% hint style="info" %}
**Relayer auth (`FheChain.auth`).** Still `ApiKeyHeader | ApiKeyCookie | BearerToken`. The **Zama-hosted relayer requires `ApiKeyHeader`** (sent as `x-api-key`; Bearer and cookie are rejected at the edge). Field names differ — `ApiKeyHeader` uses `value`, `BearerToken` uses `token`. See [Relayer API keys](/protocol/sdk/guides/relayer-api-keys.md).
{% endhint %}

## Step 3 — Permits & delegated decryption

The "credentials/session" vocabulary is replaced by the **permit** model. A permit is a reusable EIP-712 signature granting your app decrypt rights for a set of contracts. See the [Permit model](/protocol/sdk/concepts/permit-model.md) concept page.

The mental model changed, not just the names:

* **2.x:** your app held a **session** — a decrypt transport key pair (`useGenerateKeypair`) plus per-contract **credentials** (the grants), all under one TTL. The key pair was **chain-scoped**, so switching chains threw it away.
* **3.x:** the two are **decoupled** — one identity transport key pair (owned by the SDK, shared across all chains, surviving chain switches) backs many independent **permits** (the grants). Adding a contract signs just an **incremental** permit rather than re-issuing the whole set, and the two revocation hooks split along that seam: `useRevokePermits` drops grants but keeps the key pair, `useClearCredentials` is a full logout.

In most apps you do **not** manage permits manually — decrypt hooks (`useDecryptValues`, `useConfidentialBalance`) trigger the permit signature automatically on first use. The explicit hooks are for gating that prompt and for revocation. The full hook renames are in the [react-sdk symbol table](#zama-fhe-react-sdk-hooks).

Recommended pattern — gate any decrypt UI on `useHasPermit` so users don't get an unsolicited wallet popup on render:

```tsx
import { useHasPermit, useGrantPermit } from "@zama-fhe/react-sdk";
import type { Address } from "viem";

function DecryptGate({
  contractAddresses,
  children,
}: {
  contractAddresses: Address[];
  children: React.ReactNode;
}) {
  const { data: hasPermit } = useHasPermit({ contractAddresses });
  const { mutate: grantPermit, isPending } = useGrantPermit();
  if (hasPermit) return <>{children}</>; // children can call useDecryptValues without a prompt
  return (
    <button onClick={() => grantPermit(contractAddresses)} disabled={isPending}>
      Enable decryption
    </button>
  );
}
```

SDK-level delegation **moved off the `Token` instance** onto the `sdk.delegations` namespace, and now takes the contract address explicitly. Only `decryptBalanceAs` stays on `Token`.

| 2.x                                                  | 3.x                                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `token.delegateDecryption({ delegateAddress })`      | `sdk.delegations.delegateDecryption({ contractAddress: token.address, delegateAddress })` |
| `token.revokeDelegation({ delegateAddress })`        | `sdk.delegations.revokeDelegation({ contractAddress: token.address, delegateAddress })`   |
| `token.getDelegationExpiry({ delegatorAddress, … })` | `sdk.delegations.getExpiry({ contractAddress, delegatorAddress, delegateAddress })`       |
| *(no Token-level status check)*                      | `sdk.delegations.isActive({ contractAddress, delegatorAddress, delegateAddress })`        |
| `token.decryptBalanceAs(...)`                        | **unchanged** — stays on `Token`                                                          |

## Step 4 — Approvals → operators

ERC-7984 uses an **operator** model instead of ERC-20-style allowances.

**Why:** `approve` borrowed ERC-20's verb, but a confidential balance is encrypted — there's no cleartext amount to cap. What you grant is **time-boxed authority** to move your tokens, which is what the on-chain `setOperator` (ERC-7984) does.

{% tabs %}
{% tab title="Before (2.x)" %}

```ts
await token.approve("0xSpender"); // default 1h
await token.approve("0xSpender", expiry); // custom expiry
const ok = await token.isApproved("0xSpender"); // self as owner
const ok2 = await token.isApproved("0xSpender", "0xOwner");
```

```tsx
const { mutateAsync: approve } = useConfidentialApprove({ tokenAddress });
const { data: isApproved } = useConfidentialIsApproved({ tokenAddress, spender: "0xSpender" });
await approve({ spender: "0xSpender" });
```

{% endtab %}

{% tab title="After (3.x)" %}

```ts
await token.setOperator("0xOperator"); // default 1h
await token.setOperator("0xOperator", expiry); // custom expiry
const ok = await token.isOperator("0xHolder", "0xSpender");
```

```tsx
const { mutateAsync: setOperator } = useConfidentialSetOperator(tokenAddress);
const { data: isOperator } = useConfidentialIsOperator({
  address: tokenAddress,
  holder: "0xHolder",
  spender: "0xOperator",
});
await setOperator({ operator: "0xOperator" });
```

{% endtab %}
{% endtabs %}

The write side is a pure rename — v2's `token.approve()` already called the on-chain `setOperator`, so behaviour is unchanged. The read side has one trap:

{% hint style="warning" %}
**Reversed argument order.** `isApproved(spender, holder?)` became `isOperator(holder, spender)`. Both arguments are addresses, so a mechanical `isApproved(a, b)` → `isOperator(a, b)` rename compiles fine but silently swaps the two — a runtime bug with no type-checker signal.
{% endhint %}

### The hook calling convention changed for every single-token hook

This is the easiest thing to under-migrate. The 2.x `UseZamaConfig` type (`{ tokenAddress }`) was **removed**. Every single-token hook either takes the token address **positionally** as its first argument, or keeps a config object with the field renamed `tokenAddress` → `address`. Don't assume a hook is unchanged just because its name is:

| Calling convention                                              | Hooks                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positional — `useX(address, options?)`                          | `useConfidentialSetOperator`, `useConfidentialTransferFrom`, `useApproveUnderlying`, `useUnshield`, `useUnshieldAll`, `useUnwrap`, `useUnwrapAll`, `useResumeUnshield`, `useFinalizeUnwrap`, `useDelegateDecryption`, `useRevokeDelegation`, `useDecryptBalanceAs`, `useToken`, `useWrappedToken` |
| Config object — `useX({ address, … })` (was `{ tokenAddress }`) | `useShield`, `useConfidentialTransfer`, `useConfidentialBalance`, `useConfidentialBalances`, `useConfidentialIsOperator`, `useUnderlyingAllowance`, `useDelegationStatus`                                                                                                                         |

Read hooks that target a holder (`useConfidentialBalance`, `useConfidentialBalances`) now also require an explicit `account`.

### Balance reads now take the holder explicitly

The 2.x convenience of defaulting balance reads to the connected account is gone — pass the holder address:

```ts
// Before: token.balanceOf();          After: token.balanceOf(owner)
const balance = await token.balanceOf(owner);
```

The React hook config changed to match: `useConfidentialBalance({ tokenAddress })` becomes `useConfidentialBalance({ address, account })` — `address` is the token, `account` is the holder to read.

## Step 5 — Encrypt (hex) & decrypt glossary

### Encrypt returns contract-ready hex

`encrypt` results are now hex strings ready to pass straight to a contract call — no more `bytesToHex(...)`. The field `handles` is renamed `encryptedValues` (and `inputProof` is hex too), and `extractEncryptedHandles(...)` is removed — read `result.encryptedValues` directly.

{% tabs %}
{% tab title="Before (2.x)" %}

```ts
import { bytesToHex } from "viem";

const encrypted = await encrypt.mutateAsync({
  values: [{ value: 42n, type: "euint64" }],
  contractAddress,
  userAddress,
});

await sdk.signer.writeContract({
  address: contractAddress,
  abi,
  functionName: "store",
  args: [bytesToHex(encrypted.handles[0]!), bytesToHex(encrypted.inputProof)],
});
```

{% endtab %}

{% tab title="After (3.x)" %}

```ts
const encrypted = await encrypt.mutateAsync({
  values: [{ value: 42n, type: "euint64" }],
  contractAddress,
  userAddress,
});

if (!sdk.signer) throw new Error("No signer — connect a wallet to write");
await sdk.signer.writeContract({
  address: contractAddress,
  abi,
  functionName: "store",
  args: [encrypted.encryptedValues[0]!, encrypted.inputProof],
});
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
**`sdk.signer` may be `undefined` in 3.x.** In 2.x the signer was passed at construction and always present; in 3.x it is `undefined` in read-only mode (no wallet connected) — hence the `if (!sdk.signer) throw …` guard above. Prefer that over asserting `sdk.signer!`, which only hides the `undefined` until it crashes at the call site. Reads never need the signer — use `sdk.provider`.
{% endhint %}

### Decrypt glossary: `handle` → `encryptedValue`

`useUserDecrypt` was renamed `useDecryptValues`, and its argument changed: from an object `{ handles }` to a positional array of `{ encryptedValue, contractAddress }`. Result objects are keyed by `encryptedValue` (not `handle`). Reads also move from `sdk.signer.readContract` to `sdk.provider.readContract` — `sdk.provider` is always available, whereas in 2.x reads went through the signer.

{% tabs %}
{% tab title="Before (2.x)" %}

```tsx
import { useUserDecrypt } from "@zama-fhe/react-sdk";

const [handles, setHandles] = useState<{ handle: string; contractAddress: `0x${string}` }[]>([]);
const { data: decrypted } = useUserDecrypt({ handles });

const handle = (await sdk.signer.readContract({
  address,
  abi,
  functionName,
  args,
})) as string;
setHandles([{ handle, contractAddress }]);
// read result:
decrypted?.[handles[0].handle];
```

{% endtab %}

{% tab title="After (3.x)" %}

```tsx
import { useDecryptValues } from "@zama-fhe/react-sdk";

const [inputs, setInputs] = useState<{ encryptedValue: string; contractAddress: `0x${string}` }[]>(
  [],
);
// `useDecryptValues` is disabled by default — opt in with `enabled: true`.
const { data: decrypted } = useDecryptValues(inputs, { enabled: true });

const encryptedValue = (await sdk.provider.readContract({
  address,
  abi,
  functionName,
  args,
})) as string;
setInputs([{ encryptedValue, contractAddress }]);
// read result:
decrypted?.[inputs[0].encryptedValue];
```

{% endtab %}
{% endtabs %}

Public (non-permit) decryption follows the same rename: `usePublicDecrypt` → `useDecryptPublicValues`. Both are mutations, so only the hook name changes — no permit is involved since the values are already publicly decryptable. The verb now says **who** reads — `decryptValues` (you, via your permit) vs `decryptPublicValues` (everyone).

{% hint style="warning" %}
**Cache ownership changed.** `DecryptCache` and `applyDecryptedValues` were public in 2.x; in 3.x the cache is internal and invalidates automatically (on `permits.revokePermits()`, `permits.clear()`, wallet account/chain change, and disconnect). There is **no** public API to populate or evict it — remove any 2.x logic that did, as there's no compile-time signal for its loss.
{% endhint %}

### Key glossary: transport key pair & FHE encryption key

The glossary pass split two keys the old names blurred: the **transport key pair** (your locally-held decrypt keys) and the **FHE encryption key** (the network's input-encryption key). The [core symbol table](#zama-fhe-sdk-core) lists every rename — most apps touch none of them, since `createConfig`, the `Token` API, and the hooks manage keys internally.

{% hint style="info" %}
**Error codes are stable.** Only the error class names and `ZamaErrorCode` enum keys changed (`KeypairExpiredError` → `TransportKeyPairExpiredError`, enum key `KeypairExpired` → `TransportKeyPairExpired`, etc.). The string code **values** (`KEYPAIR_EXPIRED` / `INVALID_KEYPAIR`) are unchanged, so `matchZamaError` and `err.code === "KEYPAIR_EXPIRED"` checks keep working.
{% endhint %}

## Step 6 — Token / WrappedToken & upgraded contracts

* `ReadonlyToken` was the read-only base in 2.x. In 3.x the base read/transfer class is **`Token`**, and **`WrappedToken`** extends it with wrap/shield/unshield. Build them via `sdk.createToken(addr)` (read/transfer) or `sdk.createWrappedToken(addr)` — the 2.x `sdk.createReadonlyToken(addr)` is removed and `sdk.createToken(addr, wrapper?)` lost its second argument. The hook `useReadonlyToken` → `useWrappedToken`.
* The wrapper/registry contracts were upgraded in 3.0. If you read registry results, check the new `isValid` flag before using a wrapper:

```ts
const registryResult = await sdk.registry.getConfidentialToken(tokenAddress);
if (!registryResult || !registryResult.isValid) {
  throw new Error("No valid confidential wrapper registered");
}
const { confidentialTokenAddress } = registryResult;
```

* Unwrap events/results now carry a new optional `unwrapRequestId` field. If you decode unwrap events directly: `decodeUnwrappedFinalized` → `decodeUnwrapFinalized` (and `UnwrappedFinalizedEvent` → `UnwrapFinalizedEvent`), and the "started" decoder/event (`decodeUnwrappedStarted` / `UnwrappedStartedEvent`) were **removed**. If you only use `unshield`/`unshieldAll`/`useUnshield`, no change is needed.
* If you call `Token.finalizeUnwrap` directly (an escape hatch — most apps use `unshield`), its argument changed from `burnAmountHandle` to `unwrapRequestId: EncryptedValue` (the id returned by the request phase).
* If you read decoded transfer events directly, the field `ConfidentialTransferEvent.encryptedAmountHandle` was renamed `encryptedAmount` (part of the `handle` → `encryptedValue` glossary shift, Step 5).
* If you hardcoded `ERC7984_WRAPPER_INTERFACE_ID`, its value changed; import the constant instead of inlining it.

## Step 7 — Removed with no replacement

* **Activity feed** is gone: `useActivityFeed`, `parseActivityFeed`, `ActivityItem`, `ActivityAmount`, `ActivityType`, `activityFeedQueryOptions`, `deriveActivityFeedLogsKey`. It was a prebuilt transaction-history view — and what that history shows and how it's grouped is your app's call, not the SDK's. You keep every building block: decode events with `decodeOnChainEvent` and reveal amounts with `decryptValues` / `decryptPublicValues`, or read from your own indexer.
* Utility exports `totalSupplyContract`, `matchAclRevert`, `sortByBlockNumber` are removed.

## Validation checklist

After applying the steps:

1. Run your type-checker (`pnpm typecheck`, `tsc --noEmit`, …) — the SDK is strongly typed; most missed renames surface here.
2. Search your codebase for leftover 2.x symbols:

   ```bash
   rg -n 'ZamaSDKConfig|ViemSigner|EthersSigner|WagmiSigner|RelayerWeb|RelayerNode|SepoliaConfig|MainnetConfig|HardhatConfig|\.chainId\b|ReadonlyToken|useReadonlyToken|createReadonlyToken|useConfidentialApprove|useConfidentialIsApproved|token\.approve\(|token\.isApproved\(|\.handles\b|bytesToHex\(encrypted\.(handles|inputProof)|useActivityFeed|parseActivityFeed|CredentialsManager|extractEncryptedHandles|applyDecryptedValues|DecryptCache|useUserDecrypt|useDelegatedUserDecrypt|usePublicDecrypt|usePublicKey|usePublicParams|useAllow|useIsAllowed|useGenerateKeypair|useCreateEIP712|useRevokeSession|decodeUnwrapped(Finalized|Started)|encryptedAmountHandle|keypairTTL|KeypairType|KeypairExpiredError|InvalidKeypairError|StoredKeypair|PublicKeyData|ZERO_HANDLE|isZeroHandle|UserDecryptParams|PublicDecryptResult|DelegatedUserDecryptParams|DecryptHandle|\.getPublicKey\(|\.generateKeypair\(|\.warmKeypair\(|tokenAddress|\.balanceOf\(\)'
   ```

   A few atoms can still produce hits that don't need migrating — inspect rather than blind-replace: `.chainId` is legitimate on viem/EIP-1193 objects (only chain-preset accesses like `SepoliaConfig.chainId` migrate to `.id`), `token.approve(` only matters for the Zama confidential token (approving an underlying ERC-20 before a manual `wrap` is unchanged), and `tokenAddress` appears in plenty of your own variable names — only the hook config field migrates to `address`.
3. Verify the SDK is built once via `createConfig` and `<ZamaProvider>` / `new ZamaSDK` receive its result.
4. Run a smoke flow (shield → transfer → unshield, or encrypt → store → decrypt) against a local `cleartext()` chain first, then a testnet.
5. Hitting a renamed error class (`TransportKeyPairExpiredError`, …) or the now-nullable `sdk.signer`? See [Handle errors](/protocol/sdk/guides/handle-errors.md).

## Next steps

* [Configuration](/protocol/sdk/guides/configuration.md)
* [Operator approvals](/protocol/sdk/guides/operator-approvals.md)
* [Encrypt & decrypt](/protocol/sdk/guides/encrypt-decrypt.md)
* [Delegated decryption](/protocol/sdk/guides/delegated-decryption.md)
* [Handle errors](/protocol/sdk/guides/handle-errors.md)
* [Permit model](/protocol/sdk/concepts/permit-model.md)

## Help center

Stuck on the migration, or spotted a step or rename this guide is missing? **Open an issue** in the [SDK repository](https://github.com/zama-ai/sdk/issues) — migration gaps are useful feedback. For general questions, ask the community:

* [Community forum](https://community.zama.org/c/zama-protocol/15)
* [Discord channel](https://discord.com/invite/zama)



# Configuration

The SDK uses `createConfig` to wire together chains, relayers, a provider, an optional signer, and storage into a single configuration object. This guide walks through each piece.

## Steps

### 1. Pick your chains

Import pre-configured chain objects from `@zama-fhe/sdk/chains`. Each chain includes contract addresses, relayer URLs, and chain IDs.

```ts
import { sepolia, mainnet, hoodi } from "@zama-fhe/sdk/chains";
```

| Chain          | Chain ID   | Description             |
| -------------- | ---------- | ----------------------- |
| `mainnet`      | `1`        | Ethereum Mainnet        |
| `sepolia`      | `11155111` | Sepolia Testnet         |
| `hoodi`        | `560048`   | Hoodi Testnet           |
| `ingenTestnet` | `364301`   | InGen Testnet           |
| `bscTestnet`   | `97`       | BNB Smart Chain Testnet |
| `hardhat`      | `31337`    | Local Hardhat node      |

`anvil` is also exported as an alias for `hardhat` (both target chain ID `31337`), for Foundry users.

### 2. Pick a relayer

Relayers tell the SDK how to run FHE operations on each chain.

| Relayer       | Environment | Description                                  |
| ------------- | ----------- | -------------------------------------------- |
| `web()`       | Browser     | Runs WASM in a Web Worker via CDN            |
| `node()`      | Node.js     | Uses native worker threads                   |
| `cleartext()` | Local dev   | No FHE infrastructure — cleartext operations |

```ts
import { cleartext } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { node } from "@zama-fhe/sdk/node";
```

Chain-specific data (`relayerUrl`, `network`, `executorAddress`, etc.) comes from the chain preset. The relayer factory only accepts pool/worker options.

```ts
// Browser — uses relayerUrl from the chain preset
web();

// Node.js — pool options only; chain data comes from the preset
node({ poolSize: 4 });

// Local dev — no KMS, no gateway; executorAddress comes from the chain preset
cleartext();
```

If you need to override a chain field (e.g. proxy relayer requests through your backend), spread the preset in the `chains` array:

```ts
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;
```

### 3. Set up chain access

The SDK separates read access (provider) from wallet authority (signer). The provider handles contract reads and receipt polling. The signer handles signing and write transactions. Both are created automatically by `createConfig` — you pass your Web3 library's native objects.

{% tabs %}
{% tab title="wagmi (React)" %}

```tsx
// createConfig from @zama-fhe/react-sdk/wagmi accepts your wagmiConfig directly — see step 4 below.
```

{% endtab %}

{% tab title="viem" %}

```ts
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://sepolia.infura.io/v3/YOUR_KEY"),
});
const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});
```

{% endtab %}

{% tab title="ethers" %}

```ts
// Browser — pass the raw EIP-1193 provider
// createConfig({ ..., ethereum: window.ethereum! })

// Node.js — pass an ethers Signer (provider is extracted automatically)
// const provider = new ethers.JsonRpcProvider(rpcUrl);
// createConfig({ ..., signer: new ethers.Wallet(privateKey, provider) })
```

{% endtab %}
{% endtabs %}

For full type information, see the [ViemProvider](/protocol/sdk/api-references/sdk/viemprovider.md) / [ViemSigner](/protocol/sdk/api-references/sdk/viemsigner.md) and [EthersProvider](/protocol/sdk/api-references/sdk/ethersprovider.md) / [EthersSigner](/protocol/sdk/api-references/sdk/etherssigner.md) reference pages. You can also implement [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) and [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) for a custom integration.

### 4. Create the config

`createConfig` takes your chains, relayers, and signer adapter and returns a config object.

{% tabs %}
{% tab title="React + wagmi" %}

```tsx
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia, mainnet, type FheChain } from "@zama-fhe/sdk/chains";

// Override relayerUrl to proxy through your backend
const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;
const myMainnet = {
  ...mainnet,
  relayerUrl: "https://your-app.com/api/relayer/1",
} as const satisfies FheChain;

const zamaConfig = createZamaConfig({
  chains: [mySepolia, myMainnet],
  wagmiConfig,
  relayers: {
    [mySepolia.id]: web(),
    [myMainnet.id]: web(),
  },
});
```

{% endtab %}

{% tab title="Browser (viem)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, mainnet, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;
const myMainnet = {
  ...mainnet,
  relayerUrl: "https://your-app.com/api/relayer/1",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia, myMainnet],
  publicClient,
  walletClient,
  relayers: {
    [mySepolia.id]: web(),
    [myMainnet.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="Browser (ethers)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/ethers";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  ethereum: window.ethereum!,
  relayers: {
    [mySepolia.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="Node.js" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="Custom signer/provider" %}
When the built-in adapters don't fit your setup — for example, a server-side relayer that implements `GenericSigner` directly — use the generic `createConfig` from `@zama-fhe/sdk`:

```ts
import { createConfig, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  signer: myCustomSigner, // implements GenericSigner
  provider: myCustomProvider, // implements GenericProvider
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

See [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) and [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) for the interfaces your adapter must implement.
{% endtab %}

{% tab title="Web Extensions" %}
MV3 Chrome extensions can use `chromeSessionStorage` as `permitStorage` so permits survive service worker restarts:

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK, indexedDBStorage, chromeSessionStorage } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: indexedDBStorage,
  permitStorage: chromeSessionStorage,
  relayers: {
    [mySepolia.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

Your `manifest.json` must include the `"storage"` permission. See the [Web Extensions guide](/protocol/sdk/guides/web-extensions.md) for manifest configuration, multi-context sharing, and browser close behavior.
{% endtab %}
{% endtabs %}

Browser apps should proxy relayer requests through a backend to keep the API key secret. See the [Authentication guide](/protocol/sdk/guides/authentication.md) for the full setup.

### 5. (Optional) Configure TTLs and event listener

You can tune how long the transport key pair and permits remain valid, and subscribe to lifecycle events for debugging:

```ts
const config = createConfig({
  chains: [sepolia],
  wagmiConfig,
  relayers: { [sepolia.id]: web() },
  transportKeyPairTTL: 604800, // 7 days in seconds (default: 2592000 = 30 days)
  permitTTL: 7, // 7 days (default: 30 days)
  onEvent: ({ type, tokenAddress, ...rest }) => {
    console.debug(`[zama] ${type}`, rest);
  },
});
```

When done with the SDK, call `sdk.terminate()` to clean up the Web Worker or thread pool.

### 6. (Optional) Choose a storage backend

The transport key pair is cached so users don't get a wallet popup on every decrypt. By default, `createConfig` picks the right storage for your environment. Override with the `storage` field if needed:

| Storage             | When to use                                               |
| ------------------- | --------------------------------------------------------- |
| `indexedDBStorage`  | Browser apps — persists across reloads and sessions       |
| `memoryStorage`     | Tests, scripts, throwaway sessions                        |
| `asyncLocalStorage` | Node.js servers — isolates transport key pair per request |

```ts
import { indexedDBStorage, memoryStorage } from "@zama-fhe/sdk";
// Node.js per-request isolation:
// import { asyncLocalStorage } from "@zama-fhe/sdk/node";
```

For full storage options see the [GenericStorage](/protocol/sdk/api-references/sdk/genericstorage.md) reference.

### 7. (Optional) Supply a logger

The SDK is **silent by default** — it emits no console output of its own. Operation failures always surface through the rejected promise or typed error, never as a stray `console.error`. To observe internal diagnostics, pass a `logger` to `createConfig`:

```ts
const config = createConfig({
  chains: [sepolia],
  wagmiConfig,
  relayers: { [sepolia.id]: web() },
  logger: console, // or a pino / winston / OpenTelemetry DiagLogger instance
});
```

The `logger` is a minimal four-level interface — `error`, `warn`, `info`, `debug` — that `console` and common logging libraries satisfy directly, so no adapter is needed. The SDK never bundles a logging library or imposes a format; level filtering is left to your logger. Levels follow these conventions:

| Level   | What the SDK emits                                                                           |
| ------- | -------------------------------------------------------------------------------------------- |
| `error` | Unexpected internal failures only — never failures already surfaced via a rejection          |
| `warn`  | Recoverable or degraded conditions (a fallback path, a retry, a swallowed best-effort write) |
| `info`  | Reserved for coarse lifecycle milestones; not currently emitted                              |
| `debug` | Verbose diagnostics — worker lifecycle, request timing, orchestration progress               |

The logger is configured once here and flows SDK-wide — including into worker request tracing, the credential store, and the artifact cache. There is deliberately no per-relayer logger option; `createConfig({ logger })` is the single source of truth.

## Shared relayer options

When multiple chains use the same relayer, create it once and reference that single instance from each chain:

```ts
import { sepolia, mainnet, type FheChain } from "@zama-fhe/sdk/chains";

const sharedWeb = web({ threads: 8 });

const mySepolia = { ...sepolia, relayerUrl: "/api/relayer/11155111" } as const satisfies FheChain;
const myMainnet = { ...mainnet, relayerUrl: "/api/relayer/1" } as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia, myMainnet],
  publicClient,
  walletClient,
  relayers: {
    [mySepolia.id]: sharedWeb,
    [myMainnet.id]: sharedWeb,
  },
});
```

Chains that reference the *same* relayer object — the result of a single `web()` call — share one worker, reducing memory usage.

## Next steps

* [Authentication](/protocol/sdk/guides/authentication.md) — set up a backend proxy or use a direct API key
* [Shield Tokens](/protocol/sdk/guides/shield-tokens.md) — convert public ERC-20 tokens into confidential form
* [Chain Objects](/protocol/sdk/api-references/sdk/network-presets.md) — pre-configured chain definitions for Sepolia, Mainnet, and more
* [GenericStorage reference](/protocol/sdk/api-references/sdk/genericstorage.md) — custom storage implementations



# Authentication

The relayer requires an API key for every request. This guide covers the two authentication strategies: proxying through your backend (recommended for browser apps) and passing the key directly (suitable for server-side apps).

{% hint style="info" %}
Don't have an API key yet? See [Relayer API keys](/protocol/sdk/guides/relayer-api-keys.md) for how to apply for a Zama-hosted Relayer key (or self-host instead).
{% endhint %}

## Steps

### 1. Understand the two options

| Strategy           | Use when                                       | API key location                                   |
| ------------------ | ---------------------------------------------- | -------------------------------------------------- |
| **Backend proxy**  | Browser apps, dApps                            | Server-side only — never sent to the client        |
| **Direct API key** | Node.js scripts, backend services, prototyping | Passed in the `auth` field of the transport config |

Browser apps should always use a proxy. Embedding the API key in client-side code exposes it to anyone inspecting network traffic or your bundle.

Server-side apps (Node.js scripts, backend services) can safely use a direct API key since the code runs in a trusted environment where secrets are not exposed to end users.

### 2. Set up a backend proxy

Create an endpoint that forwards relayer requests and injects the API key. Store your credentials in environment variables:

```bash
RELAYER_API_KEY=your-api-key
```

Here is a minimal Express proxy:

```ts
import express from "express";
import { mainnet, sepolia } from "@zama-fhe/sdk/chains";

const app = express();
app.use(express.json());

// Map chain IDs to their network config
const Configs: Record<number, typeof mainnet> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
};

app.use("/api/relayer/:chainId", async (req, res) => {
  const config = Configs[Number(req.params.chainId)];
  if (!config) {
    res.status(400).send("Unsupported chain");
    return;
  }

  const url = new URL(req.url, config.relayerUrl);
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body);

  const response = await fetch(url, {
    method: req.method,
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.RELAYER_API_KEY!,
    },
    body,
    // @ts-expect-error: required by the relayer
    duplex: "half",
  });

  res.status(response.status).send(await response.text());
});

app.listen(3001);
```

The proxy adds the `x-api-key` header to every forwarded request. Your frontend never sees the key.

You can adapt this pattern to any server framework (Fastify, Hono, Next.js API routes, etc.). The key requirements are:

* Forward the HTTP method, path, and body to the upstream relayer URL
* Inject the `x-api-key` header before forwarding
* Return the upstream response status and body to the client

### 3. Configure the SDK to use your proxy

Point the `relayerUrl` at your backend endpoint instead of the relayer directly:

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { mainnet, sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const myMainnet = {
  ...mainnet,
  relayerUrl: "https://your-app.com/api/relayer/1",
  network: "https://mainnet.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;

const config = createConfig({
  chains: [myMainnet, mySepolia],
  publicClient,
  walletClient,
  storage,
  relayers: {
    [myMainnet.id]: web(),
    [mySepolia.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

No `auth` field is needed on the client side — the proxy handles authentication transparently. The SDK sends requests to your proxy URL, and your proxy appends the API key before forwarding to the relayer.

### 4. (Alternative) Use a direct API key for server-side apps

When the SDK runs in a trusted environment (Node.js script, backend service), you can pass the API key directly on the chain definition:

```ts
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
  auth: { __type: "ApiKeyHeader" as const, value: process.env.RELAYER_API_KEY! },
} as const satisfies FheChain;
```

Then pass `mySepolia` to `createConfig` — the `auth` field is picked up automatically by the relayer. See the [Node.js backend guide](/protocol/sdk/guides/node-js-backend.md) for a complete example.

The `auth` field supports multiple methods depending on how your relayer is configured.

### 5. Auth methods reference

The `auth` field accepts three formats. **Which one to use depends on where your relayer lives** — the transport has to match what your relayer (or the auth layer in front of it) expects.

| Method         | How it's sent                   | Use it when                                                                                                              |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ApiKeyHeader` | `x-api-key: key` header         | **Zama-hosted relayer** — required; it only accepts the key in the `x-api-key` header. Also the default for most setups. |
| `ApiKeyCookie` | `x-api-key=key` cookie          | **Behind your own proxy** — authenticate the SDK→proxy hop with a cookie; your proxy then injects `x-api-key` upstream.  |
| `BearerToken`  | `Authorization: Bearer <token>` | **Self-hosted relayer** — only if your own auth layer expects a bearer token.                                            |

{% hint style="warning" %}
Against the **Zama-hosted relayer**, only `ApiKeyHeader` works — requests without the `x-api-key` header are rejected. `BearerToken` and `ApiKeyCookie` are for self-hosted relayers or proxied setups where you control the auth layer.
{% endhint %}

```ts
// Zama-hosted relayer — API key in the x-api-key header (required)
auth: { __type: "ApiKeyHeader", value: "your-api-key" }

// Behind your own proxy — credential carried as a cookie to your proxy
auth: { __type: "ApiKeyCookie", value: "your-api-key" }

// Self-hosted relayer — only if your auth layer expects a bearer token
auth: { __type: "BearerToken", token: "your-token" }
```

When using `RelayerWeb` with a proxy, you can also add CSRF protection via the `security.getCsrfToken` callback. See the [RelayerWeb reference](/protocol/sdk/api-references/sdk/relayerweb.md) for details.

## Next steps

* [Configuration](/protocol/sdk/guides/configuration.md) — full relayer, signer, and storage setup
* [Shield Tokens](/protocol/sdk/guides/shield-tokens.md) — start converting public tokens to confidential form
* [RelayerWeb reference](/protocol/sdk/api-references/sdk/relayerweb.md) — security options and multi-threading
* [RelayerNode reference](/protocol/sdk/api-references/sdk/relayernode.md) — `node()` transport factory



# Relayer API keys

The Relayer API key provides secure access to Zama's hosted Relayer service on mainnet. This guide explains how to obtain and use your API key.

## Overview

There are two options to access the FHEVM Relayer for mainnet deployment:

**Self-hosted Relayer:** Deploy and operate your own Relayer instance, fund your own gateway wallet, and handle transactions independently. See the [Self-host Relayer](https://github.com/zama-ai/fhevm/blob/main/relayer/docs/SELF_HOSTING.md) documentation for set-up guides and configuration references.

**Zama-hosted Relayer:** Connect to Zama's hosted Relayer using an API key for authentication. Transaction fees will be billed on a monthly basis according to the usage, with possible discounts and grants applied directly in the invoice.

Start by submitting the form below, the Zama team will review your request and contact you with next steps.

→ [Apply for an API key](https://forms.gle/jq84zEek1oiv3kBz9)

{% hint style="warning" %}
Before publishing your solution on mainnet, ensure that end-to-end integration has been successfully tested on testnet.
{% endhint %}

## Using your API key

Once you receive your API key, wire it into the SDK using one of the two strategies covered in the [Authentication guide](/protocol/sdk/guides/authentication.md):

* **Backend proxy** (recommended for browser apps) — the proxy injects the `x-api-key` header so the key never reaches the client.
* **Direct API key** (server-side apps only) — pass the key in the relayer transport's `auth` field as `{ __type: "ApiKeyHeader", value: ... }`.

For the Zama-hosted relayer, `ApiKeyHeader` is the supported `auth` method — the hosted endpoint accepts the key only in the `x-api-key` header. (`BearerToken` and `ApiKeyCookie` apply to self-hosted relayers or proxied setups.)

The Authentication guide includes copy-paste examples for both, an Express proxy reference implementation, and the full table of supported `auth` methods.

## Security best practices

Your API key grants access to Zama's hosted Relayer with sponsored operations. Follow these security guidelines to protect your key:

### Keep your key private

* **Never expose your API key in client-side code** (frontend applications, mobile apps, etc.)
* **Never commit your API key** to version control systems
* **Never share your API key** with unauthorized parties

### Secure implementation

The recommended approach depends on your application architecture:

* **In-browser applications**: Proxy all Relayer requests through your backend server so the API key remains server-side and never reaches the client.
* **Server-side applications**: Store the API key in environment variables and load it securely at runtime.

### Backend proxy pattern

The proxy must add the `x-api-key` header to every forwarded request, so the key stays server-side and your frontend never sees it. See the [Authentication guide](/protocol/sdk/guides/authentication.md) for a working Express proxy and the matching client-side `relayerUrl` configuration — the patterns there apply unchanged when the upstream is the Zama-hosted Relayer.

## Compromised keys

If you suspect your API key has been compromised:

1. **Immediately notify the Zama team** through <support@zama.org>.
2. **Request a new API key** from the Zama team
3. **Stop using the compromised key** in your applications

If Zama identifies that an API key has been compromised, the key holder will be notified immediately and the key may be suspended to prevent unauthorized usage.

## Next steps

* [Authentication](/protocol/sdk/guides/authentication.md) — wire your API key into the SDK via a backend proxy or direct `auth` field
* [Configuration](/protocol/sdk/guides/configuration.md) — full relayer, signer, and storage setup



# Shield tokens

Shielding converts public ERC-20 tokens into confidential tokens. The SDK handles the ERC-20 approval and the shield transaction in a single call via `wrappedToken.shield()`. In React, use the `useShield` hook.

## Shielding paths

`WrappedToken.shield()` exposes a single API but routes through one of two on-chain paths depending on the underlying ERC-20:

| Path               | Triggered when                                | Wallet prompts | Notes                                                                                 |
| ------------------ | --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `transferAndCall`  | Underlying ERC-20 implements ERC-1363         | 1              | The wrapper's `onTransferReceived` mints the confidential balance in one transaction. |
| `approve` + `wrap` | Underlying ERC-20 does not implement ERC-1363 | 2              | An ERC-20 `approve` followed by a `wrap` call on the wrapper.                         |

The SDK detects ERC-1363 support automatically via ERC-165 `supportsInterface` against the underlying token. **You don't need to choose a path or detect ERC-1363 yourself** — `wrappedToken.shield(amount)` routes correctly for any wrapper. `approvalStrategy` only applies to the `approve` + `wrap` path; on the `transferAndCall` path there is no allowance step.

### Which path will my token take?

Among the wrapped tokens registered on Ethereum mainnet today, the routing is:

| Confidential wrapper | Underlying | Shield path                   |
| -------------------- | ---------- | ----------------------------- |
| cTGBP                | tGBP       | `transferAndCall` (single tx) |
| cZAMA                | ZAMA       | `transferAndCall` (single tx) |
| cUSDC                | USDC       | `approve` + `wrap` (two txs)  |
| cUSDT                | USDT       | `approve` + `wrap` (two txs)  |
| cWETH                | WETH       | `approve` + `wrap` (two txs)  |
| cBRON                | BRON       | `approve` + `wrap` (two txs)  |

ERC-1363 is a conditional optimisation, not a recommended new default — only a small subset of tokens implement it today. Tokens that don't (USDC, USDT, DAI, and most existing ERC-20s) continue to use `approve` + `wrap`. Any newly deployed wrapper picks up the `transferAndCall` path automatically if its underlying ERC-20 implements ERC-1363 — no opt-in is required from your code. See the [`WrappersRegistry` reference](/protocol/sdk/api-references/sdk/wrappersregistry.md) for how to look up the wrapper for a given ERC-20.

## Steps

### 1. Create a wrapped-token instance

Start from a configured SDK instance (see [Configuration](/protocol/sdk/guides/configuration.md)) and create a `WrappedToken` pointing at your confidential wrapper contract. The wrapper *is* the confidential token: `createWrappedToken(addr)` takes a single address — the wrapper's own address.

If you only have the underlying ERC-20 address, the built-in registry resolves the matching wrapper.

{% tabs %}
{% tab title="Core SDK" %}

```ts
const wrappedToken = sdk.createWrappedToken("0xWrapperAddress");
```

{% endtab %}

{% tab title="Resolve wrapper via registry" %}

```ts
// The registry resolves the confidential wrapper for any registered ERC-20.
// On Mainnet, Sepolia, and Hoodi the registry address is built-in.
const result = await sdk.registry.getConfidentialToken("0xUnderlyingERC20");
if (!result) throw new Error("No wrapper registered for this token");

const wrappedToken = sdk.createWrappedToken(result.confidentialTokenAddress);
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useWrappedToken } from "@zama-fhe/react-sdk";

const wrappedToken = useWrappedToken("0xWrapperAddress");
```

{% endtab %}
{% endtabs %}

### 2. Shield with exact approval (default)

The SDK always validates the ERC-20 balance before submitting. If the balance is insufficient, it throws `InsufficientERC20BalanceError` with `requested`, `available`, and `token` properties -- no transaction is sent. This is a public read with no signing requirement, so it works for all wallet types including smart wallets.

By default, `shield` approves the exact amount before wrapping. This is the safest option — it limits exposure if the contract is compromised:

{% tabs %}
{% tab title="Core SDK" %}

```ts
const { txHash } = await wrappedToken.shield(1000n);
console.log("Shield tx:", txHash);
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useShield } from "@zama-fhe/react-sdk";

const { mutateAsync: shield, isPending } = useShield({
  address: "0xWrapperAddress",
});

const { txHash } = await shield({ amount: 1000n });
```

{% endtab %}
{% endtabs %}

On the `approve` + `wrap` path, the SDK sends two transactions: an ERC-20 `approve` for 1000 tokens, followed by the shield (wrap) call. The user sees two wallet prompts. On the `transferAndCall` path (ERC-1363 underlyings), shielding completes in a single transaction and `approvalStrategy` doesn't apply — see [Shielding paths](#shielding-paths) for details.

### 3. Shield with max approval

`approvalStrategy` only affects the `approve` + `wrap` path; on `transferAndCall` it's ignored. To avoid a separate approval transaction every time on `approve` + `wrap` tokens, pass `approvalStrategy: "max"`. This grants an unlimited allowance on the first shield, and subsequent shields skip the approval step:

{% tabs %}
{% tab title="Core SDK" %}

```ts
// First call: approve(MAX_UINT256) + shield — two wallet prompts
await wrappedToken.shield(1000n, { approvalStrategy: "max" });

// Second call: only the shield tx — one wallet prompt
await wrappedToken.shield(500n, { approvalStrategy: "max" });
```

{% endtab %}

{% tab title="React" %}

```tsx
await shield({ amount: 1000n, approvalStrategy: "max" });
```

{% endtab %}
{% endtabs %}

### 4. Shield with skip approval

If the user has already approved the wrapper contract (for example, through a separate UI flow), you can skip the approval check entirely:

{% tabs %}
{% tab title="Core SDK" %}

```ts
await wrappedToken.shield(1000n, { approvalStrategy: "skip" });
```

{% endtab %}

{% tab title="React" %}

```tsx
await shield({ amount: 1000n, approvalStrategy: "skip" });
```

{% endtab %}
{% endtabs %}

This sends only the shield transaction. If the allowance is insufficient, the transaction reverts on-chain.

### 5. Track the transaction

Both the core SDK and React hooks resolve to a `TransactionResult` with the transaction `txHash` and its mined `receipt`. Use them to wait for confirmation or show progress in your UI:

{% tabs %}
{% tab title="Core SDK" %}

```ts
const { txHash } = await wrappedToken.shield(1000n);

// Wait for confirmation using your provider
const receipt = await sdk.provider.waitForTransactionReceipt(txHash);
console.log("Confirmed in block:", receipt.blockNumber);
```

{% endtab %}

{% tab title="React" %}

```tsx
const {
  mutateAsync: shield,
  isPending,
  isSuccess,
} = useShield({
  address: "0xWrapperAddress",
});

// isPending is true while the transaction is in flight
// isSuccess flips to true when the mutation completes
// Balance caches are automatically invalidated on success
const { txHash } = await shield({ amount: 1000n });
```

{% endtab %}
{% endtabs %}

In React, balance caches are automatically invalidated after a successful shield. The `useConfidentialBalance` hook will pick up the new balance on its next poll cycle.

## Next steps

* [Transfer Privately](/protocol/sdk/guides/transfer-privately.md) — send confidential tokens to another address
* [WrappedToken.shield reference](/protocol/sdk/api-references/sdk/wrappedtoken.md#shield) — full API signature and options
* [useShield reference](/protocol/sdk/api-references/react/useshield.md) — React hook details



# Transfer privately

Confidential transfers encrypt the amount before it reaches the chain -- no one can see how much was sent. The SDK handles FHE encryption internally via `token.confidentialTransfer()`. In React, use the `useConfidentialTransfer` and `useConfidentialTransferFrom` hooks.

## Steps

### 1. Create a token instance

Start from a configured SDK instance (see [Configuration](/protocol/sdk/guides/configuration.md)) and create a token pointing at your encrypted ERC-20 contract:

{% tabs %}
{% tab title="Core SDK" %}

```ts
const token = sdk.createToken("0xEncryptedERC20Address");
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useToken } from "@zama-fhe/react-sdk";

const token = useToken("0xEncryptedERC20Address");
```

{% endtab %}
{% endtabs %}

### 2. Send a confidential transfer

Pass the recipient address and the plaintext amount. The SDK encrypts the amount using FHE before submitting the transaction.

By default, the SDK validates the confidential balance before submitting. If stored permits exist, it decrypts silently. If the balance is insufficient, it throws `InsufficientConfidentialBalanceError` before any transaction is sent. Pass `skipBalanceCheck: true` to bypass (e.g. for smart wallets that cannot produce EIP-712 signatures).

{% tabs %}
{% tab title="Core SDK" %}

```ts
const { txHash } = await token.confidentialTransfer("0xRecipientAddress", 500n);
console.log("Transfer tx:", txHash);
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";

const { mutateAsync: transfer, isPending } = useConfidentialTransfer({
  address: "0xEncryptedERC20Address",
});

const { txHash } = await transfer({
  to: "0xRecipientAddress",
  amount: 500n,
});
```

{% endtab %}
{% endtabs %}

The user sees a single wallet prompt. The encrypted amount is included in the transaction calldata -- it is unreadable to anyone without the FHE decryption key.

### 3. Send as an operator (transferFrom)

If an owner has approved you as an operator (via `token.setOperator()`), you can transfer on their behalf using `confidentialTransferFrom`:

{% tabs %}
{% tab title="Core SDK" %}

```ts
const { txHash } = await token.confidentialTransferFrom(
  "0xOwnerAddress",
  "0xRecipientAddress",
  500n,
);
```

{% endtab %}

{% tab title="React" %}

```tsx
import { useConfidentialTransferFrom } from "@zama-fhe/react-sdk";

const { mutateAsync: transferFrom } = useConfidentialTransferFrom("0xEncryptedERC20Address");

await transferFrom({
  from: "0xOwnerAddress",
  to: "0xRecipientAddress",
  amount: 500n,
});
```

{% endtab %}
{% endtabs %}

The operator must have been approved beforehand. Check approval status with `token.isOperator("0xHolder", "0xOperator")` or the `useConfidentialIsOperator` hook.

### 4. Handle the transaction result

Both the core SDK and React hooks resolve to a `TransactionResult` with the transaction `txHash` and its mined `receipt`. Use them to confirm the transaction or update your UI:

{% tabs %}
{% tab title="Core SDK" %}

```ts
const { txHash } = await token.confidentialTransfer("0xRecipient", 500n);

// Wait for on-chain confirmation
const receipt = await sdk.provider.waitForTransactionReceipt(txHash);
console.log("Confirmed in block:", receipt.blockNumber);

// Optionally check updated balance
const [address] = await walletClient.getAddresses();
const balance = await token.balanceOf(address);
console.log("New balance:", balance);
```

{% endtab %}

{% tab title="React" %}

```tsx
const {
  mutateAsync: transfer,
  isPending, // true while the transaction is in flight
  isSuccess, // true after the mutation completes
  error, // populated if the transfer fails
} = useConfidentialTransfer({
  address: "0xEncryptedERC20Address",
});

// Balance caches are invalidated automatically on success.
// The useConfidentialBalance hook picks up the updated balance
// on its next poll cycle — no manual refresh needed.
```

{% endtab %}
{% endtabs %}

### 5. (React) Use the transfer hook in a component

Here is a complete component that wires up the transfer with loading and error states:

```tsx
import { useConfidentialBalance, useConfidentialTransfer } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { matchZamaError } from "@zama-fhe/sdk";

const TOKEN = "0xEncryptedERC20Address";

function TransferForm() {
  const { address } = useAccount();
  const { data: balance } = useConfidentialBalance({ address: TOKEN, account: address });
  const {
    mutateAsync: transfer,
    isPending,
    error,
  } = useConfidentialTransfer({
    address: TOKEN,
  });

  const handleTransfer = async () => {
    await transfer({ to: "0xRecipient", amount: 100n });
  };

  const errorMessage = error
    ? matchZamaError(error, {
        SIGNING_REJECTED: () => "Transaction cancelled.",
        ENCRYPTION_FAILED: () => "Encryption failed — please retry.",
        TRANSACTION_REVERTED: () => "Transfer reverted — check your balance.",
        _: () => "Something went wrong.",
      })
    : null;

  return (
    <div>
      <p>Balance: {balance?.toString() ?? "Loading..."}</p>
      <button disabled={isPending} onClick={handleTransfer}>
        {isPending ? "Sending..." : "Send 100 tokens"}
      </button>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}
```

The `matchZamaError` helper maps SDK error codes to user-friendly messages. See the [Error Handling guide](/protocol/sdk/guides/handle-errors.md) for the full list of error types.

## Next steps

* [Shield Tokens](/protocol/sdk/guides/shield-tokens.md) — convert public ERC-20 tokens into confidential form
* [Token.confidentialTransfer reference](/protocol/sdk/api-references/sdk/token.md#confidentialtransfer) — full API signature
* [useConfidentialTransfer reference](/protocol/sdk/api-references/react/useconfidentialtransfer.md) — React hook details
* [useConfidentialTransferFrom reference](/protocol/sdk/api-references/react/useconfidentialtransferfrom.md) — operator transfer hook


# Unshield tokens

Unshielding converts encrypted tokens back into standard ERC-20 tokens that are visible on-chain. The process involves two on-chain steps (unwrap and finalize), but the SDK handles both in a single call.

## Steps

### 1. Unshield a specific amount

Call `wrappedToken.unshield()` with the amount you want to convert back to public tokens. The SDK submits the unwrap transaction, waits for the decryption proof, and then submits the finalize transaction.

By default, the SDK validates the confidential balance before submitting. If the balance is insufficient, it throws `InsufficientConfidentialBalanceError` before any transaction is sent. Pass `skipBalanceCheck: true` to bypass (e.g. for smart wallets that cannot produce EIP-712 signatures).

{% tabs %}
{% tab title="SDK" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  storage,
  relayers: { [sepolia.id]: web() },
});
const sdk = new ZamaSDK(config);
const wrappedToken = sdk.createWrappedToken("0xWrappedEncryptedERC20");

const { txHash, receipt } = await wrappedToken.unshield(500n);
```

{% endtab %}
{% endtabs %}

The returned `txHash` is the finalize transaction hash. The `receipt` confirms on-chain completion.

### 2. Track progress with callbacks

Because unshielding involves two transactions with a waiting period in between, you can provide callbacks to keep your UI in sync with each phase.

{% tabs %}
{% tab title="SDK" %}

```ts
await wrappedToken.unshield(500n, {
  onUnwrapSubmitted: (txHash) => {
    updateUI("Unwrap submitted...");
  },
  onFinalizing: () => {
    updateUI("Waiting for decryption proof...");
  },
  onFinalizeSubmitted: (txHash) => {
    updateUI("Unshield complete!");
  },
});
```

{% endtab %}
{% endtabs %}

Callbacks are safe to use -- if one throws, the unshield still completes. The typical timeline is:

1. **`onUnwrapSubmitted`** -- fires when the first transaction is mined.
2. **`onFinalizing`** -- fires while the SDK polls for the decryption proof (this can take several seconds).
3. **`onFinalizeSubmitted`** -- fires when the second transaction is mined and the tokens are public again.

### 3. Unshield your entire balance

If you want to convert all confidential tokens back to public, use `unshieldAll()`. It reads the current encrypted balance and unshields the full amount directly, without decrypting it first.

{% tabs %}
{% tab title="SDK" %}

```ts
await wrappedToken.unshieldAll();
```

{% endtab %}
{% endtabs %}

`unshieldAll()` accepts the same callback options as `unshield()`.

### 4. Handle interrupted unshields

If the user closes their browser between the unwrap and finalize steps, the unwrap is on-chain but the finalize has not happened yet. You can detect and resume this state on the next page load.

{% tabs %}
{% tab title="SDK" %}

```ts
import { savePendingUnshield, loadPendingUnshield, clearPendingUnshield } from "@zama-fhe/sdk";

// Before finalization, persist the unwrap tx hash
await savePendingUnshield(storage, wrapperAddress, unwrapTxHash);

// On next page load, check for pending unshields
const pending = await loadPendingUnshield(storage, wrapperAddress);
if (pending) {
  await wrappedToken.resumeUnshield(pending);
  await clearPendingUnshield(storage, wrapperAddress);
}
```

{% endtab %}
{% endtabs %}

The flow is:

1. **`savePendingUnshield`** -- write the unwrap transaction hash to storage before the finalize step. The SDK does not do this automatically.
2. **`loadPendingUnshield`** -- on mount, check if there is an incomplete unshield.
3. **`resumeUnshield`** -- pick up where the SDK left off by polling for the proof and submitting the finalize transaction.
4. **`clearPendingUnshield`** -- clean up storage once finalization is confirmed.

### 5. Use unshield hooks in React

The React SDK provides hooks that wrap the above operations with React Query mutation semantics.

{% tabs %}
{% tab title="useUnshield" %}

```tsx
import { useUnshield } from "@zama-fhe/react-sdk";

const { mutateAsync: unshield, isPending } = useUnshield("0xWrapper");

await unshield({
  amount: 500n,
  onUnwrapSubmitted: (txHash) => console.log("Step 1:", txHash),
  onFinalizing: () => console.log("Waiting for proof..."),
  onFinalizeSubmitted: (txHash) => console.log("Done:", txHash),
});
```

{% endtab %}

{% tab title="useUnshieldAll" %}

```tsx
import { useUnshieldAll } from "@zama-fhe/react-sdk";

const { mutateAsync: unshieldAll } = useUnshieldAll("0xWrapper");

await unshieldAll();
```

{% endtab %}

{% tab title="useResumeUnshield" %}

```tsx
import { useResumeUnshield } from "@zama-fhe/react-sdk";
import { loadPendingUnshield, clearPendingUnshield } from "@zama-fhe/sdk";

const WRAPPER = "0xWrapper";
const { mutateAsync: resumeUnshield } = useResumeUnshield(WRAPPER);

// On mount
const pending = await loadPendingUnshield(storage, WRAPPER);
if (pending) {
  await resumeUnshield({ unwrapTxHash: pending });
  await clearPendingUnshield(storage, WRAPPER);
}
```

{% endtab %}
{% endtabs %}

All mutation hooks automatically invalidate balance queries on success, so your UI stays in sync without manual cache management.

## Next steps

* See [WrappedToken](/protocol/sdk/api-references/sdk/wrappedtoken.md) for the full `WrappedToken.unshield` and `WrappedToken.unshieldAll` API.
* See [Hooks](/protocol/sdk/api-references/react/query-keys.md) for `useUnshield`, `useUnshieldAll`, and `useResumeUnshield` details.
* If your unshield fails, see [Handle Errors](/protocol/sdk/guides/handle-errors.md) for troubleshooting `TransactionRevertedError` and related issues.



# Check balances

Confidential balances are stored on-chain as encrypted values. To display a human-readable number, the SDK decrypts them using FHE permits tied to the user's wallet. This guide walks through reading balances, understanding the caching layer, and working with multiple tokens.

## Steps

### 1. Read your own balance

Call `balanceOf()` on a [`Token`](/protocol/sdk/api-references/sdk/token.md) instance. The SDK fetches the encrypted value from the chain, decrypts it, and returns a `bigint`.

{% tabs %}
{% tab title="SDK" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  storage,
  relayers: { [sepolia.id]: web() },
});
const sdk = new ZamaSDK(config);
const token = sdk.createToken("0xEncryptedERC20");

const [address] = await walletClient.getAddresses();
const balance = await token.balanceOf(address);
console.log(`Confidential balance: ${balance}`);
```

{% endtab %}
{% endtabs %}

### 2. Understand the first-time wallet signature

The first `balanceOf(address)` call for a token prompts the user's wallet for an EIP-712 signature. This creates FHE decrypt permits that are cached in your storage backend. Subsequent reads are silent -- no wallet popup.

{% hint style="info" %}
**In React apps, don't trigger this signature on render.** Gate `useConfidentialBalance` behind `useHasPermit` and let the user click an explicit "Decrypt" button. See [Avoid blind-sign wallet popups](/protocol/sdk/guides/encrypt-decrypt.md#gating-useconfidentialbalance) for the full pattern.
{% endhint %}

If the user rejects the signature, the SDK throws a `SigningRejectedError`. See [Handle Errors](/protocol/sdk/guides/handle-errors.md) for recovery patterns.

You can pre-authorize multiple tokens with a single signature using `sdk.permits.grantPermit()`:

{% tabs %}
{% tab title="SDK" %}

```ts
await sdk.permits.grantPermit(["0xTokenA", "0xTokenB"]);

const tokenA = sdk.createToken("0xTokenA");
const tokenB = sdk.createToken("0xTokenB");
// All subsequent balanceOf() calls are silent
```

{% endtab %}
{% endtabs %}

### 3. Balance caching

Decrypted balances are automatically cached in your storage backend (IndexedDB, async local storage, etc.). This means:

* **No spinner on page reload** -- if a balance was previously decrypted, it is returned instantly from cache instead of re-running the 2-5 second FHE decryption.
* **Automatic invalidation** -- the cache key includes the on-chain encrypted value, so when a transfer, shield, or unshield changes the balance, the old cache entry is naturally bypassed.
* **Best-effort** -- cache reads and writes never throw. If storage is unavailable, the SDK falls back to a fresh decryption silently.

The cache is keyed by `token address + owner address + encrypted value`.

### 4. Work with raw encrypted values

Sometimes you need the encrypted value itself, for example to check whether a balance exists before attempting decryption.

{% tabs %}
{% tab title="SDK" %}

```ts
import { isEncryptedValueZero } from "@zama-fhe/sdk";

const encryptedValue = await token.confidentialBalanceOf(userAddress);

// Check if the encrypted value is zero (account has never shielded)
if (isEncryptedValueZero(encryptedValue)) {
  console.log("No confidential balance yet");
}

// Decrypt an encrypted value you already have
const result = await sdk.decryption.decryptValues([
  { encryptedValue, contractAddress: token.address },
]);
const value = result[encryptedValue] as bigint;

// Decrypt multiple encrypted values at once (must include the contract address per entry)
const decrypted = await sdk.decryption.decryptValues(
  [value1, value2, value3].map((v) => ({ encryptedValue: v, contractAddress: token.address })),
);
```

{% endtab %}
{% endtabs %}

### 5. Distinguish "no balance" from "zero balance"

These are different situations that your UI should handle separately:

* **`NoCiphertextError`** -- the account has never shielded tokens. There is no encrypted balance to decrypt. Show something like "No confidential balance" in your UI.
* **Balance of `0n`** -- the account has shielded before but currently holds zero. Show "Balance: 0".

{% tabs %}
{% tab title="SDK" %}

```ts
import { NoCiphertextError } from "@zama-fhe/sdk";

try {
  const [address] = await walletClient.getAddresses();
  const balance = await token.balanceOf(address);
  showBalance(balance); // could be 0n
} catch (error) {
  if (error instanceof NoCiphertextError) {
    showEmptyState("Shield tokens to get started");
  }
}
```

{% endtab %}
{% endtabs %}

### 6. Batch decrypt across multiple tokens

When your app manages a portfolio of confidential tokens, use batch operations to minimize wallet prompts and parallelize decryption.

{% tabs %}
{% tab title="SDK" %}

```ts
import { Token } from "@zama-fhe/sdk";

// One wallet signature covers all tokens
await sdk.permits.grantPermit(addresses);

const tokens = addresses.map((a) => sdk.createToken(a));

// Decrypt all balances in parallel
const { results, errors } = await Token.batchBalancesOf(tokens, userAddress);

// `results` is Map<Address, bigint> for tokens that decrypted successfully,
// `errors` is Map<Address, ZamaError> for tokens that failed — partial failure
// never rejects the whole batch.
for (const [address, balance] of results) {
  console.log(address, balance);
}
```

{% endtab %}
{% endtabs %}

### 7. Read token metadata

Before displaying balances, you typically want the token's name, symbol, and decimals. Use the `useMetadata` hook:

```tsx
import { useMetadata } from "@zama-fhe/react-sdk";

const { data: meta } = useMetadata("0xToken");

// meta.name, meta.symbol, meta.decimals
```

See [useMetadata reference](/protocol/sdk/api-references/react/usemetadata.md) for full options.

### 8. Use the balance hooks in React

The React SDK provides hooks that handle polling, caching, and React Query integration out of the box.

{% tabs %}
{% tab title="Single token" %}

```tsx
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

const { address } = useAccount();
const {
  data: balance,
  isLoading,
  error,
} = useConfidentialBalance(
  {
    address: "0xToken",
    account: address,
  },
  { refetchInterval: 5_000 },
);
```

{% endtab %}

{% tab title="Multiple tokens" %}

```tsx
import { useConfidentialBalances } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

const { address } = useAccount();
const { data } = useConfidentialBalances({
  addresses: ["0xTokenA", "0xTokenB", "0xTokenC"],
  account: address,
});

const tokenABalance = data?.results.get("0xTokenA");
```

{% endtab %}
{% endtabs %}

`useConfidentialBalance` calls `token.balanceOf(owner)` which reads the on-chain encrypted value and decrypts via the SDK. Cached clear values are served instantly — the relayer is only hit when the encrypted value changes. Pass `refetchInterval` to poll for updates. Clear values are persisted in storage, so page reloads show the balance instantly.

### 9. Force a manual refresh

Mutations automatically invalidate balance caches, but if you need manual control (for example, after an external contract interaction), use `zamaQueryKeys`:

{% tabs %}
{% tab title="React" %}

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { zamaQueryKeys } from "@zama-fhe/sdk/query";

const queryClient = useQueryClient();

// Invalidate all balance queries
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.all,
});

// Invalidate one token
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.token("0xToken"),
});
```

{% endtab %}
{% endtabs %}

## Next steps

* See [Avoid blind-sign wallet popups](/protocol/sdk/guides/encrypt-decrypt.md#gating-useconfidentialbalance) to gate balance queries behind explicit user action.
* See [Token Operations](/protocol/sdk/api-references/sdk/token.md) for the full `Token` API.
* See [Hooks](/protocol/sdk/api-references/react/query-keys.md) for `useConfidentialBalance`, `useConfidentialBalances`, and query key details.
* To handle `NoCiphertextError` and other failures, see [Handle Errors](/protocol/sdk/guides/handle-errors.md).



# Handle errors

All errors thrown by `@zama-fhe/sdk` and `@zama-fhe/react-sdk` extend `ZamaError` and carry a `.code` string for programmatic matching. This guide covers how to catch them, route them to user-friendly messages, and troubleshoot common problems.

## Steps

### 1. Understand the error hierarchy

Every SDK error is an instance of `ZamaError`, which extends the native `Error` class. Each subclass has a unique `.code` property:

| Error                                   | Code                                  | What happened                                                                            |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `SigningRejectedError`                  | `SIGNING_REJECTED`                    | User rejected the wallet signature                                                       |
| `SigningFailedError`                    | `SIGNING_FAILED`                      | Wallet signature failed (connectivity or firmware issue)                                 |
| `EncryptionFailedError`                 | `ENCRYPTION_FAILED`                   | FHE encryption failed in the Web Worker                                                  |
| `DecryptionFailedError`                 | `DECRYPTION_FAILED`                   | FHE decryption failed                                                                    |
| `TransactionRevertedError`              | `TRANSACTION_REVERTED`                | On-chain transaction reverted (includes failed ERC-20 approvals during shield)           |
| `InvalidTransportKeyPairError`          | `INVALID_KEYPAIR`                     | Relayer rejected transport key pair (stale or malformed)                                 |
| `TransportKeyPairExpiredError`          | `KEYPAIR_EXPIRED`                     | Transport key pair expired -- user needs to re-sign                                      |
| `NoCiphertextError`                     | `NO_CIPHERTEXT`                       | No encrypted balance exists for this account                                             |
| `RelayerRequestFailedError`             | `RELAYER_REQUEST_FAILED`              | Relayer HTTP request failed (check `.statusCode`)                                        |
| `ConfigurationError`                    | `CONFIGURATION`                       | Invalid SDK config or FHE worker failed to initialize                                    |
| `InsufficientConfidentialBalanceError`  | `INSUFFICIENT_CONFIDENTIAL_BALANCE`   | Confidential balance too low for transfer or unshield                                    |
| `InsufficientERC20BalanceError`         | `INSUFFICIENT_ERC20_BALANCE`          | ERC-20 balance too low for shield                                                        |
| `BalanceCheckUnavailableError`          | `BALANCE_CHECK_UNAVAILABLE`           | Balance check impossible (no stored permits)                                             |
| `ERC20ReadFailedError`                  | `ERC20_READ_FAILED`                   | Public ERC-20 read failed (network or contract error)                                    |
| `DelegationSelfNotAllowedError`         | `DELEGATION_SELF_NOT_ALLOWED`         | Delegation cannot target self                                                            |
| `DelegationCooldownError`               | `DELEGATION_COOLDOWN`                 | Only one delegate/revoke per tuple per block                                             |
| `DelegationNotFoundError`               | `DELEGATION_NOT_FOUND`                | No active delegation for this tuple                                                      |
| `SignerRequiredError`                   | `SIGNER_REQUIRED`                     | Write/sign/decrypt called without a signer                                               |
| `DelegationExpiredError`                | `DELEGATION_EXPIRED`                  | The delegation has expired                                                               |
| `SignerNotConfiguredError`              | `SIGNER_NOT_CONFIGURED`               | SDK operation needs a signer but none is configured (subclass of `SignerRequiredError`)  |
| `WalletNotConnectedError`               | `WALLET_NOT_CONNECTED`                | Signer exists but has no connected wallet account (subclass of `SignerRequiredError`)    |
| `WalletAccountNotReadyError`            | `WALLET_ACCOUNT_NOT_READY`            | Async signer adapter hasn't resolved its account yet (subclass of `SignerRequiredError`) |
| `ChainMismatchError`                    | `CHAIN_MISMATCH`                      | Signer and provider are on different chains                                              |
| `DelegationContractIsSelfError`         | `DELEGATION_CONTRACT_IS_SELF`         | Delegation contract address equals the caller                                            |
| `DelegationDelegateEqualsContractError` | `DELEGATION_DELEGATE_EQUALS_CONTRACT` | Delegate equals the contract address                                                     |
| `DelegationExpirationTooSoonError`      | `DELEGATION_EXPIRATION_TOO_SOON`      | Expiration date less than 1 hour in the future                                           |
| `DelegationExpiryUnchangedError`        | `DELEGATION_EXPIRY_UNCHANGED`         | New expiry matches the current value                                                     |
| `DelegationNotPropagatedError`          | `DELEGATION_NOT_PROPAGATED`           | Delegation exists on L1 but hasn't synced to the gateway yet                             |
| `AclPausedError`                        | `ACL_PAUSED`                          | The ACL contract is paused                                                               |

### 2. Catch with instanceof

Use standard `try/catch` with `instanceof` to handle specific error types:

{% tabs %}
{% tab title="SDK" %}

```ts
import { ZamaError, SigningRejectedError, EncryptionFailedError } from "@zama-fhe/sdk";

try {
  await token.confidentialTransfer(to, amount);
} catch (error) {
  if (error instanceof SigningRejectedError) {
    // User clicked "Reject" in their wallet
  } else if (error instanceof EncryptionFailedError) {
    // FHE encryption failed
  } else if (error instanceof ZamaError) {
    // Some other SDK error -- check error.code
  } else {
    // Not an SDK error
  }
}
```

{% endtab %}
{% endtabs %}

Always check the most specific types first and fall back to `ZamaError` last.

### 3. Use matchZamaError for cleaner code

Instead of `instanceof` chains, use `matchZamaError` to route errors by code:

{% tabs %}
{% tab title="SDK" %}

```ts
import { matchZamaError } from "@zama-fhe/sdk";

matchZamaError(error, {
  SIGNING_REJECTED: () => toast("Please approve the transaction"),
  ENCRYPTION_FAILED: () => toast("Encryption failed -- please retry"),
  TRANSACTION_REVERTED: (e) => toast(`Transaction failed: ${e.message}`),
  INSUFFICIENT_CONFIDENTIAL_BALANCE: () => toast("Insufficient confidential balance"),
  INSUFFICIENT_ERC20_BALANCE: () => toast("Not enough tokens to shield"),
  BALANCE_CHECK_UNAVAILABLE: () => toast("Sign to verify your balance first"),
  ERC20_READ_FAILED: () => toast("Could not read token balance -- check your connection"),
  _: () => toast("Something went wrong"),
});
```

{% endtab %}
{% endtabs %}

The `_` wildcard catches any `ZamaError` not explicitly handled. If the error is not a `ZamaError` at all (and no `_` is provided), `matchZamaError` returns `undefined`.

Each handler receives the error typed as the base `ZamaError`, so `.code` and `.message` are available but subclass-specific fields are not. To read fields like `InsufficientConfidentialBalanceError.available` or `RelayerRequestFailedError.statusCode`, narrow with `instanceof` (step 2) inside the handler.

### 4. Handle specific errors

Here is a quick reference for the most common errors and how to respond:

| Error                                  | Recommended action                                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `SigningRejectedError`                 | Show a retry prompt. The user needs to approve the wallet signature.                                                                    |
| `SigningFailedError`                   | Check wallet connectivity. Hardware wallets may need a firmware update.                                                                 |
| `EncryptionFailedError`                | Check your CSP headers -- the Web Worker needs `wasm-unsafe-eval`.                                                                      |
| `DecryptionFailedError`                | May indicate an interrupted unshield. Check for pending state with `loadPendingUnshield()`.                                             |
| `TransactionRevertedError`             | Inspect the revert reason. Common causes: insufficient balance, expired approval.                                                       |
| `InvalidTransportKeyPairError`         | The transport key pair is stale. Clear credentials and prompt for a fresh signature.                                                    |
| `TransportKeyPairExpiredError`         | Same as above -- the transport key pair TTL has elapsed.                                                                                |
| `NoCiphertextError`                    | Not an error per se. The account has never shielded. Show an empty state in your UI.                                                    |
| `RelayerRequestFailedError`            | Verify `relayerUrl` in your config. If using API key auth, check the `auth` option. Inspect `.statusCode`.                              |
| `ConfigurationError`                   | Invalid SDK configuration or FHE worker failed to initialize. Check your transport config and CSP headers.                              |
| `InsufficientConfidentialBalanceError` | Show the user their balance and the shortfall. The operation needs more confidential tokens.                                            |
| `InsufficientERC20BalanceError`        | Show the user their public token balance. They need more tokens before shielding.                                                       |
| `BalanceCheckUnavailableError`         | Call `sdk.permits.grantPermit([token.address])` to sign permits, or pass `skipBalanceCheck: true` to bypass (useful for smart wallets). |
| `ERC20ReadFailedError`                 | Check network connectivity and RPC endpoint. Retry the shield operation.                                                                |
| `SignerRequiredError`                  | Connect a wallet. The operation requires a signer but the SDK was configured without one.                                               |
| `DelegationSelfNotAllowedError`        | Cannot delegate to yourself. Use a different delegate address.                                                                          |
| `DelegationCooldownError`              | Wait for the next block before retrying delegate/revoke on the same tuple.                                                              |
| `DelegationNotFoundError`              | No active delegation exists. Verify the delegator, delegate, and contract addresses.                                                    |
| `DelegationExpiredError`               | The delegation has expired. Create a new delegation.                                                                                    |
| `SignerNotConfiguredError`             | The SDK was built without a signer. Pass one to `createConfig`, or connect a wallet.                                                    |
| `WalletNotConnectedError`              | A signer exists but no wallet account is connected. Prompt the user to connect.                                                         |
| `WalletAccountNotReadyError`           | The wallet adapter is still resolving its account. Wait for the connection to settle, then retry.                                       |
| `ChainMismatchError`                   | The wallet is on a different chain than the operation targets. Prompt the user to switch networks.                                      |

### 5. Distinguish "no balance" from "zero balance"

This is a common source of confusion. They require different UI treatments:

{% tabs %}
{% tab title="SDK" %}

```ts
import { NoCiphertextError } from "@zama-fhe/sdk";

try {
  const balance = await token.balanceOf(address);
  // balance could be 0n -- that means "zero balance"
  showBalance(balance);
} catch (error) {
  if (error instanceof NoCiphertextError) {
    // No encrypted balance exists -- "no balance"
    showEmptyState("Shield tokens to get started");
  }
}
```

{% endtab %}
{% endtabs %}

See [Check Balances](/protocol/sdk/guides/check-balances.md) for more detail on balance handling patterns.

### 6. Use matchZamaError in React components

The `matchZamaError` helper works the same way in React. Here is a reusable error component:

{% tabs %}
{% tab title="React" %}

```tsx
import { matchZamaError } from "@zama-fhe/sdk";

function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;

  const message = matchZamaError(error, {
    SIGNING_REJECTED: () => "Transaction cancelled -- please approve in your wallet.",
    ENCRYPTION_FAILED: () => "Encryption failed -- please try again.",
    TRANSACTION_REVERTED: () => "Transaction failed on-chain -- check your balance.",
    _: () => "Something went wrong.",
  });

  return <p className="error">{message ?? error.message}</p>;
}
```

{% endtab %}
{% endtabs %}

When `matchZamaError` returns `undefined` (because the error is not a `ZamaError`), the component falls back to `error.message`.

### 7. Common problems troubleshooting

| What you see                              | Why                                         | Fix                                                                                                 |
| ----------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `SigningRejectedError` on every decrypt   | Wallet rejected the EIP-712 signature       | Make sure the wallet supports `eth_signTypedData_v4`. Some hardware wallets need a firmware update. |
| Balance always `undefined`                | Encrypted value is zero (never shielded)    | Check if the user has shielded tokens first. Catch `NoCiphertextError`.                             |
| `ConfigurationError` on first operation   | FHE worker failed to initialize             | Check your CSP headers -- the worker needs `wasm-unsafe-eval`. Check transport config.              |
| `EncryptionFailedError`                   | FHE encryption failed during an operation   | Check your CSP headers -- the worker needs `wasm-unsafe-eval`.                                      |
| `DecryptionFailedError` after page reload | Unshield was interrupted                    | Use `loadPendingUnshield()` on mount to detect and `resumeUnshield()` to complete it.               |
| `TransactionRevertedError` on finalize    | Unwrap already finalized or tx hash invalid | Check the unwrap tx. If already finalized, clear the pending state with `clearPendingUnshield()`.   |
| `RelayerRequestFailedError`               | Relayer URL wrong or auth missing           | Verify `relayerUrl` in your transport config. If using API key auth, check the `auth` option.       |

## Next steps

* See [Error types reference](/protocol/sdk/api-references/sdk/errors.md) for the full error type reference.
* See [Hooks](/protocol/sdk/api-references/react/query-keys.md) for error handling patterns with React Query.
* For interrupted unshields specifically, see [Unshield Tokens](/protocol/sdk/guides/unshield-tokens.md).


# Node.js backend

The SDK works in Node.js with the same API as in the browser. The main differences are the relayer (native worker threads instead of Web Workers) and storage isolation for concurrent requests.

## Steps

### 1. Install packages

```bash
npm install @zama-fhe/sdk viem
```

### 2. Create the config with a `node()` relayer

The `node()` relayer uses native `worker_threads` for FHE operations. Pass `poolSize` to control parallelism (default: `min(CPU cores, 4)`).

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia as sepoliaViem } from "viem/chains";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({ chain: sepoliaViem, transport: http() });
const walletClient = createWalletClient({
  account,
  chain: sepoliaViem,
  transport: http(),
});

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
  auth: { __type: "ApiKeyHeader" as const, value: process.env.RELAYER_API_KEY! },
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

### 3. Choose a storage backend

For scripts and single-user CLIs, `memoryStorage` is the simplest option (shown above).

For servers handling multiple users concurrently, use `asyncLocalStorage` instead — see the next step.

### 4. Isolate per-request state with `asyncLocalStorage`

On a server where each HTTP request belongs to a different user, you need per-request transport key pair isolation. `asyncLocalStorage` wraps Node.js [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html) to scope storage to the current async context.

```ts
import { asyncLocalStorage } from "@zama-fhe/sdk/node";
import express from "express";

const app = express();

app.post("/api/transfer", (req, res) => {
  asyncLocalStorage.run(async () => {
    // Everything inside this callback has its own isolated storage
    const config = createConfig({
      chains: [mySepolia],
      publicClient,
      walletClient,
      storage: asyncLocalStorage,
      relayers: {
        [mySepolia.id]: node(),
      },
    });
    const sdk = new ZamaSDK(config);
    const token = sdk.createToken("0xTokenAddress");
    await token.confidentialTransfer("0xRecipient", 100n);
    res.json({ ok: true });
  });
});
```

Each call to `asyncLocalStorage.run()` creates a fresh storage scope. Concurrent requests never share transport key pair state.

### 5. Create tokens and operate

The token API is identical to the browser SDK:

```ts
const wrappedToken = sdk.createWrappedToken("0xWrappedEncryptedERC20");

// Shield public tokens into their encrypted form
await wrappedToken.shield(1000n);

// Transfer confidentially
await wrappedToken.confidentialTransfer("0xRecipient", 500n);

// Decrypt a balance
const balance = await wrappedToken.balanceOf(account.address);
```

See the [Token Operations](/protocol/sdk/api-references/sdk/token.md) reference for the full API.

### 6. Use direct API key auth

In a server environment, you can authenticate with the relayer directly — there is no browser to leak the key to. Pass `auth` on the chain definition:

```ts
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
  auth: { __type: "ApiKeyHeader" as const, value: process.env.RELAYER_API_KEY! },
} as const satisfies FheChain;
```

The `auth` field supports three modes. For the **Zama-hosted relayer, use `ApiKeyHeader`** — it's the only mode the hosted endpoint accepts. `BearerToken` and `ApiKeyCookie` are for self-hosted relayers or proxied setups where you control the auth layer (see the [Authentication guide](/protocol/sdk/guides/authentication.md)).

| Mode           | Shape                                            | Use it when                                  |
| -------------- | ------------------------------------------------ | -------------------------------------------- |
| API key header | `{ __type: "ApiKeyHeader", value: "your-key" }`  | Zama-hosted relayer (required), or default   |
| API key cookie | `{ __type: "ApiKeyCookie", value: "your-key" }`  | Behind your own proxy (SDK→proxy hop)        |
| Bearer token   | `{ __type: "BearerToken", token: "your-token" }` | Self-hosted relayer with a bearer auth layer |

### 7. Clean up on shutdown

Terminate the worker pool when your process exits:

```ts
process.on("SIGTERM", () => {
  sdk.terminate();
});
```

### 8. (Optional) Use a custom signer

If you are using a transaction relayer (e.g. OpenZeppelin Defender) instead of a local wallet, implement the [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) and [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) interfaces and use the generic `createConfig` from `@zama-fhe/sdk`:

```ts
import { createConfig, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
  auth: { __type: "ApiKeyHeader" as const, value: process.env.RELAYER_API_KEY! },
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  signer: myRelayerSigner, // GenericSigner backed by your relayer
  provider: myRpcProvider, // GenericProvider backed by an RPC client
  storage: memoryStorage,
  relayers: {
    [mySepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

The signer handles `signTypedData` and `writeContract`; the provider handles `readContract`, `waitForTransactionReceipt`, `getChainId`, and `getBlockTimestamp`. See [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) for the full interface.

## Next steps

* [RelayerNode](/protocol/sdk/api-references/sdk/relayernode.md) -- `node()` transport factory options
* [asyncLocalStorage](/protocol/sdk/api-references/sdk/genericstorage.md) -- the `GenericStorage` interface it implements
* [Configuration](/protocol/sdk/guides/configuration.md) -- chains, relayers, authentication, and permit management
* [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) -- custom signer interface for non-standard wallet integrations


# Web extensions

MV3 Chrome extensions present a unique challenge: the background service worker can be terminated by Chrome at any time. When that happens, anything stored in JavaScript memory is lost -- including the SDK's default in-memory permit storage. This guide shows how to keep permits alive across service worker restarts.

## Steps

### 1. Understand the problem

In a normal web page, the SDK defaults to persistent IndexedDB storage for signed permits. But an MV3 service worker has no `window`, so the SDK falls back to an in-memory store — and the service worker can shut down after 30 seconds of inactivity, taking those permits with it.

When the service worker restarts, the in-memory permits are gone. The user would need to re-sign with their wallet on every interaction -- a broken experience.

### 2. Use `chromeSessionStorage` for permit persistence

The SDK ships a `chromeSessionStorage` adapter that stores signed permits in `chrome.storage.session` instead of in-memory. This API is backed by Chrome's own persistence layer, not your JavaScript heap.

```ts
import { ZamaSDK, indexedDBStorage, chromeSessionStorage } from "@zama-fhe/sdk";
```

### 3. Configure the SDK with both storage backends

Pass `indexedDBStorage` for the transport key pair (persistent, survives browser close) and `chromeSessionStorage` for permits (ephemeral, survives service worker restarts):

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: indexedDBStorage, // encrypted transport key pair — persistent
  permitStorage: chromeSessionStorage, // signed permits — ephemeral
  relayers: { [mySepolia.id]: web() },
});
const sdk = new ZamaSDK(config);
```

{% tabs %}
{% tab title="manifest.json" %}

```json
{
  "manifest_version": 3,
  "permissions": ["storage"],
  "background": {
    "service_worker": "background.js"
  }
}
```

{% endtab %}
{% endtabs %}

The `"storage"` permission is required for `chrome.storage.session` access.

### 4. Benefits of this setup

With `chromeSessionStorage` in place, you get three things:

**Popup, background, and content script sharing** -- all extension contexts read from the same `chrome.storage.session` store. The user signs once in the popup, and the background script can decrypt balances without another prompt.

**Service worker restart survival** -- `chrome.storage.session` is not tied to JavaScript memory. When Chrome terminates and restarts the service worker, signed permits are still available.

**Automatic cleanup on browser close** -- Chrome purges `chrome.storage.session` when the browser closes. The user starts fresh on the next launch, which matches the expected security behavior for wallet-signed permits.

### 5. Browser close behavior

When the user closes Chrome entirely:

1. `chrome.storage.session` is cleared by the browser -- signed permits are gone
2. `indexedDB` persists -- the transport key pair survives
3. On next launch, the user re-signs once to create fresh permits for their existing transport key pair

Unlike a normal web page (which defaults to persistent IndexedDB), a service worker would otherwise fall back to in-memory permits lost on restart; `chromeSessionStorage` keeps them alive across service worker restarts within the same browser session.

## Next steps

* [GenericStorage](/protocol/sdk/api-references/sdk/genericstorage.md) -- implement a custom storage adapter for other extension APIs
* [Permit Model](/protocol/sdk/concepts/permit-model.md) -- how the transport key pair vault, signed permits, and storage interact



# Local development

The SDK ships a `cleartext()` relayer factory that creates a cleartext relayer, replacing FHE operations with cleartext operations. Values are stored as plaintext on-chain — no KMS, no gateway, no WASM. Use it for local Hardhat nodes, custom testnets, or any chain where you deploy FHEVM contracts in cleartext mode.

The `cleartext()` relayer factory implements the same `RelayerSDK` interface as `web()` and `node()`, so the rest of your code stays unchanged.

{% hint style="warning" %}
Cleartext mode is blocked on Ethereum Mainnet (chain 1) and Sepolia (chain 11155111). It is intended for development and testing only.
{% endhint %}

## SDK setup

### 1. Install packages

```bash
npm install @zama-fhe/sdk viem
```

### 2. Use the `cleartext()` relayer with `createConfig`

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { cleartext, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { hardhat } from "@zama-fhe/sdk/chains";
```

### 3. Create the config with a Hardhat chain

For a local Hardhat network, use the built-in `hardhat` chain object:

```ts
const config = createConfig({
  chains: [{ ...hardhat, executorAddress: "0xYourExecutorAddress" }],
  publicClient,
  walletClient,
  storage: memoryStorage,
  relayers: {
    [hardhat.id]: cleartext(),
  },
});

const sdk = new ZamaSDK(config);
```

The `executorAddress` is the deployed `CleartextFHEVMExecutor` contract address from your Hardhat setup. It must be set on the chain definition — `cleartext()` picks it up automatically.

### 4. Use the SDK normally

The wrapper API works the same as in production setups:

```ts
const wrappedToken = sdk.createWrappedToken("0xWrappedEncryptedERC20");
await wrappedToken.shield(1000n);
const [address] = await walletClient.getAddresses();
const balance = await wrappedToken.balanceOf(address);
```

### 5. (Optional) Create a custom config for your own chain

If you deploy FHEVM contracts on a custom chain or at different addresses than the default ones, pass all required fields to the chain definition used with the `cleartext()` relayer factory:

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { cleartext, ZamaSDK } from "@zama-fhe/sdk";
import type { FheChain } from "@zama-fhe/sdk/chains";

const myHardhat = {
  id: 12345,
  network: "http://localhost:8545",
  gatewayChainId: 10901,
  aclContractAddress: "0x...",
  kmsContractAddress: "0x...",
  inputVerifierContractAddress: "0x...",
  verifyingContractAddressDecryption: "0x...",
  verifyingContractAddressInputVerification: "0x...",
  executorAddress: "0x...",
  registryAddress: undefined,
  relayerUrl: "",
} as const satisfies FheChain;

const config = createConfig({
  chains: [myHardhat],
  publicClient,
  walletClient,
  relayers: {
    [myHardhat.id]: cleartext(),
  },
});

const sdk = new ZamaSDK(config);
```

**Where to find these addresses:**

| Field                                       | Source                                            |
| ------------------------------------------- | ------------------------------------------------- |
| `aclContractAddress`                        | Deployed ACL contract address                     |
| `executorAddress`                           | Deployed CleartextFHEVMExecutor contract address  |
| `verifyingContractAddressDecryption`        | Decryption contract on the gateway chain          |
| `verifyingContractAddressInputVerification` | InputVerification contract on the gateway chain   |
| `gatewayChainId`                            | The chain ID where gateway contracts are deployed |

{% hint style="info" %}
Usually, you want to use the same `gatewayChainId` and verifying contract addresses as the Hardhat defaults. You can also provide optional `kmsSignerPrivateKey` and `inputSignerPrivateKey` fields for custom EIP-712 verification signers.
{% endhint %}

## Next steps

* [RelayerCleartext reference](/protocol/sdk/api-references/sdk/relayercleartext.md) — the cleartext relayer and its chain-definition fields
* [Configuration](/protocol/sdk/guides/configuration.md) — production setup with `web()` or `node()` relayer factories
* [Chain Objects](/protocol/sdk/api-references/sdk/network-presets.md) — pre-configured chain definitions for Mainnet, Sepolia, and more



# Next.js SSR

The SDK relies on browser APIs -- Web Workers, IndexedDB, and WebAssembly -- that are not available during server-side rendering. This guide covers the patterns you need to keep FHE operations on the client while still using Next.js App Router and SSR layouts.

## Steps

### 1. Understand the constraint

The FHE relayer runs encryption and decryption inside a Web Worker backed by a WASM binary. IndexedDB stores encrypted transport key pairs. None of these APIs exist in Node.js or during SSR.

This means:

* You cannot import `RelayerWeb`, `ZamaProvider`, or any SDK hook in a Server Component
* You cannot create the relayer or signer at module level in a file that runs on the server

### 2. Mark SDK components with `"use client"`

Any component that imports from `@zama-fhe/react-sdk` must be a Client Component:

```tsx
"use client";

import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

export function TokenBalance({ tokenAddress }: { tokenAddress: string }) {
  const { address } = useAccount();
  const { data: balance, isLoading } = useConfidentialBalance({
    address: tokenAddress,
    account: address,
  });

  if (isLoading) return <span>Loading...</span>;
  return <span>{balance?.toString()}</span>;
}
```

### 3. Place `ZamaProvider` inside a client component

Create a dedicated client component that sets up the SDK providers. This keeps the relayer and signer initialization off the server.

```tsx
// app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: { [sepolia.id]: http() },
});

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "/api/relayer/11155111",
} as const satisfies FheChain;

const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>{children}</ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 4. Use the provider in your layout

The root layout is a Server Component by default. Import the client `Providers` wrapper and nest your pages inside it:

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

The layout file itself does not need `"use client"` -- it only imports a component that is already marked as a Client Component.

### 5. Avoid creating SDK objects in server components

A common mistake is initializing the relayer or signer in a shared module that gets imported by both server and client code:

```ts
// lib/sdk.ts — DO NOT do this
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";

// This runs during SSR and crashes — Web Worker is not available
export const config = createConfig({ ... });
```

Instead, keep all SDK initialization inside a `"use client"` file (like the `Providers` component above), or gate it behind a dynamic import:

```ts
// lib/sdk.ts — safe alternative
export async function getConfig() {
  const { web } = await import("@zama-fhe/sdk");
  const { createConfig } = await import("@zama-fhe/sdk/viem");
  return createConfig({ ... });
}
```

### 6. Example: page with a confidential balance

Putting it all together -- a Next.js page that displays a confidential token balance:

```tsx
// app/portfolio/page.tsx (Server Component — no SDK imports here)
import { TokenBalance } from "@/components/token-balance";

export default function PortfolioPage() {
  return (
    <div>
      <h1>My Portfolio</h1>
      <TokenBalance tokenAddress="0xEncryptedERC20" />
    </div>
  );
}
```

```tsx
// components/token-balance.tsx (Client Component)
"use client";

import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

export function TokenBalance({ tokenAddress }: { tokenAddress: string }) {
  const { address } = useAccount();
  const { data: balance, isLoading } = useConfidentialBalance({
    address: tokenAddress,
    account: address,
  });

  if (isLoading) return <span>Decrypting...</span>;
  return <span>{balance?.toString()}</span>;
}
```

The server renders the page shell, and the `TokenBalance` client component hydrates on the browser where FHE APIs are available.

## Next steps

* [ZamaProvider](/protocol/sdk/api-references/react/zamaprovider.md) -- all provider props and configuration
* [useConfidentialBalance](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- balance hook API reference
* [Provider Setup](/protocol/sdk/guides/configuration.md) -- full examples for wagmi, viem, and ethers setups



# Operator approvals

Operator approval lets another address (a DEX contract, multisig, or automated service) transfer confidential tokens on your behalf. This is the FHE equivalent of ERC-20's `approve` / `transferFrom` pattern.

## Steps

### 1. Approve an operator

Call `setOperator` on a token instance. By default, the approval is valid for 1 hour:

```ts
const token = sdk.createToken("0xEncryptedERC20");

// Approve with the default 1-hour duration
await token.setOperator("0xOperator");
```

The SDK sends a single on-chain transaction. The operator can call `confidentialTransferFrom` until the approval expires.

### 2. Approve with a custom expiry

Pass a Unix timestamp (in seconds) as the second argument to set a longer or shorter approval window:

```ts
// Approve until a specific timestamp (e.g. 24 hours from now)
const expiry = Math.floor(Date.now() / 1000) + 86400;
await token.setOperator("0xOperator", expiry);
```

### 3. Check operator status

Query whether a spender is currently an approved operator:

```ts
// holder is the token owner, spender is the operator to check
const approved = await token.isOperator("0xHolder", "0xSpender");
// returns true if the approval is active and has not expired
```

### 4. Use operator transfer

Once approved, the operator can transfer tokens from the owner's confidential balance:

```ts
// As the approved operator
const token = sdk.createToken("0xEncryptedERC20");

await token.confidentialTransferFrom("0xFrom", "0xTo", 500n);
```

The amount is encrypted before submission, just like a regular `confidentialTransfer`. On-chain observers see the transaction but not the value.

### 5. React: use the operator hooks

The React SDK provides hooks that wrap these operations with loading states and error handling:

```tsx
"use client";

import {
  useConfidentialSetOperator,
  useConfidentialIsOperator,
  useConfidentialTransferFrom,
} from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function OperatorPanel({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { address } = useAccount();
  const { mutateAsync: setOperator, isPending: isSettingOperator } =
    useConfidentialSetOperator(tokenAddress);

  const { data: isOperator } = useConfidentialIsOperator({
    address: tokenAddress,
    holder: address,
    spender: "0xOperator",
  });

  const { mutateAsync: transferFrom, isPending: isTransferring } =
    useConfidentialTransferFrom(tokenAddress);

  return (
    <div>
      <p>Operator approved: {isOperator ? "Yes" : "No"}</p>
      <button onClick={() => setOperator({ operator: "0xOperator" })} disabled={isSettingOperator}>
        Set Operator
      </button>
      <button
        onClick={() => transferFrom({ from: "0xOwner", to: "0xRecipient", amount: 500n })}
        disabled={isTransferring}
      >
        Transfer From
      </button>
    </div>
  );
}
```

### 6. Finalize-unwrap operator approval

Operator approval also applies to the unshield (unwrap + finalize) flow. If an operator needs to unshield tokens on the owner's behalf, the owner must approve the operator separately for this action. The approval mechanism is the same -- `token.setOperator("0xOperator")` -- and the operator can then call `unshield` or `unshieldAll` on the owner's tokens.

This is a distinct concern from transfer approval: approving an operator for transfers does not automatically allow them to unshield.

## Next steps

* [Token.setOperator](/protocol/sdk/api-references/sdk/token.md) -- full method signature and options
* [useConfidentialSetOperator](/protocol/sdk/api-references/react/useconfidentialsetoperator.md) -- React hook reference
* [useConfidentialIsOperator](/protocol/sdk/api-references/react/useconfidentialisoperator.md) -- query hook reference
* [useConfidentialTransferFrom](/protocol/sdk/api-references/react/useconfidentialtransferfrom.md) -- operator transfer hook reference



# Delegated decryption

Delegation lets one address grant another address the right to decrypt its confidential balances. The delegate never receives the delegator's private keys — they use their own transport key pair and a delegated EIP-712 flow to prove they have permission.

Common use cases:

* **Portfolio dashboards** — a read-only service decrypts balances across wallets without holding keys.
* **Auditors** — a third party verifies holdings without the token owner being online.

This guide uses `sdk.delegations` and `token.decryptBalanceAs`. Before starting, make sure your project is set up following the [Configuration](/protocol/sdk/guides/configuration.md) guide.

## Example

A complete delegation flow — grant, wait for propagation, then decrypt as delegate:

{% tabs %}
{% tab title="SDK" %}

```ts
import { createConfig, ZamaSDK } from "@zama-fhe/sdk";
import { sepolia } from "@zama-fhe/sdk/chains";

const sdk = new ZamaSDK(config); // config from createConfig()
const token = sdk.createToken("0xConfidentialToken");

// 1. Delegator grants decryption rights
const { txHash } = await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});

// 2. Wait 1–2 minutes for gateway propagation

// 3. Delegate reads the delegator's balance
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
});
```

{% endtab %}
{% endtabs %}

## Steps

### 1. Grant delegation

The token owner calls `sdk.delegations.delegateDecryption` to allow a delegate to decrypt their balance for a specific contract.

{% tabs %}
{% tab title="SDK" %}

```ts
// Permanent delegation (no expiration)
await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});

// Delegation with an expiration date
await sdk.delegations.delegateDecryption({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
  expirationDate: new Date("2027-12-31T00:00:00Z"),
});
```

{% endtab %}
{% endtabs %}

Both calls return `{ txHash, receipt }`.

{% hint style="warning" %}
The expiration date must be **at least 1 hour in the future**. Passing a closer date throws `DelegationExpirationTooSoonError` before the transaction is sent.
{% endhint %}

Each call grants delegation for a single `(contractAddress, delegateAddress)` pair and submits one on-chain transaction.

### 2. Wait for gateway propagation

{% hint style="warning" %}
After the delegation transaction is mined, wait **1–2 minutes** before calling `decryptBalanceAs`. The delegation is recorded on L1 immediately, but the gateway (on Arbitrum) must sync the ACL state via cross-chain event propagation. Attempting delegated decryption before propagation completes throws `DelegationNotPropagatedError`.
{% endhint %}

### 3. Decrypt as delegate

The delegate calls `token.decryptBalanceAs` to read the delegator's balance. The delegate signs with their own wallet, and the relayer verifies the on-chain delegation before decrypting.

{% tabs %}
{% tab title="SDK" %}

```ts
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
});
```

{% endtab %}
{% endtabs %}

When the balance holder differs from the delegator, pass `accountAddress` explicitly:

```ts
const balance = await token.decryptBalanceAs({
  delegatorAddress: "0xDelegator",
  accountAddress: "0xBalanceHolder",
});
```

Clear values are cached in storage, keyed by `(accountAddress, token, encryptedValue)`. Every on-chain balance change produces a new encrypted value, so stale cache entries are never served.

### 4. Batch decryption across tokens (optional)

Decrypt balances across multiple tokens in a single call:

{% tabs %}
{% tab title="SDK" %}

```ts
import { Token } from "@zama-fhe/sdk";

const tokens = addresses.map((a) => sdk.createToken(a));

const balances = await Token.batchDecryptBalancesAs(tokens, {
  delegatorAddress: "0xDelegator",
});

// balances is a Map<Address, bigint>
for (const [address, balance] of balances) {
  console.log(`${address}: ${balance}`);
}
```

{% endtab %}
{% endtabs %}

Handle errors for individual tokens with `onError`:

```ts
const balances = await Token.batchDecryptBalancesAs(tokens, {
  delegatorAddress: "0xDelegator",
  maxConcurrency: 3,
  onError: (err, addr) => {
    console.error(addr, err);
    return 0n;
  },
});
```

### 5. Revoke delegation (optional)

```ts
await sdk.delegations.revokeDelegation({
  contractAddress: token.address,
  delegateAddress: "0xDelegate",
});
```

### 6. Handle errors (optional)

Delegation operations can throw several error types. The most common:

{% tabs %}
{% tab title="SDK" %}

```ts
import {
  DelegationNotPropagatedError,
  DelegationExpirationTooSoonError,
  SigningRejectedError,
  DecryptionFailedError,
  TransactionRevertedError,
} from "@zama-fhe/sdk";

try {
  await sdk.delegations.delegateDecryption({
    contractAddress: token.address,
    delegateAddress: "0xDelegate",
  });
} catch (error) {
  if (error instanceof DelegationExpirationTooSoonError) {
    // expiration date is less than 1 hour in the future
  } else if (error instanceof TransactionRevertedError) {
    // on-chain transaction failed
  }
}

try {
  const balance = await token.decryptBalanceAs({
    delegatorAddress: "0xDelegator",
  });
} catch (error) {
  if (error instanceof SigningRejectedError) {
    // user cancelled the wallet prompt — do not retry automatically
  } else if (error instanceof DelegationNotPropagatedError) {
    // delegation hasn't synced to the gateway yet — retry after 1–2 minutes
  } else if (error instanceof DecryptionFailedError) {
    // delegated decryption failed
  }
}
```

{% endtab %}
{% endtabs %}

See [Handle errors](/protocol/sdk/guides/handle-errors.md) for full error-handling patterns and [Error types](/protocol/sdk/api-references/sdk/errors.md) for the complete list.

## Next steps

* [Delegations reference](/protocol/sdk/api-references/sdk/delegation.md) — full `Delegations` namespace API
* [useDelegateDecryption](/protocol/sdk/api-references/react/usedelegatedecryption.md) — React hook to grant delegation
* [useDecryptBalanceAs](/protocol/sdk/api-references/react/usedecryptbalanceas.md) — React hook to decrypt as a delegate
* [useDelegationStatus](/protocol/sdk/api-references/react/usedelegationstatus.md) — React hook to query delegation status



# Encrypt & decrypt

The high-level token hooks (`useShield`, `useConfidentialTransfer`, `useConfidentialBalance`) handle encryption and decryption automatically for wrapped confidential ERC-20 tokens. This guide is for a different scenario: **your smart contract uses FHE types directly** (e.g. a confidential voting contract, a sealed-bid auction, or any non-token contract that stores `euint` values). In that case, you need `useEncrypt` and `useDecryptValues` to interact with your contract's encrypted parameters and return values.

Before starting, make sure your project is set up following the [Configuration](/protocol/sdk/guides/configuration.md) guide.

## Example

Here is a complete flow that encrypts a value, sends it to a custom FHE contract, reads back the encrypted value, and decrypts it:

{% code title="ConfidentialRoundTrip.tsx" %}

```tsx
import { useEncrypt, useDecryptValues, useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { useState, type FormEvent } from "react";

function ConfidentialRoundTrip() {
  const sdk = useZamaSDK();
  const encrypt = useEncrypt();
  const { address: userAddress } = useAccount();
  const [inputs, setInputs] = useState<
    { encryptedValue: string; contractAddress: `0x${string}` }[]
  >([]);

  // Disabled by default — opt in with `enabled`. The hook still waits for
  // non-empty inputs and a connected wallet before it decrypts.
  const { data: decrypted } = useDecryptValues(inputs, { enabled: true });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const contractAddress = "0xYourContract" as `0x${string}`;

    // 1. Encrypt
    const encrypted = await encrypt.mutateAsync({
      values: [{ value: 42n, type: "euint64" }],
      contractAddress,
      userAddress: userAddress!,
    });

    // 2. Send to contract
    await sdk.signer!.writeContract({
      address: contractAddress,
      abi: yourContractABI,
      functionName: "store",
      args: [encrypted.encryptedValues[0]!, encrypted.inputProof],
    });

    // 3. Read the encrypted value back — setting inputs triggers decryption
    const encryptedValue = (await sdk.provider.readContract({
      address: contractAddress,
      abi: yourContractABI,
      functionName: "getHandle",
      args: [userAddress],
    })) as string;

    setInputs([{ encryptedValue, contractAddress }]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={encrypt.isPending}>
        Encrypt → Store → Decrypt
      </button>
      {decrypted && inputs[0] && (
        <output>Decrypted: {decrypted[inputs[0].encryptedValue]?.toString()}</output>
      )}
    </form>
  );
}
```

{% endcode %}

{% hint style="warning" %}
**Required: Cross-Origin headers**

`useEncrypt` loads FHE WASM in a Web Worker, which requires `SharedArrayBuffer`. You must set these HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

{% tabs %}
{% tab title="Next.js" %}

```js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};
```

{% endtab %}

{% tab title="Vite" %}

```ts
export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
```

{% endtab %}
{% endtabs %}

See [Configuration](/protocol/sdk/guides/configuration.md) for full setup instructions.
{% endhint %}

{% hint style="warning" %}
**SSR: "window is not defined"**

FHE operations use Web Workers and browser APIs. In Next.js or other SSR frameworks, ensure all components using encrypt/decrypt hooks are client components:

```tsx
"use client"; // Required at the top of the file

import { useEncrypt, useDecryptValues } from "@zama-fhe/react-sdk";
```

{% endhint %}

## Steps

### 1. Encrypt values with useEncrypt

`useEncrypt` encrypts plaintext values into FHE ciphertext that can be passed to any smart contract function that accepts encrypted parameters (e.g. `einput` + `bytes` proof).

{% code title="EncryptExample.tsx" %}

```tsx
import { useEncrypt } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function EncryptExample() {
  const encrypt = useEncrypt();
  const { address: userAddress } = useAccount();

  const handleEncrypt = async () => {
    const result = await encrypt.mutateAsync({
      values: [{ value: 1000n, type: "euint64" }],
      contractAddress: "0xYourConfidentialContract",
      userAddress: userAddress!,
    });

    // result.encryptedValues — array of `0x`-prefixed hex encrypted values, one per value (contract-ready)
    // result.inputProof — `0x`-prefixed hex proof, required alongside the encrypted values in contract calls
    // Use encryptedValues and inputProof in your contract call (see next section)
  };

  return (
    <button onClick={handleEncrypt} disabled={encrypt.isPending}>
      {encrypt.isPending ? "Encrypting..." : "Encrypt"}
    </button>
  );
}
```

{% endcode %}

#### Encrypting multiple values

Pass multiple values in a single call. Each value needs its FHE type.

```tsx
const result = await encrypt.mutateAsync({
  values: [
    { value: 500n, type: "euint64" }, // amount
    { value: true, type: "ebool" }, // flag
    { value: 42n, type: "euint32" }, // parameter
  ],
  contractAddress: "0xYourContract",
  userAddress,
});

// result.encryptedValues[0] — encrypted 500n
// result.encryptedValues[1] — encrypted true
// result.encryptedValues[2] — encrypted 42n
// result.inputProof — shared proof for all encrypted values
```

{% hint style="info" %}
**Encryption returns empty encrypted values?** Make sure `contractAddress` and `userAddress` are valid addresses, not `undefined`. If using wagmi, wait for the account to be connected:

```tsx
const { address } = useAccount();

// Don't encrypt until connected
if (!address) return <p role="status">Connect wallet first</p>;
```

{% endhint %}

### 2. Use encrypted values in contract calls

After encryption, pass the encrypted values and proof to your custom FHE contract. Both are `0x`-prefixed hex, so they go straight into a `writeContract` call — no conversion needed:

{% code title="ConfidentialAction.tsx" %}

```tsx
import { useEncrypt, useZamaSDK } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function ConfidentialAction() {
  const sdk = useZamaSDK();
  const encrypt = useEncrypt();
  const { address } = useAccount();

  const handleAction = async () => {
    // 1. Encrypt the value
    const { encryptedValues, inputProof } = await encrypt.mutateAsync({
      values: [{ value: 1000n, type: "euint64" }],
      contractAddress: "0xYourContract",
      userAddress: address!,
    });

    // 2. Call your contract with the encrypted data
    await sdk.signer!.writeContract({
      address: "0xYourContract",
      abi: yourContractABI,
      functionName: "yourFunction",
      args: [encryptedValues[0]!, inputProof],
    });
  };

  return <button onClick={handleAction}>Submit</button>;
}
```

{% endcode %}

### 3. Decryption of the encrypted data

Decrypting on-chain data requires the user to sign an EIP-712 message that grants your app a **reusable permit** for the relevant contracts. Hooks like `useDecryptValues` and `useConfidentialBalance` trigger this signature automatically the first time they run. If your app calls these hooks on render without gating, users see an unsolicited MetaMask popup before they have taken any action — a confusing experience that often leads to rejection.

A good decryption UX follows three steps:

1. **Check permits** — use `useHasPermit` to see whether the user has already signed.
2. **Show a locked state** — display a clear "Decrypt" button so the user understands what they are authorizing.
3. **Decrypt on demand** — only mount balance or decrypt components after permits exist.

{% hint style="danger" %}
**Never** call `useConfidentialBalance` or `useDecryptValues` without gating on `useHasPermit`:

```tsx
// BAD — triggers wallet popup as soon as the component mounts
function BadExample({ tokenAddress }: { tokenAddress: Address }) {
  const balance = useConfidentialBalance({ address: tokenAddress });
  return <p>{balance.data?.toString()}</p>;
}
```

This causes an unexpected MetaMask popup, user rejection, potential Blockaid flags, and loss of trust.
{% endhint %}

#### Gating useConfidentialBalance

Split the gate and the balance display into separate components. The gate checks credentials and shows a decrypt button; the balance component only mounts once credentials exist, so it never triggers a wallet popup.

{% tabs %}
{% tab title="DecryptGate.tsx" %}

```tsx
import { useGrantPermit, useHasPermit } from "@zama-fhe/react-sdk";
import type { Address } from "viem";

function DecryptGate({
  contractAddresses,
  children,
}: {
  contractAddresses: Address[];
  children: React.ReactNode;
}) {
  const { data: hasPermit } = useHasPermit({ contractAddresses });
  const { mutate: grantPermit, isPending } = useGrantPermit();

  if (hasPermit) return <>{children}</>;

  return (
    <button onClick={() => grantPermit(contractAddresses)} disabled={isPending}>
      {isPending ? "Signing..." : "Decrypt Balances"}
    </button>
  );
}
```

{% endtab %}

{% tab title="ConfidentialBalance.tsx" %}

```tsx
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";
import { formatUnits, type Address } from "viem";

function ConfidentialBalance({
  tokenAddress,
  decimals,
  symbol,
}: {
  tokenAddress: Address;
  decimals: number;
  symbol: string;
}) {
  const { address } = useAccount();
  const { data, isLoading } = useConfidentialBalance({ address: tokenAddress, account: address });

  return (
    <p>
      {symbol}: {isLoading ? "Decrypting..." : formatUnits(data ?? 0n, decimals)}
    </p>
  );
}
```

{% endtab %}

{% tab title="App.tsx" %}

```tsx
function App() {
  const tokens = [
    { address: "0xTokenA" as const, decimals: 6, symbol: "USDC" },
    { address: "0xTokenB" as const, decimals: 18, symbol: "WETH" },
  ];

  return (
    <DecryptGate contractAddresses={tokens.map((t) => t.address)}>
      {tokens.map((t) => (
        <ConfidentialBalance
          key={t.address}
          tokenAddress={t.address}
          decimals={t.decimals}
          symbol={t.symbol}
        />
      ))}
    </DecryptGate>
  );
}
```

{% endtab %}
{% endtabs %}

`DecryptGate` only renders its children once `useHasPermit` returns true. This means `ConfidentialBalance` never mounts without permits — no `enabled` guard needed, no wallet popup on render. Returning users skip the prompt entirely because permits persist in IndexedDB (default TTL: 30 days).

The same pattern works with `useDecryptValues` and any other decrypt hook — anything nested inside `DecryptGate` can decrypt freely without triggering a wallet prompt.

When contract addresses come from the chain (e.g. `useListPairs`), `DecryptGate` automatically detects new addresses and prompts the user once to extend their authorization:

```tsx
import { useListPairs } from "@zama-fhe/react-sdk";

function App() {
  const { data: pairs } = useListPairs({ metadata: true });
  const addresses = pairs?.items.map((p) => p.confidentialTokenAddress) ?? [];

  return (
    <DecryptGate contractAddresses={addresses}>
      {pairs?.items.map((p) => (
        <ConfidentialBalance
          key={p.confidentialTokenAddress}
          tokenAddress={p.confidentialTokenAddress}
          decimals={p.confidential.decimals}
          symbol={p.confidential.symbol}
        />
      ))}
    </DecryptGate>
  );
}
```

#### Decrypting encrypted values from multiple contracts

`useDecryptValues` automatically groups inputs by contract address and issues one decryption request per contract:

```tsx
const { data } = useDecryptValues([
  { encryptedValue: "0xvalue1...", contractAddress: "0xTokenA" },
  { encryptedValue: "0xvalue2...", contractAddress: "0xTokenA" },
  { encryptedValue: "0xvalue3...", contractAddress: "0xTokenB" },
]);

// data: { "0xvalue1...": 500n, "0xvalue2...": 200n, "0xvalue3...": 1000n }
```

#### Persistent caching

Decrypted values are stored through the SDK's internal CachingService, scoped by signer and contract address. Cached values survive page reloads — `useDecryptValues` returns them instantly without hitting the relayer.

The cache is cleared on `permits.revokePermits()`, `permits.clear()`, or wallet lifecycle events (disconnect, account/chain change).

{% hint style="info" %}
**Decryption fails with an invalid or expired transport key pair?** The transport key pair has a TTL (default: 30 days). If the key pair was generated more than `transportKeyPairTTL` seconds ago, the relayer rejects it. Call `useGrantPermit` again to generate a fresh transport key pair and permits.
{% endhint %}

### 4. Decrypt with useDecryptPublicValues (advanced)

For values marked as publicly decryptable on-chain, no transport key pair or signature is needed:

{% code title="PublicDecryptExample.tsx" %}

```tsx
import { useDecryptPublicValues } from "@zama-fhe/react-sdk";

function PublicDecryptExample() {
  const decryptPublicValues = useDecryptPublicValues();

  const handleDecrypt = async () => {
    const result = await decryptPublicValues.mutateAsync(["0xEncryptedValue..."]);
    // result.clearValues: { "0xEncryptedValue...": 1000n }
  };

  return <button onClick={handleDecrypt}>Public Decrypt</button>;
}
```

{% endcode %}



# SDK reference

**Welcome to the SDK reference!**

API reference for the core `@zama-fhe/sdk` package. Each page documents a single class or utility with constructor options, methods, properties, and working code examples.

## Where to go next

🟨 Go to [**ZamaSDK**](/protocol/sdk/api-references/sdk/zamasdk.md) for the main entry point — creates tokens, manages sessions, and coordinates the relayer and signer.

🟨 Go to [**Token**](/protocol/sdk/api-references/sdk/token.md) for the base ERC-7984 confidential token operations — balance decryption, transfers, operator approvals.

🟨 Go to [**WrappedToken**](/protocol/sdk/api-references/sdk/wrappedtoken.md) for ERC-7984 ERC-20 wrapper operations — shield, unshield, allowance.

🟨 Go to [**RelayerWeb**](/protocol/sdk/api-references/sdk/relayerweb.md) for browser-side FHE encryption via Web Workers and WASM.

🟨 Go to [**RelayerNode**](/protocol/sdk/api-references/sdk/relayernode.md) for the `node()` transport factory and server-side FHE operations.

🟨 Go to [**Network presets**](/protocol/sdk/api-references/sdk/network-presets.md) for pre-configured contract addresses on Sepolia, Mainnet, and Hardhat.

🟨 Go to [**Errors**](/protocol/sdk/api-references/sdk/errors.md) for the full list of SDK error types and codes.

## Help center

Ask technical questions, discuss with the community, or report a bug.

* [Community forum](https://community.zama.org/c/zama-protocol/15)
* [Discord channel](https://discord.com/invite/zama)
* [Open an issue](https://github.com/zama-ai/sdk/issues) on the SDK repository




# ZamaSDK

Entry point for all confidential contract operations — creates tokens, manages permits, and coordinates the relayer and signer.

## Import

```ts
import { ZamaSDK } from "@zama-fhe/sdk";
```

## Usage

{% tabs %}
{% tab title="viem" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, mainnet } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia, mainnet],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web(),
    [mainnet.id]: web(),
  },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}

{% tab title="custom signer" %}

```ts
import { createConfig, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  signer: myCustomSigner, // GenericSigner
  provider: myCustomProvider, // GenericProvider
  storage: memoryStorage,
  relayers: { [sepolia.id]: node({ poolSize: 4 }) },
});

const sdk = new ZamaSDK(config);
```

{% endtab %}
{% endtabs %}

{% hint style="warning" %}
`ZamaConfig` is a branded type — always obtain it via `createConfig()` (or an adapter-specific factory like `createConfig` from `@zama-fhe/sdk/viem`). Do not construct the config object by hand.
{% endhint %}

## createConfig options

All options below are passed to `createConfig()`, which validates them and returns a `ZamaConfig` for the `ZamaSDK` constructor.

### chains

`readonly FheChain[]`

FHE chain configurations. At least one chain is required. Use built-in presets from `@zama-fhe/sdk/chains`.

```ts
import { sepolia, mainnet } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia, mainnet],
  // ...
});
```

### relayers

`Record<number, RelayerConfig>`

Per-chain relayer factories. Each chain in `chains` must have a matching entry.

```ts
import { web } from "@zama-fhe/sdk/web";

const config = createConfig({
  chains: [sepolia],
  relayers: { [sepolia.id]: web() },
  // ...
});
```

### provider / signer

Created automatically by adapter-specific `createConfig` (viem, ethers, wagmi). For the generic `createConfig` from `@zama-fhe/sdk`, pass a `GenericProvider` and optionally a `GenericSigner`. Omit the signer for read-only usage (indexers, SSR). Signer-dependent operations throw `SignerNotConfiguredError` when invoked without a signer.

### storage

`GenericStorage | undefined`

Persists the encrypted transport key pair across sessions. Use `indexedDBStorage` (browser), `memoryStorage` (tests), or `asyncLocalStorage` (Node.js servers). Defaults to `indexedDBStorage` in browsers, `memoryStorage` elsewhere.

### permitStorage

`GenericStorage | undefined`

Optional dedicated storage for permits. Defaults to `storage`. Use this to keep permits out of long-lived storage (e.g. IndexedDB for transport key pair, memory for permits) for high-security flows.

### transportKeyPairTTL

`number | undefined`

Transport key pair validity duration in seconds. Default: `2592000` (30 days). Must be a positive integer. After expiry, the next decrypt prompts a wallet signature to regenerate the key pair.

### permitTTL

`number | undefined`

Permit lifetime in days. Default: `30`. Controls how long each signed EIP-712 permit remains valid.

### registryTTL

`number | undefined`

How long cached registry results remain valid, in seconds. Default: `86400` (24 hours). Must be a non-negative integer.

### onEvent

`ZamaSDKEventListener | undefined`

Lifecycle event callback for debugging and telemetry. Events never contain sensitive data.

```ts
const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: { [sepolia.id]: web() },
  onEvent: ({ type, tokenAddress, ...rest }) => {
    console.debug(`[zama] ${type}`, rest);
  },
});
```

## Properties

### registry

`WrappersRegistry` (readonly)

Auto-configured wrappers registry instance. Shares the SDK's provider, chain registry addresses, and `registryTTL`. Prefer this over `createWrappersRegistry()` to benefit from a single shared cache.

```ts
const pairs = await sdk.registry.listPairs({ page: 1 });
const result = await sdk.registry.getConfidentialToken(erc20Address);
```

## Methods

### createToken

`(address: Address) => Token`

Creates a [`Token`](/protocol/sdk/api-references/sdk/token.md) instance for an ERC-7984 confidential token. Supports balance reads, encrypted transfers, operator approvals, and delegated decryption.

```ts
const token = sdk.createToken("0xConfidentialToken");
```

### createWrappedToken

`(address: Address) => WrappedToken`

Creates a [`WrappedToken`](/protocol/sdk/api-references/sdk/wrappedtoken.md) instance for an ERC-7984 ERC-20 wrapper. Adds wrapper-specific operations (shield, unshield, allowance) on top of the base `Token` API. The address is the wrapper contract itself — the wrapper IS the confidential token.

```ts
const wrappedToken = sdk.createWrappedToken("0xWrapper");
```

### createWrappersRegistry

`(registryAddresses?: Record<number, Address>) => WrappersRegistry`

Creates a wrappers registry instance for querying on-chain token wrapper pairs. Registry addresses come from built-in defaults, configured chain definitions, and optional overrides passed to this method.

```ts
// Mainnet / Sepolia — resolved automatically
const registry = sdk.createWrappersRegistry();

// Hardhat or custom chain — override per chain for this registry instance
const registry = sdk.createWrappersRegistry({ [31337]: "0xYourRegistry" });

const pairs = await registry.getTokenPairs();
```

### permits.grantPermit

`(contractAddresses: Address[]) => Promise<void>`

Pre-authorize contract addresses for decryption. Signs permits only for contracts not already covered by existing permits. Subsequent [`decryption.decryptValues`](#decryption-decryptvalues) calls whose encrypted values span the covered set proceed without a wallet prompt.

```ts
// Sign once for three tokens, then decrypt individually
await sdk.permits.grantPermit([cUSDT, cDAI, cWETH]);
const a = await sdk.decryption.decryptValues([{ encryptedValue: h1, contractAddress: cUSDT }]);
const b = await sdk.decryption.decryptValues([{ encryptedValue: h2, contractAddress: cDAI }]);
```

### permits.hasPermit

`(contractAddresses: Address[]) => Promise<boolean>`

Checks whether the current signer already has stored permits covering every requested contract address. This is a pure storage lookup: it does not prompt the wallet and returns `false` when the SDK has no signer.

```ts
const hasPermit = await sdk.permits.hasPermit([cUSDT, cDAI]);
if (!hasPermit) {
  showAuthorizeButton();
}
```

Use this for UI state. `sdk.permits.grantPermit()` is already idempotent and skips the wallet prompt when a covering permit exists.

### permits.grantDelegationPermit

`(delegator: Address, contractAddresses: Address[]) => Promise<void>`

Signs and stores a delegated-decryption permit for contracts that the connected signer will decrypt on behalf of `delegator`. The on-chain delegation must already exist and have propagated before delegated decryption succeeds.

```ts
await sdk.permits.grantDelegationPermit(delegator, [cUSDT]);
```

### permits.hasDelegationPermit

`(delegator: Address, contractAddresses: Address[]) => Promise<boolean>`

Checks whether the current signer has stored delegated-decryption permits for `delegator` and every requested contract.

```ts
const ready = await sdk.permits.hasDelegationPermit(delegator, [cUSDT]);
```

### decryption.decryptValues

`(inputs: DecryptInput[]) => Promise<Record<EncryptedValue, ClearValue>>`

{% hint style="info" %}
Renamed from `decryption.userDecrypt` (then briefly `decryptValuesFromPairs`) to align with the Zama glossary and the SDK's single-entrypoint design (prerelease rename). If you were on an old name, update call sites to `decryptValues`.
{% endhint %}

Decrypt one or more FHE encrypted values. Returns cached values when available, only calling the relayer for uncached inputs. Results are written through the SDK's internal CachingService so subsequent calls for the same inputs return instantly.

Inputs from different contracts can be mixed — they are grouped by `contractAddress` and batched into one relayer call per contract (up to 5 concurrently). Zero encrypted values (32 zero bytes) resolve to `0n` without hitting the relayer.

When the relayer is actually called, permits are resolved from the contract addresses of the full input set (including cached and zero entries), ensuring a stable permit scope regardless of which entries happen to be cached. If every entry is zero or already cached, no permits are needed and no wallet prompt is shown.

```ts
const values = await sdk.decryption.decryptValues([
  { encryptedValue: balance, contractAddress: cUSDT },
  { encryptedValue: flag, contractAddress: myContract },
]);
console.log(values[balance]); // 1000n
```

To observe decryption lifecycle, subscribe to SDK events (`DecryptStart`, `DecryptEnd`, `DecryptError`) via the `onEvent` config. Events fire only when the relayer is actually called — the all-zero and fully-cached paths return silently.

The `onEvent` callback is a single function, so for multi-listener observability you can bridge it into a standard event bus. Pick whichever matches your runtime:

{% tabs %}
{% tab title="Browser (CustomEvent)" %}

```ts
import {
  ZamaSDK,
  ZamaSDKEvents,
  type DecryptEndEvent,
  type DecryptErrorEvent,
} from "@zama-fhe/sdk";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: { [sepolia.id]: web() },
  onEvent: (event) => {
    window.dispatchEvent(new CustomEvent(event.type, { detail: event }));
  },
});
const sdk = new ZamaSDK(config);

window.addEventListener(ZamaSDKEvents.DecryptEnd, (e: CustomEvent<DecryptEndEvent>) => {
  const { durationMs, encryptedValues, result } = e.detail;
  console.log(`Decrypted ${encryptedValues.length} value(s) in ${durationMs}ms`);
  // result is Record<EncryptedValue, ClearValue> — look up a specific value
  for (const v of encryptedValues) {
    console.log(`${v} → ${result[v]}`);
  }
});

window.addEventListener(ZamaSDKEvents.DecryptError, (e: CustomEvent<DecryptErrorEvent>) => {
  const { error, durationMs, encryptedValues } = e.detail;
  console.error(
    `Decryption failed after ${durationMs}ms for ${encryptedValues.length} value(s):`,
    error,
  );
});
```

{% endtab %}

{% tab title="Node (EventEmitter)" %}

```ts
import { EventEmitter } from "node:events";
import {
  ZamaSDK,
  ZamaSDKEvents,
  type DecryptEndEvent,
  type DecryptErrorEvent,
} from "@zama-fhe/sdk";

const emitter = new EventEmitter();

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: { [sepolia.id]: node() },
  onEvent: (event) => emitter.emit(event.type, event),
});
const sdk = new ZamaSDK(config);

emitter.on(ZamaSDKEvents.DecryptEnd, ({ durationMs, encryptedValues, result }: DecryptEndEvent) => {
  console.log(`Decrypted ${encryptedValues.length} value(s) in ${durationMs}ms`);
  // result is Record<EncryptedValue, ClearValue> — look up a specific value
  for (const v of encryptedValues) {
    console.log(`${v} → ${result[v]}`);
  }
});

emitter.on(
  ZamaSDKEvents.DecryptError,
  ({ error, durationMs, encryptedValues }: DecryptErrorEvent) => {
    console.error(
      `Decryption failed after ${durationMs}ms for ${encryptedValues.length} value(s):`,
      error,
    );
  },
);
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
This is the SDK-level entry point for user decryption — a single method that takes a list of value/contract **pairs** and decrypts them with the connected wallet's credentials (the Zama glossary splits this into `decryptValue`/`decryptValues`/`decryptValuesFromPairs`; the SDK intentionally exposes just one). It is distinct from `decryptPublicValues` (gateway-level decryption that happens on-chain without user authentication). In React, use [`useDecryptValues`](/protocol/sdk/api-references/react/usedecryptvalues.md) which wraps `sdk.decryption.decryptValues` with TanStack Query semantics.
{% endhint %}

### onWalletAccountChange

`(listener: (change: WalletAccountChange) => void) => () => void`

Subscribe to wallet account transitions (connect, disconnect, account change, chain change). Returns an unsubscribe function. Each transition carries `previous` and `next` wallet account objects (`{ address, chainId }`).

```ts
const unsubscribe = sdk.onWalletAccountChange(({ previous, next }) => {
  if (!next) console.log("Wallet disconnected");
  else console.log(`Switched to ${next.address} on chain ${next.chainId}`);
});
```

### permits.revokePermits

`(contracts?: Address[]) => Promise<void>`

Remove signed permits for the current signer. With a contract list, removes permits on the current chain whose payload touches any listed address. Without arguments, removes all permits across all chains and delegators. The transport key pair is not affected.

```ts
await sdk.permits.revokePermits(["0xTokenA"]); // current chain only
await sdk.permits.revokePermits(); // all permits, all chains
```

### permits.clear

`() => Promise<void>`

Wipe the transport key pair **and** cascade-delete every permit for the current signer. Use for "log out" flows.

```ts
await sdk.permits.clear();
```

### delegations

`sdk.delegations` manages on-chain decryption delegation through the ACL contract:

* `delegateDecryption({ contractAddress, delegateAddress, expirationDate? })`
* `revokeDelegation({ contractAddress, delegateAddress })`
* `isActive({ contractAddress, delegatorAddress, delegateAddress })`
* `getExpiry({ contractAddress, delegatorAddress, delegateAddress })`

See the [Delegations reference](/protocol/sdk/api-references/sdk/delegation.md) for the full API and propagation notes.

### dispose

`() => void`

Unsubscribes from signer lifecycle events (disconnect, account change, chain change) without terminating the relayer. Use when you want to stop reacting to wallet events but keep the relayer alive for other SDK instances.

```ts
sdk.dispose();
```

### terminate

`() => void`

Full cleanup — calls `dispose()` and terminates the Web Worker (browser) or thread pool (Node.js). Call when the SDK is no longer needed.

```ts
sdk.terminate();
```

## Related

* [Token](/protocol/sdk/api-references/sdk/token.md) — read/write token operations
* [WrappedToken](/protocol/sdk/api-references/sdk/wrappedtoken.md) — ERC-7984 ERC-20 wrapper operations (shield, unshield, allowance)
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) — on-chain token wrappers registry
* [Configuration guide](/protocol/sdk/guides/configuration.md) — relayer, signer, and storage setup



# Token

`Token` is the high-level ERC-20-style interface for an ERC-7984 confidential token. It hides FHE complexity (encryption, decryption, EIP-712 signing) behind familiar methods.

For ERC-7984 ERC-20 wrappers (shield / unshield / allowance), use [`WrappedToken`](/protocol/sdk/api-references/sdk/wrappedtoken.md) instead — it extends `Token` with wrapper-specific operations.

## Import

Created via [`sdk.createToken()`](/protocol/sdk/api-references/sdk/zamasdk.md):

```ts
import { ZamaSDK } from "@zama-fhe/sdk";

const sdk = new ZamaSDK(config); // config from createConfig()
const token = sdk.createToken("0xConfidentialToken");

const balance = await token.balanceOf(ownerAddress);
await token.confidentialTransfer("0xRecipient", 500n);
```

For shield / unshield, create a `WrappedToken` via `sdk.createWrappedToken("0xWrapper")` — see [`WrappedToken`](/protocol/sdk/api-references/sdk/wrappedtoken.md).

## Methods

### balanceOf

`(owner: Address) => Promise<bigint>`

Returns the decrypted confidential balance. The first call prompts a wallet signature to create FHE permits; subsequent calls use cached permits silently. Decrypted values are cached in storage automatically.

```ts
const balance = await token.balanceOf("0xOwnerAddress");
```

### confidentialBalanceOf

`(owner: Address) => Promise<EncryptedValue>`

Returns the raw encrypted value without decrypting. Use with `isEncryptedValueZero()` or pass to `sdk.decryption.decryptValues()` for decryption.

```ts
const encryptedValue = await token.confidentialBalanceOf("0xOwnerAddress");
```

### decryptBalanceAs

`({ delegatorAddress, accountAddress? }) => Promise<bigint>`

Decrypt a delegator's balance using delegated credentials. The connected wallet must hold an active delegation from `delegatorAddress` covering this token's contract.

```ts
const balance = await token.decryptBalanceAs({ delegatorAddress: "0xDelegator" });
```

### confidentialTransfer

`(to: Address, amount: bigint, options?: TransferOptions) => Promise<TransactionResult>`

Transfers encrypted tokens. The amount is encrypted before hitting the chain.

By default, the SDK validates the confidential balance before submitting. If credentials are cached, it auto-decrypts silently. Set `skipBalanceCheck: true` to bypass (e.g. for smart wallets that cannot produce EIP-712 signatures).

| Option                | Type               | Default | Description                          |
| --------------------- | ------------------ | ------- | ------------------------------------ |
| `skipBalanceCheck`    | `boolean`          | `false` | Skip balance validation              |
| `onEncryptComplete`   | `() => void`       | —       | Fired after FHE encryption completes |
| `onTransferSubmitted` | `(txHash) => void` | —       | Fired after transfer tx submitted    |

```ts
await token.confidentialTransfer("0xRecipient", 500n);

// Smart wallet (skip balance check)
await token.confidentialTransfer("0xRecipient", 500n, { skipBalanceCheck: true });
```

**Throws:**

* `InsufficientConfidentialBalanceError` — if the confidential balance is less than `amount` (exposes `requested`, `available`, `token`)
* `BalanceCheckUnavailableError` — if balance validation is required but decryption is not possible (no stored permits). Call `sdk.permits.grantPermit([token.address])` first or use `skipBalanceCheck: true`

### confidentialTransferFrom

`(from: Address, to: Address, amount: bigint, callbacks?: TransferCallbacks) => Promise<TransactionResult>`

Operator transfer on behalf of an address that has approved you.

```ts
await token.confidentialTransferFrom("0xFrom", "0xTo", 500n);
```

### setOperator

`(operator: Address, until?: number) => Promise<{ txHash: Hex; receipt: TransactionReceipt }>`

Approves another address to operate on your confidential tokens (e.g. a DEX or multisig). Default duration: 1 hour.

```ts
// Approve for 1 hour (default)
await token.setOperator("0xOperator");

// Approve until a specific timestamp
await token.setOperator("0xOperator", futureTimestamp);
```

### isOperator

`(holder: Address, spender: Address) => Promise<boolean>`

Checks whether a spender is currently an approved operator for a given holder.

```ts
const approved = await token.isOperator("0xHolder", "0xSpender");
```

### name / symbol / decimals

ERC-20-style metadata reads. Each returns a `Promise` of the value.

```ts
const name = await token.name();
const symbol = await token.symbol();
const decimals = await token.decimals();
```

### isConfidential / isWrapper

ERC-165 introspection.

```ts
const isErc7984 = await token.isConfidential();
const isWrapper = await token.isWrapper();
```

### Token.batchBalancesOf *(static)*

`(tokens: Token[], owner: Address) => Promise<BatchBalancesResult>`

Decrypts multiple balances in one batch.

### Token.batchDecryptBalancesAs *(static)*

`(tokens: Token[], options: BatchDecryptAsOptions) => Promise<Map<Address, bigint>>`

Batch delegated decryption.

## Related

* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — creates `Token` via `createToken()`
* [WrappedToken](/protocol/sdk/api-references/sdk/wrappedtoken.md) — extends `Token` with shield / unshield / allowance / wrapper operations



# WrappedToken

`WrappedToken` is the high-level interface for an ERC-7984 ERC-20 wrapper. It extends [`Token`](/protocol/sdk/api-references/sdk/token.md), so it supports the base confidential-token operations (`balanceOf`, `confidentialTransfer`, `setOperator`, etc.) and adds wrapper-specific methods for converting between the public ERC-20 and its confidential form.

The wrapper **is** the confidential token. Pass the wrapper contract address directly; there is no separate token / wrapper pair in the SDK object.

## Import

```ts
import { WrappedToken } from "@zama-fhe/sdk";
```

## Construction

Use [`sdk.createWrappedToken()`](/protocol/sdk/api-references/sdk/zamasdk.md):

```ts
const wrappedToken = sdk.createWrappedToken("0xWrapper");

await wrappedToken.shield(1000n);
await wrappedToken.confidentialTransfer("0xRecipient", 500n);
await wrappedToken.unshield(250n);
```

## Inherited Token API

`WrappedToken` extends [`Token`](/protocol/sdk/api-references/sdk/token.md). Use the inherited methods for ERC-7984 confidential-token reads and writes:

* `balanceOf(owner)`
* `confidentialBalanceOf(owner)`
* `decryptBalanceAs(params)`
* `confidentialTransfer(to, amount, options?)`
* `confidentialTransferFrom(from, to, amount, callbacks?)`
* `setOperator(operator, until?)`
* `isOperator(holder, spender)`
* `name()`, `symbol()`, `decimals()`
* `isConfidential()`, `isWrapper()`

## Wrapper Reads

### underlying

`() => Promise<Address>`

Reads the underlying public ERC-20 token address from the wrapper contract. The result is cached per `WrappedToken` instance.

```ts
const underlying = await wrappedToken.underlying();
```

### allowance

`(owner: Address) => Promise<bigint>`

Reads the ERC-20 allowance that `owner` granted to this wrapper contract.

```ts
const allowance = await wrappedToken.allowance(owner);
```

### isPayable

`() => Promise<boolean>`

Checks whether the underlying ERC-20 supports ERC-1363. `shield()` uses this internally to route between `transferAndCall` and `approve` + `wrap`. The result is cached per `WrappedToken` instance.

```ts
const singleTxShield = await wrappedToken.isPayable();
```

## Shield

### shield

`(amount: bigint, options?: ShieldOptions) => Promise<TransactionResult>`

Shields public ERC-20 tokens into confidential tokens. The SDK validates the public ERC-20 balance before submitting.

The execution path is selected automatically:

| Path               | Used when                                       | Wallet prompts |
| ------------------ | ----------------------------------------------- | -------------- |
| `transferAndCall`  | The underlying ERC-20 supports ERC-1363         | 1              |
| `approve` + `wrap` | The underlying ERC-20 does not support ERC-1363 | 2              |

```ts
const { txHash, receipt } = await wrappedToken.shield(1000n);
```

Options:

| Option                | Type                         | Default   | Description                                      |
| --------------------- | ---------------------------- | --------- | ------------------------------------------------ |
| `approvalStrategy`    | `"exact" \| "max" \| "skip"` | `"exact"` | Controls approval on the `approve` + `wrap` path |
| `to`                  | `Address`                    | signer    | Recipient of the confidential balance            |
| `onApprovalSubmitted` | `(txHash: Hex) => void`      | —         | Called after the approval tx is submitted        |
| `onShieldSubmitted`   | `(txHash: Hex) => void`      | —         | Called after the shield tx is submitted          |

`approvalStrategy` is ignored on the ERC-1363 `transferAndCall` path because there is no allowance step.

### approveUnderlying

`(amount?: bigint) => Promise<TransactionResult>`

Approves this wrapper contract to spend the underlying ERC-20. Defaults to `uint256.max`. If an existing non-zero allowance is present, the SDK resets it to zero first for compatibility with tokens such as USDT.

Most apps should use `shield()` directly and let it manage approvals.

```ts
await wrappedToken.approveUnderlying();
await wrappedToken.approveUnderlying(1000n);
```

## Unshield

### unshield

`(amount: bigint, options?: UnshieldOptions) => Promise<TransactionResult>`

Unshields a specific confidential amount back to public ERC-20. This orchestrates the two-step protocol:

1. Submit `unwrap`.
2. Wait for the unwrap receipt and public decryption proof.
3. Submit `finalizeUnwrap`.

The returned `txHash` and `receipt` are for the finalization transaction.

```ts
const { txHash, receipt } = await wrappedToken.unshield(500n);
```

Options:

| Option                | Type                    | Default | Description                                    |
| --------------------- | ----------------------- | ------- | ---------------------------------------------- |
| `skipBalanceCheck`    | `boolean`               | `false` | Skip the confidential-balance pre-flight check |
| `onUnwrapSubmitted`   | `(txHash: Hex) => void` | —       | Called after the unwrap tx is submitted        |
| `onFinalizing`        | `() => void`            | —       | Called before waiting for the finalize proof   |
| `onFinalizeSubmitted` | `(txHash: Hex) => void` | —       | Called after the finalize tx is submitted      |

### unshieldAll

`(callbacks?: UnshieldCallbacks) => Promise<TransactionResult>`

Unshields the entire confidential balance by using the on-chain encrypted balance handle directly.

```ts
await wrappedToken.unshieldAll({
  onUnwrapSubmitted: (txHash) => console.log("unwrap:", txHash),
  onFinalizeSubmitted: (txHash) => console.log("finalize:", txHash),
});
```

### resumeUnshield

`(unwrapTxHash: Hex, callbacks?: UnshieldCallbacks) => Promise<TransactionResult>`

Resumes an interrupted unshield after the unwrap transaction has already been submitted. The SDK reads the unwrap receipt, extracts the unwrap request id, waits for the proof, and submits `finalizeUnwrap`.

```ts
const pending = await loadPendingUnshield(storage, wrappedToken.address);
if (pending) {
  await wrappedToken.resumeUnshield(pending);
}
```

## Low-Level Unwrap Primitives

Most apps should use `unshield()` or `unshieldAll()`. The low-level methods are escape hatches for custom two-phase flows.

### unwrap

`(amount: bigint) => Promise<TransactionResult>`

Encrypts `amount` and submits the unwrap request. Finalization is not automatic.

```ts
const { txHash, receipt } = await wrappedToken.unwrap(500n);
```

### unwrapAll

`() => Promise<TransactionResult>`

Submits an unwrap request for the full confidential balance using the current encrypted balance handle.

```ts
const { txHash } = await wrappedToken.unwrapAll();
```

### finalizeUnwrap

`(unwrapRequestId: EncryptedValue) => Promise<TransactionResult>`

Completes an unwrap after the gateway has publicly decrypted the unwrap request. Pass the `unwrapRequestId` from the `UnwrapRequested` event.

```ts
const event = findUnwrapRequested(receipt.logs);
if (!event) throw new Error("No unwrap request found");

await wrappedToken.finalizeUnwrap(event.unwrapRequestId);
```

## Related

* [Token](/protocol/sdk/api-references/sdk/token.md) — base ERC-7984 confidential-token API
* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — creates `WrappedToken` via `createWrappedToken()`
* [Shield tokens](/protocol/sdk/guides/shield-tokens.md) — full shield flow
* [Unshield tokens](/protocol/sdk/guides/unshield-tokens.md) — full unshield flow
* [useWrappedToken](/protocol/sdk/api-references/react/usewrappedtoken.md) — React hook returning a `WrappedToken`


# WrappersRegistry

High-level read interface for the on-chain `ConfidentialTokenWrappersRegistry` contract. Resolves the correct registry address for the current chain automatically.

## Import

```ts
import { WrappersRegistry, DefaultRegistryAddresses } from "@zama-fhe/sdk";
```

## Usage

### From ZamaSDK

The SDK exposes a shared registry instance via `sdk.registry`. This is the recommended way to access the registry — it shares the SDK's provider, chain registry addresses, and `registryTTL`, and maintains a single in-memory cache.

```ts
const pairs = await sdk.registry.listPairs({ page: 1 });
const result = await sdk.registry.getConfidentialToken(erc20Address);
```

You can also create a separate instance via `sdk.createWrappersRegistry()` (inherits `registryTTL` from the SDK):

```ts
const registry = sdk.createWrappersRegistry();
const pairs = await registry.getTokenPairs();
```

### Standalone

```ts
import { WrappersRegistry } from "@zama-fhe/sdk";

const registry = new WrappersRegistry({ provider });
const [isValid, cToken] = await registry.getConfidentialTokenAddress(tokenAddress);
```

### Custom chains

Override registry addresses for Hardhat or custom deployments:

```ts
// Via ZamaSDK
const registry = sdk.createWrappersRegistry({ [31337]: "0xYourHardhatRegistry" });

// Via constructor
const registry = new WrappersRegistry({
  provider,
  registryAddresses: { [31337]: "0xYourHardhatRegistry" },
});
```

## Constructor

### provider

`GenericProvider`

Provider for read-only contract calls. Any `GenericProvider` implementation works (e.g. the one created by `createConfig` or a custom implementation).

### registryAddresses

`Record<number, Address> | undefined`

Per-chain registry address overrides, merged on top of `DefaultRegistryAddresses`. Mainnet and Sepolia are configured by default — pass this only for custom or local chains.

### registryTTL

`number | undefined`

How long cached registry results remain valid, in seconds. Default: `86400` (24 hours).

```ts
const registry = new WrappersRegistry({
  provider,
  registryTTL: 3600, // 1 hour
});
```

## Methods

### getRegistryAddress

`() => Promise<Address>`

Resolves the registry contract address for the current chain. Throws `ConfigurationError` if no address is configured.

```ts
const registryAddr = await registry.getRegistryAddress();
```

### listPairs

`(options?: ListPairsOptions) => Promise<PaginatedResult<TokenWrapperPair | TokenWrapperPairWithMetadata>>`

List token wrapper pairs with page-based pagination. Pass `metadata: true` to enrich each pair with on-chain name, symbol, decimals, and totalSupply.

```ts
// Basic pagination
const page1 = await registry.listPairs({ page: 1, pageSize: 20 });
console.log(`${page1.total} pairs, showing page ${page1.page}`);

// With on-chain metadata
const enriched = await registry.listPairs({ metadata: true, pageSize: 10 });
for (const pair of enriched.items) {
  console.log(pair.underlying.symbol, "→", pair.confidential.symbol);
}
```

#### ListPairsOptions

| Option     | Type      | Default | Description                                          |
| ---------- | --------- | ------- | ---------------------------------------------------- |
| `page`     | `number`  | `1`     | Page number (1-indexed)                              |
| `pageSize` | `number`  | `100`   | Items per page                                       |
| `metadata` | `boolean` | `false` | Fetch on-chain metadata for both tokens in each pair |

### getConfidentialToken

`(tokenAddress: Address) => Promise<{ confidentialTokenAddress: Address; isValid: boolean } | null>`

Look up the confidential token for a given plain ERC-20. Returns `null` if no pair is registered. Negative lookups are cached for 5 minutes.

```ts
const result = await registry.getConfidentialToken(usdcAddress);
if (result) {
  console.log(result.confidentialTokenAddress, result.isValid);
}
```

### getUnderlyingToken

`(confidentialTokenAddress: Address) => Promise<{ tokenAddress: Address; isValid: boolean } | null>`

Reverse lookup — find the plain ERC-20 for a confidential token. Returns `null` if no pair is registered.

```ts
const result = await registry.getUnderlyingToken(cUsdcAddress);
if (result) {
  console.log(result.tokenAddress, result.isValid);
}
```

### refresh

`() => void`

Force-invalidate the in-memory cache. The next call to any read method will fetch fresh data from the chain.

```ts
registry.refresh();
```

### getTokenPairs

`() => Promise<readonly TokenWrapperPair[]>`

Fetch all token wrapper pairs from the registry.

```ts
const pairs = await registry.getTokenPairs();
for (const pair of pairs) {
  console.log(pair.tokenAddress, "→", pair.confidentialTokenAddress, pair.isValid);
}
```

### getTokenPairsLength

`() => Promise<bigint>`

Get the total number of registered token wrapper pairs.

```ts
const count = await registry.getTokenPairsLength();
```

### getTokenPairsSlice

`(fromIndex: bigint, toIndex: bigint) => Promise<readonly TokenWrapperPair[]>`

Fetch a range of pairs for pagination. `fromIndex` is inclusive, `toIndex` is exclusive.

```ts
const page = await registry.getTokenPairsSlice(0n, 10n);
```

### getTokenPair

`(index: bigint) => Promise<TokenWrapperPair>`

Fetch a single pair by index.

```ts
const pair = await registry.getTokenPair(0n);
```

### getConfidentialTokenAddress

`(tokenAddress: Address) => Promise<readonly [boolean, Address]>`

Look up the confidential token for a given plain ERC-20. Returns `[isValid, confidentialTokenAddress]`.

The three possible states:

* `[true, nonZeroAddress]` -- registered and valid
* `[false, nonZeroAddress]` -- registered but revoked (address is the former confidential token)
* `[false, zeroAddress]` -- not registered

```ts
const [isValid, cToken] = await registry.getConfidentialTokenAddress("0xUSDC");
if (isValid) {
  const token = sdk.createToken(cToken);
}
```

### getTokenAddress

`(confidentialTokenAddress: Address) => Promise<readonly [boolean, Address]>`

Reverse lookup — find the plain ERC-20 for a confidential token. Returns `[isValid, tokenAddress]`.

The three possible states mirror `getConfidentialTokenAddress`:

* `[true, nonZeroAddress]` -- registered and valid
* `[false, nonZeroAddress]` -- registered but revoked
* `[false, zeroAddress]` -- not registered

```ts
const [isValid, plainToken] = await registry.getTokenAddress("0xcUSDC");
```

### isConfidentialTokenValid

`(confidentialTokenAddress: Address) => Promise<boolean>`

Check whether a confidential token is registered and valid.

```ts
if (await registry.isConfidentialTokenValid("0xcUSDC")) {
  // Token is a known valid wrapper
}
```

## DefaultRegistryAddresses

`Record<number, Address>`

Exported map of built-in registry addresses for known chains. Includes Mainnet (`1`), Sepolia (`11155111`), and Hoodi (`560048`). Addresses are EIP-55 checksummed.

```ts
import { DefaultRegistryAddresses } from "@zama-fhe/sdk";

console.log(DefaultRegistryAddresses[1]); // "0xeb5015fF021DB115aCe010f23F55C2591059bBA0"
```

## Related

* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — `sdk.registry` shared instance and `createWrappersRegistry()` factory
* [useListPairs](/protocol/sdk/api-references/react/uselistpairs.md) — React hook for paginated pair listing
* [useConfidentialTokenAddress](/protocol/sdk/api-references/react/useconfidentialtokenaddress.md) — React hook for forward lookup
* [useTokenAddress](/protocol/sdk/api-references/react/usetokenaddress.md) — React hook for reverse lookup
* [useIsConfidentialTokenValid](/protocol/sdk/api-references/react/useisconfidentialtokenvalid.md) — React hook for validity check
* [Contract Builders](/protocol/sdk/api-references/sdk/contract-builders.md) — low-level registry builders
* [Network Presets](/protocol/sdk/api-references/sdk/network-presets.md) — built-in chain configurations



# RelayerWeb

Browser relayer that runs FHE operations in a Web Worker via WASM. Handles encryption, decryption, and transport key pair management for browser applications.

## Import

```ts
import { RelayerWeb } from "@zama-fhe/sdk/web";
```

{% hint style="info" %}
For most applications, prefer the `web()` transport factory with `createConfig` instead of constructing `RelayerWeb` directly. See [Network Presets](/protocol/sdk/api-references/sdk/network-presets.md) for examples.
{% endhint %}

## Usage

{% tabs %}
{% tab title="Recommended (web transport)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web(),
  },
});
```

{% endtab %}

{% tab title="Direct construction" %}

```ts
import { RelayerWeb } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const relayer = new RelayerWeb({
  chain: sepolia,
  worker: relayerWorkerClient,
});
```

{% endtab %}
{% endtabs %}

## Constructor (`RelayerWebConfig`)

### chain

`FheChain`

FHE chain configuration. Use a built-in chain preset (`sepolia`, `mainnet`, `hoodi`, `hardhat`) or a custom `FheChain` object.

### worker

`RelayerWorkerClient`

Worker client that handles WASM operations off the main thread.

### security

`RelayerWebSecurityConfig | undefined`

Security options for the WASM bundle and relayer requests.

| Field            | Type           | Description                                         |
| ---------------- | -------------- | --------------------------------------------------- |
| `integrityCheck` | `boolean`      | Verify SHA-384 of the WASM bundle. Default: `true`. |
| `getCsrfToken`   | `() => string` | Returns a CSRF token to attach to relayer requests. |

### threads

`number | undefined`

Number of WASM threads for parallel FHE operations inside the Web Worker. Default: `1` (single-threaded). The practical sweet spot is 4-8 threads; beyond that, diminishing returns and higher memory usage.

{% hint style="warning" %}
Multi-threading requires [COOP/COEP headers](https://web.dev/articles/coop-coep) for `SharedArrayBuffer` access:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers, the browser blocks `SharedArrayBuffer` and the relayer falls back to single-threaded mode.
{% endhint %}

### fheArtifactStorage

`GenericStorage | undefined`

Persistent storage for caching the FHE encryption key and params across sessions.

### fheArtifactCacheTTL

`number | undefined`

How long cached FHE artifacts remain valid, in seconds.

## Related

* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — pass the relayer to the SDK constructor
* [RelayerNode](/protocol/sdk/api-references/sdk/relayernode.md) — Node.js variant using worker threads
* [Configuration guide](/protocol/sdk/guides/configuration.md) — authentication and network presets



# RelayerNode

Node.js relayer that runs FHE operations in native worker threads. The server-side counterpart to `RelayerWeb`.

{% hint style="warning" %}
`RelayerNode`, `NodeWorkerClient`, and `NodeWorkerPool` are internal classes — they are no longer exported from `@zama-fhe/sdk/node`. Use the `node()` transport factory with `createConfig` instead.
{% endhint %}

## Usage

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { ZamaSDK } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [{ ...sepolia, auth: { __type: "ApiKeyHeader", value: process.env.RELAYER_API_KEY } }],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: node({ poolSize: 4 }),
  },
});

const sdk = new ZamaSDK(config);
```

## `node()` options

### poolSize

`number | undefined`

Number of native worker threads. Default: `min(CPU cores, 4)`. Must be a positive integer.

### fheArtifactStorage

`GenericStorage | undefined`

Persistent storage for caching the FHE encryption key and params.

### fheArtifactCacheTTL

`number | undefined`

How long cached FHE artifacts remain valid, in seconds. Must be a non-negative integer.

## Related

* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — pass the config to the SDK constructor
* [RelayerWeb](/protocol/sdk/api-references/sdk/relayerweb.md) — browser variant using Web Workers and WASM
* [Configuration guide](/protocol/sdk/guides/configuration.md) — authentication and network presets


# RelayerCleartext

Development relayer that operates in cleartext mode. Values are stored as plaintext on-chain via the CleartextFHEVMExecutor contract. Implements the same `RelayerSDK` interface as `RelayerWeb` and `RelayerNode`.

## Import

```ts
import { RelayerCleartext } from "@zama-fhe/sdk/cleartext";
```

{% hint style="info" %}
For most applications, prefer the `cleartext()` transport factory with `createConfig` instead of constructing `RelayerCleartext` directly. See [Network Presets](/protocol/sdk/api-references/sdk/network-presets.md) for examples.
{% endhint %}

## Usage

{% tabs %}
{% tab title="Recommended (cleartext transport)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { cleartext } from "@zama-fhe/sdk";
import { hardhat } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [hardhat],
  publicClient,
  walletClient,
  relayers: {
    [hardhat.id]: cleartext(),
  },
});
```

{% endtab %}

{% tab title="Direct construction" %}

```ts
import { RelayerCleartext } from "@zama-fhe/sdk/cleartext";
import { hardhat } from "@zama-fhe/sdk/chains";

const relayer = new RelayerCleartext(hardhat);
```

{% endtab %}
{% endtabs %}

## Constructor

```ts
import { RelayerCleartext } from "@zama-fhe/sdk/cleartext";

const relayer = new RelayerCleartext(chain);
```

Takes a single `FheChain` object directly. Mainnet (1) and Sepolia (11155111) chain IDs are blocked — cleartext mode is for development only.

The `FheChain` fields relevant to cleartext mode are:

| Field                                       | Type                        | Description                                                |
| ------------------------------------------- | --------------------------- | ---------------------------------------------------------- |
| `id`                                        | `number`                    | Chain ID (must not be 1 or 11155111)                       |
| `network`                                   | `EIP1193Provider \| string` | RPC URL or provider for reading on-chain state             |
| `gatewayChainId`                            | `number`                    | Gateway chain ID for EIP-712 domain construction           |
| `aclContractAddress`                        | `Address`                   | ACL contract for permission checks                         |
| `executorAddress`                           | `Address`                   | CleartextFHEVMExecutor contract storing plaintext values   |
| `verifyingContractAddressDecryption`        | `Address`                   | EIP-712 verifying contract for decrypt operations          |
| `verifyingContractAddressInputVerification` | `Address`                   | EIP-712 verifying contract for encrypt operations          |
| `kmsSignerPrivateKey`                       | `Hex \| undefined`          | KMS signer private key (falls back to built-in mock key)   |
| `inputSignerPrivateKey`                     | `Hex \| undefined`          | Input signer private key (falls back to built-in mock key) |

Built-in chain presets (`hardhat`, `hoodi`) already include all required fields:

```ts
import { hardhat, hoodi } from "@zama-fhe/sdk/chains";

const relayer = new RelayerCleartext(hardhat);
```

## Methods

The cleartext relayer implements the full `RelayerSDK` interface:

| Method                                  | Description                                                         |
| --------------------------------------- | ------------------------------------------------------------------- |
| `generateTransportKeyPair()`            | Returns a random mock transport key pair.                           |
| `encrypt(params)`                       | Computes mock ciphertext handles and signs an input proof.          |
| `userDecrypt(params)`                   | Reads plaintext from TFHEExecutor after ACL checks.                 |
| `publicDecrypt(encryptedValues)`        | Reads plaintext for encrypted values allowed for public decryption. |
| `delegatedUserDecrypt(params)`          | Reads plaintext via delegated authorization.                        |
| `createEIP712(...)`                     | Returns a user-decrypt EIP-712 typed data object.                   |
| `createDelegatedUserDecryptEIP712(...)` | Returns a delegated-decrypt EIP-712 typed data object.              |
| `fetchFheEncryptionKeyBytes()`          | Returns a mock FHE encryption key.                                  |
| `getPublicParams(bits)`                 | Returns mock public parameters.                                     |
| `terminate()`                           | No-op — no resources to release.                                    |

{% hint style="info" %}
`requestZKProofVerification` throws a `ConfigurationError` — ZK proofs are not supported in cleartext mode.
{% endhint %}

## Related

* [Local Development guide](/protocol/sdk/guides/local-development.md) — when and how to use cleartext mode
* [RelayerWeb](/protocol/sdk/api-references/sdk/relayerweb.md) — browser relayer with real FHE
* [RelayerNode](/protocol/sdk/api-references/sdk/relayernode.md) — Node.js relayer with real FHE
* [Network Presets](/protocol/sdk/api-references/sdk/network-presets.md) — production network configs



# GenericProvider

Interface that all provider adapters must implement for read-only chain access. You only need this if you are building a custom provider -- otherwise use [ViemProvider](/protocol/sdk/api-references/sdk/viemprovider.md), [EthersProvider](/protocol/sdk/api-references/sdk/ethersprovider.md), or the wagmi `createConfig` which builds one internally.

## Import

```ts
import type { GenericProvider } from "@zama-fhe/sdk";
```

## Definition

```ts
interface GenericProvider {
  getChainId(): Promise<number>;
  readContract(config: ReadContractConfig): Promise<unknown>;
  waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt>;
  getBlockTimestamp(): Promise<bigint>;
}
```

## Usage with `createConfig`

Pass a custom provider to the generic `createConfig` from `@zama-fhe/sdk`:

```ts
import { createConfig, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  provider: myCustomProvider,
  storage: memoryStorage,
  relayers: { [sepolia.id]: node({ poolSize: 4 }) },
});
const sdk = new ZamaSDK(config);
```

## Implementing a custom provider

```ts
import type { GenericProvider } from "@zama-fhe/sdk";

class MyProvider implements GenericProvider {
  async getChainId() {
    /* ... */
  }
  async readContract(config) {
    /* ... */
  }
  async waitForTransactionReceipt(hash) {
    /* ... */
  }
  async getBlockTimestamp() {
    /* ... */
  }
}
```

## Methods

### getChainId

```ts
getChainId(): Promise<number>
```

Return the chain ID this provider is connected to.

### readContract

```ts
readContract(config: ReadContractConfig): Promise<unknown>
```

Execute a read-only contract call. `ReadContractConfig` contains `address`, `abi`, `functionName`, and `args`.

### waitForTransactionReceipt

```ts
waitForTransactionReceipt(hash: Hex): Promise<TransactionReceipt>
```

Poll for a transaction receipt by hash.

### getBlockTimestamp

```ts
getBlockTimestamp(): Promise<bigint>
```

Return the timestamp of the latest block.

## Related

* [ViemProvider](/protocol/sdk/api-references/sdk/viemprovider.md) -- viem implementation
* [EthersProvider](/protocol/sdk/api-references/sdk/ethersprovider.md) -- ethers implementation
* [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) -- wallet authority interface
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough



# GenericSigner

Interface that all signer adapters must implement for the SDK to interact with wallets. You only need this if you are building a custom signer -- otherwise use [ViemSigner](/protocol/sdk/api-references/sdk/viemsigner.md) or [EthersSigner](/protocol/sdk/api-references/sdk/etherssigner.md).

## Import

```ts
import type { GenericSigner } from "@zama-fhe/sdk";
```

## Definition

```ts
interface GenericSigner {
  readonly walletAccount: WalletAccountStore;
  requireWalletAccount(operation: string): WalletAccount;
  refreshWalletAccount?(): Promise<WalletAccount | undefined>;
  signTypedData(typedData: EIP712TypedData): Promise<Hex>;
  writeContract(config: WriteContractConfig): Promise<Hex>;
  dispose?(): void;
}

interface WalletAccountStore {
  getSnapshot(): WalletAccount | undefined;
  subscribe(onWalletAccountChange: WalletAccountListener): () => void;
}
```

{% hint style="info" %}
For read operations (`readContract`, `waitForTransactionReceipt`), see [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md).
{% endhint %}

## Usage with `createConfig`

Pass a custom signer and provider to the generic `createConfig` from `@zama-fhe/sdk`:

```ts
import { createConfig, ZamaSDK, memoryStorage } from "@zama-fhe/sdk";
import { node } from "@zama-fhe/sdk/node";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  signer: mySigner,
  provider: myProvider,
  storage: memoryStorage,
  relayers: { [sepolia.id]: node({ poolSize: 4 }) },
});
const sdk = new ZamaSDK(config);
```

## Implementing a custom signer

```ts
import { BaseSigner } from "@zama-fhe/sdk";

class MySigner extends BaseSigner {
  #unsubscribe: () => void;

  constructor(provider: MyProvider) {
    super(provider.currentAccount());
    this.#unsubscribe = provider.on("change", (account) => {
      this.walletAccount.setSnapshot(account);
    });
  }

  async signTypedData(typedData) {
    /* ... */
  }

  async writeContract(config) {
    /* ... */
  }

  protected override onDispose() {
    this.#unsubscribe();
  }
}
```

{% hint style="info" %}
`BaseSigner` provides `walletAccount` (a `MutableWalletAccountStore`), `requireWalletAccount`, idempotent `dispose` / `[Symbol.dispose]`, so subclasses only need to implement `signTypedData`, `writeContract`, and optionally `onDispose` for cleanup. Pass the initial wallet account snapshot to `super()`.

If your adapter resolves its initial account asynchronously (e.g. an ethers `Signer` wrapping a JSON-RPC provider), override `refreshWalletAccount(): Promise<WalletAccount | undefined>` so action paths can await non-prompting discovery before throwing `WalletNotConnectedError`.

Using `BaseSigner` is optional — implementing the `GenericSigner` interface directly with `createWalletAccountStore()` remains fully supported.
{% endhint %}

## Methods

### walletAccount

```ts
walletAccount: WalletAccountStore;
```

Synchronous observable store for wallet account readiness. React integrations use this store to avoid SSR and hydration races.

Direct store subscriptions observe raw signer transitions. For SDK-coordinated cleanup and query invalidation, subscribe through the SDK lifecycle instead so credential and CachingService cleanup runs first.

### requireWalletAccount

```ts
requireWalletAccount(operation: string): WalletAccount
```

Return the current `{ address, chainId }` snapshot or throw `WalletNotConnectedError`. This method must not prompt the wallet.

### refreshWalletAccount (optional)

```ts
refreshWalletAccount?(): Promise<WalletAccount | undefined>
```

Optional non-prompting discovery hook for adapters whose initial account snapshot is only available asynchronously.

### dispose (optional)

```ts
dispose?(): void
```

Release adapter-owned wallet watchers or provider event listeners. `ZamaSDK.terminate()` calls this when present.

### signTypedData

```ts
signTypedData(typedData: EIP712TypedData): Promise<Hex>
```

Sign an EIP-712 typed data payload and return the signature. The SDK uses this to sign FHE decrypt permits.

### writeContract

```ts
writeContract(config: WriteContractConfig): Promise<Hex>
```

Submit a contract write transaction and return the transaction hash. `WriteContractConfig` contains `address`, `abi`, `functionName`, `args`, and optionally `value` and `gas`.

### walletAccount.subscribe

```ts
walletAccount.subscribe(onWalletAccountChange: WalletAccountListener): () => void
```

Subscribe to wallet identity transitions (connect, disconnect, account change, chain change). Returns an unsubscribe function.

The SDK calls `walletAccount.subscribe()` during initialization. The listener receives a transition object:

* `previous` -- the previous `{ address, chainId }` identity, when one was known.
* `next` -- the next `{ address, chainId }` identity, when the wallet is connected.

When `previous` is present, the SDK clears that previous account's transport key pair, permits, and decrypt cache.

## Related

* [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) -- read-only chain access interface
* [ViemSigner](/protocol/sdk/api-references/sdk/viemsigner.md) -- viem implementation
* [EthersSigner](/protocol/sdk/api-references/sdk/etherssigner.md) -- ethers implementation
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough


# ViemProvider

Provider adapter that wraps a viem `PublicClient` for read-only chain access. Implements [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md).

## Import

```ts
import { ViemProvider } from "@zama-fhe/sdk/viem";
```

## Usage

```ts
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { ViemProvider } from "@zama-fhe/sdk/viem";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://sepolia.infura.io/v3/YOUR_KEY"),
});

const provider = new ViemProvider({ publicClient });
```

{% hint style="info" %}
You rarely need to instantiate `ViemProvider` directly. The viem `createConfig` builds one from the `publicClient` you pass. Use this class when constructing `ZamaSDK` manually or when using the generic `createConfig`.
{% endhint %}

## Constructor

### publicClient

`PublicClient`

Viem public client for reading chain data.

```ts
const provider = new ViemProvider({
  publicClient,
});
```

## Methods

All methods are inherited from [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md).

## Related

* [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) -- interface this class implements
* [ViemSigner](/protocol/sdk/api-references/sdk/viemsigner.md) -- companion signer adapter
* [EthersProvider](/protocol/sdk/api-references/sdk/ethersprovider.md) -- ethers alternative
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough



# ViemSigner

Signer adapter that wraps a viem `WalletClient` for wallet operations. Implements [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md).

## Import

```ts
import { ViemSigner } from "@zama-fhe/sdk/viem";
```

## Usage

```ts
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { ViemSigner } from "@zama-fhe/sdk/viem";

const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});

const signer = new ViemSigner({ walletClient, ethereum: window.ethereum });
```

{% hint style="info" %}
You rarely need to instantiate `ViemSigner` directly. The viem `createConfig` builds one from the `walletClient` you pass. Use this class when constructing `ZamaSDK` manually or when using the generic `createConfig`.
{% endhint %}

## Constructor

### walletClient

`WalletClient`

Viem wallet client for signing transactions and typed data.

```ts
const signer = new ViemSigner({
  walletClient,
});
```

***

### ethereum

`EIP1193Provider | undefined`

Raw EIP-1193 provider for wallet lifecycle event subscriptions. When provided, the signer emits wallet account transitions on disconnect, account change, and chain change. Omit if you handle lifecycle events manually.

```ts
const signer = new ViemSigner({
  walletClient,
  ethereum: window.ethereum,
});
```

## Methods

All methods are inherited from [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md).

| Method                   | Behavior              |
| ------------------------ | --------------------- |
| `walletAccount` store    | Sync observable store |
| `requireWalletAccount()` | From wallet client    |
| `signTypedData()`        | Via wallet client     |
| `writeContract()`        | Via wallet client     |

{% hint style="info" %}
Wallet account transitions are only emitted when you pass the `ethereum` option. Without it, the SDK still works but credentials are not automatically cleared when users switch accounts.
{% endhint %}

## Related

* [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) -- interface this class implements
* [ViemProvider](/protocol/sdk/api-references/sdk/viemprovider.md) -- companion provider adapter
* [EthersSigner](/protocol/sdk/api-references/sdk/etherssigner.md) -- ethers alternative
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough



# EthersProvider

Provider adapter that wraps an ethers `Provider` or EIP-1193 source for read-only chain access. Implements [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md).

## Import

```ts
import { EthersProvider } from "@zama-fhe/sdk/ethers";
```

## Usage

{% tabs %}
{% tab title="ethers Provider" %}

```ts
import { JsonRpcProvider } from "ethers";
import { EthersProvider } from "@zama-fhe/sdk/ethers";

const ethersProvider = new JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_KEY");
const provider = new EthersProvider({ provider: ethersProvider });
```

{% endtab %}

{% tab title="EIP-1193" %}

```ts
import { EthersProvider } from "@zama-fhe/sdk/ethers";

const provider = new EthersProvider({ ethereum: window.ethereum! });
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
You rarely need to instantiate `EthersProvider` directly. The ethers `createConfig` builds one from the configuration you pass. Use this class when constructing `ZamaSDK` manually or when using the generic `createConfig`.
{% endhint %}

## Constructor

Pass exactly one of the two parameters below.

### provider

`ethers.Provider`

Pre-built ethers provider (e.g. `JsonRpcProvider`, `WebSocketProvider`).

```ts
const provider = new EthersProvider({
  provider: new JsonRpcProvider(rpcUrl),
});
```

***

### ethereum

`EIP1193Provider`

Raw EIP-1193 provider from the browser wallet. The adapter wraps it in a `BrowserProvider` internally.

```ts
const provider = new EthersProvider({
  ethereum: window.ethereum!,
});
```

## Methods

All methods are inherited from [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md).

## Related

* [GenericProvider](/protocol/sdk/api-references/sdk/genericprovider.md) -- interface this class implements
* [EthersSigner](/protocol/sdk/api-references/sdk/etherssigner.md) -- companion signer adapter
* [ViemProvider](/protocol/sdk/api-references/sdk/viemprovider.md) -- viem alternative
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough
# EthersSigner

Signer adapter that wraps an ethers `Signer` or EIP-1193 source for wallet operations. Implements [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md).

## Import

```ts
import { EthersSigner } from "@zama-fhe/sdk/ethers";
```

## Usage

{% tabs %}
{% tab title="Browser" %}

```ts
import { EthersSigner } from "@zama-fhe/sdk/ethers";

const signer = new EthersSigner({ ethereum: window.ethereum! });
```

{% endtab %}

{% tab title="Node.js" %}

```ts
import { Wallet, JsonRpcProvider } from "ethers";
import { EthersSigner } from "@zama-fhe/sdk/ethers";

const provider = new JsonRpcProvider(rpcUrl);
const wallet = new Wallet(privateKey, provider);

const signer = new EthersSigner({ signer: wallet });
```

{% endtab %}
{% endtabs %}

{% hint style="info" %}
You rarely need to instantiate `EthersSigner` directly. The ethers `createConfig` builds one from the configuration you pass. Use this class when constructing `ZamaSDK` manually or when using the generic `createConfig`.
{% endhint %}

## Constructor

Pass exactly one of the two parameters below.

### ethereum

`EIP1193Provider`

Raw EIP-1193 provider from the browser wallet (e.g. `window.ethereum`). Enables automatic credential cleanup on disconnect and account change.

```ts
const signer = new EthersSigner({
  ethereum: window.ethereum!,
});
```

***

### signer

`ethers.Signer`

Ethers signer for server-side or scripted use. `subscribe()` is not available in this mode.

```ts
const provider = new JsonRpcProvider(rpcUrl);
const wallet = new Wallet(privateKey, provider);

const signer = new EthersSigner({
  signer: wallet,
});
```

## Methods

All methods are inherited from [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md).

| Method                   | Browser | Node.js |
| ------------------------ | ------- | ------- |
| `walletAccount` store    | Works   | Works   |
| `requireWalletAccount()` | Works   | Works   |
| `signTypedData()`        | Works   | Works   |
| `writeContract()`        | Works   | Works   |

{% hint style="info" %}
Only the browser mode (passing `ethereum`) emits wallet account transitions. In Node.js mode, credentials are not automatically cleared on wallet changes.
{% endhint %}

## Related

* [GenericSigner](/protocol/sdk/api-references/sdk/genericsigner.md) -- interface this class implements
* [EthersProvider](/protocol/sdk/api-references/sdk/ethersprovider.md) -- companion provider adapter
* [ViemSigner](/protocol/sdk/api-references/sdk/viemsigner.md) -- viem alternative
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- full setup walkthrough



# GenericStorage

Interface for async key-value storage used to persist transport key pairs and signed permits. The SDK ships with four built-in implementations -- you only need this interface if building a custom backend.

## Import

```ts
import type { GenericStorage } from "@zama-fhe/sdk";
```

## Definition

```ts
interface GenericStorage {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}
```

## Usage

```ts
import { ZamaSDK } from "@zama-fhe/sdk";
import type { GenericStorage } from "@zama-fhe/sdk";

const redisStorage: GenericStorage = {
  async get(key) {
    return redis.get(key);
  },
  async set(key, value) {
    await redis.set(key, value);
  },
  async delete(key) {
    await redis.del(key);
  },
};

const config = createConfig({
  chains: [sepolia],
  signer: mySigner,
  provider: myProvider,
  storage: redisStorage,
  relayers: { [sepolia.id]: node() },
});
const sdk = new ZamaSDK(config);
```

## Methods

### get

```ts
get<T = unknown>(key: string): Promise<T | null>
```

Retrieve a value by key. Return `null` if the key does not exist. The generic `T` allows typed reads.

### set

```ts
set<T = unknown>(key: string, value: T): Promise<void>
```

Store a value under the given key. Overwrites any existing value. Accepts any serializable type.

### delete

```ts
delete(key: string): Promise<void>
```

Remove a key and its value. No-op if the key does not exist.

## Built-in implementations

### indexedDBStorage

```ts
import { indexedDBStorage } from "@zama-fhe/sdk";
```

Browser-based persistent storage backed by IndexedDB. Survives page reloads and browser restarts. Use this as the primary `storage` in browser apps.

```ts
const sdk = new ZamaSDK(config); // config from createConfig()
```

### memoryStorage

```ts
import { memoryStorage } from "@zama-fhe/sdk";
```

In-memory storage cleared when the process exits. Suitable for tests and throwaway scripts.

```ts
const sdk = new ZamaSDK(config); // config from createConfig()
```

### asyncLocalStorage

```ts
import { asyncLocalStorage } from "@zama-fhe/sdk/node";
```

Node.js per-request storage using [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html). Isolates transport key pairs across concurrent requests on a server.

```ts
import { asyncLocalStorage } from "@zama-fhe/sdk/node";

app.post("/api/transfer", (req, res) => {
  asyncLocalStorage.run(async () => {
    const config = createConfig({
      chains: [mySepolia],
      signer: wallet,
      storage: asyncLocalStorage,
      relayers: { [mySepolia.id]: node() },
    });
    const sdk = new ZamaSDK(config);
    await sdk.createToken("0x...").confidentialTransfer("0x...", 100n);
  });
});
```

### chromeSessionStorage

```ts
import { chromeSessionStorage } from "@zama-fhe/sdk";
```

MV3 web extension storage backed by `chrome.storage.session`. Survives service worker restarts and is shared across popup, background, and content script contexts. Cleared when the browser closes.

Pass as `permitStorage` (not `storage`) to persist signed permits across service worker restarts:

```ts
const config = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  storage: indexedDBStorage,
  permitStorage: chromeSessionStorage,
  relayers: { [mySepolia.id]: web() },
});
const sdk = new ZamaSDK(config);
```

## Related

* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) -- accepts `storage` and `permitStorage` parameters
* [Configuration guide](/protocol/sdk/guides/configuration.md) -- storage selection guidance



# Errors

All SDK errors extend `ZamaError` and carry a `.code` string you can match on. Catch them with `instanceof` or use `matchZamaError` for exhaustive handling.

## Import

```ts
import {
  ZamaError,
  matchZamaError,
  SigningRejectedError,
  SigningFailedError,
  EncryptionFailedError,
  DecryptionFailedError,
  TransactionRevertedError,
  InvalidTransportKeyPairError,
  TransportKeyPairExpiredError,
  NoCiphertextError,
  RelayerRequestFailedError,
  ConfigurationError,
  InsufficientConfidentialBalanceError,
  InsufficientERC20BalanceError,
  BalanceCheckUnavailableError,
  ERC20ReadFailedError,
  DelegationSelfNotAllowedError,
  DelegationDelegateEqualsContractError,
  DelegationExpiryUnchangedError,
  DelegationNotFoundError,
  DelegationExpiredError,
  DelegationCooldownError,
  DelegationContractIsSelfError,
  DelegationExpirationTooSoonError,
  DelegationNotPropagatedError,
  SignerRequiredError,
  SignerNotConfiguredError,
  WalletNotConnectedError,
  WalletAccountNotReadyError,
  ChainMismatchError,
  AclPausedError,
} from "@zama-fhe/sdk";
```

## matchZamaError

Pattern-match on error codes instead of chaining `instanceof` checks. Returns the handler's return value, or `undefined` if the error is not a `ZamaError` and no `_` wildcard is provided.

```ts
import { matchZamaError } from "@zama-fhe/sdk";

const message = matchZamaError(error, {
  SIGNING_REJECTED: () => "Please approve the transaction in your wallet",
  ENCRYPTION_FAILED: () => "Encryption failed — try again",
  TRANSACTION_REVERTED: (e) => `Transaction failed: ${e.message}`,
  NO_CIPHERTEXT: () => "No confidential balance — shield tokens first",
  INSUFFICIENT_CONFIDENTIAL_BALANCE: () => "Insufficient confidential balance",
  INSUFFICIENT_ERC20_BALANCE: () => "Not enough tokens to shield",
  BALANCE_CHECK_UNAVAILABLE: () => "Sign to verify your balance first",
  ERC20_READ_FAILED: () => "Could not read token balance -- check your connection",
  _: (e) => `Unexpected error: ${e}`,
});
```

| Parameter  | Type                                                                 | Description                             |
| ---------- | -------------------------------------------------------------------- | --------------------------------------- |
| `error`    | `unknown`                                                            | The caught error                        |
| `handlers` | `Record<ErrorCode, (e: ZamaError) => T> & { _?: (e: unknown) => T }` | Map of error codes to handler functions |

The `_` wildcard catches any `ZamaError` not explicitly handled. Handlers receive the error typed as the base `ZamaError` (`.code`, `.message`); to read subclass fields like `InsufficientConfidentialBalanceError.available` or `RelayerRequestFailedError.statusCode`, narrow with `instanceof` (see the detail sections below).

## Error summary

| Error class                             | Code                                  | Description                                                                    |
| --------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `SigningRejectedError`                  | `SIGNING_REJECTED`                    | User rejected the wallet signature                                             |
| `SigningFailedError`                    | `SIGNING_FAILED`                      | Wallet signature failed (connectivity, firmware)                               |
| `EncryptionFailedError`                 | `ENCRYPTION_FAILED`                   | FHE encryption failed in the Web Worker                                        |
| `DecryptionFailedError`                 | `DECRYPTION_FAILED`                   | FHE decryption failed                                                          |
| `TransactionRevertedError`              | `TRANSACTION_REVERTED`                | On-chain transaction reverted (includes failed ERC-20 approvals during shield) |
| `InvalidTransportKeyPairError`          | `INVALID_KEYPAIR`                     | Relayer rejected transport key pair (stale or malformed)                       |
| `TransportKeyPairExpiredError`          | `KEYPAIR_EXPIRED`                     | Transport key pair expired — user must re-sign                                 |
| `NoCiphertextError`                     | `NO_CIPHERTEXT`                       | No encrypted balance for this account                                          |
| `RelayerRequestFailedError`             | `RELAYER_REQUEST_FAILED`              | Relayer HTTP request failed                                                    |
| `ConfigurationError`                    | `CONFIGURATION`                       | Invalid SDK configuration or FHE worker failed to initialize                   |
| `InsufficientConfidentialBalanceError`  | `INSUFFICIENT_CONFIDENTIAL_BALANCE`   | Confidential balance too low for transfer or unshield                          |
| `InsufficientERC20BalanceError`         | `INSUFFICIENT_ERC20_BALANCE`          | ERC-20 balance too low for shield                                              |
| `BalanceCheckUnavailableError`          | `BALANCE_CHECK_UNAVAILABLE`           | Balance validation impossible (no stored permits)                              |
| `ERC20ReadFailedError`                  | `ERC20_READ_FAILED`                   | Public ERC-20 read failed (network or contract error)                          |
| `DelegationSelfNotAllowedError`         | `DELEGATION_SELF_NOT_ALLOWED`         | Delegate equals connected wallet                                               |
| `DelegationDelegateEqualsContractError` | `DELEGATION_DELEGATE_EQUALS_CONTRACT` | Delegate equals contract address                                               |
| `DelegationExpiryUnchangedError`        | `DELEGATION_EXPIRY_UNCHANGED`         | New expiry matches the current value                                           |
| `DelegationNotFoundError`               | `DELEGATION_NOT_FOUND`                | No active delegation exists                                                    |
| `DelegationExpiredError`                | `DELEGATION_EXPIRED`                  | Delegation has expired                                                         |
| `DelegationCooldownError`               | `DELEGATION_COOLDOWN`                 | Same-block delegate/revoke not allowed                                         |
| `DelegationContractIsSelfError`         | `DELEGATION_CONTRACT_IS_SELF`         | Contract address equals caller                                                 |
| `DelegationExpirationTooSoonError`      | `DELEGATION_EXPIRATION_TOO_SOON`      | Expiration date less than 1 hour in the future                                 |
| `DelegationNotPropagatedError`          | `DELEGATION_NOT_PROPAGATED`           | Delegation exists on L1 but hasn't synced to gateway yet                       |
| `SignerNotConfiguredError`              | `SIGNER_NOT_CONFIGURED`               | SDK operation needs a signer but none is configured                            |
| `WalletNotConnectedError`               | `WALLET_NOT_CONNECTED`                | Signer exists but has no connected wallet account                              |
| `WalletAccountNotReadyError`            | `WALLET_ACCOUNT_NOT_READY`            | Async signer adapter has not resolved its account yet                          |
| `ChainMismatchError`                    | `CHAIN_MISMATCH`                      | Signer and provider are on different chains                                    |
| `AclPausedError`                        | `ACL_PAUSED`                          | ACL contract is paused                                                         |

## Error details

### SignerNotConfiguredError

**Code:** `SIGNER_NOT_CONFIGURED`

Thrown when a write, sign, or decrypt operation is called on an SDK instance configured without a signer. The error carries the `operation` name that was attempted.

```ts
import { SignerNotConfiguredError } from "@zama-fhe/sdk";

try {
  await wrappedToken.shield(1000n);
} catch (error) {
  if (error instanceof SignerNotConfiguredError) {
    showConfigurationError("Configure a signer to perform this action");
  }
}
```

**How to handle:** Reconfigure the SDK with a signer.

### WalletNotConnectedError

**Code:** `WALLET_NOT_CONNECTED`

Thrown when a signer adapter is configured but does not currently have a connected wallet account.

**How to handle:** Prompt the user to connect or unlock their wallet.

### ChainMismatchError

**Code:** `CHAIN_MISMATCH`

Thrown when the signer and provider resolve to different chains during an operation. The error carries `operation`, `signerChainId`, and `providerChainId`.

```ts
matchZamaError(error, {
  CHAIN_MISMATCH: () => showError("Wallet is on the wrong network — switch and retry"),
});
```

**How to handle:** Prompt the user to switch their wallet to the chain the operation targets, then retry.

### SigningRejectedError

**Code:** `SIGNING_REJECTED`

Thrown when the user clicks "Reject" in their wallet popup during an EIP-712 signature request (transport key pair generation or session signing).

```ts
try {
  await token.balanceOf(address);
} catch (error) {
  if (error instanceof SigningRejectedError) {
    showPrompt("Approve the signature to decrypt your balance");
  }
}
```

**How to handle:** Re-prompt the user. The operation can be retried immediately.

### SigningFailedError

**Code:** `SIGNING_FAILED`

The wallet attempted to sign but failed for a reason other than user rejection — network issues, hardware wallet firmware problems, or RPC timeouts.

```ts
matchZamaError(error, {
  SIGNING_FAILED: (e) => console.error("Wallet signing error:", e.message),
});
```

**How to handle:** Check wallet connectivity and firmware version. Retry after the underlying issue is resolved.

### EncryptionFailedError

**Code:** `ENCRYPTION_FAILED`

FHE encryption failed inside the Web Worker. Usually caused by missing WASM support or restrictive CSP headers.

```ts
matchZamaError(error, {
  ENCRYPTION_FAILED: () => showError("Encryption failed — check browser compatibility"),
});
```

**How to handle:** Verify your Content Security Policy includes `wasm-unsafe-eval`. Check that the browser supports WebAssembly.

### DecryptionFailedError

**Code:** `DECRYPTION_FAILED`

FHE decryption failed. Can occur after an interrupted unshield or when the transport key pair state is corrupted.

```ts
matchZamaError(error, {
  DECRYPTION_FAILED: () => showError("Decryption failed — try refreshing"),
});
```

**How to handle:** If this happens after a page reload during unshield, use `loadPendingUnshield()` and `resumeUnshield()` to recover. Otherwise, calling `sdk.permits.clear()` and retrying forces a fresh transport key pair.

### TransactionRevertedError

**Code:** `TRANSACTION_REVERTED`

An on-chain transaction reverted. The error `.message` includes the revert reason when available.

```ts
matchZamaError(error, {
  TRANSACTION_REVERTED: (e) => showError(`Transaction reverted: ${e.message}`),
});
```

**How to handle:** Inspect the revert reason. Common causes: insufficient balance, expired operator approval, or attempting to finalize an already-finalized unwrap.

### InvalidTransportKeyPairError

**Code:** `INVALID_KEYPAIR`

The relayer rejected the transport key pair. This happens when the key pair is malformed or was generated for a different chain.

```ts
matchZamaError(error, {
  INVALID_KEYPAIR: () => {
    sdk.permits.clear();
    showPrompt("Transport key pair rejected — sign again to continue");
  },
});
```

**How to handle:** Clear credentials and prompt the user to re-sign. The SDK generates a fresh transport key pair on the next operation.

### TransportKeyPairExpiredError

**Code:** `KEYPAIR_EXPIRED`

The transport key pair exceeded its TTL (default: 30 days). The user needs to sign again to generate a new one.

```ts
matchZamaError(error, {
  KEYPAIR_EXPIRED: () => showPrompt("Transport key pair expired — sign to refresh"),
});
```

**How to handle:** Prompt the user to re-sign. Adjust `transportKeyPairTTL` in the SDK constructor if the default TTL of 30 days is not appropriate.

### NoCiphertextError

**Code:** `NO_CIPHERTEXT`

The account has no encrypted balance on-chain — it has never shielded tokens for this contract. This is different from a zero balance.

```ts
try {
  const balance = await token.balanceOf(address);
  showBalance(balance); // could be 0n
} catch (error) {
  if (error instanceof NoCiphertextError) {
    showEmptyState("Shield tokens to get started");
  }
}
```

**How to handle:** Show an empty state in your UI prompting the user to shield tokens. Do not display "0" — there is no balance to show.

### RelayerRequestFailedError

**Code:** `RELAYER_REQUEST_FAILED`

The HTTP request to the relayer failed. The error exposes `.statusCode` for further diagnosis.

```ts
matchZamaError(error, {
  RELAYER_REQUEST_FAILED: (e) => {
    if (e.statusCode === 401) showError("Authentication failed");
    else showError("Relayer unavailable — try again later");
  },
});
```

**How to handle:** Check `relayerUrl` in your transport config. If using API key authentication, verify the `auth` option. Check relayer service health.

## "No balance" vs "zero balance"

These are distinct states:

* **`NoCiphertextError`** — the account has never shielded tokens. There is no encrypted balance to decrypt. Show an empty state like "No confidential balance".
* **Balance of `0n`** — the account has shielded before but currently holds zero. Show "Balance: 0".

```ts
try {
  const balance = await token.balanceOf(address);
  showBalance(balance); // 0n is a valid balance
} catch (error) {
  if (error instanceof NoCiphertextError) {
    showEmptyState("Shield tokens to get started");
  }
}
```

### ConfigurationError

**Code:** `CONFIGURATION`

Thrown when the SDK configuration is invalid (e.g. forbidden chain ID, unsupported signer type) or when the FHE worker fails to initialize (e.g. missing WASM support, terminated relayer).

```ts
matchZamaError(error, {
  CONFIGURATION: (e) => console.error("Configuration error:", e.message),
});
```

**How to handle:** Check your transport config, CSP headers, and that the relayer has not been terminated. If the error mentions worker initialization, verify WASM support and `wasm-unsafe-eval` in your CSP.

### InsufficientConfidentialBalanceError

**Code:** `INSUFFICIENT_CONFIDENTIAL_BALANCE`

The decrypted confidential balance is less than the requested amount. Thrown by `confidentialTransfer()` and `unshield()` before submitting the transaction. Exposes structured details for UI display.

| Property    | Type      | Description                                |
| ----------- | --------- | ------------------------------------------ |
| `requested` | `bigint`  | Amount the caller requested                |
| `available` | `bigint`  | Decrypted balance at the time of the check |
| `token`     | `Address` | Token contract address                     |

```ts
import { InsufficientConfidentialBalanceError } from "@zama-fhe/sdk";

try {
  await token.confidentialTransfer("0xRecipient", 1000n);
} catch (error) {
  if (error instanceof InsufficientConfidentialBalanceError) {
    showError(`Insufficient balance: you have ${error.available}, need ${error.requested}`);
  }
}
```

**How to handle:** Show the user their current balance and the shortfall. No retry will help until the balance increases (via shielding or receiving a transfer).

### InsufficientERC20BalanceError

**Code:** `INSUFFICIENT_ERC20_BALANCE`

The public ERC-20 balance is less than the requested shield amount. Thrown by `shield()` before submitting the transaction. This is a public read with no signing requirement, so it works for all wallet types.

| Property    | Type      | Description                              |
| ----------- | --------- | ---------------------------------------- |
| `requested` | `bigint`  | Amount the caller requested to shield    |
| `available` | `bigint`  | ERC-20 balance at the time of the check  |
| `token`     | `Address` | Underlying ERC-20 token contract address |

```ts
import { InsufficientERC20BalanceError } from "@zama-fhe/sdk";

try {
  await wrappedToken.shield(1000n);
} catch (error) {
  if (error instanceof InsufficientERC20BalanceError) {
    showError(`Not enough tokens: you have ${error.available}, need ${error.requested}`);
  }
}
```

**How to handle:** Show the user their public token balance and the shortfall. They need to acquire more tokens before shielding.

### BalanceCheckUnavailableError

**Code:** `BALANCE_CHECK_UNAVAILABLE`

Balance validation could not be performed. For confidential operations (`confidentialTransfer`, `unshield`), this means no stored permits exist and the SDK cannot decrypt the balance without prompting a wallet signature. For `shield`, this means the ERC-20 balance read failed.

```ts
matchZamaError(error, {
  BALANCE_CHECK_UNAVAILABLE: () =>
    showPrompt("Sign to verify your balance, or use skipBalanceCheck"),
});
```

**How to handle:** Either call `sdk.permits.grantPermit([token.address])` first to sign permits, or pass `skipBalanceCheck: true` to bypass validation (useful for smart wallets that cannot produce EIP-712 signatures).

### ERC20ReadFailedError

**Code:** `ERC20_READ_FAILED`

A public ERC-20 read (e.g. `balanceOf`) failed due to a network or contract error. Thrown by `shield()` when the pre-flight balance check cannot read the underlying token balance. This is distinct from `BalanceCheckUnavailableError`, which indicates missing credentials for confidential balance decryption.

```ts
matchZamaError(error, {
  ERC20_READ_FAILED: () => showError("Could not read token balance -- check your connection"),
});
```

**How to handle:** Check network connectivity and RPC endpoint health. The underlying ERC-20 contract may also be paused or unreachable. Retry the shield operation.

### DelegationSelfNotAllowedError

**Code:** `DELEGATION_SELF_NOT_ALLOWED`

Thrown when attempting to delegate decryption to your own address. The ACL contract rejects `delegate === msg.sender`.

```ts
matchZamaError(error, {
  DELEGATION_SELF_NOT_ALLOWED: () => showError("Cannot delegate to yourself"),
});
```

**How to handle:** Use a different delegate address.

### DelegationCooldownError

**Code:** `DELEGATION_COOLDOWN`

Only one delegate or revoke operation is allowed per `(delegator, delegate, contract)` tuple per block.

```ts
matchZamaError(error, {
  DELEGATION_COOLDOWN: () => showError("Please wait for the next block before retrying"),
});
```

**How to handle:** Wait for the next block before retrying the operation.

### DelegationNotFoundError

**Code:** `DELEGATION_NOT_FOUND`

No active delegation exists for the given `(delegator, delegate, contract)` tuple. Thrown when attempting to revoke a non-existent delegation, and by `decryptBalanceAs` / `batchDecryptBalancesAs` (including on cache hits) when the delegation is missing or has been revoked.

```ts
matchZamaError(error, {
  DELEGATION_NOT_FOUND: () => showError("No active delegation found"),
});
```

**How to handle:** Verify the delegator, delegate, and contract addresses are correct.

### DelegationExpiredError

**Code:** `DELEGATION_EXPIRED`

The delegation has expired and can no longer be used for decryption.

```ts
matchZamaError(error, {
  DELEGATION_EXPIRED: () => showPrompt("Delegation expired — create a new one"),
});
```

**How to handle:** Create a new delegation.

### DelegationExpirationTooSoonError

**Code:** `DELEGATION_EXPIRATION_TOO_SOON`

Thrown client-side before submitting a `delegateDecryption` transaction when the expiration date is less than 1 hour in the future. This mirrors the on-chain `ExpirationDateBeforeOneHour` revert in the ACL contract.

```ts
matchZamaError(error, {
  DELEGATION_EXPIRATION_TOO_SOON: () =>
    showError("Expiration must be at least 1 hour in the future"),
});
```

**How to handle:** Choose a later expiration date (at least 1 hour from now) or omit it for a permanent delegation.

### DelegationDelegateEqualsContractError

**Code:** `DELEGATION_DELEGATE_EQUALS_CONTRACT`

Thrown client-side before submitting a `delegateDecryption` transaction when the delegate address equals the token contract address.

```ts
matchZamaError(error, {
  DELEGATION_DELEGATE_EQUALS_CONTRACT: () => showError("Cannot delegate to the contract itself"),
});
```

**How to handle:** Use a different delegate address.

### DelegationExpiryUnchangedError

**Code:** `DELEGATION_EXPIRY_UNCHANGED`

Thrown client-side (after an RPC read) when the new expiration date matches the current on-chain value. Saves gas by skipping a no-op transaction.

```ts
matchZamaError(error, {
  DELEGATION_EXPIRY_UNCHANGED: () => showInfo("Delegation already has this expiration date"),
});
```

**How to handle:** No action needed — the delegation is already configured as requested.

### DelegationContractIsSelfError

**Code:** `DELEGATION_CONTRACT_IS_SELF`

Caught from the on-chain `SenderCannotBeContractAddress` revert. The contract address passed to the delegation call equals the caller address.

```ts
matchZamaError(error, {
  DELEGATION_CONTRACT_IS_SELF: () => showError("Contract address cannot be the caller address"),
});
```

**How to handle:** Verify the contract address parameter is the token contract, not the caller's address.

### DelegationNotPropagatedError

**Code:** `DELEGATION_NOT_PROPAGATED`

Thrown when `decryptBalanceAs` fails with an HTTP 500 in a delegated context. The most likely cause is that the delegation was recently granted on L1 but hasn't propagated to the gateway (on Arbitrum) yet — cross-chain sync typically takes 1–2 minutes.

```ts
matchZamaError(error, {
  DELEGATION_NOT_PROPAGATED: () => showInfo("Delegation is still syncing — retry in 1–2 minutes"),
});
```

**How to handle:** Wait 1–2 minutes after the delegation transaction is mined, then retry. If the error persists, the gateway or relayer may be experiencing an unrelated issue.

### AclPausedError

**Code:** `ACL_PAUSED`

Caught from the on-chain `EnforcedPause` revert. The ACL contract is paused, temporarily disabling all delegation operations.

```ts
matchZamaError(error, {
  ACL_PAUSED: () => showError("Delegation is temporarily disabled"),
});
```

**How to handle:** Wait for the ACL contract to be unpaused. This is an operator-level action — contact the protocol team if this persists.

{% hint style="info" %}
The SDK automatically maps known ACL Solidity revert reasons to typed `ZamaError` subclasses on `delegateDecryption` and `revokeDelegation`. Unmapped reverts fall through to `TransactionRevertedError`. See the [delegation method reference](/protocol/sdk/api-references/sdk/delegation.md#methods) for the full mapping.
{% endhint %}

## Common problems

| Symptom                                   | Cause                                       | Fix                                                                                        |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `SigningRejectedError` on every decrypt   | Wallet rejects EIP-712 signature            | Verify wallet supports `eth_signTypedData_v4`. Hardware wallets may need firmware updates. |
| Balance always `undefined`                | Encrypted value is zero (never shielded)    | Catch `NoCiphertextError` and show an empty state.                                         |
| `ConfigurationError` on first operation   | FHE worker failed to initialize             | Check CSP headers (`wasm-unsafe-eval`), transport config, and WASM support.                |
| `EncryptionFailedError`                   | FHE encryption failed during an operation   | Add `wasm-unsafe-eval` to your CSP headers.                                                |
| `DecryptionFailedError` after page reload | Unshield was interrupted mid-flow           | Call `loadPendingUnshield()` on mount, then `resumeUnshield()` to complete.                |
| `TransactionRevertedError` on finalize    | Unwrap already finalized or invalid tx hash | Check unwrap state. If already finalized, call `clearPendingUnshield()`.                   |
| `RelayerRequestFailedError`               | Wrong relayer URL or missing auth           | Verify `relayerUrl` in transport config. Check the `auth` option if using API key auth.    |
| `InsufficientConfidentialBalanceError`    | Confidential balance < requested amount     | Show the user their balance and the shortfall. Wait for incoming transfers or shield more. |
| `InsufficientERC20BalanceError`           | ERC-20 balance < requested shield amount    | Show the user their public token balance. They need to acquire more tokens.                |
| `BalanceCheckUnavailableError`            | No stored permits for balance check         | Call `sdk.permits.grantPermit([token.address])` first, or pass `skipBalanceCheck: true`.   |
| `ERC20ReadFailedError`                    | ERC-20 balanceOf read failed                | Check network connectivity and RPC endpoint. Retry the shield.                             |

## Related

* [Error handling guide](/protocol/sdk/guides/handle-errors.md) — practical patterns for catching and displaying errors
* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — SDK constructor and permit management



# Contract builders

Every builder returns a `ReadContractConfig` or `WriteContractConfig` — a plain object with the contract address, ABI fragment, function name, and encoded args:

```ts
type ReadContractConfig = {
  address: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
};

type WriteContractConfig = ReadContractConfig & {
  value?: bigint;
  gas?: bigint;
};
```

{% hint style="warning" %}
The [Token API](/protocol/sdk/api-references/sdk/token.md) (`shield`, `unshield`, `confidentialTransfer`, etc.) handles contract calls, encryption, and multi-step flows for you. Use builders only when you need raw contract-level control — custom transaction pipelines, batching, or integrating with systems that expect ABI-encoded call data.
{% endhint %}

## Import

```ts
import {
  nameContract,
  symbolContract,
  decimalsContract,
  balanceOfContract,
  allowanceContract,
  approveContract,
  confidentialBalanceOfContract,
  confidentialTransferContract,
  confidentialTransferFromContract,
  isOperatorContract,
  setOperatorContract,
  confidentialTotalSupplyContract,
  inferredTotalSupplyContract,
  rateContract,
  wrapContract,
  unwrapContract,
  unwrapFromBalanceContract,
  finalizeUnwrapContract,
  underlyingContract,
  supportsInterfaceContract,
  isConfidentialTokenContract,
  isConfidentialWrapperContract,
  delegateForUserDecryptionContract,
  revokeDelegationContract,
  getDelegationExpiryContract,
  isHandleDelegatedContract,
  getTokenPairsContract,
  getTokenPairsLengthContract,
  getTokenPairsSliceContract,
  getTokenPairContract,
  getConfidentialTokenAddressContract,
  getTokenAddressContract,
  isConfidentialTokenValidContract,
} from "@zama-fhe/sdk";
```

## ERC-20 basics

| Builder                                    | What it does               |
| ------------------------------------------ | -------------------------- |
| `nameContract(token)`                      | Read token name            |
| `symbolContract(token)`                    | Read token symbol          |
| `decimalsContract(token)`                  | Read token decimals        |
| `balanceOfContract(token, owner)`          | Read public ERC-20 balance |
| `allowanceContract(token, owner, spender)` | Read ERC-20 allowance      |
| `approveContract(token, spender, value)`   | Approve ERC-20 spending    |

## Confidential operations

| Builder                                                                          | What it does                |
| -------------------------------------------------------------------------------- | --------------------------- |
| `confidentialBalanceOfContract(token, user)`                                     | Read encrypted balance      |
| `confidentialTransferContract(token, to, encryptedAmount, inputProof)`           | Encrypted transfer          |
| `confidentialTransferFromContract(token, from, to, encryptedAmount, inputProof)` | Operator encrypted transfer |
| `isOperatorContract(token, holder, spender)`                                     | Check operator approval     |
| `setOperatorContract(token, operator, until?)`                                   | Set operator approval       |
| `confidentialTotalSupplyContract(token)`                                         | Read encrypted total supply |
| `rateContract(token)`                                                            | Read conversion rate        |

## Wrapping and unwrapping

| Builder                                                              | What it does                          |
| -------------------------------------------------------------------- | ------------------------------------- |
| `wrapContract(wrapper, to, amount)`                                  | Wrap ERC-20 tokens                    |
| `unwrapContract(token, from, to, encryptedAmount, inputProof)`       | Request unwrap                        |
| `unwrapFromBalanceContract(token, from, to, encryptedBalance)`       | Unwrap using on-chain encrypted value |
| `finalizeUnwrapContract(wrapper, unwrapRequestId, cleartext, proof)` | Finalize unwrap                       |
| `underlyingContract(wrapper)`                                        | Read underlying ERC-20 address        |
| `inferredTotalSupplyContract(wrapper)`                               | Read inferred plaintext total supply  |

Use `totalSupplyQueryOptions` / React `useTotalSupply` for cached reads — they call `inferredTotalSupply()` under the hood.

## Discovery and detection

| Builder                                         | What it does                          |
| ----------------------------------------------- | ------------------------------------- |
| `supportsInterfaceContract(token, interfaceId)` | ERC-165 interface check               |
| `isConfidentialTokenContract(token)`            | Check if token is ERC-7984 compliant  |
| `isConfidentialWrapperContract(token)`          | Check if token is an ERC-7984 wrapper |

## Registry

| Builder                                                         | What it does                                           |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| `getTokenPairsContract(registry)`                               | Fetch all token wrapper pairs                          |
| `getTokenPairsLengthContract(registry)`                         | Get the number of pairs                                |
| `getTokenPairsSliceContract(registry, fromIndex, toIndex)`      | Fetch a range of pairs (pagination)                    |
| `getTokenPairContract(registry, index)`                         | Fetch a single pair by index                           |
| `getConfidentialTokenAddressContract(registry, tokenAddress)`   | Look up confidential token for a plain ERC-20          |
| `getTokenAddressContract(registry, confidentialTokenAddress)`   | Look up plain ERC-20 for a confidential token          |
| `isConfidentialTokenValidContract(registry, confidentialToken)` | Check if a confidential token is valid in the registry |

{% hint style="info" %}
The [WrappersRegistry class](/protocol/sdk/api-references/sdk/wrappersregistry.md) wraps these builders with automatic address resolution. Use builders only when you need raw contract-level control.
{% endhint %}

## Delegation

| Builder                                                                 | What it does                               |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| `delegateForUserDecryptionContract(acl, delegate, contract, expiry)`    | Grant decryption delegation                |
| `revokeDelegationContract(acl, delegate, contract)`                     | Revoke decryption delegation               |
| `getDelegationExpiryContract(acl, delegator, delegate, contract)`       | Read delegation expiry date                |
| `isHandleDelegatedContract(acl, delegator, delegate, contract, handle)` | Check if a handle is covered by delegation |

## Executing calls

### With viem

Typed read/write helpers are available from the `/viem` subpath:

```ts
import { readConfidentialBalanceOfContract, writeWrapContract } from "@zama-fhe/sdk/viem";

// Read — pass a PublicClient
const encryptedValue = await readConfidentialBalanceOfContract(
  publicClient,
  tokenAddress,
  userAddress,
);

// Write — pass a WalletClient
const txHash = await writeWrapContract(walletClient, wrapperAddress, recipient, amount);
```

### With ethers

Equivalent helpers are available from the `/ethers` subpath:

```ts
import { readConfidentialBalanceOfContract, writeWrapContract } from "@zama-fhe/sdk/ethers";

// Read — pass a Provider
const encryptedValue = await readConfidentialBalanceOfContract(provider, tokenAddress, userAddress);

// Write — pass a Signer
const txHash = await writeWrapContract(signer, wrapperAddress, recipient, amount);
```

### With raw config objects

If you use neither viem nor ethers, destructure the config and pass it to your execution layer:

```ts
import { wrapContract } from "@zama-fhe/sdk";

const { address, abi, functionName, args } = wrapContract(wrapperAddress, recipient, amount);

// Use with any contract interaction library
```

{% hint style="info" %}
All builders validate addresses at call time. A malformed address throws immediately instead of producing a confusing on-chain revert.
{% endhint %}

## Related

* [Token](/protocol/sdk/api-references/sdk/token.md) — high-level API that wraps these builders
* [Event Decoders](/protocol/sdk/api-references/sdk/event-decoders.md) — decode on-chain logs into typed events


# FheArtifactCache

Persistent cache for the FHE encryption key and public parameters (CRS). Stores large binary artifacts in a `GenericStorage` backend (e.g. IndexedDB) so they are not re-downloaded on every page load. Cache keys are scoped by chain ID.

`web()` and `node()` relayer transports create an `FheArtifactCache` internally — you configure it through the `fheArtifactStorage` and `fheArtifactCacheTTL` options on the transport factory.

{% hint style="info" %}
**`web()`** defaults to IndexedDB — artifact caching persists across page reloads. **`node()`** defaults to `MemoryStorage` — artifacts are cached in-process but lost on restart. Pass a custom `GenericStorage` for cross-restart persistence.
{% endhint %}

## Import

`FheArtifactCache` is an **internal class** — it is not exported from `@zama-fhe/sdk`, and you do not import or instantiate it directly. Configure artifact caching through the `web()` / `node()` transport factories (below); the constructor and methods are documented here only as internal reference.

## Usage

In most cases you don't instantiate `FheArtifactCache` directly. Instead, configure artifact caching through the relayer transport factory:

{% tabs %}
{% tab title="Default (IndexedDB)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

// web() uses IndexedDB artifact cache by default — no config needed
const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web(),
  },
});
```

{% endtab %}

{% tab title="Custom storage" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { IndexedDBStorage } from "@zama-fhe/sdk";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web({
      // Custom IndexedDB database name
      fheArtifactStorage: new IndexedDBStorage("MyAppArtifacts", 1, "fhe"),
      // Revalidate every 12 hours instead of the default 24h
      fheArtifactCacheTTL: 43_200,
    }),
  },
});
```

{% endtab %}

{% tab title="node() (default)" %}

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { node } from "@zama-fhe/sdk/node";
import { sepolia } from "@zama-fhe/sdk/chains";

// node() defaults to MemoryStorage — artifacts are cached in-process
const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: node({ poolSize: 4 }),
  },
});
```

{% hint style="info" %}
The default `MemoryStorage` caches artifacts for the lifetime of the process but does **not** survive restarts. For cross-restart persistence, pass any `GenericStorage`-compatible backend (e.g. Redis, filesystem adapter). Pass `fheArtifactStorage: null` to disable caching entirely.
{% endhint %}
{% endtab %}
{% endtabs %}

## Constructor

```ts
new FheArtifactCache(opts);
```

| Field        | Type                  | Description                                                                                                                                |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `storage`    | `GenericStorage`      | Persistent key-value backend (e.g. `IndexedDBStorage`, `MemoryStorage`).                                                                   |
| `chainId`    | `number`              | Chain ID to scope cache keys.                                                                                                              |
| `relayerUrl` | `string`              | Relayer URL used to fetch the manifest during revalidation.                                                                                |
| `ttl`        | `number \| undefined` | Cache TTL in **seconds**. Default: `86400` (24 h). Set to `0` to revalidate on every operation.                                            |
| `logger`     | `GenericLogger`       | Logger for cache diagnostics (revalidation, storage degradation). Silent by default — the SDK threads its `createConfig({ logger })` here. |

## Methods

### fetchFheEncryptionKeyBytes

```ts
cache.fetchFheEncryptionKeyBytes(fetcher): Promise<PublicKeyResult>
```

Returns the cached FHE encryption key bytes, calling `fetcher` only on a cache miss. Concurrent calls are deduplicated. The result is memoized in memory and persisted to storage as base64.

**Parameters:**

| Name      | Type                             | Description                                                                        |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `fetcher` | `() => Promise<PublicKeyResult>` | Called when no cached value exists. Return `{ publicKeyId, publicKey }` or `null`. |

**Returns:** `Promise<{ publicKeyId: string; publicKey: Uint8Array } | null>`

***

### getPublicParams

```ts
cache.getPublicParams(bits, fetcher): Promise<PublicParamsResult>
```

Returns the cached CRS (public parameters) for a given bit size, calling `fetcher` only on a cache miss. Concurrent calls for the same bit size are deduplicated.

**Parameters:**

| Name      | Type                                | Description                                                                              |
| --------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `bits`    | `number`                            | Bit size of the CRS to fetch (e.g. `2048`).                                              |
| `fetcher` | `() => Promise<PublicParamsResult>` | Called when no cached value exists. Return `{ publicParamsId, publicParams }` or `null`. |

**Returns:** `Promise<{ publicParamsId: string; publicParams: Uint8Array } | null>`

***

### revalidateIfDue

```ts
cache.revalidateIfDue(): Promise<boolean>
```

Checks whether cached artifacts are still fresh by issuing HTTP conditional requests (`ETag` / `If-None-Match`, `Last-Modified` / `If-Modified-Since`) against the artifact CDN URLs discovered from the relayer manifest.

* Returns `true` if the cache was invalidated (caller should re-fetch).
* Returns `false` if artifacts are still fresh or revalidation is not yet due.

Concurrent calls are coalesced. On transient failures (network errors, 5xx), the cache fails open and retries after 5 minutes.

## Relayer config options

When using `web()` or `node()` transport factories, configure artifact caching with these options:

### fheArtifactStorage

`GenericStorage | undefined`

Persistent storage backend for caching FHE artifacts.

* **`web()`**: defaults to `new IndexedDBStorage("FheArtifactCache", 1, "artifacts")` — caching is enabled automatically.
* **`node()`**: defaults to `new MemoryStorage()` — in-process caching.

FHE public parameters can be several MB — avoid `localStorage`-backed storage which caps at \~5 MB.

{% hint style="warning" %}
**Not to be confused with `ZamaProvider.storage`** which stores credentials and decrypted balances.
{% endhint %}

### fheArtifactCacheTTL

`number | undefined`

Cache TTL in **seconds**. Default: `86400` (24 h). Set to `0` to revalidate on every operation. Ignored when `fheArtifactStorage` is not set.

## How it works

1. **First load** — The SDK fetches the FHE encryption key and CRS from the relayer, stores them as base64 in the configured storage backend, and caches them in memory.
2. **Subsequent loads** — The SDK reads from storage (instant), skipping the multi-MB network download.
3. **Revalidation** — Periodically (controlled by `ttl`), the cache issues `HEAD` requests with conditional headers to the artifact CDN. If the server returns 405 (Method Not Allowed), the cache falls back to a `GET` request. If artifacts haven't changed (304), only timestamps are updated. If they have changed (200), the entire cache is cleared and artifacts are re-fetched on next use.
4. **Fail-open** — On network errors or malformed manifests, the cache continues serving stale data and retries revalidation after 5 minutes.

## Storage keys

Cache entries are scoped by chain ID:

| Key pattern                   | Content                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `fhe:pubkey:{chainId}`        | FHE encryption key (base64 + metadata)                  |
| `fhe:params:{chainId}:{bits}` | Public parameters for a given bit size                  |
| `fhe:params-index:{chainId}`  | Array of cached bit sizes (for cold-start revalidation) |

## Related

* [RelayerWeb](/protocol/sdk/api-references/sdk/relayerweb.md) — browser relayer that creates an `FheArtifactCache` internally
* [RelayerNode](/protocol/sdk/api-references/sdk/relayernode.md) — Node.js relayer variant
* [GenericStorage](/protocol/sdk/api-references/sdk/genericstorage.md) — storage interface used by the cache
* [Configuration guide](/protocol/sdk/guides/configuration.md) — network presets and relayer setup


# Event decoders

Utilities for decoding raw `eth_getLogs` entries into typed event objects.

## Import

```ts
import {
  decodeOnChainEvents,
  TOKEN_TOPICS,
  decodeConfidentialTransfer,
  decodeWrap,
  decodeUnwrapRequested,
  decodeUnwrapFinalized,
  findWrap,
  findUnwrapRequested,
  // ACL delegation events
  ACL_TOPICS,
  decodeDelegatedForUserDecryption,
  decodeRevokedDelegationForUserDecryption,
  decodeAclEvent,
  decodeAclEvents,
  findDelegatedForUserDecryption,
  findRevokedDelegationForUserDecryption,
} from "@zama-fhe/sdk";
```

## decodeOnChainEvents

`(logs: RawLog[]) => OnChainEvent[]`

Decodes an array of raw log entries into typed event objects. Each returned event has an `.eventName` discriminator.

```ts
const logs = await publicClient.getLogs({
  address: tokenAddress,
  topics: [TOKEN_TOPICS],
});

const events = decodeOnChainEvents(logs);

for (const event of events) {
  switch (event.eventName) {
    case "ConfidentialTransfer":
      console.log(event.from, event.to, event.encryptedAmount);
      break;
    case "Wrap":
      console.log(event.to, event.roundedAmount, event.encryptedWrappedAmount);
      break;
    case "UnwrapRequested":
      console.log(event.receiver, event.unwrapRequestId);
      break;
    case "UnwrapFinalized":
      console.log(event.receiver, event.cleartextAmount);
      break;
  }
}
```

| Parameter | Type       | Description                                                 |
| --------- | ---------- | ----------------------------------------------------------- |
| `logs`    | `RawLog[]` | Raw log entries from `eth_getLogs` or a transaction receipt |

**Returns:** `OnChainEvent[]` — each event has an `.eventName` of `"ConfidentialTransfer"`, `"Wrap"`, `"UnwrapRequested"`, or `"UnwrapFinalized"`.

{% hint style="info" %}
A shield emits **both** a `ConfidentialTransfer(from=zeroAddress, …)` and a `Wrap` event. `Wrap.encryptedWrappedAmount` is the same FHE handle as the co-emitted `ConfidentialTransfer.encryptedAmount` — use `Wrap` as the shield marker (it carries the cleartext `roundedAmount`) and correlate the two halves rather than counting both.
{% endhint %}

## TOKEN\_TOPICS

`Hex[]`

Array of topic hashes for all supported token events. Pass this to `eth_getLogs` to fetch relevant logs in a single RPC call.

```ts
const logs = await publicClient.getLogs({
  address: tokenAddress,
  topics: [TOKEN_TOPICS],
  fromBlock: startBlock,
  toBlock: "latest",
});
```

## Individual decoders

Each decoder takes a single log entry and returns a typed event object, or `null` if the log does not match.

| Decoder                           | Event type             | Description                                  |
| --------------------------------- | ---------------------- | -------------------------------------------- |
| `decodeConfidentialTransfer(log)` | `ConfidentialTransfer` | Encrypted transfer between accounts          |
| `decodeWrap(log)`                 | `Wrap`                 | Tokens wrapped (shielded)                    |
| `decodeUnwrapRequested(log)`      | `UnwrapRequested`      | Unwrap initiated; includes `unwrapRequestId` |
| `decodeUnwrapFinalized(log)`      | `UnwrapFinalized`      | Unwrap completed; includes `unwrapRequestId` |

```ts
import { decodeConfidentialTransfer } from "@zama-fhe/sdk";

for (const log of receipt.logs) {
  const transfer = decodeConfidentialTransfer(log);
  if (transfer) {
    console.log(`Transfer from ${transfer.from} to ${transfer.to}`);
  }
}
```

## Convenience finders

Search a log array and return the first matching event.

### findWrap

`(logs: RawLog[]) => WrapEvent | null`

Finds the first `Wrap` event in a set of logs. Useful after a shield transaction.

```ts
import { findWrap } from "@zama-fhe/sdk";

const receipt = await walletClient.waitForTransactionReceipt({ hash: txHash });
const wrapEvent = findWrap(receipt.logs);
if (wrapEvent) {
  console.log(`Wrapped ${wrapEvent.roundedAmount} tokens`);
}
```

### findUnwrapRequested

`(logs: RawLog[]) => UnwrapRequestedEvent | null`

Finds the first `UnwrapRequested` event in a set of logs. Useful after an unshield initiation.

```ts
import { findUnwrapRequested } from "@zama-fhe/sdk";

const unwrapEvent = findUnwrapRequested(receipt.logs);
if (unwrapEvent) {
  console.log(`Unwrap requested for ${unwrapEvent.encryptedAmount}`);
}
```

## ACL delegation events

The ACL contract emits events when delegations are created or revoked. These are separate from token events — they use their own topic hashes and decoders.

### Import

```ts
import {
  ACL_TOPICS,
  AclTopics,
  decodeDelegatedForUserDecryption,
  decodeRevokedDelegationForUserDecryption,
  decodeAclEvent,
  decodeAclEvents,
  findDelegatedForUserDecryption,
  findRevokedDelegationForUserDecryption,
} from "@zama-fhe/sdk";
```

### ACL\_TOPICS

`Hex[]`

Array of topic hashes for both ACL delegation events. Pass this to `eth_getLogs` to fetch delegation events from the ACL contract.

```ts
const logs = await publicClient.getLogs({
  address: aclAddress,
  topics: [ACL_TOPICS],
  fromBlock: startBlock,
  toBlock: "latest",
});
```

### Individual decoders

| Decoder                                         | Event type                           | Description                   |
| ----------------------------------------------- | ------------------------------------ | ----------------------------- |
| `decodeDelegatedForUserDecryption(log)`         | `DelegatedForUserDecryption`         | Delegation created or renewed |
| `decodeRevokedDelegationForUserDecryption(log)` | `RevokedDelegationForUserDecryption` | Delegation revoked            |

### DelegatedForUserDecryptionEvent

| Field               | Type      | Description                                 |
| ------------------- | --------- | ------------------------------------------- |
| `eventName`         | `string`  | `"DelegatedForUserDecryption"`              |
| `delegator`         | `Address` | Account granting access                     |
| `delegate`          | `Address` | Account receiving access                    |
| `contractAddress`   | `Address` | Contract the delegation applies to          |
| `delegationCounter` | `bigint`  | Monotonic delegation counter                |
| `oldExpirationDate` | `bigint`  | Previous expiration (0 if first delegation) |
| `newExpirationDate` | `bigint`  | New expiration timestamp                    |

### RevokedDelegationForUserDecryptionEvent

| Field               | Type      | Description                            |
| ------------------- | --------- | -------------------------------------- |
| `eventName`         | `string`  | `"RevokedDelegationForUserDecryption"` |
| `delegator`         | `Address` | Account that granted access            |
| `delegate`          | `Address` | Account that had access                |
| `contractAddress`   | `Address` | Contract the revocation applies to     |
| `delegationCounter` | `bigint`  | Monotonic delegation counter           |
| `oldExpirationDate` | `bigint`  | Expiration date before revocation      |

### Convenience finders

| Finder                                         | Returns                                                 |
| ---------------------------------------------- | ------------------------------------------------------- |
| `findDelegatedForUserDecryption(logs)`         | First `DelegatedForUserDecryptionEvent` or null         |
| `findRevokedDelegationForUserDecryption(logs)` | First `RevokedDelegationForUserDecryptionEvent` or null |

### Batch decoders

| Decoder                 | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `decodeAclEvent(log)`   | Try both ACL decoders on a single log, return first match    |
| `decodeAclEvents(logs)` | Batch-decode an array of logs, skipping unrecognized entries |

{% hint style="info" %}
ACL delegation events are **not** included in `TOKEN_TOPICS` or `decodeOnChainEvents`. They are emitted by the ACL contract, not by token contracts. Use `ACL_TOPICS` and `decodeAclEvents` separately.
{% endhint %}

## Related

* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) — delegation API with on-chain event examples
* [Token](/protocol/sdk/api-references/sdk/token.md) — high-level API for token operations



# Delegations

`sdk.delegations` manages on-chain decryption delegation through the ACL contract. The delegate never receives the delegator's private keys — they sign with their own wallet, and the relayer verifies the on-chain delegation.

For a step-by-step walkthrough, see the [Delegated decryption](/protocol/sdk/guides/delegated-decryption.md) guide.

## Import

Accessed as a namespace on the `ZamaSDK` instance:

```ts
import { ZamaSDK } from "@zama-fhe/sdk";

const sdk = new ZamaSDK(config); // config from createConfig()
sdk.delegations.delegateDecryption(/* ... */);
sdk.delegations.revokeDelegation(/* ... */);
sdk.delegations.isActive(/* ... */);
sdk.delegations.getExpiry(/* ... */);
```

## Methods

### delegateDecryption

`(params: { contractAddress: Address; delegateAddress: Address; expirationDate?: Date }) => Promise<TransactionResult>`

Grants decryption rights for a confidential contract to another address. Calls `ACL.delegateForUserDecryption()` on-chain.

```ts
// Permanent delegation
await sdk.delegations.delegateDecryption({
  contractAddress: "0xConfidentialToken",
  delegateAddress: "0xDelegate",
});

// With expiration
await sdk.delegations.delegateDecryption({
  contractAddress: "0xConfidentialToken",
  delegateAddress: "0xDelegate",
  expirationDate: new Date("2027-12-31T00:00:00Z"),
});
```

Returns `{ txHash: Hex; receipt: TransactionReceipt }`.

{% hint style="warning" %}
`expirationDate` must be at least 1 hour in the future. The SDK validates this before sending the transaction.
{% endhint %}

When no `expirationDate` is provided, the SDK uses `2^64 - 1` (effectively permanent). The SDK accepts a standard JavaScript `Date` and converts it to a UTC Unix timestamp internally — timezone normalization is handled automatically.

**Throws:**

* `SignerNotConfiguredError` — no signer configured
* `ChainMismatchError` — signer and provider are on different chains
* `WalletNotConnectedError` — wallet is not connected
* `WalletAccountNotReadyError` — wallet account is not ready
* `DelegationExpirationTooSoonError` — expiration date less than 1 hour in the future
* `DelegationSelfNotAllowedError` — delegate address equals the connected wallet
* `DelegationDelegateEqualsContractError` — delegate address equals the contract address
* `DelegationExpiryUnchangedError` — new expiry matches the current on-chain expiry
* `DelegationCooldownError` — only one delegate/revoke per `(delegator, delegate, contract)` per block
* `AclPausedError` — the ACL contract is paused
* `TransactionRevertedError` — on-chain revert for an unmapped reason

### revokeDelegation

`(params: { contractAddress: Address; delegateAddress: Address }) => Promise<TransactionResult>`

Revokes decryption delegation for a confidential contract. Calls `ACL.revokeDelegationForUserDecryption()` on-chain.

```ts
await sdk.delegations.revokeDelegation({
  contractAddress: "0xConfidentialToken",
  delegateAddress: "0xDelegate",
});
```

Returns `{ txHash: Hex; receipt: TransactionReceipt }`.

**Throws:**

* `SignerNotConfiguredError` — no signer configured
* `ChainMismatchError` — signer and provider are on different chains
* `WalletNotConnectedError` — wallet is not connected
* `WalletAccountNotReadyError` — wallet account is not ready
* `DelegationNotFoundError` — no delegation exists for this `(delegator, delegate, contract)` tuple
* `DelegationCooldownError` — only one delegate/revoke per tuple per block
* `AclPausedError` — the ACL contract is paused
* `TransactionRevertedError` — on-chain revert for an unmapped reason

### isActive

`(params: { contractAddress: Address; delegatorAddress: Address; delegateAddress: Address }) => Promise<boolean>`

Checks whether a delegation is active. Returns `true` if the delegation exists and has not expired.

Signer-independent — works without a configured signer.

```ts
const active = await sdk.delegations.isActive({
  contractAddress: "0xConfidentialToken",
  delegatorAddress: "0xDelegator",
  delegateAddress: "0xDelegate",
});
```

### getExpiry

`(params: { contractAddress: Address; delegatorAddress: Address; delegateAddress: Address }) => Promise<bigint>`

Returns the expiration timestamp of a delegation as a Unix timestamp in seconds.

Signer-independent — works without a configured signer.

```ts
const expiry = await sdk.delegations.getExpiry({
  contractAddress: "0xConfidentialToken",
  delegatorAddress: "0xDelegator",
  delegateAddress: "0xDelegate",
});

// Convert to a JavaScript Date:
const expiryDate = new Date(Number(expiry) * 1000);
```

| Return value | Meaning                              |
| ------------ | ------------------------------------ |
| `0n`         | No delegation (never set or revoked) |
| `2^64 - 1`   | Permanent                            |
| Other        | UTC Unix timestamp in seconds        |

## Events

The SDK emits events during delegation operations. Subscribe via the `onEvent` callback in `createConfig`:

| Event                       | When                        |
| --------------------------- | --------------------------- |
| `DelegationSubmitted`       | Delegation transaction sent |
| `RevokeDelegationSubmitted` | Revocation transaction sent |

```ts
import { ZamaSDK, ZamaSDKEvents } from "@zama-fhe/sdk";

const config = createConfig({
  // ...
  onEvent: (event) => {
    if (event.type === ZamaSDKEvents.DelegationSubmitted) {
      console.log("Delegation tx:", event.txHash);
    }
    if (event.type === ZamaSDKEvents.RevokeDelegationSubmitted) {
      console.log("Revocation tx:", event.txHash);
    }
  },
});
```

## Delegation states

A delegation between `(delegator, delegate, contract)` can be in one of four states:

| State         | On-chain expiry          | How to detect                                                                                                           |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Never set** | `0n`                     | `getExpiry()` returns `0n`                                                                                              |
| **Active**    | Future timestamp         | `isActive()` returns `true`                                                                                             |
| **Expired**   | Past non-zero timestamp  | `isActive()` returns `false`, `getExpiry()` returns a non-zero past value                                               |
| **Revoked**   | `0n` (reset by contract) | Indistinguishable from **never set** via state reads — use `RevokedDelegationForUserDecryption` events to differentiate |

The ACL contract resets the expiry to `0n` on revocation, so `DelegationNotFoundError` covers both the never-set and revoked cases. To distinguish them, query `RevokedDelegationForUserDecryption` events using the [ACL event decoders](/protocol/sdk/api-references/sdk/event-decoders.md#acl-delegation-events).

## Low-level contract builders

For direct ACL contract calls without the `Delegations` namespace, use the contract builders:

```ts
import { isHandleDelegatedContract } from "@zama-fhe/sdk";

const isDelegated = await publicClient.readContract(
  isHandleDelegatedContract(aclAddress, delegatorAddress, delegateAddress, tokenAddress, handle),
);
```

See [Contract Builders](/protocol/sdk/api-references/sdk/contract-builders.md#delegation) for the full list.

## On-chain delegation events

Parse delegation events from transaction receipts or `getLogs` results:

```ts
import {
  ACL_TOPICS,
  decodeDelegatedForUserDecryption,
  decodeRevokedDelegationForUserDecryption,
  findDelegatedForUserDecryption,
  findRevokedDelegationForUserDecryption,
  decodeAclEvents,
} from "@zama-fhe/sdk";

const logs = await publicClient.getLogs({
  address: aclAddress,
  topics: [ACL_TOPICS],
  fromBlock: startBlock,
  toBlock: "latest",
});

const events = decodeAclEvents(logs);

const delegated = findDelegatedForUserDecryption(receipt.logs);
if (delegated) {
  console.log(
    `${delegated.delegator} delegated to ${delegated.delegate}`,
    `for ${delegated.contractAddress}`,
    `expires at ${delegated.newExpirationDate}`,
  );
}
```

See [Event Decoders](/protocol/sdk/api-references/sdk/event-decoders.md#acl-delegation-events) for the full list of ACL event decoders.

## Related

* [Delegated decryption guide](/protocol/sdk/guides/delegated-decryption.md) — step-by-step walkthrough
* [Token.decryptBalanceAs](/protocol/sdk/api-references/sdk/token.md#decryptbalanceas) — decrypt a delegator's balance
* [Token.batchDecryptBalancesAs](/protocol/sdk/api-references/sdk/token.md#token-batchdecryptbalancesas-static) — batch delegated decryption
* [Contract builders](/protocol/sdk/api-references/sdk/contract-builders.md#delegation) — low-level ACL delegation builders
* [useDelegateDecryption](/protocol/sdk/api-references/react/usedelegatedecryption.md) — React hook to grant delegation
* [useRevokeDelegation](/protocol/sdk/api-references/react/userevokedelegation.md) — React hook to revoke delegation
* [useDelegationStatus](/protocol/sdk/api-references/react/usedelegationstatus.md) — React hook to query delegation status
* [useDecryptBalanceAs](/protocol/sdk/api-references/react/usedecryptbalanceas.md) — React hook to decrypt as a delegate
* [useBatchDecryptBalancesAs](/protocol/sdk/api-references/react/usebatchdecryptbalancesas.md) — React hook for batch delegation decryption


# Network presets

## Chain objects (recommended)

Import pre-configured chain objects from `@zama-fhe/sdk/chains`. Each chain includes contract addresses, relayer URLs, chain IDs, and an `id` alias for use in relayer config keys.

```ts
import { sepolia, mainnet, hoodi, hardhat } from "@zama-fhe/sdk/chains";
```

### Available chains

| Chain     | Chain ID   | Network            |
| --------- | ---------- | ------------------ |
| `mainnet` | `1`        | Ethereum Mainnet   |
| `sepolia` | `11155111` | Sepolia Testnet    |
| `hoodi`   | `560048`   | Hoodi Testnet      |
| `hardhat` | `31337`    | Local Hardhat node |

### What each chain includes

Each chain object implements the `FheChain` interface:

| Field                                       | Type                        | Description                                                                                              |
| ------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `id`                                        | `number`                    | Chain identifier                                                                                         |
| `gatewayChainId`                            | `number`                    | Chain ID of the gateway                                                                                  |
| `relayerUrl`                                | `string`                    | Default relayer endpoint for this network                                                                |
| `network`                                   | `EIP1193Provider \| string` | Default RPC URL or EIP-1193 provider for this network                                                    |
| `aclContractAddress`                        | `Address`                   | ACL contract address                                                                                     |
| `kmsContractAddress`                        | `Address`                   | KMS contract address                                                                                     |
| `inputVerifierContractAddress`              | `Address`                   | Input verifier contract address                                                                          |
| `verifyingContractAddressDecryption`        | `Address`                   | EIP-712 verifying contract for decrypt operations                                                        |
| `verifyingContractAddressInputVerification` | `Address`                   | EIP-712 verifying contract for encrypt operations                                                        |
| `registryAddress`                           | `Address \| undefined`      | Token wrapper registry contract address (undefined for chains without a deployed registry, e.g. Hardhat) |
| `executorAddress`                           | `Address \| undefined`      | TFHEExecutor contract address (cleartext mode only, undefined for real FHE chains)                       |
| `auth`                                      | `Auth \| undefined`         | Authentication for the relayer endpoint                                                                  |
| `kmsSignerPrivateKey`                       | `Hex \| undefined`          | KMS signer private key for EIP-712 verification (cleartext mode)                                         |
| `inputSignerPrivateKey`                     | `Hex \| undefined`          | Input signer private key for EIP-712 verification (cleartext mode)                                       |

### Usage with `createConfig`

Pass chain objects in the `chains` array and use `chain.id` as relayer keys:

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, mainnet } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [sepolia, mainnet],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web(),
    [mainnet.id]: web(),
  },
});
```

Per-chain overrides (e.g. `relayerUrl`, `network`) are set by spreading the chain preset in the `chains` array. The chain object provides all contract addresses automatically.

### Browser apps

In browser environments, proxy relayer requests through your backend to avoid exposing API keys. Override `relayerUrl` in the chain definition:

```ts
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;
```

### Server apps

On the server, use `node()` with pool options. Chain data (network, relayerUrl) comes from the preset:

```ts
import { node } from "@zama-fhe/sdk/node";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = {
  ...sepolia,
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;
// Then in createConfig: relayers: { [mySepolia.id]: node({ poolSize: 4 }) }
```

### Local development

Use the `hardhat` chain with a `cleartext()` relayer:

```ts
import { createConfig } from "@zama-fhe/sdk/viem";
import { cleartext } from "@zama-fhe/sdk";
import { hardhat } from "@zama-fhe/sdk/chains";

const config = createConfig({
  chains: [hardhat],
  publicClient,
  walletClient,
  relayers: {
    [hardhat.id]: cleartext(),
  },
});
```

### Multiple networks

Support multiple networks by listing them in the `chains` array:

```ts
import { createConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, mainnet, type FheChain } from "@zama-fhe/sdk/chains";

const mySepolia = { ...sepolia, relayerUrl: "/api/relayer/11155111" } as const satisfies FheChain;
const myMainnet = { ...mainnet, relayerUrl: "/api/relayer/1" } as const satisfies FheChain;

const config = createConfig({
  chains: [mySepolia, myMainnet],
  wagmiConfig,
  relayers: {
    [mySepolia.id]: web(),
    [myMainnet.id]: web(),
  },
});
```

## Legacy preset configs (removed)

The legacy `SepoliaConfig`, `MainnetConfig`, and `HardhatConfig` objects are no longer exported from `@zama-fhe/sdk`. Use the chain presets from `@zama-fhe/sdk/chains` with `createConfig` instead:

```ts
// Before (removed)
// import { SepoliaConfig, MainnetConfig } from "@zama-fhe/sdk";

// After
import { sepolia, mainnet } from "@zama-fhe/sdk/chains";
```

## DefaultRegistryAddresses

A convenience export of built-in registry addresses for known chains (Mainnet, Sepolia, Hoodi) as a `Record<number, Address>` map. Used internally by the [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) class.

```ts
import { DefaultRegistryAddresses } from "@zama-fhe/sdk";

// { 1: "0xeb5015fF...", 11155111: "0x2f0750Bb...", 560048: "0x1807aE2f..." }
console.log(DefaultRegistryAddresses);
```

{% hint style="info" %}
`hardhat` has no registry address by default. Pass one via `registryAddresses` when creating a [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md), or set `registryAddress` on the chain definition.
{% endhint %}

## Related

* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) — high-level registry query API
* [Configuration guide](/protocol/sdk/guides/configuration.md) — full chains, relayers, signer, and storage setup
* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — SDK constructor reference



# React reference

**Welcome to the React reference!**

API reference for the `@zama-fhe/react-sdk` package. Each page documents a single hook or component with parameters, return values, and working code examples. All hooks are built on TanStack Query with automatic cache invalidation and cached decryption.

## Where to go next

🟨 Go to [**ZamaProvider**](/protocol/sdk/api-references/react/zamaprovider.md) for the required context provider that wires up the relayer, signer, and storage.

🟨 Go to [**useConfidentialBalance**](/protocol/sdk/api-references/react/useconfidentialbalance.md) to decrypt and display a single token's balance.

🟨 Go to [**useShield**](/protocol/sdk/api-references/react/useshield.md) to convert public ERC-20 tokens into confidential form.

🟨 Go to [**useConfidentialTransfer**](/protocol/sdk/api-references/react/useconfidentialtransfer.md) to send encrypted amounts on-chain.

🟨 Go to [**useUnshield**](/protocol/sdk/api-references/react/useunshield.md) to withdraw confidential tokens back to public ERC-20.

🟨 Go to [**Query keys**](/protocol/sdk/api-references/react/query-keys.md) for manual cache invalidation and custom query composition.

## Help center

Ask technical questions, discuss with the community, or report a bug.

* [Community forum](https://community.zama.org/c/zama-protocol/15)
* [Discord channel](https://discord.com/invite/zama)
* [Open an issue](https://github.com/zama-ai/sdk/issues) on the SDK repository



# ZamaProvider

Context provider that supplies the Zama SDK to all descendant hooks. Wrap your application (or the subtree that uses confidential tokens) with this component.

## Import

```ts
import { ZamaProvider } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="wagmi setup" %}

```tsx
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: { [sepolia.id]: http("https://sepolia.infura.io/v3/YOUR_KEY") },
});

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
  network: "https://sepolia.infura.io/v3/YOUR_KEY",
} as const satisfies FheChain;

const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: {
    [mySepolia.id]: web(),
  },
});
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider config={zamaConfig}>
          <YourApp />
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

{% endtab %}

{% tab title="viem setup" %}

```tsx
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { web } from "@zama-fhe/sdk/web";
import { createConfig } from "@zama-fhe/sdk/viem";
import { sepolia as sepoliaFhe, type FheChain } from "@zama-fhe/sdk/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://sepolia.infura.io/v3/YOUR_KEY"),
});
const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});

const mySepolia = {
  ...sepoliaFhe,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const zamaConfig = createConfig({
  chains: [mySepolia],
  publicClient,
  walletClient,
  relayers: {
    [mySepolia.id]: web(),
  },
});
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ZamaProvider config={zamaConfig}>
        <YourApp />
      </ZamaProvider>
    </QueryClientProvider>
  );
}
```

{% endtab %}

{% tab title="cleartext (local dev)" %}

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZamaProvider } from "@zama-fhe/react-sdk";
import { cleartext } from "@zama-fhe/sdk";
import { createConfig } from "@zama-fhe/sdk/viem";
import { hardhat } from "@zama-fhe/sdk/chains";

const zamaConfig = createConfig({
  chains: [hardhat],
  publicClient,
  walletClient,
  relayers: {
    [hardhat.id]: cleartext(),
  },
});
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ZamaProvider config={zamaConfig}>
        <YourApp />
      </ZamaProvider>
    </QueryClientProvider>
  );
}
```

{% endtab %}
{% endtabs %}

## Props

```ts
import { type ZamaProviderProps } from "@zama-fhe/react-sdk";
```

### config

`ZamaConfig`

Configuration object created by [`createConfig`](/protocol/sdk/guides/configuration.md). Wires together chains, relayers, signer, and storage for the SDK.

## Related

* [Configuration guide](/protocol/sdk/guides/configuration.md)
* [Permit Model](/protocol/sdk/concepts/permit-model.md)



# useConfidentialBalance

Decrypt a single token's confidential balance. Calls `token.balanceOf(owner)` which reads the encrypted value on-chain and decrypts it via the SDK. Cached clear values are served instantly — the expensive relayer round-trip only happens when the on-chain encrypted value changes. Pass `refetchInterval` to poll for updates.

## Import

```ts
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useConfidentialBalance } from "@zama-fhe/react-sdk";
import { useAccount } from "wagmi";

function TokenBalance({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { address } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useConfidentialBalance({
    address: tokenAddress,
    account: address,
  });

  if (isLoading) return <span>Decrypting...</span>;
  if (error) return <span>Error: {error.message}</span>;
  return <span>{balance?.toString()}</span>;
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
import { createConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, mainnet, type FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

const myMainnet = {
  ...mainnet,
  relayerUrl: "https://your-app.com/api/relayer/1",
} as const satisfies FheChain;

export const zamaConfig = createConfig({
  chains: [mySepolia, myMainnet],
  relayers: {
    [mySepolia.id]: web(),
    [myMainnet.id]: web(),
  },
  wagmiConfig,
});
```

{% endtab %}
{% endtabs %}

## Parameters

```ts
import { type UseConfidentialBalanceConfig } from "@zama-fhe/react-sdk";
```

### address

`Address`

Contract address of the confidential token.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
const { data } = useConfidentialBalance({
  address: "0xToken",
  account: address,
});
```

{% endtab %}
{% endtabs %}

***

### account

`Address | undefined`

Address whose balance to read. The query is disabled while `undefined`. Pass the connected wallet address from wagmi's `useAccount()`.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useAccount } from "wagmi";

const { address } = useAccount();
const { data } = useConfidentialBalance({
  address: "0xToken",
  account: address,
});
```

{% endtab %}
{% endtabs %}

## Return Type

```ts
import { type UseConfidentialBalanceOptions } from "@zama-fhe/react-sdk";
```

The `data` property is `bigint | undefined` -- the decrypted token balance.

## Related

* [useConfidentialBalances](/protocol/sdk/api-references/react/useconfidentialbalances.md) -- batch variant for multiple tokens
* [Check Balances guide](/protocol/sdk/guides/check-balances.md)
* [Query Keys](/protocol/sdk/api-references/react/query-keys.md) -- `zamaQueryKeys.confidentialBalance`



# useConfidentialBalances

Decrypt and poll multiple tokens' confidential balances in a single query. Returns a `BatchBalancesResult` with results and errors maps. Each token uses the same cached decryption strategy as [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md).

## Import

```ts
import { useConfidentialBalances } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useConfidentialBalances } from "@zama-fhe/react-sdk";

function Portfolio({ tokens }: { tokens: `0x${string}`[] }) {
  const { data: balances, isLoading } = useConfidentialBalances({
    addresses: tokens,
    account: "0xYourAddress",
  });

  if (isLoading) return <span>Decrypting...</span>;

  return (
    <ul>
      {tokens.map((addr) => (
        <li key={addr}>
          {addr}: {balances?.results.get(addr)?.toString() ?? "—"}
        </li>
      ))}
    </ul>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

### addresses

`Address[]`

Array of confidential token contract addresses to query.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
const { data } = useConfidentialBalances({
  addresses: ["0xTokenA", "0xTokenB", "0xTokenC"],
  account: address,
});
```

{% endtab %}
{% endtabs %}

***

### account

`Address | undefined`

Address whose balances to read. The query is disabled while `undefined`. Pass the connected wallet address from wagmi's `useAccount()`.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
const { data } = useConfidentialBalances({
  addresses: ["0xTokenA", "0xTokenB"],
  account: "0xOwner",
});
```

{% endtab %}
{% endtabs %}

## Return Type

The `data` property is `BatchBalancesResult | undefined` -- an object with `results: Map<Address, bigint>` (successfully decrypted balances) and `errors: Map<Address, ZamaError>` (per-token errors).

## Related

* [useConfidentialBalance](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- single-token variant
* [Check Balances guide](/protocol/sdk/guides/check-balances.md)
* [Query Keys](/protocol/sdk/api-references/react/query-keys.md) -- `zamaQueryKeys.confidentialBalances`


# useConfidentialTransfer

Send confidential ERC-20 tokens privately. The amount is encrypted client-side before the transaction is submitted on-chain. Automatically invalidates the [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) cache on success.

## Import

```ts
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useConfidentialTransfer } from "@zama-fhe/react-sdk";

function SendButton({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { mutateAsync: transfer, isPending } = useConfidentialTransfer({
    address: tokenAddress,
  });

  async function handleSend() {
    const { txHash, receipt } = await transfer({
      to: "0xRecipient",
      amount: 1000n,
    });
    console.log("Confirmed in block", receipt.blockNumber);
  }

  return (
    <button onClick={handleSend} disabled={isPending}>
      {isPending ? "Sending..." : "Send"}
    </button>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

```ts
import { type UseConfidentialTransferConfig } from "@zama-fhe/react-sdk";
```

### address

`Address`

Contract address of the confidential token.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
const { mutateAsync: transfer } = useConfidentialTransfer({
  address: "0xToken",
});
```

{% endtab %}
{% endtabs %}

### optimistic

`boolean | undefined`

Default: `false`. When `true`, optimistically subtracts the transfer amount from the cached confidential balance before the transaction confirms; rolls back on error.

```tsx
const { mutateAsync: transfer } = useConfidentialTransfer({
  address: "0xToken",
  optimistic: true,
});
```

***

## Mutation variables

The function passed to `mutate` / `mutateAsync` accepts:

### to

`Address`

Recipient address.

### amount

`bigint`

Number of tokens to transfer (in the token's smallest unit). Encrypted before submission.

### skipBalanceCheck

`boolean | undefined`

Skip confidential balance validation before submitting. Defaults to `false`. Useful for smart wallets that cannot produce EIP-712 signatures for balance decryption.

### onEncryptComplete

`(() => void) | undefined`

Fires when FHE encryption of the amount completes.

### onTransferSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the transfer transaction is submitted on-chain.

```tsx
await transfer({
  to: "0xRecipient",
  amount: 1000n,
  onEncryptComplete: () => updateUI("Encrypted, submitting..."),
  onTransferSubmitted: (txHash) => updateUI(`Submitted: ${txHash}`),
});
```

**Throws:**

* `InsufficientConfidentialBalanceError` -- if the confidential balance is less than `amount` (exposes `requested`, `available`, `token`)
* `BalanceCheckUnavailableError` -- if balance validation is required but decryption is not possible (no stored permits). Grant a permit first with `useGrantPermit`, or use `skipBalanceCheck: true`

## Return Type

The `data` property (after a successful mutation) is `{ txHash: Hex, receipt: TransactionReceipt }`.

* **`txHash`** -- Transaction hash submitted to the network.
* **`receipt`** -- Confirmed transaction receipt from the chain.

## Related

* [useConfidentialTransferFrom](/protocol/sdk/api-references/react/useconfidentialtransferfrom.md) -- operator transfer variant
* [Transfer Privately guide](/protocol/sdk/guides/transfer-privately.md)
* [useConfidentialBalance](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- auto-invalidated on success



# useConfidentialTransferFrom

Transfer confidential tokens on behalf of an owner who approved you as an operator. The sender must have been granted approval via [`useConfidentialSetOperator`](/protocol/sdk/api-references/react/useconfidentialsetoperator.md) before calling this hook. Automatically invalidates the [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) cache on success.

## Import

```ts
import { useConfidentialTransferFrom } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useConfidentialTransferFrom } from "@zama-fhe/react-sdk";

function OperatorTransfer({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { mutateAsync: transferFrom, isPending } = useConfidentialTransferFrom(tokenAddress);

  async function handleTransfer() {
    const { txHash, receipt } = await transferFrom({
      from: "0xOwner",
      to: "0xRecipient",
      amount: 500n,
    });
    console.log("Confirmed in block", receipt.blockNumber);
  }

  return (
    <button onClick={handleTransfer} disabled={isPending}>
      {isPending ? "Transferring..." : "Transfer"}
    </button>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Contract address of the confidential token. Passed positionally as the first argument.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
const { mutateAsync: transferFrom } = useConfidentialTransferFrom("0xToken");
```

{% endtab %}
{% endtabs %}

***

## Mutation variables

The function passed to `mutate` / `mutateAsync` accepts:

### from

`Address`

Owner address whose tokens are being transferred. The connected wallet must have operator approval from this address.

### to

`Address`

Recipient address.

### amount

`bigint`

Number of tokens to transfer (in the token's smallest unit). Encrypted before submission.

{% tabs %}
{% tab title="component.tsx" %}

```tsx
await transferFrom({
  from: "0xOwner",
  to: "0xRecipient",
  amount: 500n,
});
```

{% endtab %}
{% endtabs %}

## Return Type

The `data` property (after a successful mutation) is `{ txHash: Hex, receipt: TransactionReceipt }`.

* **`txHash`** -- Transaction hash submitted to the network.
* **`receipt`** -- Confirmed transaction receipt from the chain.

## Related

* [useConfidentialTransfer](/protocol/sdk/api-references/react/useconfidentialtransfer.md) -- direct transfer (no operator)
* [useConfidentialSetOperator](/protocol/sdk/api-references/react/useconfidentialsetoperator.md) -- grant operator approval
* [Operator Approvals guide](/protocol/sdk/guides/operator-approvals.md)
* [useConfidentialBalance](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- auto-invalidated on success



# useShield

Mutation hook that shields public ERC-20 tokens into confidential form, handling the ERC-20 approval automatically.

## Import

```ts
import { useShield } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useShield } from "@zama-fhe/react-sdk";

function ShieldButton() {
  const { mutateAsync: shield, isPending, error } = useShield({ address: "0xWrapper" });

  async function handleShield() {
    const { txHash, receipt } = await shield({ amount: 1000n });
    console.log("Shielded in", txHash);
  }

  return (
    <button onClick={handleShield} disabled={isPending}>
      {isPending ? "Shielding..." : "Shield"}
    </button>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

```ts
import { type UseShieldConfig } from "@zama-fhe/react-sdk";
```

### address

`Address`

Address of the confidential wrapper contract.

```ts
const { mutateAsync: shield } = useShield({
  address: "0xWrapper",
});
```

### optimistic

`boolean | undefined`

Default: `false`. When `true`, optimistically adds the wrapped amount to the cached confidential balance before the transaction confirms; rolls back on error.

```ts
const { mutateAsync: shield } = useShield({
  address: "0xWrapper",
  optimistic: true,
});
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

### amount

`bigint`

Number of tokens to shield (in the token's smallest unit).

```ts
await shield({ amount: 1000n });
```

### approvalStrategy

`"exact" | "max" | "skip" | undefined`

Default: `"exact"`.

Controls how the SDK handles the ERC-20 approval before shielding.

| Strategy  | Behavior                                                                        |
| --------- | ------------------------------------------------------------------------------- |
| `"exact"` | Approves only the shielded amount. Safest, but costs an approval tx every time. |
| `"max"`   | Approves `type(uint256).max`. One approval covers all future shields.           |
| `"skip"`  | Skips the approval step entirely. Use when the wrapper is already approved.     |

```ts
await shield({ amount: 1000n, approvalStrategy: "max" });
```

### onApprovalSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the approval transaction is submitted.

### onShieldSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the shield transaction is submitted.

```ts
await shield({
  amount: 1000n,
  onApprovalSubmitted: (txHash) => updateUI(`Approval: ${txHash}`),
  onShieldSubmitted: (txHash) => updateUI(`Shield: ${txHash}`),
});
```

**Throws:**

* `InsufficientERC20BalanceError` -- if the ERC-20 balance is less than `amount` (exposes `requested`, `available`, `token`)

## Return Type

```ts
import { type ShieldParams } from "@zama-fhe/sdk/query";
```

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

Auto-invalidates the `confidentialBalance` cache on success.

## Related

* [useUnshield](/protocol/sdk/api-references/react/useunshield.md) — reverse operation, unshield back to public ERC-20
* [WrappedToken.shield](/protocol/sdk/api-references/sdk/wrappedtoken.md#shield) — imperative equivalent on the `WrappedToken` class



# useUnshield

Mutation hook that unshields confidential tokens back to public ERC-20. Orchestrates the full two-step flow (unwrap + finalize) in one call.

## Import

```ts
import { useUnshield } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useUnshield } from "@zama-fhe/react-sdk";

function UnshieldButton() {
  const { mutateAsync: unshield, isPending } = useUnshield("0xWrapper");

  async function handleUnshield() {
    await unshield({
      amount: 500n,
      onUnwrapSubmitted: (txHash) => console.log("Unwrap tx:", txHash),
      onFinalizing: () => console.log("Waiting for decryption proof..."),
      onFinalizeSubmitted: (txHash) => console.log("Finalized:", txHash),
    });
  }

  return (
    <button onClick={handleUnshield} disabled={isPending}>
      {isPending ? "Unshielding..." : "Unshield"}
    </button>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```ts
const { mutateAsync: unshield } = useUnshield("0xWrapper");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

### amount

`bigint`

Number of confidential tokens to unshield.

```ts
await unshield({ amount: 500n });
```

### skipBalanceCheck

`boolean | undefined`

Skip confidential balance validation (e.g. for smart wallets that cannot produce EIP-712 signatures). Defaults to `false`.

### onUnwrapSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the unwrap transaction is submitted on-chain.

### onFinalizing

`(() => void) | undefined`

Fires when the SDK begins waiting for the decryption proof.

### onFinalizeSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the finalize transaction is submitted on-chain.

{% hint style="info" %}
Callbacks are safe — if one throws, the unshield still completes.
{% endhint %}

```ts
await unshield({
  amount: 500n,
  onUnwrapSubmitted: (txHash) => updateUI("Step 1 submitted"),
  onFinalizing: () => updateUI("Awaiting proof..."),
  onFinalizeSubmitted: (txHash) => updateUI("Complete"),
});
```

**Throws:**

* `InsufficientConfidentialBalanceError` -- if the confidential balance is less than `amount` (exposes `requested`, `available`, `token`)
* `BalanceCheckUnavailableError` -- if balance validation is required but decryption is not possible (no stored permits). Grant a permit first with `useGrantPermit`, or use `skipBalanceCheck: true`

## Return Type

```ts
import { type UnshieldParams } from "@zama-fhe/sdk/query";
```

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

Auto-invalidates the `confidentialBalance` cache on success.

## Related

* [useUnshieldAll](/protocol/sdk/api-references/react/useunshieldall.md) — unshield the entire confidential balance
* [useResumeUnshield](/protocol/sdk/api-references/react/useresumeunshield.md) — resume an interrupted unshield
* [useShield](/protocol/sdk/api-references/react/useshield.md) — reverse operation, shield public tokens
* [WrappedToken.unshield](/protocol/sdk/api-references/sdk/wrappedtoken.md#unshield) — imperative equivalent on the `WrappedToken` class



# useUnshieldAll

Mutation hook that unshields the entire confidential balance. Orchestrates the full two-step flow (unwrap + finalize) in one call.

## Import

```ts
import { useUnshieldAll } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useUnshieldAll } from "@zama-fhe/react-sdk";

function UnshieldAllButton() {
  const { mutateAsync: unshieldAll, isPending } = useUnshieldAll("0xWrapper");

  async function handleUnshieldAll() {
    await unshieldAll({
      onUnwrapSubmitted: (txHash) => console.log("Unwrap tx:", txHash),
      onFinalizing: () => console.log("Waiting for proof..."),
      onFinalizeSubmitted: (txHash) => console.log("Done:", txHash),
    });
  }

  return (
    <button onClick={handleUnshieldAll} disabled={isPending}>
      {isPending ? "Unshielding..." : "Unshield All"}
    </button>
  );
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```ts
const { mutateAsync: unshieldAll } = useUnshieldAll("0xWrapper");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time. All variables are optional.

### onUnwrapSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the unwrap transaction is submitted on-chain.

### onFinalizing

`(() => void) | undefined`

Fires when the SDK begins waiting for the decryption proof.

### onFinalizeSubmitted

`((txHash: Hex) => void) | undefined`

Fires when the finalize transaction is submitted on-chain.

{% hint style="info" %}
Callbacks are safe — if one throws, the unshield still completes.
{% endhint %}

```ts
await unshieldAll({
  onUnwrapSubmitted: (txHash) => updateUI("Step 1 submitted"),
  onFinalizing: () => updateUI("Awaiting proof..."),
  onFinalizeSubmitted: (txHash) => updateUI("Complete"),
});
```

## Return Type

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

Auto-invalidates the `confidentialBalance` cache on success.

## Related

* [useUnshield](/protocol/sdk/api-references/react/useunshield.md) — unshield a specific amount
* [useResumeUnshield](/protocol/sdk/api-references/react/useresumeunshield.md) — resume an interrupted unshield
* [useShield](/protocol/sdk/api-references/react/useshield.md) — reverse operation, shield public tokens
* [WrappedToken.unshieldAll](/protocol/sdk/api-references/sdk/wrappedtoken.md#unshieldall) — imperative equivalent on the `WrappedToken` class




# useResumeUnshield

Mutation hook that resumes an unshield interrupted between the unwrap and finalize steps (e.g. the user closed the page mid-flow).

## Import

```ts
import { useResumeUnshield } from "@zama-fhe/react-sdk";
import { loadPendingUnshield, clearPendingUnshield } from "@zama-fhe/sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useEffect } from "react";
import { useResumeUnshield, useZamaSDK } from "@zama-fhe/react-sdk";
import { loadPendingUnshield, clearPendingUnshield } from "@zama-fhe/sdk";

const TOKEN = "0xToken" as const;

function ResumeUnshieldGuard() {
  const sdk = useZamaSDK();
  const { mutateAsync: resumeUnshield } = useResumeUnshield(TOKEN);

  useEffect(() => {
    async function checkPending() {
      const pending = await loadPendingUnshield(sdk.storage, TOKEN);
      if (!pending) return;

      await resumeUnshield({ unwrapTxHash: pending });
      await clearPendingUnshield(sdk.storage, TOKEN);
    }
    checkPending();
  }, []);

  return null;
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
// config.ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia } from "@zama-fhe/sdk/chains";
import type { FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```ts
const { mutateAsync: resumeUnshield } = useResumeUnshield("0xWrapper");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

### unwrapTxHash

`Hex`

Transaction hash of the original unwrap transaction. Retrieved via `loadPendingUnshield`.

```ts
await resumeUnshield({ unwrapTxHash: "0xabc..." });
```

## Recovery pattern

The full recovery flow uses three utilities together:

1. **`loadPendingUnshield(storage, tokenAddress)`** — reads the stored unwrap tx hash (returns `null` if none).
2. **`resumeUnshield({ unwrapTxHash })`** — picks up from the finalize step using the unwrap receipt.
3. **`clearPendingUnshield(storage, tokenAddress)`** — removes the pending record after finalize succeeds.

Run this check on mount to handle any session that was interrupted.

## Return Type

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

Auto-invalidates the `confidentialBalance` cache on success.

## Related

* [useUnshield](/protocol/sdk/api-references/react/useunshield.md) — standard unshield (handles both steps automatically)
* [useUnshieldAll](/protocol/sdk/api-references/react/useunshieldall.md) — unshield the entire balance
* [WrappedToken.resumeUnshield](/protocol/sdk/api-references/sdk/wrappedtoken.md#resumeunshield) — imperative equivalent on the `WrappedToken` class



# useUnwrap

Low-level mutation hook that requests an unwrap for a specific amount. You must finalize manually with [`useFinalizeUnwrap`](/protocol/sdk/api-references/react/usefinalizeunwrap.md).

{% hint style="info" %}
Most apps should use [`useUnshield`](/protocol/sdk/api-references/react/useunshield.md) instead, which orchestrates both steps (unwrap + finalize) in a single call.
{% endhint %}

## Import

```ts
import { useUnwrap } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="UnwrapButton.tsx" %}

```tsx
import { useUnwrap } from "@zama-fhe/react-sdk";

function UnwrapButton() {
  const { mutateAsync: unwrap, isPending } = useUnwrap("0xWrapper");

  const handleUnwrap = async () => {
    const { txHash } = await unwrap({ amount: 500n });
    console.log("Unwrap requested:", txHash);
    // Parse the UnwrapRequested event with findUnwrapRequested,
    // then pass unwrapRequestId to useFinalizeUnwrap.
  };

  return (
    <button onClick={handleUnwrap} disabled={isPending}>
      {isPending ? "Unwrapping..." : "Unwrap 500"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```tsx
const { mutateAsync: unwrap } = useUnwrap("0xWrapper");
```

## Mutation variables

### amount

`bigint`

The amount of tokens to unwrap.

```tsx
await unwrap({ amount: 1000n });
```

## Return Type

The mutation resolves with `{ txHash: Hex, receipt: TransactionReceipt }`.

## Related

* [`useFinalizeUnwrap`](/protocol/sdk/api-references/react/usefinalizeunwrap.md) -- finalize the unwrap with a decryption proof
* [`useUnwrapAll`](/protocol/sdk/api-references/react/useunwrapall.md) -- unwrap the full balance
* [`useUnshield`](/protocol/sdk/api-references/react/useunshield.md) -- high-level hook that handles both steps


# useUnwrapAll

Low-level mutation hook that requests an unwrap for the full confidential balance. You must finalize manually with [`useFinalizeUnwrap`](/protocol/sdk/api-references/react/usefinalizeunwrap.md).

{% hint style="info" %}
Most apps should use [`useUnshieldAll`](/protocol/sdk/api-references/react/useunshieldall.md) instead, which orchestrates both steps in a single call.
{% endhint %}

## Import

```ts
import { useUnwrapAll } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="UnwrapAllButton.tsx" %}

```tsx
import { useUnwrapAll } from "@zama-fhe/react-sdk";

function UnwrapAllButton() {
  const { mutateAsync: unwrapAll, isPending } = useUnwrapAll("0xWrapper");

  const handleUnwrapAll = async () => {
    const { txHash } = await unwrapAll();
    console.log("Unwrap requested:", txHash);
    // Parse the UnwrapRequested event with findUnwrapRequested,
    // then pass unwrapRequestId to useFinalizeUnwrap.
  };

  return (
    <button onClick={handleUnwrapAll} disabled={isPending}>
      {isPending ? "Unwrapping..." : "Unwrap All"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```tsx
const { mutateAsync: unwrapAll } = useUnwrapAll("0xWrapper");
```

## Return Type

The mutation resolves with `{ txHash: Hex, receipt: TransactionReceipt }`.

## Related

* [`useFinalizeUnwrap`](/protocol/sdk/api-references/react/usefinalizeunwrap.md) -- finalize the unwrap with a decryption proof
* [`useUnwrap`](/protocol/sdk/api-references/react/useunwrap.md) -- unwrap a specific amount
* [`useUnshieldAll`](/protocol/sdk/api-references/react/useunshieldall.md) -- high-level hook that handles both steps



# useFinalizeUnwrap

Low-level mutation hook that finalizes an unwrap with the decryption proof. Call this after [`useUnwrap`](/protocol/sdk/api-references/react/useunwrap.md) or [`useUnwrapAll`](/protocol/sdk/api-references/react/useunwrapall.md) has submitted the initial unwrap transaction.

{% hint style="info" %}
Most apps should use [`useUnshield`](/protocol/sdk/api-references/react/useunshield.md) instead, which orchestrates both steps (unwrap + finalize) in a single call. Use this hook for custom multi-step flows where you need control over each phase.
{% endhint %}

## Import

```ts
import { useFinalizeUnwrap } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="TwoStepUnshield.tsx" %}

```tsx
import { useUnwrap, useFinalizeUnwrap } from "@zama-fhe/react-sdk";
import { findUnwrapRequested } from "@zama-fhe/sdk";

function TwoStepUnshield() {
  const { mutateAsync: unwrap } = useUnwrap("0xWrapper");
  const { mutateAsync: finalize, isPending } = useFinalizeUnwrap("0xWrapper");

  const handleUnshield = async () => {
    // Step 1: submit the unwrap and find the event in the receipt
    const { receipt } = await unwrap({ amount: 500n });
    const event = findUnwrapRequested(receipt.logs);
    if (!event?.unwrapRequestId) throw new Error("UnwrapRequested event missing");

    // Step 2: finalize with the unwrap request ID from the event
    await finalize({ unwrapRequestId: event.unwrapRequestId });
  };

  return (
    <button onClick={handleUnshield} disabled={isPending}>
      {isPending ? "Finalizing..." : "Unshield (two-step)"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. Passed positionally as the first argument.

```tsx
const { mutateAsync: finalize } = useFinalizeUnwrap("0xWrapper");
```

## Mutation variables

### unwrapRequestId

`EncryptedValue`

The unwrap request ID emitted in the `UnwrapRequested` event.

```tsx
await finalize({ unwrapRequestId: requestId });
```

## Return Type

## Related

* [`useUnwrap`](/protocol/sdk/api-references/react/useunwrap.md) -- request unwrap for a specific amount
* [`useUnwrapAll`](/protocol/sdk/api-references/react/useunwrapall.md) -- request unwrap for the full balance
* [`useResumeUnshield`](/protocol/sdk/api-references/react/useresumeunshield.md) -- resume an interrupted unshield
* [`useUnshield`](/protocol/sdk/api-references/react/useunshield.md) -- high-level hook that handles both steps



# useGrantPermit

Mutation hook that signs an EIP-712 message authorizing decryption of confidential encrypted values for a list of contract addresses. This is **not token-specific** — any contract that uses FHE-encrypted values (confidential tokens, DeFi vaults, games, etc.) can be authorized in a single wallet signature.

Call this early (e.g. after wallet connect) so that [`useDecryptValues`](/protocol/sdk/api-references/react/usedecryptvalues.md) queries fire automatically without wallet popups. Automatically invalidates [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) queries on success.

{% hint style="warning" %}
**Include all contracts you plan to decrypt.** `useDecryptValues` checks that stored permits cover every contract address in its `inputs` before firing the query. If any contract is missing, the query stays disabled.
{% endhint %}

## Import

```ts
import { useGrantPermit } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="AllowButton.tsx" %}

```tsx
import { useGrantPermit } from "@zama-fhe/react-sdk";

function AllowButton({ contracts }: { contracts: `0x${string}`[] }) {
  const { mutateAsync: grantPermit, isPending } = useGrantPermit();

  const handleAllow = async () => {
    await grantPermit(contracts);
    // All subsequent decrypt operations reuse the cached permits
  };

  return (
    <button onClick={handleAllow} disabled={isPending}>
      {isPending ? "Signing..." : "Authorize contracts"}
    </button>
  );
}
```

{% endtab %}

{% tab title="OnConnect.tsx" %}

```tsx
import { useGrantPermit } from "@zama-fhe/react-sdk";
import { useEffect } from "react";

function AuthOnConnect({ contracts }: { contracts: `0x${string}`[] }) {
  const { mutateAsync: grantPermit } = useGrantPermit();

  useEffect(() => {
    // Pre-authorize on wallet connect
    grantPermit(contracts);
  }, []);

  return null;
}
```

{% endtab %}
{% endtabs %}

## Parameters

`useGrantPermit` takes no configuration parameters.

## Mutation variables

### addresses

`Address[]`

Array of contract addresses to authorize decryption for in a single wallet signature. These can be any contracts that use FHE-encrypted values — not limited to tokens.

```tsx
// Authorize any contracts with encrypted state — tokens, auctions, governance, etc.
await grantPermit([confidentialTokenAddress, auctionAddress, governanceAddress]);
```

## Return Type

Returns a standard TanStack Query `UseMutationResult<void, Error, Address[]>`.

## Related

* [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) -- check whether stored permits cover contracts
* [`useRevokePermits`](/protocol/sdk/api-references/react/userevokepermits.md) -- revoke permits for specific contracts
* [`useClearCredentials`](/protocol/sdk/api-references/react/useclearcredentials.md) -- wipe the transport key pair and all permits
* [Permit Model](/protocol/sdk/concepts/permit-model.md) -- permit lifecycle and TTL configuration



# useHasPermit

Query hook that checks whether stored permits cover the requested contract addresses.

Returns `true` if decrypt operations can proceed without a wallet prompt. Returns `false` when no permits exist or the `permitTTL` has expired.

## Import

```ts
import { useHasPermit } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="AuthGuard.tsx" %}

```tsx
import { useHasPermit, useGrantPermit } from "@zama-fhe/react-sdk";

const CONTRACTS = ["0xTokenA", "0xTokenB"] as const;

function AuthGuard() {
  const { data: hasPermit, isLoading } = useHasPermit({ contractAddresses: [...CONTRACTS] });
  const { mutateAsync: grantPermit } = useGrantPermit();

  if (isLoading) return <span>Checking permits...</span>;

  if (!hasPermit) {
    return <button onClick={() => grantPermit([...CONTRACTS])}>Authorize wallet</button>;
  }

  return <span>Permits active — decrypts will not prompt the wallet</span>;
}
```

{% endtab %}

{% tab title="Gated decrypt" %}

```tsx
import { useHasPermit, useGrantPermit, useDecryptValues } from "@zama-fhe/react-sdk";

function GatedDecrypt({
  encryptedValue,
  contractAddress,
}: {
  encryptedValue: string;
  contractAddress: `0x${string}`;
}) {
  const { data: hasPermit } = useHasPermit({ contractAddresses: [contractAddress] });
  const { mutateAsync: grantPermit } = useGrantPermit();
  const { data, isPending } = useDecryptValues(
    [{ encryptedValue, contractAddress }],
    { enabled: !!hasPermit }, // only decrypt once authorized
  );

  if (!hasPermit) {
    return <button onClick={() => grantPermit([contractAddress])}>Authorize</button>;
  }

  if (isPending) return <span>Decrypting...</span>;
  return <output>{data?.[encryptedValue]?.toString()}</output>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### contractAddresses

`Address[]` — **required**

Contract addresses to check credentials against. Returns `true` only when stored permits cover **all** specified addresses.

```tsx
const { data: hasPermit } = useHasPermit({
  contractAddresses: ["0xContractA", "0xContractB"],
});
```

An empty list is a no-op: the query is disabled and `data` stays `undefined`, so you can call the hook unconditionally even when there is nothing to check yet.

## options

`Omit<UseQueryOptions<boolean>, "queryKey" | "queryFn">` — **optional**

Standard React Query options forwarded to the underlying query. Pass `{ enabled: false }` to mount the hook in an idle state (no work, no signature while disabled).

{% hint style="warning" %}
**You must gate decrypt queries yourself.** `useDecryptValues` does not automatically wait for permits — if you call it before `useGrantPermit`, the user sees an unexpected wallet popup. Use `useHasPermit` to conditionally enable the decrypt query via `{ enabled: !!hasPermit }` as the second argument, or conditionally render the decrypt component only when `hasPermit` is `true`.
{% endhint %}

## Return Type

```ts
// Returns UseQueryResult<boolean, Error>
```

`data` is a `boolean`:

* `true` -- stored permits cover all specified addresses; decrypts will not prompt the wallet.
* `false` -- no stored permits, or the `permitTTL` has expired. Call [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md) to authorize.

## Related

* [Avoid blind-sign wallet popups](/protocol/sdk/guides/encrypt-decrypt.md#gating-useconfidentialbalance) -- gating balance queries to avoid blind-sign popups
* [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md) -- pre-authorize contracts with one wallet signature
* [`useRevokePermits`](/protocol/sdk/api-references/react/userevokepermits.md) -- revoke permits
* [Permit Model](/protocol/sdk/concepts/permit-model.md) -- permit lifecycle and TTL configuration


# useRevokePermits

Revoke FHE permits for the current signer. With a contract list, removes direct-decrypt permits on the current chain. Without arguments, removes every permit across all chains and delegators. The transport key pair survives — use [`useClearCredentials`](/protocol/sdk/api-references/react/useclearcredentials.md) to also wipe the transport key pair.

## Import

```ts
import { useRevokePermits } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="RevokeButton.tsx" %}

```tsx
import { useRevokePermits } from "@zama-fhe/react-sdk";

function RevokeButton({ contracts }: { contracts: `0x${string}`[] }) {
  const { mutate: revokePermits, isPending, isSuccess } = useRevokePermits();

  return (
    <button onClick={() => revokePermits(contracts)} disabled={isPending}>
      {isPending ? "Revoking..." : "Revoke permits"}
    </button>
  );
}
```

{% endtab %}

{% tab title="RevokeAll.tsx" %}

```tsx
import { useRevokePermits } from "@zama-fhe/react-sdk";

function RevokeAllButton() {
  const { mutate: revokePermits, isPending } = useRevokePermits();

  return (
    <button onClick={() => revokePermits()} disabled={isPending}>
      {isPending ? "Revoking all..." : "Revoke all permits"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

`useRevokePermits` takes no constructor parameters.

## Mutation variables

### addresses

`Address[] | void`

Optional array of contract addresses. When provided, revokes permits on the current chain whose payload touches any listed address. When omitted, revokes all permits across all chains and delegators.

```ts
const { mutate: revokePermits } = useRevokePermits();

revokePermits(["0xContractA", "0xContractB"]); // current chain only
revokePermits(); // all permits, all chains
```

## Return Type

## Behavior

* Removes signed permits from the permission store.
* Auto-invalidates all [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) queries on success.
* The transport key pair is not affected — only permits are removed.

## Related

* [`useClearCredentials`](/protocol/sdk/api-references/react/useclearcredentials.md) — wipe the transport key pair and all permits
* [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md) — sign permits for contracts
* [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) — check whether stored permits cover contracts



# useClearCredentials

Wipe the transport key pair for the current signer and cascade-delete every permit (across chains and delegators) referencing it. Use this for "log out" handlers that should leave no trace.

## Import

```ts
import { useClearCredentials } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="LogoutPanel.tsx" %}

```tsx
import { useClearCredentials } from "@zama-fhe/react-sdk";

function LogoutPanel() {
  const { mutate: clearCredentials, isPending } = useClearCredentials();

  return (
    <button onClick={() => clearCredentials()} disabled={isPending}>
      {isPending ? "Clearing..." : "Clear all credentials"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

`useClearCredentials` takes no constructor parameters.

## Mutation variables

No mutation variables. Call `mutate()` or `mutateAsync()` with no arguments.

```ts
const { mutate: clearCredentials } = useClearCredentials();

clearCredentials();
```

## Return Type

## Behavior

* Wipes the transport key pair for the connected wallet.
* Cascade-deletes every permit across all chains and delegators.
* Auto-invalidates all [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) queries on success.
* After clearing, any decrypt operation will generate a fresh transport key pair and prompt for new permits.

{% hint style="info" %}
The SDK auto-clears credentials on wallet disconnect or account change when the signer adapter implements `walletAccount.subscribe()`. You do not need to call this hook manually for that case.
{% endhint %}

## Related

* [`useRevokePermits`](/protocol/sdk/api-references/react/userevokepermits.md) — remove permits without touching the transport key pair
* [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md) — sign permits for contracts
* [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) — check whether stored permits cover contracts


# useConfidentialSetOperator

Approve an operator to act on your confidential tokens (e.g. a DEX or multisig).

## Import

```ts
import { useConfidentialSetOperator } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="ApproveOperator.tsx" %}

```tsx
import { useConfidentialSetOperator } from "@zama-fhe/react-sdk";

function ApproveOperator({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { mutateAsync: setOperator, isPending } = useConfidentialSetOperator(tokenAddress);

  const handleApprove = async () => {
    const { txHash } = await setOperator({ operator: "0xDEX" });
    console.log("Operator set:", txHash);
  };

  return (
    <button onClick={handleApprove} disabled={isPending}>
      {isPending ? "Setting operator..." : "Set Operator"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential token contract. Passed positionally as the first argument.

```ts
const { mutateAsync: setOperator } = useConfidentialSetOperator("0xToken");
```

## Mutation variables

### operator

`Address`

Address of the operator to approve.

```ts
await setOperator({
  operator: "0xDEX",
});
```

***

### until

`number | undefined`

Unix timestamp (seconds) when the approval expires. Defaults to 1 hour from now.

```ts
const oneDay = Math.floor(Date.now() / 1000) + 86_400;

await setOperator({
  operator: "0xDEX",
  until: oneDay,
});
```

## Return Type

`data` is `{ txHash: Hex; receipt: TransactionReceipt }` — the submitted transaction hash and its confirmed on-chain receipt.

## Related

* [`useConfidentialIsOperator`](/protocol/sdk/api-references/react/useconfidentialisoperator.md) — check if a spender is currently an operator
* [`useConfidentialTransferFrom`](/protocol/sdk/api-references/react/useconfidentialtransferfrom.md) — operator transfer using an existing approval
* [`Token.setOperator()`](/protocol/sdk/api-references/sdk/token.md#setoperator) — imperative equivalent on the SDK class


# useConfidentialIsOperator

Check if a spender is an approved operator for a holder's confidential tokens.

## Import

```ts
import { useConfidentialIsOperator } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="OperatorStatus.tsx" %}

```tsx
import { useConfidentialIsOperator } from "@zama-fhe/react-sdk";

function OperatorStatus({
  tokenAddress,
  holder,
  spender,
}: {
  tokenAddress: `0x${string}`;
  holder: `0x${string}`;
  spender: `0x${string}`;
}) {
  const { data: isOperator, isLoading } = useConfidentialIsOperator({
    address: tokenAddress,
    holder,
    spender,
  });

  if (isLoading) return <span>Checking operator status...</span>;
  return <span>{isOperator ? "Approved" : "Not approved"}</span>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential token contract.

### holder

`Address | undefined`

Address of the token holder. The query is disabled while `undefined`.

### spender

`Address | undefined`

Address of the operator to check. The query is disabled while `undefined`.

```ts
const { data: isOperator } = useConfidentialIsOperator({
  address: "0xToken",
  holder: "0xOwner",
  spender: "0xDEX",
});
```

## Return Type

`data` is `boolean` — `true` if the spender has an active approval for the given holder, `false` otherwise.

## Suspense

Use `useConfidentialIsOperatorSuspense` inside a `<Suspense>` boundary. The hook throws a promise while loading, so `data` is always defined.

```tsx
import { useConfidentialIsOperatorSuspense } from "@zama-fhe/react-sdk";
import { Suspense } from "react";

function OperatorCheck({
  tokenAddress,
  holder,
  spender,
}: {
  tokenAddress: `0x${string}`;
  holder: `0x${string}`;
  spender: `0x${string}`;
}) {
  const { data: isOperator } = useConfidentialIsOperatorSuspense({
    tokenAddress,
    holder,
    spender,
  });

  // data is always defined — no loading state needed
  return <span>{isOperator ? "Approved" : "Not approved"}</span>;
}

function App() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <OperatorCheck tokenAddress="0xToken" holder="0xOwner" spender="0xDEX" />
    </Suspense>
  );
}
```

## Related

* [`useConfidentialSetOperator`](/protocol/sdk/api-references/react/useconfidentialsetoperator.md) — approve an operator
* [`Token.isOperator()`](/protocol/sdk/api-references/sdk/token.md#isoperator) — imperative equivalent on the SDK class



# useUnderlyingAllowance

Read the ERC-20 allowance of the underlying public token for the wrapper contract. Use this to check whether shielding requires an approval transaction.

## Import

```ts
import { useUnderlyingAllowance } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="AllowanceDisplay.tsx" %}

```tsx
import { useUnderlyingAllowance } from "@zama-fhe/react-sdk";

function AllowanceDisplay({
  wrapperAddress,
  owner,
}: {
  wrapperAddress: `0x${string}`;
  owner: `0x${string}` | undefined;
}) {
  const { data: allowance, isLoading } = useUnderlyingAllowance({
    address: wrapperAddress,
    owner,
  });

  if (isLoading) return <span>Loading allowance...</span>;
  return <span>Allowance: {allowance?.toString() ?? "0"}</span>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential wrapper contract. The hook reads the underlying ERC-20 allowance granted by `owner` to this wrapper.

```ts
const { data: allowance } = useUnderlyingAllowance({
  address: "0xWrapper",
  owner: "0xOwner",
});
```

***

### owner

`Address | undefined`

Address whose allowance to read. The query is disabled while `undefined`.

```ts
const { data: allowance } = useUnderlyingAllowance({
  address: "0xWrapper",
  owner: "0xOwner",
});
```

## Return Type

`data` is `bigint` — the current ERC-20 allowance in the token's smallest unit.

## Suspense

Use `useUnderlyingAllowanceSuspense` inside a `<Suspense>` boundary. The hook throws a promise while loading, so `data` is always defined.

```tsx
import { useUnderlyingAllowanceSuspense } from "@zama-fhe/react-sdk";
import { Suspense } from "react";

function Allowance({
  wrapperAddress,
  owner,
}: {
  wrapperAddress: `0x${string}`;
  owner: `0x${string}`;
}) {
  const { data: allowance } = useUnderlyingAllowanceSuspense({
    address: wrapperAddress,
    owner,
  });

  // data is always defined — no loading state needed
  return <span>Allowance: {allowance.toString()}</span>;
}

function App() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Allowance wrapperAddress="0xWrapper" owner="0xOwner" />
    </Suspense>
  );
}
```

## Related

* [`useShield`](/protocol/sdk/api-references/react/useshield.md) — shield tokens (handles approval automatically)
* [`zamaQueryKeys.underlyingAllowance`](/protocol/sdk/api-references/react/query-keys.md) — cache keys for manual invalidation


# useWrapperDiscovery

Find the confidential wrapper contract address for an ERC-20 token via the on-chain registry. The result is cached indefinitely since wrapper addresses never change.

## Import

```ts
import { useWrapperDiscovery } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="WrapperInfo.tsx" %}

```tsx
import { useWrapperDiscovery } from "@zama-fhe/react-sdk";

function WrapperInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const {
    data: wrapperAddress,
    isLoading,
    error,
  } = useWrapperDiscovery({
    tokenAddress,
    erc20Address: "0xUSDC",
  });

  if (isLoading) return <p>Discovering wrapper...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Wrapper: {wrapperAddress}</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### tokenAddress

`Address`

Address of any confidential token you control. Used to scope the query cache key and to gate whether the query is enabled — it does not affect which wrapper the registry returns.

### erc20Address

`Address | undefined`

Address of the ERC-20 token to discover the wrapper for. Pass `undefined` to disable the query.

```ts
useWrapperDiscovery({
  tokenAddress: "0xConfidentialToken",
  erc20Address: "0xUSDC",
});
```

## Return Type

The `data` field resolves to `Address | null` -- the wrapper contract address for the given token, or `null` if no wrapper exists.

## Caching

The query uses `staleTime: Infinity`. Wrapper addresses are immutable once deployed, so the result never re-fetches automatically.

## Suspense

Use `useWrapperDiscoverySuspense` inside a `<Suspense>` boundary to avoid manual loading state handling:

```tsx
import { useWrapperDiscoverySuspense } from "@zama-fhe/react-sdk";

function WrapperInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: wrapperAddress } = useWrapperDiscoverySuspense({
    tokenAddress,
    erc20Address: "0xUSDC",
  });

  return <p>Wrapper: {wrapperAddress}</p>;
}
```

## Related

* [useMetadata](/protocol/sdk/api-references/react/usemetadata.md) -- read token name, symbol, and decimals
* [Hooks overview](/protocol/sdk/api-references/react/query-keys.md) -- all available hooks

# useWrapperDiscovery

Find the confidential wrapper contract address for an ERC-20 token via the on-chain registry. The result is cached indefinitely since wrapper addresses never change.

## Import

```ts
import { useWrapperDiscovery } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="WrapperInfo.tsx" %}

```tsx
import { useWrapperDiscovery } from "@zama-fhe/react-sdk";

function WrapperInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const {
    data: wrapperAddress,
    isLoading,
    error,
  } = useWrapperDiscovery({
    tokenAddress,
    erc20Address: "0xUSDC",
  });

  if (isLoading) return <p>Discovering wrapper...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <p>Wrapper: {wrapperAddress}</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### tokenAddress

`Address`

Address of any confidential token you control. Used to scope the query cache key and to gate whether the query is enabled — it does not affect which wrapper the registry returns.

### erc20Address

`Address | undefined`

Address of the ERC-20 token to discover the wrapper for. Pass `undefined` to disable the query.

```ts
useWrapperDiscovery({
  tokenAddress: "0xConfidentialToken",
  erc20Address: "0xUSDC",
});
```

## Return Type

The `data` field resolves to `Address | null` -- the wrapper contract address for the given token, or `null` if no wrapper exists.

## Caching

The query uses `staleTime: Infinity`. Wrapper addresses are immutable once deployed, so the result never re-fetches automatically.

## Suspense

Use `useWrapperDiscoverySuspense` inside a `<Suspense>` boundary to avoid manual loading state handling:

```tsx
import { useWrapperDiscoverySuspense } from "@zama-fhe/react-sdk";

function WrapperInfo({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: wrapperAddress } = useWrapperDiscoverySuspense({
    tokenAddress,
    erc20Address: "0xUSDC",
  });

  return <p>Wrapper: {wrapperAddress}</p>;
}
```

## Related

* [useMetadata](/protocol/sdk/api-references/react/usemetadata.md) -- read token name, symbol, and decimals
* [Hooks overview](/protocol/sdk/api-references/react/query-keys.md) -- all available hooks
# useListPairs

Fetches paginated token wrapper pairs from the on-chain `ConfidentialTokenWrappersRegistry`. Supports optional metadata enrichment (name, symbol, decimals, totalSupply) for both the underlying ERC-20 and the confidential token.

This is the recommended hook for building token-pair listings. For raw index-based access, see the lower-level hooks.

## Import

```ts
import { useListPairs } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="TokenPairList.tsx" %}

```tsx
import { useListPairs } from "@zama-fhe/react-sdk";

function TokenPairList() {
  const { data, isLoading, error } = useListPairs({
    page: 1,
    pageSize: 20,
    metadata: true,
  });

  if (isLoading) return <p>Loading pairs...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <p>
        {data.total} pairs total (page {data.page})
      </p>
      <ul>
        {data.items.map((pair) => (
          <li key={pair.tokenAddress}>
            {"underlying" in pair
              ? `${pair.underlying.symbol} -> ${pair.confidential.symbol}`
              : `${pair.tokenAddress} -> ${pair.confidentialTokenAddress}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### page

`number | undefined`

Page number (1-indexed). Default: `1`.

```ts
useListPairs({ page: 2 });
```

### pageSize

`number | undefined`

Number of items per page. Default: `100`.

```ts
useListPairs({ pageSize: 20 });
```

### metadata

`boolean | undefined`

When `true`, fetches on-chain metadata (name, symbol, decimals) for both tokens, plus `totalSupply` for the underlying ERC-20. Default: `false`.

```ts
useListPairs({ metadata: true });
```

## Return Type

The `data` field resolves to `PaginatedResult<TokenWrapperPair | TokenWrapperPairWithMetadata>`:

```ts
interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
```

When `metadata: false` (default), items are `TokenWrapperPair`:

```ts
interface TokenWrapperPair {
  readonly tokenAddress: Address;
  readonly confidentialTokenAddress: Address;
  readonly isValid: boolean;
}
```

When `metadata: true`, items are `TokenWrapperPairWithMetadata`:

```ts
interface TokenWrapperPairWithMetadata extends TokenWrapperPair {
  readonly underlying: {
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
    readonly totalSupply: bigint;
  };
  readonly confidential: {
    readonly name: string;
    readonly symbol: string;
    readonly decimals: number;
  };
}
```

## Caching

Results are cached with a TTL matching the SDK's `registryTTL` (default: 24 hours). The registry uses an in-memory cache shared across all registry queries.

## Related

* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level registry class with `listPairs()` method
* [useTokenPairsRegistry](/protocol/sdk/api-references/react/usetokenpairsregistry.md) -- fetch all pairs at once (no pagination)
* [useConfidentialTokenAddress](/protocol/sdk/api-references/react/useconfidentialtokenaddress.md) -- look up a single token's wrapper
* [Query Keys](/protocol/sdk/api-references/react/query-keys.md) -- manual cache control via `zamaQueryKeys.wrappersRegistry`



# useTokenPairsRegistry

Fetches all token wrapper pairs from the `ConfidentialTokenWrappersRegistry` contract on the current chain in a single call.

For large registries, prefer [`useListPairs`](/protocol/sdk/api-references/react/uselistpairs.md) with pagination.

## Import

```ts
import { useTokenPairsRegistry } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="AllPairs.tsx" %}

```tsx
import { useTokenPairsRegistry } from "@zama-fhe/react-sdk";

function AllPairs() {
  const { data: pairs, isLoading, error } = useTokenPairsRegistry();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {pairs?.map((pair) => (
        <li key={pair.tokenAddress}>
          {pair.tokenAddress} &rarr; {pair.confidentialTokenAddress}
          {pair.isValid ? " (valid)" : " (invalid)"}
        </li>
      ))}
    </ul>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

This hook takes no parameters. The registry address is resolved automatically from the connected chain.

## Return Type

The `data` field resolves to `readonly TokenWrapperPair[]`:

```ts
interface TokenWrapperPair {
  readonly tokenAddress: Address;
  readonly confidentialTokenAddress: Address;
  readonly isValid: boolean;
}
```

## Related

* [useListPairs](/protocol/sdk/api-references/react/uselistpairs.md) -- paginated listing with optional metadata
* [useTokenPairsLength](/protocol/sdk/api-references/react/usetokenpairslength.md) -- get total count without fetching pairs
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getTokenPairs()` method


# useTokenPairsLength

Returns the total number of token wrapper pairs registered in the `ConfidentialTokenWrappersRegistry` contract on the current chain.

Useful for building pagination controls or displaying registry statistics.

## Import

```ts
import { useTokenPairsLength } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="PairCount.tsx" %}

```tsx
import { useTokenPairsLength } from "@zama-fhe/react-sdk";

function PairCount() {
  const { data: count, isLoading } = useTokenPairsLength();

  if (isLoading) return <p>Loading...</p>;

  return <p>{count?.toString()} token pairs registered</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

This hook takes no parameters. The registry address is resolved automatically from the connected chain.

## Return Type

The `data` field resolves to `bigint` -- the total number of registered pairs.

## Related

* [useListPairs](/protocol/sdk/api-references/react/uselistpairs.md) -- paginated pair listing
* [useTokenPairsSlice](/protocol/sdk/api-references/react/usetokenpairsslice.md) -- fetch a range of pairs by index
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getTokenPairsLength()` method


# useTokenPairsLength

Returns the total number of token wrapper pairs registered in the `ConfidentialTokenWrappersRegistry` contract on the current chain.

Useful for building pagination controls or displaying registry statistics.

## Import

```ts
import { useTokenPairsLength } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="PairCount.tsx" %}

```tsx
import { useTokenPairsLength } from "@zama-fhe/react-sdk";

function PairCount() {
  const { data: count, isLoading } = useTokenPairsLength();

  if (isLoading) return <p>Loading...</p>;

  return <p>{count?.toString()} token pairs registered</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

This hook takes no parameters. The registry address is resolved automatically from the connected chain.

## Return Type

The `data` field resolves to `bigint` -- the total number of registered pairs.

## Related

* [useListPairs](/protocol/sdk/api-references/react/uselistpairs.md) -- paginated pair listing
* [useTokenPairsSlice](/protocol/sdk/api-references/react/usetokenpairsslice.md) -- fetch a range of pairs by index
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getTokenPairsLength()` method



# useTokenPair

Fetches a single token wrapper pair by its zero-based index from the `ConfidentialTokenWrappersRegistry` contract.

## Import

```ts
import { useTokenPair } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="SinglePair.tsx" %}

```tsx
import { useTokenPair } from "@zama-fhe/react-sdk";

function SinglePair({ index }: { index: bigint }) {
  const { data: pair, isLoading, error } = useTokenPair({ index });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!pair) return null;

  return (
    <div>
      <p>ERC-20: {pair.tokenAddress}</p>
      <p>Confidential: {pair.confidentialTokenAddress}</p>
      <p>Valid: {pair.isValid ? "Yes" : "No"}</p>
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### index

`bigint | undefined`

Zero-based pair index. Pass `undefined` to disable the query.

```ts
useTokenPair({ index: 0n });
```

## Return Type

The `data` field resolves to `TokenWrapperPair`:

```ts
interface TokenWrapperPair {
  readonly tokenAddress: Address;
  readonly confidentialTokenAddress: Address;
  readonly isValid: boolean;
}
```

## Related

* [useTokenPairsLength](/protocol/sdk/api-references/react/usetokenpairslength.md) -- get total count to know valid indices
* [useTokenPairsSlice](/protocol/sdk/api-references/react/usetokenpairsslice.md) -- fetch a range of pairs
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getTokenPair()` method


# useConfidentialTokenAddress

Looks up the confidential token address for a given plain ERC-20 token address via the on-chain wrappers registry.

## Import

```ts
import { useConfidentialTokenAddress } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="LookupWrapper.tsx" %}

```tsx
import { useConfidentialTokenAddress } from "@zama-fhe/react-sdk";

function LookupWrapper({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data, isLoading, error } = useConfidentialTokenAddress({
    tokenAddress,
  });

  if (isLoading) return <p>Looking up...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const [found, confidentialAddress] = data;

  if (!found) return <p>No confidential token registered for this ERC-20</p>;

  return <p>Confidential token: {confidentialAddress}</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### tokenAddress

`Address | undefined`

The plain ERC-20 token address to look up. Pass `undefined` to disable the query.

```ts
useConfidentialTokenAddress({ tokenAddress: "0xUSDC" });
```

## Return Type

The `data` field resolves to `readonly [boolean, Address]`:

* `[true, address]` -- registered and valid; `address` is the confidential token
* `[false, nonZeroAddress]` -- registered but revoked; `address` is the former confidential token
* `[false, zeroAddress]` -- no registered pair

## Related

* [useTokenAddress](/protocol/sdk/api-references/react/usetokenaddress.md) -- reverse lookup (confidential → plain)
* [useIsConfidentialTokenValid](/protocol/sdk/api-references/react/useisconfidentialtokenvalid.md) -- check if a confidential token is valid
* [useWrapperDiscovery](/protocol/sdk/api-references/react/usewrapperdiscovery.md) -- alternative lookup via the deployment coordinator
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getConfidentialTokenAddress()` method


# useTokenAddress

Reverse lookup -- finds the plain ERC-20 token address for a given confidential token address via the on-chain wrappers registry.

## Import

```ts
import { useTokenAddress } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="ReverseLookup.tsx" %}

```tsx
import { useTokenAddress } from "@zama-fhe/react-sdk";

function ReverseLookup({ confidentialTokenAddress }: { confidentialTokenAddress: `0x${string}` }) {
  const { data, isLoading, error } = useTokenAddress({
    confidentialTokenAddress,
  });

  if (isLoading) return <p>Looking up...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const [found, plainAddress] = data;

  if (!found) return <p>No underlying ERC-20 found</p>;

  return <p>Underlying ERC-20: {plainAddress}</p>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### confidentialTokenAddress

`Address | undefined`

The confidential token address to look up. Pass `undefined` to disable the query.

```ts
useTokenAddress({ confidentialTokenAddress: "0xcUSDC" });
```

## Return Type

The `data` field resolves to `readonly [boolean, Address]`:

* `[true, address]` -- registered and valid; `address` is the underlying ERC-20
* `[false, nonZeroAddress]` -- registered but revoked; `address` is the former underlying token
* `[false, zeroAddress]` -- no registered pair

## Related

* [useConfidentialTokenAddress](/protocol/sdk/api-references/react/useconfidentialtokenaddress.md) -- forward lookup (plain → confidential)
* [useIsConfidentialTokenValid](/protocol/sdk/api-references/react/useisconfidentialtokenvalid.md) -- check if a confidential token is valid
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `getTokenAddress()` method



# useIsConfidentialTokenValid

Checks whether a confidential token address is registered and valid in the on-chain `ConfidentialTokenWrappersRegistry`. Use this to verify a token before performing operations like shielding or transfers.

## Import

```ts
import { useIsConfidentialTokenValid } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="ValidityCheck.tsx" %}

```tsx
import { useIsConfidentialTokenValid } from "@zama-fhe/react-sdk";

function ValidityCheck({ confidentialTokenAddress }: { confidentialTokenAddress: `0x${string}` }) {
  const {
    data: isValid,
    isLoading,
    error,
  } = useIsConfidentialTokenValid({
    confidentialTokenAddress,
  });

  if (isLoading) return <p>Checking...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <p>
      {confidentialTokenAddress} is {isValid ? "a valid registered wrapper" : "not a valid wrapper"}
    </p>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### confidentialTokenAddress

`Address | undefined`

The confidential token address to validate. Pass `undefined` to disable the query.

```ts
useIsConfidentialTokenValid({ confidentialTokenAddress: "0xcUSDC" });
```

## Return Type

The `data` field resolves to `boolean`:

* `true` -- the token is a known, valid wrapper in the registry
* `false` -- the token is not registered or not valid

## Related

* [useConfidentialTokenAddress](/protocol/sdk/api-references/react/useconfidentialtokenaddress.md) -- look up the wrapper for an ERC-20
* [useTokenAddress](/protocol/sdk/api-references/react/usetokenaddress.md) -- reverse lookup (confidential → plain)
* [WrappersRegistry](/protocol/sdk/api-references/sdk/wrappersregistry.md) -- SDK-level `isConfidentialTokenValid()` method


# useMetadata

Get token name, symbol, and decimals in one call. The result is cached indefinitely since token metadata never changes.

## Import

```ts
import { useMetadata } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="TokenHeader.tsx" %}

```tsx
import { useMetadata } from "@zama-fhe/react-sdk";

function TokenHeader({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: meta, isLoading } = useMetadata(tokenAddress);

  if (isLoading) return <p>Loading metadata...</p>;

  return (
    <h2>
      {meta?.name} ({meta?.symbol}) -- {meta?.decimals} decimals
    </h2>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### tokenAddress

`Address`

Address of the token contract to read metadata from.

```ts
const { data: meta } = useMetadata("0xToken");
```

## Return Type

The `data` field resolves to:

```ts
{
  name: string
  symbol: string
  decimals: number
} | undefined
```

## Caching

The query uses `staleTime: Infinity`. Token metadata is immutable, so the result never re-fetches automatically.

## Suspense

Use `useMetadataSuspense` inside a `<Suspense>` boundary to avoid manual loading state handling:

```tsx
import { useMetadataSuspense } from "@zama-fhe/react-sdk";

function TokenHeader({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { data: meta } = useMetadataSuspense(tokenAddress);

  return (
    <h2>
      {meta.name} ({meta.symbol}) -- {meta.decimals} decimals
    </h2>
  );
}
```

## Related

* [useWrapperDiscovery](/protocol/sdk/api-references/react/usewrapperdiscovery.md) -- find the wrapper address for a token
* [useConfidentialBalance](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- read the decrypted confidential balance
* [Hooks overview](/protocol/sdk/api-references/react/query-keys.md) -- all available hooks


# useZamaSDK

Hook to access the raw `ZamaSDK` instance from `ZamaProvider` context. Use this for advanced scenarios where the standard hooks do not cover your use case.

## Import

```ts
import { useZamaSDK } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useZamaSDK } from "@zama-fhe/react-sdk";

function AdvancedOperations() {
  const sdk = useZamaSDK();

  async function handleCustomOperation() {
    // Access the SDK directly for operations not covered by hooks
    const token = sdk.createToken("0xToken");
    const name = await token.name();
    const symbol = await token.symbol();
    console.log(name, symbol);
  }

  return <button onClick={handleCustomOperation}>Run</button>;
}
```

{% endtab %}

{% tab title="config.ts" %}

```ts
import { createConfig as createZamaConfig } from "@zama-fhe/react-sdk/wagmi";
import { web } from "@zama-fhe/sdk/web";
import { sepolia, type FheChain } from "@zama-fhe/sdk/chains";
import { config as wagmiConfig } from "./wagmi";

const mySepolia = {
  ...sepolia,
  relayerUrl: "https://your-app.com/api/relayer/11155111",
} as const satisfies FheChain;

export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: { [mySepolia.id]: web() },
});

// In your app layout:
// <ZamaProvider config={zamaConfig}>
//   <App />
// </ZamaProvider>
```

{% endtab %}
{% endtabs %}

## Parameters

None. The SDK instance is read from the nearest `ZamaProvider` context.

## Return Type

`ZamaSDK`

The configured SDK instance. Throws if called outside a `ZamaProvider`.

## Related

* [useToken](/protocol/sdk/api-references/react/usetoken.md) — memoised `Token` instance for a given address
* [useWrappedToken](/protocol/sdk/api-references/react/usewrappedtoken.md) — memoised `WrappedToken` for ERC-7984 wrapper operations
* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — full API reference for the SDK class


# useToken

Returns a memoised [`Token`](/protocol/sdk/api-references/sdk/token.md) instance bound to the SDK in the current `ZamaProvider`. The reference is stable across re-renders, making it safe to use in dependency arrays.

For ERC-7984 wrapper operations (shield, unshield, allowance), use [`useWrappedToken`](/protocol/sdk/api-references/react/usewrappedtoken.md) instead.

## Import

```ts
import { useToken } from "@zama-fhe/react-sdk";
```

## Signature

```ts
function useToken(address: Address): Token;
```

## Example

```tsx
import { useToken } from "@zama-fhe/react-sdk";

function TokenActions({ tokenAddress }: { tokenAddress: Address }) {
  const token = useToken(tokenAddress);

  async function handleTransfer() {
    const { txHash } = await token.confidentialTransfer("0xRecipient", 500n);
    console.log("Transfer:", txHash);
  }

  return <button onClick={handleTransfer}>Transfer 500</button>;
}
```

## Related

* [`useWrappedToken`](/protocol/sdk/api-references/react/usewrappedtoken.md) — wrapper operations (shield, unshield, allowance)
* [`useZamaSDK`](/protocol/sdk/api-references/react/usezamasdk.md) — access the underlying SDK instance directly
* [`Token`](/protocol/sdk/api-references/sdk/token.md) — the underlying class



# useWrappedToken

Returns a memoised [`WrappedToken`](/protocol/sdk/api-references/sdk/wrappedtoken.md) bound to the SDK in the current `ZamaProvider`. Use it for ERC-7984 wrapper operations (shield, unshield, allowance).

`WrappedToken` extends the base [`Token`](/protocol/sdk/api-references/sdk/token.md) API, so the returned instance can also read balances and submit confidential transfers.

## Import

```ts
import { useWrappedToken } from "@zama-fhe/react-sdk";
```

## Signature

```ts
function useWrappedToken(address: Address): WrappedToken;
```

## Example

```tsx
function ShieldButton({ wrapperAddress }: { wrapperAddress: Address }) {
  const wrappedToken = useWrappedToken(wrapperAddress);
  return <button onClick={() => wrappedToken.shield(1000n)}>Shield</button>;
}
```

## Related

* [`useToken`](/protocol/sdk/api-references/react/usetoken.md) — base read/write token interface
* [`WrappedToken`](/protocol/sdk/api-references/sdk/wrappedtoken.md) — the underlying class


# useEncrypt

Low-level mutation hook that encrypts plaintext values using the relayer's FHE engine. Returns encrypted values and an input proof for on-chain submission.

{% hint style="warning" %}
For **confidential ERC-20 tokens**, use [`useShield`](/protocol/sdk/api-references/react/useshield.md) or [`useConfidentialTransfer`](/protocol/sdk/api-references/react/useconfidentialtransfer.md) — they handle encryption automatically.

Use `useEncrypt` when your smart contract uses FHE types directly (e.g. a confidential voting contract, a sealed-bid auction, or any non-token contract that accepts encrypted parameters).
{% endhint %}

## Import

```ts
import { useEncrypt } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useEncrypt } from "@zama-fhe/react-sdk";

function EncryptValue() {
  const { mutateAsync: encrypt, isPending } = useEncrypt();

  async function handleEncrypt() {
    const { encryptedValues, inputProof } = await encrypt({
      values: [{ value: 1000n, type: "euint64" }],
      contractAddress: "0xContract",
      userAddress: "0xUser",
    });
    // encryptedValues[0] is the encrypted value (0x hex), inputProof is the ZK proof — both contract-ready
  }

  return (
    <button onClick={handleEncrypt} disabled={isPending}>
      {isPending ? "Encrypting..." : "Encrypt"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

`useEncrypt` takes no constructor parameters.

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

```ts
import { type EncryptParams } from "@zama-fhe/sdk";
```

### values

`EncryptInput[]`

Array of typed inputs. Each entry specifies a plaintext value and its FHE type (`ebool`, `euint64`, `eaddress`, etc.).

### contractAddress

`Address`

Address of the contract that will consume the encrypted value.

### userAddress

`Address`

Address of the user performing the encryption.

## Return Type

```ts
import { type EncryptResult } from "@zama-fhe/sdk";
```

`data` resolves to `{ encryptedValues: EncryptedValue[], inputProof: Hex }` — `0x`-prefixed hex, ready to pass straight into a contract call.

* **`encryptedValues`** — one encrypted value per input.
* **`inputProof`** — the ZK input proof to submit alongside the encrypted values in a contract call.

## Supported FHE Types

| Type       | JS value type       | Range                 |
| ---------- | ------------------- | --------------------- |
| `ebool`    | `boolean \| bigint` | `true`/`false` or 0/1 |
| `euint8`   | `bigint`            | 0–255                 |
| `euint16`  | `bigint`            | 0–65535               |
| `euint32`  | `bigint`            | 0–2³²−1               |
| `euint64`  | `bigint`            | 0–2⁶⁴−1               |
| `euint128` | `bigint`            | 0–2¹²⁸−1              |
| `euint256` | `bigint`            | 0–2²⁵⁶−1              |
| `eaddress` | `` `0x${string}` `` | Ethereum address      |

## Related

* [`useShield`](/protocol/sdk/api-references/react/useshield.md) — high-level hook that encrypts and shields in one step
* [`useConfidentialTransfer`](/protocol/sdk/api-references/react/useconfidentialtransfer.md) — high-level hook that encrypts and transfers
* [`useDecryptValues`](/protocol/sdk/api-references/react/usedecryptvalues.md) — reverse operation, decrypt encrypted values back to plaintext
* [Encrypt & Decrypt guide](/protocol/sdk/guides/encrypt-decrypt.md) — full walkthrough with examples


# useDecryptValues

Query hook for user decryption. **Disabled by default** — pass `enabled` to run it, and gate on a cached permit (via [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md)) to avoid an unexpected wallet prompt. Checks the persistent decrypt cache first and only hits the relayer for uncached entries.

{% hint style="info" %}
Renamed from `useUserDecrypt` to align with the Zama glossary (prerelease rename). If you were on the old name, update imports to `useDecryptValues`.
{% endhint %}

{% hint style="info" %}
**This is the recommended way to decrypt.** For token balances, prefer [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) which handles decryption and caching automatically. Use `useDecryptValues` when your smart contract uses FHE types directly (e.g. a confidential voting contract, a sealed-bid auction, or any non-token contract).
{% endhint %}

## Import

```ts
import { useDecryptValues } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useGrantPermit, useHasPermit, useDecryptValues } from "@zama-fhe/react-sdk";

const CONTRACT = "0xYourContract" as const;

function DecryptValue({ encryptedValue }: { encryptedValue: string }) {
  const { mutate: grantPermit, isPending: isGranting } = useGrantPermit();
  const { data: hasPermit } = useHasPermit({ contractAddresses: [CONTRACT] });
  const { data, isPending } = useDecryptValues(
    [{ encryptedValue, contractAddress: CONTRACT }],
    { enabled: !!hasPermit }, // gate: only decrypt once authorized
  );

  if (!hasPermit) {
    return (
      <button onClick={() => grantPermit([CONTRACT])} disabled={isGranting}>
        {isGranting ? "Signing..." : "Authorize"}
      </button>
    );
  }

  if (isPending) return <p>Decrypting...</p>;
  return <output>Value: {data?.[encryptedValue]?.toString()}</output>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

### inputs (first argument)

`EncryptedInput[]`

Array of encrypted values to decrypt. Each entry pairs an encrypted value with the address of the contract that owns it. Only entries not yet in the SDK's persistent decrypt cache are sent for decryption — cached ones are returned immediately, even after a page reload.

```ts
import { type EncryptedInput } from "@zama-fhe/sdk";
```

| Field             | Type             | Description                                            |
| ----------------- | ---------------- | ------------------------------------------------------ |
| `encryptedValue`  | `EncryptedValue` | The encrypted value (hex string) to decrypt.           |
| `contractAddress` | `Address`        | Address of the contract that owns the encrypted value. |

Inputs from different contracts can be mixed in a single call — `useDecryptValues` automatically groups them by contract address and issues one decryption request per unique contract:

```tsx
const { data } = useDecryptValues(
  [
    { encryptedValue: "0xvalue1...", contractAddress: "0xContractA" },
    { encryptedValue: "0xvalue2...", contractAddress: "0xContractA" },
    { encryptedValue: "0xvalue3...", contractAddress: "0xContractB" },
  ],
  { enabled: true },
);

// data: { "0xvalue1...": 500n, "0xvalue2...": 200n, "0xvalue3...": 1000n }
```

{% hint style="warning" %}
**All contract addresses must be authorized first.** Call `useGrantPermit` with every contract address present in `inputs` before enabling the query. Use `useHasPermit({ contractAddresses })` to check coverage and pass `{ enabled: !!hasPermit }` as the second argument to prevent unexpected wallet prompts.
{% endhint %}

### options (second argument)

`{ enabled?: boolean } | undefined`

Pass `{ enabled: false }` as the second argument to disable the query.

## Return Type

Returns a standard `useQuery` result. `data` resolves to `Record<EncryptedValue, ClearValue>` — a map from each encrypted value to its decrypted plaintext value (`bigint`, `boolean`, or `string`).

When all requested inputs are already cached, `data` contains the cached values immediately (no relayer call). Freshly decrypted results are written through the SDK's internal CachingService — scoped by `(signer, contract, encryptedValue)` — so that subsequent renders return instantly, even after a page reload. The cache is cleared automatically on `permits.revokePermits()`, `permits.clear()`, or wallet lifecycle events (disconnect, account change, chain change).

## How It Works

`useDecryptValues` chains two internal queries:

1. **Signer address** — resolves the connected wallet address.
2. **Decrypt** — calls `sdk.decryption.decryptValues(inputs)` which checks the persistent cache, then hits the relayer for any uncached entries.

{% hint style="warning" %}
**`useDecryptValues` does not automatically gate on permits.** If permits are not cached when the query fires, the SDK will prompt the user's wallet for a signature. To avoid unexpected popups, gate the query yourself using [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md):

```tsx
const { data: hasPermit } = useHasPermit({ contractAddresses: ["0xContract"] });
const { data } = useDecryptValues([{ encryptedValue, contractAddress: "0xContract" }], {
  enabled: !!hasPermit,
});
```

This ensures the decrypt query only fires after `useGrantPermit` has been called.
{% endhint %}

## Permit caching

`useDecryptValues` relies on permits acquired via [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md):

* **First `grantPermit()` call** — generates a new transport key pair, creates EIP-712 typed data, and requests a wallet signature. The permits are then cached.
* **Subsequent queries** — reuse the cached permits if they are still valid (not expired).
* **Expiry** — the transport key pair expires after `transportKeyPairTTL` seconds (default: 2592000 = 30 days, configurable via SDK config). Permits expire after `permitTTL` days (default: 30). Once expired, call `grantPermit()` again to generate fresh permits.

This means users only see a wallet signature prompt once per TTL window, even if they decrypt multiple times.

## Related

* [`useGrantPermit`](/protocol/sdk/api-references/react/usegrantpermit.md) — pre-authorize contracts with one wallet signature (required before `useDecryptValues` fires)
* [`useHasPermit`](/protocol/sdk/api-references/react/usehaspermit.md) — check whether permits are cached and cover specific contracts
* [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) — high-level hook that decrypts token balances with automatic caching
* [`useEncrypt`](/protocol/sdk/api-references/react/useencrypt.md) — reverse operation, encrypt a plaintext value for on-chain submission
* [Encrypt & Decrypt guide](/protocol/sdk/guides/encrypt-decrypt.md) — full walkthrough with end-to-end examples


# useDelegateDecryption

Mutation hook that grants FHE decryption rights for a token to another address via the on-chain ACL. Automatically invalidates [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) queries on success.

## Import

```ts
import { useDelegateDecryption } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useDelegateDecryption } from "@zama-fhe/react-sdk";

function DelegateButton({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { mutateAsync: delegate, isPending, error } = useDelegateDecryption(tokenAddress);

  async function handleDelegate() {
    const { txHash } = await delegate({
      delegateAddress: "0xDelegate",
      expirationDate: new Date("2025-12-31"),
    });
    console.log("Delegated in", txHash);
  }

  return (
    <button onClick={handleDelegate} disabled={isPending}>
      {isPending ? "Delegating..." : "Delegate"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential token contract. Passed positionally as the first argument.

```ts
const { mutateAsync: delegate } = useDelegateDecryption("0xToken");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

### delegateAddress

`Address`

The address to grant decryption rights to.

### expirationDate

`Date | undefined`

When the delegation expires. If omitted, the delegation is permanent.

```ts
await delegate({
  delegateAddress: "0xDelegate",
  expirationDate: new Date("2025-12-31"),
});
```

## Return Type

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

## Related

* [`useRevokeDelegation`](/protocol/sdk/api-references/react/userevokedelegation.md) -- revoke a previously granted delegation
* [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) -- check whether a delegation is active
* [`useDecryptBalanceAs`](/protocol/sdk/api-references/react/usedecryptbalanceas.md) -- decrypt a balance as the delegate
* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) -- SDK reference


# useRevokeDelegation

Mutation hook that revokes a previously granted FHE decryption delegation for a token. Automatically invalidates [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) queries on success.

## Import

```ts
import { useRevokeDelegation } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useRevokeDelegation } from "@zama-fhe/react-sdk";

function RevokeButton({ tokenAddress }: { tokenAddress: `0x${string}` }) {
  const { mutateAsync: revoke, isPending } = useRevokeDelegation(tokenAddress);

  async function handleRevoke() {
    const { txHash } = await revoke({ delegateAddress: "0xDelegate" });
    console.log("Revoked in", txHash);
  }

  return (
    <button onClick={handleRevoke} disabled={isPending}>
      {isPending ? "Revoking..." : "Revoke"}
    </button>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential token contract. Passed positionally as the first argument.

```ts
const { mutateAsync: revoke } = useRevokeDelegation("0xToken");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

### delegateAddress

`Address`

The address to revoke decryption rights from.

```ts
await revoke({ delegateAddress: "0xDelegate" });
```

## Return Type

`data` resolves to `{ txHash: Hex, receipt: TransactionReceipt }`.

## Related

* [`useDelegateDecryption`](/protocol/sdk/api-references/react/usedelegatedecryption.md) -- grant delegation
* [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) -- check whether a delegation is active
* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) -- SDK reference



# useDelegationStatus

Query hook that checks whether a decryption delegation is active between a delegator and delegate for a specific contract. Returns both the active status and the raw expiry timestamp.

## Import

```ts
import { useDelegationStatus } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useDelegationStatus } from "@zama-fhe/react-sdk";

function DelegationBadge({
  contractAddress,
  delegatorAddress,
  delegateAddress,
}: {
  contractAddress: `0x${string}`;
  delegatorAddress: `0x${string}`;
  delegateAddress: `0x${string}`;
}) {
  const { data, isLoading } = useDelegationStatus({
    contractAddress,
    delegatorAddress,
    delegateAddress,
  });

  if (isLoading) return <span>Checking...</span>;
  if (!data?.isActive) return <span>Not delegated</span>;

  const expiry = data.expiryTimestamp;
  const label =
    expiry === BigInt("18446744073709551615")
      ? "Permanent"
      : `Expires ${new Date(Number(expiry) * 1000).toLocaleDateString()}`;

  return <span>Delegated ({label})</span>;
}
```

{% endtab %}
{% endtabs %}

## Parameters

```ts
import { type UseDelegationStatusConfig } from "@zama-fhe/react-sdk";
```

### contractAddress

`Address`

Address of the confidential contract.

### delegatorAddress

`Address | undefined`

The address that granted the delegation. The query is disabled until this is provided.

### delegateAddress

`Address | undefined`

The address that received delegation rights. The query is disabled until this is provided.

```ts
const { data } = useDelegationStatus({
  contractAddress: "0xToken",
  delegatorAddress: "0xDelegator",
  delegateAddress: "0xDelegate",
});
```

## Return Type

```ts
import { type DelegationStatusData } from "@zama-fhe/sdk/query";
```

`data` resolves to:

| Property          | Type      | Description                                                               |
| ----------------- | --------- | ------------------------------------------------------------------------- |
| `isActive`        | `boolean` | `true` if delegation exists and hasn't expired.                           |
| `expiryTimestamp` | `bigint`  | `0n` = no delegation, `2^64 - 1` = permanent, otherwise UTC Unix seconds. |

## Related

* [`useDelegateDecryption`](/protocol/sdk/api-references/react/usedelegatedecryption.md) -- grant delegation
* [`useRevokeDelegation`](/protocol/sdk/api-references/react/userevokedelegation.md) -- revoke delegation
* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) -- SDK reference


# useDecryptBalanceAs

Mutation hook that decrypts a delegator's confidential balance. The connected wallet must have been granted delegation rights via the on-chain ACL.

## Import

```ts
import { useDecryptBalanceAs } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useDecryptBalanceAs } from "@zama-fhe/react-sdk";

function DelegatedBalance({
  tokenAddress,
  delegatorAddress,
}: {
  tokenAddress: `0x${string}`;
  delegatorAddress: `0x${string}`;
}) {
  const { mutateAsync: decryptAs, data: balance, isPending } = useDecryptBalanceAs(tokenAddress);

  async function handleDecrypt() {
    await decryptAs({ delegatorAddress });
  }

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isPending}>
        {isPending ? "Decrypting..." : "Decrypt balance"}
      </button>
      {balance !== undefined && <span>Balance: {balance.toString()}</span>}
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### address

`Address`

Address of the confidential token contract. Passed positionally as the first argument.

```ts
const { mutateAsync: decryptAs } = useDecryptBalanceAs("0xToken");
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

```ts
import { type DecryptBalanceAsParams } from "@zama-fhe/sdk/query";
```

### delegatorAddress

`Address`

The address that delegated decryption rights.

### accountAddress

`Address | undefined`

The address whose on-chain balance to read. Defaults to `delegatorAddress`. Use this when the balance holder differs from the delegator.

```ts
await decryptAs({
  delegatorAddress: "0xDelegator",
  accountAddress: "0xBalanceHolder",
});
```

## Return Type

`data` resolves to `bigint` — the decrypted token balance.

## Related

* [`useBatchDecryptBalancesAs`](/protocol/sdk/api-references/react/usebatchdecryptbalancesas.md) -- batch variant for multiple tokens
* [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) -- check delegation status before decrypting
* [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) -- decrypt your own balance (non-delegated)
* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) -- SDK reference



# useBatchDecryptBalancesAs

Mutation hook that decrypts a delegator's confidential balances across multiple tokens in a single call. Uses `Token.batchDecryptBalancesAs` under the hood with caching, concurrency control, and per-token error handling.

## Import

```ts
import { useBatchDecryptBalancesAs } from "@zama-fhe/react-sdk";
```

## Usage

{% tabs %}
{% tab title="component.tsx" %}

```tsx
import { useMemo } from "react";
import { useBatchDecryptBalancesAs, useZamaSDK } from "@zama-fhe/react-sdk";

function PortfolioBalance({
  tokenAddresses,
  delegatorAddress,
}: {
  tokenAddresses: `0x${string}`[];
  delegatorAddress: `0x${string}`;
}) {
  // Build Token instances using the SDK factory (not hooks — hooks cannot be called in a loop)
  const sdk = useZamaSDK();
  const tokens = useMemo(
    () => tokenAddresses.map((addr) => sdk.createToken(addr)),
    [sdk, tokenAddresses],
  );

  const {
    mutateAsync: batchDecryptAs,
    data: balances,
    isPending,
  } = useBatchDecryptBalancesAs(tokens);

  async function handleDecrypt() {
    await batchDecryptAs({ delegatorAddress });
  }

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isPending}>
        {isPending ? "Decrypting..." : "Decrypt all"}
      </button>
      {balances &&
        Array.from(balances).map(([address, balance]) => (
          <div key={address}>
            {address}: {balance.toString()}
          </div>
        ))}
    </div>
  );
}
```

{% endtab %}
{% endtabs %}

## Parameters

### tokens

`Token[]`

Array of `Token` instances to decrypt balances for. Passed as the first argument to `useBatchDecryptBalancesAs`.

```ts
const { mutateAsync: batchDecryptAs } = useBatchDecryptBalancesAs(tokens);
```

***

## Mutation variables

Passed to `mutate` / `mutateAsync` at call time.

```ts
import { type BatchDecryptAsOptions } from "@zama-fhe/sdk";
```

### delegatorAddress

`Address`

The address that delegated decryption rights.

### encryptedValues

`EncryptedValue[] | undefined`

Pre-fetched encrypted values. When omitted, they are fetched from the chain.

### accountAddress

`Address | undefined`

The address whose on-chain balance to read. Defaults to `delegatorAddress`.

### maxConcurrency

`number | undefined`

Maximum number of concurrent decrypt calls. Default: `Infinity`.

### onError

`(error: Error, address: Address) => bigint`

Called when decryption fails for a single token. Return a fallback value.

```ts
await batchDecryptAs({
  delegatorAddress: "0xDelegator",
  maxConcurrency: 3,
  onError: (err, addr) => {
    console.error(addr, err);
    return 0n;
  },
});
```

## Return Type

`data` resolves to `Map<Address, bigint>` — a map from each token address to its decrypted balance.

## Related

* [`useDecryptBalanceAs`](/protocol/sdk/api-references/react/usedecryptbalanceas.md) -- single-token variant
* [`useDelegationStatus`](/protocol/sdk/api-references/react/usedelegationstatus.md) -- check delegation status before decrypting
* [Delegated Decryption](/protocol/sdk/api-references/sdk/delegation.md) -- SDK reference



# Query keys

The `zamaQueryKeys` object is a factory for React Query cache keys. Use it to invalidate, prefetch, or remove cached data manually.

Mutations auto-invalidate related caches, so you only need `zamaQueryKeys` for advanced cache control.

## Import

```ts
import { zamaQueryKeys } from "@zama-fhe/sdk/query";
```

## Usage

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { zamaQueryKeys } from "@zama-fhe/sdk/query";

const queryClient = useQueryClient();

// Invalidate all balances
queryClient.invalidateQueries({ queryKey: zamaQueryKeys.confidentialBalance.all });

// Invalidate one token's balances
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.token("0xToken"),
});

// Invalidate a specific owner's balance
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.owner("0xToken", "0xOwner"),
});
```

## Key factories

### `zamaQueryKeys.confidentialBalance`

Single-token decrypted balance.

| Key                   | Scope                             |
| --------------------- | --------------------------------- |
| `.all`                | All decrypted balances            |
| `.token(addr)`        | All balances for one token        |
| `.owner(addr, owner)` | One owner's balance for one token |

### `zamaQueryKeys.confidentialBalances`

Multi-token batch balances.

| Key                     | Scope                                     |
| ----------------------- | ----------------------------------------- |
| `.all`                  | All batch balance queries                 |
| `.tokens(addrs, owner)` | Batch query for specific tokens and owner |

### `zamaQueryKeys.hasPermit`

Permit coverage status.

| Key    | Scope                   |
| ------ | ----------------------- |
| `.all` | All `hasPermit` queries |

### `zamaQueryKeys.underlyingAllowance`

ERC-20 allowance of the underlying token for the wrapper.

| Key                   | Scope                                      |
| --------------------- | ------------------------------------------ |
| `.all`                | All allowance queries                      |
| `.token(addr)`        | Allowances for one token                   |
| `.scope(addr, owner)` | Specific owner's allowance for the wrapper |

### `zamaQueryKeys.wrappersRegistry`

On-chain wrappers registry queries.

| Key                                                         | Scope                                 |
| ----------------------------------------------------------- | ------------------------------------- |
| `.all`                                                      | All registry queries                  |
| `.chainId()`                                                | Chain ID resolution                   |
| `.tokenPairs(registryAddr)`                                 | All pairs for a registry              |
| `.tokenPairsLength(registryAddr)`                           | Pair count                            |
| `.tokenPairsSlice(registryAddr, from, to)`                  | Index-based slice                     |
| `.tokenPair(registryAddr, index)`                           | Single pair by index                  |
| `.confidentialTokenAddress(registryAddr, tokenAddr)`        | Forward lookup (plain → confidential) |
| `.tokenAddress(registryAddr, confidentialAddr)`             | Reverse lookup (confidential → plain) |
| `.isConfidentialTokenValid(registryAddr, confidentialAddr)` | Validity check                        |
| `.listPairs(registryAddr, page, pageSize, metadata)`        | Paginated listing                     |

### `zamaQueryKeys.decryption`

Cached decrypted values. Populated by [`useDecryptValues`](/protocol/sdk/api-references/react/usedecryptvalues.md).

```ts
import { zamaQueryKeys } from "@zama-fhe/sdk/query";
```

| Key                                                   | Scope                                          |
| ----------------------------------------------------- | ---------------------------------------------- |
| `.encryptedValue(encryptedValue, contractAddress?)`   | Single clear value by encrypted value          |
| `.encryptedInputs(encryptedInputs[], walletAccount?)` | Multiple clear values by encrypted-input array |

## Common patterns

### Invalidate after an external transaction

```tsx
// After a transfer made outside the SDK
queryClient.invalidateQueries({
  queryKey: zamaQueryKeys.confidentialBalance.token("0xToken"),
});
```

### Prefetch balances on hover

```tsx
queryClient.prefetchQuery({
  queryKey: zamaQueryKeys.confidentialBalance.owner("0xToken", "0xOwner"),
  queryFn: () => fetchBalance("0xToken", "0xOwner"),
});
```

### Clear all cached data on disconnect

```tsx
queryClient.removeQueries({ queryKey: zamaQueryKeys.confidentialBalance.all });
```

## Related

* [ZamaProvider](/protocol/sdk/api-references/react/zamaprovider.md) — provider setup and hook overview
* [`useConfidentialBalance`](/protocol/sdk/api-references/react/useconfidentialbalance.md) — the hook whose cache these keys control


# Architecture

## Layer overview

The SDK is organized into layers, each with a clear responsibility. Higher layers depend on lower layers but never the reverse.

![Zama SDK Architecture Layers](/files/HPdyS9CK1nDKisfAvvJF)

| Layer                          | Responsibility                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **React SDK**                  | `ZamaProvider` context + hooks wrapping `@tanstack/react-query`                                                                            |
| **Query & Mutation Factories** | Framework-agnostic `queryOptions` / `mutationOptions` consumed by React Query (or directly)                                                |
| **Contract Abstraction**       | `ZamaSDK`, `Token`, `WrappedToken` — the main developer-facing API                                                                         |
| **Contract Call Builders**     | Pure functions returning `{ address, abi, functionName, args }` for any Web3 library                                                       |
| **Provider & Signer Adapters** | `ViemProvider`/`ViemSigner`, `EthersProvider`/`EthersSigner` — read/write split per library                                                |
| **Relayer**                    | `web()` (browser WASM), `node()` (server), `cleartext()` (cleartext chains) — selected by factory, routed per chain by `RelayerDispatcher` |
| **Worker**                     | Web Worker + WASM in browsers, `worker_threads` pool in Node.js                                                                            |
| **Storage & Credentials**      | `TransportKeyPairVault` + `PermissionStore` with pluggable backends (IndexedDB, Memory, AsyncLocalStorage)                                 |
| **Event System**               | `ZamaSDKEvents` lifecycle events + on-chain event decoders                                                                                 |

## `createConfig` pattern

Each SDK adapter path (`@zama-fhe/sdk/viem`, `@zama-fhe/sdk/ethers`) exports a `createConfig()` function that wires up the provider, signer, and relayer dispatcher from framework-native objects. For wagmi apps, `createConfig` from `@zama-fhe/react-sdk/wagmi` builds a `ZamaConfig` from your wagmi config; pass the result to `<ZamaProvider config={zamaConfig}>`.

## Module map

The core `@zama-fhe/sdk` package is split into focused modules:

![SDK Module Map](/files/IG3kGe7xw75KT8fvsMYB)

### Entry points

Each package exposes multiple entry points for tree-shaking:

**`@zama-fhe/sdk`**

| Import Path               | Contents                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `@zama-fhe/sdk`           | Core SDK, `createConfig`, `cleartext()` factory, storage, ABIs, event decoders, contract call builders |
| `@zama-fhe/sdk/viem`      | `ViemProvider`, `ViemSigner` adapters + viem `createConfig`                                            |
| `@zama-fhe/sdk/ethers`    | `EthersProvider`, `EthersSigner` adapters + ethers `createConfig`                                      |
| `@zama-fhe/sdk/web`       | `web()` transport factory (and the `RelayerWeb` class)                                                 |
| `@zama-fhe/sdk/cleartext` | `RelayerCleartext` class (prefer the root `cleartext()` factory)                                       |
| `@zama-fhe/sdk/node`      | `node()` transport factory, network presets, type-only exports                                         |
| `@zama-fhe/sdk/query`     | Query/mutation option factories, query keys, invalidation helpers                                      |

**`@zama-fhe/react-sdk`**

| Import Path                 | Contents                                                   |
| --------------------------- | ---------------------------------------------------------- |
| `@zama-fhe/react-sdk`       | Provider-based hooks (`ZamaProvider` + `use*` hooks)       |
| `@zama-fhe/react-sdk/wagmi` | `createConfig` — builds a `ZamaConfig` from a wagmi config |
# Permit model

Decrypting an on-chain FHE ciphertext requires two things: a transport key pair (generated once, stored persistently — see [Security Model](/protocol/sdk/concepts/security-model.md#credential-storage)) and a **signed permit** that authorizes decryption for specific contract addresses. This page explains how permits work.

## What is a permit

A permit is an EIP-712 typed data signature from the user's wallet. It binds:

* A set of **contract addresses** (up to 10 per permit).
* A **chain ID**.
* A **start timestamp** and **duration** (derived from `permitTTL`).
* The **signer address**.
* An optional **delegator address** (for delegated decryption).

The relayer verifies this signature before re-encrypting any ciphertext. Without a valid permit covering the target contract, the relayer rejects the request.

## Key properties

* **Immutable** — the signed contract addresses are part of the EIP-712 payload and cannot be edited after signing.
* **Chunked** — each permit covers at most 10 contracts. When more are needed, the SDK chunks the addresses and requests one wallet signature per chunk.
* **Chain-scoped** — stored under `(signerAddress, chainId, delegatorAddress)`, so permits on Sepolia never collide with permits on Mainnet, and direct permits never collide with delegated ones.
* **Additive** — calling `permits.grantPermit()` with new contracts signs additional permits for the uncovered subset only. Existing permits remain valid and are not re-signed.
* **Time-bounded** — each permit records its creation timestamp and duration. Expired permits are pruned on next access.

## Lifecycle

### First visit

1. User connects wallet.
2. App calls `permits.grantPermit([contractA, contractB])`.
3. SDK checks storage — no permits cover these contracts yet.
4. SDK builds EIP-712 typed data (contract addresses, timestamp, duration) and requests a wallet signature.
5. Wallet signs → permit is stored (keyed by signer address, chain ID, and delegator).
6. Ready — subsequent decrypts reuse the stored permit silently.

### Returning visit

1. Page loads → SDK reads permits from storage.
2. Permits cover the requested contracts and haven't expired.
3. Ready — no wallet popup.

### New contract coverage

1. Decrypt request arrives for a contract not covered by existing permits.
2. SDK signs a new permit for the uncovered contracts only.
3. New permit is appended alongside existing ones — nothing is invalidated.

### Expiration

1. A permit's duration elapses (default: 30 days, configurable via `permitTTL`).
2. Permit is pruned from storage on next access.
3. The next decrypt for that contract set prompts a single wallet re-sign.
4. The transport key pair is not affected.

{% hint style="info" %}
Each permit records its start timestamp and duration at creation time. Changing `permitTTL` between sessions does not retroactively alter existing permits — they use their original duration.
{% endhint %}

## How additive permits work

Unlike a session model where re-authorizing replaces the previous authorization, permits are purely additive:

```ts
// Signs permits for all three contracts
await sdk.permits.grantPermit(["0xContractA", "0xContractB", "0xContractC"]);

// ContractA is already covered — only ContractD triggers a new signature
await sdk.permits.grantPermit(["0xContractA", "0xContractD"]);
```

This means users see fewer wallet popups over time. As they interact with more contracts, their permit coverage grows without invalidating earlier permits.

{% hint style="info" %}
Batch all contract addresses you expect to need into a single `permits.grantPermit()` call to minimize wallet popups. Each uncovered chunk of up to 10 contracts triggers one signature prompt.
{% endhint %}

## Revocation

Permits can be removed in two ways:

* **Selective** — `sdk.permits.revokePermits(["0xTokenA"])` removes permits touching those contracts on the current chain. Other permits are untouched.
* **Full wipe** — `sdk.permits.revokePermits()` removes all permits for the current signer across all chains and delegators. The transport key pair is not affected.

For a complete "log out" that also removes the transport key pair, use `sdk.permits.clear()`. See the [ZamaSDK reference](/protocol/sdk/api-references/sdk/zamasdk.md#permits-revokepermits) for the full API.

## Wallet account changes

The SDK automatically manages permits when the wallet state changes:

| Event                 | Effect on permits                                                                 |
| --------------------- | --------------------------------------------------------------------------------- |
| **Disconnect / lock** | All permits and transport key pair cleared for the previous account               |
| **Account switch**    | Previous account's permits cleared; new account starts fresh                      |
| **Chain switch**      | Permits are chain-scoped, so existing permits on the previous chain remain intact |

See [ZamaSDK.onWalletAccountChange](/protocol/sdk/api-references/sdk/zamasdk.md#onwalletaccountchange) for programmatic access to these transitions.

## Related

* [Security Model](/protocol/sdk/concepts/security-model.md) — transport key pair storage, threat model, and trust assumptions
* [Configuration](/protocol/sdk/guides/configuration.md#5-optional-configure-ttls-and-event-listener) — `transportKeyPairTTL` and `permitTTL` settings
* [ZamaSDK](/protocol/sdk/api-references/sdk/zamasdk.md) — `permits.grantPermit()`, `permits.revokePermits()`, `permits.clear()` API


# Security model

This page describes what the SDK protects, what it exposes, and the trust assumptions underlying its design. Understanding these boundaries helps you make informed decisions about deploying confidential tokens.

## What is encrypted

Confidential tokens encrypt **balances** and **confidential transfer amounts**. When a user transfers 500 tokens privately, the plaintext amount is FHE-encrypted client-side before the transaction reaches the blockchain, and the on-chain contract only ever sees the ciphertext.

Shielding and unshielding are the public boundary: they convert tokens between a public ERC-20 and its confidential form, so the **shield/unshield amount is visible on-chain** — it is an ordinary public ERC-20 movement. Privacy begins once tokens are in confidential form: the resulting balance is encrypted, and later confidential transfers hide their amounts.

The on-chain contract stores FHE ciphertexts instead of `uint256` values. Only the balance owner (via their FHE private key and the relayer KMS) can decrypt their own balance.

## What is visible

FHE protects values, not metadata. The following remain publicly observable on-chain:

* **Transaction existence** — that a transaction occurred is visible in the block.
* **Participant addresses** — sender and receiver addresses are part of the transaction.
* **Token contract address** — which confidential token is involved.
* **Transaction type** — whether the call is a shield, transfer, unshield, or approval.
* **Shield and unshield amounts** — converting between public ERC-20 and confidential form is a public ERC-20 transfer, so the converted amount is visible. Only confidential transfers hide their amounts.
* **Gas costs** — standard Ethereum gas accounting.
* **Timing** — when transactions occur.

An observer can see that address A sent a confidential transfer to address B on token contract C. They cannot see how much was sent.

{% hint style="info" %}
This is a value-privacy model, not a full-privacy model. It protects amounts while preserving the public verifiability that makes Ethereum useful. For transaction-graph privacy, additional measures (like mixing services or stealth addresses) would be needed on top of FHE.
{% endhint %}

## Trust assumptions

### The relayer and KMS

The relayer provides the FHE infrastructure: encryption, decryption coordination, and transport key pair generation. The Key Management Service (KMS) holds the network's FHE master key and performs re-encryption.

The critical trust property: **the KMS re-encrypts ciphertexts without learning plaintext values.** When a user requests their balance, the KMS transforms the on-chain ciphertext from the network key to the user's public key. The KMS sees ciphertexts in and ciphertexts out — never plaintext.

This is a cryptographic property of the re-encryption scheme, not a policy promise. The KMS cannot extract plaintext from the ciphertexts it processes, assuming the underlying TFHE scheme is secure.

{% hint style="warning" %}
The KMS must be available for decryption to work. If the relayer is down, users cannot read their balances or finalize unshield operations. The on-chain encrypted data remains safe — it is inaccessible without the FHE infrastructure, but also unreadable until the relayer returns.
{% endhint %}

### The blockchain

The on-chain FHE coprocessor (FHEVM) executes homomorphic operations. It must correctly perform encrypted arithmetic for transfers and balance updates. This is part of the blockchain's consensus — nodes verify FHE operations as part of block validation.

### The user's wallet

The wallet signs EIP-712 typed data to authorize FHE operations. The SDK trusts that the wallet correctly implements `eth_signTypedData_v4` and that the signing key is under the user's control. A compromised wallet compromises the FHE session — the attacker could sign authorization requests and decrypt the user's balances.

## Credential storage

### Transport key pair storage

The transport private key is stored in plaintext in the configured storage backend (typically IndexedDB in browsers). There is no encryption-at-rest layer.

| Parameter  | Value                                                            |
| ---------- | ---------------------------------------------------------------- |
| Storage    | IndexedDB (browser), memory (tests), AsyncLocalStorage (Node.js) |
| Key format | Plaintext ML-KEM key pair                                        |
| Scope      | One transport key pair per signer address (chain-independent)    |

The security model relies on same-origin isolation: only JavaScript running on the same origin can read IndexedDB. See [Permit Model](/protocol/sdk/concepts/permit-model.md) for the full lifecycle.

### Limitations

<details>

<summary>What same-origin isolation does NOT protect against</summary>

* **Same-origin scripts** — any JavaScript running on the same origin can read IndexedDB. A cross-site scripting (XSS) vulnerability could access the transport private key directly. Reducing XSS surface is essential.
* **Physical device access** — someone with access to the device's file system can read the IndexedDB contents.
* **Malicious browser extensions** — extensions with broad permissions can access IndexedDB. Users should audit their installed extensions.

</details>

## WASM bundle integrity

The `web()` relayer transport loads the TFHE WASM bundle from Zama's CDN (`cdn.zama.org`). Before execution, the SDK computes a SHA-384 digest of the fetched payload and compares it to a hash pinned in the library's source code. If the hashes do not match, initialization fails with a clear error.

![WASM Bundle Integrity Check](/files/4wUsChvDSmjt6Nkr5970)

This protects against CDN compromise or man-in-the-middle injection of modified WASM.

Integrity checking is enabled by default. Disable it only in test environments:

```ts
const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web({ security: { integrityCheck: false } }),
  },
});
```

{% hint style="warning" %}
Disabling integrity checks in production removes a critical defense layer. A compromised WASM bundle could exfiltrate transport private keys or manipulate encrypted values.
{% endhint %}

## Browser security headers

### COOP/COEP headers

Multi-threaded FHE requires `SharedArrayBuffer`, which browsers restrict to cross-origin isolated contexts. Your server must send these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers, `SharedArrayBuffer` is unavailable. The SDK falls back to single-threaded WASM execution, which is slower but functional.

{% hint style="info" %}
Single-threaded mode works without COOP/COEP headers. Only enable cross-origin isolation if you need the performance benefit of multi-threaded FHE.
{% endhint %}

### Content Security Policy (CSP)

The Web Worker loads and executes WASM from a CDN. Your CSP must allow:

| Directive     | Value                  | Reason                                        |
| ------------- | ---------------------- | --------------------------------------------- |
| `worker-src`  | `blob:`                | Workers are created from blob URLs            |
| `script-src`  | `'wasm-unsafe-eval'`   | Required for WASM execution inside the worker |
| `connect-src` | `https://cdn.zama.org` | CDN fetch for the WASM bundle                 |

Example CSP header:

```
Content-Security-Policy: worker-src blob:; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' https://cdn.zama.org https://your-relayer-proxy.com;
```

<details>

<summary>Why wasm-unsafe-eval?</summary>

The `wasm-unsafe-eval` directive allows WASM compilation and execution without requiring `unsafe-eval`. It is narrower than `unsafe-eval` — it permits only WebAssembly instantiation, not arbitrary JavaScript `eval()`. All major browsers support it as of 2024.

</details>

## Permit security

### Time-bounded signatures

EIP-712 permit signatures include a start timestamp and duration (in days). The relayer rejects permits outside their validity window. This limits the damage from a leaked permit — it becomes useless after expiry.

Two TTL controls are available:

* `transportKeyPairTTL` — how long the transport key pair remains valid (default: 30 days).
* `permitTTL` — how long signed permits remain valid, in days (default: 30).

### Address-scoped authorization

The EIP-712 typed data includes the wallet address. A permit signed by address A cannot authorize decryption for address B. Combined with contract-scoped authorization (the signed message lists specific contract addresses), each permit is tightly bound to a specific user and set of contracts.

### Revocation

Permits can be revoked programmatically via `sdk.permits.revokePermits()` or automatically via wallet lifecycle events (disconnect, account switch). Revocation removes permits from storage immediately.

After revoking permits, the transport key pair remains in storage. Use `sdk.permits.clear()` to also wipe the key pair.

## CSRF protection

For browser apps, the `web()` transport supports CSRF tokens injected into all mutating HTTP requests to the relayer proxy:

```ts
const config = createConfig({
  chains: [sepolia],
  publicClient,
  walletClient,
  relayers: {
    [sepolia.id]: web({
      security: {
        getCsrfToken: () => document.cookie.match(/csrf=(\w+)/)?.[1] ?? "",
      },
    }),
  },
});
```

The token is refreshed before each encrypt/decrypt call. Only POST, PUT, DELETE, and PATCH requests to the relayer URL include the CSRF header. GET requests and non-relayer URLs pass through without modification.

## Summary of cryptographic algorithms

| Operation        | Algorithm       | Key size    | Source                        |
| ---------------- | --------------- | ----------- | ----------------------------- |
| CDN integrity    | SHA-384         | --          | Web Crypto API                |
| FHE encryption   | TFHE            | Network key | WASM (`@zama-fhe/sdk (WASM)`) |
| ZK proofs        | WASM prover     | --          | WASM (`@zama-fhe/sdk (WASM)`) |
| Wallet signing   | ECDSA secp256k1 | 256-bit     | User wallet                   |
| Request tracking | UUID v4         | 128-bit     | `crypto.randomUUID()`         |

## Reporting vulnerabilities

If you discover a security vulnerability in the SDK, report it to **<security@zama.ai>**. Do not open a public GitHub issue for security reports. See the [Security Policy](https://github.com/zama-ai/sdk/blob/main/SECURITY.md) for full details.