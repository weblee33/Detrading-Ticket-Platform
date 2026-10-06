# Test results

## Baseline (`main` at `c6d2123`)

- `CI=true npm test -- --runInBand`: **failed**. The only test expected the removed Create React App “learn react” text; rendering also invoked an unsupported `window.alert` in jsdom.
- Build was not reached because the baseline command stopped on the failed test.

## This branch

Run the following before merging:

```bash
npm ci
CI=true npm test -- --runInBand
npm run build
```

Unit tests are mocks/unit-level checks. They do not prove successful execution against the original smart contract.

Results on 2026-10-06:

- `CI=true npm test -- --runInBand`: **passed**, 1 suite / 11 tests.
- `npm run build`: **passed**, optimized production bundle compiled successfully.
- `git diff --check`: **passed**.
- Non-blocking warnings: the Create React App dependency stack and Browserslist data are dated; dependency modernization is intentionally outside this focused reliability change.

## V2 contract foundation

- `npm run compile:contract`: **passed**, 21 Solidity source/dependency files compiled with pinned local `solc 0.8.26` and Cancun EVM target.
- `npm run test:contract`: **passed**, 9 contract tests.
- `npm run verify:demo`: **passed**. A temporary Hardhat node deployed `TicketMarketplaceV2`, seeded VIP/general tickets and created an escrowed secondary-market listing.
- Contract tests cover organizer authorization, metadata/supply, invalid minting, required approval, escrow, insufficient balances, exact payment, complete purchase and seller-only cancellation.

## Demo interface

- `CI=true npm test -- --runInBand`: **passed**, 3 suites / 14 tests.
- `npm run build`: **passed**, production JavaScript and responsive CSS compiled successfully.
- `npm run demo`: **passed**, local chain, deployment, seed data and React development server started successfully.
- The UI now exposes marketplace, wallet holdings and an owner-only organizer console, with deterministic Demo role labels and transaction lifecycle banners.

## Replay-resistant admission

- `npm run test:contract`: **passed**, 14 tests including authorized redemption, ticket burn, used-pass tracking, replay rejection, expiration, maximum lifetime, invalid signature and unauthorized operator.
- `CI=true npm test -- --runInBand`: **passed**, 4 suites / 16 tests including admission payload encoding and validation.
- `npm run verify:demo`: **passed**, deployment, seed data, signed admission, on-chain redemption and replay rejection.

## Camera QR scanner and documentation

- `CI=true npm test -- --runInBand`: **passed**, 5 suites / 19 tests. Scanner tests cover explicit camera activation, denied-permission feedback and invalid upload rejection; admission parsing also rejects null and oversized payloads.
- `npm run test:contract`: **passed**, 14 contract tests.
- `npm run build`: **passed**. The optimized bundle compiled with non-blocking upstream `html5-qrcode` source-map and dated Browserslist warnings.
- `npm run demo`: **passed**. The local chain deployed and seeded successfully, and the React development bundle compiled.
- Camera behavior is unit-tested with a browser API mock. Physical device/browser compatibility still requires a real HTTPS or localhost environment and is documented as production work.
