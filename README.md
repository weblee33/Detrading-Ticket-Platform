# Detrading-Ticket-Platform

## Overview

Detrading-Ticket-Platform is a decentralized NFT-based event ticketing platform built using Solidity (ERC1155), React.js, and Ethereum smart contracts. It aims to solve common issues in traditional ticketing systems such as scalping, counterfeiting, and lack of resale transparency by issuing blockchain-based event tickets that are verifiable, traceable, and tradable on-chain.

## Motivation

Conventional concert ticketing systems suffer from severe scalping, counterfeit tickets, and limited transparency in secondary sales. This platform provides a solution by leveraging blockchain to:

* **Ensure authenticity** of issued tickets
* **Track ownership history** transparently
* **Enable secure and flexible secondary market trading**

## Features

* **ERC-1155 Multi-Token Standard:** Efficient minting and management of multiple types of event tickets.
* **Minting by Event Organizer:** Only the owner can create and distribute new ticket types.
* **Custom Metadata:** Metadata includes event name, date, ticket type, and image URI (via IPFS).
* **On-chain Marketplace:** Users can list, buy, and cancel ticket listings on-chain.
* **React Frontend with MetaMask Integration:** User-friendly UI to interact with contracts and manage tickets.
* **Replay-resistant Admission:** Five-minute holder signatures, random nonces, authorized gate staff and one-time on-chain redemption.

## Smart Contract Details

> **Source availability:** this repository currently includes the frontend ABI but not the original Solidity source, deployment scripts, compiler settings or contract tests. The descriptions below document the expected interface and are not a completed smart-contract security audit.

### Key Data Structures:

```solidity
struct TicketInfo {
    string eventName;
    string eventDate;
    string ticketType;
    string metadataURI;
}

struct Listing {
    address seller;
    uint256 tokenId;
    uint256 amount;
    uint256 pricePerItem;
}
```

### Main Functions:

* `createTicketTypeAndMint(...)`: Mint a new type of NFT ticket.
* `createListing(...)`: List ticket for resale.
* `buy(...)`: Buy ticket from listing.
* `cancelListing(...)`: Cancel existing listing.
* `uri(...)`: Return the metadata URI of a given token.

### Events:

* `TicketCreated`, `Listed`, `Sale`, `Cancelled`

## Frontend (React.js)

The frontend is implemented in React.js using the `ethers.js` library for smart contract interaction.

### Key Components:

* **Wallet Connection** using MetaMask
* **Ticket Minting Form** for the event organizer
* **NFT Display Cards** with images fetched from IPFS
* **On-chain Listings with Buy/Cancel Functionality**

### How It Works:

* The user connects their MetaMask wallet.
* The owner can mint tickets by filling out event details.
* All users can view owned tickets and list them for sale.
* Other users can purchase available listings.

## Local setup

```bash
npm ci
cp .env.example .env.local
npm start
```

Set `REACT_APP_CHAIN_ID` and `REACT_APP_CONTRACT_ADDRESS` in `.env.local` to match your Ganache deployment. The app refuses to continue when the address has no deployed bytecode. Do not commit private keys or seed phrases.

Run verification with:

```bash
CI=true npm test -- --runInBand
npm run build
```

See `DEMO_GUIDE.md`, `REVIEW.md`, `TEST_RESULTS.md` and `NEXT_STEPS.md` for the verified workflow, known limitations and proposed extensions.

## Reproducible v2 demo contract

The `contracts/TicketMarketplaceV2.sol` implementation is a newly created demo contract, not a recovered copy of the original contract. It adds a reproducible Hardhat environment, escrowed listings, exact-payment purchases and automated contract tests.

```bash
npm run compile:contract
npm run test:contract
```

For the full local deployment and seeded demo sequence, see `CONTRACT_V2.md`.
For the QR admission trust model and security boundaries, see `ADMISSION_SECURITY.md`.

## Technologies Used

* **Solidity (ERC-1155)**
* **React.js + Ethers.js**
* **Ganache (Local Ethereum Network)**
* **IPFS for decentralized metadata storage**
* **MetaMask for wallet integration**

## Screenshots

* Minting Page (Organizer)
* My Tickets Page (With NFT image, info, and sell option)
* Marketplace Listings
* MetaMask Popup

## Benefits of On-Chain Ticketing

* **Immutability:** Tickets can't be forged or tampered with.
* **Transparency:** All transactions are public and verifiable.
* **Programmability:** Smart contracts automate resale rules.
* **Resale Fairness:** Enables controlled peer-to-peer secondary markets.

## Future Improvements

* Add royalty support (EIP-2981)
* Mobile DApp interface
* QR-code based verification on-site
* Integration with Layer 2 for cheaper fees
* Event reminder/expiration mechanism

## License

MIT License

---

This project was developed as part of a coursework demonstration of blockchain-based data application use cases.
