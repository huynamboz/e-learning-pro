# Learning Session Videos API Documentation

## Tổng quan

API để lấy danh sách tất cả videos của tất cả sessions thuộc các classrooms mà user đang tham gia trong một course. API này phục vụ cho trang learning, trả về data structure tương thích với CourseAsset để đảm bảo compatibility với hệ thống hiện tại.

---

## Endpoint

### Get Session Videos for Learning

**Endpoint**: `GET /api/v1/courses/{course_id}/learning/session-videos/`

**Description**: Lấy danh sách tất cả videos của tất cả sessions thuộc các classrooms mà user hiện tại đang enrolled. API này chỉ trả về videos từ các classrooms mà user đã enrolled và có quyền truy cập.

**Permission**: Authenticated (User phải đã enrolled vào ít nhất một classroom trong course)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course

**Query Parameters:**
- `classroom_id`: UUID (optional) - Filter videos theo classroom cụ thể. Nếu không có, trả về videos của tất cả classrooms mà user đang tham gia.
- `session_id`: UUID (optional) - Filter videos theo session cụ thể. Nếu không có, trả về videos của tất cả sessions.
- `page`: Integer (optional, default: 1) - Số trang (nếu có pagination)
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

**Note:**
- API chỉ trả về videos từ các classrooms mà user đã enrolled (enrollment status = 'enrolled' hoặc 'completed')
- Videos được sắp xếp theo thời gian session (start_time) và thời gian upload (created_at)
- Data structure tương thích với CourseAsset để frontend có thể sử dụng cùng component/UI

---

## Response Structure

### Response 200 OK

```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "video-uuid-1",
      "course": "course-uuid-1",
      "asset_type": "video",
      "title": "Lớp 1 thành viên - Buổi 1",
      "description": "",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid}.mp4",
      "duration": 3600,
      "duration_formatted": "1:00:00",
      "file_size": 10485760,
      "file_size_formatted": "10.0 MB",
      "order": 1,
      "is_downloadable": true,
      "uploaded_by": {
        "id": "1",
        "username": "teacher1",
        "email": "teacher1@example.com"
      },
      "uploaded_at": "2026-01-05T18:00:00.000Z",
      "updated_at": "2026-01-05T18:00:00.000Z",
      "visible_classrooms": [
        {
          "id": "classroom-uuid-1",
          "title": "Lớp 1 thành viên"
        }
      ],
      "has_access": true,
      "session": {
        "id": "session-uuid-1",
        "topic": "Lớp 1 thành viên - Buổi 1",
        "start_time": "2026-01-05T18:00:00.000Z",
        "end_time": "2026-01-05T20:00:00.000Z"
      },
      "classroom": {
        "id": "classroom-uuid-1",
        "title": "Lớp 1 thành viên"
      },
      "materials": [
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
    },
    {
      "id": "video-uuid-2",
      "course": "course-uuid-1",
      "asset_type": "video",
      "title": "Lớp 1 thành viên - Buổi 2",
      "description": "",
      "file_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/sessions/{session_id}/videos/{uuid2}.mp4",
      "duration": 7200,
      "duration_formatted": "2:00:00",
      "file_size": 20971520,
      "file_size_formatted": "20.0 MB",
      "order": 2,
      "is_downloadable": true,
      "uploaded_by": {
        "id": "1",
        "username": "teacher1",
        "email": "teacher1@example.com"
      },
      "uploaded_at": "2026-01-07T18:00:00.000Z",
      "updated_at": "2026-01-07T18:00:00.000Z",
      "visible_classrooms": [
        {
          "id": "classroom-uuid-1",
          "title": "Lớp 1 thành viên"
        }
      ],
      "has_access": true,
      "session": {
        "id": "session-uuid-2",
        "topic": "Lớp 1 thành viên - Buổi 2",
        "start_time": "2026-01-07T18:00:00.000Z",
        "end_time": "2026-01-07T20:00:00.000Z"
      },
      "classroom": {
        "id": "classroom-uuid-1",
        "title": "Lớp 1 thành viên"
      },
      "materials": []
    }
  ]
}
```

**Response Fields:**

Tất cả fields từ CourseAsset interface (để đảm bảo compatibility):
- `id`: UUID của video
- `course`: UUID của course
- `asset_type`: Luôn là `"video"`
- `title`: Topic của session (session.topic)
- `description`: Mô tả (có thể để trống)
- `file_url`: Public URL của video trên S3
- `duration`: Thời lượng video (seconds, optional)
- `duration_formatted`: Thời lượng video đã format (e.g., "1:00:00", optional)
- `file_size`: Kích thước file (bytes)
- `file_size_formatted`: Kích thước file đã format (e.g., "10.0 MB", optional)
- `order`: Thứ tự hiển thị (dựa trên session start_time và created_at)
- `is_downloadable`: Luôn là `true` (hoặc có thể config)
- `uploaded_by`: Thông tin user upload
- `uploaded_at`: Thời gian upload
- `updated_at`: Thời gian cập nhật
- `visible_classrooms`: Danh sách classrooms có thể xem video này (chỉ classroom của session)
- `has_access`: Luôn là `true` (vì user đã enrolled vào classroom)

**Additional Fields (không có trong CourseAsset, nhưng hữu ích):**
- `session`: Thông tin session chứa video này
  - `id`: UUID của session
  - `topic`: Tiêu đề session
  - `start_time`: Thời gian bắt đầu session
  - `end_time`: Thời gian kết thúc session
- `classroom`: Thông tin classroom chứa session này
  - `id`: UUID của classroom
  - `title`: Tên classroom
- `materials`: Danh sách materials (tài liệu) của session này (array)
  - `id`: UUID của material
  - `session`: UUID của session
  - `title`: Tiêu đề material
  - `description`: Mô tả material
  - `file_url`: Public URL của file
  - `file_name`: Tên file gốc
  - `file_size`: Kích thước file (bytes)
  - `file_type`: Loại file (pdf, doc, docx, ppt, pptx, zip, image, audio, other)
  - `uploaded_by`: ID của user upload
  - `uploaded_by_info`: Thông tin chi tiết của user upload (object)
    - `id`: User ID
    - `username`: Username
    - `first_name`: Tên
    - `last_name`: Họ
  - `created_at`: Thời gian tạo
  - `updated_at`: Thời gian cập nhật

**Lưu ý về Materials:**
- `materials` là array, có thể rỗng `[]` nếu session không có materials
- Materials được lấy từ session chứa video này
- User có quyền truy cập materials nếu đã enrolled vào classroom của session

---

## Response 403 Forbidden

```json
{
  "detail": "You are not enrolled in any classroom of this course."
}
```

**Lưu ý:**
- Nếu user chưa enrolled vào bất kỳ classroom nào trong course, trả về 403
- Nếu user đã enrolled nhưng không có video nào, trả về 200 với `results: []`

---

## Response 404 Not Found

```json
{
  "detail": "Course not found"
}
```

---

## Filtering Logic

1. **By Classroom:**
   - Nếu có `classroom_id`, chỉ trả về videos từ sessions của classroom đó
   - Classroom phải thuộc course và user phải đã enrolled vào classroom đó

2. **By Session:**
   - Nếu có `session_id`, chỉ trả về videos của session đó
   - Session phải thuộc course và user phải đã enrolled vào classroom của session đó

3. **Default:**
   - Nếu không có filter, trả về tất cả videos từ tất cả sessions của tất cả classrooms mà user đang tham gia

---

## Sorting

Videos được sắp xếp theo:
1. Session `start_time` (tăng dần)
2. Video `created_at` (tăng dần) - nếu cùng session

---

## Permission & Access Control

1. **User Enrollment Check:**
   - Chỉ trả về videos từ classrooms mà user đã enrolled
   - Enrollment status phải là `'enrolled'` hoặc `'completed'`
   - Không trả về videos từ classrooms có status `'pending'` hoặc `'cancelled'`

2. **Session Access:**
   - Chỉ trả về videos từ sessions thuộc classrooms mà user đã enrolled
   - Nếu session không có classroom (edge case), không trả về

3. **Course Access:**
   - User phải có quyền truy cập course (đã enrolled vào ít nhất một classroom)

---

## Example Requests

### Example 1: Get All Session Videos

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/learning/session-videos/
Authorization: Bearer {token}
```

**Response:** (xem Response Structure ở trên)

### Example 2: Get Videos from Specific Classroom

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/learning/session-videos/?classroom_id=classroom-uuid-1
Authorization: Bearer {token}
```

**Response:** Chỉ videos từ sessions của `classroom-uuid-1`

### Example 3: Get Videos from Specific Session

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/learning/session-videos/?session_id=session-uuid-1
Authorization: Bearer {token}
```

**Response:** Chỉ videos của `session-uuid-1`

### Example 4: Get Videos with Pagination

```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/learning/session-videos/?page=1&page_size=20
Authorization: Bearer {token}
```

**Response:** Videos với pagination (20 items mỗi trang)

---

## Data Structure Compatibility

API này trả về data structure tương thích với `CourseAsset` interface để frontend có thể:

1. **Reuse Components:**
   - Sử dụng cùng component để hiển thị videos từ lessons và sessions
   - Không cần tạo component mới

2. **Unified Video List:**
   - Có thể merge videos từ lessons và sessions vào cùng một list
   - Sử dụng cùng logic filter, sort, pagination

3. **Consistent UI:**
   - Video player, video card, video list component có thể dùng chung
   - Không cần thay đổi UI logic

**Mapping Fields:**
- Session video `file_url` → CourseAsset `file_url`
- Session `topic` → CourseAsset `title` (title của video = topic của session)
- Session video `duration` → CourseAsset `duration`
- Session video `file_size` → CourseAsset `file_size`
- Session video `content_type` → CourseAsset `asset_type` (luôn là "video")
- Session video `uploaded_by` → CourseAsset `uploaded_by`
- Session video `created_at` → CourseAsset `uploaded_at`

---

## Related Endpoints

- `GET /api/v1/courses/{course_id}/assets/` - Get course assets (videos từ lessons)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/videos/` - Get videos của một session cụ thể (admin/teacher)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/materials/` - Get materials của một session cụ thể (admin/teacher/student)
- `GET /api/v1/courses/{course_id}/sessions/` - Get list sessions (admin/teacher)

---

## Error Handling

### Response 400 Bad Request

```json
{
  "detail": "Invalid query parameters",
  "errors": {
    "classroom_id": ["Invalid UUID format"],
    "page": ["Page must be a positive integer"]
  }
}
```

### Response 403 Forbidden

```json
{
  "detail": "You are not enrolled in any classroom of this course."
}
```

### Response 404 Not Found

```json
{
  "detail": "Course not found"
}
```

hoặc

```json
{
  "detail": "Classroom not found or you are not enrolled in this classroom"
}
```

hoặc

```json
{
  "detail": "Session not found or you do not have access to this session"
}
```
