/**
 * AnimaDisperse.ts — Hardhat test suite for AnimaDisperse.sol
 *
 * Tests:
 *   createDistribution — per-recipient encrypted allocations stored
 *   requestDecryptPermit — FHE.allow enables off-chain decrypt
 *   claim — plaintext verified via userDecryptEuint
 *   vesting cliff — claim reverts before cliff
 *   vesting linear — partial vesting returns correct fraction
 *   cancel — distributor sweeps unclaimed allocations back
 *   double claim prevention
 *   empty recipients revert
 */

import { FhevmType } from '@fhevm/hardhat-plugin'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers, fhevm, network } from 'hardhat'

type Signers = {
  deployer: HardhatEthersSigner
  distributor: HardhatEthersSigner
  alice: HardhatEthersSigner
  bob: HardhatEthersSigner
  carol: HardhatEthersSigner
}

async function deployFixture() {
  const signers = await ethers.getSigners()
  const actors: Signers = {
    deployer: signers[0]!,
    distributor: signers[1]!,
    alice: signers[2]!,
    bob: signers[3]!,
    carol: signers[4]!,
  }

  const MockFactory = await ethers.getContractFactory('MockFHERC20')
  const token = await MockFactory.connect(actors.deployer).deploy('MockToken', 'MTK')
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()

  const DisperseFactory = await ethers.getContractFactory('AnimaDisperse')
  const disperse = await DisperseFactory.connect(actors.deployer).deploy()
  await disperse.waitForDeployment()
  const disperseAddress = await disperse.getAddress()

  // Fund distributor
  await token.connect(actors.deployer).mintClear(actors.distributor.address, 100_000n)
  await token.connect(actors.distributor).approveEncrypted(disperseAddress)

  return { actors, token, tokenAddress, disperse, disperseAddress }
}

/** Helper — encrypt a single euint64 amount for a given contract + sender */
async function encryptAmount(contractAddress: string, sender: HardhatEthersSigner, amount: bigint) {
  return fhevm
    .createEncryptedInput(contractAddress, sender.address)
    .add64(amount)
    .encrypt()
}

/** Helper — fast-forward block timestamp by `seconds` */
async function timeTravel(seconds: number) {
  await network.provider.send('evm_increaseTime', [seconds])
  await network.provider.send('evm_mine', [])
}

describe('AnimaDisperse', function () {
  let actors: Signers
  let token: Awaited<ReturnType<typeof deployFixture>>['token']
  let tokenAddress: string
  let disperse: Awaited<ReturnType<typeof deployFixture>>['disperse']
  let disperseAddress: string

  beforeEach(async () => {
    ;({ actors, token, tokenAddress, disperse, disperseAddress } = await deployFixture())
  })

  // ── deployment ──────────────────────────────────────────────────────────────

  it('deploys to a valid address', async function () {
    expect(ethers.isAddress(disperseAddress)).to.eq(true)
  })

  it('distributionCount starts at 0', async function () {
    expect(await disperse.distributionCount()).to.eq(0n)
  })

  // ── createDistribution ──────────────────────────────────────────────────────

  it('creates a distribution and increments distributionCount', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)

    await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )

    expect(await disperse.distributionCount()).to.eq(1n)
  })

  it('emits DistributionCreated with correct recipientCount', async function () {
    const encA = await encryptAmount(disperseAddress, actors.distributor, 200n)
    const encB = await encryptAmount(disperseAddress, actors.distributor, 300n)

    await expect(
      disperse.connect(actors.distributor).createDistribution(
        tokenAddress,
        [actors.alice.address, actors.bob.address],
        [encA.handles[0], encB.handles[0]],
        [encA.inputProof, encB.inputProof],
        { cliff: 0n, linear: 0n },
      ),
    )
      .to.emit(disperse, 'DistributionCreated')
      .withArgs(0n, actors.distributor.address, tokenAddress, 2n)
  })

  it('reverts on empty recipients', async function () {
    await expect(
      disperse
        .connect(actors.distributor)
        .createDistribution(tokenAddress, [], [], [], { cliff: 0n, linear: 0n }),
    ).to.be.revertedWith('AnimaDisperse: empty recipients')
  })

  it('reverts on mismatched array lengths', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    await expect(
      disperse.connect(actors.distributor).createDistribution(
        tokenAddress,
        [actors.alice.address, actors.bob.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      ),
    ).to.be.revertedWith('AnimaDisperse: length mismatch amounts')
  })

  // ── requestDecryptPermit ────────────────────────────────────────────────────

  it('requestDecryptPermit emits DecryptPermitGranted', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 500n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    await expect(disperse.connect(actors.alice).requestDecryptPermit(0n))
      .to.emit(disperse, 'DecryptPermitGranted')
      .withArgs(0n, actors.alice.address)
  })

  it('alice can decrypt her allocation after requestDecryptPermit', async function () {
    const AMOUNT = 750n
    const enc = await encryptAmount(disperseAddress, actors.distributor, AMOUNT)

    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    tx = await disperse.connect(actors.alice).requestDecryptPermit(0n)
    await tx.wait()

    const encHandle = await disperse.connect(actors.alice).getAllocation(0n)
    const clearAmount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      disperseAddress,
      actors.alice,
    )

    expect(clearAmount).to.eq(AMOUNT)
  })

  it('bob cannot decrypt alice allocation without permit', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    const encHandle = await disperse.connect(actors.alice).getAllocation(0n)

    // userDecryptEuint with bob's signer — should fail (no FHE.allow for bob)
    await expect(
      fhevm.userDecryptEuint(FhevmType.euint64, encHandle, disperseAddress, actors.bob),
    ).to.be.reverted
  })

  // ── claim ────────────────────────────────────────────────────────────────────

  it('alice can claim her allocation', async function () {
    const AMOUNT = 1_000n
    const enc = await encryptAmount(disperseAddress, actors.distributor, AMOUNT)

    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    tx = await disperse.connect(actors.alice).requestDecryptPermit(0n)
    await tx.wait()

    await expect(disperse.connect(actors.alice).claim(0n))
      .to.emit(disperse, 'Claimed')
      .withArgs(0n, actors.alice.address)

    expect(await disperse.claimed(0n, actors.alice.address)).to.eq(true)
  })

  it('double claim reverts', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    tx = await disperse.connect(actors.alice).claim(0n)
    await tx.wait()

    await expect(disperse.connect(actors.alice).claim(0n)).to.be.revertedWith(
      'AnimaDisperse: already claimed',
    )
  })

  // ── vesting cliff ────────────────────────────────────────────────────────────

  it('claim reverts before cliff is reached', async function () {
    const CLIFF = 7 * 24 * 3600 // 7 days in seconds
    const enc = await encryptAmount(disperseAddress, actors.distributor, 500n)

    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: BigInt(CLIFF), linear: 0n },
      )
    await tx.wait()

    await expect(disperse.connect(actors.alice).claim(0n)).to.be.revertedWith(
      'AnimaDisperse: cliff not reached',
    )
  })

  it('claim succeeds after cliff', async function () {
    const CLIFF = 3600 // 1 hour
    const enc = await encryptAmount(disperseAddress, actors.distributor, 500n)

    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: BigInt(CLIFF), linear: 0n },
      )
    await tx.wait()

    await timeTravel(CLIFF + 1)

    await expect(disperse.connect(actors.alice).claim(0n))
      .to.emit(disperse, 'Claimed')
      .withArgs(0n, actors.alice.address)
  })

  // ── vesting linear ───────────────────────────────────────────────────────────

  it('linear vesting — claiming at 50% vested returns ~half allocation', async function () {
    const AMOUNT = 1_000n
    const LINEAR = 3600 * 24 * 30 // 30 days
    const enc = await encryptAmount(disperseAddress, actors.distributor, AMOUNT)

    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: BigInt(LINEAR) },
      )
    await tx.wait()

    // Fast-forward 15 days = 50% of linear
    await timeTravel(Math.floor(LINEAR / 2))

    tx = await disperse.connect(actors.alice).requestDecryptPermit(0n)
    await tx.wait()

    tx = await disperse.connect(actors.alice).claim(0n)
    await tx.wait()

    // The allocation remaining should be ~half (within 1% tolerance due to FHE shift)
    const encHandle = await disperse.connect(actors.alice).getAllocation(0n)
    const remaining = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      disperseAddress,
      actors.alice,
    )

    // ~500 remaining — allow ±10 for FHE shift arithmetic rounding
    expect(remaining).to.be.gte(490n)
    expect(remaining).to.be.lte(510n)
  })

  // ── cancel ────────────────────────────────────────────────────────────────────

  it('distributor can cancel and distribution becomes inactive', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 200n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    const encCancel = await encryptAmount(disperseAddress, actors.distributor, 200n)
    tx = await disperse
      .connect(actors.distributor)
      .cancel(
        0n,
        [actors.alice.address],
        [encCancel.handles[0]],
        [encCancel.inputProof],
      )
    await tx.wait()

    const [, , , , active] = await disperse.getDistribution(0n)
    expect(active).to.eq(false)
  })

  it('non-distributor cannot cancel', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    const encCancel = await encryptAmount(disperseAddress, actors.alice, 100n)
    await expect(
      disperse.connect(actors.alice).cancel(0n, [actors.alice.address], [encCancel.handles[0]], [encCancel.inputProof]),
    ).to.be.revertedWith('AnimaDisperse: not distributor')
  })

  it('claim reverts on inactive distribution', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address],
        [enc.handles[0]],
        [enc.inputProof],
        { cliff: 0n, linear: 0n },
      )
    await tx.wait()

    const encCancel = await encryptAmount(disperseAddress, actors.distributor, 100n)
    tx = await disperse
      .connect(actors.distributor)
      .cancel(0n, [actors.alice.address], [encCancel.handles[0]], [encCancel.inputProof])
    await tx.wait()

    await expect(disperse.connect(actors.alice).claim(0n)).to.be.revertedWith(
      'AnimaDisperse: inactive distribution',
    )
  })

  // ── getDistribution ──────────────────────────────────────────────────────────

  it('getDistribution returns correct metadata', async function () {
    const enc = await encryptAmount(disperseAddress, actors.distributor, 100n)
    let tx = await disperse
      .connect(actors.distributor)
      .createDistribution(
        tokenAddress,
        [actors.alice.address, actors.bob.address],
        [enc.handles[0], enc.handles[0]],
        [enc.inputProof, enc.inputProof],
        { cliff: 86400n, linear: 604800n },
      )
    await tx.wait()

    const [retToken, retDistributor, , retCount, retActive, retCliff, retLinear] =
      await disperse.getDistribution(0n)

    expect(retToken.toLowerCase()).to.eq(tokenAddress.toLowerCase())
    expect(retDistributor.toLowerCase()).to.eq(actors.distributor.address.toLowerCase())
    expect(retCount).to.eq(2n)
    expect(retActive).to.eq(true)
    expect(retCliff).to.eq(86400n)
    expect(retLinear).to.eq(604800n)
  })
})
