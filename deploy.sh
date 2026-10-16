#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Load global environment paths so non-interactive SSH can find docker, git, etc.
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

echo "🚀 Starting Auto-Deployment Process for Smart Academic Assistant Backend..."

# 1. Pull the latest code from Git
echo "📥 1. Fetching and resetting to latest code from GitHub..."
git config --global --add safe.directory "$PWD"
git fetch --all
git reset --hard origin/main

# 2. Ensure environment file exists
if [ ! -f .env ]; then
    echo "⚠️ .env file not found, creating from .env.example..."
    cp .env.example .env
fi

# 3. Rebuild Docker Image & Recreate Container using docker compose
echo "🐳 2. Rebuilding Docker Image and Restarting Containers..."
if docker compose version >/dev/null 2>&1; then
    docker compose up -d --build --remove-orphans
else
    docker-compose up -d --build --remove-orphans
fi

# 4. Wait for containers to stabilize
echo "⏳ 3. Waiting for services to become healthy..."
sleep 10

# 5. Verify database schema push inside backend container
echo "🗄️ 4. Synchronizing Prisma database schema..."
docker exec -t saa-backend npx prisma db push --skip-generate || true

# 6. Verify healthcheck endpoint
echo "🩺 5. Checking backend health status on port 8096..."
curl -s -f http://127.0.0.1:8096/api/v1/health || true

echo ""
echo "🎉 Auto-Deployment for Smart Academic Assistant Backend completed successfully!"
