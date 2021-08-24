import fs from 'fs';
import path from 'path';
import 'lodash.combinations';
import lodash from 'lodash';
import { Contract } from '@ethersproject/contracts';
import { ethers } from 'hardhat';

import log from './log';

export enum Network {
  AVAX = 'avax',
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const avaxBaseTokens: Tokens = {
  wavax: { symbol: 'WAVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
  usdt: { symbol: 'USDT', address: '0xde3A24028580884448a5397872046a019649b084'},
};

const avaxQuoteTokens: Tokens = {
  eth: { symbol: 'ETH', address: '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15'},
  dai: { symbol: 'DAI', address: '0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a'},
  png: { symbol: 'PNG', address: '0x60781C2586D68229fde47564546784ab3fACA982'},
  link: { symbol: 'LINK', address: '0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651'},
  wbtc: { symbol: 'WBTC', address: '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB'},
  usdt: { symbol: 'USDT', address: '0xde3A24028580884448a5397872046a019649b084'},
};

const avaxDexes: AmmFactories = {
  pangolin: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
  sushi: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  olive: '0x4Fe4D8b01A56706Bc6CaD26E8C59D0C7169976b3',
  lydia: '0xe0C1bb6DF4851feEEdc3E14Bd509FEAF428f7655',
};

function getFactories(network: Network): AmmFactories {
  switch (network) {
    case Network.AVAX:
      return avaxDexes;
    default:
      throw new Error(`Unsupported network:${network}`);
  }
}

export function getTokens(network: Network): [Tokens, Tokens] {
  switch (network) {
    case Network.AVAX:
      return [avaxBaseTokens, avaxQuoteTokens];
    default:
      throw new Error(`Unsupported network:${network}`);
  }
}

async function updatePairs(network: Network): Promise<ArbitragePair[]> {
  log.info('Updating arbitrage token pairs');
  const [baseTokens, quoteTokens] = getTokens(network);
  const factoryAddrs = getFactories(network);

  const factoryAbi = ['function getPair(address, address) view returns (address pair)'];
  let factories: Contract[] = [];

  log.info(`Fetch from dexes: ${Object.keys(factoryAddrs)}`);
  for (const key in factoryAddrs) {
    const addr = factoryAddrs[key];
    const factory = new ethers.Contract(addr, factoryAbi, ethers.provider);
    factories.push(factory);
  }

  let tokenPairs: TokenPair[] = [];
  for (const key in baseTokens) {
    const baseToken = baseTokens[key];
    for (const quoteKey in quoteTokens) {
      const quoteToken = quoteTokens[quoteKey];
      let tokenPair: TokenPair = { symbols: `${quoteToken.symbol}-${baseToken.symbol}`, pairs: [] };
      for (const factory of factories) {
        const pair = await factory.getPair(baseToken.address, quoteToken.address);
        if (pair != ZERO_ADDRESS) {
          tokenPair.pairs.push(pair);
        }
      }
      if (tokenPair.pairs.length >= 2) {
        tokenPairs.push(tokenPair);
      }
    }
  }

  let allPairs: ArbitragePair[] = [];
  for (const tokenPair of tokenPairs) {
    if (tokenPair.pairs.length < 2) {
      continue;
    } else if (tokenPair.pairs.length == 2) {
      allPairs.push(tokenPair as ArbitragePair);
    } else {
      // @ts-ignore
      const combinations = lodash.combinations(tokenPair.pairs, 2);
      for (const pair of combinations) {
        const arbitragePair: ArbitragePair = {
          symbols: tokenPair.symbols,
          pairs: pair,
        };
        allPairs.push(arbitragePair);
      }
    }
  }
  return allPairs;
}

function getPairsFile(network: Network) {
  return path.join(__dirname, `../pairs-${network}.json`);
}

export async function tryLoadPairs(network: Network): Promise<ArbitragePair[]> {
  let pairs: ArbitragePair[] | null;
  const pairsFile = getPairsFile(network);
  try {
    pairs = JSON.parse(fs.readFileSync(pairsFile, 'utf-8'));
    log.info('Load pairs from json');
  } catch (err) {
    pairs = null;
  }

  if (pairs) {
    return pairs;
  }
  pairs = await updatePairs(network);

  fs.writeFileSync(pairsFile, JSON.stringify(pairs, null, 2));
  return pairs;
}
