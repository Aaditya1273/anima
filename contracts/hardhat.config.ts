/**
 * Hardhat config for Anima contracts.
 *
 * @fhevm/hardhat-plugin is only loaded for the local hardhat network.
 * On Sepolia (and any live network) it must be skipped — the plugin
 * intercepts estimateGas and crashes when its mock FHEVM node is absent.
 *
 * The FHE contracts compile fine without the plugin; the plugin is only
 * needed to run the mock FHEVM for local tests.
 */

import '@nomicfoundation/hardhat-toolbox'
import '@typechain/hardhat'
import * as dotenv from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'

dotenv.config({ path: '../apps/web/.env.local' })

// Only load the FHEVM plugin for local/test runs, not for live network deploys
const isLiveNetwork =
  process.argv.includes('sepolia') ||
  (process.env.HARDHAT_NETWORK ?? '') === 'sepolia'

if (!isLiveNetwork) {
  require('@fhevm/hardhat-plugin')
}

const SEPOLIA_RPC_URL    = process.env.SEPOLIA_RPC_URL    ?? 'https://rpc.sepolia.org'
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? ('0x' + '0'.repeat(64))
const ETHERSCAN_API_KEY  = process.env.ETHERSCAN_API_KEY  ?? ''

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'cancun',
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: './src',
    tests:   './test',
    cache:   './cache',
    artifacts: './artifacts',
    scripts: './scripts',
  },
}

export default config
