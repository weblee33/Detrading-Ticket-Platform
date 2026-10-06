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
