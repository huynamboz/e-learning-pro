# Session Videos API Documentation

## Tổng quan

API để quản lý videos của một session. Hệ thống hỗ trợ upload nhiều videos cho mỗi session, sử dụng AWS S3 Presigned URLs để upload trực tiếp từ frontend lên S3.

---

## Endpoints

### 1. Get Presigned URL for Video Upload

**Endpoint**: `POST /api/v1/courses/{course_id}/sessions/{session_id}/videos/upload-video-url/`

**Description**: Lấy presigned URL để upload video lên S3. Frontend sẽ sử dụng URL này để upload file trực tiếp lên S3.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Request Body:**

```json
{
  "file_name": "session-video.mp4",
  "content_type": "video/mp4"
}
```

**Request Fields:**
- `file_name` (required): Tên file gốc với extension (e.g., `"session-video.mp4"`)
- `content_type` (required): MIME type của video

**Allowed Content Types:**
- `video/mp4`
- `video/quicktime` (MOV)
- `video/x-msvideo` (AVI)

**Response 200 OK:**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4?X-Amz-Algorithm=...&X-Amz-Expires=3600&X-Amz-Signature=...",
  "key": "courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
  "expires_in": 3600,
  "file_name": "{uuid}.mp4"
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
- File được lưu tại: `courses/{course_id}/sessions/{session_id}/videos/{uuid}.{ext}`
- Upload URL expires sau 1 giờ

---

### 2. Upload Video to Session

**Endpoint**: `POST /api/v1/courses/{course_id}/sessions/{session_id}/videos/`

**Description**: Tạo record video trong database sau khi đã upload file lên S3 thành công.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Request Body:**

```json
{
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
  "file_name": "session-video.mp4",
  "file_size": 10485760,
  "content_type": "video/mp4",
  "duration": 3600
}
```

**Request Fields:**
- `file_url` (required): Public URL của video đã upload lên S3 (từ presigned URL response)
- `file_name` (required): Tên file gốc
- `file_size` (required): Kích thước file (bytes)
- `content_type` (required): MIME type của video
- `duration` (optional): Thời lượng video (seconds)

**Response 201 Created:**

```json
{
  "id": "video-uuid-1",
  "session": "session-uuid-1",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
  "file_name": "session-video.mp4",
  "file_size": 10485760,
  "content_type": "video/mp4",
  "duration": 3600,
  "uploaded_by": 1,
  "created_at": "2026-01-05T18:00:00.000Z",
  "updated_at": "2026-01-05T18:00:00.000Z"
}
```

**Response Fields:**
- `id`: UUID của video record
- `session`: UUID của session
- `file_url`: Public URL của video
- `file_name`: Tên file gốc
- `file_size`: Kích thước file (bytes)
- `content_type`: MIME type
- `duration`: Thời lượng video (seconds, null nếu không có)
- `uploaded_by`: ID của user upload
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

---

### 3. List Session Videos

**Endpoint**: `GET /api/v1/courses/{course_id}/sessions/{session_id}/videos/`

**Description**: Lấy danh sách tất cả videos của một session.

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
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "video-uuid-1",
      "session": "session-uuid-1",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
      "file_name": "session-video-1.mp4",
      "file_size": 10485760,
      "content_type": "video/mp4",
      "duration": 3600,
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
      "id": "video-uuid-2",
      "session": "session-uuid-1",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid2}.mp4",
      "file_name": "session-video-2.mp4",
      "file_size": 20971520,
      "content_type": "video/mp4",
      "duration": 7200,
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
- `count`: Tổng số videos
- `results`: Danh sách videos

**Video Object Fields:**
- `id`: UUID của video record
- `session`: UUID của session
- `file_url`: Public URL của video
- `file_name`: Tên file gốc
- `file_size`: Kích thước file (bytes)
- `content_type`: MIME type
- `duration`: Thời lượng video (seconds, null nếu không có)
- `uploaded_by`: ID của user upload
- `uploaded_by_info`: Thông tin chi tiết của user upload (object)
  - `id`: User ID
  - `username`: Username
  - `first_name`: Tên
  - `last_name`: Họ
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

**Lưu ý:**
- Response có thể có pagination fields (`next`, `previous`) nếu có nhiều videos
- `uploaded_by_info` chỉ có trong List endpoint, không có trong POST response

---

### 4. Delete Session Video

**Endpoint**: `DELETE /api/v1/courses/{course_id}/sessions/{session_id}/videos/{video_id}/`

**Description**: Xóa video khỏi session và xóa file trên S3.

**Permission**: Authenticated (Admin hoặc Teacher của course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session
- `video_id`: UUID (required) - ID của video

**Response 204 No Content**

**Lưu ý:**
- Khi xóa video, backend sẽ:
  1. Xóa record trong database
  2. Xóa file trên S3 (nếu file tồn tại)

---

## Upload Workflow

### Frontend Implementation Flow

1. **User chọn video file**
   - Frontend validate file type và size
   - Hiển thị file trong list với status `pending`

2. **User bấm "Upload video này"**
   - Frontend gọi `POST /api/v1/courses/{course_id}/sessions/{session_id}/videos/upload-video-url/` để lấy presigned URL
   - Frontend upload file trực tiếp lên S3 bằng PUT request với presigned URL
   - Track upload progress và hiển thị progress bar

3. **Sau khi upload thành công**
   - Frontend gọi `POST /api/v1/courses/{course_id}/sessions/{session_id}/videos/` với `file_url` từ presigned URL response
   - Backend tạo record trong database
   - Frontend cập nhật status thành `done`

4. **Xóa video**
   - Nếu video đã upload (status `done`), hiển thị confirm dialog
   - User confirm → Frontend gọi `DELETE /api/v1/courses/{course_id}/sessions/{session_id}/videos/{video_id}/`
   - Backend xóa record và file trên S3

---

## Error Handling

### Response 400 Bad Request

```json
{
  "detail": "Invalid request",
  "errors": {
    "file_name": ["This field is required."],
    "content_type": ["Invalid content type. Allowed: video/mp4, video/quicktime, video/x-msvideo"]
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
  "detail": "Video not found"
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
   - `file_name`: Required, phải có extension hợp lệ (.mp4, .mov, .avi)
   - `content_type`: Required, phải là một trong các giá trị được phép
   - File size: Tối đa 2GB (có thể config)

2. **Create Video Record:**
   - `file_url`: Required, phải là URL hợp lệ từ S3
   - `file_name`: Required
   - `file_size`: Required, phải là số dương
   - `content_type`: Required
   - `duration`: Optional, nếu có phải là số dương (seconds)

3. **Session Validation:**
   - Session phải tồn tại
   - Session phải thuộc course được chỉ định
   - User phải có quyền (Admin hoặc Teacher của course)

---

## Example Request/Response

### Example 1: Upload Video Complete Flow

**Step 1: Get Presigned URL**

```http
POST /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/upload-video-url/
Content-Type: application/json
Authorization: Bearer {token}

{
  "file_name": "session-recording.mp4",
  "content_type": "video/mp4"
}
```

**Response:**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4?X-Amz-Algorithm=...",
  "key": "courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4",
  "expires_in": 3600,
  "file_name": "abc123.mp4"
}
```

**Step 2: Upload File to S3**

```http
PUT https://s3-ap-southeast-2.amazonaws.com/bucket/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4?X-Amz-Algorithm=...
Content-Type: video/mp4

[binary file data]
```

**Step 3: Create Video Record**

```http
POST /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/
Content-Type: application/json
Authorization: Bearer {token}

{
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4",
  "file_name": "session-recording.mp4",
  "file_size": 10485760,
  "content_type": "video/mp4",
  "duration": 3600
}
```

**Response:**

```json
{
  "id": "video-uuid-1",
  "session": "session-uuid-1",
  "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/abc123.mp4",
  "file_name": "session-recording.mp4",
  "file_size": 10485760,
  "content_type": "video/mp4",
  "duration": 3600,
  "uploaded_by": 1,
  "created_at": "2026-01-05T18:00:00.000Z",
  "updated_at": "2026-01-05T18:00:00.000Z"
}
```

### Example 2: List Videos

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/
Authorization: Bearer {token}
```

**Response:** (xem Response Structure ở trên)

### Example 3: Delete Video

```http
DELETE /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/sessions/session-uuid-1/videos/video-uuid-1/
Authorization: Bearer {token}
```

**Response:** 204 No Content

---

## Related Endpoints

- `GET /api/v1/courses/{course_id}/sessions/{session_id}/` - Lấy session detail (có thể include videos trong response nếu cần)
- `POST /api/v1/courses/{course_id}/upload-video-url/` - Upload video cho course (pattern tương tự)
