import { ethers, run } from 'hardhat';

import deployer from '../.secret';

// WBNB address on BSC, WETH address on ETH, WAVAX on AVAX
const WethAddr = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

async function main() {
  await run('compile');
  let currentProvider = await ethers.provider.getNetwork()
  const FlashBot = await ethers.getContractFactory('FlashBot');
  const flashBot = await FlashBot.deploy(WethAddr);

  console.log(JSON.stringify(currentProvider, null, 4));
  console.log(`FlashBot deployed to ${flashBot.address}, current provider ${currentProvider}`);

}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
