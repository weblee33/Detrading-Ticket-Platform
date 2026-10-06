const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('TicketMarketplaceV2', function () {
  async function deployFixture() {
    const [organizer, alice, bob, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('TicketMarketplaceV2');
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, organizer, alice, bob, other };
  }

  async function mintedFixture() {
    const context = await deployFixture();
    const { contract, alice } = context;
    await contract.createTicketTypeAndMint(
      'Demo Concert', '2026-12-20 19:30', 'VIP', 'ipfs://demo-metadata', 3, alice.address
    );
    return context;
  }

  async function listedFixture() {
    const context = await mintedFixture();
    const { contract, alice } = context;
    const address = await contract.getAddress();
    await contract.connect(alice).setApprovalForAll(address, true);
    await contract.connect(alice).createListing(1, 2, ethers.parseEther('0.02'));
    return context;
  }

  it('allows only the organizer to create ticket types', async function () {
    const { contract, alice } = await loadFixture(deployFixture);
    await expect(contract.connect(alice).createTicketTypeAndMint(
      'Demo', '2026-12-20', 'VIP', 'ipfs://meta', 1, alice.address
    )).to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount');
  });

  it('mints a new ticket type with metadata and supply', async function () {
    const { contract, alice } = await loadFixture(mintedFixture);
    expect(await contract.balanceOf(alice.address, 1)).to.equal(3);
    expect(await contract['totalSupply(uint256)'](1)).to.equal(3);
    expect(await contract.uri(1)).to.equal('ipfs://demo-metadata');
    const info = await contract.ticketInfos(1);
    expect(info.eventName).to.equal('Demo Concert');
    expect(await contract.nextTokenId()).to.equal(2);
  });

  it('rejects zero quantities and invalid recipients', async function () {
    const { contract, alice } = await loadFixture(deployFixture);
    await expect(contract.createTicketTypeAndMint(
      'Demo', '2026-12-20', 'VIP', 'ipfs://meta', 0, alice.address
    )).to.be.revertedWithCustomError(contract, 'InvalidAmount');
    await expect(contract.createTicketTypeAndMint(
      'Demo', '2026-12-20', 'VIP', 'ipfs://meta', 1, ethers.ZeroAddress
    )).to.be.revertedWithCustomError(contract, 'InvalidRecipient');
  });

  it('requires marketplace approval before listing', async function () {
    const { contract, alice } = await loadFixture(mintedFixture);
    await expect(contract.connect(alice).createListing(1, 1, 100))
      .to.be.revertedWithCustomError(contract, 'MarketplaceNotApproved');
  });

  it('escrows listed tickets', async function () {
    const { contract, alice } = await loadFixture(listedFixture);
    const address = await contract.getAddress();
    expect(await contract.balanceOf(alice.address, 1)).to.equal(1);
    expect(await contract.balanceOf(address, 1)).to.equal(2);
    const listing = await contract.listings(1);
    expect(listing.seller).to.equal(alice.address);
    expect(listing.amount).to.equal(2);
  });

  it('rejects listings above the seller balance', async function () {
    const { contract, alice } = await loadFixture(mintedFixture);
    const address = await contract.getAddress();
    await contract.connect(alice).setApprovalForAll(address, true);
    await expect(contract.connect(alice).createListing(1, 4, 100))
      .to.be.revertedWithCustomError(contract, 'InsufficientTicketBalance');
  });

  it('requires exact payment and transfers escrowed tickets', async function () {
    const { contract, alice, bob } = await loadFixture(listedFixture);
    const price = ethers.parseEther('0.02');
    await expect(contract.connect(bob).buy(1, 1, { value: price - 1n }))
      .to.be.revertedWithCustomError(contract, 'IncorrectPayment');

    await expect(() => contract.connect(bob).buy(1, 1, { value: price }))
      .to.changeEtherBalances([bob, alice], [-price, price]);
    expect(await contract.balanceOf(bob.address, 1)).to.equal(1);
    expect((await contract.listings(1)).amount).to.equal(1);
  });

  it('deletes a fully purchased listing', async function () {
    const { contract, bob } = await loadFixture(listedFixture);
    const total = ethers.parseEther('0.04');
    await contract.connect(bob).buy(1, 2, { value: total });
    expect((await contract.listings(1)).seller).to.equal(ethers.ZeroAddress);
    expect(await contract.balanceOf(bob.address, 1)).to.equal(2);
  });

  it('allows only the seller to cancel and returns escrow', async function () {
    const { contract, alice, bob } = await loadFixture(listedFixture);
    await expect(contract.connect(bob).cancelListing(1))
      .to.be.revertedWithCustomError(contract, 'NotListingSeller');
    await contract.connect(alice).cancelListing(1);
    expect(await contract.balanceOf(alice.address, 1)).to.equal(3);
    expect((await contract.listings(1)).seller).to.equal(ethers.ZeroAddress);
  });
});
