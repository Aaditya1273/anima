# Quick start tutorial (Hardhat)

This tutorial guides you to start quickly with Zama’s **Fully Homomorphic Encryption (FHE)** technology for building confidential smart contracts.

## What You’ll Learn

In **about 30 minutes**, you'll go from a basic Solidity contract to a fully confidential one using **FHEVM**. Here's what you'll do:

1. Set up your development environment
2. Write a simple Solidity smart contract
3. Convert it into an FHEVM-compatible confidential contract
4. Test your FHEVM-compatible confidential contract

## Prerequisite

* A basic understanding of **Solidity** library and **Ethereum**.
* Some familiarity with **Hardhat.**

{% hint style="info" %}

#### About Hardhat

[**Hardhat**](https://hardhat.org/) is a development environment for compiling, deploying, testing, and debugging Ethereum smart contracts. It’s widely used in the Ethereum ecosystem.

In this tutorial, we'll introduce the FHEVM hardhat template that provides an easy way to use FHEVM.
{% endhint %}








# Quick start tutorial (Hardhat)

This tutorial guides you to start quickly with Zama’s **Fully Homomorphic Encryption (FHE)** technology for building confidential smart contracts.

## What You’ll Learn

In **about 30 minutes**, you'll go from a basic Solidity contract to a fully confidential one using **FHEVM**. Here's what you'll do:

1. Set up your development environment
2. Write a simple Solidity smart contract
3. Convert it into an FHEVM-compatible confidential contract
4. Test your FHEVM-compatible confidential contract

## Prerequisite

* A basic understanding of **Solidity** library and **Ethereum**.
* Some familiarity with **Hardhat.**

{% hint style="info" %}

#### About Hardhat

[**Hardhat**](https://hardhat.org/) is a development environment for compiling, deploying, testing, and debugging Ethereum smart contracts. It’s widely used in the Ethereum ecosystem.

In this tutorial, we'll introduce the FHEVM hardhat template that provides an easy way to use FHEVM.
{% endhint %}






# 2. Write a simple contract

In this tutorial, you'll write and test a simple regular Solidity smart contract within the FHEVM Hardhat template to get familiar with Hardhat workflow.

In the [next tutorial](/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm.md), you'll learn how to convert this contract into an FHEVM contract.

## Prerequisite

* [Set up your Hardhat environment](/protocol/solidity-guides/getting-started/setup.md).
* Make sure that you Hardhat project is clean and ready to start. See the instructions [here](/protocol/solidity-guides/getting-started/setup.md#rest-set-the-hardhat-environment).

## What you'll learn

By the end of this tutorial, you will learn to:

* Write a minimal Solidity contract using Hardhat.
* Test the contract using TypeScript and Hardhat’s testing framework.

## Write a simple contract

{% stepper %}
{% step %}

## Create `Counter.sol`

Go to your project's `contracts` directory:

```sh
cd <your-project-root-directory>/contracts
```

From there, create a new file named `Counter.sol` and copy/paste the following Solidity code in it.

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/// @title A simple counter contract
contract Counter {
  uint32 private _count;

  /// @notice Returns the current count
  function getCount() external view returns (uint32) {
    return _count;
  }

  /// @notice Increments the counter by a specific value
  function increment(uint32 value) external {
    _count += value;
  }

  /// @notice Decrements the counter by a specific value
  function decrement(uint32 value) external {
    require(_count >= value, "Counter: cannot decrement below zero");
    _count -= value;
  }
}
```

{% endstep %}

{% step %}

## Compile `Counter.sol`

From your project's root directory, run:

```sh
npx hardhat compile
```

Great! Your Smart Contract is now compiled.
{% endstep %}
{% endstepper %}

## Set up the testing environment

{% stepper %}
{% step %}

## Create a test script `test/Counter.ts`

Go to your project's `test` directory

```sh
cd <your-project-root-directory>/test
```

From there, create a new file named `Counter.ts` and copy/paste the following Typescript skeleton code in it.

```ts
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

describe("Counter", function () {
  it("empty test", async function () {
    console.log("Cool! The test basic skeleton is running!");
  });
});
```

The file contains the following:

* all the required `import` statements we will need during the various tests
* The `chai` basic statements to run a first empty test named `empty test`
  {% endstep %}

{% step %}

## Run the test `test/Counter.ts`

From your project's root directory, run:

```sh
npx hardhat test
```

Output:

```sh
  Counter
Cool! The test basic skeleton is running!
    ✔ empty test


  1 passing (1ms)
```

Great! Your Hardhat test environment is properly setup.
{% endstep %}

{% step %}

## Set up the test signers

Before interacting with smart contracts in Hardhat tests, we need to initialize signers.

{% hint style="info" %}
In the context of Ethereum development, a signer represents an entity (usually a wallet) that can send transactions and sign messages. In Hardhat, `ethers.getSigners()` returns a list of pre-funded test accounts.
{% endhint %}

We’ll define three named signers for convenience:

* `owner` — the deployer of the contract
* `alice` and `bob` — additional simulated users

#### Replace the contents of `test/Counter.ts` with the following:

```ts
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

type Signers = {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("Counter", function () {
  let signers: Signers;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { owner: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  it("should work", async function () {
    console.log(`address of user owner is ${signers.owner.address}`);
    console.log(`address of user alice is ${signers.alice.address}`);
    console.log(`address of user bob is ${signers.bob.address}`);
  });
});
```

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

**Expected Output**

```sh
  Counter
address of user owner is 0x37AC010c1c566696326813b840319B58Bb5840E4
address of user alice is 0xD9F9298BbcD72843586e7E08DAe577E3a0aC8866
address of user bob is 0x3f0CdAe6ebd93F9F776BCBB7da1D42180cC8fcC1
    ✔ should work


  1 passing (2ms)
```

{% endstep %}

{% step %}

## Set up testing instance

Now that we have our signers set up, we can deploy the smart contract.

To ensure isolated and deterministic tests, we should deploy a fresh instance of `Counter.sol` before each test. This avoids any side effects from previous tests.

The standard approach is to define a `deployFixture()` function that handles contract deployment.

```ts
async function deployFixture() {
  const factory = (await ethers.getContractFactory("Counter")) as Counter__factory;
  const counterContract = (await factory.deploy()) as Counter;
  const counterContractAddress = await counterContract.getAddress();

  return { counterContract, counterContractAddress };
}
```

To run this setup before each test case, call `deployFixture()` inside a `beforeEach` block:

```ts
beforeEach(async () => {
  ({ counterContract, counterContractAddress } = await deployFixture());
});
```

This ensures each test runs with a clean, independent contract instance.

Let's put it together. Now your`test/Counter.ts` should look like the following:

```ts
import { Counter, Counter__factory } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("Counter")) as Counter__factory;
  const counterContract = (await factory.deploy()) as Counter;
  const counterContractAddress = await counterContract.getAddress();

  return { counterContract, counterContractAddress };
}

describe("Counter", function () {
  let signers: Signers;
  let counterContract: Counter;
  let counterContractAddress: Counter;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    // Deploy a new instance of the contract before each test
    ({ counterContract, counterContractAddress } = await deployFixture());
  });

  it("should be deployed", async function () {
    console.log(`Counter has been deployed at address ${counterContractAddress}`);
    // Test the deployed address is valid
    expect(ethers.isAddress(counterContractAddress)).to.eq(true);
  });
});
```

**Run the test:**

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output:

```sh
  Counter
Counter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed


  1 passing (7ms)
```

{% endstep %}
{% endstepper %}

## Test functions

Now everything is up and running, you can start testing your contract functions.

{% stepper %}
{% step %}

## Call the contract `getCount()` view function

Everything is up and running, we can now call the `Counter.sol` view function `getCount()` !

Just below the test block `it("should be deployed", async function () {...}`,

add the following unit test:

```ts
it("count should be zero after deployment", async function () {
  const count = await counterContract.getCount();
  console.log(`Counter.getCount() === ${count}`);
  // Expect initial count to be 0 after deployment
  expect(count).to.eq(0);
});
```

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  Counter
Counter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
Counter.getCount() === 0
    ✔ count should be zero after deployment


  1 passing (7ms)
```

{% endstep %}

{% step %}

## Call the contract `increment()` transaction function

Just below the test block `it("count should be zero after deployment", async function () {...}`, add the following test block:

```ts
it("increment the counter by 1", async function () {
  const countBeforeInc = await counterContract.getCount();
  const tx = await counterContract.connect(signers.alice).increment(1);
  await tx.wait();
  const countAfterInc = await counterContract.getCount();
  expect(countAfterInc).to.eq(countBeforeInc + 1n);
});
```

#### Remarks:

* `increment()` is a transactional function that modifies the blockchain state.
* It must be signed by a user — here we use `alice`.
* `await wait()` to wait for the transaction to mined.
* The test compares the counter before and after the transaction to ensure it incremented as expected.

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  Counter
Counter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
Counter.getCount() === 0
    ✔ count should be zero after deployment
    ✔ increment the counter by 1


  2 passing (12ms)
```

{% endstep %}

{% step %}

## Call the contract `decrement()` transaction function

Just below the test block `it("increment the counter by 1", async function () {...}`,

add the following test block:

```ts
it("decrement the counter by 1", async function () {
  // First increment, count becomes 1
  let tx = await counterContract.connect(signers.alice).increment(1);
  await tx.wait();
  // Then decrement, count goes back to 0
  tx = await counterContract.connect(signers.alice).decrement(1);
  await tx.wait();
  const count = await counterContract.getCount();
  expect(count).to.eq(0);
});
```

***

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  Counter
Counter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
Counter.getCount() === 0
    ✔ count should be zero after deployment
    ✔ increment the counter by 1
    ✔ decrement the counter by 1


  2 passing (12ms)
```

{% endstep %}
{% endstepper %}

Now you have successfully written and tested your counter contract. You should have the following files in your project:

* [`contracts/Counter.sol`](https://docs.zama.ai/protocol/examples/basic/fhe-counter#counter.sol) — your Solidity smart contract
* [`test/Counter.ts`](https://docs.zama.ai/protocol/examples/basic/fhe-counter#counter.ts) — your Hardhat test suite written in TypeScript

These files form the foundation of a basic Hardhat-based smart contract project.

## Next step

Now that you've written and tested a basic Solidity smart contract, you're ready to take the next step.

In the [next tutorial](/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm.md), we’ll transform this standard `Counter.sol` contract into `FHECounter.sol`, a trivial FHEVM-compatible version — allowing the counter value to be stored and updated using trivial fully homomorphic encryption.







# 3. Turn it into FHEVM

In this tutorial, you'll learn how to take a basic Solidity smart contract and progressively upgrade it to support Fully Homomorphic Encryption using the FHEVM library by Zama.

Starting with the plain `Counter.sol` contract that you built from the ["Write a simple contract" tutorial](/protocol/solidity-guides/getting-started/quick-start-tutorial/write_a_simple_contract.md), and step-by-step, you’ll learn how to:

* Replace standard types with encrypted equivalents
* Integrate zero-knowledge proof validation
* Enable encrypted on-chain computation
* Grant permissions for secure off-chain decryption

By the end, you'll have a fully functional smart contract that supports FHE computation.

## Initiate the contract

{% stepper %}
{% step %}

## Create the `FHECounter.sol` file

Navigate to your project’s `contracts` directory:

```sh
cd <your-project-root-directory>/contracts
```

From there, create a new file named `FHECounter.sol`, and copy the following Solidity code into it:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/// @title A simple counter contract
contract Counter {
  uint32 private _count;

  /// @notice Returns the current count
  function getCount() external view returns (uint32) {
    return _count;
  }

  /// @notice Increments the counter by a specific value
  function increment(uint32 value) external {
    _count += value;
  }

  /// @notice Decrements the counter by a specific value
  function decrement(uint32 value) external {
    require(_count >= value, "Counter: cannot decrement below zero");
    _count -= value;
  }
}
```

This is a plain `Counter` contract that we’ll use as the starting point for adding FHEVM functionality. We will modify this contract step-by-step to progressively integrate FHEVM capabilities.
{% endstep %}

{% step %}

## Turn `Counter` into `FHECounter`

To begin integrating FHEVM features into your contract, we first need to import the required FHEVM libraries.

#### Replace the current header

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;
```

#### With this updated header:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

These imports:

* **FHE** — the core library to work with FHEVM encrypted types
* **euint32** and **externalEuint32** — encrypted uint32 types used in FHEVM
* **ZamaEthereumConfig** — provides the FHEVM configuration for the Ethereum mainnet or Ethereum Sepolia testnet networks.\
  Inheriting from it enables your contract to use the FHE library

#### Replace the current contract declaration:

```solidity
/// @title A simple counter contract
contract Counter {
```

#### With the updated declaration :

```solidity
/// @title A simple FHE counter contract
contract FHECounter is ZamaEthereumConfig {
```

This change:

* Renames the contract to `FHECounter`
* Inherits from `ZamaEthereumConfig` to enable FHEVM support

{% hint style="warning" %}
This contract must inherit from the `ZamaEthereumConfig` abstract contract; otherwise, it will not be able to execute any FHEVM-related functionality on Sepolia or Hardhat.
{% endhint %}

From your project's root directory, run:

```sh
npx hardhat compile
```

Great! Your smart contract is now compiled and ready to use **FHEVM features.**
{% endstep %}
{% endstepper %}

## Apply FHE functions and types

{% stepper %}
{% step %}

## Comment out the `increment()` and `decrement()` Functions

Before we move forward, let’s comment out the `increment()` and `decrement()` functions in `FHECounter`. We'll replace them later with updated versions that support FHE-encrypted operations.

```solidity
 /// @notice Increments the counter by a specific value
// function increment(uint32 value) external {
//     _count += value;
// }

/// @notice Decrements the counter by a specific value
// function decrement(uint32 value) external {
//     require(_count >= value, "Counter: cannot decrement below zero");
//     _count -= value;
// }
```

{% endstep %}

{% step %}

## Replace `uint32` with the FHEVM `euint32` Type

We’ll now switch from the standard Solidity `uint32` type to the encrypted FHEVM type `euint32`.

This enables private, homomorphic computation on encrypted integers.

#### Replace

```solidity
uint32 _count;
```

and

```solidity
function getCount() external view returns (uint32) {
```

#### With :

```solidity
euint32 _count;
```

and

```solidity
function getCount() external view returns (euint32) {
```

{% endstep %}

{% step %}

## Replace `increment(uint32 value)` with the FHEVM version `increment(externalEuint32 value)`

To support encrypted input, we will update the increment function to accept a value encrypted off-chain.

Instead of using a `uint32`, the new version will accept an `externalEuint32`, which is an encrypted integer produced off-chain and sent to the smart contract.

To ensure the validity of this encrypted value, we also include a second argument:`inputProof`, a bytes array containing a Zero-Knowledge Proof of Knowledge (ZKPoK) that proves two things:

1. The `externalEuint32` was encrypted off-chain by the function caller (`msg.sender`)
2. The `externalEuint32` is bound to the contract (`address(this)`) and can only be processed by it.

#### Replace

```solidity
 /// @notice Increments the counter by a specific value
// function increment(uint32 value) external {
//     _count += value;
// }
```

#### With :

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  //     _count += value;
}
```

{% endstep %}

{% step %}

## Convert `externalEuint32` to `euint32`

You cannot directly use `externalEuint32` in FHE operations. To manipulate it with the FHEVM library, you first need to convert it into the native FHE type `euint32`.

This conversion is done using:

```solidity
FHE.fromExternal(inputEuint32, inputProof);
```

This method verifies the zero-knowledge proof and returns a usable encrypted value within the contract.

#### Replace

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  //     _count += value;
}
```

#### With :

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
  //     _count += value;
}
```

{% endstep %}

{% step %}

## Convert `_count += value` into its FHEVM equivalent

To perform the update `_count += value` in a Fully Homomorphic way, we use the `FHE.add()` operator. This function allows us to compute the FHE sum of 2 encrypted integers.

#### Replace

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
  //     _count += value;
}
```

#### With :

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
  _count = FHE.add(_count, evalue);
}
```

{% hint style="info" %}
This FHE operation allows the smart contract to process encrypted values without ever decrypting them — a core feature of FHEVM that enables on-chain privacy.
{% endhint %}
{% endstep %}
{% endstepper %}

## Grant FHE Permissions

{% hint style="warning" %}
This step is critical! You must grant FHE permissions to both the contract and the caller to ensure the encrypted `_count` value can be decrypted off-chain by the caller. Without these 2 permissions, the caller will not be able to compute the clear result.
{% endhint %}

To grant FHE permission we will call the `FHE.allow()` function.

#### Replace

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
  _count = FHE.add(_count, evalue);
}
```

#### With :

```solidity
/// @notice Increments the counter by a specific value
function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
  _count = FHE.add(_count, evalue);

  FHE.allowThis(_count);
  FHE.allow(_count, msg.sender);
}
```

{% hint style="info" %}
We grant **two** FHE permissions here — not just one. In the next part of the tutorial, you'll learn why **both** are necessary.
{% endhint %}

## Convert `decrement()` to its FHEVM equivalent

Just like with the `increment()` migration, we’ll now convert the `decrement()` function to its FHEVM-compatible version.

Replace :

```solidity
/// @notice Decrements the counter by a specific value
function decrement(uint32 value) external {
  require(_count >= value, "Counter: cannot decrement below zero");
  _count -= value;
}
```

with the following :

```solidity
/// @notice Decrements the counter by a specific value
/// @dev This example omits overflow/underflow checks for simplicity and readability.
/// In a production contract, proper range checks should be implemented.
function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
  euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);

  _count = FHE.sub(_count, encryptedEuint32);

  FHE.allowThis(_count);
  FHE.allow(_count, msg.sender);
}
```

{% hint style="warning" %}
The `increment()` and `decrement()` functions do not perform any overflow or underflow checks.
{% endhint %}

## Compile `FHECounter.sol`

From your project's root directory, run:

```sh
npx hardhat compile
```

Congratulations! Your smart contract is now fully **FHEVM-compatible**.

Now you should have the following files in your project:

* [`contracts/FHECounter.sol`](https://docs.zama.ai/protocol/examples/basic/fhe-counter#fhecounter.sol) — your Solidity smart FHEVM contract
* [`test/FHECounter.ts`](https://docs.zama.ai/protocol/examples/basic/fhe-counter#fhecounter.ts) — your FHEVM Hardhat test suite written in TypeScript

In the [next tutorial](https://github.com/zama-ai/fhevm/blob/release/0.13.x/docs/solidity-guides/getting-started/quick-start-tutorial/test_fhevm_contract.md), we’ll move on to the **TypeScript integration**, where you’ll learn how to interact with your newly upgraded FHEVM contract in a test suite.








# 4. Test the FHEVM contract

In this tutorial, you’ll learn how to migrate a standard Hardhat test suite - from `Counter.ts` to its FHEVM-compatible version `FHECounter.ts` — and progressively enhance it to support Fully Homomorphic Encryption using Zama’s FHEVM library.

## Set up the FHEVM testing environment

{% stepper %}
{% step %}

## Create a test script `test/FHECounter.ts`

Go to your project's `test` directory

```sh
cd <your-project-root-directory>/test
```

From there, create a new file named `FHECounter.ts` and copy/paste the following Typescript skeleton code in it.

```ts
import { FHECounter, FHECounter__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHECounter")) as FHECounter__factory;
  const fheCounterContract = (await factory.deploy()) as FHECounter;
  const fheCounterContractAddress = await fheCounterContract.getAddress();

  return { fheCounterContract, fheCounterContractAddress };
}

describe("FHECounter", function () {
  let signers: Signers;
  let fheCounterContract: FHECounter;
  let fheCounterContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    ({ fheCounterContract, fheCounterContractAddress } = await deployFixture());
  });

  it("should be deployed", async function () {
    console.log(`FHECounter has been deployed at address ${fheCounterContractAddress}`);
    // Test the deployed address is valid
    expect(ethers.isAddress(fheCounterContractAddress)).to.eq(true);
  });

  //   it("count should be zero after deployment", async function () {
  //     const count = await counterContract.getCount();
  //     console.log(`Counter.getCount() === ${count}`);
  //     // Expect initial count to be 0 after deployment
  //     expect(count).to.eq(0);
  //   });

  //   it("increment the counter by 1", async function () {
  //     const countBeforeInc = await counterContract.getCount();
  //     const tx = await counterContract.connect(signers.alice).increment(1);
  //     await tx.wait();
  //     const countAfterInc = await counterContract.getCount();
  //     expect(countAfterInc).to.eq(countBeforeInc + 1n);
  //   });

  //   it("decrement the counter by 1", async function () {
  //     // First increment, count becomes 1
  //     let tx = await counterContract.connect(signers.alice).increment();
  //     await tx.wait();
  //     // Then decrement, count goes back to 0
  //     tx = await counterContract.connect(signers.alice).decrement(1);
  //     await tx.wait();
  //     const count = await counterContract.getCount();
  //     expect(count).to.eq(0);
  //   });
});
```

### What’s Different from `Counter.ts`?

* This test file is structurally similar to the original `Counter.ts`, but it uses the FHEVM-compatible smart contract `FHECounter` instead of the regular `Counter`.

– For clarity, the `Counter` unit tests are included as comments, allowing you to better understand how each part is adapted during the migration to FHEVM.

* While the test logic remains the same, this version is now set up to support encrypted computations via the FHEVM library — enabling tests that manipulate confidential values directly on-chain.
  {% endstep %}

{% step %}

## Run the test `test/FHECounter.ts`

From your project's root directory, run:

```sh
npx hardhat test
```

Output:

```sh
  FHECounter
FHECounter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed


  1 passing (1ms)
```

Great! Your Hardhat FHEVM test environment is properly setup.
{% endstep %}
{% endstepper %}

## Test functions

Now everything is up and running, you can start testing your contract functions.

{% stepper %}
{% step %}

## Call the contract `getCount()` view function

Replace the commented‐out test for the legacy `Counter` contract:

```ts
//   it("count should be zero after deployment", async function () {
//     const count = await counterContract.getCount();
//     console.log(`Counter.getCount() === ${count}`);
//     // Expect initial count to be 0 after deployment
//     expect(count).to.eq(0);
//   });
```

with its FHEVM equivalent:

```ts
it("encrypted count should be uninitialized after deployment", async function () {
  const encryptedCount = await fheCounterContract.getCount();
  // Expect initial count to be bytes32(0) after deployment,
  // (meaning the encrypted count value is uninitialized)
  expect(encryptedCount).to.eq(ethers.ZeroHash);
});
```

#### What’s different?

– `encryptedCount` is no longer a plain TypeScript number. It is now a hexadecimal string representing a Solidity `bytes32` value, known as an **FHEVM handle**. This handle points to an encrypted FHEVM primitive of type `euint32`, which internally represents an encrypted Solidity `uint32` primitive type.

* `encryptedCount` is equal to `0x0000000000000000000000000000000000000000000000000000000000000000` which means that `encryptedCount` is uninitialized, and does not reference to any encrypted value at this point.

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  Counter
Counter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
    ✔ encrypted count should be uninitialized after deployment


  2 passing (7ms)
```

{% endstep %}

{% step %}

## Setup the `increment()` function unit test

We’ll migrate the `increment()` unit test to FHEVM step by step. To start, let’s handle the value of the counter before the first increment. As explained above, the counter is initially a `bytes32` value equal to zero, meaning the FHEVM `euint32` variable is uninitialized.

We’ll interpret this as if the underlying clear value is 0.

Replace the commented‐out test for the legacy `Counter` contract:

```ts
//   it("increment the counter by 1", async function () {
//     const countBeforeInc = await counterContract.getCount();
//     const tx = await counterContract.connect(signers.alice).increment(1);
//     await tx.wait();
//     const countAfterInc = await counterContract.getCount();
//     expect(countAfterInc).to.eq(countBeforeInc + 1n);
//   });
```

with the following:

```ts
it("increment the counter by 1", async function () {
  const encryptedCountBeforeInc = await fheCounterContract.getCount();
  expect(encryptedCountBeforeInc).to.eq(ethers.ZeroHash);
  const clearCountBeforeInc = 0;

  // const tx = await counterContract.connect(signers.alice).increment(1);
  // await tx.wait();
  // const countAfterInc = await counterContract.getCount();
  // expect(countAfterInc).to.eq(countBeforeInc + 1n);
});
```

{% endstep %}

{% step %}

## Encrypt the `increment()` function argument

The `increment()` function takes a single argument: the value by which the counter should be incremented. In the initial version of `Counter.sol`, this value is a clear `uint32`.

We’ll switch to passing an encrypted value instead, using FHEVM `externalEuint32` primitive type. This allows us to securely increment the counter without revealing the input value on-chain.

{% hint style="info" %}
We are using an `externalEuint32` instead of a regular `euint32`. This tells the FHEVM that the encrypted `uint32` was provided externally (e.g., by a user) and must be verified for integrity and authenticity before it can be used within the contract.
{% endhint %}

Replace :

```ts
it("increment the counter by 1", async function () {
  const encryptedCountBeforeInc = await fheCounterContract.getCount();
  expect(encryptedCountBeforeInc).to.eq(ethers.ZeroHash);
  const clearCountBeforeInc = 0;

  // const tx = await counterContract.connect(signers.alice).increment(1);
  // await tx.wait();
  // const countAfterInc = await counterContract.getCount();
  // expect(countAfterInc).to.eq(countBeforeInc + 1n);
});
```

with the following:

```ts
it("increment the counter by 1", async function () {
  const encryptedCountBeforeInc = await fheCounterContract.getCount();
  expect(encryptedCountBeforeInc).to.eq(ethers.ZeroHash);
  const clearCountBeforeInc = 0;

  // Encrypt constant 1 as a euint32
  const clearOne = 1;
  const encryptedOne = await fhevm
    .createEncryptedInput(fheCounterContractAddress, signers.alice.address)
    .add32(clearOne)
    .encrypt();

  // const tx = await counterContract.connect(signers.alice).increment(1);
  // await tx.wait();
  // const countAfterInc = await counterContract.getCount();
  // expect(countAfterInc).to.eq(countBeforeInc + 1n);
});
```

{% hint style="info" %}
`fhevm.createEncryptedInput(fheCounterContractAddress, signers.alice.address)` creates an encrypted value that is bound to both the contract (`fheCounterContractAddress`) and the user (`signers.alice.address`). This means only Alice can use this encrypted value, and only within the `FHECounter.sol` contract at that specific address. **It cannot be reused by another user or in a different contract, ensuring data confidentiality and binding context-specific encryption.**
{% endhint %}
{% endstep %}

{% step %}

## Call the `increment()` function with the encrypted argument

Now that we have an encrypted argument, we can call the `increment()` function with it.

Below, you’ll notice that the updated `increment()` function now takes **two arguments instead of one.**

This is because the FHEVM requires both:

1. The `externalEuint32` — the encrypted value itself
2. An accompanying **Zero-Knowledge Proof of Knowledge** (`inputProof`) — which verifies that the encrypted input is securely bound to:
   * the caller (Alice, the transaction signer), and
   * the target smart contract (where `increment()` is being executed)

This ensures that the encrypted value cannot be reused in a different context or by a different user, preserving **confidentiality and integrity.**

Replace :

```ts
// const tx = await counterContract.connect(signers.alice).increment(1);
// await tx.wait();
```

with the following:

```ts
const tx = await fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof);
await tx.wait();
```

At this point the counter has been successfully incremented by 1 using a **Fully Homomorphic Encryption (FHE)**. In the next step, we will retrieve the updated encrypted counter value and decrypt it locally. But before we move on, let’s quickly run the tests to make sure everything is working correctly.

***

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  FHECounter
FHECounter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
    ✔ encrypted count should be uninitialized after deployment
    ✔ increment the counter by 1


  3 passing (7ms)
```

{% endstep %}

{% step %}

## Call the `getCount()` function and Decrypt the value

Now that the counter has been incremented using an encrypted input, it's time to **read the updated encrypted value** from the smart contract and **decrypt it** using the `userDecryptEuint` function provided by the FHEVM Hardhat Plugin.

The `userDecryptEuint` function takes four parameters:

1. **FhevmType**: The integer type of the FHE-encrypted value. In this case, we're using `FhevmType.euint32` because the counter is a `uint32`.
2. **Encrypted handle**: A 32-byte FHEVM handle representing the encrypted value you want to decrypt.
3. **Smart contract address**: The address of the contract that has permission to access the encrypted handle.
4. **User signer**: The signer (e.g., signers.alice) who has permission to access the handle.

{% hint style="info" %}
Note: Permissions to access the FHEVM handle are set on-chain using the `FHE.allow()` Solidity function (see FHECounter.sol).
{% endhint %}

Replace :

```ts
// const countAfterInc = await counterContract.getCount();
// expect(countAfterInc).to.eq(countBeforeInc + 1n);
```

with the following:

```ts
const encryptedCountAfterInc = await fheCounterContract.getCount();
const clearCountAfterInc = await fhevm.userDecryptEuint(
  FhevmType.euint32,
  encryptedCountAfterInc,
  fheCounterContractAddress,
  signers.alice,
);
expect(clearCountAfterInc).to.eq(clearCountBeforeInc + clearOne);
```

***

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  FHECounter
FHECounter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
    ✔ encrypted count should be uninitialized after deployment
    ✔ increment the counter by 1


  3 passing (7ms)
```

{% endstep %}

{% step %}

## Call the contract `decrement()` function

Similarly to the previous test, we’ll now call the `decrement()` function using an encrypted input.

Replace :

```ts
//   it("decrement the counter by 1", async function () {
//     // First increment, count becomes 1
//     let tx = await counterContract.connect(signers.alice).increment();
//     await tx.wait();
//     // Then decrement, count goes back to 0
//     tx = await counterContract.connect(signers.alice).decrement(1);
//     await tx.wait();
//     const count = await counterContract.getCount();
//     expect(count).to.eq(0);
//   });
```

with the following:

```ts
it("decrement the counter by 1", async function () {
  // Encrypt constant 1 as a euint32
  const clearOne = 1;
  const encryptedOne = await fhevm
    .createEncryptedInput(fheCounterContractAddress, signers.alice.address)
    .add32(clearOne)
    .encrypt();

  // First increment by 1, count becomes 1
  let tx = await fheCounterContract.connect(signers.alice).increment(encryptedOne.handles[0], encryptedOne.inputProof);
  await tx.wait();

  // Then decrement by 1, count goes back to 0
  tx = await fheCounterContract.connect(signers.alice).decrement(encryptedOne.handles[0], encryptedOne.inputProof);
  await tx.wait();

  const encryptedCountAfterDec = await fheCounterContract.getCount();
  const clearCountAfterDec = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    encryptedCountAfterDec,
    fheCounterContractAddress,
    signers.alice,
  );

  expect(clearCountAfterDec).to.eq(0);
});
```

***

#### Run the test

From your project's root directory, run:

```sh
npx hardhat test
```

#### Expected Output

```sh
  FHECounter
FHECounter has been deployed at address 0x7553CB9124f974Ee475E5cE45482F90d5B6076BC
    ✔ should be deployed
    ✔ encrypted count should be uninitialized after deployment
    ✔ increment the counter by 1
    ✔ decrement the counter by 1


  4 passing (7ms)
```

{% endstep %}
{% endstepper %}

## Congratulations! You've completed the full tutorial.

You have successfully written and tested your FHEVM-based counter smart contract. By now, your project should include the following files:

* [`contracts/FHECounter.sol`](https://docs.zama.ai/protocol/examples#tab-fhecounter.sol) — your Solidity smart contract
* [`test/FHECounter.ts`](https://docs.zama.ai/protocol/examples#tab-fhecounter.ts) — your Hardhat test suite written in TypeScript

## Next step

If you would like to deploy your project on the testnet, or learn more about using FHEVM Hardhat Plugin, head to [Deploy contracts and run tests](/protocol/solidity-guides/development-guide/hardhat/run_test.md).





# Configuration

This document explains how to enable encrypted computations in your smart contract by setting up the `fhevm` environment. Learn how to integrate essential libraries, configure encryption, and add secure computation logic to your contracts.

## Core configuration setup

To utilize encrypted computations in Solidity contracts, you must configure the **FHE library**. The `fhevm` package simplifies this process with prebuilt configuration contracts, allowing you to focus on developing your contract's logic without handling the underlying cryptographic setup.

This library and its associated contracts provide a standardized way to configure and interact with Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) infrastructure on different Ethereum networks. It supplies the necessary contract addresses for Zama's FHEVM components (`ACL`, `FHEVMExecutor`, `KMSVerifier`), enabling seamless integration for Solidity contracts that require FHEVM support. The `InputVerifier` is not part of the inherited config — it is resolved at runtime via `FHEVMExecutor.getInputVerifierAddress()`.

## Key components configured automatically

1. **FHE library**: Sets up encryption parameters and cryptographic keys.
2. **Network-specific settings**: Adapts to local testing, testnets (Sepolia for example), or mainnet deployment.

By inheriting these configuration contracts, you ensure seamless initialization and functionality across environments.

## ZamaConfig.sol

The `ZamaConfig` library exposes functions to retrieve FHEVM configuration structs and contract addresses for supported networks: Ethereum mainnet, Sepolia testnet, and local Hardhat environments.

Under the hood, this library encapsulates the network-specific addresses of Zama's FHEVM infrastructure into a single struct (`CoprocessorConfig`).

## ZamaEthereumConfig

The `ZamaEthereumConfig` contract is designed to be inherited by a user contract. The constructor automatically sets up the FHEVM coprocessor using the configuration provided by the library for the respective network. When a contract inherits from `ZamaEthereumConfig`, the constructor calls `FHE.setCoprocessor` with the appropriate addresses. This ensures that the inheriting contract is automatically wired to the correct FHEVM contracts for the target network, abstracting away manual address management and reducing the risk of misconfiguration.

**Example**

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyERC20 is ZamaEthereumConfig {
  constructor() {
    // Additional initialization logic if needed
  }
}
```

## Using `isInitialized`

The `isInitialized` utility function checks whether an encrypted variable has been properly initialized, preventing unexpected behavior due to uninitialized values.

**Function signature**

```solidity
function isInitialized(T v) internal pure returns (bool)
```

**Purpose**

* Ensures encrypted variables are initialized before use.
* Prevents potential logic errors in contract execution.

**Example: Initialization Check for Encrypted Counter**

```solidity
require(FHE.isInitialized(counter), "Counter not initialized!");
```

## Summary

By leveraging prebuilt a configuration contract like `ZamaEthereumConfig` in `ZamaConfig.sol`, you can efficiently set up your smart contract for encrypted computations. These tools abstract the complexity of cryptographic initialization, allowing you to focus on building secure, confidential smart contracts.





# Contract addresses

### Ethereum mainnet

| Contract/Service          | Address                                    |
| ------------------------- | ------------------------------------------ |
| ACL\_CONTRACT             | 0xcA2E8f1F656CD25C01F05d0b243Ab1ecd4a8ffb6 |
| FHEVM\_EXECUTOR\_CONTRACT | 0xD82385dADa1ae3E969447f20A3164F6213100e75 |
| KMS\_VERIFIER\_CONTRACT   | 0x77627828a55156b04Ac0DC0eb30467f1a552BB03 |

### Sepolia testnet

| Contract/Service             | Address/Value                              |
| ---------------------------- | ------------------------------------------ |
| ACL\_CONTRACT                | 0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D |
| FHEVM\_EXECUTOR\_CONTRACT    | 0x92C920834Ec8941d2C77D188936E1f7A6f49c127 |
| KMS\_VERIFIER\_CONTRACT      | 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A |
| HCU\_LIMIT\_CONTRACT         | 0xa10998783c8CF88D886Bc30307e631D6686F0A22 |
| INPUT\_VERIFIER\_CONTRACT    | 0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0 |
| DECRYPTION\_ADDRESS          | 0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478 |
| INPUT\_VERIFICATION\_ADDRESS | 0x483b9dE06E4E4C7D35CCf5837A1668487406D955 |
| RELAYER\_URL                 | `https://relayer.testnet.zama.org`         |
| GATEWAY\_CHAIN\_ID           | 10901                                      |

{% hint style="info" %}
You do not need to configure these addresses manually. Inheriting from `ZamaEthereumConfig` automatically resolves the correct addresses based on the current `block.chainid`.
{% endhint %}







# Supported types

This document introduces the encrypted integer types provided by the `FHE` library in FHEVM and explains their usage, including casting, state variable declarations, and type-specific considerations.

## Introduction

The `FHE` library offers a robust type system with encrypted integer types, enabling secure computations on confidential data in smart contracts. These encrypted types are validated both at compile time and runtime to ensure correctness and security.

### Key features of encrypted types

* Encrypted integers function similarly to Solidity’s native integer types, but they operate on **Fully Homomorphic Encryption (FHE)** ciphertexts.
* Arithmetic operations on `e(u)int` types are **unchecked**, meaning they wrap around on overflow. This design choice ensures confidentiality by avoiding the leakage of information through error detection.
* Future versions of the `FHE` library will support encrypted integers with overflow checking, but with the trade-off of exposing limited information about the operands.

{% hint style="info" %}
Encrypted integers with overflow checking will soon be available in the `FHE` library. These will allow reversible arithmetic operations but may reveal some information about the input values.
{% endhint %}

Encrypted integers in FHEVM are represented as FHE ciphertexts, abstracted using ciphertext handles. These types, prefixed with `e` (for example, `euint64`) act as secure wrappers over the ciphertext handles.

## List of encrypted types

The `FHE` library currently supports the following encrypted types:

| Type     | Bit Length | Supported Operators                                                                                                                | Aliases (with supported operators)                                                      |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Ebool    | 2          | and, or, xor, eq, ne, not, select, rand                                                                                            |                                                                                         |
| Euint8   | 8          | add, sub, mul, div, rem, and, or, xor, shl, shr, rotl, rotr, eq, ne, ge, gt, le, lt, min, max, neg, not, select, rand, randBounded |                                                                                         |
| Euint16  | 16         | add, sub, mul, div, rem, and, or, xor, shl, shr, rotl, rotr, eq, ne, ge, gt, le, lt, min, max, neg, not, select, rand, randBounded |                                                                                         |
| Euint32  | 32         | add, sub, mul, div, rem, and, or, xor, shl, shr, rotl, rotr, eq, ne, ge, gt, le, lt, min, max, neg, not, select, rand, randBounded |                                                                                         |
| Euint64  | 64         | add, sub, mul, div, rem, and, or, xor, shl, shr, rotl, rotr, eq, ne, ge, gt, le, lt, min, max, neg, not, select, rand, randBounded |                                                                                         |
| Euint128 | 128        | add, sub, mul, div, rem, and, or, xor, shl, shr, rotl, rotr, eq, ne, ge, gt, le, lt, min, max, neg, not, select, rand, randBounded |                                                                                         |
| Euint160 | 160        | eq, ne, select                                                                                                                     | Eaddress — `eaddress` is an alias for `euint160`, used for encrypted Ethereum addresses |
| Euint256 | 256        | and, or, xor, shl, shr, rotl, rotr, eq, ne, neg, not, select, rand, randBounded                                                    |                                                                                         |

{% hint style="info" %}
Division (`div`) and remainder (`rem`) operations are only supported when the right-hand side (`rhs`) operand is a plaintext (non-encrypted) value. Attempting to use an encrypted value as `rhs` will result in a panic. This restriction ensures correct and secure computation within the current framework.
{% endhint %}

{% hint style="info" %}
Higher-precision integer types are available in the `TFHE-rs` library and can be added to `fhevm` as needed.
{% endhint %}







# Handles

Every encrypted value in FHEVM (`euint8`, `ebool`, `eaddress`, …) is referenced on-chain by a 32-byte **handle**. FHE operations take and return handles, and the ACL is enforced per handle.

## Glossary

Three concepts that look similar but live in different places:

| Term            | What it is                                                                                                                                                                                                         | Where it lives                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **Plaintext**   | The actual cleartext value (e.g. the number `42`). What `decrypt(...)` returns.                                                                                                                                    | Off-chain, only after authorized decryption. |
| **Ciphertext**  | The encrypted blob produced by FHE — the bytes the coprocessor stores and computes on. May be re-randomized at any time without changing the plaintext.                                                            | Off-chain, with the coprocessor.             |
| **Handle**      | A 32-byte on-chain identifier that points to a specific (plaintext, ciphertext) pair. The handle is what your Solidity code holds and passes around.                                                               | On-chain.                                    |
| **Computation** | The sequence of FHE operations that produced a handle (e.g. `FHE.add(a, b)`). Two different computations may produce the same handle, or the same computation may produce different handles in different contexts. | Conceptual — not stored as such.             |

The protocol guarantees a relationship between **handles** and **plaintexts**. It deliberately does not guarantee any relationship between handles and ciphertexts, or between handles and the computations that produced them.

## Core principle: handles are opaque

{% hint style="warning" %}
Treat handles like a name tag, not like the thing itself. The bytes don't tell you anything about how the handle was made or what ciphertext is behind it. The only thing you can read off a handle is which plaintext it points to — and only after decryption.
{% endhint %}

You **can** treat a handle like any other `bytes32`: compare it with `==` / `!=`, store it, log it, etc. The ACL itself works this way. What you **can't** do is guess from the bytes how the handle was made, or which ciphertext sits behind it.

## What you can rely on

The protocol gives you one rule:

> **If two handles are equal, they point to the same plaintext.**

That rule has a mirror that's also true: if two plaintexts are different, their handles must be different too. Anything beyond that, you can't assume.

| You can rely on                          | You can't rely on                              |
| ---------------------------------------- | ---------------------------------------------- |
| Equal handles → equal plaintexts         | Different handles → different plaintexts       |
| Different plaintexts → different handles | Equal plaintexts → equal handles               |
|                                          | Equal handles → same computation produced both |
|                                          | Equal handles → same ciphertext underneath     |

The protocol may produce equal handles for some equal-plaintext computations and different ones for others — across blocks, across chains, after ciphertext re-randomization, or under future optimizations. Your contract must work either way.

## Common mistakes

**Assuming "same operation, same inputs → same handle".** Today, the protocol mixes the previous block's hash into how each handle is built, so the same computation in two different blocks already gives you different handles. And the reverse — assuming two different operations always produce different handles — can break if the protocol ever optimizes them down to the same handle.

```solidity
// ❌ Don't depend on h3 == h4. Don't depend on h3 != h4 either.
euint64 h3 = FHE.add(h1, h2);
euint64 h4 = FHE.add(h1, h2);
```

**Mixing handles from different places.** A handle that was bridged from another chain, or built off-chain and brought in via `FHE.fromExternal(...)`, is not guaranteed to equal a handle produced by on-chain computation — even when both encode the same plaintext.

If you need to know whether two encrypted values are equal in plaintext, use the FHE operator. It returns an `ebool` that decrypts to `true` if and only if the underlying values match:

```solidity
ebool isEqual = FHE.eq(a, b);
```




# Operations on encrypted types

This document outlines the operations supported on encrypted types in the `FHE` library, enabling arithmetic, bitwise, comparison, and more on Fully Homomorphic Encryption (FHE) ciphertexts.

## Arithmetic operations

The following arithmetic operations are supported for encrypted integers (`euintX`):

| Name                         | Function name | Symbol | Type   |
| ---------------------------- | ------------- | ------ | ------ |
| Add                          | `FHE.add`     | `+`    | Binary |
| Subtract                     | `FHE.sub`     | `-`    | Binary |
| Multiply                     | `FHE.mul`     | `*`    | Binary |
| Divide (plaintext divisor)   | `FHE.div`     |        | Binary |
| Reminder (plaintext divisor) | `FHE.rem`     |        | Binary |
| Negation                     | `FHE.neg`     | `-`    | Unary  |
| Min                          | `FHE.min`     |        | Binary |
| Max                          | `FHE.max`     |        | Binary |

{% hint style="info" %}
Division (FHE.div) and remainder (FHE.rem) operations are currently supported only with plaintext divisors.
{% endhint %}

## Bitwise operations

The FHE library also supports bitwise operations, including shifts and rotations:

| Name         | Function name | Symbol | Type   |
| ------------ | ------------- | ------ | ------ |
| Bitwise AND  | `FHE.and`     | `&`    | Binary |
| Bitwise OR   | `FHE.or`      | `\|`   | Binary |
| Bitwise XOR  | `FHE.xor`     | `^`    | Binary |
| Bitwise NOT  | `FHE.not`     | `~`    | Unary  |
| Shift Right  | `FHE.shr`     |        | Binary |
| Shift Left   | `FHE.shl`     |        | Binary |
| Rotate Right | `FHE.rotr`    |        | Binary |
| Rotate Left  | `FHE.rotl`    |        | Binary |

The shift operators `FHE.shr` and `FHE.shl` can take any encrypted type `euintX` as a first operand and either a `uint8`or a `euint8` as a second operand, however the second operand will always be computed modulo the number of bits of the first operand. For example, `FHE.shr(euint64 x, 70)` is equivalent to `FHE.shr(euint64 x, 6)` because `70 % 64 = 6`. This differs from the classical shift operators in Solidity, where there is no intermediate modulo operation, so for instance any `uint64` shifted right via `>>` would give a null result.

## Comparison operations

Encrypted integers can be compared using the following functions:

| Name                  | Function name | Symbol | Type   |
| --------------------- | ------------- | ------ | ------ |
| Equal                 | `FHE.eq`      |        | Binary |
| Not equal             | `FHE.ne`      |        | Binary |
| Greater than or equal | `FHE.ge`      |        | Binary |
| Greater than          | `FHE.gt`      |        | Binary |
| Less than or equal    | `FHE.le`      |        | Binary |
| Less than             | `FHE.lt`      |        | Binary |

## Ternary operation

The `FHE.select` function is a ternary operation that selects one of two encrypted values based on an encrypted condition:

| Name   | Function name | Symbol | Type    |
| ------ | ------------- | ------ | ------- |
| Select | `FHE.select`  |        | Ternary |

## Random operations

You can generate cryptographically secure random numbers fully on-chain:

<table data-header-hidden><thead><tr><th></th><th width="206"></th><th></th><th></th></tr></thead><tbody><tr><td><strong>Name</strong></td><td><strong>Function Name</strong></td><td><strong>Symbol</strong></td><td><strong>Type</strong></td></tr><tr><td>Random Unsigned Integer</td><td><code>FHE.randEuintX()</code></td><td></td><td>Random</td></tr></tbody></table>

For more details, refer to the [Random Encrypted Numbers](/protocol/solidity-guides/smart-contract/operations/random.md) document.

## Best Practices

Here are some best practices to follow when using encrypted operations in your smart contracts:

### Use the appropriate encrypted type size

Choose the smallest encrypted type that can accommodate your data to optimize gas costs. For example, use `euint8` for small numbers (0-255) rather than `euint256`.

❌ Avoid using oversized types:

```solidity
// Bad: Using euint256 for small numbers wastes gas
euint64 age = FHE.asEuint128(25);  // age will never exceed 255
euint64 percentage = FHE.asEuint128(75);  // percentage is 0-100
```

✅ Instead, use the smallest appropriate type:

```solidity
// Good: Using appropriate sized types
euint8 age = FHE.asEuint8(25);  // age fits in 8 bits
euint8 percentage = FHE.asEuint8(75);  // percentage fits in 8 bits
```

### Use scalar operands when possible to save gas

Some FHE operators exist in two versions: one where all operands are ciphertexts handles, and another where one of the operands is an unencrypted scalar. Whenever possible, use the scalar operand version, as this will save a lot of gas.

❌ For example, this snippet cost way more in gas:

```solidity
euint32 x;
...
x = FHE.add(x,FHE.asEuint(42));
```

✅ Than this one:

```solidity
euint32 x;
// ...
x = FHE.add(x,42);
```

Despite both leading to the same encrypted result!

### Beware of overflows of FHE arithmetic operators

FHE arithmetic operators can overflow. Do not forget to take into account such a possibility when implementing FHEVM smart contracts.

❌ For example, if you wanted to create a mint function for an encrypted ERC20 token with an encrypted `totalSupply` state variable, this code is vulnerable to overflows:

```solidity
function mint(externalEuint32 encryptedAmount, bytes calldata inputProof) public {
  euint32 mintedAmount = FHE.fromExternal(encryptedAmount, inputProof);
  totalSupply = FHE.add(totalSupply, mintedAmount);
  balances[msg.sender] = FHE.add(balances[msg.sender], mintedAmount);
  FHE.allowThis(balances[msg.sender]);
  FHE.allow(balances[msg.sender], msg.sender);
}
```

✅ But you can fix this issue by using `FHE.select` to cancel the mint in case of an overflow:

```solidity
function mint(externalEuint32 encryptedAmount, bytes calldata inputProof) public {
  euint32 mintedAmount = FHE.fromExternal(encryptedAmount, inputProof);
  euint32 tempTotalSupply = FHE.add(totalSupply, mintedAmount);
  ebool isOverflow = FHE.lt(tempTotalSupply, totalSupply);
  totalSupply = FHE.select(isOverflow, totalSupply, tempTotalSupply);
  euint32 tempBalanceOf = FHE.add(balances[msg.sender], mintedAmount);
  balances[msg.sender] = FHE.select(isOverflow, balances[msg.sender], tempBalanceOf);
  FHE.allowThis(balances[msg.sender]);
  FHE.allow(balances[msg.sender], msg.sender);
}
```

Notice that we did not check separately the overflow on `balances[msg.sender]` but only on `totalSupply` variable, because `totalSupply` is the sum of the balances of all the users, so `balances[msg.sender]` could never overflow if `totalSupply` did not.




# Casting and trivial encryption

This documentation covers the `asEbool`, `asEuintXX`, and `asEaddress` operations provided by the FHE library for working with encrypted data in the FHEVM. These operations are essential for converting between plaintext and encrypted types, as well as handling encrypted inputs.

The operations can be categorized into two main use cases:

1. **Trivial encryption**: Converting plaintext values to encrypted types
2. **Type casting**: Converting between different encrypted types

## 1. Trivial encryption

Trivial encryption simply put is a plain text in a format of a ciphertext.

### Overview

Trivial encryption is the process of converting plaintext values into encrypted types (ciphertexts) compatible with FHE operators. Although the data is in ciphertext format, it remains publicly visible on-chain, making it useful for operations between public and private values.

This type of casting involves converting plaintext (unencrypted) values into their encrypted equivalents, such as:

* `bool` → `ebool`
* `uint` → `euintXX`
* `address` → `eaddress`

{% hint style="info" %}
When doing trivial encryption, the data is made compatible with FHE operations but remains publicly visible on-chain unless explicitly encrypted.
{% endhint %}

#### **Example**

```solidity
euint64 value64 = FHE.asEuint64(7262);  // Trivial encrypt a uint64
ebool valueBool = FHE.asEbool(true);   // Trivial encrypt a boolean
```

## 2. Casting between encrypted types

This type of casting is used to reinterpret or convert one encrypted type into another. For example:

* `euint32` → `euint64`

Casting between encrypted types is often required when working with operations that demand specific sizes or precisions.

> **Important**: When casting between encrypted types:
>
> * Casting from smaller types to larger types (e.g. `euint32` → `euint64`) preserves all information
> * Casting from larger types to smaller types (e.g. `euint64` → `euint32`) will truncate and lose information

The table below summarizes the available casting functions:

| From type | To type  | Function        |
| --------- | -------- | --------------- |
| `euintX`  | `euintX` | `FHE.asEuintXX` |
| `ebool`   | `euintX` | `FHE.asEuintXX` |
| `euintX`  | `ebool`  | `FHE.asEbool`   |

{% hint style="info" %}
Casting between encrypted types is efficient and often necessary when handling data with differing precision requirements.
{% endhint %}

### **Workflow for encrypted types**

```solidity
// Casting between encrypted types
euint32 value32 = FHE.asEuint32(value64); // Cast to euint32
ebool valueBool = FHE.asEbool(value32);   // Cast to ebool
```

## Overall operation summary

| Casting Type             | Function            | Input Type        | Output Type |
| ------------------------ | ------------------- | ----------------- | ----------- |
| Trivial encryption       | `FHE.asEuintXX(x)`  | `uintX`           | `euintX`    |
|                          | `FHE.asEbool(x)`    | `bool`            | `ebool`     |
|                          | `FHE.asEaddress(x)` | `address`         | `eaddress`  |
| Conversion between types | `FHE.asEuintXX(x)`  | `euintXX`/`ebool` | `euintYY`   |
|                          | `FHE.asEbool(x)`    | `euintXX`         | `ebool`     |







# Generate random numbers

This document explains how to generate cryptographically secure random encrypted numbers fully on-chain using the `FHE` library in fhevm. These numbers are encrypted and remain confidential, enabling privacy-preserving smart contract logic.

## **Key notes on random number generation**

* **On-chain execution**: Random number generation must be executed during a transaction, as it requires the pseudo-random number generator (PRNG) state to be updated on-chain. This operation cannot be performed using the `eth_call` RPC method.
* **Cryptographic security**: The generated random numbers are cryptographically secure and encrypted, ensuring privacy and unpredictability.

{% hint style="info" %}
Random number generation must be performed during transactions, as it requires the pseudo-random number generator (PRNG) state to be mutated on-chain. Therefore, it cannot be executed using the `eth_call` RPC method.
{% endhint %}

## **Basic usage**

The `FHE` library allows you to generate random encrypted numbers of various bit sizes. Below is a list of supported types and their usage:

```solidity
// Generate random encrypted numbers
ebool rb = FHE.randEbool();       // Random encrypted boolean
euint8 r8 = FHE.randEuint8();     // Random 8-bit number
euint16 r16 = FHE.randEuint16();  // Random 16-bit number
euint32 r32 = FHE.randEuint32();  // Random 32-bit number
euint64 r64 = FHE.randEuint64();  // Random 64-bit number
euint128 r128 = FHE.randEuint128(); // Random 128-bit number
euint256 r256 = FHE.randEuint256(); // Random 256-bit number
```

### **Example: Random Boolean**

```solidity
function randomBoolean() public returns (ebool) {
  return FHE.randEbool();
}
```

## **Bounded random numbers**

To generate random numbers within a specific range, you can specify an **upper bound**. The specified upper bound must be a power of 2. The random number will be in the range `[0, upperBound - 1]`.

```solidity
// Generate random numbers with upper bounds
euint8 r8 = FHE.randEuint8(32);      // Random number between 0-31
euint16 r16 = FHE.randEuint16(512);  // Random number between 0-511
euint32 r32 = FHE.randEuint32(65536); // Random number between 0-65535
```

### **Example: Random number with upper bound**

```solidity
function randomBoundedNumber(uint16 upperBound) public returns (euint16) {
  return FHE.randEuint16(upperBound);
}
```

## **Security Considerations**

* **Cryptographic security**:\
  The random numbers are generated using a cryptographically secure pseudo-random number generator (CSPRNG) and remain encrypted until explicitly decrypted.
* **Gas consumption**:\
  Each call to a random number generation function consumes gas. Developers should optimize the use of these functions, especially in gas-sensitive contracts.
* **Privacy guarantee**:\
  Random values are fully encrypted, ensuring they cannot be accessed or predicted by unauthorized parties.






# Encrypted inputs

This document introduces the concept of encrypted inputs in the FHEVM, explaining their role, structure, validation process, and how developers can integrate them into smart contracts and applications.

Encrypted inputs are a core feature of FHEVM, enabling users to push encrypted data onto the blockchain while ensuring data confidentiality and integrity.

## What are encrypted inputs?

Encrypted inputs are data values submitted by users in ciphertext form. These inputs allow sensitive information to remain confidential while still being processed by smart contracts. They are accompanied by **Zero-Knowledge Proofs of Knowledge (ZKPoKs)** to ensure the validity of the encrypted data without revealing the plaintext.

### Key characteristics of encrypted inputs:

1. **Confidentiality**: Data is encrypted using the public FHE key, ensuring that only authorized parties can decrypt or process the values.
2. **Validation via ZKPoKs**: Each encrypted input is accompanied by a proof verifying that the user knows the plaintext value of the ciphertext, preventing replay attacks or misuse.
3. **Efficient packing**: All inputs for a transaction are packed into a single ciphertext in a user-defined order, optimizing the size and generation of the zero-knowledge proof.

## Parameters in encrypted functions

When a function in a smart contract is called, it may accept two types of parameters for encrypted inputs:

1. **`externalEbool`, `externalEaddress`,`externalEuintXX`**: Refers to the index of the encrypted parameter within the proof, representing a specific encrypted input handle.
2. **`bytes`**: Contains the ciphertext and the associated zero-knowledge proof used for validation.

Here’s an example of a Solidity function accepting multiple encrypted parameters:

```solidity
function exampleFunction(
  externalEbool param1,
  externalEuint64 param2,
  externalEuint8 param3,
  bytes calldata inputProof
) public {
  // Function logic here
}
```

In this example, `param1`, `param2`, and `param3` are encrypted inputs for `ebool`, `euint64`, and `euint8` while `inputProof` contains the corresponding ZKPoK to validate their authenticity.

### Input Generation using Hardhat

In the below example, we use Alice's address to create the encrypted inputs and submits the transaction.

```typescript
import { fhevm } from "hardhat";

const input = fhevm.createEncryptedInput(contract.address, signers.alice.address);
input.addBool(canTransfer); // at index 0
input.add64(transferAmount); // at index 1
input.add8(transferType); // at index 2
const encryptedInput = await input.encrypt();

const externalEboolParam1 = encryptedInput.handles[0];
const externalEuint64Param2 = encryptedInput.handles[1];
const externalEuint8Param3 = encryptedInput.handles[2];
const inputProof = encryptedInput.inputProof;

tx = await myContract
  .connect(signers.alice)
  [
    "exampleFunction(bytes32,bytes32,bytes32,bytes)"
  ](signers.bob.address, externalEboolParam1, externalEuint64Param2, externalEuint8Param3, inputProof);

await tx.wait();
```

### Input Order

Developers are free to design the function parameters in any order. There is no required correspondence between the order in which encrypted inputs are constructed in TypeScript and the order of arguments in the Solidity function.

## Validating encrypted inputs

Smart contracts process encrypted inputs by verifying them against the associated zero-knowledge proof. This is done using the `FHE.asEuintXX`, `FHE.asEbool`, or `FHE.asEaddress` functions, which validate the input and convert it into the appropriate encrypted type.

### Example validation

This example demonstrates a function that performs multiple encrypted operations, such as updating a user's encrypted balance and toggling an encrypted boolean flag:

```solidity
function myExample(externalEuint64 encryptedAmount, externalEbool encryptedToggle, bytes calldata inputProof) public {
  // Validate and convert the encrypted inputs
  euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
  ebool toggleFlag = FHE.fromExternal(encryptedToggle, inputProof);

  // Update the user's encrypted balance
  balances[msg.sender] = FHE.add(balances[msg.sender], amount);

  // Toggle the user's encrypted flag
  userFlags[msg.sender] = FHE.not(toggleFlag);

  // FHE permissions and function logic here
  ...
}

// Function to retrieve a user's encrypted balance
function getEncryptedBalance() public view returns (euint64) {
  return balances[msg.sender];
}

// Function to retrieve a user's encrypted flag
function getEncryptedFlag() public view returns (ebool) {
  return userFlags[msg.sender];
}
```

### Example validation in the `ConfidentialERC20.sol` smart contract

Here’s an example of a smart contract function that verifies an encrypted input before proceeding:

```solidity
function transfer(
  address to,
  externalEuint64 encryptedAmount,
  bytes calldata inputProof
) public {
  // Verify the provided encrypted amount and convert it into an encrypted uint64
  euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

  // Function logic here, such as transferring funds
  ...
}
```

### How validation works

1. **Input verification**:\
   The `FHE.fromExternal` function ensures that the input is a valid ciphertext with a corresponding ZKPoK.
2. **Type conversion**:\
   The function transforms `externalEbool`, `externalEaddress`, `externalEuintXX` into the appropriate encrypted type (`ebool`, `eaddress`, `euintXX`) for further operations within the contract.

## Best Practices

* **Input packing**: Minimize the size and complexity of zero-knowledge proofs by packing all encrypted inputs into a single ciphertext.
* **Frontend encryption**: Always encrypt inputs using the FHE public key on the client side to ensure data confidentiality.
* **Proof management**: Ensure that the correct zero-knowledge proof is associated with each encrypted input to avoid validation errors.

Encrypted inputs and their validation form the backbone of secure and private interactions in the FHEVM. By leveraging these tools, developers can create robust, privacy-preserving smart contracts without compromising functionality or scalability.








# Access Control List

This document describes the Access Control List (ACL) system in FHEVM, a core feature that governs access to encrypted data. The ACL ensures that only authorized accounts or contracts can interact with specific ciphertexts, preserving confidentiality while enabling composable smart contracts. This overview provides a high-level understanding of what the ACL is, why it's essential, and how it works.

## What is the ACL?

The ACL is a permission management system designed to control who can access, compute on, or decrypt encrypted values in fhevm. By defining and enforcing these permissions, the ACL ensures that encrypted data remains secure while still being usable within authorized contexts.

## Why is the ACL important?

Encrypted data in FHEVM is entirely confidential, meaning that without proper access control, even the contract holding the ciphertext cannot interact with it. The ACL enables:

* **Granular permissions**: Define specific access rules for individual accounts or contracts.
* **Secure computations**: Ensure that only authorized entities can manipulate or decrypt encrypted data.
* **Gas efficiency**: Optimize permissions using transient access for temporary needs, reducing storage and gas costs.

## How does the ACL work?

### Types of access

* **Permanent allowance**:
  * Configured using `FHE.allow(ciphertext, address)`.
  * Grants long-term access to the ciphertext for a specific address.
  * Stored in a dedicated contract for persistent storage.
* **Transient allowance**:
  * Configured using `FHE.allowTransient(ciphertext, address)`.
  * Grants access to the ciphertext only for the duration of the current transaction.
  * Stored in transient storage, reducing gas costs.
  * Ideal for temporary operations like passing ciphertexts to external functions.
* **Permanent public allowance**:
  * Configured using `FHE.makePubliclyDecryptable(ciphertext)`.
  * Grants long-term access to the ciphertext for any user.
  * Stored in a dedicated contract for persistent storage.

**Syntactic sugar**:

* `FHE.allowThis(ciphertext)` is shorthand for `FHE.allow(ciphertext, address(this))`. It authorizes the current contract to reuse a ciphertext handle in future transactions.

### Transient vs. permanent allowance

| Allowance type | Purpose                                        | Storage type                                                            | Use case                                                                                            |
| -------------- | ---------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Transient**  | Temporary access during a transaction.         | [Transient storage](https://eips.ethereum.org/EIPS/eip-1153) (EIP-1153) | Calling external functions or computations with ciphertexts. Use when wanting to save on gas costs. |
| **Permanent**  | Long-term access across multiple transactions. | Dedicated contract storage                                              | Persistent ciphertexts for contracts or users requiring ongoing access.                             |

## Granting and verifying access

### Granting access

Developers can use functions like `allow`, `allowThis`, and `allowTransient` to grant permissions:

* **`allow`**: Grants permanent access to an address.
* **`allowThis`**: Grants the current contract access to manipulate the ciphertext.
* **`allowTransient`**: Grants temporary access to an address for the current transaction.
* **`makePubliclyDecryptable`**: Grants permanent, global permission for any entity to decrypt the cleartext value associated with the given ciphertext (handle) off-chain.

### Verifying access

To check if an entity has permission to access a ciphertext, use functions like `isAllowed` or `isSenderAllowed`:

* **`isAllowed`**: Verifies if a specific address has permission.
* **`isSenderAllowed`**: Simplifies checks for the current transaction sender.
* **`isPubliclyDecryptable`**: Verifies whether any entity is permitted to retrieve the ciphertext's cleartext value off-chain.
* **`checkSignatures`**: Verifies the authenticity of a cleartext value by checking cryptographic signatures. This ensures that the value submitted back to the chain originated from a legitimate public decryption operation on the associated ciphertext handle.
* **`isAccountDenied`**: Checks whether an account is on the deny list. Denied accounts are blocked from `allow*` calls inside the ACL contract, so they cannot grant or receive new permissions on encrypted values.

### User decryption delegation

The ACL supports delegating user decryption rights from one account to another (for example, a backend service or relayer). The **delegator** is whichever account calls into the ACL — an EOA when calling `IACL.delegateForUserDecryption` directly, or `address(this)` when a contract uses the `FHE.delegateUserDecryption` helper. The two patterns are not interchangeable.

* **`delegateUserDecryption`**: Grants a delegate the right to user-decrypt on behalf of the caller contract for a specific `contractAddress`, with an expiration date.
* **`delegateUserDecryptionWithoutExpiration`**: Same as above, but without an expiration date.
* **`revokeUserDecryptionDelegation`**: Revokes a previously granted delegation.
* **`isUserDecryptable`**: Checks if a handle can be decrypted by a user in the context of a specific contract.

For the EOA-side flow, the full constraints, and worked examples, see [User decryption delegation](/protocol/solidity-guides/smart-contract/acl/delegation.md). For the API reference, see [FHEVM API reference](/protocol/solidity-guides/smart-contract/functions.md#user-decryption-delegation).

## Practical uses of the ACL

* **Confidential parameters**: Pass encrypted values securely between contracts, ensuring only authorized entities can access them.
* **Secure state management**: Store encrypted state variables while controlling who can modify or read them.
* **Privacy-preserving computations**: Enable computations on encrypted data with confidence that permissions are enforced.
* **Publicly Verifiable Result Reveal**: Enable the public reveal of a confidential operation's final result. For example, enabling the public to verify the final price in a sealed-bid confidential auction.

***

For a detailed explanation of the ACL's functionality, including code examples and advanced configurations, see [ACL examples](/protocol/solidity-guides/smart-contract/acl/acl_examples.md).











# ACL examples

This page provides detailed instructions and examples on how to use and implement the ACL (Access Control List) in FHEVM. For an overview of ACL concepts and their importance, refer to the [access control list (ACL) overview](/protocol/solidity-guides/smart-contract/acl.md).

## Controlling access: permanent and transient allowances

The ACL system allows you to define two types of permissions for accessing ciphertexts:

### Permanent allowance

* **Function**: `FHE.allow(ciphertext, address)`
* **Purpose**: Grants persistent access to a ciphertext for a specific address.
* **Storage**: Permissions are saved in a dedicated ACL contract, making them available across transactions.

#### Alternative Solidity syntax

You can also use method-chaining syntax for granting allowances since FHE is a Solidity library.

```solidity
using FHE for *;
ciphertext.allow(address1).allow(address2);
```

This is equivalent to calling `FHE.allow(ciphertext, address1)` followed by `FHE.allow(ciphertext, address2)`.

### Transient allowance

* **Function**: `FHE.allowTransient(ciphertext, address)`
* **Purpose**: Grants temporary access for the duration of a single transaction.
* **Storage**: Permissions are stored in transient storage to save gas costs.
* **Use Case**: Ideal for passing encrypted values between functions or contracts during a transaction.

#### Alternative Solidity syntax

Method chaining is also available for transient allowances since FHE is a Solidity library.

```solidity
using FHE for *;
ciphertext.allowTransient(address1).allowTransient(address2);
```

### Syntactic sugar

* **Function**: `FHE.allowThis(ciphertext)`
* **Equivalent To**: `FHE.allow(ciphertext, address(this))`
* **Purpose**: Simplifies granting permanent access to the current contract for managing ciphertexts.

#### Alternative Solidity syntax

You can also use method-chaining syntax for allowThis since FHE is a Solidity library.

```solidity
using FHE for *;
ciphertext.allowThis();
```

#### Make publicly decryptable

To make a ciphertext publicly decryptable, you can use the `FHE.makePubliclyDecryptable(ciphertext)` function. This grants decryption rights to anyone, which is useful for scenarios where the encrypted value should be accessible by all.

```solidity
// Grant public decryption right to a ciphertext
FHE.makePubliclyDecryptable(ciphertext);

// Or using method syntax:
ciphertext.makePubliclyDecryptable();
```

* **Function**: `FHE.makePubliclyDecryptable(ciphertext)`
* **Purpose**: Makes the ciphertext decryptable by anyone.
* **Use Case**: When you want to publish encrypted results or data.

> You can combine multiple allowance methods (such as `.allow()`, `.allowThis()`, `.allowTransient()`) directly on ciphertext objects to grant access to several addresses or contracts in a single, fluent statement.
>
> **Example**
>
> ```solidity
> // Grant transient access to one address and permanent access to another address
> ciphertext.allowTransient(address1).allow(address2);
>
> // Grant permanent access to the current contract and another address
> ciphertext.allowThis().allow(address1);
> ```

## Best practices

### Verifying sender access

When processing ciphertexts as input, it’s essential to validate that the sender is authorized to interact with the provided encrypted data. Failing to perform this verification can expose the system to inference attacks where malicious actors attempt to deduce private information.

#### Example scenario: Confidential ERC20 attack

Suppose a confidential ERC20 token has a `transfer(address to, euint64 encryptedAmount)` function that does **not** call `FHE.isSenderAllowed(encryptedAmount)`. The contract trusts whatever encrypted amount the caller passes in.

An attacker controls two accounts they own — **Account A** (funded with 100 tokens) and **Account B** — and wants to learn the balance of a victim **Account V** without ever decrypting it.

The attack:

1. The victim's encrypted balance handle is publicly readable on-chain (it lives in the contract's `balances[V]` storage). The attacker reads that handle.
2. The attacker calls `transfer(B, balances[V])` from Account A — passing the **victim's** balance handle as the `encryptedAmount`. Without `isSenderAllowed`, the contract has no way to know the attacker did not produce that handle.
3. Inside `transfer`, the contract executes `canTransfer = FHE.le(encryptedAmount, balances[A])` and conditionally moves the amount via `FHE.select`. Whether the transfer ends up actually moving tokens depends on whether `balance[V] <= 100`.
4. The attacker reads `balances[B]` after the transaction. The new handle either reflects an increase (transfer happened ⇒ `balance[V] <= 100`) or stays the same (transfer skipped ⇒ `balance[V] > 100`).

Each successful or failed transfer leaks one bit about the victim's balance. By repeating the attack with progressively different sender balances, the attacker can binary-search the victim's exact balance — all without ever obtaining a decryption.

The fix is one line: require `FHE.isSenderAllowed(encryptedAmount)` so the contract only accepts handles the sender is genuinely authorized to use.

***

#### Example: secure verification

```solidity
function transfer(address to, euint64 encryptedAmount) public {
  // Ensure the sender is authorized to access the encrypted amount
  require(FHE.isSenderAllowed(encryptedAmount), "Unauthorized access to encrypted amount.");

  // Proceed with further logic
  ...
}
```

By enforcing this check, you can safeguard against inference attacks and ensure that encrypted values are only manipulated by authorized entities.

## ACL for user decryption

If a ciphertext can be decrypted by a user, explicit access must be granted to them. Additionally, the user decryption mechanism requires the signature of a public key associated with the contract address. Therefore, a value that needs to be decrypted must be explicitly authorized for both the user and the contract.

Due to the user decryption mechanism, a user signs a public key associated with a specific contract; therefore, the ciphertext also needs to be allowed for the contract.

### Example: Secure Transfer in ConfidentialERC20

```solidity
function transfer(address to, euint64 encryptedAmount) public {
  require(FHE.isSenderAllowed(encryptedAmount), "The caller is not authorized to access this encrypted amount.");
  euint64 amount = FHE.asEuint64(encryptedAmount);
  ebool canTransfer = FHE.le(amount, balances[msg.sender]);

  euint64 newBalanceTo = FHE.add(balances[to], FHE.select(canTransfer, amount, FHE.asEuint64(0)));
  balances[to] = newBalanceTo;
  // Allow this new balance for both the contract and the owner.
  FHE.allowThis(newBalanceTo);
  FHE.allow(newBalanceTo, to);

  euint64 newBalanceFrom = FHE.sub(balances[from], FHE.select(canTransfer, amount, FHE.asEuint64(0)));
  balances[from] = newBalanceFrom;
  // Allow this new balance for both the contract and the owner.
  FHE.allowThis(newBalanceFrom);
  FHE.allow(newBalanceFrom, from);
}
```

By understanding how to grant and verify permissions, you can effectively manage access to encrypted data in your FHEVM smart contracts. For additional context, see the [ACL overview](/protocol/solidity-guides/smart-contract/acl.md).








# User decryption delegation

Delegation lets one account (the **delegator**) authorize another account (the **delegate**) to perform user decryption on its behalf, in the context of a specific contract. The ACL stores user decryption permissions as `(user, contractAddress)` pairs; delegation transfers the rights of `(delegator, contractAddress)` to `(delegate, contractAddress)`.

## Who is the delegator?

It depends on which API you call:

| Caller                             | API                                                           | Delegator (`msg.sender` to ACL) |
| ---------------------------------- | ------------------------------------------------------------- | ------------------------------- |
| **EOA** (Externally Owned Account) | `IACL.delegateForUserDecryption` directly on the ACL contract | the EOA itself                  |
| **Smart contract**                 | `FHE.delegateUserDecryption` from inside a contract function  | `address(this)`                 |

`FHE.delegateUserDecryption` cannot be used by an EOA to delegate its own rights — the EOA must call the ACL directly.

## Constraints

The ACL enforces three invariants when registering a delegation:

* `msg.sender != contractAddress`
* `msg.sender != delegate`
* `delegate != contractAddress`

Plus a one-delegate-or-revoke-per-block rule per `(delegator, delegate, contractAddress)` tuple.

## Pattern 1 — EOA delegates to a backend service

The user calls the ACL contract directly to delegate their own rights:

```solidity
import { IACL } from "@fhevm/solidity/lib/Impl.sol";

IACL(aclAddress).delegateForUserDecryption(relayer, vault, expirationDate);
```

After this, the relayer can user-decrypt any handle that has the `(EOA, vault)` ACL pair.

## Pattern 2 — Contract delegates its own rights

A contract delegates user-decryption rights it has been granted. `contractAddress` must be a **different** contract whose handles this contract has been allowed to access.

```solidity
import { FHE } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract Aggregator is ZamaEthereumConfig {
    address public immutable vault;

    constructor(address vault_) { vault = vault_; }

    function authorizeRelayer(address relayer, uint64 expirationDate) external {
        FHE.delegateUserDecryption(relayer, vault, expirationDate);
    }

    function revokeRelayer(address relayer) external {
        FHE.revokeUserDecryptionDelegation(relayer, vault);
    }
}
```

{% hint style="warning" %}
**Common mistake:** calling `FHE.delegateUserDecryption(relayer, address(this), expiration)` from inside a contract, hoping to delegate the caller user's rights. This always reverts because `msg.sender == contractAddress` violates one of the constraints listed above. Use Pattern 1 instead — the user must call the ACL directly.
{% endhint %}

## API summary

```solidity
// Granting (caller-contract side)
FHE.delegateUserDecryption(delegate, contractAddress, expirationDate);
FHE.delegateUserDecryptionWithoutExpiration(delegate, contractAddress);
FHE.delegateUserDecryptions(delegate, contractAddresses, expirationDate);            // batch
FHE.delegateUserDecryptionsWithoutExpiration(delegate, contractAddresses);           // batch

// Revoking
FHE.revokeUserDecryptionDelegation(delegate, contractAddress);
FHE.revokeUserDecryptionDelegations(delegate, contractAddresses);                    // batch

// Querying
FHE.isDelegatedForUserDecryption(delegator, delegate, contractAddress, handle);      // active for handle?
FHE.getDelegatedUserDecryptionExpirationDate(delegator, delegate, contractAddress);  // 0 = none, max = permanent
FHE.isUserDecryptable(handle, user, contractAddress);                                // raw ACL check, ignores delegation
```





# Reorgs handling

This page provides detailed instructions on how to handle reorg risks on Ethereum when using FHEVM.

Since ACL events are propagated from the FHEVM host chain to the [Gateway](https://docs.zama.ai/protocol/protocol/overview/gateway) immediately after being included in a block, dApp developers must take special care when encrypted information is critically important. For example, if an encrypted handle conceals the private key of a Bitcoin wallet holding significant funds, we need to ensure that this information cannot inadvertently leak to the wrong person due to a reorg on the FHEVM host chain. Therefore, it's the responsibility of dApp developers to prevent such scenarios by implementing a two-step ACL authorization process with a timelock between the request and the ACL call.

## Simple example: Handling reorg risk on Ethereum

On Ethereum, a reorg can be up to 95 slots deep in the worst case, so waiting for more than 95 blocks should ensure that a previously sent transaction has been finalized—unless more than 1/3 of the nodes are malicious and willing to lose their stake, which is highly improbable.

❌ **Instead of writing this contract:**

```solidity
contract PrivateKeySale {
  euint256 privateKey;
  bool isBought = false;

  constructor(externalEuint256 _privateKey, bytes inputProof) {
    privateKey = FHE.fromExternal(_privateKey, inputProof);
    FHE.allowThis(privateKey);
  }

  function buyPrivateKey() external payable {
    require(msg.value == 1 ether, "Must pay 1 ETH");
    require(!isBought, "Private key already bought");
    isBought = true;
    FHE.allow(privateKey, msg.sender);
  }
}
```

Since the \`privateKey\`\` encrypted variable contains critical information, we don't want to mistakenly leak it for free if a reorg occurs. This could happen in the previous example because we immediately grant authorization to the buyer in the same transaction that processes the sale.

✅ **We recommend writing something like this instead:**

```solidity
contract PrivateKeySale {
  euint256 privateKey;
  bool isBought = false;
  uint256 blockWhenBought = 0;
  address buyer;

  constructor(externalEuint256 _privateKey, bytes inputProof) {
    privateKey = FHE.fromExternal(_privateKey, inputProof);
    FHE.allowThis(privateKey);
  }

  function buyPrivateKey() external payable {
    require(msg.value == 1 ether, "Must pay 1 ETH");
    require(!isBought, "Private key already bought");
    isBought = true;
    blockWhenBought = block.number;
    buyer = msg.sender;
  }

  function requestACL() external {
    require(isBought, "Private key has not been bought yet");
    require(block.number > blockWhenBought + 95, "Too early to request ACL, risk of reorg");
    FHE.allow(privateKey, buyer);
  }
}
```

This approach ensures that at least 96 blocks have elapsed between the transaction that purchases the private key and the transaction that authorizes the buyer to decrypt it.

{% hint style="info" %}
This type of contract worsens the user experience by adding a timelock before users can decrypt data, so it should be used sparingly: only when leaked information could be critically important and high-value.
{% endhint %}







# Logics

This section covers how to implement conditional logic and control flow when working with encrypted values in FHEVM.

Since encrypted values cannot be directly evaluated at runtime, standard Solidity control flow (`if`, `else`, `for` with encrypted conditions) does not work with FHE ciphertexts. Instead, FHEVM provides specialized functions and patterns to handle these cases securely.

## Topics

* [**Branching**](/protocol/solidity-guides/smart-contract/logics/conditions.md) — How to use `FHE.select` for conditional logic on encrypted values, and how to transition from encrypted conditions to non-encrypted business logic via public decryption.
* [**Dealing with branches and conditions**](/protocol/solidity-guides/smart-contract/logics/loop.md) — Patterns for handling loops and indexed access when the condition or index is encrypted.
* [**Error handling**](/protocol/solidity-guides/smart-contract/logics/error_handling.md) — How to handle errors in FHE computations, where standard `require` and `revert` cannot operate on encrypted values.







# Branching

This document explains how to implement conditional logic (if/else branching) when working with encrypted values in FHEVM. Unlike typical Solidity programming, working with Fully Homomorphic Encryption (FHE) requires specialized methods to handle conditions on encrypted data.

This document covers encrypted branching and how to move from an encrypted condition to a non-encrypted business logic in your smart contract.

## What is confidential branching?

In FHEVM, when you perform [comparison operations](/protocol/solidity-guides/smart-contract/operations.md#comparison-operations), the result is an encrypted boolean (`ebool`). Since encrypted booleans do not support standard boolean operations like `if` statements or logical operators, conditional logic must be implemented using specialized methods.

To facilitate conditional assignments, FHEVM provides the `FHE.select` function, which acts as a ternary operator for encrypted values.

## **Using `FHE.select` for conditional logic**

The `FHE.select` function enables branching logic by selecting one of two encrypted values based on an encrypted condition (`ebool`). It works as follows:

```solidity
FHE.select(condition, valueIfTrue, valueIfFalse);
```

* **`condition`**: An encrypted boolean (`ebool`) resulting from a comparison.
* **`valueIfTrue`**: The encrypted value to return if the condition is true.
* **`valueIfFalse`**: The encrypted value to return if the condition is false.

## **Example: Auction Bidding Logic**

Here's an example of using conditional logic to update the highest winning number in a guessing game:

```solidity
function bid(externalEuint64 encryptedValue, bytes calldata inputProof) external onlyBeforeEnd {
  // Convert the encrypted input to an encrypted 64-bit integer
  euint64 bid = FHE.fromExternal(encryptedValue, inputProof);

  // Compare the current highest bid with the new bid
  ebool isAbove = FHE.lt(highestBid, bid);

  // Update the highest bid if the new bid is greater
  highestBid = FHE.select(isAbove, bid, highestBid);

  // Allow the contract to use the updated highest bid ciphertext
  FHE.allowThis(highestBid);
}
```

{% hint style="info" %}
This is a simplified example to demonstrate the functionality.
{% endhint %}

### How Does It Work?

* **Comparison**:
  * The `FHE.lt` function compares `highestBid` and `bid`, returning an `ebool` (`isAbove`) that indicates whether the new bid is higher.
* **Selection**:
  * The `FHE.select` function updates `highestBid` to either the new bid or the previous highest bid, based on the encrypted condition `isAbove`.
* **Permission Handling**:
  * After updating `highestBid`, the contract reauthorizes itself to manipulate the updated ciphertext using `FHE.allowThis`.

## Key Considerations

* **Value change behavior:** Each time `FHE.select` assigns a value, a new ciphertext is created, even if the underlying plaintext value remains unchanged. This behavior is inherent to FHE and ensures data confidentiality, but developers should account for it when designing their smart contracts.
* **Gas consumption:** Using `FHE.select` and other encrypted operations incurs additional gas costs compared to traditional Solidity logic. Optimize your code to minimize unnecessary operations.
* **Access control:** Always use appropriate ACL functions (e.g., `FHE.allowThis`, `FHE.allow`) to ensure the updated ciphertexts are authorized for use in future computations or transactions.

***

## How to branch to a non-confidential path?

So far, this section only covered how to do branching using encrypted variables. However, there may be many cases where the "public" contract logic will depend on the outcome from a encrypted path.

To do so, there are only one way to branch from an encrypted path to a non-encrypted path: it requires an off-chain public decryption. Hence, any contract logic that requires moving from an encrypted input to a non-encrypted path always requires an async contract logic.

## **Example: Auction Bidding Logic: Item Release**

Going back to our previous example with the auction bidding logic. Let's assume that the winner of the auction can receive some prize, which is not confidential.

```solidity
bool public isPrizeDistributed;
eaddress internal highestBidder;
euint64 internal highestBid;

function bid(externalEuint64 encryptedValue, bytes calldata inputProof) external onlyBeforeEnd {
  // Convert the encrypted input to an encrypted 64-bit integer
  euint64 bid = FHE.fromExternal(encryptedValue, inputProof);

  // Compare the current highest bid with the new bid
  ebool isAbove = FHE.lt(highestBid, bid);

  // Update the highest bid if the new bid is greater
  highestBid = FHE.select(isAbove, bid, highestBid);

  // Update the highest bidder address if the new bid is greater
  highestBidder = FHE.select(isAbove, FHE.asEaddress(msg.sender), currentBidder));

  // Allow the contract to use the highest bidder address
  FHE.allowThis(highestBidder);

  // Allow the contract to use the updated highest bid ciphertext
  FHE.allowThis(highestBid);
}

function revealWinner() external onlyAfterEnd {
  FHE.makePubliclyDecryptable(highestBidder);
}

function transferPrize(address auctionWinner, bytes calldata decryptionProof) external {
  require(!isPrizeDistributed, "Prize has already been distributed");

  bytes32[] memory cts = new bytes32[](1);
  cts[0] = FHE.toBytes32(highestBidder);

  bytes memory cleartexts = abi.encode(auctionWinner);

  // This FHE call reverts the transaction if:
  // - the decryption proof is invalid.
  // - the provided cleartext (auctionWinner) does not match the cleartext value
  //   that results from the off-chain decryption of the ciphertext (highestBidder).
  // - the decryption proof does not correspond to the specific pairing of
  //   the ciphertext (highestBidder) and the cleartext (auctionWinner).
  FHE.checkSignatures(cts, cleartexts, decryptionProof);

  isPrizeDistributed = true;
  // Business logic to transfer the prize to the auction winner
}
```

{% hint style="info" %}
This is a simplified example to demonstrate the functionality.
{% endhint %}

As you can see the in the above example, the path to move from an encrypted condition to a decrypted business logic must be async and requires an off-chain public decryption to reveal the result of the logic using encrypted variables.

## Summary

* **`FHE.select`** is a powerful tool for conditional logic on encrypted values.
* Encrypted booleans (`ebool`) and values maintain confidentiality, enabling privacy-preserving logic.
* Developers should account for gas costs and ciphertext behavior when designing conditional operations.







# Dealing with branches and conditions

This document explains how to handle branches, loops or conditions when working with Fully Homomorphic Encryption (FHE), specifically when the condition / index is encrypted.

## Breaking a loop

❌ In FHE, it is not possible to break a loop based on an encrypted condition. For example, this would not work:

```solidity
euint8 maxValue = FHE.asEuint8(6); // Could be a value between 0 and 10
euint8 x = FHE.asEuint8(0);
// some code
while(FHE.lt(x, maxValue)){
    x = FHE.add(x, 2);
}
```

If your code logic requires looping on an encrypted boolean condition, we highly suggest to try to replace it by a finite loop with an appropriate constant maximum number of steps and use `FHE.select` inside the loop.

## Suggested approach

✅ For example, the previous code could maybe be replaced by the following snippet:

```solidity
euint8 maxValue = FHE.asEuint8(6); // Could be a value between 0 and 10
euint8 x = FHE.asEuint8(0);
// some code
for (uint32 i = 0; i < 10; i++) {
    euint8 toAdd = FHE.select(FHE.lt(x, maxValue), FHE.asEuint8(2), FHE.asEuint8(0));
    x = FHE.add(x, toAdd);
}
```

In this snippet, we perform 10 iterations, adding 2 to `x` in each iteration as long as `x` is still less than `maxValue`. Once `x` reaches `maxValue`, we add 0 instead for the remaining iterations because we can't break the loop.

## Best practices

### Obfuscate branching

The previous paragraph emphasized that branch logic should rely as much as possible on `FHE.select` instead of decryptions. It hides effectively which branch has been executed.

However, this is sometimes not enough. Enhancing the privacy of smart contracts often requires revisiting your application's logic.

For example, if implementing a simple AMM for two encrypted ERC20 tokens based on a linear constant function, it is recommended to not only hide the amounts being swapped, but also the token which is swapped in a pair.

✅ Here is a very simplified example implementation, we suppose here that the rate between tokenA and tokenB is constant and equals to 1:

```solidity
// typically either encryptedAmountAIn or encryptedAmountBIn is an encrypted null value
// ideally, the user already owns some amounts of both tokens and has pre-approved the AMM on both tokens
function swapTokensForTokens(
  externalEuint32 encryptedAmountAIn,
  externalEuint32 encryptedAmountBIn,
  bytes calldata inputProof
) external {
  euint32 encryptedAmountA = FHE.fromExternal(encryptedAmountAIn, inputProof); // even if amount is null, do a transfer to obfuscate trade direction
  euint32 encryptedAmountB = FHE.fromExternal(encryptedAmountBIn, inputProof); // even if amount is null, do a transfer to obfuscate trade direction

  // send tokens from user to AMM contract
  FHE.allowTransient(encryptedAmountA, tokenA);
  IConfidentialERC20(tokenA).transferFrom(msg.sender, address(this), encryptedAmountA);

  FHE.allowTransient(encryptedAmountB, tokenB);
  IConfidentialERC20(tokenB).transferFrom(msg.sender, address(this), encryptedAmountB);

  // send tokens from AMM contract to user
  // Price of tokenA in tokenB is constant and equal to 1, so we just swap the encrypted amounts here
  FHE.allowTransient(encryptedAmountB, tokenA);
  IConfidentialERC20(tokenA).transfer(msg.sender, encryptedAmountB);

  FHE.allowTransient(encryptedAmountA, tokenB);
  IConfidentialERC20(tokenB).transferFrom(msg.sender, address(this), encryptedAmountA);
}
```

Notice that to preserve confidentiality, we had to make two inputs transfers on both tokens from the user to the AMM contract, and similarly two output transfers from the AMM to the user, even if technically most of the times it will make sense that one of the user inputs `encryptedAmountAIn` or `encryptedAmountBIn` is actually an encrypted zero.

This is different from a classical non-confidential AMM with regular ERC20 tokens: in this case, the user would need to just do one input transfer to the AMM on the token being sold, and receive only one output transfer from the AMM on the token being bought.

### Avoid using encrypted indexes

Using encrypted indexes to pick an element from an array without revealing it is not very efficient, because you would still need to loop on all the indexes to preserve confidentiality.

However, there are plans to make this kind of operation much more efficient in the future, by adding specialized operators for arrays.

For instance, imagine you have an encrypted array called `encArray` and you want to update an encrypted value `x` to match an item from this list, `encArray[i]`, *without* disclosing which item you're choosing.

❌ You must loop over all the indexes and check equality homomorphically, however this pattern is very expensive in gas and should be avoided whenever possible.

```solidity
euint32 x;
euint32[] encArray;

function setXwithEncryptedIndex(externalEuint32 encryptedIndex, bytes calldata inputProof) public {
    euint32 index = FHE.fromExternal(encryptedIndex, inputProof);
    for (uint32 i = 0; i < encArray.length; i++) {
        ebool isEqual = FHE.eq(index, i);
        x = FHE.select(isEqual, encArray[i], x);
    }
    FHE.allowThis(x);
}
```







# Error handling

This document explains how to handle errors effectively in FHEVM smart contracts. Since transactions involving encrypted data do not automatically revert when conditions are not met, developers need alternative mechanisms to communicate errors to users.

## **Challenges in error handling**

In the context of encrypted data:

1. **No automatic reversion**: Transactions do not revert if a condition fails, making it challenging to notify users of issues like insufficient funds or invalid inputs.
2. **Limited feedback**: Encrypted computations lack direct mechanisms for exposing failure reasons while maintaining confidentiality.

## **Recommended approach: Error logging with a handler**

To address these challenges, implement an **error handler** that records the most recent error for each user. This allows dApps or frontends to query error states and provide appropriate feedback to users.

### **Example implementation**

The following contract snippet demonstrates how to implement and use an error handler:

```solidity
struct LastError {
  euint8 error;      // Encrypted error code
  uint timestamp;    // Timestamp of the error
}

// Define error codes
euint8 internal NO_ERROR;
euint8 internal NOT_ENOUGH_FUNDS;

constructor() {
  NO_ERROR = FHE.asEuint8(0);           // Code 0: No error
  NOT_ENOUGH_FUNDS = FHE.asEuint8(1);   // Code 1: Insufficient funds

  // Persist ACL permission so the contract can reuse these encrypted constants
  // in later transactions (e.g. inside FHE.select calls).
  FHE.allowThis(NO_ERROR);
  FHE.allowThis(NOT_ENOUGH_FUNDS);
}

// Store the last error for each address
mapping(address => LastError) private _lastErrors;

// Event to notify about an error state change
event ErrorChanged(address indexed user);

/**
 * @dev Set the last error for a specific address.
 * @param error Encrypted error code.
 * @param addr Address of the user.
 */
function setLastError(euint8 error, address addr) private {
  _lastErrors[addr] = LastError(error, block.timestamp);

  // Grant ACL permissions so the contract can read this handle later
  // and so the user can decrypt their own error off-chain.
  FHE.allowThis(error);
  FHE.allow(error, addr);

  emit ErrorChanged(addr);
}

/**
 * @dev Internal transfer function with error handling.
 * @param from Sender's address.
 * @param to Recipient's address.
 * @param amount Encrypted transfer amount.
 */
function _transfer(address from, address to, euint32 amount) internal {
  // Check if the sender has enough balance to transfer
  ebool canTransfer = FHE.le(amount, balances[from]);

  // Log the error state: NO_ERROR or NOT_ENOUGH_FUNDS
  setLastError(FHE.select(canTransfer, NO_ERROR, NOT_ENOUGH_FUNDS), msg.sender);

  // Perform the transfer operation conditionally
  balances[to] = FHE.add(balances[to], FHE.select(canTransfer, amount, FHE.asEuint32(0)));
  FHE.allowThis(balances[to]);
  FHE.allow(balances[to], to);

  balances[from] = FHE.sub(balances[from], FHE.select(canTransfer, amount, FHE.asEuint32(0)));
  FHE.allowThis(balances[from]);
  FHE.allow(balances[from], from);
}
```

## **How It Works**

1. **Define error codes**:
   * `NO_ERROR`: Indicates a successful operation.
   * `NOT_ENOUGH_FUNDS`: Indicates insufficient balance for a transfer.
2. **Record errors**:
   * Use the `setLastError` function to log the latest error for a specific address along with the current timestamp.
   * Emit the `ErrorChanged` event to notify external systems (e.g., dApps) about the error state change.
3. **Conditional updates**:
   * Use the `FHE.select` function to update balances and log errors based on the transfer condition (`canTransfer`).
4. **Frontend integration**:
   * The dApp can query `_lastErrors` for a user’s most recent error and display appropriate feedback, such as "Insufficient funds" or "Transaction successful."

## **Example error query**

The frontend or another contract can query the `_lastErrors` mapping to retrieve error details:

```solidity
/**
 * @dev Get the last error for a specific address.
 * @param user Address of the user.
 * @return error Encrypted error code.
 * @return timestamp Timestamp of the error.
 */
function getLastError(address user) public view returns (euint8 error, uint timestamp) {
  LastError memory lastError = _lastErrors[user];
  return (lastError.error, lastError.timestamp);
}
```

## **Benefits of this approach**

1. **User feedback**:
   * Provides actionable error messages without compromising the confidentiality of encrypted computations.
2. **Scalable error tracking**:
   * Logs errors per user, making it easy to identify and debug specific issues.
3. **Event-driven notifications**:
   * Enables frontends to react to errors in real time via the `ErrorChanged` event.

By implementing error handlers as demonstrated, developers can ensure a seamless user experience while maintaining the privacy and integrity of encrypted data operations.








# Public Decryption

## Public Decryption

This section explains how to handle public decryption in FHEVM. Public decryption allows plaintext data to be accessed when required for contract logic or user presentation, ensuring confidentiality is maintained throughout the process.

Public decryption is essential in two primary cases:

1. **Smart contract logic**: A contract requires plaintext values for computations or decision-making.
2. **User interaction**: Plaintext data needs to be revealed to all users, such as revealing the decision of the vote.

### Overview

Public decryption of a confidential on-chain result is designed as an asynchronous three-steps process that splits the work between the blockchain (on-chain) and off-chain execution environments.

**Step 1: On-Chain Setup - Enabling Permanent Public Access**

This step is executed by the smart contract using the FHE Solidity library to signal that a specific confidential result is ready to be revealed.

* **FHE Solidity Library Function:** `FHE.makePubliclyDecryptable`
* **Action:** The contract sets the ciphertext handle's status as publicly decryptable, **globally and permanently** authorizing any entity to request its off-chain cleartext value.
* **Result:** The ciphertext is now accessible to any entity, which can request its decryption from the Zama off-chain Relayer.

**Step 2: Off-chain Decryption - Decryption and Proof Generation**

This step can be executed by any off-chain client using the Zama SDK.

* **Off-chain SDK Function:** `publicDecrypt` (see Zama SDK for exact naming)
* **Action:** The off-chain client submits the ciphertext handle to the Zama Relayer's Key Management System (KMS).
* **Result:** The Zama Relayer returns three items:
  1. The cleartext (the decrypted value).
  2. The ABI-encoding of that cleartext.
  3. A Decryption Proof (a byte array of signatures and metadata) that serves as a cryptographic guarantee that the cleartext is the authentic, unmodified result of the decryption performed by the KMS.

**Step 3: On-Chain Verification - Submit and Guarantee Authenticity**

This final step is executed on-chain by the contrat using the FHE Solidity library with the proof generated off-chain to ensure the cleartext submitted to the contract is trustworthy.

* **FHE Solidity Library Function:** `FHE.checkSignatures`
* **Action:** The caller submits the cleartext and decryption proof back to a contract function. The contract calls `FHE.checkSignatures`, which reverts the transaction if the proof is invalid or does not match the cleartext/ciphertext pair.
* **Result:** The receiving contract gains a cryptographic guarantee that the submitted cleartext is the authentic decrypted value of the original ciphertext. The contract can then securely execute its business logic (e.g., reveal a vote, transfer funds, update state).

### Tutorial

This tutorial provides a deep dive into the three-step asynchronous public decryption process required to finalize a confidential on-chain computation by publicly revealing its result.

The Solidity contract provided below, `FooBarContract`, is used to model this entire workflow. The contract's main function `runFooBarConfidentialLogic` simulates the execution of a complex confidential computation (e.g., calculating a winner or a final price) that results in 2 encrypted final values (ciphertexts) `_encryptedFoo` and `_encryptedBar`.

Then, in order to finalize the workflow, the `FooBarContract` needs the decrypted clear values of both `_encryptedFoo` and `_encryptedBar` to decide whether to trigger some finalization logic (e.g. reveal a vote, transfer funds). The `FooBarContract`'s function `_runFooBarClearBusinessLogicFinalization` simulates this step. Since the FHEVM prevents direct on-chain decryption, the process must shift to an off-chain decryption phase, which presents a challenge: ***How can the\*\*\*\* ****`FooBarContract`**** ****trust that the cleartext submitted back to the chain is the authentic, unmodified result of the decryption of both**** ****`_encryptedFoo`**** ****and**** ****`_encryptedBar`****?***

This is where the off-chain `publicDecrypt` function and the on-chain `checkSignatures` function come into play.

#### The Solidity Contract

```solidity
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FooBarContract is ZamaEthereumConfig {
  ebool _encryptedFoo;
  euint8 _encryptedBar;
  bool _clearFoo;
  uint8 _clearBar;
  bool _isFinalized;

  event ClearFooBarRequested(ebool encryptedFoo, euint8 encryptedBar);

  constructor() {}

  function _isFooBarConfidentialLogicExecuted() private returns (bool) {
    return FHE.isInitialized(_encryptedFoo) && FHE.isInitialized(_encryptedBar);
  }

  modifier whenConfidentialLogicExecuted() {
    require(_isFooBarConfidentialLogicExecuted(), "foo confidential logic not yet executed!")
    _;
  }

  function runFooBarConfidentialLogic() external {
    require(!_isFooBarConfidentialLogicExecuted(), "foobar confidential logic already executed!")
    _encryptedFoo = FHE.randEbool();
    _encryptedBar = FHE.randEuint8();
  }

  function getEncryptedFoo() public whenConfidentialLogicExecuted returns (ebool) {
    return _encryptedFoo;
  }

  function getEncryptedBar() public whenConfidentialLogicExecuted returns (euint8) {
    return _encryptedBar;
  }

  function requestClearFooBar() external whenConfidentialLogicExecuted {
    FHE.makePubliclyDecryptable(_encryptedFoo);
    FHE.makePubliclyDecryptable(_encryptedBar);

    emit ClearFooBarRequested(_encryptedFoo, _encryptedBar);
  }

  function finalizeClearFooBar(bool clearFoo, uint8 clearBar, bytes memory publicDecryptionProof) external whenConfidentialLogicExecuted {
    require(!_isFinalized, "foo is already revealed");

    // ⚠️ Crucial Ordering Constraint
    // ==============================
    // The decryption proof is cryptographically bound to the specific ORDER of handles.
    // A proof computed for `[efoo, ebar]` will be different
    // from a proof computed for `[ebar, efoo]`.
    //
    // Here we expect a proof computed for `[efoo, ebar]`
    //
    bytes32[] memory ciphertextEfooEbar = new bytes32[](2);
    ciphertextEfooEbar[0] = FHE.toBytes32(_encryptedFoo);
    ciphertextEfooEbar[1] = FHE.toBytes32(_encryptedBar);

    // ⚠️ Once again, the order is critical to compute the ABI encoded array of clear values
    // The order must match the order in ciphertextEfooEbar: (efoo, ebar)
    bytes memory abiClearFooClearBar = abi.encode(clearFoo, clearBar);
    FHE.checkSignatures(ciphertextEfooEbar, abiClearFooClearBar, publicDecryptionProof);

    _isFinalized = true;

    _runFooBarClearBusinessLogicFinalization();
  }

  function _runFooBarClearBusinessLogicFinalization() private {
    // Business logic starts here.
    // Transfer ERC20, reveal price or winner etc.
  }
}
```

{% stepper %}
{% step %}

### Run On-Chain Confidential Logic

We first execute the on-chain confidential logic using a TypeScript client. This simulates the initial phase of the confidential computation.

```typescript
const tx = await contract.runFooBarConfidentialLogic();
await tx.wait();
```

{% endstep %}

{% step %}

### Run On-Chain Request Clear Values

With the confidential logic complete, the next step is to execute the on-chain function that requests and enables public decryption of the computed encrypted values `_encryptedFoo` and `_encryptedBar`. In a production scenario, we might use a Solidity event to notify the off-chain client that the necessary encrypted values are ready for off-chain public decryption.

```typescript
const tx = await contract.requestClearFooBar();
const txReceipt = await tx.wait();
const { efoo, ebar } = parseClearFooBarRequestedEvent(contract, txReceipt);
```

{% endstep %}

{% step %}

### Run Off-Chain Public Decryption

Now that the ciphertexts are marked as publicly decryptable, we call the off-chain function `publicDecrypt` via the Zama SDK. This fetches the clear values along with the Zama KMS decryption proof required for the final on-chain verification.

{% hint style="warning" %}
**Crucial Ordering Constraint:** The decryption proof is cryptographically bound to the specific order of handles passed in the input array. The proof computed for `[efoo, ebar]` is different from the proof computed for `[ebar, efoo]`.
{% endhint %}

```typescript
const instance: FhevmInstance = await createInstance();
const results: PublicDecryptResults = await instance.publicDecrypt([efoo, ebar]);
const clearFoo = results.values[efoo];
const clearBar = results.values[ebar];
// Warning! The decryption proof is computed for [efoo, ebar], NOT [ebar, efoo]!
const decryptionProof: `0x${string}` = results.decryptionProof;
```

{% endstep %}

{% step %}

### Run On-Chain

On the client side, we have computed all the clear values and, crucially, obtained the associated decryption proof. We can now securely move on to the final step: sending this data on-chain to trigger verification and final business logic simulated in the `_runFooBarClearBusinessLogicFinalization` contract function. If verification succeeds, the contract securely executes the `_runFooBarClearBusinessLogicFinalization` (e.g., transfers funds, publishes the vote result, etc.), completing the full confidential workflow.

```typescript
const tx = await contract.finalizeClearFooBar(clearFoo, clearBar, results.decryptionProof);
const txReceipt = await tx.wait();
```

{% endstep %}
{% endstepper %}

## Public Decryption On-Chain & Off-Chain API

#### On-chain `FHE.makePubliclyDecryptable` function

The contract sets the ciphertext handle's status as publicly decryptable, globally and permanently authorizing any entity to request its off-chain cleartext value. Note the calling contract must have ACL permission to access the handle in the first place.

```solidity
function makePubliclyDecryptable(ebool value) internal;
function makePubliclyDecryptable(euint8 value) internal;
function makePubliclyDecryptable(euint16 value) internal;
...
function makePubliclyDecryptable(euint256 value) internal;
```

**Function arguments**

**Function return**

This function has no return value

#### Off-chain `publicDecrypt` function

The off-chain `publicDecrypt` function (exposed by the Zama SDK) is defined as follow:

```typescript
export type PublicDecryptResults = {
  clearValues: Record<`0x${string}`, bigint | boolean | `0x${string}`>;
  abiEncodedClearValues: `0x${string}`;
  decryptionProof: `0x${string}`;
};
export type FhevmInstance = {
  //...
  publicDecrypt: (handles: (string | Uint8Array)[]) => Promise<PublicDecryptResults>;
  //...
};
```

**Function arguments**

| Argument  | Description                                                                | Constraints                                                                                          |
| --------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `handles` | The list of ciphertext handles (represented as bytes32 values) to decrypt. | These handles must correspond to ciphertexts that have been marked as publicly decryptable on-chain. |

**Function return type `PublicDecryptResults`**

The function returns an object containing the three essential components required for the final on-chain verification in Step 3 of the public decryption workflow:

| Property                | Type                                                        | Description                                                                                                                            | On-Chain usage                                                                  |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `clearValues`           | `Record<`0x${string}`, bigint \| boolean \|` 0x${string}`>` | An object mapping each input ciphertext handle to its raw decrypted cleartext value.                                                   | N/A                                                                             |
| `abiEncodedClearValues` | `0x${string}`                                               | The ABI-encoded byte string of all decrypted cleartext values, preserving the exact order of the input handles list.                   | `abiEncodedCleartexts` argument when calling the on-chain `FHE.checkSignatures` |
| `decryptionProof`       | `0x${string}`                                               | A byte array containing the KMS cryptographic signatures and necessary metadata that proves the decryption was legitimately performed. | `decryptionProof` argument when calling the on-chain `FHE.checkSignatures`      |

#### On-chain `FHE.checkSignatures` function

```solidity
function checkSignatures(bytes32[] memory handlesList, bytes memory abiEncodedCleartexts, bytes memory decryptionProof) internal
```

**Function arguments**

| Argument               | Description                                                                                                                                                                     | Constraint                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlesList`          | The list of ciphertext handles (represented as bytes32 values) whose decryption is being verified.                                                                              | Must contain the exact same number of elements as the cleartext values in abiEncodedCleartexts.                                                |
| `abiEncodedCleartexts` | The ABI encoding of the decrypted cleartext values associated with the handles. (Use abi.encode to prepare this argument.)                                                      | Order is critical: The i-th value in this encoding must be the cleartext that corresponds to the i-th handle in handlesList. Types must match. |
| `decryptionProof`      | A byte array containing the KMS cryptographic signatures and necessary metadata that prove the off-chain decryption was performed by the authorized Zama Key Management System. | This proof is generated by the Zama KMS and is obtained via the off-chain `publicDecrypt` function.                                            |

**Function return**

This function has no return value and simply reverts if the proof verification failed.

{% hint style="warning" %}
Notice that the callback should always verify the signatures and implement a replay protection mechanism (see below).
{% endhint %}




# FHEVM API reference

This document provides an overview of the functions available in the `FHE` Solidity library. The FHE library provides functionality for working with encrypted types and performing operations on them. It implements fully homomorphic encryption (FHE) operations in Solidity.

## Overview

The `FHE` Solidity library provides essential functionality for working with encrypted data types and performing fully homomorphic encryption (FHE) operations in smart contracts. It is designed to streamline the developer experience while maintaining flexibility and performance.

### **Core Functionality**

* **Homomorphic Operations**: Enables arithmetic, bitwise, and comparison operations on encrypted values.
* **Ciphertext-Plaintext Interoperability**: Supports operations that mix encrypted and plaintext operands, provided the plaintext operand's size does not exceed the encrypted operand's size.
  * Example: `add(uint8 a, euint8 b)` is valid, but `add(uint32 a, euint16 b)` is not.
  * Ciphertext-plaintext operations are generally faster and consume less gas than ciphertext-ciphertext operations.
* **Implicit Upcasting**: Automatically adjusts operand types when necessary to ensure compatibility during operations on encrypted data.

### **Key Features**

* **Flexibility**: Handles a wide range of encrypted data types, including booleans, integers, addresses, and byte arrays.
* **Performance Optimization**: Prioritizes efficient computation by supporting optimized operator versions for mixed plaintext and ciphertext inputs.
* **Ease of Use**: Offers consistent APIs across all supported data types, enabling a smooth developer experience.

The library ensures that all operations on encrypted data follow the constraints of FHE while abstracting complexity, allowing developers to focus on building privacy-preserving smart contracts.

## Types

### Encrypted Data Types

#### Boolean

* `ebool`: Encrypted boolean value

#### Unsigned Integers

* `euint8`: Encrypted 8-bit unsigned integer
* `euint16`: Encrypted 16-bit unsigned integer
* `euint32`: Encrypted 32-bit unsigned integer
* `euint64`: Encrypted 64-bit unsigned integer
* `euint128`: Encrypted 128-bit unsigned integer
* `euint256`: Encrypted 256-bit unsigned integer

#### Addresses

* `eaddress`: Encrypted Ethereum address

#### Special Types

* `externalEbool`: Input type for encrypted boolean value
* `externalEuint8`: Input type for encrypted 8-bit unsigned integer value
* `externalEuint16`: Input type for encrypted 16-bit unsigned integer value
* `externalEuint32`: Input type for encrypted 32-bit unsigned integer value
* `externalEuint64`: Input type for encrypted 64-bit unsigned integer value
* `externalEuint128`: Input type for encrypted 128-bit unsigned integer value
* `externalEuint256`: Input type for encrypted 256-bit unsigned integer value
* `externalEaddress`: Input type for encrypted Ethereum address

### Casting Types

* **Casting between encrypted types**: `FHE.asEbool` converts encrypted integers to encrypted booleans
* **Casting to encrypted types**: `FHE.asEuintX` converts plaintext values to encrypted types
* **Casting to encrypted addresses**: `FHE.asEaddress` converts plaintext addresses to encrypted addresses

#### `asEuint`

The `asEuint` functions serve three purposes:

* verify ciphertext bytes and return a valid handle to the calling smart contract;
* cast a `euintX` typed ciphertext to a `euintY` typed ciphertext, where `X != Y`;
* trivially encrypt a plaintext value.

The first case is used to process encrypted inputs, e.g. user-provided ciphertexts. Those are generally included in a transaction payload.

The second case is self-explanatory. When `X > Y`, the most significant bits are dropped. When `X < Y`, the ciphertext is padded to the left with trivial encryptions of `0`.

The third case is used to "encrypt" a public value so that it can be used as a ciphertext. Note that what we call a trivial encryption is **not** secure in any sense. When trivially encrypting a plaintext value, this value is still visible in the ciphertext bytes. More information about trivial encryption can be found [here](https://www.zama.ai/post/tfhe-deep-dive-part-1).

**Examples**

```solidity
// first case
function asEuint8(bytes memory ciphertext) internal view returns (euint8)
// second case
function asEuint16(euint8 ciphertext) internal view returns (euint16)
// third case
function asEuint16(uint16 value) internal view returns (euint16)
```

#### `asEbool`

The `asEbool` functions behave similarly to the `asEuint` functions, but for encrypted boolean values.

## Core Functions

### Configuration

```solidity
function setCoprocessor(CoprocessorConfig memory coprocessorConfig) internal
```

Sets the FHEVM coprocessor configuration for encrypted operations. The `CoprocessorConfig` struct contains the addresses of the ACL, Coprocessor (FHEVMExecutor), and KMSVerifier contracts. In most cases, you do not need to call this directly — inherit from `ZamaEthereumConfig` instead, which calls this automatically based on the current chain ID.

### Initialization Checks

```solidity
function isInitialized(T v) internal pure returns (bool)
```

Returns true if the encrypted value is initialized, false otherwise. Supported for all encrypted types (T can be ebool, euintX, eaddress).

### Arithmetic operations

Available for euint\* types:

```solidity
function add(T a, T b) internal returns (T)
function sub(T a, T b) internal returns (T)
function mul(T a, T b) internal returns (T)
```

* Arithmetic: `FHE.add`, `FHE.sub`, `FHE.mul`, `FHE.min`, `FHE.max`, `FHE.neg`, `FHE.div`, `FHE.rem`
  * Note: `div` and `rem` operations are supported only with plaintext divisors

> :warning: Functions with FHE operations cannot be marked as `view` since FHE operations cost gas to execute since they always involve a state-change. For instance, you cannot compute and return the encrypted sum of two encrypted values in a view function.

#### Arithmetic operations (`add`, `sub`, `mul`, `div`, `rem`)

Performs the operation homomorphically.

Note that division/remainder only support plaintext divisors.

**Examples**

```solidity
// a + b
function add(euint8 a, euint8 b) internal view returns (euint8)
function add(euint8 a, euint16 b) internal view returns (euint16)
function add(uint32 a, euint32 b) internal view returns (euint32)

// a / b
function div(euint8 a, uint8 b) internal pure returns (euint8)
function div(euint16 a, uint16 b) internal pure returns (euint16)
function div(euint32 a, uint32 b) internal pure returns (euint32)
```

#### Min/Max Operations - `min`, `max`

Available for euint\* types:

```solidity
function min(T a, T b) internal returns (T)
function max(T a, T b) internal returns (T)
```

Returns the minimum (resp. maximum) of the two given values.

**Examples**

```solidity
// min(a, b)
function min(euint32 a, euint16 b) internal view returns (euint32)

// max(a, b)
function max(uint32 a, euint8 b) internal view returns (euint32)
```

#### Unary operators (`neg`, `not`)

There are two unary operators: `neg` (`-`) and `not` (`!`). Note that since we work with unsigned integers, the result of negation is interpreted as the modular opposite. The `not` operator returns the value obtained after flipping all the bits of the operand.

{% hint style="info" %}
More information about the behaviour of these operators can be found at the [TFHE-rs docs](https://docs.zama.ai/tfhe-rs/fhe-computation/operations/arithmetic-operations).
{% endhint %}

### Bitwise operations

* Bitwise: `FHE.and`, `FHE.or`, `FHE.xor`, `FHE.not`, `FHE.shl`, `FHE.shr`, `FHE.rotl`, `FHE.rotr`

#### Bitwise operations (`AND`, `OR`, `XOR`)

Unlike other binary operations, bitwise operations do not natively accept a mix of ciphertext and plaintext inputs. To ease developer experience, the `FHE` library adds function overloads for these operations. Such overloads implicitly do a trivial encryption before actually calling the operation function, as shown in the examples below.

Available for euint\* types:

```solidity
function and(T a, T b) internal returns (T)
function or(T a, T b) internal returns (T)
function xor(T a, T b) internal returns (T)
```

**Examples**

```solidity
// a & b
function and(euint8 a, euint8 b) internal view returns (euint8)

// implicit trivial encryption of `b` before calling the operator
function and(euint8 a, uint16 b) internal view returns (euint16)
```

#### Bit shift operations (`<<`, `>>`)

Shifts the bits of the base two representation of `a` by `b` positions.

**Examples**

```solidity
// a << b
function shl(euint16 a, euint8 b) internal view returns (euint16)
// a >> b
function shr(euint32 a, euint16 b) internal view returns (euint32)
```

#### Rotate operations

Rotates the bits of the base two representation of `a` by `b` positions.

**Examples**

```solidity
function rotl(euint16 a, euint8 b) internal view returns (euint16)
function rotr(euint32 a, euint16 b) internal view returns (euint32)
```

### Comparison operation (`eq`, `ne`, `ge`, `gt`, `le`, `lt`)

{% hint style="info" %}
**Note** that in the case of ciphertext-plaintext operations, since our backend only accepts plaintext right operands, calling the operation with a plaintext left operand will actually invert the operand order and call the *opposite* comparison.
{% endhint %}

The result of comparison operations is an encrypted boolean (`ebool`). In the backend, the boolean is represented by an encrypted unsigned integer of bit width 8, but this is abstracted away by the Solidity library.

Available for all encrypted types:

```solidity
function eq(T a, T b) internal returns (ebool)
function ne(T a, T b) internal returns (ebool)
```

Additional comparisons for euint\* types:

```solidity
function ge(T a, T b) internal returns (ebool)
function gt(T a, T b) internal returns (ebool)
function le(T a, T b) internal returns (ebool)
function lt(T a, T b) internal returns (ebool)
```

#### Examples

```solidity
// a == b
function eq(euint32 a, euint16 b) internal view returns (ebool)

// actually returns `lt(b, a)`
function gt(uint32 a, euint16 b) internal view returns (ebool)

// actually returns `gt(a, b)`
function gt(euint16 a, uint32 b) internal view returns (ebool)
```

### Multiplexer operator (`select`)

```solidity
function select(ebool control, T a, T b) internal returns (T)
```

If control is true, returns a, otherwise returns b. Available for all encrypted types (ebool, euintX, eaddress).

This operator takes three inputs. The first input `b` is of type `ebool` and the two others of type `euintX`. If `b` is an encryption of `true`, the first integer parameter is returned. Otherwise, the second integer parameter is returned.

#### Example

```solidity
// if (b == true) return val1 else return val2
function select(ebool b, euint8 val1, euint8 val2) internal view returns (euint8) {
  return FHE.select(b, val1, val2);
}
```

### Generating random encrypted integers

Random encrypted integers can be generated fully on-chain.

That can only be done during transactions and not on an `eth_call` RPC method, because PRNG state needs to be mutated on-chain during generation.

#### Example

```solidity
// Generate a random encrypted unsigned integer `r`.
euint32 r = FHE.randEuint32();
```

## Access control functions

The `FHE` library provides a robust set of access control functions for managing permissions on encrypted values. These functions ensure that encrypted data can only be accessed or manipulated by authorized accounts or contracts.

### Permission management

#### Functions

```solidity
function allow(T value, address account) internal
function allowThis(T value) internal
function allowTransient(T value, address account) internal
```

**Descriptions**

* **`allow`**: Grants **permanent access** to a specific address. Permissions are stored persistently in a dedicated ACL contract.
* **`allowThis`**: Grants the **current contract** access to an encrypted value.
* **`allowTransient`**: Grants **temporary access** to a specific address for the duration of the transaction. Permissions are stored in transient storage for reduced gas costs.

#### Access control list (ACL) overview

The `allow` and `allowTransient` functions enable fine-grained control over who can access and decrypt encrypted values. Temporary permissions (`allowTransient`) are ideal for minimizing gas usage in scenarios where access is needed only within a single transaction.

**Example: granting access**

```solidity
// Store an encrypted value.
euint32 r = FHE.asEuint32(94);

// Grant permanent access to the current contract.
FHE.allowThis(r);

// Grant permanent access to the caller.
FHE.allow(r, msg.sender);

// Grant temporary access to an external account.
FHE.allowTransient(r, 0x1234567890abcdef1234567890abcdef12345678);
```

### Permission checks

#### Functions

```solidity
function isAllowed(T value, address account) internal view returns (bool)
function isSenderAllowed(T value) internal view returns (bool)
```

#### Descriptions

* **`isAllowed`**: Checks whether a specific address has permission to access a ciphertext.
* **`isSenderAllowed`**: Similar to `isAllowed`, but automatically checks permissions for the `msg.sender`.

{% hint style="info" %}
Both functions return `true` if the ciphertext is authorized for the specified address, regardless of whether the allowance is stored in the ACL contract or in transient storage.
{% endhint %}

#### Verifying Permissions

These functions help ensure that only authorized accounts or contracts can access encrypted values.

**Example: permission verification**

```solidity
// Store an encrypted value.
euint32 r = FHE.asEuint32(94);

// Verify if the current contract is allowed to access the value.
bool isContractAllowed = FHE.isAllowed(r, address(this)); // returns true

// Verify if the caller has access to the value.
bool isCallerAllowed = FHE.isSenderAllowed(r); // depends on msg.sender
```

## Storage Management

### **Function**

```solidity
function cleanTransientStorage() internal
```

### Description

* **`cleanTransientStorage`**: Removes all temporary permissions from transient storage. Use this function at the end of a transaction to ensure no residual permissions remain.

### Example

```solidity
// Clean up transient storage at the end of a function.
function finalize() public {
  // Perform operations...

  // Clean up transient storage.
  FHE.cleanTransientStorage();
}
```

## Public decryption functions

These functions support the three-step public decryption workflow. For a complete tutorial, see [Public decryption](/protocol/solidity-guides/smart-contract/oracle.md).

### Make publicly decryptable

```solidity
function makePubliclyDecryptable(T value) internal returns (T)
```

Marks an encrypted value as publicly decryptable. Once called, any entity can request the off-chain decryption of this value via the Zama SDK. Supported for all encrypted types (T can be ebool, euintX, eaddress). The calling contract must have ACL permission to access the handle.

### Check if publicly decryptable

```solidity
function isPubliclyDecryptable(T value) internal view returns (bool)
```

Returns true if the encrypted value has been marked as publicly decryptable. Supported for all encrypted types.

### Verify decryption signatures

```solidity
function checkSignatures(
    bytes32[] memory handlesList,
    bytes memory abiEncodedCleartexts,
    bytes memory decryptionProof
) internal
```

Verifies that the cleartext values submitted on-chain match the authentic decryption results from the KMS. Reverts if:

* The `decryptionProof` is empty or has invalid length
* The number of valid signatures is below the KMS signers threshold
* Any signature is from a non-registered KMS signer

Emits a `PublicDecryptionVerified(handlesList, abiEncodedCleartexts)` event on success.

{% hint style="warning" %}
The order of handles in `handlesList` must match the order used when calling `publicDecrypt` off-chain. A proof computed for `[handleA, handleB]` is different from a proof computed for `[handleB, handleA]`.
{% endhint %}

### Validate decryption result (view)

```solidity
function isPublicDecryptionResultValid(
    bytes32[] memory handlesList,
    bytes memory abiEncodedCleartexts,
    bytes memory decryptionProof
) internal view returns (bool)
```

A `view` variant of `checkSignatures`. Returns `true` if the KMS signatures are valid, `false` otherwise (or reverts on malformed input). Unlike `checkSignatures`, this function does not emit events or cache results.

{% hint style="info" %}
Prefer `checkSignatures` over this function in most cases. `checkSignatures` is optimized for gas via signature caching, emits a `PublicDecryptionVerified` event for indexers, and is the standard approach for on-chain verification. Use `isPublicDecryptionResultValid` only when you need a read-only validation check (for example, in off-chain simulations).

Neither function provides replay protection on its own — emitting an event does not prevent the same `(handles, cleartexts, proof)` triple from being submitted twice. The callback that consumes the cleartexts must implement its own replay/state guard (see [Public Decryption](/protocol/solidity-guides/smart-contract/oracle.md)).
{% endhint %}

### Convert to bytes32

```solidity
function toBytes32(T value) internal pure returns (bytes32)
```

Converts an encrypted type handle to its underlying `bytes32` representation. Supported for all encrypted types (ebool, euintX, eaddress). This is required when building the `handlesList` array for `checkSignatures`.

**Example**

```solidity
bytes32[] memory handles = new bytes32[](2);
handles[0] = FHE.toBytes32(encryptedFoo);
handles[1] = FHE.toBytes32(encryptedBar);
```

## User decryption delegation

These functions transfer the rights of the `(delegator, contractAddress)` user-decryption pair to a new pair `(delegate, contractAddress)` for the same handles.

When called from a contract, **the calling contract is the delegator** (`msg.sender` to the ACL is `address(this)`). EOAs that want to delegate their own rights must call `IACL.delegateForUserDecryption` on the ACL contract directly. See [User decryption delegation](/protocol/solidity-guides/smart-contract/acl/delegation.md) for the full guide.

### Delegate user decryption

```solidity
function delegateUserDecryption(address delegate, address contractAddress, uint64 expirationDate) internal
function delegateUserDecryptionWithoutExpiration(address delegate, address contractAddress) internal
```

Delegates the caller contract's user decryption rights to `delegate` for ciphertexts associated with `contractAddress`. The delegation can have an expiration date or be indefinite.

The ACL enforces the following invariants — all must hold or the call reverts:

* `contractAddress != address(this)` (reverts with `IACL-SenderCannotBeContractAddress`).
* `delegate != address(this)` (reverts with `IACL-SenderCannotBeDelegate`).
* `delegate != contractAddress` (reverts with `IACL-DelegateCannotBeContractAddress`).
* `expirationDate > block.timestamp` (reverts with `IACL-ExpirationDateInThePast`).
* At most one delegate-or-revoke per block for a given `(address(this), delegate, contractAddress)` tuple.

### Batch delegate user decryption

```solidity
function delegateUserDecryptions(
    address delegate,
    address[] memory contractAddresses,
    uint64 expirationDate
) internal

function delegateUserDecryptionsWithoutExpiration(
    address delegate,
    address[] memory contractAddresses
) internal
```

Delegates user decryption rights across multiple contracts in a single call.

### Revoke user decryption delegation

```solidity
function revokeUserDecryptionDelegation(address delegate, address contractAddress) internal
function revokeUserDecryptionDelegations(address delegate, address[] memory contractAddresses) internal
```

Revokes previously granted decryption delegation for one or more contracts.

### Query delegation status

```solidity
function isDelegatedForUserDecryption(
    address delegator,
    address delegate,
    address contractAddress,
    bytes32 handle
) internal view returns (bool)

function getDelegatedUserDecryptionExpirationDate(
    address delegator,
    address delegate,
    address contractAddress
) internal view returns (uint64)

function isUserDecryptable(bytes32 handle, address user, address contractAddress) internal view returns (bool)
```

* **`isDelegatedForUserDecryption`**: Checks if `delegate` has active decryption delegation from `delegator` for a specific handle and contract.
* **`getDelegatedUserDecryptionExpirationDate`**: Returns the expiration timestamp of a delegation. Returns `0` if no delegation exists.
* **`isUserDecryptable`**: Checks if a handle can be decrypted by `user` in the context of `contractAddress`. Returns `true` only if both the user and the contract have persistent ACL permission on the handle.

## Account deny list

```solidity
function isAccountDenied(address account) internal view returns (bool)
```

Returns whether the given account is on the deny list. Denied accounts cannot interact with encrypted values.

## Additional notes

* **Underlying implementation**:\
  All encrypted operations and access control functionalities are performed through the underlying `Impl` library.
* **Uninitialized values**:\
  Uninitialized encrypted values are treated as `0` (for integers) or `false` (for booleans) in computations.
* **Implicit casting**:\
  Type conversion between encrypted integers of different bit widths is supported through implicit casting, allowing seamless operations without additional developer intervention.









# Hardhat plugin

This section will guide you through writing and testing FHEVM smart contracts in Solidity using [Hardhat](https://hardhat.org).

### The FHEVM Hardhat Plugin

To write FHEVM smart contracts using Hardhat, you need to install the [FHEVM Hardhat Plugin](https://www.npmjs.com/package/@fhevm/hardhat-plugin) in your Hardhat project.

This plugin enables you to develop, test, and interact with FHEVM contracts right out of the box.

It extends Hardhat’s functionality with a complete FHEVM API that allows you:

* Encrypt data
* Decrypt data
* Run tests using various FHEVM execution modes
* Write FHEVM-enabled Hardhat Tasks

### Where to go next

🟨 Go to [**Setup Hardhat**](/protocol/solidity-guides/getting-started/setup.md) to initialize your FHEVM Hardhat project.

🟨 Go to [**Write FHEVM Tests in Hardhat**](/protocol/solidity-guides/development-guide/hardhat/write_test.md) for details on writing tests of FHEVM smart contracts using Hardhat.

🟨 Go to [**Run FHEVM Tests in Hardhat**](/protocol/solidity-guides/development-guide/hardhat/run_test.md) to learn how to execute those tests in different FHEVM environments.

🟨 Go to [**Write FHEVM Hardhat Task**](/protocol/solidity-guides/development-guide/hardhat/write_task.md) to learn how to write your own custom FHEVM Hardhat task.









# Write FHEVM tests in Hardhat

In this section, you'll find everything you need to set up a new [Hardhat](https://hardhat.org) project and start developing FHEVM smart contracts from scratch using the [FHEVM Hardhat Plugin](https://www.npmjs.com/package/@fhevm/hardhat-plugin)

### Enabling the FHEVM Hardhat Plugin in your Hardhat project

Like any Hardhat plugin, the [FHEVM Hardhat Plugin](https://www.npmjs.com/package/@fhevm/hardhat-plugin) must be enabled by adding the following `import` statement to your `hardhat.config.ts` file:

```typescript
import "@fhevm/hardhat-plugin";
```

{% hint style="warning" %}
Without this import, the Hardhat FHEVM API will **not** be available in your Hardhat runtime environment (HRE).
{% endhint %}

### Accessing the Hardhat FHEVM API

The plugin extends the standard [Hardhat Runtime Environment](https://hardhat.org/hardhat-runner/docs/advanced/hardhat-runtime-environment) (or `hre` in short) with the new `fhevm` Hardhat module.

You can access it in either of the following ways:

```typescript
import { fhevm } from "hardhat";
```

or

```typescript
import * as hre from "hardhat";

// Then access: hre.fhevm
```

### Encrypting Values Using the Hardhat FHEVM API

Suppose the FHEVM smart contract you want to test has a function called `foo` that takes an encrypted `uint32` value as input. The Solidity function `foo` should be declared as follows:

```solidity
function foo(externalEuint32 value, bytes calldata inputProof);
```

Where:

* `externalEuint32 value` : is a `bytes32` representing the encrypted `uint32`
* `bytes calldata inputProof` : is a `bytes` array representing the zero-knowledge proof of knowledge that validates the encryption

To compute these arguments in TypeScript, you need:

* The **address of the target smart contract**
* The **signer’s address** (i.e., the account sending the transaction)

{% stepper %}
{% step %}
**Create a new encrypted input**

```ts
// use the `fhevm` API module from the Hardhat Runtime Environment
const input = fhevm.createEncryptedInput(contractAddress, signers.alice.address);
```

{% endstep %}

{% step %}
**Add the value you want to encrypt.**

```ts
input.add32(12345);
```

{% endstep %}

{% step %}
**Perform local encryption.**

```ts
const encryptedInputs = await input.encrypt();
```

{% endstep %}

{% step %}
**Call the Solidity function**

```ts
const externalUint32Value = encryptedInputs.handles[0];
const inputProof = encryptedInputs.inputProof;

const tx = await input.foo(externalUint32Value, inputProof);
await tx.wait();
```

{% endstep %}
{% endstepper %}

#### Encryption examples

* [Basic encryption examples](https://docs.zama.ai/protocol/examples/basic/encryption)
* [FHECounter](https://docs.zama.ai/protocol/examples#an-fhe-counter)

### Decrypting values using the Hardhat FHEVM API

Suppose user **Alice** wants to decrypt a `euint32` value that is stored in a smart contract exposing the following Solidity `view` function:

```solidity
function getEncryptedUint32Value() public view returns (euint32) { returns _encryptedUint32Value; }
```

{% hint style="warning" %}
For simplicity, we assume that both Alice’s account and the target smart contract already have the necessary FHE permissions to decrypt this value. For a detailed explanation of how FHE permissions work, see the [`initializeUint32()`](https://docs.zama.ai/protocol/examples/basic/decryption/fhe-decrypt-single-value#tab-decryptsinglevalue.sol) function in [DecryptSingleValue.sol](https://docs.zama.ai/protocol/examples/basic/decryption/fhe-decrypt-single-value#tab-decryptsinglevalue.sol).
{% endhint %}

{% stepper %}
{% step %}
**Retrieve the encrypted value (a `bytes32` handle) from the smart contract:**

```ts
const encryptedUint32Value = await contract.getEncryptedUint32Value();
```

{% endstep %}

{% step %}
**Perform the decryption using the FHEVM API:**

```ts
const clearUint32Value = await fhevm.userDecryptEuint(
  FhevmType.euint32, // Encrypted type (must match the Solidity type)
  encryptedUint32Value, // bytes32 handle Alice wants to decrypt
  contractAddress, // Target contract address
  signers.alice, // Alice’s wallet
);
```

{% hint style="warning" %}
If either the target smart contract or the user does **NOT** have FHE permissions, then the decryption call will fail!
{% endhint %}
{% endstep %}
{% endstepper %}

#### Supported Decryption Types

Use the appropriate function for each encrypted data type:

| Type       | Function                         |
| ---------- | -------------------------------- |
| `euintXXX` | `fhevm.userDecryptEuint(...)`    |
| `ebool`    | `fhevm.userDecryptEbool(...)`    |
| `eaddress` | `fhevm.userDecryptEaddress(...)` |

#### Decryption examples

* [Basic decryption examples](https://docs.zama.ai/protocol/examples/basic/decryption)
* [FHECounter](https://docs.zama.ai/protocol/examples#an-fhe-counter)






# Deploy contracts and run tests

In this section, you'll find everything you need to test your FHEVM smart contracts in your [Hardhat](https://hardhat.org) project.

### FHEVM Runtime Modes

The FHEVM Hardhat plugin provides three **FHEVM runtime modes** tailored for different stages of contract development and testing. Each mode offers a trade-off between speed, encryption, and persistence.

1. The **Hardhat (In-Memory)** default network: 🧪 *Uses mock encryption.* Ideal for regular tests, CI test coverage, and fast feedback during early contract development. No real encryption is used.
2. The **Hardhat Node (Local Server)** network: 🧪 *Uses mock encryption.* Ideal when you need persistent state - for example, when testing frontend interactions, simulating user flows, or validating deployments in a realistic local environment. Still uses mock encryption.
3. The **Sepolia Testnet** network: 🔐 *Uses real encryption.* Use this mode once your contract logic is stable and validated locally. This is the only mode that runs on the full FHEVM stack with **real encrypted values**. It simulates real-world production conditions but is slower and requires Sepolia ETH.

{% hint style="success" %}
**Zama Testnet** is not a blockchain itself. It is a protocol that enables you to run confidential smart contracts on existing blockchains (such as Ethereum, Base, and others) with the support of encrypted types. See the [FHE on blockchain](https://docs.zama.ai/protocol/protocol/overview) guide to learn more about the protocol architecture.

Currently, **Zama Protocol** is available on the **Sepolia Testnet**. Support for additional chains will be added in the future. [See the roadmap↗](https://docs.zama.ai/protocol/zama-protocol-litepaper#roadmap)
{% endhint %}

#### Summary

| Mode              | Encryption         | Persistent | Chain     | Speed        | Usage                                             |
| ----------------- | ------------------ | ---------- | --------- | ------------ | ------------------------------------------------- |
| Hardhat (default) | 🧪 Mock            | ❌ No       | In-Memory | ⚡⚡ Very Fast | Fast local testing and coverage                   |
| Hardhat Node      | 🧪 Mock            | ✅ Yes      | Server    | ⚡ Fast       | Frontend integration and local persistent testing |
| Sepolia Testnet   | 🔐 Real Encryption | ✅ Yes      | Server    | 🐢 Slow      | Full-stack validation with real encrypted data    |

### The FHEVM Hardhat Template

To demonstrate the three available testing modes, we'll use the [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template), which comes with the FHEVM Hardhat Plugin pre-installed, a basic `FHECounter` smart contract, and ready-to-use tasks for interacting with a deployed instance of this contract.

### Run on Hardhat (default)

To run your tests in-memory using FHEVM mock values, simply run the following:

```sh
npx hardhat test --network hardhat
```

### Run on Hardhat Node

You can also run your tests against a local Hardhat node, allowing you to deploy contract instances and interact with them in a persistent environment.

{% stepper %}
{% step %}
**Launch the Hardhat Node server:**

* Open a new terminal window.
* From the root project directory, run the following:

```sh
npx hardhat node
```

{% endstep %}

{% step %}
**Run your test suite (optional):**

From the root project directory:

```sh
npx hardhat test --network localhost
```

{% endstep %}

{% step %}
**Deploy the `FHECounter` smart contract on Hardhat Node**

From the root project directory:

```sh
npx hardhat deploy --network localhost
```

Check the deployed contract FHEVM configuration:

```sh
npx hardhat fhevm check-fhevm-compatibility --network localhost --address <deployed contract address>
```

{% endstep %}

{% step %}
**Interact with the deployed `FHECounter` smart contract**

From the root project directory:

1. Decrypt the current counter value:

```sh
npx hardhat --network localhost task:decrypt-count
```

2. Increment the counter by 1:

```sh
npx hardhat --network localhost task:increment --value 1
```

3. Decrypt the new counter value:

```sh
npx hardhat --network localhost task:decrypt-count
```

{% endstep %}
{% endstepper %}

### Run on Sepolia Ethereum Testnet

To test your FHEVM smart contract using real encrypted values, you can run your tests on the Sepolia Testnet.

{% stepper %}
{% step %}
**Rebuild the project for Sepolia**

From the root project directory:

```sh
npx hardhat clean
npx hardhat compile --network sepolia
```

{% endstep %}

{% step %}
**Deploy the `FHECounter` smart contract on Sepolia**

```sh
npx hardhat deploy --network sepolia
```

{% endstep %}

{% step %}
**Check the deployed `FHECounter` contract FHEVM configuration**

From the root project directory:

```sh
npx hardhat fhevm check-fhevm-compatibility --network sepolia --address <deployed contract address>
```

If an internal exception is raised, it likely means the contract was not properly compiled for the Sepolia network.
{% endstep %}

{% step %}
**Interact with the deployed `FHECounter` contract**

From the root project directory:

1. Decrypt the current counter value (⏳ wait...):

```sh
npx hardhat --network sepolia task:decrypt-count
```

2. Increment the counter by 1 (⏳ wait...):

```sh
npx hardhat --network sepolia task:increment --value 1
```

3. Decrypt the new counter value (⏳ wait...):

```sh
npx hardhat --network sepolia task:decrypt-count
```

{% endstep %}
{% endstepper %}








# Write FHEVM-enabled Hardhat Tasks

In this section, you'll learn how to write a custom FHEVM Hardhat task.

Writing tasks is a gas-efficient and flexible way to test your FHEVM smart contracts on the Sepolia network. Creating a custom task is straightforward.

## Prerequisite

* You should be familiar with Hardhat tasks. If you're new to them, refer to the [Hardhat Tasks official documentation](https://hardhat.org/hardhat-runner/docs/guides/tasks#writing-tasks).
* You should have already **completed** the [FHEVM Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup).
* This page provides a step-by-step walkthrough of the `task:decrypt-count` tasks included in the file [tasks/FHECounter.ts](https://github.com/zama-ai/fhevm-hardhat-template/blob/main/tasks/FHECounter.ts) file, located in the [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template) repository.

{% stepper %}
{% step %}

## A Basic Hardhat Task.

Let’s start with a simple example: fetching the current counter value from a basic `Counter.sol` contract.

If you're already familiar with Hardhat and custom tasks, the TypeScript code below should look familiar and be easy to follow:

```ts
task("task:get-count", "Calls the getCount() function of Counter Contract")
  .addOptionalParam("address", "Optionally specify the Counter contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const CounterDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("Counter");
    console.log(`Counter: ${CounterDeployment.address}`);

    const counterContract = await ethers.getContractAt("Counter", CounterDeployment.address);

    const clearCount = await counterContract.getCount();

    console.log(`Clear count    : ${clearCount}`);
});
```

Now, let’s modify this task to work with FHEVM encrypted values.
{% endstep %}

{% step %}

## Comment Out Existing Logic and rename

First, comment out the existing logic so we can incrementally add the necessary changes for FHEVM integration.

```ts
task("task:get-count", "Calls the getCount() function of Counter Contract")
  .addOptionalParam("address", "Optionally specify the Counter contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    // const { ethers, deployments } = hre;

    // const CounterDeployment = taskArguments.address
    //   ? { address: taskArguments.address }
    //   : await deployments.get("Counter");
    // console.log(`Counter: ${CounterDeployment.address}`);

    // const counterContract = await ethers.getContractAt("Counter", CounterDeployment.address);

    // const clearCount = await counterContract.getCount();

    // console.log(`Clear count    : ${clearCount}`);
});
```

Next, rename the task by replacing:

```ts
task("task:get-count", "Calls the getCount() function of Counter Contract")
```

With:

```ts
task("task:decrypt-count", "Calls the getCount() function of Counter Contract")
```

This updates the task name from `task:get-count` to `task:decrypt-count`, reflecting that it now includes decryption logic for FHE-encrypted values.
{% endstep %}

{% step %}

## Initialize FHEVM CLI API

Replace the line:

```ts
    // const { ethers, deployments } = hre;
```

With:

```ts
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();
```

{% hint style="warning" %}
Calling `initializeCLIApi()` is essential. Unlike built-in Hardhat tasks like `test` or `compile`, which automatically initialize the FHEVM runtime environment, custom tasks require you to call this function explicitly. **Make sure to call it at the very beginning of your task** to ensure the environment is properly set up.
{% endhint %}
{% endstep %}

{% step %}

## Call the view function `getCount` from the FHECounter contract

Replace the following commented-out lines:

```ts
    // const CounterDeployment = taskArguments.address
    //   ? { address: taskArguments.address }
    //   : await deployments.get("Counter");
    // console.log(`Counter: ${CounterDeployment.address}`);

    // const counterContract = await ethers.getContractAt("Counter", CounterDeployment.address);

    // const clearCount = await counterContract.getCount();
```

With the FHEVM equivalent:

```ts
    const FHECounterDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHECounter");
    console.log(`FHECounter: ${FHECounterDeployment.address}`);

    const fheCounterContract = await ethers.getContractAt("FHECounter", FHECounterDeployment.address);

    const encryptedCount = await fheCounterContract.getCount();
    if (encryptedCount === ethers.ZeroHash) {
      console.log(`encrypted count: ${encryptedCount}`);
      console.log("clear count    : 0");
      return;
    }
```

Here, `encryptedCount` is an FHE-encrypted `euint32` primitive. To retrieve the actual value, we need to decrypt it in the next step.
{% endstep %}

{% step %}

## Decrypt the encrypted count value.

Now replace the following commented-out line:

```ts
    // console.log(`Clear count    : ${clearCount}`);
```

With the decryption logic:

```ts
    const signers = await ethers.getSigners();
    const clearCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      FHECounterDeployment.address,
      signers[0],
    );
    console.log(`Encrypted count: ${encryptedCount}`);
    console.log(`Clear count    : ${clearCount}`);
```

At this point, your custom Hardhat task is fully configured to work with FHE-encrypted values and ready to run!
{% endstep %}

{% step %}

## Step 6: Run your custom task using Hardhat Node

**Start the Local Hardhat Node:**

* Open a new terminal window.
* From the root project directory, run the following:

```sh
npx hardhat node
```

**Deploy the FHECounter smart contract on the local Hardhat Node**

```sh
npx hardhat deploy --network localhost
```

**Run your custom task**

```sh
npx hardhat task:decrypt-count --network localhost
```

{% endstep %}

{% step %}

## Step 7: Run your custom task using Sepolia

**Deploy the FHECounter smart contract on Sepolia Testnet (if not already deployed)**

```sh
npx hardhat deploy --network sepolia
```

**Execute your custom task**

```sh
npx hardhat task:decrypt-count --network sepolia
```

{% endstep %}
{% endstepper %}






# Foundry

This section will guide you through writing and testing FHEVM smart contracts in Solidity using [Foundry](https://book.getfoundry.sh/).

### The forge-fhevm testing library

To write FHEVM smart contracts in Foundry, the recommended approach is to use [forge-fhevm](https://github.com/zama-ai/forge-fhevm) — a Foundry-native testing library for FHEVM confidential smart contracts.

Unlike a mock-only setup, `forge-fhevm` deploys the **real** FHEVM host contracts (`FHEVMExecutor`, `ACL`, `InputVerifier`, `KMSVerifier`) inside Foundry's test environment, with mock signer keys. Your tests exercise the same code paths as production while plaintext values are tracked locally so you can `assertEq` on them.

It gives you, out of the box:

* Encryption helpers for every FHE type (`encryptBool`, `encryptUint8` … `encryptUint256`, `encryptAddress`)
* Three decryption modes: low-level `decrypt()`, `publicDecrypt()`, and `userDecrypt()`
* EIP-712 proof helpers (`signUserDecrypt`, `buildDecryptionProof`)
* A ready-to-use `FhevmTest` base contract with all infrastructure deployed in `setUp()`

{% hint style="info" %}
The only deviation from mainnet is the use of mock private keys for the input signer and KMS signer, enabling deterministic EIP-712 proof generation in tests.
{% endhint %}

### The FHEVM Foundry template

The fastest way to start is the [FHEVM Foundry Template](https://github.com/zama-ai/fhevm-foundry-template) — a ready-to-clone Foundry project preconfigured with `forge-fhevm`, an example `FHECounter` contract, deployment scripts for local Anvil and Sepolia, and tests demonstrating the full encrypt → execute → decrypt flow.

### Where to go next

🟨 Go to [**Setup Foundry**](/protocol/solidity-guides/getting-started/setup-1.md) to create a Foundry project from the template.

🟨 Go to [**Write FHEVM tests in Foundry**](/protocol/solidity-guides/development-guide/foundry/write_test.md) for details on writing tests with `forge-fhevm`.

🟨 Go to [**Deploy FHEVM contracts with Foundry**](/protocol/solidity-guides/development-guide/foundry/deploy.md) to learn how to deploy to a local Anvil node or to Sepolia.

🟨 Go to [**forge-fhevm API reference**](/protocol/solidity-guides/development-guide/foundry/api.md) for the full list of `FhevmTest` helpers.





# Write FHEVM tests in Foundry

This page shows how to write FHEVM tests in Foundry using [forge-fhevm](https://github.com/zama-ai/forge-fhevm).

### Inherit from FhevmTest

Every FHEVM test contract inherits from `FhevmTest`. Calling `super.setUp()` deploys the FHEVM host contracts at their canonical deterministic addresses.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FhevmTest} from "forge-fhevm/FhevmTest.sol";
import {FHE} from "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";

contract MyTest is FhevmTest {
    MyContract myContract;

    function setUp() public override {
        super.setUp(); // deploy FHEVM host contracts
        myContract = new MyContract();
    }
}
```

{% hint style="warning" %}
The contract under test must inherit a Zama config (e.g. `ZamaEthereumConfig`) so `FHE.*` calls route to the FHEVM host contracts deployed by `setUp()`.
{% endhint %}

### Encrypt inputs

Use the `encrypt*` helpers to build a `(handle, proof)` pair for any contract that calls `FHE.fromExternal`.

{% stepper %}
{% step %}
**Encrypt a value**

The two-argument overload uses `address(this)` as the implicit user:

```solidity
(externalEuint64 amount, bytes memory proof) = encryptUint64(100, address(myContract));
```

{% endstep %}

{% step %}
**Encrypt for a specific user**

The three-argument overload binds the proof to a different user:

```solidity
address alice = address(0xA11CE);
(externalEuint64 amount, bytes memory proof) = encryptUint64(100, alice, address(myContract));
```

{% endstep %}

{% step %}
**Call the contract**

```solidity
vm.prank(alice);
myContract.deposit(amount, proof);
```

{% endstep %}
{% endstepper %}

#### Supported encrypt helpers

| Function         | Value type | Returned handle    |
| ---------------- | ---------- | ------------------ |
| `encryptBool`    | `bool`     | `externalEbool`    |
| `encryptUint8`   | `uint8`    | `externalEuint8`   |
| `encryptUint16`  | `uint16`   | `externalEuint16`  |
| `encryptUint32`  | `uint32`   | `externalEuint32`  |
| `encryptUint64`  | `uint64`   | `externalEuint64`  |
| `encryptUint128` | `uint128`  | `externalEuint128` |
| `encryptUint256` | `uint256`  | `externalEuint256` |
| `encryptAddress` | `address`  | `externalEaddress` |

{% hint style="info" %}
Each call to `encrypt*` increments an internal nonce, so encrypting the same value twice produces different handles.
{% endhint %}

### Decrypt results

`forge-fhevm` exposes three decryption modes that mirror production decryption flows. Pick the one that matches your contract's pattern.

#### `decrypt(handle)` — low-level lookup

Direct cleartext for the handle. No ACL or proof checks. Best for unit assertions:

```solidity
euint64 balance = myContract.balanceHandle(alice);
assertEq(decrypt(balance), 100);
```

`decrypt()` has typed overloads for every encrypted type:

```solidity
bool    a = decrypt(myEbool);
uint8   b = decrypt(myEuint8);
uint64  c = decrypt(myEuint64);
address d = decrypt(myEaddress);
```

#### `publicDecrypt(handles)` — KMS-signed public decryption

Use when your contract verifies decryption proofs on-chain via `FHE.checkSignatures()`. Returns cleartexts and a KMS-signed proof:

```solidity
bytes32[] memory handles = new bytes32[](1);
handles[0] = euint64.unwrap(balance);

(uint256[] memory cleartexts, bytes memory proof) = publicDecrypt(handles);
FHE.checkSignatures(handles, abi.encode(cleartexts), proof);
assertEq(cleartexts[0], 100);
```

{% hint style="warning" %}
`publicDecrypt()` reverts with `HandleNotAllowedForPublicDecryption` if the contract did not call `FHE.makePubliclyDecryptable()` on the handle.
{% endhint %}

#### `userDecrypt(handle, user, contract, signature)` — user-facing flow

The full user decryption flow with persistent ACL checks and EIP-712 signature verification:

```solidity
uint256 constant ALICE_PK = 0xA11CE;
address alice = vm.addr(ALICE_PK);

// (mint or transfer that grants ACL to alice through business logic)

bytes memory sig = signUserDecrypt(ALICE_PK, address(myContract));
uint256 cleartext = userDecrypt(
    euint64.unwrap(myContract.balanceHandle(alice)),
    alice,
    address(myContract),
    sig
);
assertEq(cleartext, 100);
```

| Error                              | Cause                                        |
| ---------------------------------- | -------------------------------------------- |
| `UserAddressEqualsContractAddress` | `userAddress == contractAddress`             |
| `UserNotAuthorizedForDecrypt`      | User lacks **persistent** ACL permission     |
| `ContractNotAuthorizedForDecrypt`  | Contract lacks **persistent** ACL permission |
| `InvalidUserDecryptSignature`      | Signature does not recover to `userAddress`  |

{% hint style="info" %}
ACL permissions are granted by the contract under test as part of its business logic — for example, when a token's `mint` calls `FHE.allow(balance, owner)`. You don't need to grant permissions manually in tests.
{% endhint %}

### Full counter test example

A complete counter test is shipped in [`fhevm-foundry-template/test/FHECounter.t.sol`](https://github.com/zama-ai/fhevm-foundry-template/blob/main/test/FHECounter.t.sol):

```solidity
contract FHECounterTest is FhevmTest {
    FHECounter counter;
    uint256 internal constant ALICE_PK = 0xA11CE;
    address alice;

    function setUp() public override {
        super.setUp();
        counter = new FHECounter();
        alice = vm.addr(ALICE_PK);
    }

    function test_incrementTheCounterByOne() public {
        (externalEuint32 encOne, bytes memory proof) = encryptUint32(1, alice, address(counter));

        vm.prank(alice);
        counter.increment(encOne, proof);

        bytes memory sig = signUserDecrypt(ALICE_PK, address(counter));
        uint256 clear = userDecrypt(euint32.unwrap(counter.getCount()), alice, address(counter), sig);
        assertEq(clear, 1);
    }
}
```

### Run the tests

```bash
forge test -vvv
forge test --match-test test_incrementTheCounterByOne -vvv  # single test
```

### Where to go next

🟨 Go to [**Deploy FHEVM contracts with Foundry**](/protocol/solidity-guides/development-guide/foundry/deploy.md) to deploy your contract to a local Anvil node or to Sepolia.

🟨 Go to [**forge-fhevm API reference**](/protocol/solidity-guides/development-guide/foundry/api.md) for the full `FhevmTest` API.






# Deploy contracts

This page covers deploying FHEVM contracts with Foundry — to a local Anvil node or to Sepolia.

### Deploy to Sepolia

The Sepolia FHEVM stack is already deployed at the canonical addresses listed in [Contract addresses](/protocol/solidity-guides/smart-contract/configure/contract_addresses.md). Your `forge` script just needs to broadcast against a Sepolia RPC — your contract picks up the FHEVM addresses through `ZamaEthereumConfig` (or whichever Zama config it inherits).

{% stepper %}
{% step %}
**Configure environment variables**

Copy the template's `.env.example` and fill in the values:

```bash
cp .env.example .env
```

```bash
# .env
DEPLOYER_PRIVATE_KEY=0x...
RPC_URL=https://sepolia.infura.io/v3/<key>
# ETHERSCAN_API_KEY=...   # optional, for verification
```

```bash
source .env
```

{% hint style="info" %}
If you only have a mnemonic / seed phrase, derive the private key with Foundry's `cast`:

```bash
cast wallet private-key "your twelve or twenty four words here"
```

{% endhint %}
{% endstep %}

{% step %}
**Run the deploy script**

```bash
forge script script/DeployFHECounter.s.sol \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast --verify
```

{% endstep %}
{% endstepper %}

### Deploy to a local Anvil node

For local development, you must first deploy a **local FHEVM host stack** before deploying your own contract. This is provided by [forge-fhevm](https://github.com/zama-ai/forge-fhevm) via its `deploy-local.sh` script.

The local FHEVM host stack is a **cleartext** FHEVM where encrypted values are stored as plaintexts on-chain — nothing is actually encrypted, but every contract code path executes the same as on a real chain.

{% stepper %}
{% step %}
**Clone forge-fhevm alongside your project**

```bash
git clone https://github.com/zama-ai/forge-fhevm
```

{% endstep %}

{% step %}
**Start an Anvil node**

In a separate terminal:

```bash
anvil
```

{% endstep %}

{% step %}
**Deploy the FHEVM host stack to the local node**

From the `forge-fhevm` directory:

```bash
./deploy-local.sh
```

This materializes all FHEVM host contracts (`FHEVMExecutor`, `ACL`, `InputVerifier`, `KMSVerifier`) at their canonical addresses on the running Anvil node, using `setCode`/`setStorageAt`.

{% hint style="info" %}
`deploy-local.sh` is local-first and zero-config. It uses the addresses committed in `FHEVMHostAddresses.sol` and works out of the box with no `.env` file for the standard local setup that `ZamaConfig._getLocalConfig()` expects.
{% endhint %}
{% endstep %}

{% step %}
**Deploy your contract**

From your project directory:

```bash
forge script script/DeployFHECounter.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast
```

{% endstep %}
{% endstepper %}

#### Multiple local nodes

`deploy-local.sh` can fan out to several Anvil instances from a single build:

```bash
# Deploy to two local nodes concurrently
./deploy-local.sh --anvil-port 8545 --anvil-port 8546

# Reuse already-built artifacts
./deploy-local.sh --skip-build --anvil-port 8545 --anvil-port 8546
```

### Where to go next

🟨 Go to [**Contract addresses**](/protocol/solidity-guides/smart-contract/configure/contract_addresses.md) for the canonical FHEVM addresses on each network.

🟨 Go to [**Write FHEVM tests in Foundry**](/protocol/solidity-guides/development-guide/foundry/write_test.md) for the test side of the workflow.






# forge-fhevm API reference

This page is a quick reference for the [`FhevmTest`](https://github.com/zama-ai/forge-fhevm/blob/main/src/FhevmTest.sol) base contract from [forge-fhevm](https://github.com/zama-ai/forge-fhevm). For the full reference and additional helpers, see the [forge-fhevm docs](https://github.com/zama-ai/forge-fhevm/tree/main/docs).

### Import

```solidity
import {FhevmTest} from "forge-fhevm/FhevmTest.sol";
```

### State variables (set by `setUp()`)

| Variable            | Type            | Role                                                                        |
| ------------------- | --------------- | --------------------------------------------------------------------------- |
| `_executor`         | `FHEVMExecutor` | Processes FHE operations and emits the events that drive plaintext tracking |
| `_acl`              | `ACL`           | Per-handle access control (transient and persistent)                        |
| `_inputVerifier`    | `InputVerifier` | Verifies EIP-712 input proofs (1 mock signer)                               |
| `_kmsVerifier`      | `KMSVerifier`   | Verifies EIP-712 decryption proofs (1 mock signer)                          |
| `MOCK_INPUT_SIGNER` | `address`       | Address of the mock input signer                                            |
| `MOCK_KMS_SIGNER`   | `address`       | Address of the mock KMS signer                                              |

### Encryption helpers

Each helper has a two-argument overload (`address(this)` is the implicit user) and a three-argument overload (explicit user).

```solidity
function encryptBool(bool value, address target) returns (externalEbool, bytes memory);
function encryptBool(bool value, address user, address target) returns (externalEbool, bytes memory);

function encryptUint8(uint8 value, address target) returns (externalEuint8, bytes memory);
function encryptUint8(uint8 value, address user, address target) returns (externalEuint8, bytes memory);

// Same shape for: encryptUint16, encryptUint32, encryptUint64,
//                  encryptUint128, encryptUint256, encryptAddress
```

### Decryption helpers

```solidity
// Low-level: no ACL checks, raw uint256
function decrypt(bytes32 handle) returns (uint256);

// Typed overloads — return the matching Solidity primitive
function decrypt(ebool value)    returns (bool);
function decrypt(euint8 value)   returns (uint8);
function decrypt(euint16 value)  returns (uint16);
function decrypt(euint32 value)  returns (uint32);
function decrypt(euint64 value)  returns (uint64);
function decrypt(euint128 value) returns (uint128);
function decrypt(euint256 value) returns (uint256);
function decrypt(eaddress value) returns (address);

// Public decrypt — KMS-signed proof verifiable via FHE.checkSignatures
function publicDecrypt(bytes32[] memory handles)
    returns (uint256[] memory cleartexts, bytes memory proof);

// User decrypt — full ACL + EIP-712 flow
function userDecrypt(
    bytes32 handle,
    address userAddress,
    address contractAddress,
    bytes memory userSignature
) returns (uint256);
```

### Proof helpers

```solidity
// KMS-signed decryption proof (no ACL check) — for callback-style flows
function buildDecryptionProof(bytes32[] memory handles, bytes memory abiEncodedCleartexts)
    view returns (bytes memory proof);
function buildDecryptionProof(bytes32 handle, bytes memory abiEncodedCleartext)
    view returns (bytes memory proof);

// EIP-712 user-decrypt signature
function signUserDecrypt(uint256 userPk, address contractAddress)
    view returns (bytes memory signature);
function signUserDecrypt(
    uint256 userPk,
    address[] memory contractAddresses,
    uint256 startTimestamp,
    uint256 durationDays
) view returns (bytes memory signature);
```

### Constants

| Constant                             | Value                                    | Purpose                                                  |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| `MOCK_INPUT_SIGNER_PK`               | Hardcoded mock key — see `FhevmTest.sol` | Signs input proofs (deterministic, mock signer)          |
| `MOCK_KMS_SIGNER_PK`                 | Hardcoded mock key — see `FhevmTest.sol` | Signs KMS decryption proofs (deterministic, mock signer) |
| `EMPTY_EXTRA_DATA`                   | `hex"00"`                                | Default extra data appended to EIP-712 proofs            |
| `DEFAULT_USER_DECRYPT_DURATION_DAYS` | `1`                                      | Default validity for user-decrypt sigs                   |

{% hint style="info" %}
The mock signer keys are Zama-specific values committed inside `forge-fhevm/src/FhevmTest.sol` — they are **not** Foundry's standard test private keys. They exist only so EIP-712 proofs are deterministic in tests.
{% endhint %}


# forge-fhevm API reference

This page is a quick reference for the [`FhevmTest`](https://github.com/zama-ai/forge-fhevm/blob/main/src/FhevmTest.sol) base contract from [forge-fhevm](https://github.com/zama-ai/forge-fhevm). For the full reference and additional helpers, see the [forge-fhevm docs](https://github.com/zama-ai/forge-fhevm/tree/main/docs).

### Import

```solidity
import {FhevmTest} from "forge-fhevm/FhevmTest.sol";
```

### State variables (set by `setUp()`)

| Variable            | Type            | Role                                                                        |
| ------------------- | --------------- | --------------------------------------------------------------------------- |
| `_executor`         | `FHEVMExecutor` | Processes FHE operations and emits the events that drive plaintext tracking |
| `_acl`              | `ACL`           | Per-handle access control (transient and persistent)                        |
| `_inputVerifier`    | `InputVerifier` | Verifies EIP-712 input proofs (1 mock signer)                               |
| `_kmsVerifier`      | `KMSVerifier`   | Verifies EIP-712 decryption proofs (1 mock signer)                          |
| `MOCK_INPUT_SIGNER` | `address`       | Address of the mock input signer                                            |
| `MOCK_KMS_SIGNER`   | `address`       | Address of the mock KMS signer                                              |

### Encryption helpers

Each helper has a two-argument overload (`address(this)` is the implicit user) and a three-argument overload (explicit user).

```solidity
function encryptBool(bool value, address target) returns (externalEbool, bytes memory);
function encryptBool(bool value, address user, address target) returns (externalEbool, bytes memory);

function encryptUint8(uint8 value, address target) returns (externalEuint8, bytes memory);
function encryptUint8(uint8 value, address user, address target) returns (externalEuint8, bytes memory);

// Same shape for: encryptUint16, encryptUint32, encryptUint64,
//                  encryptUint128, encryptUint256, encryptAddress
```

### Decryption helpers

```solidity
// Low-level: no ACL checks, raw uint256
function decrypt(bytes32 handle) returns (uint256);

// Typed overloads — return the matching Solidity primitive
function decrypt(ebool value)    returns (bool);
function decrypt(euint8 value)   returns (uint8);
function decrypt(euint16 value)  returns (uint16);
function decrypt(euint32 value)  returns (uint32);
function decrypt(euint64 value)  returns (uint64);
function decrypt(euint128 value) returns (uint128);
function decrypt(euint256 value) returns (uint256);
function decrypt(eaddress value) returns (address);

// Public decrypt — KMS-signed proof verifiable via FHE.checkSignatures
function publicDecrypt(bytes32[] memory handles)
    returns (uint256[] memory cleartexts, bytes memory proof);

// User decrypt — full ACL + EIP-712 flow
function userDecrypt(
    bytes32 handle,
    address userAddress,
    address contractAddress,
    bytes memory userSignature
) returns (uint256);
```

### Proof helpers

```solidity
// KMS-signed decryption proof (no ACL check) — for callback-style flows
function buildDecryptionProof(bytes32[] memory handles, bytes memory abiEncodedCleartexts)
    view returns (bytes memory proof);
function buildDecryptionProof(bytes32 handle, bytes memory abiEncodedCleartext)
    view returns (bytes memory proof);

// EIP-712 user-decrypt signature
function signUserDecrypt(uint256 userPk, address contractAddress)
    view returns (bytes memory signature);
function signUserDecrypt(
    uint256 userPk,
    address[] memory contractAddresses,
    uint256 startTimestamp,
    uint256 durationDays
) view returns (bytes memory signature);
```

### Constants

| Constant                             | Value                                    | Purpose                                                  |
| ------------------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| `MOCK_INPUT_SIGNER_PK`               | Hardcoded mock key — see `FhevmTest.sol` | Signs input proofs (deterministic, mock signer)          |
| `MOCK_KMS_SIGNER_PK`                 | Hardcoded mock key — see `FhevmTest.sol` | Signs KMS decryption proofs (deterministic, mock signer) |
| `EMPTY_EXTRA_DATA`                   | `hex"00"`                                | Default extra data appended to EIP-712 proofs            |
| `DEFAULT_USER_DECRYPT_DURATION_DAYS` | `1`                                      | Default validity for user-decrypt sigs                   |

{% hint style="info" %}
The mock signer keys are Zama-specific values committed inside `forge-fhevm/src/FhevmTest.sol` — they are **not** Foundry's standard test private keys. They exist only so EIP-712 proofs are deterministic in tests.
{% endhint %}







# HCU

This guide explains how to use Fully Homomorphic Encryption (FHE) operations in your smart contracts on FHEVM. Understanding HCU is critical for designing efficient confidential smart contracts.

## Overview

FHE operations in FHEVM are computationally intensive compared to standard Ethereum operations, as they require complex mathematical computations to maintain privacy and security. To manage computational load and prevent potential denial-of-service attacks, FHEVM implements a metering system called **Homomorphic Complexity Units ("HCU")**.

To represent this complexity, we introduced the **Homomorphic Complexity Unit ("HCU")**. In Solidity, each FHE operation consumes a set amount of HCU based on the operational computational complexity for hardware computation. Since FHE transactions are symbolic, this helps preventing resource exhaustion outside of the blockchain.

To do so, there is a contract named `HCULimit`, which monitors HCU consumption for each transaction and enforces two key limits:

* **Sequential homomorphic operations depth limit per transaction**: Controls HCU usage for operations that must be processed in order.
* **Global homomorphic operations complexity per transaction**: Controls HCU usage for operations that can be processed in parallel.

If either limit is exceeded, the transaction will revert.

## HCU limit

The current devnet has an HCU limit of **20,000,000** per transaction and an HCU depth limit of **5,000,000** per transaction. If either HCU limit is exceeded, the transaction will revert.

To resolve this, you must do one of the following:

* Refactor your code to reduce the number of FHE operations in your transaction.
* Split your FHE operations across multiple independent transactions.

## HCU costs for common operations

### Boolean operations (`ebool`)

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `and`         | 22,000       | 25,000           |
| `or`          | 22,000       | 24,000           |
| `xor`         | 2,000        | 22,000           |
| `not`         | -            | 2                |
| `select`      | -            | 55,000           |
| `randEbool`   | -            | 19,000           |

***

### Unsigned integer operations

HCU increase with the bit-width of the encrypted integer type. Below are the detailed costs for various operations on encrypted types.

#### **8-bit Encrypted integers (`euint8`)**

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `add`         | 84,000       | 88,000           |
| `sub`         | 84,000       | 91,000           |
| `mul`         | 122,000      | 150,000          |
| `div`         | 210,000      | -                |
| `rem`         | 440,000      | -                |
| `and`         | 31,000       | 31,000           |
| `or`          | 30,000       | 30,000           |
| `xor`         | 31,000       | 31,000           |
| `shr`         | 32,000       | 91,000           |
| `shl`         | 32,000       | 92,000           |
| `rotr`        | 31,000       | 93,000           |
| `rotl`        | 31,000       | 91,000           |
| `eq`          | 55,000       | 55,000           |
| `ne`          | 55,000       | 55,000           |
| `ge`          | 52,000       | 63,000           |
| `gt`          | 52,000       | 59,000           |
| `le`          | 58,000       | 58,000           |
| `lt`          | 52,000       | 59,000           |
| `min`         | 84,000       | 119,000          |
| `max`         | 89,000       | 121,000          |
| `neg`         | -            | 79,000           |
| `not`         | -            | 9                |
| `select`      | -            | 55,000           |
| `randEuint8`  | -            | 23,000           |

#### **16-bit Encrypted integers (`euint16`)**

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `add`         | 93,000       | 93,000           |
| `sub`         | 93,000       | 93,000           |
| `mul`         | 193,000      | 222,000          |
| `div`         | 302,000      | -                |
| `rem`         | 580,000      | -                |
| `and`         | 31,000       | 31,000           |
| `or`          | 30,000       | 31,000           |
| `xor`         | 31,000       | 31,000           |
| `shr`         | 32,000       | 123,000          |
| `shl`         | 32,000       | 125,000          |
| `rotr`        | 31,000       | 125,000          |
| `rotl`        | 31,000       | 125,000          |
| `eq`          | 55,000       | 83,000           |
| `ne`          | 55,000       | 83,000           |
| `ge`          | 55,000       | 84,000           |
| `gt`          | 55,000       | 84,000           |
| `le`          | 58,000       | 83,000           |
| `lt`          | 58,000       | 84,000           |
| `min`         | 88,000       | 146,000          |
| `max`         | 89,000       | 145,000          |
| `neg`         | -            | 93,000           |
| `not`         | -            | 16               |
| `select`      | -            | 55,000           |
| `randEuint16` | -            | 23,000           |

#### **32-bit Encrypted Integers (`euint32`)**

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `add`         | 95,000       | 125,000          |
| `sub`         | 95,000       | 125,000          |
| `mul`         | 265,000      | 328,000          |
| `div`         | 438,000      | -                |
| `rem`         | 792,000      | -                |
| `and`         | 32,000       | 32,000           |
| `or`          | 32,000       | 32,000           |
| `xor`         | 32,000       | 32,000           |
| `shr`         | 32,000       | 163,000          |
| `shl`         | 32,000       | 162,000          |
| `rotr`        | 32,000       | 160,000          |
| `rotl`        | 32,000       | 163,000          |
| `eq`          | 82,000       | 86,000           |
| `ne`          | 83,000       | 85,000           |
| `ge`          | 84,000       | 118,000          |
| `gt`          | 84,000       | 118,000          |
| `le`          | 84,000       | 117,000          |
| `lt`          | 83,000       | 117,000          |
| `min`         | 117,000      | 182,000          |
| `max`         | 117,000      | 180,000          |
| `neg`         | -            | 131,000          |
| `not`         | -            | 32               |
| `select`      | -            | 55,000           |
| `randEuint32` | -            | 24,000           |

#### **64-bit Encrypted integers (`euint64`)**

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `add`         | 133,000      | 162,000          |
| `sub`         | 133,000      | 162,000          |
| `mul`         | 365,000      | 596,000          |
| `div`         | 715,000      | -                |
| `rem`         | 1,153,000    | -                |
| `and`         | 34,000       | 34,000           |
| `or`          | 34,000       | 34,000           |
| `xor`         | 34,000       | 34,000           |
| `shr`         | 34,000       | 209,000          |
| `shl`         | 34,000       | 208,000          |
| `rotr`        | 34,000       | 209,000          |
| `rotl`        | 34,000       | 209,000          |
| `eq`          | 83,000       | 120,000          |
| `ne`          | 84,000       | 118,000          |
| `ge`          | 116,000      | 152,000          |
| `gt`          | 117,000      | 152,000          |
| `le`          | 119,000      | 149,000          |
| `lt`          | 118,000      | 146,000          |
| `min`         | 150,000      | 219,000          |
| `max`         | 149,000      | 218,000          |
| `neg`         | -            | 131,000          |
| `not`         | -            | 63               |
| `select`      | -            | 55,000           |
| `randEuint64` | -            | 24,000           |

#### **128-bit Encrypted integers (`euint128`)**

| Function name  | HCU (scalar) | HCU (non-scalar) |
| -------------- | ------------ | ---------------- |
| `add`          | 172,000      | 259,000          |
| `sub`          | 172,000      | 260,000          |
| `mul`          | 696,000      | 1,686,000        |
| `div`          | 1,225,000    | -                |
| `rem`          | 1,943,000    | -                |
| `and`          | 37,000       | 37,000           |
| `or`           | 37,000       | 37,000           |
| `xor`          | 37,000       | 37,000           |
| `shr`          | 37,000       | 272,000          |
| `shl`          | 37,000       | 272,000          |
| `rotr`         | 37,000       | 283,000          |
| `rotl`         | 37,000       | 278,000          |
| `eq`           | 117,000      | 122,000          |
| `ne`           | 117,000      | 122,000          |
| `ge`           | 149,000      | 210,000          |
| `gt`           | 150,000      | 218,000          |
| `le`           | 150,000      | 218,000          |
| `lt`           | 149,000      | 215,000          |
| `min`          | 186,000      | 289,000          |
| `max`          | 180,000      | 290,000          |
| `neg`          | -            | 168,000          |
| `not`          | -            | 130              |
| `select`       | -            | 57,000           |
| `randEuint128` | -            | 25,000           |

#### **256-bit Encrypted integers (`euint256`)**

| Function name  | HCU (scalar) | HCU (non-scalar) |
| -------------- | ------------ | ---------------- |
| `and`          | 38,000       | 38,000           |
| `or`           | 38,000       | 38,000           |
| `xor`          | 39,000       | 39,000           |
| `shr`          | 38,000       | 369,000          |
| `shl`          | 39,000       | 378,000          |
| `rotr`         | 40,000       | 375,000          |
| `rotl`         | 38,000       | 378,000          |
| `eq`           | 118,000      | 152,000          |
| `ne`           | 117,000      | 150,000          |
| `neg`          | -            | 269,000          |
| `not`          | -            | 130              |
| `select`       | -            | 108,000          |
| `randEuint256` | -            | 30,000           |

#### **Encrypted addresses (`euint160`)**

When using `eaddress` (internally represented as `euint160`), the HCU costs for equality and inequality checks and select are as follows:

| Function name | HCU (scalar) | HCU (non-scalar) |
| ------------- | ------------ | ---------------- |
| `eq`          | 115,000      | 125,000          |
| `ne`          | 115,000      | 124,000          |
| `select`      | -            | 83,000           |

## Additional Operations

| Function name    | HCU |
| ---------------- | --- |
| `cast`           | 32  |
| `trivialEncrypt` | 32  |








# How to Transform Your Smart Contract into a FHEVM Smart Contract?

This short guide will walk you through converting a standard Solidity contract into one that leverages Fully Homomorphic Encryption (FHE) using FHEVM. This approach lets you develop your contract logic as usual, then adapt it to support encrypted computation for privacy.

For this guide, we will focus on a voting contract example.

***

## 1. Start with a Standard Solidity Contract

Begin by writing your voting contract in Solidity as you normally would. Focus on implementing the core logic and functionality.

```solidity
// Standard Solidity voting contract example
pragma solidity ^0.8.0;

contract SimpleVoting {
    mapping(address => bool) public hasVoted;
    uint64 public yesVotes;
    uint64 public noVotes;
    uint256 public voteDeadline;

    function vote(bool support) public {
        require(block.timestamp <= voteDeadline, "Too late to vote");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;

        if (support) {
            yesVotes += 1;
        } else {
            noVotes += 1;
        }
    }

    function getResults() public view returns (uint64, uint64) {
        return (yesVotes, noVotes);
    }
}
```

***

## 2. Identify Sensitive Data and Operations

Review your contract and determine which variables, functions, or computations require privacy. In this example, the vote counts (`yesVotes`, `noVotes`) and individual votes should be encrypted.

***

## 3. Integrate FHEVM and update your business logic accordingly.

Replace standard data types and operations with their FHEVM equivalents for the identified sensitive parts. Use encrypted types and FHEVM library functions to perform computations on encrypted data.

```solidity
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedSimpleVoting is ZamaEthereumConfig {
    enum VotingStatus {
        Open,
        DecryptionRequested,
        ResultsRevealed
    }
    mapping(address => bool) public hasVoted;

    VotingStatus public status;

    uint64 public revealedYesVotes;
    uint64 public revealedNoVotes;

    uint256 public voteDeadline;

    euint64 private encryptedYesVotes;
    euint64 private encryptedNoVotes;

    event ResultsDecryptionRequested(euint64 yes, euint64 no);

    constructor() {
        encryptedYesVotes = FHE.asEuint64(0);
        encryptedNoVotes = FHE.asEuint64(0);

        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
    }

    function vote(externalEbool support, bytes memory inputProof) public {
        require(block.timestamp <= voteDeadline, "Too late to vote");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        ebool isSupport = FHE.fromExternal(support, inputProof);
        encryptedYesVotes = FHE.select(isSupport, FHE.add(encryptedYesVotes, 1), encryptedYesVotes);
        encryptedNoVotes = FHE.select(isSupport, encryptedNoVotes, FHE.add(encryptedNoVotes, 1));
        FHE.allowThis(encryptedYesVotes);
        FHE.allowThis(encryptedNoVotes);
    }

    /// @notice Marks the vote totals as publicly decryptable. Anyone can then call
    /// the off-chain `publicDecrypt` (via the Zama SDK) to obtain the cleartexts
    /// and a decryption proof.
    function requestVoteDecryption() public {
        require(block.timestamp > voteDeadline, "Voting is not finished");
        require(status == VotingStatus.Open, "Decryption already requested");

        FHE.makePubliclyDecryptable(encryptedYesVotes);
        FHE.makePubliclyDecryptable(encryptedNoVotes);

        status = VotingStatus.DecryptionRequested;

        emit ResultsDecryptionRequested(encryptedYesVotes, encryptedNoVotes);
    }

    /// @notice Submits the off-chain cleartexts together with the KMS-signed proof.
    /// `FHE.checkSignatures` reverts if the proof does not match the handles or values.
    /// @dev The handle order MUST match the order used to generate the proof off-chain.
    function revealResults(uint64 yesVotes, uint64 noVotes, bytes memory decryptionProof) public {
        require(status == VotingStatus.DecryptionRequested, "Decryption was not requested");

        bytes32[] memory handles = new bytes32[](2);
        handles[0] = FHE.toBytes32(encryptedYesVotes);
        handles[1] = FHE.toBytes32(encryptedNoVotes);

        FHE.checkSignatures(handles, abi.encode(yesVotes, noVotes), decryptionProof);

        revealedYesVotes = yesVotes;
        revealedNoVotes = noVotes;
        status = VotingStatus.ResultsRevealed;
    }

    function getResults() public view returns (uint64, uint64) {
        require(status == VotingStatus.ResultsRevealed, "Results were not revealed");
        return (revealedYesVotes, revealedNoVotes);
    }
}
```

Adjust your contract's code to accept and return encrypted data where necessary. This may involve changing function parameters and return types to work with ciphertexts instead of plaintext values, as shown above.

* The `vote` function now takes two parameters: an encrypted `support` handle and its `inputProof`.
* After the deadline, anyone calls `requestVoteDecryption()` to mark the encrypted totals as publicly decryptable.
* An off-chain client then calls `publicDecrypt([yesHandle, noHandle])` via the Zama SDK to obtain the cleartexts and a KMS-signed proof, and submits them via `revealResults(...)`. `FHE.checkSignatures` cryptographically guarantees the cleartexts are authentic before the contract trusts them.
* `getResults()` only returns once the cleartexts have been verified on-chain.

However, this is far from being the main change. As this example illustrates, working with FHEVM often requires re-architecting the original logic to support privacy.

In the updated code, the logic becomes asynchronous: results are hidden until they are explicitly marked as publicly decryptable, decrypted off-chain, and verified back on-chain. See [Public Decryption](/protocol/solidity-guides/smart-contract/oracle.md) for the full step-by-step workflow.

## Conclusion

As this short guide showed, integrating with FHEVM not only requires integration with the FHEVM stack, it also requires refactoring your business logic to support mechanism to swift between encrypted and non-encrypted components of the logic.
