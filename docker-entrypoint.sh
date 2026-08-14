#!/bin/sh
set -e

cd /app/backend
npm run db:migrate

PORT=8787 npx tsx src/index.ts &
API_PID=$!

i=0
while [ "$i" -lt 30 ]; do
  if curl -sf http://127.0.0.1:8787/health >/dev/null 2>&1; then
    break
  fi
  i=$((i + 1))
  sleep 1
done

if ! curl -sf http://127.0.0.1:8787/health >/dev/null 2>&1; then
  echo "Backend failed to start" >&2
  kill "$API_PID" 2>/dev/null || true
  exit 1
fi

export BACKEND_URL=http://127.0.0.1:8787
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"

cd /app
exec node server.js
