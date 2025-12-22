#!/bin/bash
set -e

cd "$(dirname "$0")/.."

docker compose exec frontend npm run test -- "$@"
