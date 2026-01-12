#!/bin/sh
set -e

printf "Nhap ten service (container name) trong docker-compose: "
read -r SERVICE

if [ -z "$SERVICE" ]; then
  echo "Chua nhap service name. Thoat."
  exit 1
fi

echo "Pull code..."
git pull

echo "Docker compose up -d $SERVICE..."
docker compose up -d "$SERVICE"

# Hien thi trang thai container
printf "\nTrang thai container:\n"
docker compose ps "$SERVICE"
