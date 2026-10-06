const hre = require('hardhat');
const deployment = require('../src/deployments/local.json');

async function main() {
  if (!deployment.address) throw new Error('Deploy the v2 contract before seeding demo data.');
  const [organizer, alice, bob, gateStaff] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt('TicketMarketplaceV2', deployment.address, organizer);

  await (await contract.createTicketTypeAndMint(
    '2026 Demo Concert',
    '2026-12-20 19:30',
    'VIP',
    'http://localhost:3000/metadata.json',
    3,
    alice.address
  )).wait();
  await (await contract.createTicketTypeAndMint(
    '2026 Demo Concert',
    '2026-12-20 19:30',
    'General Admission',
    'http://localhost:3000/metadata.json',
    5,
    bob.address
  )).wait();

  const aliceContract = contract.connect(alice);
  await (await aliceContract.setApprovalForAll(deployment.address, true)).wait();
  await (await aliceContract.createListing(1, 1, hre.ethers.parseEther('0.02'))).wait();

  console.log(JSON.stringify({
    organizer: organizer.address,
    alice: alice.address,
    bob: bob.address,
    gateStaff: gateStaff.address,
    vipTokenId: '1',
    generalTokenId: '2',
    seededListingId: '1'
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
