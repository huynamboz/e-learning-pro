#!/bin/bash

# Script to pull latest code and rebuild Docker container with ZERO DOWNTIME
# Usage: ./rebuild.sh

set -e  # Exit on error

echo "🚀 Starting zero-downtime rebuild process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
OLD_CONTAINER="elearning-app"
NEW_CONTAINER="elearning-app-new"
HEALTH_CHECK_URL="http://localhost:3001"
HEALTH_CHECK_TIMEOUT=120  # seconds
HEALTH_CHECK_INTERVAL=5   # seconds
PORT_OLD=3000
PORT_NEW=3001

# Step 1: Pull latest code from origin/main
echo -e "${BLUE}📥 Pulling latest code from origin/main...${NC}"
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull code from origin/main${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code pulled successfully${NC}"

# Step 2: Build new Docker image (without stopping old container)
echo -e "${BLUE}🔨 Building new Docker image...${NC}"
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 3: Ensure network exists
echo -e "${BLUE}🌐 Ensuring Docker network exists...${NC}"
docker network create elearning-network 2>/dev/null || true

# Step 4: Start new container on temporary port (old container still running)
echo -e "${BLUE}🚀 Starting new container on temporary port ${PORT_NEW}...${NC}"

# Create a temporary docker-compose override for new container
cat > docker-compose.new.yml <<EOF
services:
  app-new:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${NEW_CONTAINER}
    ports:
      - "${PORT_NEW}:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_BASE_URL=\${API_BASE_URL:-https://elearning.genfash.online/api/v1}
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID:-}
    env_file:
      - .env
    restart: "no"
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 40s
    networks:
      - elearning-network

networks:
  elearning-network:
    external: true
EOF

# Start new container
docker compose -f docker-compose.new.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start new container${NC}"
    rm -f docker-compose.new.yml
    exit 1
fi

echo -e "${GREEN}✅ New container started on port ${PORT_NEW}${NC}"

# Step 5: Wait for new container to be healthy
echo -e "${BLUE}⏳ Waiting for new container to be healthy...${NC}"
ELAPSED=0

while [ $ELAPSED -lt $HEALTH_CHECK_TIMEOUT ]; do
    # Check if container is running
    if ! docker ps | grep -q "${NEW_CONTAINER}"; then
        echo -e "${RED}❌ New container stopped unexpectedly${NC}"
        docker compose -f docker-compose.new.yml logs
        docker compose -f docker-compose.new.yml down
        rm -f docker-compose.new.yml
        exit 1
    fi

    # Check health via HTTP
    if curl -f -s "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ New container is healthy!${NC}"
        break
    fi

    echo -e "${YELLOW}   Waiting... (${ELAPSED}s/${HEALTH_CHECK_TIMEOUT}s)${NC}"
    sleep $HEALTH_CHECK_INTERVAL
    ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
done

if [ $ELAPSED -ge $HEALTH_CHECK_TIMEOUT ]; then
    echo -e "${RED}❌ New container failed health check after ${HEALTH_CHECK_TIMEOUT}s${NC}"
    echo -e "${YELLOW}📋 New container logs:${NC}"
    docker compose -f docker-compose.new.yml logs --tail=50
    docker compose -f docker-compose.new.yml down
    rm -f docker-compose.new.yml
    exit 1
fi

# Step 6: Stop old container (new container is healthy and ready)
echo -e "${BLUE}🛑 Stopping old container...${NC}"
docker compose down || true

# Step 7: Switch new container to production port
echo -e "${BLUE}🔄 Switching new container to production port ${PORT_OLD}...${NC}"

# Stop new container on temporary port
docker stop ${NEW_CONTAINER} || true
docker rm ${NEW_CONTAINER} || true

# Start with production docker-compose (now using new image)
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start container on production port${NC}"
    rm -f docker-compose.new.yml
    exit 1
fi

# Cleanup
rm -f docker-compose.new.yml

# Step 8: Show container status
echo -e "${BLUE}📊 Container status:${NC}"
docker compose ps

# Step 9: Show logs
echo -e "${YELLOW}📋 Showing recent logs (press Ctrl+C to exit):${NC}"
sleep 2
docker compose logs --tail=50 -f
