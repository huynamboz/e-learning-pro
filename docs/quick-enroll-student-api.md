# Quick Enroll Student API Documentation

## Tổng quan

API để teacher có thể nhanh chóng thêm học sinh vào classroom thay vì phải qua flow mua hàng thông thường. Flow này tự động tạo order (đã xác nhận), generate account nếu học sinh chưa có, và gửi thông tin đăng nhập qua email.

**Use Case**: Teacher click vào session trong calendar → Dialog hiện detail classroom → Thêm học sinh bằng email → Hệ thống tự động xử lý enrollment.

---

## Flow Overview

1. Teacher click vào session trong calendar
2. Dialog hiện lên với:
   - Thông tin detail của classroom
   - Danh sách học sinh đã enrolled
   - Nút "Thêm học sinh"
3. Teacher nhập email và bấm "Kiểm tra"
4. Hệ thống check email:
   - Nếu đã có account: Hiện thông tin user
   - Nếu chưa có: Sẽ tự động generate khi thêm
5. Teacher bấm "Thêm học sinh này"
6. Backend tự động:
   - Tạo order (status: confirmed/paid)
   - Nếu chưa có account: Generate account với `account_type: 'generated'`
   - Enroll học sinh vào classroom
   - Gửi email thông tin đăng nhập (nếu account mới được generate)
7. Cập nhật danh sách học sinh trong dialog

---

## Endpoints

### 1. Check Email and Get User Info

**Endpoint**: `GET /api/v1/users/check-email/?email={email}`

**Description**: Kiểm tra xem email đã có trong hệ thống chưa. Nếu có, trả về thông tin user. Nếu chưa có, trả về thông báo để frontend hiển thị rằng sẽ tạo account mới.

**Permission**: Authenticated (Admin hoặc Teacher)

**Query Parameters:**
- `email`: String (required) - Email cần kiểm tra

**Response 200 OK (Email đã tồn tại):**

```json
{
  "exists": true,
  "user": {
    "id": 123,
    "username": "student_username",
    "email": "student@example.com",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "full_name": "Nguyen Van A",
    "phone": "+84123456789",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**Response 200 OK (Email chưa tồn tại):**

```json
{
  "exists": false,
  "message": "Email chưa có trong hệ thống. Account sẽ được tạo tự động khi thêm học sinh."
}
```

**Response 400 Bad Request:**

```json
{
  "detail": "Invalid email format"
}
```

---

### 2. Quick Enroll Student to Classroom

**Endpoint**: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/`

**Description**: Thêm học sinh vào classroom một cách nhanh chóng. API này tự động:
- Tạo order với status "confirmed/paid" (không cần payment)
- Generate account mới nếu email chưa có trong hệ thống (email format: `{random_string}@generated.local`, ví dụ: `EVEVIRYF3948@generated.local`)
- Enroll học sinh vào classroom
- Gửi email thông tin đăng nhập đến email nhập vào (nếu account mới được tạo)

**Permission**: Authenticated (Admin hoặc Teacher)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Request Body:**

```json
{
  "email": "student@example.com",
  "send_welcome_email": true
}
```

**Fields:**
- `email`: String (required) - Email của học sinh
- `send_welcome_email`: Boolean (optional, default: true) - Có gửi email welcome không (chỉ áp dụng khi tạo account mới)

**Response 201 Created:**

```json
{
  "success": true,
  "message": "Đã thêm học sinh vào lớp thành công",
  "order": {
    "id": "order-uuid",
    "user": 123,
    "course": "course-uuid",
    "classroom": "classroom-uuid",
    "status": "confirmed",
    "total_amount": "100.00",
    "created_at": "2026-01-15T10:00:00.000Z"
  },
  "user": {
    "id": 123,
    "username": "EVEVIRYF3948",
    "email": "EVEVIRYF3948@generated.local",
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "account_type": "generated",
    "is_new_account": true
  },
  "enrollment": {
    "id": "enrollment-uuid",
    "classroom": "classroom-uuid",
    "user": 123,
    "enrolled_at": "2026-01-15T10:00:00.000Z",
    "status": "active"
  }
}
```

**Response 400 Bad Request:**

```json
{
  "detail": "Student is already enrolled in this classroom"
}
```

**Response 404 Not Found:**

```json
{
  "detail": "Classroom not found"
}
```

---

### 3. Remove Student from Classroom

**Endpoint**: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/`

**Description**: Xóa học sinh khỏi classroom. API này sẽ:
- Xóa enrollment record
- Cập nhật order status (có thể set thành "cancelled" hoặc giữ nguyên, tùy business logic)
- Gửi email thông báo (optional)

**Permission**: Authenticated (Admin hoặc Teacher)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom
- `user_id`: Integer (required) - ID của user (học sinh)

**Response 200 OK:**

```json
{
  "success": true,
  "message": "Đã xóa học sinh khỏi lớp thành công"
}
```

**Response 404 Not Found:**

```json
{
  "detail": "Student is not enrolled in this classroom"
}
```

---

### 4. Get Classroom Students List

**Endpoint**: `GET /api/v1/classrooms/{classroom_id}/students/`

**Description**: Lấy danh sách học sinh đã enrolled vào classroom. API này được sử dụng để hiển thị danh sách trong dialog.

**Permission**: Authenticated (Admin hoặc Teacher)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Query Parameters:**
- `page`: Integer (optional, default: 1) - Số trang
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

**Response 200 OK:**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "username": "student_username",
      "email": "student@example.com",
      "first_name": "Nguyen",
      "last_name": "Van A",
      "full_name": "Nguyen Van A",
      "phone": "+84123456789",
      "avatar": "https://example.com/avatar.jpg",
      "enrolled_at": "2026-01-15T10:00:00.000Z",
      "enrollment_status": "active"
    }
  ]
}
```

---

## Error Handling

### Common Errors

1. **Email đã enrolled:**
   ```json
   {
     "detail": "Student is already enrolled in this classroom"
   }
   ```

2. **Classroom không tồn tại:**
   ```json
   {
     "detail": "Classroom not found"
   }
   ```

3. **Email format không hợp lệ:**
   ```json
   {
     "detail": "Invalid email format"
   }
   ```

4. **Permission denied:**
   ```json
   {
     "detail": "You do not have permission to perform this action"
   }
   ```

---

## Testing

### Test Cases

1. **Check email - Email đã tồn tại:**
   - Request: `GET /api/v1/users/check-email/?email=existing@example.com`
   - Expected: Return user info với `exists: true`

2. **Check email - Email chưa tồn tại:**
   - Request: `GET /api/v1/users/check-email/?email=new@example.com`
   - Expected: Return `exists: false` với message

3. **Quick enroll - User đã có account:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email đã có
   - Expected: Tạo order, enroll user, không tạo account mới, `is_new_account: false`

4. **Quick enroll - User chưa có account:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email mới
   - Expected: Tạo account mới với `email_linked`, tạo order, enroll, gửi email, `is_new_account: true`

5. **Quick enroll - Email đã enrolled:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email đã enrolled
   - Expected: 400 error "Student is already enrolled"

6. **Remove student:**
   - Request: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/`
   - Expected: Xóa enrollment, return success

7. **Get students list:**
   - Request: `GET /api/v1/classrooms/{classroom_id}/students/`
   - Expected: Return danh sách học sinh đã enrolled

---

## Related Endpoints

- `GET /api/v1/classrooms/{classroom_id}/` - Lấy thông tin classroom (đã có)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/` - Lấy thông tin session detail (đã có)
- `POST /api/v1/orders/` - Tạo order thông thường (đã có)
- `GET /api/v1/users/{user_id}/` - Lấy thông tin user (đã có)

---

---

## Frontend Integration Notes

### Dialog Flow

1. **Click session in calendar:**
   - Call `GET /api/v1/courses/{course_id}/sessions/{session_id}/` để lấy session detail
   - Call `GET /api/v1/classrooms/{classroom_id}/students/` để lấy danh sách học sinh

2. **Click "Thêm học sinh":**
   - Hiện input email và nút "Kiểm tra"

3. **Click "Kiểm tra":**
   - Call `GET /api/v1/users/check-email/?email={email}`
   - Nếu `exists: true`: Hiện thông tin user và nút "Thêm học sinh này"
   - Nếu `exists: false`: Hiện message và nút "Thêm học sinh này" (vẫn có thể thêm)

4. **Click "Thêm học sinh này":**
   - Call `POST /api/v1/classrooms/{classroom_id}/quick-enroll/`
   - Show loading state
   - On success: Refresh danh sách học sinh, show success message
   - On error: Show error message

5. **Click "Xóa" trong danh sách học sinh:**
   - Call `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/`
   - Refresh danh sách học sinh

---

## Example Request/Response

### Check Email (Existing User)

**Request:**
```http
GET /api/v1/users/check-email/?email=student@example.com
Authorization: Bearer {token}
```

**Response:**
```json
{
  "exists": true,
  "user": {
    "id": 123,
    "username": "student_user",
    "email": "student@example.com",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "full_name": "Nguyen Van A"
  }
}
```

### Quick Enroll (New User)

**Request:**
```http
POST /api/v1/classrooms/classroom-uuid-1/quick-enroll/
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "newstudent@example.com",
  "send_welcome_email": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm học sinh vào lớp thành công",
  "order": {
    "id": "order-uuid",
    "status": "confirmed",
    "total_amount": "100.00"
  },
  "user": {
    "id": 124,
    "username": "newstudent_abc123",
    "email": "newstudent@example.com",
    "account_type": "generated",
    "is_new_account": true
  },
  "enrollment": {
    "id": "enrollment-uuid",
    "status": "active"
  }
}
```

---

## Notes

- Account được generate tự động sẽ có:
  - `account_type: 'generated'` để phân biệt với account user tự đăng ký (`account_type: 'email'` hoặc `'google'`)
  - Email format: `{random_string}@generated.local` (ví dụ: `EVEVIRYF3948@generated.local`)
  - Username: Phần trước @ của email (ví dụ: `EVEVIRYF3948`)
- Email welcome sẽ được gửi đến email mà teacher nhập vào (không phải email `@generated.local`)
- Order được tạo với status "confirmed" hoặc "paid" để đánh dấu đã thanh toán/xác nhận
- Có thể thêm notification cho teacher khi thêm học sinh thành công
