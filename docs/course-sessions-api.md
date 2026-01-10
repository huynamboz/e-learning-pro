# Course Sessions API Documentation

## Tổng quan

API để lấy danh sách tất cả sessions của tất cả classrooms trong một course, hoặc sessions của một classroom cụ thể. API này hỗ trợ filter theo date range và classroom để tối ưu hiệu năng.

---

## Endpoint

### Get All Sessions by Course

**Endpoint**: `GET /api/v1/courses/{course_id}/sessions/`

**Description**: Lấy danh sách tất cả sessions của tất cả classrooms thuộc một course, hoặc sessions của một classroom cụ thể. API này hỗ trợ filter theo date range và classroom để tối ưu hiệu năng khi hiển thị calendar.

**Permission**: Authenticated (Admin hoặc Teacher)

**Path Parameters:**
- `course_id`: UUID (required) - ID của course

**Query Parameters:**
- `classroom_id`: UUID (optional) - ID của classroom để filter. Nếu có, chỉ trả về sessions của classroom này. Nếu không có, trả về sessions của tất cả classrooms trong course.
- `start_date`: String (optional, format: `YYYY-MM-DD`) - Ngày bắt đầu để filter sessions. Nếu không có, lấy tất cả sessions từ quá khứ đến tương lai.
- `end_date`: String (optional, format: `YYYY-MM-DD`) - Ngày kết thúc để filter sessions. Nếu không có, lấy tất cả sessions từ `start_date` đến tương lai.
- `page`: Integer (optional, default: 1) - Số trang (nếu có pagination)
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

**Note**:
- Nếu có `classroom_id`, chỉ trả về sessions của classroom đó (và phải thuộc course được chỉ định).
- Nếu không có `classroom_id`, trả về sessions của tất cả classrooms trong course.
- Nếu chỉ có `start_date` mà không có `end_date`, lấy tất cả sessions từ `start_date` đến tương lai.
- Nếu chỉ có `end_date` mà không có `start_date`, lấy tất cả sessions từ quá khứ đến `end_date`.
- Nếu có cả `start_date` và `end_date`, lấy sessions trong khoảng thời gian này (bao gồm cả `start_date` và `end_date`).
- Filter dựa trên `start_time` của session (UTC).
- Có thể kết hợp `classroom_id` với `start_date` và `end_date` để filter chính xác hơn.

---

## Response Structure

### Response 200 OK

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "session-uuid-1",
      "classroom": "classroom-uuid-1",
      "topic": "Lớp 1 thành viên - Buổi 1",
      "description": "Buổi học 1 của Lớp 1 thành viên",
      "start_time": "2026-01-05T18:00:00.000Z",
      "end_time": "2026-01-05T20:00:00.000Z",
      "location": "",
      "limit": 10,
      "status": "scheduled",
      "classroom_title": "Lớp 1 thành viên",
      "course_title": "Khóa học tiếng Ý cơ bản",
      "attendance_count": 0,
      "present_count": 0,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "session-uuid-2",
      "classroom": "classroom-uuid-1",
      "topic": "Lớp 1 thành viên - Buổi 2",
      "description": "Buổi học 2 của Lớp 1 thành viên",
      "start_time": "2026-01-07T18:00:00.000Z",
      "end_time": "2026-01-07T20:00:00.000Z",
      "location": "",
      "limit": 10,
      "status": "scheduled",
      "classroom_title": "Lớp 1 thành viên",
      "course_title": "Khóa học tiếng Ý cơ bản",
      "attendance_count": 0,
      "present_count": 0,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "session-uuid-3",
      "classroom": "classroom-uuid-2",
      "topic": "Lớp 3 thành viên - Buổi 1",
      "description": "Buổi học 1 của Lớp 3 thành viên",
      "start_time": "2026-01-08T13:00:00.000Z",
      "end_time": "2026-01-08T16:00:00.000Z",
      "location": "",
      "limit": 10,
      "status": "scheduled",
      "classroom_title": "Lớp 3 thành viên",
      "course_title": "Khóa học tiếng Ý cơ bản",
      "attendance_count": 0,
      "present_count": 0,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Response 404 Not Found

```json
{
  "detail": "Course not found"
}
```

### Response 400 Bad Request

```json
{
  "detail": "Invalid date format. Expected YYYY-MM-DD"
}
```

---

## Get Session Detail

**Endpoint**: `GET /api/v1/courses/{course_id}/sessions/{session_id}/`

**Description**: Lấy thông tin chi tiết của một session, bao gồm thông tin session, classroom và course. API này trả về đầy đủ thông tin bao gồm `meeting_link`, `meeting_id`, `meeting_pass` nếu user có quyền truy cập.

**Permission**:
- Public (không cần authentication) - có thể xem thông tin session, classroom, course nhưng không thấy `meeting_link`, `meeting_id`, `meeting_pass`
- Authenticated - nếu user đã đăng ký/enrolled vào classroom chứa session này, sẽ thấy đầy đủ thông tin bao gồm `meeting_link`, `meeting_id`, `meeting_pass`

**Path Parameters:**
- `course_id`: UUID (required) - ID của course
- `session_id`: UUID (required) - ID của session

**Response 200 OK:**

```json
{
  "id": "session-uuid-1",
  "classroom": {
    "id": "classroom-uuid-1",
    "title": "Lớp 1 thành viên",
    "student_count": 1,
    "price": "100.00",
    "discount_price": null
  },
  "course": {
    "id": "course-uuid-1",
    "title": "Khóa học tiếng Ý cơ bản",
    "slug": "khoa-hoc-tieng-y-co-ban"
  },
  "topic": "Lớp 1 thành viên - Buổi 1",
  "description": "Buổi học 1 của Lớp 1 thành viên",
  "start_time": "2026-01-05T18:00:00.000Z",
  "end_time": "2026-01-05T20:00:00.000Z",
  "location": "",
  "meeting_link": "https://zoom.us/j/123456789",
  "meeting_id": "123456789",
  "meeting_pass": "password123",
  "limit": 10,
  "status": "scheduled",
  "attendance_count": 0,
  "present_count": 0,
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

**Response khi user chưa login hoặc chưa enrolled vào classroom:**

```json
{
  "id": "session-uuid-1",
  "classroom": {
    "id": "classroom-uuid-1",
    "title": "Lớp 1 thành viên",
    "student_count": 1,
    "price": "100.00",
    "discount_price": null
  },
  "course": {
    "id": "course-uuid-1",
    "title": "Khóa học tiếng Ý cơ bản",
    "slug": "khoa-hoc-tieng-y-co-ban"
  },
  "topic": "Lớp 1 thành viên - Buổi 1",
  "description": "Buổi học 1 của Lớp 1 thành viên",
  "start_time": "2026-01-05T18:00:00.000Z",
  "end_time": "2026-01-05T20:00:00.000Z",
  "location": "",
  "meeting_link": null,
  "meeting_id": null,
  "meeting_pass": null,
  "limit": 10,
  "status": "scheduled",
  "attendance_count": 0,
  "present_count": 0,
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

**Response 404 Not Found:**

```json
{
  "detail": "Session not found"
}
```

**Note về Permission:**
- Nếu user chưa login (anonymous user): `meeting_link`, `meeting_id`, `meeting_pass` sẽ là `null`
- Nếu user đã login nhưng chưa enrolled vào classroom chứa session này: `meeting_link`, `meeting_id`, `meeting_pass` sẽ là `null`
- Nếu user đã login và đã enrolled vào classroom chứa session này: `meeting_link`, `meeting_id`, `meeting_pass` sẽ có giá trị
- Admin và Teacher luôn thấy đầy đủ thông tin

---

## Session Model

### ClassroomSession (List Response)

**Fields trong list response (`GET /api/v1/courses/{course_id}/sessions/`):**
- `id`: UUID (required) - ID duy nhất của session
- `classroom`: UUID (required) - ID của classroom chứa session này
- `topic`: String (required) - Chủ đề/buổi học
- `description`: String (optional) - Mô tả chi tiết
- `start_time`: DateTime (required, UTC) - Thời gian bắt đầu session (format: ISO 8601)
- `end_time`: DateTime (required, UTC) - Thời gian kết thúc session (format: ISO 8601)
- `location`: String (optional) - Địa điểm học (nếu học offline)
- `limit`: Integer (required) - Số lượng học viên tối đa
- `status`: String (required) - Trạng thái session: `scheduled`, `ongoing`, `completed`, `cancelled`
- `classroom_title`: String (required) - Tên của classroom (để hiển thị trong calendar)
- `course_title`: String (required) - Tên của course (để hiển thị trong calendar)
- `attendance_count`: Integer (default: 0) - Tổng số học viên đã đăng ký
- `present_count`: Integer (default: 0) - Số học viên có mặt
- `created_at`: DateTime (auto-generated) - Thời gian tạo
- `updated_at`: DateTime (auto-updated) - Thời gian cập nhật cuối

**Note**: List response **KHÔNG** bao gồm `meeting_link`, `meeting_id`, `meeting_pass` để bảo mật thông tin.

### ClassroomSessionDetail (Detail Response)

**Fields trong detail response (`GET /api/v1/courses/{course_id}/sessions/{session_id}/`):**
- `id`: UUID (required) - ID duy nhất của session
- `classroom`: Object (required) - Thông tin chi tiết của classroom:
  - `id`: UUID - ID của classroom
  - `title`: String - Tên của classroom
  - `student_count`: Integer - Số lượng học viên
  - `price`: String - Giá gốc
  - `discount_price`: String | null - Giá khuyến mãi
- `course`: Object (required) - Thông tin chi tiết của course:
  - `id`: UUID - ID của course
  - `title`: String - Tên của course
  - `slug`: String - Slug của course
- `topic`: String (required) - Chủ đề/buổi học
- `description`: String (optional) - Mô tả chi tiết
- `start_time`: DateTime (required, UTC) - Thời gian bắt đầu session (format: ISO 8601)
- `end_time`: DateTime (required, UTC) - Thời gian kết thúc session (format: ISO 8601)
- `location`: String (optional) - Địa điểm học (nếu học offline)
- `meeting_link`: String | null (conditional) - Link meeting (Zoom, Google Meet, etc.). Chỉ có giá trị nếu user đã enrolled vào classroom hoặc là Admin/Teacher.
- `meeting_id`: String | null (conditional) - ID của meeting. Chỉ có giá trị nếu user đã enrolled vào classroom hoặc là Admin/Teacher.
- `meeting_pass`: String | null (conditional) - Password của meeting. Chỉ có giá trị nếu user đã enrolled vào classroom hoặc là Admin/Teacher.
- `limit`: Integer (required) - Số lượng học viên tối đa
- `status`: String (required) - Trạng thái session: `scheduled`, `ongoing`, `completed`, `cancelled`
- `attendance_count`: Integer (default: 0) - Tổng số học viên đã đăng ký
- `present_count`: Integer (default: 0) - Số học viên có mặt
- `created_at`: DateTime (auto-generated) - Thời gian tạo
- `updated_at`: DateTime (auto-updated) - Thời gian cập nhật cuối

---

## Ví dụ Request

### Ví dụ 1: Lấy tất cả sessions của course (không filter)

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/
Authorization: Bearer {token}
```

### Ví dụ 2: Lấy sessions trong một tuần cụ thể

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/?start_date=2026-01-26&end_date=2026-02-01
Authorization: Bearer {token}
```

### Ví dụ 3: Lấy sessions từ một ngày đến tương lai

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/?start_date=2026-01-26
Authorization: Bearer {token}
```

### Ví dụ 4: Lấy sessions từ quá khứ đến một ngày

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/?end_date=2026-02-01
Authorization: Bearer {token}
```

### Ví dụ 5: Lấy sessions của một classroom cụ thể

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/?classroom_id=classroom-uuid-1
Authorization: Bearer {token}
```

### Ví dụ 6: Lấy sessions của một classroom trong một tuần cụ thể

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/?classroom_id=classroom-uuid-1&start_date=2026-01-26&end_date=2026-02-01
Authorization: Bearer {token}
```

### Ví dụ 7: Lấy thông tin chi tiết của một session (user đã enrolled)

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/session-uuid-1/
Authorization: Bearer {token}
```

### Ví dụ 8: Lấy thông tin chi tiết của một session (user chưa login)

```http
GET /api/v1/courses/9a067bbf-a263-479f-a48d-d58475b34440/sessions/session-uuid-1/
```

---

## Error Handling

- Validate `course_id` format (UUID)
- Validate `classroom_id` format (UUID) nếu được cung cấp
- Validate `start_date` và `end_date` format (YYYY-MM-DD)
- Return 404 nếu course không tồn tại
- Return 400 nếu date format hoặc classroom_id format không hợp lệ
- Nếu `classroom_id` được cung cấp nhưng không thuộc course được chỉ định, vẫn trả về 200 OK với `results: []` (không throw error để tránh information leakage)
- Đảm bảo serializer trả về đầy đủ các fields: `classroom_title`, `course_title`, và tất cả các fields khác của session model

---

## Testing

### Test Cases

1. **Get all sessions without filter**
   - Request: `GET /api/v1/courses/{course_id}/sessions/`
   - Expected: Trả về tất cả sessions của tất cả classrooms trong course

2. **Get sessions with date range**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?start_date=2026-01-26&end_date=2026-02-01`
   - Expected: Chỉ trả về sessions có `start_time` trong khoảng 26/1 - 1/2/2026

3. **Get sessions with only start_date**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?start_date=2026-01-26`
   - Expected: Trả về sessions từ 26/1/2026 đến tương lai

4. **Get sessions with only end_date**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?end_date=2026-02-01`
   - Expected: Trả về sessions từ quá khứ đến 1/2/2026

5. **Invalid course_id**
   - Request: `GET /api/v1/courses/invalid-uuid/sessions/`
   - Expected: 400 Bad Request hoặc 404 Not Found

6. **Non-existent course**
   - Request: `GET /api/v1/courses/00000000-0000-0000-0000-000000000000/sessions/`
   - Expected: 404 Not Found

7. **Invalid date format**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?start_date=2026/01/26`
   - Expected: 400 Bad Request với message "Invalid date format"

8. **Empty result**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?start_date=2099-01-01&end_date=2099-01-07`
   - Expected: 200 OK với `results: []`

9. **Get sessions by classroom_id**
   - Request: `GET /api/v1/courses/{course_id}/sessions/?classroom_id={classroom_id}`
   - Expected: Chỉ trả về sessions của classroom được chỉ định

10. **Get sessions by classroom_id with date range**
    - Request: `GET /api/v1/courses/{course_id}/sessions/?classroom_id={classroom_id}&start_date=2026-01-26&end_date=2026-02-01`
    - Expected: Chỉ trả về sessions của classroom được chỉ định trong khoảng thời gian 26/1 - 1/2/2026

11. **Invalid classroom_id format**
    - Request: `GET /api/v1/courses/{course_id}/sessions/?classroom_id=invalid-uuid`
    - Expected: 400 Bad Request với message "Invalid classroom_id format"

12. **Non-existent classroom_id**
    - Request: `GET /api/v1/courses/{course_id}/sessions/?classroom_id=00000000-0000-0000-0000-000000000000`
    - Expected: 200 OK với `results: []` (không throw error, chỉ trả về empty result)

13. **Classroom_id belongs to different course**
    - Request: `GET /api/v1/courses/{course_id}/sessions/?classroom_id={classroom_id_from_different_course}`
    - Expected: 200 OK với `results: []` (không throw error, chỉ trả về empty result vì classroom không thuộc course)

14. **Get session detail (user đã enrolled)**
    - Request: `GET /api/v1/courses/{course_id}/sessions/{session_id}/`
    - Expected: Trả về đầy đủ thông tin session, classroom, course, và `meeting_link`, `meeting_id`, `meeting_pass` có giá trị

15. **Get session detail (user chưa login)**
    - Request: `GET /api/v1/courses/{course_id}/sessions/{session_id}/`
    - Expected: Trả về thông tin session, classroom, course nhưng `meeting_link`, `meeting_id`, `meeting_pass` là `null`

16. **Get session detail (user đã login nhưng chưa enrolled)**
    - Request: `GET /api/v1/courses/{course_id}/sessions/{session_id}/`
    - Expected: Trả về thông tin session, classroom, course nhưng `meeting_link`, `meeting_id`, `meeting_pass` là `null`

17. **Get session detail (non-existent session)**
    - Request: `GET /api/v1/courses/{course_id}/sessions/00000000-0000-0000-0000-000000000000/`
    - Expected: 404 Not Found

---

## Related Endpoints

- `GET /api/v1/classrooms/{classroom_id}/sessions/` - Lấy sessions của một classroom cụ thể (đã có)
- `GET /api/v1/courses/{course_id}/classrooms/` - Lấy danh sách classrooms của course (đã có)
- `GET /api/v1/classrooms/calendar/` - Lấy calendar data (đã có, nhưng format khác)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/` - Lấy thông tin chi tiết của một session (endpoint mới)
