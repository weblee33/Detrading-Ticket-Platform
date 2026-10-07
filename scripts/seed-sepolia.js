const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function confirm(label, transaction) {
  console.log(`${label}: ${transaction.hash}`);
  await transaction.wait(Number(process.env.SEPOLIA_CONFIRMATIONS || 1));
}

async function main() {
  if (hre.network.name !== 'sepolia') throw new Error('This script only supports the Sepolia network.');
  const deploymentPath = path.join(__dirname, '..', 'src', 'deployments', 'sepolia.json');
  if (!fs.existsSync(deploymentPath)) throw new Error('Run npm run deploy:sepolia before seeding.');
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  if (deployment.chainId !== '0xaa36a7') throw new Error('Deployment file is not for Sepolia.');

  const seller = process.env.DEMO_SELLER_ADDRESS;
  const buyer = process.env.DEMO_BUYER_ADDRESS;
  const gateStaff = process.env.DEMO_GATE_STAFF_ADDRESS;
  const metadataURI = process.env.DEMO_METADATA_URI || 'https://raw.githubusercontent.com/weblee33/Detrading-Ticket-Platform/main/public/metadata.json';
  const [organizer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt('TicketMarketplaceV2', deployment.address, organizer);

  if ((await contract.owner()).toLowerCase() !== organizer.address.toLowerCase()) {
    throw new Error('Configured deployer is not the owner of this Sepolia contract.');
  }

  if (await contract.nextTokenId() !== 1n) {
    throw new Error('This deployment already contains ticket types. Refusing to seed it twice.');
  }

  await confirm('Authorize gate staff', await contract.setGateStaff(gateStaff, true));
  await confirm('Mint VIP tickets to Alice', await contract.createTicketTypeAndMint(
    'Detrading Demo Concert', '2026-12-20 19:30', 'VIP', metadataURI, 3, seller
  ));
  await confirm('Mint general tickets to Bob', await contract.createTicketTypeAndMint(
    'Detrading Demo Concert', '2026-12-20 19:30', 'General Admission', metadataURI, 5, buyer
  ));

  console.log(JSON.stringify({
    contract: deployment.address,
    organizer: organizer.address,
    seller,
    buyer,
    gateStaff,
    note: 'Alice must create the resale listing interactively so her private key never enters this script.'
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
