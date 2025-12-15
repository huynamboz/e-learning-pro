# Zero Downtime Deployment Guide

## Tổng quan

Script `rebuild.sh` đã được cải thiện để giảm thiểu downtime khi deploy. Script sử dụng chiến lược **blue-green deployment** cơ bản:

1. **Build image mới** (container cũ vẫn chạy)
2. **Start container mới** trên port tạm thời (3001)
3. **Health check** container mới
4. **Stop container cũ** (container mới đã sẵn sàng)
5. **Switch container mới** sang port production (3000)

## Cách sử dụng

### Cách 1: Script cơ bản (giảm downtime)

```bash
./rebuild.sh
```

Script này sẽ:
- Pull code mới từ `origin/main`
- Build image mới
- Start container mới trên port 3001
- Health check container mới
- Stop container cũ
- Switch container mới sang port 3000

**Downtime**: ~2-5 giây khi switch port (container mới đã healthy trước đó)

### Cách 2: Script nâng cao với Nginx (zero downtime thực sự)

```bash
./rebuild-zero-downtime.sh
```

Script này yêu cầu **Nginx** được cấu hình như reverse proxy.

## Cấu hình Nginx cho Zero Downtime

Để đạt **zero downtime thực sự**, bạn cần cấu hình Nginx như reverse proxy:

### 1. Cài đặt Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Tạo cấu hình Nginx

Tạo file `/etc/nginx/sites-available/elearning`:

```nginx
upstream elearning_backend {
    server localhost:3000;
    # Có thể thêm server localhost:3001; để load balancing
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://elearning_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable site

```bash
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Cập nhật docker-compose.yml

Đảm bảo container chỉ expose port nội bộ (không cần expose ra host):

```yaml
services:
  app:
    # ... other config
    ports:
      - '127.0.0.1:3000:3000' # Chỉ expose trên localhost
```

## Quy trình Zero Downtime với Nginx

1. **Build image mới** (container cũ vẫn chạy trên port 3000)
2. **Start container mới** trên port 3001
3. **Health check** container mới
4. **Update Nginx upstream** để include cả 2 backend:
   ```nginx
   upstream elearning_backend {
       server localhost:3000 weight=1;
       server localhost:3001 weight=1;
   }
   ```
5. **Reload Nginx** (traffic được chia đều)
6. **Stop container cũ** (traffic tự động chuyển sang container mới)
7. **Update Nginx** chỉ còn backend mới:
   ```nginx
   upstream elearning_backend {
       server localhost:3001;
   }
   ```
8. **Move container mới** sang port 3000
9. **Update Nginx** về port 3000

## Monitoring và Rollback

### Kiểm tra logs

```bash
# Logs của container hiện tại
docker compose logs -f

# Logs của container mới (trong quá trình deploy)
docker compose -f docker-compose.new.yml logs -f
```

### Rollback nếu có lỗi

Nếu container mới có vấn đề, bạn có thể rollback:

```bash
# Stop container mới
docker stop elearning-app-new
docker rm elearning-app-new

# Start lại container cũ (nếu image cũ vẫn còn)
docker compose up -d

# Hoặc pull lại code cũ
git checkout <previous-commit>
./rebuild.sh
```

## Health Check

Script sử dụng HTTP health check để đảm bảo container sẵn sàng:

- **URL**: `http://localhost:3001` (container mới)
- **Timeout**: 120 giây
- **Interval**: 5 giây
- **Retries**: 3 lần

Bạn có thể tùy chỉnh trong script:

```bash
HEALTH_CHECK_TIMEOUT=120  # seconds
HEALTH_CHECK_INTERVAL=5   # seconds
```

## Troubleshooting

### Container mới không healthy

```bash
# Kiểm tra logs
docker compose -f docker-compose.new.yml logs

# Kiểm tra container status
docker ps -a | grep elearning-app-new

# Kiểm tra port
netstat -tlnp | grep 3001
```

### Port đã được sử dụng

```bash
# Kiểm tra port nào đang sử dụng
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process nếu cần
sudo kill -9 <PID>
```

### Network issues

```bash
# Kiểm tra network
docker network ls
docker network inspect elearning-network

# Tạo lại network nếu cần
docker network create elearning-network
```

## Best Practices

1. **Luôn test trên staging** trước khi deploy production
2. **Backup database** trước khi deploy
3. **Monitor logs** trong quá trình deploy
4. **Có kế hoạch rollback** sẵn sàng
5. **Thông báo người dùng** nếu có maintenance window
6. **Sử dụng health checks** để đảm bảo chất lượng
7. **Giữ lại image cũ** để rollback nhanh

## Tối ưu hóa

### Giảm build time

- Sử dụng Docker layer caching
- Chỉ rebuild khi cần thiết
- Sử dụng multi-stage builds hiệu quả

### Giảm startup time

- Optimize application startup
- Pre-warm caches
- Sử dụng health checks thông minh

## Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue hoặc liên hệ team.
