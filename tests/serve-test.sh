#!/bin/sh
# Starts the production build against the test database and the mock Sheets endpoint.
cd "$(dirname "$0")/.."
DATA_DIR=./data-test SITE_URL=http://localhost:3000 APP_SECRET=e2e-test-secret-0123456789abcdefghijklmnop \
SHEETS_WEBHOOK_URL=http://127.0.0.1:4100/exec SHEETS_WEBHOOK_SECRET=test-secret \
exec npx next start -p 3000
