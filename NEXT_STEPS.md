# Next steps

## Replay-resistant admission

- Define whether each ERC-1155 unit is individually identifiable or only quantity-based.
- Use a short-lived organizer-signed payload with event, holder, token ID, nonce and expiry.
- Redeem the nonce atomically on-chain or in an auditable admission service.
- Acceptance: the same proof cannot be redeemed twice, expired proofs fail, and transferred tickets cannot reuse the prior holder's proof.

## Controlled resale

- Add per-event maximum resale price, resale deadline, cancellation and refund rules to the contract.
- Decide how off-platform transfers affect enforcement and document that platform price caps cannot prevent side payments.
- Acceptance: contract tests cover limits, deadlines, refunds, authorization and reentrancy.

## Explainable anomaly detection

- Index listings, sales and transfers into an address-event graph.
- Start with explainable rules: burst trading, circular transfers, concentration and repeated near-cap resale.
- Establish labeled evaluation data before adding graph ML.
- Acceptance: versioned dataset, leakage-safe split, precision/recall, false-positive review and human-readable reason codes.
