import { BigNumber, BigNumberish, utils } from 'ethers';

interface Config {
  contractAddr: string;
  logLevel: string;
  minimumProfit: number;
  gasPrice: BigNumber;
  gasLimit: BigNumberish;
  avaScanUrl: string;
  concurrency: number;
}

const contractAddr = '0xXXXXXXXXXXXXXXXXXXXXXX'; // flash bot contract address
const gasPrice = utils.parseUnits('10', 'gwei');
const gasLimit = 300000;

const avaScanApiKey = 'XXXXXXXXXXXXXXXX'; // bscscan API key
const avaScanUrl = `https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd`;

const config: Config = {
  contractAddr: contractAddr,
  logLevel: 'info',
  concurrency: 50,
  minimumProfit: 50, // in USD
  gasPrice: gasPrice,
  gasLimit: gasLimit,
  avaScanUrl: avaScanUrl,
};

export default config;
