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

## Smart Contract Details

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
