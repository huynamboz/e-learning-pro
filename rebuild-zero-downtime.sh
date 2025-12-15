#!/bin/bash

# Advanced zero-downtime rebuild script with nginx reverse proxy
# This script requires nginx to be configured as reverse proxy
# Usage: ./rebuild-zero-downtime.sh

set -e  # Exit on error

echo "🚀 Starting advanced zero-downtime rebuild process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="app"
OLD_CONTAINER="elearning-app"
NEW_CONTAINER="elearning-app-new"
IMAGE_NAME="elearning-pro-app"
HEALTH_CHECK_TIMEOUT=120
HEALTH_CHECK_INTERVAL=5
PORT_OLD=3000
PORT_NEW=3001
NGINX_CONFIG="/etc/nginx/sites-available/elearning"
NGINX_UPSTREAM="elearning_backend"

# Check if nginx is available
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx not found. Using basic zero-downtime method...${NC}"
    echo -e "${YELLOW}   For true zero-downtime, install nginx and configure reverse proxy${NC}"
    exec ./rebuild.sh
    exit 0
fi

# Step 1: Pull latest code
echo -e "${BLUE}📥 Pulling latest code from origin/main...${NC}"
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull code${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code pulled successfully${NC}"

# Step 2: Build new image
echo -e "${BLUE}🔨 Building new Docker image...${NC}"
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 3: Ensure network exists
docker network create elearning-network 2>/dev/null || true

# Step 4: Start new container on port 3001 (old still on 3000)
echo -e "${BLUE}🚀 Starting new container on port ${PORT_NEW}...${NC}"

cat > docker-compose.new.yml <<EOF
services:
  app-new:
    image: ${IMAGE_NAME}:latest
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

docker compose -f docker-compose.new.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start new container${NC}"
    rm -f docker-compose.new.yml
    exit 1
fi

# Step 5: Health check new container
echo -e "${BLUE}⏳ Waiting for new container to be healthy...${NC}"
ELAPSED=0

while [ $ELAPSED -lt $HEALTH_CHECK_TIMEOUT ]; do
    if ! docker ps | grep -q "${NEW_CONTAINER}"; then
        echo -e "${RED}❌ New container stopped${NC}"
        docker compose -f docker-compose.new.yml logs
        docker compose -f docker-compose.new.yml down
        rm -f docker-compose.new.yml
        exit 1
    fi

    if curl -f -s "http://localhost:${PORT_NEW}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ New container is healthy!${NC}"
        break
    fi

    echo -e "${YELLOW}   Waiting... (${ELAPSED}s/${HEALTH_CHECK_TIMEOUT}s)${NC}"
    sleep $HEALTH_CHECK_INTERVAL
    ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
done

if [ $ELAPSED -ge $HEALTH_CHECK_TIMEOUT ]; then
    echo -e "${RED}❌ Health check failed${NC}"
    docker compose -f docker-compose.new.yml down
    rm -f docker-compose.new.yml
    exit 1
fi

# Step 6: Update nginx to include new backend (if nginx config exists)
if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${BLUE}🔄 Updating nginx configuration...${NC}"
    
    # Backup nginx config
    sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%s)"
    
    # Update upstream to include both old and new (weighted)
    # This allows gradual traffic migration
    # For now, we'll switch directly to new backend
    
    echo -e "${YELLOW}   Note: Update nginx upstream to point to localhost:${PORT_NEW}${NC}"
    echo -e "${YELLOW}   Then run: sudo nginx -t && sudo systemctl reload nginx${NC}"
    
    # Wait for user confirmation or auto-update if script has permissions
    read -p "Press Enter after updating nginx config, or Ctrl+C to cancel..."
    
    # Test and reload nginx
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx updated and reloaded${NC}"
    
    # Wait a moment for traffic to switch
    sleep 2
fi

# Step 7: Stop old container (traffic now going to new container via nginx)
echo -e "${BLUE}🛑 Stopping old container...${NC}"
docker compose down || true

# Step 8: Move new container to production port
echo -e "${BLUE}🔄 Moving new container to production port...${NC}"
docker stop ${NEW_CONTAINER} || true
docker rm ${NEW_CONTAINER} || true

docker compose up -d

# Step 9: Update nginx back to port 3000 (if needed)
if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${BLUE}🔄 Updating nginx to production port...${NC}"
    # Update nginx upstream back to port 3000
    read -p "Press Enter after updating nginx config to port 3000..."
    sudo nginx -t && sudo systemctl reload nginx
fi

# Cleanup
rm -f docker-compose.new.yml

# Step 10: Final status
echo -e "${GREEN}✅ Zero-downtime deployment completed!${NC}"
docker compose ps

echo -e "${YELLOW}📋 Recent logs:${NC}"
docker compose logs --tail=50

