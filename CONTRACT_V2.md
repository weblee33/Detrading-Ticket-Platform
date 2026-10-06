# TicketMarketplaceV2

`contracts/TicketMarketplaceV2.sol` is a new, reproducible demo contract. It is explicitly **not** claimed to be the missing original contract represented by the legacy frontend ABI.

## Design

- ERC-1155 ticket types with per-token metadata and supply tracking.
- Organizer-only ticket creation and minting.
- Listings escrow ticket quantities inside the contract.
- Exact-value purchases; overpayment and underpayment both revert.
- Checks-effects-interactions ordering plus `ReentrancyGuard` for listing, buying and cancellation.
- Cancellation returns the remaining escrow to the seller.
- Solidity compiler, EVM target and OpenZeppelin version are pinned through npm and Hardhat configuration.

## Local demo

Use separate terminals:

```bash
# Terminal 1
npm run chain

# Terminal 2
npm run deploy:local
npm run seed:local
npm start
```

Deployment writes the generated address and chain ID to `src/deployments/local.json`. The frontend loads that file unless environment variables override it.

## Verification

```bash
npm run compile:contract
npm run test:contract
CI=true npm test -- --runInBand
npm run build
npm run verify:demo
```

`verify:demo` starts an isolated local node, deploys the contract, creates two ticket types, creates an escrowed listing, validates the generated frontend deployment file, and then stops the node.

The demo uses Hardhat's deterministic local accounts and test ETH only. Never import a real-wallet seed phrase into this environment.

## Not included yet

- QR admission and replay-resistant redemption.
- Event cancellation and refunds.
- Resale price caps or deadlines.
- Independent audit or production/mainnet readiness.
