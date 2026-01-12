#!/bin/bash

# CI/CD Script for building and pushing Docker image
# Usage: ./ci.sh

set -e  # Exit on error

echo "🚀 Starting CI/CD process..."

# Step 1: Git pull from main branch
echo ""
echo "📥 Pulling latest changes from origin/main..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to pull from origin/main"
  exit 1
fi

echo "✅ Successfully pulled latest changes"

# Step 2: Prompt for version
echo ""
read -p "📦 Enter version (e.g., v1.2.0): " VERSION

# Validate version input
if [ -z "$VERSION" ]; then
  echo "❌ Error: Version cannot be empty"
  exit 1
fi

# Remove 'v' prefix if user included it, then add it back to ensure consistency
VERSION=$(echo "$VERSION" | sed 's/^v//')
VERSION="v${VERSION}"

echo ""
echo "🔨 Building Docker image: ceruscs/elearning-app:${VERSION}"

# Step 3: Docker build
docker build -t "ceruscs/elearning-app:${VERSION}" .

if [ $? -ne 0 ]; then
  echo "❌ Error: Docker build failed"
  exit 1
fi

echo "✅ Docker image built successfully"

# Step 4: Docker push
echo ""
echo "📤 Pushing Docker image to registry..."

docker push "ceruscs/elearning-app:${VERSION}"

if [ $? -ne 0 ]; then
  echo "❌ Error: Docker push failed"
  exit 1
fi

echo ""
echo "✅ Successfully pushed ceruscs/elearning-app:${VERSION}"
echo "🎉 CI/CD process completed successfully!"
