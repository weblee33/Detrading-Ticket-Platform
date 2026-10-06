#!/usr/bin/env bash
set -euo pipefail

demo_log="$(mktemp)"
npx hardhat node >"$demo_log" 2>&1 &
demo_node_pid=$!

cleanup() {
  kill "$demo_node_pid" 2>/dev/null || true
  rm -f "$demo_log"
}
trap cleanup EXIT

ready=0
for _ in $(seq 1 40); do
  if curl --silent --fail \
    --header 'content-type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    http://127.0.0.1:8545 >/dev/null; then
    ready=1
    break
  fi
  sleep 0.25
done

if [[ "$ready" -ne 1 ]]; then
  echo "Hardhat node did not become ready" >&2
  tail -n 20 "$demo_log" >&2
  exit 1
fi

npm run deploy:local
npm run seed:local
node -e "const d=require('./src/deployments/local.json'); if (!d.address || d.chainId !== '0x7a69') process.exit(1); console.log('Demo deployment verified:', d.address)"
