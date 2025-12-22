#!/bin/bash
set -e

cd "$(dirname "$0")/.."

if [ "$1" = "--rebuild" ]; then
    echo "Stopping containers and removing volumes..."
    docker compose down -v
    echo "Building with no cache..."
    docker compose build --no-cache
    echo "Starting containers..."
    docker compose up -d
else
    docker compose up -d
fi

echo "Containers started successfully."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
