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
const contractAddr = '0xee59707CD2a6aF9b8c6B2ABC36f58732505f64D0'; // flash bot contract address - avax mainnet
// const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // flash bot contract address - avax mainnet fork
// const contractAddr = '0xCD8a1C3ba11CF5ECfa6267617243239504a98d90'; // flash bot contract address - ethereum mainnet fork

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
