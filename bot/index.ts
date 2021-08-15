import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import pool from '@ricokahler/pool';
import AsyncLock from 'async-lock';

import { FlashBot } from '../typechain/FlashBot';
import { Network, tryLoadPairs, getTokens } from './tokens';
import { getAvaxPrice } from './basetoken-price';
import log from './log';
import config from './config';

import util = require('util')

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calcNetProfit(profitWei: BigNumber, address: string, baseTokens: Tokens): Promise<number> {
  let price = 1;
  if (baseTokens.wavax.address == address) {
    price = await getAvaxPrice();
  }
  let profit = parseFloat(ethers.utils.formatEther(profitWei));
  profit = profit * price;

  const gasCost = price * parseFloat(ethers.utils.formatEther(config.gasPrice)) * (config.gasLimit as number);
  log.info("internal.profit: ", profit)
  return profit - gasCost;
  // return profit;
}

function arbitrageFunc(flashBot: FlashBot, baseTokens: Tokens) {
  const lock = new AsyncLock({ timeout: 2000, maxPending: 20 });
  // log.info("arbitrageFunc() is visited;")
  return async function arbitrage(pair: ArbitragePair) {
    // log.info("arbitrageFunc()->arbitrage() is visited;")
    const [pair0, pair1] = pair.pairs;

    let res: [BigNumber, string] & {
      profit: BigNumber;
      baseToken: string;
    };
    try {
      // log.info("inside arbitrageFunc()->arbitrage() before flashBot.getProfit()")
      // const flashBotFactoryAbi = ['function getPair(address, address) view returns (address pair)'];
      // const flashBotFactory = new ethers.Contract("0xee59707CD2a6aF9b8c6B2ABC36f58732505f64D0", flashBotFactoryAbi, ethers.provider);
      // const gasEstimate = flashBotFactory.estimateGas.getProfit(pair0, pair1);
      // log.info("gasEstimate for flashBot.getProfit()", gasEstimate);
      res = await flashBot.getProfit(pair0, pair1);
      log.info(`Profit on ${pair.symbols}: ${ethers.utils.formatEther(res.profit)}`);
      log.debug(`Profit on ${pair.symbols}: ${ethers.utils.formatEther(res.profit)}`);
    } catch (err) {
      // log.info(err);
      log.debug(err);
      return;
    }
    if (res.profit.gt(BigNumber.from('0'))) {
      const netProfit = await calcNetProfit(res.profit, res.baseToken, baseTokens);
      if (netProfit < config.minimumProfit) {
        return;
      }

      log.info(`Calling flash arbitrage, net profit: ${netProfit}`);
      try {
        // lock to prevent tx nonce overlap
        await lock.acquire('flash-bot', async () => {
          const response = await flashBot.flashArbitrage(pair0, pair1, {
            gasPrice: config.gasPrice,
            gasLimit: config.gasLimit,
          });
          const receipt = await response.wait(1);
          log.info(`Tx: ${receipt.transactionHash}`);
        });
      } catch (err) {
        if (err.message === 'Too much pending tasks' || err.message === 'async-lock timed out') {
          return;
        }
        log.error(err);
      }
    }
  };
}

async function main() {
  const pairs = await tryLoadPairs(Network.AVAX);
  const flashBot = (await ethers.getContractAt('FlashBot', config.contractAddr)) as FlashBot;
  const [baseTokens] = getTokens(Network.AVAX);

  log.info('Start arbitraging');
  while (true) {

    // console.log('Current network / provider:')
    // const currentProvider = await ethers.provider.getNetwork()
    // console.log('Current network / provider, please: ', currentProvider)
    // console.log(JSON.stringify(ethers.providers.Provider, null, 4));

    // console.log(util.inspect(ethers.provider, {showHidden: false, depth: null}))
    // log.info('Current network / provider: ' + ethers.provider)
    
    await pool({
      collection: pairs,
      task: arbitrageFunc(flashBot, baseTokens),
      // maxConcurrency: config.concurrency,
    });
    await sleep(1000);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    log.error(err);
    process.exit(1);
  });
