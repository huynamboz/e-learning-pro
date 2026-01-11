# Session Materials API Documentation

## Tổng quan

API để quản lý materials (tài liệu) của một session. Hệ thống hỗ trợ upload nhiều materials cho mỗi session, sử dụng AWS S3 Presigned URLs để upload trực tiếp từ frontend lên S3.

**Lưu ý:** Materials không bao gồm video (video được quản lý riêng qua Session Videos API).

---

## Endpoints

### 1. Get Presigned URL for Material Upload

**Endpoint**: `POST /api/v1/courses/{course_id}/sessions/{session_id}/upload-material-url/`

**Description**: Lấy presigned URL để upload material lên S3. Frontend sẽ sử dụng URL này để upload file trực tiếp lên S3.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Request Body:**

```json
{
  "file_name": "session-material.pdf",
  "content_type": "application/pdf"
}
```

**Request Fields:**
- `file_name` (required)`: Tên file gốc với extension (e.g., `"session-material.pdf"`)
- `content_type` (required)`: MIME type của file

**Allowed Content Types:**
- `application/pdf` (PDF)
- `application/msword` (DOC)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `application/vnd.ms-powerpoint` (PPT)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX)
- `application/zip` (ZIP)
- `image/jpeg`, `image/png`, `image/gif` (Images)
- `audio/mpeg`, `audio/wav` (Audio)

**Response 200 OK:**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf?X-Amz-Algorithm=...&X-Amz-Expires=3600&X-Amz-Signature=...",
  "key": "courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
  "expires_in": 3600,
  "file_name": "{uuid}.pdf"
}
```

**Response Fields:**
- `upload_url`: Presigned URL để upload file (PUT request), expires sau 1 giờ
- `key`: S3 object key (path trong bucket)
- `public_url`: URL công khai để truy cập file sau khi upload (permanent)
- `expires_in`: Thời gian hết hạn của upload_url (seconds)
- `file_name`: Tên file unique được generate (UUID + extension)

**Lưu ý:**
- Backend tự động generate unique filename (UUID) để tránh conflict
- File được lưu tại: `courses/{course_id}/sessions/{session_id}/materials/{uuid}.{ext}`
- Upload URL expires sau 1 giờ

---

### 2. Upload Material to Session

**Endpoint**: `POST /api/v1/courses/{course_id}/sessions/{session_id}/materials/`

**Description**: Tạo record material trong database sau khi đã upload file lên S3 thành công.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Request Body:**

```json
{
  "title": "Tài liệu buổi học",
  "description": "Mô tả tài liệu (optional)",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
  "file_name": "session-material.pdf",
  "file_size": 1048576,
  "file_type": "pdf"
}
```

**Request Fields:**
- `title` (required): Tiêu đề của material
- `description` (optional): Mô tả material
- `file_url` (required): Public URL của file đã upload lên S3 (từ presigned URL response)
- `file_name` (required): Tên file gốc
- `file_size` (required): Kích thước file (bytes)
- `file_type` (required): Loại file (pdf, doc, docx, ppt, pptx, zip, image, audio, other)

**Response 201 Created:**

```json
{
  "id": "material-uuid-1",
  "session": "session-uuid-1",
  "title": "Tài liệu buổi học",
  "description": "Mô tả tài liệu",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
  "file_name": "session-material.pdf",
  "file_size": 1048576,
  "file_type": "pdf",
  "uploaded_by": 1,
  "created_at": "2026-01-05T18:00:00.000Z",
  "updated_at": "2026-01-05T18:00:00.000Z"
}
```

**Response Fields:**
- `id`: UUID của material record
- `session`: UUID của session
- `title`: Tiêu đề material
- `description`: Mô tả material
- `file_url`: Public URL của file
- `file_name`: Tên file gốc
- `file_size`: Kích thước file (bytes)
- `file_type`: Loại file
- `uploaded_by`: ID của user upload
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

---

### 3. List Session Materials

**Endpoint**: `GET /api/v1/courses/{course_id}/sessions/{session_id}/materials/`

**Description**: Lấy danh sách tất cả materials của một session.

**Permission**: Authenticated (Admin, Teacher của course, hoặc Student đã enrolled vào classroom của session)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Query Parameters:**
- `page`: Integer (optional, default: 1) - Số trang (nếu có pagination)
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

**Response 200 OK:**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "material-uuid-1",
      "session": "session-uuid-1",
      "title": "Tài liệu buổi học 1",
      "description": "Mô tả tài liệu 1",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
      "file_name": "session-material-1.pdf",
      "file_size": 1048576,
      "file_type": "pdf",
      "uploaded_by": 1,
      "uploaded_by_info": {
        "id": 1,
        "username": "teacher1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2026-01-05T18:00:00.000Z",
      "updated_at": "2026-01-05T18:00:00.000Z"
    },
    {
      "id": "material-uuid-2",
      "session": "session-uuid-1",
      "title": "Tài liệu buổi học 2",
      "description": "",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid2}.docx",
      "file_name": "session-material-2.docx",
      "file_size": 2097152,
      "file_type": "docx",
      "uploaded_by": 1,
      "uploaded_by_info": {
        "id": 1,
        "username": "teacher1",
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2026-01-05T19:00:00.000Z",
      "updated_at": "2026-01-05T19:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `count`: Tổng số materials
- `next`: URL trang tiếp theo (null nếu không có)
- `previous`: URL trang trước (null nếu không có)
- `results`: Danh sách materials

**Material Object Fields:**
- `id`: UUID của material record
- `session`: UUID của session
- `title`: Tiêu đề material
- `description`: Mô tả material
- `file_url`: Public URL của file
- `file_name`: Tên file gốc
- `file_size`: Kích thước file (bytes)
- `file_type`: Loại file
- `uploaded_by`: ID của user upload
- `uploaded_by_info`: Thông tin chi tiết của user upload (object)
  - `id`: User ID
  - `username`: Username
  - `first_name`: Tên
  - `last_name`: Họ
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

**Lưu ý:**
- Response có thể có pagination fields (`next`, `previous`) nếu có nhiều materials
- `uploaded_by_info` chỉ có trong List endpoint, không có trong POST response

---

### 4. Update Session Material

**Endpoint**: `PATCH /api/v1/courses/{course_id}/sessions/{session_id}/materials/{material_id}/`

**Description**: Cập nhật thông tin material (title, description).

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session
- `material_id`: UUID (required) - ID của material

**Request Body:**

```json
{
  "title": "Tài liệu đã cập nhật",
  "description": "Mô tả mới"
}
```

**Response 200 OK:**

```json
{
  "id": "material-uuid-1",
  "session": "session-uuid-1",
  "title": "Tài liệu đã cập nhật",
  "description": "Mô tả mới",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/materials/{uuid}.pdf",
  "file_name": "session-material.pdf",
  "file_size": 1048576,
  "file_type": "pdf",
  "uploaded_by": 1,
  "created_at": "2026-01-05T18:00:00.000Z",
  "updated_at": "2026-01-05T18:30:00.000Z"
}
```

---

### 5. Delete Session Material

**Endpoint**: `DELETE /api/v1/courses/{course_id}/sessions/{session_id}/materials/{material_id}/`

**Description**: Xóa material khỏi session và xóa file trên S3.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session
- `material_id`: UUID (required) - ID của material

**Response 204 No Content**

**Lưu ý:**
- Khi xóa material, backend sẽ:
  1. Xóa record trong database
  2. Xóa file trên S3 (nếu file tồn tại)

---

## Upload Workflow

### Frontend Implementation Flow

1. **User chọn material file**
   - Frontend validate file type và size
   - Hiển thị file trong list với status `pending`

2. **User bấm "Upload material này"**
   - Frontend gọi `POST /api/v1/courses/{course_id}/sessions/{session_id}/upload-material-url/` để lấy presigned URL
   - Frontend upload file trực tiếp lên S3 bằng PUT request với presigned URL
   - Track upload progress và hiển thị progress bar

3. **Sau khi upload thành công**
   - Frontend gọi `POST /api/v1/courses/{course_id}/sessions/{session_id}/materials/` với `file_url` từ presigned URL response
   - Backend tạo record trong database
   - Frontend cập nhật status thành `done`

4. **Xóa material**
   - Nếu material đã upload (status `done`), hiển thị confirm dialog
   - User confirm → Frontend gọi `DELETE /api/v1/courses/{course_id}/sessions/{session_id}/materials/{material_id}/`
   - Backend xóa record và file trên S3

---

## Error Handling

### Response 400 Bad Request

```json
{
  "detail": "Invalid request",
  "errors": {
    "file_name": ["This field is required."],
    "content_type": ["Invalid content type. Allowed: application/pdf, ..."],
    "title": ["This field is required."]
  }
}
```

### Response 404 Not Found

```json
{
  "detail": "Session not found"
}
```

hoặc

```json
{
  "detail": "Material not found"
}
```

### Response 403 Forbidden

```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## Validation Rules

1. **File Upload:**
   - `file_name`: Required, phải có extension hợp lệ
   - `content_type`: Required, phải là một trong các giá trị được phép
   - File size: Tối đa 100MB (có thể config)

2. **Create Material Record:**
   - `title`: Required, max length 255 characters
   - `file_url`: Required, phải là URL hợp lệ từ S3
   - `file_name`: Required
   - `file_size`: Required, phải là số dương
   - `file_type`: Required, phải là một trong: pdf, doc, docx, ppt, pptx, zip, image, audio, other

3. **Session Validation:**
   - Session phải tồn tại
   - Session phải thuộc course được chỉ định
   - User phải có quyền (Admin hoặc Teacher của course)

---

## Example Request/Response

### Example 1: Upload Material Complete Flow

**Step 1: Get Presigned URL**

```http
POST /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/upload-material-url/
Content-Type: application/json
Authorization: Bearer {token}

{
  "file_name": "session-notes.pdf",
  "content_type": "application/pdf"
}
```

**Response:**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf?X-Amz-Algorithm=...",
  "key": "courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf",
  "expires_in": 3600,
  "file_name": "abc123.pdf"
}
```

**Step 2: Upload File to S3**

```http
PUT https://s3-ap-southeast-2.amazonaws.com/bucket/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf?X-Amz-Algorithm=...
Content-Type: application/pdf

[binary file data]
```

**Step 3: Create Material Record**

```http
POST /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Tài liệu buổi học",
  "description": "Ghi chú từ buổi học",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf",
  "file_name": "session-notes.pdf",
  "file_size": 1048576,
  "file_type": "pdf"
}
```

**Response:**

```json
{
  "id": "material-uuid-1",
  "session": "session-uuid-1",
  "title": "Tài liệu buổi học",
  "description": "Ghi chú từ buổi học",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/abc123.pdf",
  "file_name": "session-notes.pdf",
  "file_size": 1048576,
  "file_type": "pdf",
  "uploaded_by": 1,
  "created_at": "2026-01-05T18:00:00.000Z",
  "updated_at": "2026-01-05T18:00:00.000Z"
}
```

### Example 2: List Materials

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/
Authorization: Bearer {token}
```

**Response:** (xem Response Structure ở trên)

### Example 3: Delete Material

```http
DELETE /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/materials/material-uuid-1/
Authorization: Bearer {token}
```

**Response:** 204 No Content

---

## Related Endpoints

- `GET /api/v1/courses/{course_id}/sessions/{session_id}/` - Lấy session detail (có thể include materials trong response nếu cần)
- `POST /api/v1/courses/{course_id}/sessions/{session_id}/upload-video-url/` - Upload video cho session (pattern tương tự)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/videos/` - List videos của session
