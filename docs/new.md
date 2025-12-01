# Frontend Integration Guide

Tài liệu tích hợp API cho Frontend Developers

## 📋 Mục lục

1. [Authentication & Security](#1-authentication--security)
2. [Course Management](#2-course-management)
3. [Order Flow](#3-order-flow)
4. [Generated Account Flow](#4-generated-account-flow)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Error Handling](#6-error-handling)
7. [Examples](#7-examples)

---

## 1. Authentication & Security

### 1.1 Device Management

Hệ thống yêu cầu **Device ID** và **Device Type** cho mọi request authentication.

#### Device ID
- **Header:** `X-Device-ID`
- **Format:** Unique string identifier cho mỗi thiết bị
- **Lưu trữ:** Frontend nên lưu Device ID trong localStorage/sessionStorage
- **Ví dụ:** `"iphone-11-pro-max-abc123"`, `"laptop-dell-xyz789"`

#### Device Type
- **Header:** `X-Device-Type`
- **Allowed values:** `laptop`, `tablet`, `phone`
- **Mapping tự động:**
  - `desktop` → `laptop`
  - `mobile`, `smartphone` → `phone`
  - `ipad` → `tablet`

#### Single Device Per Type Policy

**Quan trọng:** Mỗi user chỉ có thể đăng nhập **1 thiết bị duy nhất cho mỗi loại** (laptop, tablet, phone).

**Ví dụ:**
- User có thể đăng nhập trên: 1 laptop + 1 tablet + 1 phone
- User **KHÔNG thể** đăng nhập trên 2 laptop khác nhau
- Nếu user đăng nhập laptop mới → laptop cũ sẽ bị logout tự động

**Logic:**
- Mỗi user chỉ có thể đăng ký **1 thiết bị duy nhất cho mỗi type** (kể cả khi đã logout)
- Nếu user đăng nhập với `device_id` khác cùng `device_type` → **BỊ TỪ CHỐI**
- Chỉ có thể đăng nhập lại với **cùng device_id** đã đăng ký trước đó
- Sau khi logout, device vẫn còn trong DB (inactive) → không cho phép đăng ký device mới cùng type
- Để đăng ký device mới cùng type, phải **xóa hẳn** device cũ bằng API `/api/v1/devices/revoke/` với `delete: true`

### 1.2 Registration

**Endpoint:** `POST /api/v1/auth/register/`

**Request Headers:**
```
Content-Type: application/json
X-Device-ID: <unique-device-id>
X-Device-Type: laptop|tablet|phone
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username123",
  "password": "password123",
  "password2": "password123",
  "first_name": "First",
  "last_name": "Last"
}
```

**Response (201 Created):**
```json
{
  "code": "success",
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "first_name": "First",
    "last_name": "Last",
    "account_type": "self_registered",
    "is_verified": false
  }
}
```

**Error Responses:**
- `400`: Validation error (email exists, password mismatch, etc.)
- `400`: Device ID/Type missing

### 1.3 Login

**Endpoint:** `POST /api/v1/auth/login/`

**Request Headers:**
```
Content-Type: application/json
X-Device-ID: <unique-device-id>
X-Device-Type: laptop|tablet|phone
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Hoặc:**
```json
{
  "username": "username123",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "code": "success",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username123",
      "first_name": "First",
      "last_name": "Last",
      "account_type": "self_registered",
      "is_teacher": false,
      "is_staff": false
    }
  }
}
```

**Error Responses:**
- `400`: Invalid credentials
- `403`: `device_type_limit_exceeded` - Đã có thiết bị khác cùng loại đang active
- `400`: Device ID/Type missing

**Token Expiry:**
- Access token: **7 ngày**
- Không có refresh token (single token system)

### 1.4 Logout

**Endpoint:** `POST /api/v1/auth/logout/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
```

**Response (200 OK):**
```json
{
  "code": "success",
  "message": "Logged out successfully"
}
```

**Sau khi logout:**
- Token bị revoke ngay lập tức
- Device bị deactivate
- User phải login lại để sử dụng

### 1.5 Get Current User

**Endpoint:** `GET /api/v1/auth/me/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username123",
  "first_name": "First",
  "last_name": "Last",
  "account_type": "self_registered",
  "is_teacher": false,
  "is_staff": false,
  "is_verified": true,
  "date_joined": "2025-01-01T00:00:00Z"
}
```

### 1.6 Password Change

**Endpoint:** `POST /api/v1/auth/password/change/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
```

**Request Body:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123",
  "new_password2": "newpass123"
}
```

### 1.7 Password Reset

**Request Reset:**
- **Endpoint:** `POST /api/v1/auth/password/reset/`
- **Body:** `{ "email": "user@example.com" }`

**Confirm Reset:**
- **Endpoint:** `POST /api/v1/auth/password/reset/confirm/`
- **Body:** `{ "token": "...", "new_password": "...", "new_password2": "..." }`

### 1.8 Device Management

#### List Devices

**Endpoint:** `GET /api/v1/devices/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
```

**Response (200 OK):**
```json
{
  "code": "success",
  "data": [
    {
      "device_id": "iphone-11-pro-max-abc123",
      "device_name": "iPhone 11 Pro Max",
      "device_type": "phone",
      "user_agent": "Mozilla/5.0...",
      "ip_address_masked": "192.168.*.***",
      "last_login_at": "2025-12-01T10:30:00Z",
      "is_active": true,
      "created_at": "2025-11-15T08:00:00Z"
    },
    {
      "device_id": "laptop-dell-xyz789",
      "device_name": "Dell Laptop",
      "device_type": "laptop",
      "user_agent": "Mozilla/5.0...",
      "ip_address_masked": "10.0.*.***",
      "last_login_at": "2025-11-20T14:20:00Z",
      "is_active": false,
      "created_at": "2025-11-10T09:00:00Z"
    }
  ]
}
```

#### Revoke/Delete Device

**Endpoint:** `POST /api/v1/devices/revoke/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
Content-Type: application/json
```

**Request Body (Revoke - chỉ deactivate):**
```json
{
  "device_id": "iphone-11-pro-max-abc123"
}
```

**Request Body (Delete - xóa hẳn):**
```json
{
  "device_id": "iphone-11-pro-max-abc123",
  "delete": true
}
```

**Response (200 OK - Revoke):**
```json
{
  "code": "success",
  "message": "Device iPhone 11 Pro Max has been revoked. You can still login with this device later."
}
```

**Response (200 OK - Delete):**
```json
{
  "code": "success",
  "message": "Device iPhone 11 Pro Max has been permanently deleted. You can now register a new device of the same type."
}
```

**Lưu ý:**
- **Revoke (`delete: false` hoặc không có):** Device bị deactivate nhưng vẫn còn trong DB. Không cho phép đăng ký device mới cùng type. Có thể login lại với device này sau.
- **Delete (`delete: true`):** Device bị xóa hẳn khỏi DB. Cho phép đăng ký device mới cùng type.

**Error Responses:**
- `404`: Device not found
- `400`: Validation error

---

## 2. Course Management

### 2.1 Course Types

Hệ thống hỗ trợ 2 loại course:

1. **`course`** - Khóa học (default)
   - Self-registered user mua → Tạo generated account
   - Generated account mới có quyền truy cập

2. **`resource`** - Tài nguyên
   - Self-registered user mua → Enroll trực tiếp
   - Không tạo generated account

### 2.2 Course Levels

**Course Level:**
- `basic` - Cơ bản
- `intermediate` - Trung cấp
- `advanced` - Nâng cao

**Course Sub-Level:**
- `A1`, `A2` - Cho level `basic`
- `B1`, `B2` - Cho level `intermediate`
- `C1`, `C2` - Cho level `advanced`

**Validation:** `course_sub_level` phải khớp với `course_level`

### 2.3 List Courses

**Endpoint:** `GET /api/v1/courses/`

**Query Parameters:**
- `course_type`: Filter theo type (`course`, `resource`)
- `course_level`: Filter theo level (`basic`, `intermediate`, `advanced`)
- `course_sub_level`: Filter theo sub-level (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`)
- `is_published`: Filter published courses (`true`, `false`)
- `search`: Search trong title/description
- `page`: Page number (pagination)
- `page_size`: Items per page

**Request Headers:**
```
Authorization: Bearer <access-token>  # Optional - public nếu is_published=true
```

**Response (200 OK):**
```json
{
  "count": 10,
  "next": "http://api.example.com/api/v1/courses/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "Tiếng Anh A1",
      "slug": "tieng-anh-a1",
      "description": "...",
      "short_description": "...",
      "course_type": "course",
      "course_level": "basic",
      "course_sub_level": "A1",
      "price": 1000000,
      "discount_price": 800000,
      "is_published": true,
      "thumbnail": "https://...",
      "teacher": {
        "id": 1,
        "username": "teacher1",
        "first_name": "Teacher",
        "last_name": "Name"
      },
      "category": {
        "id": "uuid",
        "name": "Language"
      }
    }
  ]
}
```

### 2.4 Get Course Detail

**Endpoint:** `GET /api/v1/courses/{course_id}/`

**Response:** Tương tự list, nhưng có thêm full description và metadata

### 2.5 Get Courses Hierarchical (Grouped by Level)

**Endpoint:** `GET /api/v1/courses/hierarchical/`

**Mô tả:** Lấy danh sách courses được nhóm theo level (basic, intermediate, advanced) kèm thông tin classrooms và enrollment counts. Endpoint này phù hợp để hiển thị cấu trúc phân cấp như:

```
+ Cơ bản (basic)
  |--- Khóa học A1
  |-- Lớp 1 học viên
  |-- Lớp 3 học viên
  |--- Khóa học A2
  |-- Lớp 1 học viên
+ Trung cấp (intermediate)
  |--- Khóa học B1
  ...
```

**Request Headers:**
```
Authorization: Bearer <access-token>  # Optional - public endpoint
```

**Response (200 OK):**
```json
{
  "basic": [
    {
      "id": "uuid",
      "title": "Khóa học A1",
      "slug": "khoa-hoc-a1",
      "course_sub_level": "A1",
      "short_description": "Khóa học cơ bản",
      "price": 1000000.0,
      "discount_price": null,
      "thumbnail": "https://...",
      "classrooms": [
        {
          "id": "uuid",
          "title": "Lớp 1 học viên",
          "enrollment_count": 5,
          "student_count": 10,
          "available_slots": 5
        },
        {
          "id": "uuid",
          "title": "Lớp 3 học viên",
          "enrollment_count": 2,
          "student_count": 10,
          "available_slots": 8
        }
      ]
    },
    {
      "id": "uuid",
      "title": "Khóa học A2",
      "slug": "khoa-hoc-a2",
      "course_sub_level": "A2",
      "short_description": "Khóa học cơ bản nâng cao",
      "price": 1200000.0,
      "discount_price": null,
      "thumbnail": "https://...",
      "classrooms": []
    }
  ],
  "intermediate": [
    {
      "id": "uuid",
      "title": "Khóa học B1",
      "slug": "khoa-hoc-b1",
      "course_sub_level": "B1",
      "short_description": "Khóa học trung cấp",
      "price": 1500000.0,
      "discount_price": null,
      "thumbnail": "https://...",
      "classrooms": [
        {
          "id": "uuid",
          "title": "Lớp 1 học viên",
          "enrollment_count": 3,
          "student_count": 10,
          "available_slots": 7
        }
      ]
    }
  ],
  "advanced": []
}
```

**Response Fields:**
- `basic`, `intermediate`, `advanced`: Arrays chứa courses của từng level
- Mỗi course object có:
  - `id`: Course UUID
  - `title`: Tên khóa học
  - `slug`: URL slug
  - `course_sub_level`: Sub-level (A1, A2, B1, B2, C1, C2)
  - `short_description`: Mô tả ngắn
  - `price`: Giá gốc (float hoặc null)
  - `discount_price`: Giá khuyến mãi (float hoặc null)
  - `thumbnail`: URL thumbnail
  - `classrooms`: Array các classrooms với:
    - `id`: Classroom UUID
    - `title`: Tên lớp
    - `enrollment_count`: Số học viên đã đăng ký (active enrollments)
    - `student_count`: Tổng số chỗ trong lớp
    - `available_slots`: Số chỗ còn trống (student_count - enrollment_count)

**Lưu ý:**
- Chỉ trả về courses có `is_published=True` và có `course_level` (không null)
- Courses được sắp xếp theo `course_sub_level` (A1 → A2 → B1 → B2 → C1 → C2), sau đó theo `title`
- Courses không có level sẽ bị bỏ qua
- Endpoint này không có pagination (trả về tất cả courses)

**Permissions:**
- Public endpoint (không cần authentication)

### 2.6 Create Course (Teacher/Admin)

**Endpoint:** `POST /api/v1/courses/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Tiếng Anh A1",
  "slug": "tieng-anh-a1",
  "description": "Khóa học tiếng Anh cơ bản",
  "short_description": "Khóa học cơ bản",
  "category_id": "category-uuid",
  "teacher_id": 1,  // Optional - mặc định là current user
  "course_type": "course",  // "course" hoặc "resource"
  "course_level": "basic",  // Optional
  "course_sub_level": "A1",  // Optional, phải khớp với course_level
  "price": 1000000,
  "discount_price": 800000,  // Optional
  "is_published": true,
  "level": "beginner",  // Legacy field
  "language": "en"
}
```

**Response (201 Created):**
```json
{
  "id": "course-uuid",
  "title": "Tiếng Anh A1",
  "course_type": "course",
  "course_level": "basic",
  "course_sub_level": "A1",
  ...
}
```

**Permissions:**
- `is_teacher=True` hoặc `is_staff=True`

### 2.7 Update Course

**Endpoint:** `PUT /api/v1/courses/{course_id}/` hoặc `PATCH /api/v1/courses/{course_id}/`

**Request Body:** Tương tự create, chỉ gửi fields cần update

**Permissions:**
- Course owner (teacher) hoặc admin

### 2.8 Delete Course

**Endpoint:** `DELETE /api/v1/courses/{course_id}/`

**Permissions:**
- Course owner (teacher) hoặc admin

---

## 3. Order Flow

### 3.1 Create Order (Student)

**Endpoint:** `POST /api/v1/orders/`

**Request Headers:**
```
Authorization: Bearer <access-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
Content-Type: application/json
```

**Request Body:**
```json
{
  "course_id": "course-uuid",
  "classroom_id": "classroom-uuid",
  "payment_method": "bank_transfer",  // "bank_transfer", "credit_card", etc.
  "payment_reference": "BANK001",  // Optional - mã tham chiếu thanh toán
  "notes": "Muốn học lớp sáng"  // Optional
}
```

**Response (201 Created):**
```json
{
  "id": "order-uuid",
  "invoice_code": "ABC123DEF",
  "student": {
    "id": 1,
    "email": "student@example.com",
    "username": "student1"
  },
  "course": {
    "id": "course-uuid",
    "title": "Tiếng Anh A1",
    "course_type": "course"
  },
  "classroom": {
    "id": "classroom-uuid",
    "title": "Lớp Sáng"
  },
  "price_amount": 1000000,
  "price_currency": "VND",
  "payment_method": "bank_transfer",
  "payment_reference": "BANK001",
  "status": "pending",
  "notes": "Muốn học lớp sáng",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Status Values:**
- `pending` - Chờ duyệt
- `complete` - Đã duyệt
- `cancel` - Đã hủy

### 3.2 List My Orders

**Endpoint:** `GET /api/v1/orders/mine/`

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": "order-uuid",
      "invoice_code": "ABC123DEF",
      "course": {
        "id": "course-uuid",
        "title": "Tiếng Anh A1",
        "course_type": "course"
      },
      "status": "pending",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### 3.3 Get Order Detail

**Endpoint:** `GET /api/v1/orders/{order_id}/`

**Response:** Full order information với logs

### 3.4 Approve Order (Admin/Teacher)

**Endpoint:** `PATCH /api/v1/orders/{order_id}/`

**Request Headers:**
```
Authorization: Bearer <admin-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "complete",
  "admin_note": "Đã xác nhận thanh toán",
  "payment_reference": "BANK001_OK"  // Optional - cập nhật mã tham chiếu
}
```

**Response (200 OK):**
```json
{
  "id": "order-uuid",
  "invoice_code": "ABC123DEF",
  "status": "complete",
  "status_display": "Complete",
  "approved_at": "2025-01-01T00:00:00Z",
  "approved_by": {
    "id": 2,
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User"
  },
  "admin_note": "Đã xác nhận thanh toán",
  "payment_reference": "BANK001_OK",
  "student": {
    "id": 1,
    "email": "student@example.com",
    "account_type": "self_registered"
  },
  "course": {
    "id": "course-uuid",
    "title": "Tiếng Anh A1",
    "course_type": "course"
  }
}
```

**Business Logic khi Approve:**

1. **Nếu `course_type='course'` và `student.account_type='self_registered'`:**
   - ✅ Tạo **generated account** mới (random ID: 8 chữ in hoa + 4 số)
   - ✅ Tạo **enrollment** cho generated account
   - ✅ Gửi **email** với credentials đến self_registered user
   - ❌ Self_registered user **KHÔNG** được enroll

2. **Nếu `course_type='resource'` hoặc `student.account_type='generated'`:**
   - ✅ Tạo **enrollment** trực tiếp cho student
   - ❌ Không tạo generated account

**Permissions:**
- `is_staff=True` hoặc `is_teacher=True` (cho course của mình)

### 3.5 Cancel Order

**Endpoint:** `PATCH /api/v1/orders/{order_id}/`

**Request Headers:**
```
Authorization: Bearer <admin-token>
X-Device-ID: <device-id>
X-Device-Type: <device-type>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "cancel",
  "canceled_reason": "Học viên yêu cầu hủy",
  "admin_note": "Đã hủy theo yêu cầu"
}
```

**Response (200 OK):**
```json
{
  "id": "order-uuid",
  "status": "cancel",
  "status_display": "Canceled",
  "canceled_at": "2025-01-01T00:00:00Z",
  "canceled_reason": "Học viên yêu cầu hủy",
  "admin_note": "Đã hủy theo yêu cầu"
}
```

---

## 4. Generated Account Flow

### 4.1 Khi nào Generated Account được tạo?

Generated account được tự động tạo khi:
- ✅ `course_type='course'`
- ✅ `student.account_type='self_registered'`
- ✅ Order được **approve** bởi admin/teacher

### 4.2 Generated Account Format

**Username:**
- Format: `8 chữ in hoa + 4 số`
- Ví dụ: `ERZZKMDT2107`, `ABCDEFGH1234`
- **Không có prefix** (không có "test", "course_", etc.)

**Password:**
- Format: `12 ký tự random` (chữ + số)
- Ví dụ: `WVkYnA6XOFZp`, `aB3cD4eF5gH6`

**Email:**
- Format: `{username}@generated.local`
- Ví dụ: `ERZZKMDT2107@generated.local`

### 4.3 Email Notification

Khi generated account được tạo, hệ thống tự động gửi email đến **self_registered user** với:

**Email Content:**
- Subject: "Thông tin đăng nhập khóa học: {course_title}"
- Thông tin khóa học
- **Username** của generated account
- **Password** của generated account
- Link truy cập khóa học
- Lưu ý bảo mật (đổi password sau khi login)

**Frontend Action:**
- Hiển thị thông báo cho user: "Vui lòng kiểm tra email để nhận thông tin đăng nhập"
- Có thể hiển thị preview email content (optional)

### 4.4 Login với Generated Account

User có thể login bằng:
- **Username:** `ERZZKMDT2107`
- **Email:** `ERZZKMDT2107@generated.local`
- **Password:** (từ email)

**Endpoint:** `POST /api/v1/auth/login/`

**Request:**
```json
{
  "username": "ERZZKMDT2107",
  "password": "WVkYnA6XOFZp"
}
```

**Response:** Tương tự login thông thường

### 4.5 Access Control

**Generated Account:**
- ✅ Có quyền truy cập course đã được cấp
- ✅ Có thể xem enrolled courses
- ✅ Có thể học bài học trong course

**Self-Registered Account:**
- ❌ **KHÔNG** có quyền truy cập course (course_type='course')
- ✅ Có quyền truy cập resource (course_type='resource')

---

## 5. API Endpoints Reference

### 5.1 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register/` | Đăng ký | ❌ |
| POST | `/api/v1/auth/login/` | Đăng nhập | ❌ |
| POST | `/api/v1/auth/logout/` | Đăng xuất | ✅ |
| GET | `/api/v1/auth/me/` | Thông tin user | ✅ |
| POST | `/api/v1/auth/password/change/` | Đổi mật khẩu | ✅ |
| POST | `/api/v1/auth/password/reset/` | Yêu cầu reset | ❌ |
| POST | `/api/v1/auth/password/reset/confirm/` | Xác nhận reset | ❌ |
| POST | `/api/v1/auth/google/` | Google OAuth | ❌ |

### 5.2 Courses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/courses/` | List courses | ❌ (public nếu published) |
| POST | `/api/v1/courses/` | Tạo course | ✅ (teacher/admin) |
| GET | `/api/v1/courses/{id}/` | Course detail | ❌ (public nếu published) |
| GET | `/api/v1/courses/hierarchical/` | Courses grouped by level | ❌ (public) |
| PUT | `/api/v1/courses/{id}/` | Update course | ✅ (owner/admin) |
| DELETE | `/api/v1/courses/{id}/` | Delete course | ✅ (owner/admin) |
| GET | `/api/v1/courses/enrolled/` | My enrolled courses | ✅ |
| GET | `/api/v1/courses/mine/` | My courses (teacher) | ✅ (teacher) |

**Query Parameters:**
- `course_type`: `course`, `resource`
- `course_level`: `basic`, `intermediate`, `advanced`
- `course_sub_level`: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
- `is_published`: `true`, `false`
- `search`: Search term
- `page`: Page number
- `page_size`: Items per page

### 5.3 Classrooms

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/classrooms/` | List classrooms | ❌ |
| POST | `/api/v1/courses/{course_id}/classrooms/` | Tạo classroom | ✅ (teacher/admin) |
| GET | `/api/v1/classrooms/{id}/` | Classroom detail | ❌ |
| PUT | `/api/v1/classrooms/{id}/` | Update classroom | ✅ (teacher/admin) |
| DELETE | `/api/v1/classrooms/{id}/` | Delete classroom | ✅ (teacher/admin) |

### 5.4 Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/orders/` | Tạo order | ✅ (student) |
| GET | `/api/v1/orders/mine/` | My orders | ✅ |
| GET | `/api/v1/orders/` | List all orders | ✅ (admin/teacher) |
| GET | `/api/v1/orders/{id}/` | Order detail | ✅ |
| PATCH | `/api/v1/orders/{id}/` | Approve/Cancel order | ✅ (admin/teacher) |

### 5.5 Enrollments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/enrollments/mine/` | My enrollments | ✅ |
| GET | `/api/v1/enrollments/` | List enrollments | ✅ (admin/teacher) |

### 5.6 Devices

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/devices/` | List my devices | ✅ |
| POST | `/api/v1/devices/revoke/` | Revoke/Delete device | ✅ |

---

## 6. Error Handling

### 6.1 Error Response Format

Tất cả error responses đều có format:

```json
{
  "code": "error_code",
  "message": "Human readable error message",
  "details": {
    "field_name": ["Error message for this field"]
  }
}
```

### 6.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Validation failed |
| `authentication_failed` | 401 | Invalid credentials |
| `permission_denied` | 403 | Not enough permissions |
| `not_found` | 404 | Resource not found |
| `device_id_required` | 400 | Missing X-Device-ID header |
| `device_type_required` | 400 | Missing X-Device-Type header |
| `device_type_limit_exceeded` | 403 | Đã có thiết bị khác cùng loại |
| `session_revoked` | 401 | Token đã bị revoke |
| `device_mismatch` | 401 | Device ID không khớp |

### 6.3 Device Limit Error

**Error Code:** `device_type_limit_exceeded`

**Response:**
```json
{
  "code": "device_type_limit_exceeded",
  "message": "Account already has a laptop device registered (device-name). Only one device per type is allowed. Please use the previously registered device."
}
```

**Frontend Action:**
- Hiển thị thông báo: "Bạn đã đăng nhập trên thiết bị khác cùng loại. Vui lòng đăng xuất thiết bị cũ hoặc sử dụng thiết bị đã đăng ký."
- Có thể hiển thị danh sách devices và cho phép revoke device cũ

### 6.4 Session Revoked Error

**Error Code:** `session_revoked`

**Response:**
```json
{
  "code": "session_revoked",
  "message": "Your session has been revoked. Please login again."
}
```

**Frontend Action:**
- Redirect về login page
- Clear local storage/session storage
- Hiển thị thông báo: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."

---

## 7. Examples

### 7.1 Complete Registration & Login Flow

```javascript
// 1. Generate Device ID (lưu trong localStorage)
const deviceId = localStorage.getItem('deviceId') || 
  `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('deviceId', deviceId);

// 2. Register
const registerResponse = await fetch('http://api.example.com/api/v1/auth/register/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId,
    'X-Device-Type': 'laptop'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'user123',
    password: 'password123',
    password2: 'password123',
    first_name: 'First',
    last_name: 'Last'
  })
});

// 3. Login
const loginResponse = await fetch('http://api.example.com/api/v1/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Device-ID': deviceId,
    'X-Device-Type': 'laptop'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { access, user } = await loginResponse.json();
localStorage.setItem('accessToken', access);
```

### 7.2 Create Course (Teacher)

```javascript
const createCourse = async (courseData) => {
  const response = await fetch('http://api.example.com/api/v1/courses/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      title: 'Tiếng Anh A1',
      slug: 'tieng-anh-a1',
      description: 'Khóa học tiếng Anh cơ bản',
      short_description: 'Khóa học cơ bản',
      category_id: 'category-uuid',
      course_type: 'course',
      course_level: 'basic',
      course_sub_level: 'A1',
      price: 1000000,
      is_published: true
    })
  });
  
  return await response.json();
};
```

### 7.3 Get Courses Hierarchical

```javascript
const getCoursesHierarchical = async () => {
  const response = await fetch('http://api.example.com/api/v1/courses/hierarchical/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
      // Không cần Authorization - public endpoint
    }
  });
  
  const data = await response.json();
  
  // Data structure:
  // {
  //   "basic": [...],
  //   "intermediate": [...],
  //   "advanced": [...]
  // }
  
  return data;
};

// Example usage: Render hierarchical course list
const renderCoursesHierarchical = async () => {
  const courses = await getCoursesHierarchical();
  
  // Render Basic level
  if (courses.basic && courses.basic.length > 0) {
    console.log('=== Cơ bản ===');
    courses.basic.forEach(course => {
      console.log(`--- ${course.title} (${course.course_sub_level})`);
      course.classrooms.forEach(classroom => {
        console.log(`  |-- ${classroom.title} (${classroom.enrollment_count}/${classroom.student_count} học viên, còn ${classroom.available_slots} chỗ)`);
      });
    });
  }
  
  // Render Intermediate level
  if (courses.intermediate && courses.intermediate.length > 0) {
    console.log('=== Trung cấp ===');
    courses.intermediate.forEach(course => {
      console.log(`--- ${course.title} (${course.course_sub_level})`);
      course.classrooms.forEach(classroom => {
        console.log(`  |-- ${classroom.title} (${classroom.enrollment_count}/${classroom.student_count} học viên, còn ${classroom.available_slots} chỗ)`);
      });
    });
  }
  
  // Render Advanced level
  if (courses.advanced && courses.advanced.length > 0) {
    console.log('=== Nâng cao ===');
    courses.advanced.forEach(course => {
      console.log(`--- ${course.title} (${course.course_sub_level})`);
      course.classrooms.forEach(classroom => {
        console.log(`  |-- ${classroom.title} (${classroom.enrollment_count}/${classroom.student_count} học viên, còn ${classroom.available_slots} chỗ)`);
      });
    });
  }
  
  return courses;
};
```

### 7.4 Create Order (Student)

```javascript
const createOrder = async (courseId, classroomId) => {
  const response = await fetch('http://api.example.com/api/v1/orders/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      course_id: courseId,
      classroom_id: classroomId,
      payment_method: 'bank_transfer',
      payment_reference: 'BANK001',
      notes: 'Muốn học lớp sáng'
    })
  });
  
  return await response.json();
};
```

### 7.5 Approve Order (Admin)

```javascript
const approveOrder = async (orderId, adminNote, paymentReference) => {
  const response = await fetch(`http://api.example.com/api/v1/orders/${orderId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      status: 'complete',
      admin_note: adminNote,
      payment_reference: paymentReference  // Optional
    })
  });
  
  const order = await response.json();
  
  // Check if generated account was created
  if (order.course.course_type === 'course' && 
      order.student.account_type === 'self_registered') {
    // Show notification: "Generated account created. Email sent to student."
    showNotification('Đã tạo tài khoản và gửi email cho học viên');
  }
  
  return order;
};

const cancelOrder = async (orderId, canceledReason, adminNote) => {
  const response = await fetch(`http://api.example.com/api/v1/orders/${orderId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      status: 'cancel',
      canceled_reason: canceledReason,
      admin_note: adminNote
    })
  });
  
  return await response.json();
};
```

### 7.6 Device Management

#### List Devices

```javascript
const getMyDevices = async () => {
  const response = await fetch('http://api.example.com/api/v1/devices/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    }
  });
  
  const data = await response.json();
  return data.data; // Array of devices
};
```

#### Revoke Device (Deactivate)

```javascript
const revokeDevice = async (deviceId) => {
  const response = await fetch('http://api.example.com/api/v1/devices/revoke/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      device_id: deviceId
      // delete: false (default) - chỉ deactivate
    })
  });
  
  return await response.json();
};
```

#### Delete Device (Permanently Remove)

```javascript
const deleteDevice = async (deviceId) => {
  const response = await fetch('http://api.example.com/api/v1/devices/revoke/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    },
    body: JSON.stringify({
      device_id: deviceId,
      delete: true  // Xóa hẳn - cho phép đăng ký device mới cùng type
    })
  });
  
  return await response.json();
};
```

### 7.7 Handle Device Limit Error

```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://api.example.com/api/v1/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': localStorage.getItem('deviceId'),
        'X-Device-Type': 'laptop'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.code === 'device_type_limit_exceeded') {
      // Lấy danh sách devices để hiển thị
      const devices = await getMyDevices();
      const oldDevice = devices.find(d => d.device_type === 'laptop' && d.device_id !== localStorage.getItem('deviceId'));
      
      if (oldDevice) {
        // Show dialog với thông tin device cũ
        const confirm = await showConfirmDialog(
          'Thiết bị đã đăng nhập',
          `Bạn đã đăng nhập trên thiết bị khác: ${oldDevice.device_name || oldDevice.device_id}. Bạn có muốn xóa thiết bị cũ để đăng nhập thiết bị mới không?`
        );
        
        if (confirm) {
          // Xóa device cũ (delete: true) để cho phép đăng ký device mới
          await deleteDevice(oldDevice.device_id);
          
          // Login lại
          return handleLogin(email, password);
        }
      }
      
      return { error: 'Device limit exceeded' };
    }
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.data.access);
      return data.data;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Example: Device Management UI

```javascript
// Component để quản lý devices
const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  
  useEffect(() => {
    loadDevices();
  }, []);
  
  const loadDevices = async () => {
    const deviceList = await getMyDevices();
    setDevices(deviceList);
  };
  
  const handleRevokeDevice = async (deviceId) => {
    const confirm = await showConfirmDialog(
      'Xác nhận',
      'Bạn có chắc muốn đăng xuất thiết bị này? Bạn vẫn có thể đăng nhập lại với thiết bị này sau.'
    );
    
    if (confirm) {
      await revokeDevice(deviceId);
      loadDevices();
    }
  };
  
  const handleDeleteDevice = async (deviceId) => {
    const confirm = await showConfirmDialog(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa vĩnh viễn thiết bị này? Sau khi xóa, bạn có thể đăng ký thiết bị mới cùng loại.'
    );
    
    if (confirm) {
      await deleteDevice(deviceId);
      loadDevices();
    }
  };
  
  return (
    <div>
      <h2>Quản lý thiết bị</h2>
      {devices.map(device => (
        <div key={device.device_id}>
          <p>{device.device_name || device.device_id}</p>
          <p>Loại: {device.device_type}</p>
          <p>Trạng thái: {device.is_active ? 'Đang hoạt động' : 'Đã đăng xuất'}</p>
          <p>Đăng nhập lần cuối: {new Date(device.last_login_at).toLocaleString()}</p>
          
          {device.is_active && (
            <button onClick={() => handleRevokeDevice(device.device_id)}>
              Đăng xuất
            </button>
          )}
          
          <button onClick={() => handleDeleteDevice(device.device_id)}>
            Xóa vĩnh viễn
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 7.8 Check Enrolled Courses

```javascript
const getEnrolledCourses = async () => {
  const response = await fetch('http://api.example.com/api/v1/courses/enrolled/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'X-Device-ID': localStorage.getItem('deviceId'),
      'X-Device-Type': 'laptop'
    }
  });
  
  const data = await response.json();
  
  // Filter by account type
  const user = await getCurrentUser();
  
  if (user.account_type === 'self_registered') {
    // Chỉ hiển thị resource courses
    return data.results.filter(c => c.course_type === 'resource');
  } else if (user.account_type === 'generated') {
    // Hiển thị tất cả courses (chỉ course_type='course')
    return data.results;
  }
  
  return data.results;
};
```

---

## 8. Best Practices

### 8.1 Device ID Management

- **Lưu trữ:** localStorage hoặc sessionStorage
- **Format:** Unique, persistent cho mỗi device
- **Không thay đổi:** Giữ nguyên device ID cho mỗi device
- **Ví dụ:** `iphone-11-pro-max-abc123`, `laptop-dell-xyz789`

### 8.2 Token Management

- **Lưu trữ:** localStorage hoặc secure storage
- **Expiry:** 7 ngày (không có refresh token)
- **Refresh:** User phải login lại khi token hết hạn
- **Revoke:** Clear token khi logout

### 8.3 Error Handling

- **Always check response status**
- **Handle device limit errors gracefully**
- **Show user-friendly error messages**
- **Redirect to login khi session revoked**

### 8.4 Course Type Handling

- **Hiển thị rõ ràng:** "Khóa học" vs "Tài nguyên"
- **Thông báo cho user:** Khi mua course, sẽ nhận email với generated account
- **Check enrollment:** Sau khi approve order, check enrollment cho đúng account type

---

## 9. Testing

### 9.1 Test Device Limit

```bash
# Login trên device 1
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "X-Device-ID: device-1" \
  -H "X-Device-Type: laptop" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Login trên device 2 (cùng type) → Should fail
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "X-Device-ID: device-2" \
  -H "X-Device-Type: laptop" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### 9.2 Test Generated Account Flow

1. Tạo self_registered user
2. Tạo course với `course_type='course'`
3. Tạo order
4. Approve order
5. Check email có generated account credentials
6. Login với generated account
7. Verify enrollment

---

## 10. Support

Nếu có vấn đề khi tích hợp, vui lòng:
1. Kiểm tra Swagger docs: `http://localhost:8000/swagger/`
2. Kiểm tra health check: `http://localhost:8000/health/`
3. Xem logs: `docker compose logs web`
4. Liên hệ backend team

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
