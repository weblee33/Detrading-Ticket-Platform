# Demo guide

1. Install Node.js 18+ and MetaMask, then run `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Start Ganache and update `REACT_APP_CHAIN_ID`, `REACT_APP_RPC_URL` and `REACT_APP_CONTRACT_ADDRESS` for the deployed contract.
4. Import a Ganache test account into MetaMask. Never use a real seed phrase or real funds.
5. Run `npm start`, connect the wallet, and verify that the configured address contains deployed bytecode.
6. Demonstrate mint (owner only), list, buy and cancel. The UI now reports signing, submission and confirmation separately.

The included automated tests mock or isolate frontend behavior. A real-chain demo requires the missing Solidity source and a reproducible deployment.
