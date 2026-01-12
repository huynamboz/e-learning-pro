# Classroom Students API Documentation

## Endpoint

**GET** `/api/v1/classrooms/{classroom_id}/students/`

**Description**: Lấy danh sách học sinh đã enrolled vào classroom.

**Permission**: Authenticated (Admin hoặc Teacher của classroom)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Query Parameters:**
- `page`: Integer (optional, default: 1) - Số trang
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

## Response Structure

**Response 200 OK:**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 126,
      "username": "LHSTDLNO4718",
      "email": "LHSTDLNO4718@generated.local",
      "email_linked": "student@example.com",
      "first_name": "",
      "last_name": "",
      "full_name": "LHSTDLNO4718",
      "phone": "",
      "avatar": "",
      "enrolled_at": "2026-01-11T09:32:42.159575Z",
      "enrollment_status": "active"
    }
  ]
}
```

**Response Fields:**

### Pagination Fields:
- `count`: Integer - Tổng số học sinh
- `next`: String | null - URL trang tiếp theo (null nếu không có)
- `previous`: String | null - URL trang trước (null nếu không có)
- `results`: Array - Danh sách học sinh

### Student Object Fields:
- `id`: Integer - User ID
- `username`: String - Username
- `email`: String - Email của account trong hệ thống
  - Với account thông thường: Email thực tế (ví dụ: `student@example.com`)
  - Với account được generate (quick enroll): Format `{random_string}@generated.local` (ví dụ: `LHSTDLNO4718@generated.local`)
- `email_linked`: String | null - Email liên kết (email để gửi thông tin đăng nhập)
  - Với account thông thường: Thường trùng với `email` hoặc `null`
  - Với account được generate: Email mà teacher nhập vào khi quick enroll (ví dụ: `student@example.com`)
  - **Lưu ý**: `email_linked` không phải unique, có thể có nhiều account với cùng `email_linked`
- `first_name`: String - Tên
- `last_name`: String - Họ
- `full_name`: String - Tên đầy đủ (nếu không có sẽ fallback về `username`)
- `phone`: String | null - Số điện thoại (optional, có thể là empty string)
- `avatar`: String | null - URL avatar (optional, có thể là empty string)
- `enrolled_at`: String (ISO 8601) - Thời gian enrolled vào classroom
- `enrollment_status`: String - Status của enrollment (active, completed, cancelled, etc.)
- `enrollment`: Object | null - Thông tin enrollment object (optional, có thể không có trong response)
  - `id`: String (UUID) - Enrollment ID
  - `classroom`: String (UUID) - Classroom ID
  - `user`: Integer - User ID
  - `enrolled_at`: String (ISO 8601) - Thời gian enrolled
  - `status`: String - Enrollment status

**Response 404 Not Found:**

```json
{
  "detail": "Classroom not found"
}
```

**Response 403 Forbidden:**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## Example Request

```http
GET /api/v1/classrooms/c8f1d39c-8088-415f-8edd-164d984f35c0/students/
Authorization: Bearer {token}
```

## Example Response

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 126,
      "username": "LHSTDLNO4718",
      "email": "LHSTDLNO4718@generated.local",
      "email_linked": "student1@example.com",
      "first_name": "",
      "last_name": "",
      "full_name": "LHSTDLNO4718",
      "phone": "",
      "avatar": "",
      "enrolled_at": "2026-01-11T09:32:42.159575Z",
      "enrollment_status": "active"
    },
    {
      "id": 124,
      "username": "student_username",
      "email": "student2@example.com",
      "email_linked": "student2@example.com",
      "first_name": "Nguyen",
      "last_name": "Van B",
      "full_name": "Nguyen Van B",
      "phone": "+84123456789",
      "avatar": "https://example.com/avatar.jpg",
      "enrolled_at": "2026-01-16T10:00:00.000Z",
      "enrollment_status": "active",
      "enrollment": {
        "id": "enrollment-uuid-2",
        "classroom": "c8f1d39c-8088-415f-8edd-164d984f35c0",
        "user": 124,
        "enrolled_at": "2026-01-16T10:00:00.000Z",
        "status": "active"
      }
    }
  ]
}
```

## Notes

- API này trả về danh sách học sinh đã enrolled vào classroom cụ thể
- Response có pagination support với `count`, `next`, `previous`, và `results`
- Mỗi student object chứa thông tin user và enrollment information

### Về `email` và `email_linked`:

- **`email`**: Email của account trong hệ thống:
  - Với account thông thường: Email thực tế mà user đăng ký (ví dụ: `student@example.com`)
  - Với account được generate (quick enroll): Format `{random_string}@generated.local` (ví dụ: `LHSTDLNO4718@generated.local`)

- **`email_linked`**: Email liên kết để gửi thông tin đăng nhập:
  - Với account thông thường: Thường trùng với `email` hoặc `null`
  - Với account được generate: Email mà teacher nhập vào khi quick enroll (ví dụ: `student@example.com`)
  - **Lưu ý quan trọng**: `email_linked` **KHÔNG PHẢI UNIQUE**. Có thể có nhiều account với cùng `email_linked` nhưng khác `email`

### Về các field khác:

- `phone` và `avatar` có thể là empty string (`""`) thay vì `null`
- `full_name` sẽ fallback về `username` nếu không có `first_name` và `last_name`
- `enrollment` object có thể không có trong response (tùy backend implementation)
