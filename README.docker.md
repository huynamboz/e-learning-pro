# Docker Setup for Elearning Project

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
API_BASE_URL=https://api.hoctiengycungphantam.com/api/v1
GOOGLE_CLIENT_ID=your_google_client_id
PORT=3000
NODE_ENV=production
```

## Production Build

### Build and run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Build and run with Docker

```bash
# Build the image
docker build -t elearning-app .

# Run the container
docker run -d \
  --name elearning-app \
  -p 3000:3000 \
  --env-file .env \
  elearning-app
```

## Development

For development with hot-reload:

```bash
# Start development container
docker-compose -f docker-compose.dev.yml up

# Or build and run manually
docker build -f Dockerfile.dev -t elearning-app-dev .
docker run -d \
  --name elearning-app-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.nuxt \
  --env-file .env \
  elearning-app-dev
```

## Useful Commands

```bash
# View running containers
docker ps

# View logs
docker logs elearning-app

# Execute command in container
docker exec -it elearning-app sh

# Stop and remove container
docker stop elearning-app
docker rm elearning-app

# Remove image
docker rmi elearning-app
```

## Health Check

The container includes a health check that verifies the application is responding on port 3000.

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' elearning-app
```

