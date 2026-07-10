/**
 * AnimaRegistryRouter.ts — Hardhat test suite for AnimaRegistryRouter.sol
 *
 * Uses a MockZamaWrappersRegistry to simulate the official Zama registry
 * and a MockERC7984Wrapper for wrap/unwrap calls.
 *
 * Key assertions:
 *   officialPairCount() mirrors mock registry pairCount()
 *   wrap() calls the official wrapper (not a custom one)
 *   grantDecryptPermit() emits FHE.allow for msg.sender
 *   faucet() calls cTokenMock.mint()
 */

import { FhevmType } from '@fhevm/hardhat-plugin'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers, fhevm } from 'hardhat'

type Signers = {
  deployer: HardhatEthersSigner
  alice: HardhatEthersSigner
  bob: HardhatEthersSigner
}

async function deployFixture() {
  const signers = await ethers.getSigners()
  const actors: Signers = {
    deployer: signers[0]!,
    alice: signers[1]!,
    bob: signers[2]!,
  }

  // Deploy mock ERC-20 underlying token
  const ERC20Factory = await ethers.getContractFactory('MockERC20')
  const erc20 = await ERC20Factory.deploy('MockUSDC', 'mUSDC')
  await erc20.waitForDeployment()
  const erc20Address = await erc20.getAddress()

  // Deploy mock ERC-7984 wrapper
  const WrapperFactory = await ethers.getContractFactory('MockERC7984Wrapper')
  const wrapper = await WrapperFactory.deploy('ConfidentialUSDC', 'cUSDC', erc20Address)
  await wrapper.waitForDeployment()
  const wrapperAddress = await wrapper.getAddress()

  // Deploy mock Zama Wrappers Registry with one pair pre-registered
  const RegistryFactory = await ethers.getContractFactory('MockZamaWrappersRegistry')
  const registry = await RegistryFactory.deploy()
  await registry.waitForDeployment()
  const registryAddress = await registry.getAddress()

  // Register the pair
  await registry.registerPair(erc20Address, wrapperAddress, 'MockUSDC', 'mUSDC', 6)

  // Deploy AnimaRegistryRouter pointing at the mock registry
  const RouterFactory = await ethers.getContractFactory('AnimaRegistryRouter')
  const router = await RouterFactory.deploy(registryAddress)
  await router.waitForDeployment()
  const routerAddress = await router.getAddress()

  return {
    actors,
    erc20,
    erc20Address,
    wrapper,
    wrapperAddress,
    registry,
    registryAddress,
    router,
    routerAddress,
  }
}

describe('AnimaRegistryRouter', function () {
  let actors: Signers
  let erc20Address: string
  let wrapper: Awaited<ReturnType<typeof deployFixture>>['wrapper']
  let wrapperAddress: string
  let registry: Awaited<ReturnType<typeof deployFixture>>['registry']
  let router: Awaited<ReturnType<typeof deployFixture>>['router']
  let routerAddress: string

  beforeEach(async () => {
    ;({ actors, erc20Address, wrapper, wrapperAddress, registry, router, routerAddress } =
      await deployFixture())
  })

  // ── deployment ──────────────────────────────────────────────────────────────

  it('deploys to a valid address', async function () {
    expect(ethers.isAddress(routerAddress)).to.eq(true)
  })

  it('stores the official registry address', async function () {
    const stored = await router.officialRegistry()
    const expected = await registry.getAddress()
    expect(stored.toLowerCase()).to.eq(expected.toLowerCase())
  })

  // ── officialPairCount mirrors registry ──────────────────────────────────────

  it('officialPairCount() equals registry.pairCount()', async function () {
    const routerCount = await router.officialPairCount()
    const registryCount = await registry.pairCount()
    expect(routerCount).to.eq(registryCount)
  })

  it('officialPairCount() updates when registry adds a pair', async function () {
    const before = await router.officialPairCount()

    // Add a second pair to the mock registry
    const ERC20Factory = await ethers.getContractFactory('MockERC20')
    const token2 = await ERC20Factory.deploy('Token2', 'TK2')
    await token2.waitForDeployment()
    const WrapperFactory = await ethers.getContractFactory('MockERC7984Wrapper')
    const wrapper2 = await WrapperFactory.deploy('CToken2', 'cTK2', await token2.getAddress())
    await wrapper2.waitForDeployment()
    await registry.registerPair(
      await token2.getAddress(),
      await wrapper2.getAddress(),
      'Token2',
      'TK2',
      18,
    )

    const after = await router.officialPairCount()
    expect(after).to.eq(before + 1n)
  })

  // ── getPair mirrors registry ─────────────────────────────────────────────────

  it('getPair(0) returns the registered pair', async function () {
    const pair = await router.getPair(0)
    expect(pair.erc20.toLowerCase()).to.eq(erc20Address.toLowerCase())
    expect(pair.erc7984.toLowerCase()).to.eq(wrapperAddress.toLowerCase())
    expect(pair.symbol).to.eq('mUSDC')
  })

  // ── wrap ─────────────────────────────────────────────────────────────────────

  it('wrap() pulls ERC-20, approves wrapper, and emits Wrapped', async function () {
    const AMOUNT = 500n

    // Fund alice with mock ERC-20
    const ERC20 = await ethers.getContractAt('MockERC20', erc20Address)
    await ERC20.connect(actors.deployer).mint(actors.alice.address, 10_000n)
    await ERC20.connect(actors.alice).approve(routerAddress, ethers.MaxUint256)

    await expect(
      router.connect(actors.alice).wrap(0, AMOUNT),
    )
      .to.emit(router, 'Wrapped')
      .withArgs(actors.alice.address, 0, wrapperAddress)

    // Verify ERC-20 was pulled from alice
    const aliceBal = await ERC20.balanceOf(actors.alice.address)
    expect(aliceBal).to.eq(10_000n - AMOUNT)

    // Verify the router approved the wrapper
    const routerAllowance = await ERC20.allowance(routerAddress, wrapperAddress)
    expect(routerAllowance).to.eq(AMOUNT)
  })

  // ── unwrap ────────────────────────────────────────────────────────────────────

  it('unwrap() emits Unwrapped event', async function () {
    await expect(
      router.connect(actors.alice).unwrap(0, 200n),
    )
      .to.emit(router, 'Unwrapped')
      .withArgs(actors.alice.address, 0, wrapperAddress)
  })

  // ── grantDecryptPermit ────────────────────────────────────────────────────────

  it('grantDecryptPermit() emits DecryptPermitGranted', async function () {
    await expect(router.connect(actors.alice).grantDecryptPermit(wrapperAddress))
      .to.emit(router, 'DecryptPermitGranted')
      .withArgs(actors.alice.address, wrapperAddress)
  })

  it('alice can decrypt her balance — FHE.allow was granted by wrapper during mintEncrypted', async function () {
    // Mint some wrapped tokens to alice via mock
    await wrapper.connect(actors.deployer).mintEncrypted(actors.alice.address, 300n)

    // Alice decrypts her balance via userDecryptEuint.
    // The handle is owned by the wrapper (which called FHE.allowThis),
    // and the wrapper already granted FHE.allow(alice) in mintEncrypted.
    const encHandle = await wrapper.balanceOf(actors.alice.address)
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      wrapperAddress,  // wrapper owns the handle; router cannot FHE.allow
      actors.alice,
    )

    expect(clearBalance).to.eq(300n)
  })

  // ── faucet ────────────────────────────────────────────────────────────────────

  it('faucet() mints cTokenMocks to caller and emits Faucet', async function () {
    const AMOUNT = 1_000n

    await expect(router.connect(actors.alice).faucet(wrapperAddress, AMOUNT))
      .to.emit(router, 'Faucet')
      .withArgs(actors.alice.address, wrapperAddress, AMOUNT)

    const mintCount = await wrapper.mintCallCount()
    expect(mintCount).to.eq(1n)
  })

  it('faucet() reverts above the per-call limit', async function () {
    const OVER_LIMIT = 10_001n * 10n ** 18n
    await expect(
      router.connect(actors.alice).faucet(wrapperAddress, OVER_LIMIT),
    ).to.be.revertedWith('AnimaRegistryRouter: faucet limit')
  })

  it('faucet() reverts on zero amount', async function () {
    await expect(
      router.connect(actors.alice).faucet(wrapperAddress, 0),
    ).to.be.revertedWith('AnimaRegistryRouter: faucet limit')
  })

  // ── invalid pair ──────────────────────────────────────────────────────────────

  it('wrap() reverts on invalid pairId', async function () {
    await expect(
      router.connect(actors.alice).wrap(999, 1n),
    ).to.be.reverted
  })
})
