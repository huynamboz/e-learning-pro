#!/bin/bash

# Script to pull latest code and rebuild Docker container
# Usage: ./rebuild.sh

set -e  # Exit on error

echo "🚀 Starting rebuild process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code from origin/main
echo -e "${BLUE}📥 Pulling latest code from origin/main...${NC}"
git fetch origin
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to pull code from origin/main${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code pulled successfully${NC}"

# Step 2: Stop existing container if running
echo -e "${BLUE}🛑 Stopping existing container (if running)...${NC}"
docker compose down || true

# Step 3: Build Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 4: Start container
echo -e "${BLUE}🚀 Starting container...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Container started successfully${NC}"

# Step 5: Show container status
echo -e "${BLUE}📊 Container status:${NC}"
docker compose ps

# Step 6: Show logs
echo -e "${YELLOW}📋 Showing recent logs (press Ctrl+C to exit):${NC}"
sleep 2
docker compose logs --tail=50 -f

