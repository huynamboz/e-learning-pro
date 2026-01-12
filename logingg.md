# Google OAuth Login API

## 📋 Overview

The Google OAuth Login API allows users to authenticate using their Google account. The backend verifies the Google ID token and creates/logs in users automatically.

## 🔧 Configuration

### 1. Google Cloud Console Setup

1. Visit https://console.cloud.google.com/
2. Create a new project or select existing project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
5. Select **Application type**: **Web application**
6. Configure:
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:5173
     https://api.hoctiengycungphantam.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000
     http://localhost:5173
     https://api.hoctiengycungphantam.com
     https://api.hoctiengycungphantam.com/auth/callback
     ```
7. Copy the **Client ID**

### 2. Backend Configuration

Add to `.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

Restart Docker:
```bash
docker compose restart web
```

### 3. OAuth Consent Screen

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. Configure consent screen:
   - **App name**: E-Learning Platform
   - **User support email**: your-email@domain.com
   - **Developer contact**: your-email@domain.com
3. Add scopes: `email`, `profile`, `openid`
4. Add **Test users** (for Testing mode):
   ```
   developer@company.com
   tester1@gmail.com
   tester2@gmail.com
   ```

## 🚀 API Endpoint

### POST `/api/v1/auth/google/`

Authenticate user with Google ID token.

**Headers:**
```
Content-Type: application/json
X-Device-ID: unique-device-identifier
```

**Request Body:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY..."
}
```

**Success Response (201 Created - New User):**
```json
{
  "success": true,
  "message": "Account created successfully via Google",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "username": "user",
      "first_name": "John",
      "last_name": "Doe",
      "is_teacher": false,
      "is_verified": true
    },
    "is_new_user": true
  }
}
```

**Success Response (200 OK - Existing User):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "username": "user",
      "first_name": "John",
      "last_name": "Doe",
      "is_teacher": false,
      "is_verified": true
    },
    "is_new_user": false
  }
}
```

**Error Responses:**

*Invalid Token (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "id_token": ["Invalid Google ID token: Token expired"]
  }
}
```

*Missing Device ID (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "non_field_errors": ["X-Device-ID header is required"]
  }
}
```

*Unverified Email (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "id_token": ["Email not verified by Google."]
  }
}
```

*Invalid Issuer (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "id_token": ["Invalid token issuer."]
  }
}
```

*Google OAuth Not Configured (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "id_token": ["Google OAuth is not configured. Please contact administrator."]
  }
}
```

*User Account Disabled (400):*
```json
{
  "success": false,
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "non_field_errors": ["User account is disabled."]
  }
}
```

## 💻 Frontend Integration

### React Example (using @react-oauth/google)

```bash
npm install @react-oauth/google
```

```javascript
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('https://api.hoctiengycungphantam.com/api/v1/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': 'web-browser-001' // Generate unique device ID
        },
        body: JSON.stringify({
          id_token: credentialResponse.credential
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Save JWT token
        localStorage.setItem('access_token', data.data.access);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        if (data.data.is_new_user) {
          console.log('Welcome! Your account has been created.');
        } else {
          console.log('Welcome back!');
        }
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div>
        <h1>Login</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Failed')}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
}
```

### Vue Example

```bash
npm install vue3-google-login
```

```vue
<template>
  <GoogleLogin :callback="handleGoogleLogin" />
</template>

<script setup>
import { googleTokenLogin } from 'vue3-google-login'

const handleGoogleLogin = async (response) => {
  try {
    const result = await fetch('https://api.hoctiengycungphantam.com/api/v1/auth/google/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'web-browser-001'
      },
      body: JSON.stringify({
        id_token: response.credential
      })
    });

    const data = await result.json();
    
    if (data.success) {
      localStorage.setItem('access_token', data.data.access);
      // Redirect or update UI
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
</script>
```

## 🔒 Security Features

### Token Verification
- Verifies ID token signature with Google's public keys
- Checks token issuer (`accounts.google.com`)
- Validates email is verified by Google
- Verifies Client ID matches your app

### Single Device Login
- Enforces one active session per user
- Automatically revokes previous device tokens
- Requires `X-Device-ID` header for tracking

### User Creation
- Generates secure random password (32 characters)
- Automatically marks email as verified
- Handles username collisions (appends counter if needed)
- Sets `is_teacher=False` by default

## 🧪 Testing

### Unit Tests

Run tests:
```bash
docker compose exec web python manage.py test src.accounts.tests.GoogleLoginTestCase
```

Test coverage:
- ✅ Creates new user if they don't exist
- ✅ Logs in existing user
- ✅ Rejects invalid token
- ✅ Rejects unverified email
- ✅ Rejects invalid issuer
- ✅ Requires X-Device-ID header
- ✅ Fails gracefully when GOOGLE_CLIENT_ID not configured
- ✅ Handles username collision
- ✅ Rejects inactive users

### Manual Testing with cURL

```bash
# Get a real Google ID token from OAuth Playground:
# https://developers.google.com/oauthplayground/

curl -X POST http://localhost:8000/api/v1/auth/google/ \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: curl-test-001" \
  -d '{
    "id_token": "YOUR_REAL_GOOGLE_ID_TOKEN_HERE"
  }'
```

## 📊 Flow Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ 1. User clicks "Login with Google"
       │
       v
┌─────────────────┐
│  Google OAuth   │
│   (Popup/Page)  │
└──────┬──────────┘
       │ 2. User authorizes app
       │
       v
┌─────────────┐
│   Frontend  │ 3. Receives ID token
└──────┬──────┘
       │
       │ 4. POST /api/v1/auth/google/
       │    { id_token: "..." }
       v
┌──────────────────┐
│   Backend API    │
│  ┌────────────┐  │
│  │ Verify ID  │  │ 5. Validate with Google
│  │   Token    │  │
│  └─────┬──────┘  │
│        │         │
│        v         │
│  ┌────────────┐  │
│  │Find/Create │  │ 6. Get or create user
│  │    User    │  │
│  └─────┬──────┘  │
│        │         │
│        v         │
│  ┌────────────┐  │
│  │ Generate   │  │ 7. Create JWT access token
│  │ JWT Token  │  │
│  └─────┬──────┘  │
└────────┼─────────┘
         │
         │ 8. Return JWT + user info
         v
   ┌─────────────┐
   │   Frontend  │ 9. Save token, redirect
   └─────────────┘
```

## 🐛 Troubleshooting

### Error: "Google OAuth is not configured"
**Solution:** Add `GOOGLE_CLIENT_ID` to `.env` and restart Docker

### Error: "Invalid token issuer"
**Solution:** Token is from wrong domain. Ensure using Google's official OAuth

### Error: "Email not verified by Google"
**Solution:** User needs to verify their email with Google first

### Error: "This app is blocked"
**Solution:** 
1. Add user to Test users list in OAuth consent screen, OR
2. Publish app to Production (requires Google review)

### Error: "Token expired"
**Solution:** ID tokens expire quickly (1 hour). Frontend must request new token

## 📝 Notes

- **Testing Mode**: Only whitelisted emails can login
- **Production Mode**: Anyone with a Google account can login
- **Token Lifetime**: Access token valid for 7 days (configurable)
- **Password**: Users created via Google login get random 32-char password
- **Username**: Generated from email prefix, with counter if collision occurs
- **Device Limit**: 1 active device per user (enforced by X-Device-ID)

## 🔗 Related Documentation

- [Authentication Overview](./AUTH_API.md)
- [Device Management](./DEVICE_MANAGEMENT.md)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
