# User Calendar Sessions API Specification

## Tổng quan

API để lấy danh sách tất cả sessions của tất cả classrooms mà user hiện tại đã enrolled. API này phục vụ cho trang calendar của user, cho phép user xem tất cả sessions từ các courses mà họ đã tham gia.

**Đối tượng sử dụng**: User (học viên đã enrolled vào các classrooms)

---

## Endpoint

### Get All Sessions for User Calendar

**Endpoint**: `GET /api/v1/classrooms/calendar/`

**Description**: Lấy danh sách tất cả sessions của tất cả classrooms mà user hiện tại đã enrolled. API này chỉ trả về sessions từ các classrooms mà user đã enrolled và có quyền truy cập.

**Permission**: Authenticated (User phải đã enrolled vào ít nhất một classroom)

**Path Parameters**: Không có

**Query Parameters:**
- `classroom_id`: UUID (optional) - ID của classroom để filter. Nếu có, chỉ trả về sessions của classroom này. Nếu không có, trả về sessions của tất cả classrooms mà user đã enrolled.
- `start_date`: String (optional, format: `YYYY-MM-DD`) - Ngày bắt đầu để filter sessions. Nếu không có, lấy tất cả sessions từ quá khứ đến tương lai.
- `end_date`: String (optional, format: `YYYY-MM-DD`) - Ngày kết thúc để filter sessions. Nếu không có, lấy tất cả sessions từ `start_date` đến tương lai.
- `page`: Integer (optional, default: 1) - Số trang (nếu có pagination)
- `page_size`: Integer (optional, default: 100) - Số items mỗi trang

**Note**:
- API chỉ trả về sessions từ các classrooms mà user đã enrolled (enrollment status = 'enrolled' hoặc 'completed')
- Nếu có `classroom_id`, chỉ trả về sessions của classroom đó (và user phải đã enrolled vào classroom đó)
- Nếu chỉ có `start_date` mà không có `end_date`, lấy tất cả sessions từ `start_date` đến tương lai
- Nếu chỉ có `end_date` mà không có `start_date`, lấy tất cả sessions từ quá khứ đến `end_date`
- Nếu có cả `start_date` và `end_date`, lấy sessions trong khoảng thời gian này (bao gồm cả `start_date` và `end_date`)
- Filter dựa trên `start_time` của session (UTC)
- Có thể kết hợp `classroom_id` với `start_date` và `end_date` để filter chính xác hơn

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
      "background_color": "#268100",
      "meeting_link": "https://zoom.us/j/123456789",
      "meeting_id": "123456789",
      "meeting_pass": "password123",
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
      "background_color": "#268100",
      "meeting_link": "https://zoom.us/j/123456789",
      "meeting_id": "123456789",
      "meeting_pass": "password123",
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
      "background_color": "#FF5733",
      "meeting_link": "https://zoom.us/j/987654321",
      "meeting_id": "987654321",
      "meeting_pass": "password456",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response Fields:**

- `count`: Integer - Tổng số sessions
- `next`: String | null - URL của trang tiếp theo (nếu có)
- `previous`: String | null - URL của trang trước (nếu có)
- `results`: Array - Danh sách sessions

**Session Object Fields:**

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
- `background_color`: String (optional) - Màu nền cho event trong calendar (format: hex color, ví dụ: `#268100`). Được lấy từ `classroom.background_color`. Nếu không có, frontend sẽ sử dụng màu mặc định.
- `meeting_link`: String | null (required) - Link meeting (Zoom, Google Meet, etc.). Luôn có giá trị vì user đã enrolled vào classroom.
- `meeting_id`: String | null (required) - ID của meeting. Luôn có giá trị vì user đã enrolled vào classroom.
- `meeting_pass`: String | null (required) - Password của meeting. Luôn có giá trị vì user đã enrolled vào classroom.
- `created_at`: DateTime (auto-generated) - Thời gian tạo
- `updated_at`: DateTime (auto-updated) - Thời gian cập nhật cuối

**Note về Meeting Information:**
- Vì user đã enrolled vào classroom, nên `meeting_link`, `meeting_id`, `meeting_pass` luôn có giá trị (không phải `null`)
- Thông tin meeting được lấy từ classroom của session

---

## Response 403 Forbidden

```json
{
  "detail": "You are not enrolled in any classroom."
}
```

**Lưu ý:**
- Nếu user chưa enrolled vào bất kỳ classroom nào, trả về 403
- Nếu user đã enrolled nhưng không có session nào trong khoảng thời gian filter, trả về 200 với `results: []`

---

## Response 404 Not Found

```json
{
  "detail": "Classroom not found or you are not enrolled in this classroom"
}
```

**Lưu ý:**
- Chỉ trả về 404 khi `classroom_id` được cung cấp nhưng:
  - Classroom không tồn tại, hoặc
  - User chưa enrolled vào classroom đó

---

## Filtering Logic

1. **By Classroom:**
   - Nếu có `classroom_id`, chỉ trả về sessions của classroom đó
   - User phải đã enrolled vào classroom đó, nếu không trả về 404

2. **By Date Range:**
   - Nếu có `start_date` và `end_date`, chỉ trả về sessions có `start_time` trong khoảng `[start_date, end_date]`
   - Nếu chỉ có `start_date`, lấy sessions từ `start_date` đến tương lai
   - Nếu chỉ có `end_date`, lấy sessions từ quá khứ đến `end_date`

3. **Default:**
   - Nếu không có filter, trả về tất cả sessions từ tất cả classrooms mà user đã enrolled

---

## Sorting

Sessions được sắp xếp theo:
1. `start_time` (tăng dần) - Sessions sớm hơn hiển thị trước
2. `created_at` (tăng dần) - Nếu cùng `start_time`

---

## Permission & Access Control

1. **User Enrollment Check:**
   - Chỉ trả về sessions từ classrooms mà user đã enrolled
   - Enrollment status phải là `'enrolled'` hoặc `'completed'`
   - Không trả về sessions từ classrooms có status `'pending'` hoặc `'cancelled'`

2. **Session Access:**
   - Chỉ trả về sessions thuộc classrooms mà user đã enrolled
   - Nếu session không có classroom (edge case), không trả về

3. **Meeting Information:**
   - Vì user đã enrolled, nên `meeting_link`, `meeting_id`, `meeting_pass` luôn có giá trị
   - Thông tin meeting được lấy từ classroom của session

---

## Example Requests

### Example 1: Get All Sessions (No Filter)

```http
GET /api/v1/classrooms/calendar/
Authorization: Bearer {token}
```

**Response:** Tất cả sessions từ tất cả classrooms mà user đã enrolled

---

### Example 2: Get Sessions in a Specific Week

```http
GET /api/v1/classrooms/calendar/?start_date=2026-01-26&end_date=2026-02-01
Authorization: Bearer {token}
```

**Response:** Chỉ sessions có `start_time` trong khoảng 26/1 - 1/2/2026

---

### Example 3: Get Sessions from a Date to Future

```http
GET /api/v1/classrooms/calendar/?start_date=2026-01-26
Authorization: Bearer {token}
```

**Response:** Sessions từ 26/1/2026 đến tương lai

---

### Example 4: Get Sessions from Past to a Date

```http
GET /api/v1/classrooms/calendar/?end_date=2026-02-01
Authorization: Bearer {token}
```

**Response:** Sessions từ quá khứ đến 1/2/2026

---

### Example 5: Get Sessions from Specific Classroom

```http
GET /api/v1/classrooms/calendar/?classroom_id=classroom-uuid-1
Authorization: Bearer {token}
```

**Response:** Chỉ sessions của `classroom-uuid-1` (user phải đã enrolled vào classroom này)

---

### Example 6: Get Sessions from Specific Classroom in a Week

```http
GET /api/v1/classrooms/calendar/?classroom_id=classroom-uuid-1&start_date=2026-01-26&end_date=2026-02-01
Authorization: Bearer {token}
```

**Response:** Chỉ sessions của `classroom-uuid-1` trong khoảng 26/1 - 1/2/2026

---

### Example 7: Get Sessions with Pagination

```http
GET /api/v1/classrooms/calendar/?page=1&page_size=20
Authorization: Bearer {token}
```

**Response:** Sessions với pagination (20 items mỗi trang)

---

## Error Handling

### Response 400 Bad Request

```json
{
  "detail": "Invalid query parameters",
  "errors": {
    "classroom_id": ["Invalid UUID format"],
    "start_date": ["Invalid date format. Expected YYYY-MM-DD"],
    "end_date": ["Invalid date format. Expected YYYY-MM-DD"],
    "page": ["Page must be a positive integer"],
    "page_size": ["Page size must be a positive integer"]
  }
}
```

---

### Response 403 Forbidden

```json
{
  "detail": "You are not enrolled in any classroom."
}
```

---

### Response 404 Not Found

```json
{
  "detail": "Classroom not found or you are not enrolled in this classroom"
}
```

**Lưu ý:** Chỉ trả về 404 khi `classroom_id` được cung cấp nhưng classroom không tồn tại hoặc user chưa enrolled.

---

## Migration Notes

### Old API (Deprecated)

**Endpoint**: `GET /api/v1/classrooms/calendar/?view=week&date=2026-01-12`

**Query Parameters:**
- `view`: String (optional) - View type (`week`, `month`, etc.)
- `date`: String (optional, format: `YYYY-MM-DD`) - Date to center the view

**Response Structure:**
```json
{
  "view_type": "week",
  "period": "...",
  "date_range": {
    "start": "...",
    "end": "..."
  },
  "classrooms": [
    {
      "id": "...",
      "title": "...",
      "course": {...},
      "sessions": [...]
    }
  ],
  "upcoming_today": [...],
  "total_classrooms": 2,
  "total_sessions": 10
}
```

### New API

**Endpoint**: `GET /api/v1/classrooms/calendar/`

**Query Parameters:**
- `classroom_id`: UUID (optional)
- `start_date`: String (optional, format: `YYYY-MM-DD`)
- `end_date`: String (optional, format: `YYYY-MM-DD`)
- `page`: Integer (optional)
- `page_size`: Integer (optional)

**Response Structure:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "...",
      "classroom": "...",
      "topic": "...",
      "classroom_title": "...",
      "course_title": "...",
      "background_color": "...",
      "meeting_link": "...",
      "meeting_id": "...",
      "meeting_pass": "...",
      ...
    }
  ]
}
```

**Key Changes:**
1. **Query Parameters**: Thay `view` và `date` bằng `start_date`, `end_date`, `classroom_id`, `page`, `page_size`
2. **Response Structure**: Thay structure nested (classrooms -> sessions) bằng flat list (results: sessions[])
3. **Meeting Information**: Luôn có giá trị vì user đã enrolled
4. **Background Color**: Được lấy từ `classroom.background_color` và expose trong response

---

## Implementation Notes

1. **Enrollment Check:**
   - Backend cần check user đã enrolled vào classroom trước khi trả về sessions
   - Chỉ trả về sessions từ classrooms có enrollment status = 'enrolled' hoặc 'completed'

2. **Date Filtering:**
   - Filter dựa trên `start_time` của session (UTC)
   - So sánh date (không bao gồm time) với `start_date` và `end_date`

3. **Background Color:**
   - Lấy từ `classroom.background_color` của classroom chứa session
   - Nếu classroom không có `background_color`, field này sẽ là `null` trong response

4. **Meeting Information:**
   - Lấy từ classroom của session
   - Vì user đã enrolled, nên luôn có giá trị (không phải `null`)

5. **Pagination:**
   - Hỗ trợ pagination với `page` và `page_size`
   - Default `page_size = 100` nếu không được chỉ định

---

## Related Endpoints

- `GET /api/v1/courses/{course_id}/sessions/` - Get sessions of a specific course (Admin/Teacher)
- `GET /api/v1/courses/{course_id}/sessions/{session_id}/` - Get session detail
- `GET /api/v1/courses/enrolled/` - Get user's enrolled courses

---

## Testing

### Test Cases

1. **Get All Sessions:**
   - Request: `GET /api/v1/classrooms/calendar/`
   - Expected: Trả về tất cả sessions từ tất cả classrooms mà user đã enrolled

2. **Get Sessions with Date Range:**
   - Request: `GET /api/v1/classrooms/calendar/?start_date=2026-01-26&end_date=2026-02-01`
   - Expected: Chỉ sessions có `start_time` trong khoảng 26/1 - 1/2/2026

3. **Get Sessions from Specific Classroom:**
   - Request: `GET /api/v1/classrooms/calendar/?classroom_id={classroom_id}`
   - Expected: Chỉ sessions của classroom được chỉ định

4. **User Not Enrolled:**
   - Request: `GET /api/v1/classrooms/calendar/`
   - Expected: 403 Forbidden với message "You are not enrolled in any classroom."

5. **Invalid Classroom ID:**
   - Request: `GET /api/v1/classrooms/calendar/?classroom_id=invalid-uuid`
   - Expected: 400 Bad Request với validation error

6. **Classroom Not Found:**
   - Request: `GET /api/v1/classrooms/calendar/?classroom_id=00000000-0000-0000-0000-000000000000`
   - Expected: 404 Not Found

7. **Classroom Not Enrolled:**
   - Request: `GET /api/v1/classrooms/calendar/?classroom_id={classroom_id_user_not_enrolled}`
   - Expected: 404 Not Found với message "Classroom not found or you are not enrolled in this classroom"

8. **Invalid Date Format:**
   - Request: `GET /api/v1/classrooms/calendar/?start_date=2026/01/26`
   - Expected: 400 Bad Request với message "Invalid date format. Expected YYYY-MM-DD"

9. **Empty Result:**
   - Request: `GET /api/v1/classrooms/calendar/?start_date=2099-01-01&end_date=2099-01-07`
   - Expected: 200 OK với `results: []`

10. **Pagination:**
    - Request: `GET /api/v1/classrooms/calendar/?page=1&page_size=20`
    - Expected: Trả về 20 sessions đầu tiên, có `next` nếu còn nhiều hơn

---

## Notes

- API này chỉ dành cho user (học viên), không phải admin/teacher
- User phải đã enrolled vào ít nhất một classroom để có thể gọi API này
- Tất cả sessions trả về đều từ classrooms mà user đã enrolled
- Meeting information (`meeting_link`, `meeting_id`, `meeting_pass`) luôn có giá trị vì user đã enrolled
- Background color được lấy từ classroom và expose trong response để frontend có thể hiển thị màu cho calendar events
