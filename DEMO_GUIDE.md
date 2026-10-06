# Demo guide

## One-command start

Install Node.js 18+ and MetaMask, then run:

```bash
npm ci
npm run demo
```

The command starts a Hardhat node, deploys `TicketMarketplaceV2`, creates VIP/general ticket types, creates Alice's escrowed resale listing, writes the deployment address for the frontend and starts React at `http://localhost:3000`.

MetaMask should use:

- Network name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

Import only the publicly known development accounts printed by `npm run chain`. Never send real funds to them and never import a real seed phrase into the Demo environment.

## Five-minute presentation

1. Open **探索市場** and show the seeded VIP resale listing.
2. Connect Alice (Hardhat Account #1), open **我的票券**, and show her remaining VIP balance.
3. Connect Bob (Account #2), purchase one VIP ticket and wait for the confirmed transaction banner.
4. Open **我的票券** to show Bob's new on-chain balance.
5. Reconnect Alice, create or cancel a listing to demonstrate escrow behavior.
6. Connect the organizer (Account #0), open **主辦方後台**, and mint a new ticket type to a selected Demo address.
7. Connect Bob, open **入場票證**, select his VIP ticket and sign a five-minute QR pass.
8. Connect gate staff (Account #3), open **驗票工作台**, load the latest Demo pass and redeem it.
9. Paste the same pass again to demonstrate that the contract rejects replay.

## Interface states to explain

- The role label identifies organizer, Alice, Bob or gate staff by the deterministic Demo address.
- The market displays event metadata instead of only token IDs.
- Transaction banners separate wallet signing, submission, confirmation and failure.
- Account or chain changes clear stale data and require an explicit reconnect.
- The organizer tab is visible only to the contract owner.

## Verification

```bash
npm run test:contract
CI=true npm test -- --runInBand
npm run build
npm run verify:demo
```

The current Demo covers minting, holdings, escrowed listing, purchase, cancellation and replay-resistant admission. See `ADMISSION_SECURITY.md` for the trust model and remaining production work.
