# Classroom Background Color API Specification

## Tổng quan

Tài liệu này mô tả việc thêm field `background_color` vào Classroom model và các API endpoints liên quan. Field này được sử dụng để hiển thị màu nền cho các calendar events của classroom trong giao diện.

---

## Database Schema

### Model Field

**Field Name**: `background_color`

**Field Type**: `CharField` (không giới hạn độ dài, hoặc có thể set max_length tùy backend)

**Required**: `False` (nullable, blank)

**Format**: `string` hoặc `null` (không có validation về format)

**Default**: `null`

**Description**: Màu nền cho calendar event của classroom. Có thể là bất kỳ string nào hoặc `null`. Frontend sẽ xử lý format màu phù hợp.

---

## API Endpoints

### 1. Create Classroom

**Endpoint**: `POST /api/v1/classrooms/`

**Request Body:**

Field `background_color` là optional trong request body:

```json
{
  "course_id": "uuid",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "schedules_data": [...],
  "price": "100.00",
  "discount_price": null,
  "background_color": "#268100"
}
```

**Response:**

Field `background_color` sẽ được trả về trong response:

```json
{
  "id": "uuid",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "price": "100.00",
  "discount_price": null,
  "background_color": "#268100",
  "course": {...},
  "schedules": [...],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### 2. Get Classroom Detail

**Endpoint**: `GET /api/v1/classrooms/{classroom_id}/`

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Response:**

```json
{
  "id": "uuid",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "price": "100.00",
  "discount_price": null,
  "background_color": "#268100",
  "meeting_link": "https://meet.example.com/room",
  "meeting_id": "room-id",
  "meeting_pass": "password",
  "course": {...},
  "schedules": [...],
  "enrollment_count": 0,
  "session_count": 0,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### 3. Update Classroom (PATCH)

**Endpoint**: `PATCH /api/v1/classrooms/{classroom_id}/`

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Request Body:**

Field `background_color` là optional và có thể được update độc lập:

```json
{
  "background_color": "#FF5733"
}
```

Hoặc có thể update cùng với các field khác:

```json
{
  "title": "Lớp học mới",
  "background_color": "#268100"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Lớp học mới",
  "background_color": "#268100",
  ...
}
```

**Note**: Có thể set `background_color` thành `null` để xóa màu:

```json
{
  "background_color": null
}
```

---

### 4. List Classrooms

**Endpoint**: `GET /api/v1/classrooms/`

**Query Parameters:**
- `page`: Integer (optional) - Số trang
- `page_size`: Integer (optional) - Số items mỗi trang

**Response:**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid-1",
      "title": "Lớp 1 thành viên",
      "background_color": "#268100",
      ...
    },
    {
      "id": "uuid-2",
      "title": "Lớp 3 thành viên",
      "background_color": null,
      ...
    }
  ]
}
```

---

## Course Sessions API Integration

### Get Course Sessions

**Endpoint**: `GET /api/v1/courses/{course_id}/sessions/`

**Path Parameters:**
- `course_id`: UUID (required) - ID của course

**Query Parameters:**
- `classroom_id`: UUID (optional) - Filter theo classroom
- `start_date`: String (optional, format: `YYYY-MM-DD`) - Ngày bắt đầu
- `end_date`: String (optional, format: `YYYY-MM-DD`) - Ngày kết thúc
- `page`: Integer (optional) - Số trang
- `page_size`: Integer (optional) - Số items mỗi trang

**Response:**

Mỗi session item trong response sẽ có field `background_color` được lấy từ classroom của session đó:

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
      "start_time": "2026-01-05T18:00:00.000Z",
      "end_time": "2026-01-05T20:00:00.000Z",
      "classroom_title": "Lớp 1 thành viên",
      "background_color": "#268100",
      ...
    }
  ]
}
```

**Implementation Note:**

Field `background_color` trong session response được lấy từ `classroom.background_color` của classroom mà session đó thuộc về. Nếu classroom không có `background_color` (null), thì field này trong session response cũng sẽ là `null`.

---

## Validation Rules

1. **Optional Field:**
   - `background_color` là optional, có thể là `string`, `null`, hoặc không gửi trong request
   - Nếu không có giá trị, field sẽ là `null` trong database và response
   - Không có validation về format, bất kỳ string nào hoặc `null` đều được chấp nhận

---

## Field Description

### Request Field

**Name**: `background_color`

**Type**: `string | null`

**Required**: `false`

**Description**: Màu nền cho calendar event của classroom. Có thể là bất kỳ string nào hoặc `null`. Không có validation về format.

**Examples**:
- `"#268100"` - Hex color code
- `"#FF5733"` - Hex color code
- `"rgb(255, 87, 51)"` - RGB format
- `"blue"` - Color name
- `null` - Không có màu (sử dụng màu mặc định)

### Response Field

**Name**: `background_color`

**Type**: `string | null`

**Description**: Hex color code cho màu nền của calendar event, được lấy từ classroom. Nếu classroom không có `background_color`, giá trị sẽ là `null`.

---

## Examples

### Example 1: Create Classroom with Background Color

**Request:**
```json
POST /api/v1/classrooms/
{
  "course_id": "course-uuid",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "schedules_data": [
    {
      "day_of_week": "monday",
      "start_time": "18:00",
      "end_time": "20:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-25"
    }
  ],
  "price": "100.00",
  "background_color": "#268100"
}
```

**Response:**
```json
{
  "id": "classroom-uuid",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "price": "100.00",
  "discount_price": null,
  "background_color": "#268100",
  "course": {...},
  "schedules": [...],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### Example 2: Update Classroom Background Color

**Request:**
```json
PATCH /api/v1/classrooms/{classroom_id}/
{
  "background_color": "#FF5733"
}
```

**Response:**
```json
{
  "id": "classroom-uuid",
  "title": "Lớp 1 thành viên",
  "background_color": "#FF5733",
  ...
}
```

---

### Example 3: Remove Background Color

**Request:**
```json
PATCH /api/v1/classrooms/{classroom_id}/
{
  "background_color": null
}
```

**Response:**
```json
{
  "id": "classroom-uuid",
  "title": "Lớp 1 thành viên",
  "background_color": null,
  ...
}
```

---

### Example 4: Get Course Sessions with Background Color

**Request:**
```
GET /api/v1/courses/{course_id}/sessions/
```

**Response:**
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
      "start_time": "2026-01-05T18:00:00.000Z",
      "end_time": "2026-01-05T20:00:00.000Z",
      "classroom_title": "Lớp 1 thành viên",
      "background_color": "#268100",
      "attendance_count": 0,
      "present_count": 0,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "session-uuid-2",
      "classroom": "classroom-uuid-2",
      "topic": "Lớp 3 thành viên - Buổi 1",
      "start_time": "2026-01-06T13:00:00.000Z",
      "end_time": "2026-01-06T16:00:00.000Z",
      "classroom_title": "Lớp 3 thành viên",
      "background_color": null,
      "attendance_count": 0,
      "present_count": 0,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

---

## Notes

- Field `background_color` được lưu ở level classroom, không phải session
- Tất cả sessions của một classroom sẽ có cùng `background_color` (được lấy từ classroom)
- Nếu classroom không có `background_color` (null), tất cả sessions của classroom đó cũng sẽ có `background_color: null` trong response
- Frontend sẽ xử lý trường hợp `background_color` là `null` bằng cách sử dụng màu mặc định hoặc random từ danh sách màu định sẵn
- Field này không ảnh hưởng đến logic nghiệp vụ, chỉ phục vụ cho mục đích hiển thị UI
