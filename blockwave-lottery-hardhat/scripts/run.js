const main = async () => {
  // I get the wallet address of the contract owner and also
  // a random wallet address and called it `randomPerson`.
  // This can happen here thanks to the magic that Hardhat runs in the background.
  const [owner, randomPerson] = await hre.ethers.getSigners();

  // This will actually compile our contract and generate the necessary files
  // we need to work with our contract under the `artifacts` directory.
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');

  // Hardhat will create a local Ethereum network for us, but just for this contract.
  // Every time you run the contract, it'll be a fresh blockchain.
  // This will deploy my contract and fund it with 0.1 ETH removed from my wallet.
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });

  // We'll wait until our contract is officially deployed to our local blockchain!
  // Our constructor runs when we actually deploy.
  await waveContract.deployed();

  // Once it's deployed `waveContract.address` will basically give us
  // the address of the deployed contract.
  console.log('Contract deployed to:', waveContract.address);

  // Just to see the address of the person deploying our contract.
  console.log('Contract deployed by:', owner.address);

  // Get Contract balance
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let waveCount;
  // Function to grab the # of total waves.
  waveCount = await waveContract.getTotalWaves();
  console.log(waveCount.toNumber());

  // Do the wave.
  const waveTxn = await waveContract.wave('This is wave #1');
  await waveTxn.wait();

  const waveTxn2 = await waveContract.wave('This is wave #2');
  await waveTxn2.wait();

  // Get Contract balance again.
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Run with `npx hardhat run scripts/run.js`
runMain();
