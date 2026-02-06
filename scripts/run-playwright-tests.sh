#!/usr/bin/env bash
set -euo pipefail

PORT=41730
SERVER_LOG="${SERVER_LOG:-/tmp/mprlab-http-server-${PORT}.log}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

rm -f "${SERVER_LOG}"

./node_modules/.bin/http-server -p "${PORT}" -c-1 -s . >"${SERVER_LOG}" 2>&1 &
SERVER_PID=$!

# Confirm the server is reachable before starting Playwright.
server_ready=0
for _ in {1..80}; do
  if curl -sf "http://127.0.0.1:${PORT}/index.html" >/dev/null; then
    server_ready=1
    break
  fi
  sleep 0.1
done

if [[ "${server_ready}" -ne 1 ]]; then
  echo "http-server did not become ready on port ${PORT}. Server log:" >&2
  tail -n 200 "${SERVER_LOG}" >&2 || true
  exit 1
fi

./node_modules/.bin/playwright test "$@"

