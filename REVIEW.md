# Code review

## Fixed in this branch

- All prices, quantities and totals remain strings or `bigint`; transaction values no longer pass through JavaScript `Number`.
- Mint, approval, listing, purchase and cancellation wait for confirmation before reporting success or refreshing data.
- Listing checks existing operator approval before sending an approval transaction.
- Pending states disable repeat submission and distinguish signing, submitted and confirmed states.
- Account, chain and disconnect events clear stale contract/account state and listeners are removed on unmount.
- Chain ID and contract address can be configured with environment variables; connection checks deployed bytecode.
- Ticket and listing results are explicitly mapped. “My tickets” excludes zero balances.
- Listing and purchase forms use React state instead of DOM lookup and validate positive integers and balances.

## Remaining blockers and risks

- The repository contains an ABI but no Solidity source, deployment scripts or contract tests. The original contract's authorization, payment, reentrancy and marketplace behavior have **not** been audited.
- Real end-to-end testing requires the exact Solidity source, compiler settings, deployment script, deployed address and funded Ganache accounts.
- Sequential reads are safe for this small demo but should be replaced with a contract multicall/indexer or pagination for larger data sets.
- Metadata currently depends on a public IPFS gateway. Production use needs gateway fallback, response validation and explicit retry UI.
