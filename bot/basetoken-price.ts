import axios from 'axios';
import AsyncLock from 'async-lock';

import config from './config';
import log from './log';

const lock = new AsyncLock();

let avaxusdprice = 0;

// clear avax price every hour
setInterval(() => {
  lock
    .acquire('avax-usd-price', () => {
      avaxusdprice = 0;
      return;
    })
    .then(() => {});
}, 3600000);

// clear avax price every hour
export async function getBnbPrice(): Promise<number> {
  return await lock.acquire('avax-usd-price', async () => {
    if (avaxusdprice !== 0) {
      return avaxusdprice;
    }
    const res = await axios.get(config.avaScanUrl);
    avaxusdprice = parseFloat(res.data['avalanche-2'].usd);
    log.info(`AVAX price: $${avaxusdprice}`);
    return avaxusdprice;
  });
}