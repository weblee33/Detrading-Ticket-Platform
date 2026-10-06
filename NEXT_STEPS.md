# Next steps

## Replay-resistant admission

- Implemented in Demo v2: holder-signed contract/chain-bound payload, five-minute expiry, random nonce, authorized gate staff, atomic used-pass marking and one-unit burn.
- Verified: replay, expiry, invalid signature, insufficient balance and unauthorized operator are rejected.
- Camera and image-based QR scanning is implemented with payload/image limits, permission feedback and manual Demo fallback.
- Remaining: event-specific admission windows, managed staff credentials, cross-device browser testing and optional post-entry collectible.

## Controlled resale

- Add per-event maximum resale price, resale deadline, cancellation and refund rules to the contract.
- Decide how off-platform transfers affect enforcement and document that platform price caps cannot prevent side payments.
- Acceptance: contract tests cover limits, deadlines, refunds, authorization and reentrancy.

## Explainable anomaly detection

- Index listings, sales and transfers into an address-event graph.
- Start with explainable rules: burst trading, circular transfers, concentration and repeated near-cap resale.
- Establish labeled evaluation data before adding graph ML.
- Acceptance: versioned dataset, leakage-safe split, precision/recall, false-positive review and human-readable reason codes.
