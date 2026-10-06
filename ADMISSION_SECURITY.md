# Replay-resistant admission

## Pass contents

The holder signs a five-minute pass containing:

- v2 contract address;
- chain ID;
- holder address;
- ERC-1155 token ID;
- random 32-byte nonce;
- expiration timestamp.

The contract reconstructs the digest and uses OpenZeppelin ECDSA recovery to verify that the signature belongs to the declared holder.

## On-chain checks

`redeemTicket` requires all of the following:

1. the caller is authorized gate staff;
2. the deadline has not passed;
3. the deadline is no more than ten minutes in the future;
4. the holder still owns at least one available ticket;
5. the pass digest has never been used;
6. the recovered signer equals the holder.

After validation, the pass ID is marked used and exactly one ERC-1155 unit is burned. Re-submitting the same pass reverts. A pass also stops working if the holder sells or transfers the last available ticket before admission.

## Demo convenience versus trust boundary

The browser stores the latest generated pass in `localStorage` only so a one-laptop demonstration can switch from the holder page to the gate page. This storage is not trusted by the contract and cannot bypass signature, expiry, balance, role or replay checks.

## Remaining production work

- Replace the Demo paste/load helper with a camera scanner and strict QR size limits.
- Add event-specific admission windows rather than only a short pass deadline.
- Define whether a redeemed ticket should remain as a collectible; the current Demo burns it.
- Use managed gate-staff keys or account abstraction instead of ordinary browser wallets.
- Conduct an independent smart-contract audit before any public network deployment.
