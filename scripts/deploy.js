const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  const isLocal = hre.network.name === 'localhost' || hre.network.name === 'hardhat';
  if (!isLocal && process.env.ALLOW_TESTNET_DEPLOY !== 'true') {
    throw new Error('Public testnet deployment is locked. Set ALLOW_TESTNET_DEPLOY=true after reviewing the target network.');
  }
  const [deployer] = await hre.ethers.getSigners();
  const TicketMarketplaceV2 = await hre.ethers.getContractFactory('TicketMarketplaceV2');
  const contract = await TicketMarketplaceV2.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const deployment = {
    contract: 'TicketMarketplaceV2',
    address,
    chainId: `0x${network.chainId.toString(16)}`,
    deployer: deployer.address,
    ...(!isLocal ? {
      network: hre.network.name,
      transactionHash: contract.deploymentTransaction()?.hash || ''
    } : {})
  };

  const deploymentName = isLocal ? 'local' : hre.network.name;
  const output = path.join(__dirname, '..', 'src', 'deployments', `${deploymentName}.json`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(JSON.stringify(deployment, null, 2));
  if (!isLocal) {
    console.log('\nFrontend hosting variables:');
    console.log(`REACT_APP_CHAIN_ID=${deployment.chainId}`);
    console.log(`REACT_APP_CONTRACT_ADDRESS=${deployment.address}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
