#!/usr/bin/env bash
set -euo pipefail

chain_log="${TMPDIR:-/tmp}/detrading-hardhat.log"
npx hardhat node >"$chain_log" 2>&1 &
chain_pid=$!

cleanup() {
  kill "$chain_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 40); do
  if curl --silent --fail \
    --header 'content-type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    http://127.0.0.1:8545 >/dev/null; then
    npm run deploy:local
    npm run seed:local
    BROWSER=none npm start
    exit 0
  fi
  sleep 0.25
done

echo "Hardhat node did not become ready. See $chain_log" >&2
exit 1
