# Quick Enroll Student API Documentation

## Tổng quan

API để teacher có thể nhanh chóng thêm học sinh vào classroom thay vì phải qua flow mua hàng thông thường. Flow này tự động tạo order (đã xác nhận), luôn generate account mới, và gửi thông tin đăng nhập qua email đến địa chỉ email mà teacher nhập vào.

**Use Case**: Teacher click vào session trong calendar → Dialog hiện detail classroom → Thêm học sinh bằng email → Hệ thống tự động xử lý enrollment.

---

## Flow Overview

1. Teacher click vào session trong calendar
2. Dialog hiện lên với:
   - Thông tin detail của classroom
   - Danh sách học sinh đã enrolled
   - Nút "Thêm học sinh"
3. Teacher nhập email (email này sẽ được dùng để gửi thông tin account được generate) và bấm "Thêm học sinh này"
4. Backend tự động:
   - Tạo order (status: confirmed/paid)
   - Luôn generate account mới với `account_type: 'generated'` (không check account tồn tại)
   - Set `email_linked` = email mà teacher nhập vào
   - Enroll học sinh vào classroom
   - Gửi email thông tin đăng nhập đến `email_linked` (email mà teacher nhập vào)
5. Cập nhật danh sách học sinh trong dialog

---

## Endpoints

### 1. Quick Enroll Student to Classroom

**Endpoint**: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/`

**Description**: Thêm học sinh vào classroom một cách nhanh chóng. API này tự động:
- Tạo order với status "confirmed/paid" (không cần payment)
- Luôn generate account mới với `account_type: 'generated'` (không check account tồn tại)
  - Account email format: `{random_string}@generated.local` (ví dụ: `EVEVIRYF3948@generated.local`)
  - `email_linked`: Email mà teacher nhập vào (ví dụ: `example@gmail.com`) - email này sẽ được dùng để gửi thông tin đăng nhập
  - **Lưu ý**: `email_linked` không phải unique, có thể dùng 1 email để generate nhiều account khác nhau. Nhiều account có thể có cùng `email_linked`.
- Enroll học sinh vào classroom
- Gửi email thông tin đăng nhập đến `email_linked` (email mà teacher nhập vào)

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
- `email`: String (required) - Email để gửi thông tin đăng nhập (sẽ được set vào `email_linked` của account được generate)
  - **Lưu ý**: Email này không cần unique, có thể dùng để generate nhiều account khác nhau
- `send_welcome_email`: Boolean (optional, default: true) - Có gửi email welcome không

**Response 201 Created:**

```json
{
  "success": true,
  "message": "Đã thêm học sinh vào lớp thành công",
  "order": {
    "id": "order-uuid",
    "invoice_code": "ABC123DEF",
    "student": {
      "id": 123,
      "email": "EVEVIRYF3948@generated.local",
      "username": "EVEVIRYF3948",
      "email_linked": "student@example.com"
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
    "price_amount": "100.00",
    "price_currency": "VND",
    "payment_method": "quick_enroll",
    "payment_reference": "",
    "status": "complete",
    "status_display": "Đã xác nhận",
    "notes": "",
    "admin_note": "",
    "user_email_generated": "EVEVIRYF3948@generated.local",
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-01-15T10:00:00.000Z"
  },
  "user": {
    "id": 123,
    "username": "EVEVIRYF3948",
    "email": "EVEVIRYF3948@generated.local",
    "email_linked": "student@example.com",
    "first_name": "",
    "last_name": "",
    "full_name": "",
    "account_type": "generated"
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

**Lưu ý**: Validation enrollment check dựa trên account cụ thể (user_id), không phải `email_linked`. Vì `email_linked` không unique, nên có thể có nhiều account với cùng `email_linked` nhưng khác nhau về enrollment status.

hoặc

```json
{
  "detail": "Invalid email format"
}
```

**Response 404 Not Found:**

```json
{
  "detail": "Classroom not found"
}
```

---

### 2. Remove Student from Classroom

**Endpoint**: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/`

**Description**: Xóa học sinh khỏi classroom. API này sẽ:
- Xóa enrollment record
- Xóa order (nếu `delete_order=true`)
- Cập nhật order status thành "cancel" (nếu `delete_order=false`, default)
- Gửi email thông báo (optional)

**Permission**: Authenticated (Admin hoặc Teacher của classroom)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom
- `user_id`: Integer (required) - ID của user (học sinh)

**Query Parameters:**
- `delete_order`: Boolean (optional, default: `false`) - Có xóa luôn đơn hàng của học sinh này không
  - `false` (default): Chỉ xóa enrollment, order status được set thành "cancelled"
  - `true`: Xóa luôn order record (sử dụng khi lỡ thêm lộn và muốn xóa luôn đơn hàng để doanh thu khỏi bị nhầm)

**Lưu ý về Order:**
- Order record cần chứa field `user_email_generated` (email của account được generate) để có thể query và xóa đúng order khi cần
- Khi xóa user (ví dụ: `EVEVIRYF3948@generated.local`), cần tìm được order nào của user đó để xóa
- Order đang lưu theo email mà teacher nhập vào (`newstudent@example.com`), không phải email của account được generate (`EVEVIRYF3948@generated.local`)
- Vì vậy order cần lưu thêm field `user_email_generated` (email của account được generate) để khi xóa user, có thể query order theo email của account đó
- Khi `delete_order=true`, backend sẽ query order dựa trên `user_email_generated` và `classroom_id` để tìm đúng order của user bị xóa
- Order response có cấu trúc đầy đủ với nested objects: `student`, `course`, `classroom`
- Order status sẽ là `"complete"` (không phải `"pending"`) vì đây là quick enroll, không cần approval

**Response 200 OK:**

```json
{
  "success": true,
  "message": "Đã xóa học sinh khỏi lớp thành công",
  "order_deleted": false
}
```

hoặc (nếu `delete_order=true`):

```json
{
  "success": true,
  "message": "Đã xóa học sinh khỏi lớp thành công",
  "order_deleted": true
}
```

**Response 404 Not Found:**

```json
{
  "detail": "Student is not enrolled in this classroom"
}
```

hoặc

```json
{
  "detail": "Classroom not found"
}
```

hoặc

```json
{
  "detail": "User not found"
}
```

**Response 403 Forbidden:**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Lưu ý:**
- Chỉ xóa enrollment của user cụ thể (user_id) khỏi classroom cụ thể (classroom_id)
- Không ảnh hưởng đến các enrollment khác của user (nếu user enrolled vào classroom khác)
- Không xóa account của user, chỉ xóa enrollment record
- **Order handling:**
  - Default (`delete_order=false`): Order status được set thành "cancel", order record vẫn tồn tại
  - Với `delete_order=true`: Order record bị xóa hoàn toàn khỏi database (dùng khi lỡ thêm lộn)
  - Order record cần lưu thêm field `user_email_generated` (email của account được generate) để hỗ trợ query và xóa đúng order
  - Khi xóa user (ví dụ: `EVEVIRYF3948@generated.local`), backend sẽ query order theo `user_email_generated` của account đó để tìm đúng order cần xóa
  - Order không lưu theo email mà teacher nhập vào (`newstudent@example.com`) vì email đó không phải email của account trong hệ thống, chỉ là `email_linked` để gửi thông tin đăng nhập

---

## Error Handling

### Common Errors

1. **Account đã enrolled:**
   ```json
   {
     "detail": "Student is already enrolled in this classroom"
   }
   ```
   **Lưu ý**: Validation enrollment check dựa trên account cụ thể (user_id), không phải `email_linked`. Vì `email_linked` không unique, nên có thể có nhiều account với cùng `email_linked` nhưng khác nhau về enrollment status.

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

1. **Quick enroll - Tạo account mới:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email bất kỳ
   - Expected: Luôn tạo account mới với `account_type: 'generated'`, tạo order, enroll, gửi email đến `email_linked`

2. **Quick enroll - Cùng email_linked, account khác nhau:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email đã được dùng để generate account khác
   - Expected: Vẫn tạo account mới (vì `email_linked` không unique), tạo order, enroll account mới

3. **Quick enroll - Account đã enrolled:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với account đã enrolled (check theo user_id, không phải email_linked)
   - Expected: 400 error "Student is already enrolled in this classroom"

4. **Quick enroll - Email format không hợp lệ:**
   - Request: `POST /api/v1/classrooms/{classroom_id}/quick-enroll/` với email không hợp lệ
   - Expected: 400 error "Invalid email format"

4. **Remove student (default - không xóa order):**
   - Request: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/`
   - Expected: Xóa enrollment record, order status set thành "cancelled", return 200 OK với `order_deleted: false`

5. **Remove student - Xóa luôn order:**
   - Request: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/?delete_order=true`
   - Expected: Xóa enrollment record, xóa luôn order record, return 200 OK với `order_deleted: true`

6. **Remove student - Student không enrolled:**
   - Request: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/` với user_id chưa enrolled
   - Expected: 404 error "Student is not enrolled in this classroom"

7. **Remove student - Permission denied:**
   - Request: `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/` với user không phải Admin/Teacher
   - Expected: 403 error "You do not have permission to perform this action"

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
   - Call `GET /api/v1/classrooms/{classroom_id}/students/` để lấy danh sách học sinh (API riêng, không nằm trong doc này)

2. **Click "Thêm học sinh":**
   - Hiện input email và nút "Thêm học sinh này"

3. **Click "Thêm học sinh này":**
   - Call `POST /api/v1/classrooms/{classroom_id}/quick-enroll/`
   - Show loading state
   - On success: Refresh danh sách học sinh, show success message
   - On error: Show error message

4. **Click "Xóa" trong danh sách học sinh:**
   - Show confirm dialog để xác nhận
   - Option: Checkbox "Xóa luôn đơn hàng" (default: unchecked)
   - Call `DELETE /api/v1/classrooms/{classroom_id}/students/{user_id}/` (hoặc với `?delete_order=true` nếu checkbox được check)
   - On success: Refresh danh sách học sinh, show success message với thông tin `order_deleted`
   - On error: Show error message

---

## Example Request/Response

### Remove Student from Classroom (Default - không xóa order)

**Request:**
```http
DELETE /api/v1/classrooms/classroom-uuid-1/students/123/
Authorization: Bearer {token}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Đã xóa học sinh khỏi lớp thành công",
  "order_deleted": false
}
```

---

### Remove Student from Classroom (Xóa luôn order)

**Request:**
```http
DELETE /api/v1/classrooms/classroom-uuid-1/students/123/?delete_order=true
Authorization: Bearer {token}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Đã xóa học sinh khỏi lớp thành công",
  "order_deleted": true
}
```

**Response 404 Not Found:**
```json
{
  "detail": "Student is not enrolled in this classroom"
}
```

---

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
    "invoice_code": "ABC123DEF",
    "student": {
      "id": 124,
      "email": "EVEVIRYF3948@generated.local",
      "username": "EVEVIRYF3948",
      "email_linked": "newstudent@example.com"
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
    "price_amount": "100.00",
    "price_currency": "VND",
    "payment_method": "quick_enroll",
    "payment_reference": "",
    "status": "complete",
    "status_display": "Đã xác nhận",
    "notes": "",
    "admin_note": "",
    "user_email_generated": "EVEVIRYF3948@generated.local",
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-01-15T10:00:00.000Z"
  },
  "user": {
    "id": 124,
    "username": "EVEVIRYF3948",
    "email": "EVEVIRYF3948@generated.local",
    "email_linked": "newstudent@example.com",
    "account_type": "generated"
  },
  "enrollment": {
    "id": "enrollment-uuid",
    "status": "active"
  }
}
```

---

## Notes

- **Flow đơn giản hóa**: Hệ thống luôn tạo account mới, không check account tồn tại. Email mà teacher nhập vào sẽ được dùng để gửi thông tin đăng nhập.

- Account được generate tự động sẽ có:
  - `account_type: 'generated'` để phân biệt với account user tự đăng ký (`account_type: 'email'` hoặc `'google'`)
  - `email`: Format `{random_string}@generated.local` (ví dụ: `EVEVIRYF3948@generated.local`) - email của account trong hệ thống (unique)
  - `email_linked`: Email mà teacher nhập vào (ví dụ: `example@gmail.com`) - email để gửi thông tin đăng nhập
    - **Lưu ý quan trọng**: `email_linked` **KHÔNG PHẢI UNIQUE**. Có thể dùng 1 email để generate nhiều account khác nhau. Nhiều account có thể có cùng `email_linked`.
  - `username`: Phần trước @ của email account (ví dụ: `EVEVIRYF3948`)

- Khi teacher nhập email (ví dụ: `example@gmail.com`), hệ thống sẽ:
  1. Luôn tạo account mới với `account_type: 'generated'` (không check account tồn tại)
  2. Set `email_linked = example@gmail.com` (có thể trùng với `email_linked` của account khác)
  3. Tạo order với status "complete"
  4. Enroll học sinh vào classroom
  5. Gửi email thông tin đăng nhập đến `email_linked` (example@gmail.com)

- **Validation Enrollment**:
  - Check xem account cụ thể (user_id) đã enrolled vào classroom chưa
  - **KHÔNG** check dựa trên `email_linked` vì `email_linked` không unique
  - Có thể có nhiều account với cùng `email_linked` nhưng khác nhau về enrollment status

- **Use Case**:
  - Teacher có thể dùng cùng 1 email để generate nhiều account khác nhau cho cùng 1 học sinh (ví dụ: học sinh tham gia nhiều classroom khác nhau)
  - Hoặc teacher có thể dùng cùng 1 email để generate account cho nhiều học sinh khác nhau

- Order được tạo với status `"complete"` (không phải `"pending"`) để đánh dấu đã thanh toán/xác nhận ngay lập tức
- Order có `payment_method: "quick_enroll"` để phân biệt với order thông thường
- **Order record cần có field `user_email_generated`**:
  - Order cần lưu thêm field `user_email_generated` (email của account được generate, ví dụ: `EVEVIRYF3948@generated.local`)
  - Khi xóa user (ví dụ: `EVEVIRYF3948@generated.local`), backend sẽ query order theo `user_email_generated` của account đó để tìm đúng order cần xóa
  - Order không lưu theo email mà teacher nhập vào (`newstudent@example.com`) vì email đó không phải email của account trong hệ thống, chỉ là `email_linked` để gửi thông tin đăng nhập
  - Giúp tránh xóa nhầm order của học sinh khác nếu có cùng `email_linked` nhưng khác account được generate
- Order response có cấu trúc đầy đủ với nested objects:
  - `student`: Thông tin user (id, email, username, email_linked)
  - `course`: Thông tin course (id, title, course_type)
  - `classroom`: Thông tin classroom (id, title)
  - Các field khác: `invoice_code`, `price_amount`, `price_currency`, `payment_method`, `payment_reference`, `status`, `status_display`, `notes`, `admin_note`, `created_at`, `updated_at`

- Có thể thêm notification cho teacher khi thêm học sinh thành công
