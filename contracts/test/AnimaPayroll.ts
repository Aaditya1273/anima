/**
 * AnimaPayroll.ts — Hardhat test suite for AnimaPayroll.sol
 *
 * Tests the full FHE pattern:
 *   fhevm.createEncryptedInput → encrypt → handles[0] + inputProof
 *   → contract call → fhevm.userDecryptEuint → assert plaintext
 *
 * Every test deploys a fresh MockFHERC20 and AnimaPayroll instance.
 * The mock is a minimal ERC-7984-compatible test double that stores
 * euint64 balances and accepts encrypted transferFrom / transfer calls.
 */

import { FhevmType } from '@fhevm/hardhat-plugin'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers, fhevm } from 'hardhat'

// ─── Types ────────────────────────────────────────────────────────────────────

type Signers = {
  deployer: HardhatEthersSigner
  cfo: HardhatEthersSigner
  alice: HardhatEthersSigner
  bob: HardhatEthersSigner
  auditor: HardhatEthersSigner
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

async function deployFixture() {
  const signers = await ethers.getSigners()
  const actors: Signers = {
    deployer: signers[0]!,
    cfo: signers[1]!,
    alice: signers[2]!,
    bob: signers[3]!,
    auditor: signers[4]!,
  }

  // Deploy mock ERC-7984 token
  const MockFactory = await ethers.getContractFactory('MockFHERC20')
  const token = await MockFactory.connect(actors.deployer).deploy('MockUSDC', 'mUSDC')
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()

  // Deploy AnimaPayroll
  const PayrollFactory = await ethers.getContractFactory('AnimaPayroll')
  const payroll = await PayrollFactory.connect(actors.deployer).deploy()
  await payroll.waitForDeployment()
  const payrollAddress = await payroll.getAddress()

  return { actors, token, tokenAddress, payroll, payrollAddress }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('AnimaPayroll', function () {
  let actors: Signers
  let token: Awaited<ReturnType<typeof deployFixture>>['token']
  let tokenAddress: string
  let payroll: Awaited<ReturnType<typeof deployFixture>>['payroll']
  let payrollAddress: string

  beforeEach(async () => {
    ;({ actors, token, tokenAddress, payroll, payrollAddress } = await deployFixture())
  })

  // ── deployment ──────────────────────────────────────────────────────────────

  it('deploys to a valid address', async function () {
    expect(ethers.isAddress(payrollAddress)).to.eq(true)
  })

  it('alice has zero balance after deployment', async function () {
    const handle = await payroll.connect(actors.alice).getBalance(tokenAddress)
    // Uninitialized euint64 handle is bytes32(0)
    expect(handle).to.eq(ethers.ZeroHash)
  })

  // ── grantObserver ───────────────────────────────────────────────────────────

  it('CFO can grant an observer', async function () {
    const tx = await payroll
      .connect(actors.cfo)
      .grantObserver(actors.auditor.address, true)
    await tx.wait()

    const active = await payroll.isObserver(actors.cfo.address, actors.auditor.address)
    expect(active).to.eq(true)
  })

  it('CFO can revoke an observer', async function () {
    let tx = await payroll.connect(actors.cfo).grantObserver(actors.auditor.address, true)
    await tx.wait()
    tx = await payroll.connect(actors.cfo).grantObserver(actors.auditor.address, false)
    await tx.wait()

    const active = await payroll.isObserver(actors.cfo.address, actors.auditor.address)
    expect(active).to.eq(false)
  })

  // ── paySalary ───────────────────────────────────────────────────────────────

  it('CFO pays salary — alice balance increases', async function () {
    const SALARY = 1_000n

    // Fund CFO with mock tokens
    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)

    // CFO encrypts the salary amount bound to payroll contract + cfo address
    const encInput = await fhevm
      .createEncryptedInput(payrollAddress, actors.cfo.address)
      .add64(SALARY)
      .encrypt()

    // CFO approves the payroll contract to pull tokens
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    // Pay salary
    const tx = await payroll
      .connect(actors.cfo)
      .paySalary(
        tokenAddress,
        actors.alice.address,
        encInput.handles[0],
        encInput.inputProof,
      )
    await tx.wait()

    // Read alice's encrypted balance
    const encHandle = await payroll.connect(actors.alice).getBalance(tokenAddress)

    // Decrypt — alice has FHE.allow permission set by paySalary
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      payrollAddress,
      actors.alice,
    )

    expect(clearBalance).to.eq(SALARY)
  })

  it('auditor can decrypt salary after grantObserver', async function () {
    const SALARY = 500n

    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    // Grant auditor before paying salary
    let tx = await payroll.connect(actors.cfo).grantObserver(actors.auditor.address, true)
    await tx.wait()

    const encInput = await fhevm
      .createEncryptedInput(payrollAddress, actors.cfo.address)
      .add64(SALARY)
      .encrypt()

    tx = await payroll
      .connect(actors.cfo)
      .paySalary(
        tokenAddress,
        actors.alice.address,
        encInput.handles[0],
        encInput.inputProof,
      )
    await tx.wait()

    // Auditor decrypts alice's balance
    const encHandle = await payroll.connect(actors.alice).getBalance(tokenAddress)
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      payrollAddress,
      actors.auditor,
    )

    expect(clearBalance).to.eq(SALARY)
  })

  it('two salary payments accumulate correctly', async function () {
    const FIRST = 300n
    const SECOND = 700n

    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    for (const amount of [FIRST, SECOND]) {
      const enc = await fhevm
        .createEncryptedInput(payrollAddress, actors.cfo.address)
        .add64(amount)
        .encrypt()
      const tx = await payroll
        .connect(actors.cfo)
        .paySalary(tokenAddress, actors.alice.address, enc.handles[0], enc.inputProof)
      await tx.wait()
    }

    const encHandle = await payroll.connect(actors.alice).getBalance(tokenAddress)
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      payrollAddress,
      actors.alice,
    )

    expect(clearBalance).to.eq(FIRST + SECOND)
  })

  // ── withdraw ────────────────────────────────────────────────────────────────

  it('alice can withdraw within her balance — balance decreases', async function () {
    const SALARY = 1_000n
    const WITHDRAW = 400n

    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    const encPay = await fhevm
      .createEncryptedInput(payrollAddress, actors.cfo.address)
      .add64(SALARY)
      .encrypt()
    let tx = await payroll
      .connect(actors.cfo)
      .paySalary(tokenAddress, actors.alice.address, encPay.handles[0], encPay.inputProof)
    await tx.wait()

    // Alice withdraws
    const encW = await fhevm
      .createEncryptedInput(payrollAddress, actors.alice.address)
      .add64(WITHDRAW)
      .encrypt()
    tx = await payroll
      .connect(actors.alice)
      .withdraw(tokenAddress, encW.handles[0], encW.inputProof)
    await tx.wait()

    const encHandle = await payroll.connect(actors.alice).getBalance(tokenAddress)
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      payrollAddress,
      actors.alice,
    )

    expect(clearBalance).to.eq(SALARY - WITHDRAW)
  })

  it('FHE guard — over-withdrawal leaves balance unchanged', async function () {
    const SALARY = 200n
    const OVER = 500n // more than balance

    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    const encPay = await fhevm
      .createEncryptedInput(payrollAddress, actors.cfo.address)
      .add64(SALARY)
      .encrypt()
    let tx = await payroll
      .connect(actors.cfo)
      .paySalary(tokenAddress, actors.alice.address, encPay.handles[0], encPay.inputProof)
    await tx.wait()

    const encW = await fhevm
      .createEncryptedInput(payrollAddress, actors.alice.address)
      .add64(OVER)
      .encrypt()
    tx = await payroll
      .connect(actors.alice)
      .withdraw(tokenAddress, encW.handles[0], encW.inputProof)
    await tx.wait()

    // Balance unchanged — FHE.select kept original value
    const encHandle = await payroll.connect(actors.alice).getBalance(tokenAddress)
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encHandle,
      payrollAddress,
      actors.alice,
    )

    expect(clearBalance).to.eq(SALARY)
  })

  // ── ObserverUpdated event ───────────────────────────────────────────────────

  it('emits ObserverUpdated on grant', async function () {
    await expect(
      payroll.connect(actors.cfo).grantObserver(actors.auditor.address, true),
    )
      .to.emit(payroll, 'ObserverUpdated')
      .withArgs(actors.cfo.address, actors.auditor.address, true)
  })

  it('emits SalaryPaid on paySalary', async function () {
    await token.connect(actors.deployer).mintClear(actors.cfo.address, 10_000n)
    await token.connect(actors.cfo).approveEncrypted(payrollAddress)

    const enc = await fhevm
      .createEncryptedInput(payrollAddress, actors.cfo.address)
      .add64(100n)
      .encrypt()

    await expect(
      payroll
        .connect(actors.cfo)
        .paySalary(tokenAddress, actors.alice.address, enc.handles[0], enc.inputProof),
    )
      .to.emit(payroll, 'SalaryPaid')
      .withArgs(actors.cfo.address, actors.alice.address, tokenAddress)
  })
})
