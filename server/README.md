# 🔧 Fake API Documentation

Các API fake này được tạo để test authentication trong khi chờ backend thật deploy.

## 📋 Available APIs

### 🔐 Authentication APIs

#### 1. Login - `POST /api/auth/login`
```typescript
// Request
{
  "email": "admin@example.com",
  "password": "admin123"
}

// Response
{
  "data": {
    "id_token": "jwt-token-here"
  }
}
```

#### 2. Register - `POST /api/auth/register`
```typescript
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "userName": "johndoe",
  "password": "password123",
  "confirmPassword": "password123"
}

// Response
{
  "message": "User registered successfully",
  "data": {
    "id": "3",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe"
  }
}
```

#### 3. Refresh Token - `POST /api/auth/refresh`
```typescript
// Headers
{
  "Authorization": "Bearer jwt-token-here"
}

// Response
{
  "data": {
    "id_token": "new-jwt-token-here"
  }
}
```

### 👤 User APIs

#### 1. Get Profile - `GET /api/user/me`
```typescript
// Headers
{
  "Authorization": "Bearer jwt-token-here"
}

// Response
{
  "id": "1",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "userName": "admin",
  "avatar": "https://avataaars.io/...",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 👥 Test Users

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

### Regular User  
- **Email**: `user@example.com`
- **Password**: `user123`
- **Role**: `user`

## 🔄 Switching to Real Backend

Khi backend thật đã deploy, chỉ cần thay đổi environment variable:

```bash
# .env
API_BASE_URL=https://your-real-backend.com/api
```

Hoặc trong `nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    apiBase: 'https://your-real-backend.com/api'
  }
}
```

## 🛠️ API File Structure

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts      # POST /api/auth/login
│   │   ├── register.post.ts   # POST /api/auth/register
│   │   └── refresh.post.ts    # POST /api/auth/refresh
│   └── user/
│       └── me.get.ts          # GET /api/user/me
└── README.md                  # This file
```

## 🔑 JWT Secret

Fake JWT secret: `your-fake-jwt-secret-key`

⚠️ **Lưu ý**: Đây chỉ là fake API cho development. Trong production, hãy sử dụng secret key mạnh và secure hơn.

## 🚀 Usage in Frontend

```typescript
// useAuth composable sẽ tự động sử dụng các API này
const { login, register, logout, user, isLoggedIn } = useAuth()

// Login
await login({ email: 'admin@example.com', password: 'admin123' })

// Register
await register({
  firstName: 'John',
  lastName: 'Doe', 
  email: 'john@example.com',
  userName: 'johndoe',
  password: 'password123',
  confirmPassword: 'password123'
})
```
