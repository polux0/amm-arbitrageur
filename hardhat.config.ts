import { task, HardhatUserConfig } from 'hardhat/config';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';

import deployer from './.secret';

// Binance

// const BSC_RPC = 'https://bsc-dataseed.binance.org/';
const BSC_RPC = 'https://bsc-dataseed1.defibit.io/';
const BSC_Tetsnet_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
// Avalanche

const FORK_FUJI = false
const FORK_MAINNET = false
const forkingData = FORK_FUJI ? {
  url: 'https://api.avax-test.network/ext/bc/C/rpc',
} : FORK_MAINNET ? {
  url: 'https://api.avax.network/ext/bc/C/rpc'
} : undefined


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.16"
      },
      {
        version: "0.6.2"
      },
      {
        version: "0.6.4"
      },
      {
        version: "0.7.0"
      },
      {
        version: '0.7.6'
      },
      {
        version: "0.7.0"
      },
      {
        version: "0.8.0"
      }
    ]
  },
  networks: {
    hardhat: {
      // loggingEnabled: true,
      forking: {
        url: BSC_RPC,
        enabled: true,
      },
      accounts: {
        accountsBalance: '1000000000000000000000000', // 1 mil ether
      },
    },
    bscTestnet: {
      url: BSC_Tetsnet_RPC,
      chainId: 0x61,
      accounts: [deployer.private],
    },
    bsc: {
      url: BSC_RPC,
      chainId: 0x38,
      accounts: [deployer.private],
    },
    avash: {
      url: 'http://localhost:9650/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43112,
      accounts: [
        "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027",
        "0x7b4198529994b0dc604278c99d153cfd069d594753d471171a1d102a10438e07",
        "0x15614556be13730e9e8d6eacc1603143e7b96987429df8726384c2ec4502ef6e",
        "0x31b571bf6894a248831ff937bb49f7754509fe93bbd2517c9c73c4144c0e97dc",
        "0x6934bef917e01692b789da754a0eae31a8536eb465e7bff752ea291dad88c675",
        "0xe700bdbdbc279b808b1ec45f8c2370e4616d3a02c336e68d85d4668e08f53cff",
        "0xbbc2865b76ba28016bc2255c7504d000e046ae01934b04c694592a6276988630",
        "0xcdbfd34f687ced8c6968854f8a99ae47712c4f4183b78dcc4a903d1bfe8cbf60",
        "0x86f78c5416151fe3546dece84fda4b4b1e36089f2dbc48496faf3a950f16157c",
        "0x750839e9dbbd2a0910efe40f50b2f3b2f2f59f5580bb4b83bd8c1201cf9a010a"
      ]
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: [
        "0xc6081cae5ee2b8431e1e70b5e8684154495bfe53f0302ec297efa5ebde3329ca"
      ]
    },
    mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [
        "0x5e83a7109e2c2c3e6c8c60124714737660c18b75bbfa22f9e4dd031064657956"
      ]
    }

  },
  mocha: {
    timeout: 40000,
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = config;