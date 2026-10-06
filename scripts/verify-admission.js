const hre = require('hardhat');
const deployment = require('../src/deployments/local.json');

async function main() {
  const [, alice, , gateStaff] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt('TicketMarketplaceV2', deployment.address, gateStaff);
  const nonce = hre.ethers.hexlify(hre.ethers.randomBytes(32));
  const latestBlock = await hre.ethers.provider.getBlock('latest');
  const deadline = BigInt(latestBlock.timestamp) + 300n;
  const digest = await contract.getRedemptionDigest(alice.address, 1, nonce, deadline);
  const signature = await alice.signMessage(hre.ethers.getBytes(digest));

  await (await contract.redeemTicket(alice.address, 1, nonce, deadline, signature)).wait();
  if (!(await contract.usedPasses(digest))) throw new Error('Pass was not marked as used');
  if ((await contract.balanceOf(alice.address, 1)) !== 1n) throw new Error('Exactly one available Alice ticket should remain');

  let replayRejected = false;
  try {
    await contract.redeemTicket(alice.address, 1, nonce, deadline, signature);
  } catch {
    replayRejected = true;
  }
  if (!replayRejected) throw new Error('Replay was not rejected');
  console.log(JSON.stringify({ holder: alice.address, tokenId: '1', passId: digest, redeemed: true, replayRejected }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
