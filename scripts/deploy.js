const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
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
    deployer: deployer.address
  };

  const output = path.join(__dirname, '..', 'src', 'deployments', 'local.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
