# Create Sessions API Documentation

## Tổng quan

API để tạo nhiều sessions cho một classroom dựa trên lịch học được định nghĩa. API này cho phép tạo nhiều sessions cùng lúc bằng cách định nghĩa các schedule items với khả năng lặp lại theo ngày.

---

## Endpoint

### Create Sessions for Classroom

**Endpoint**: `POST /api/v1/classrooms/{classroom_id}/sessions/bulk/`

**Description**: Tạo nhiều sessions cho một classroom dựa trên danh sách lịch học. Mỗi schedule item có thể được cấu hình để lặp lại theo ngày, và sẽ tự động generate các sessions tương ứng.

**Permission**: Authenticated (Admin hoặc Teacher)

**Path Parameters:**
- `classroom_id`: UUID (required) - ID của classroom

**Request Body Structure:**

```json
{
  "classroom_id": "string (UUID của classroom, có thể lấy từ path hoặc body, nếu có trong body thì phải trùng với path)",
  "schedules_data": [
    {
      "day_of_week": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
      "start_time": "HH:mm (ví dụ: 18:00)",
      "end_time": "HH:mm (ví dụ: 20:00)",
      "repeat_start_date": "YYYY-MM-DD (optional, nếu có sẽ generate sessions cho các ngày trong khoảng)",
      "repeat_end_date": "YYYY-MM-DD (optional, phải có nếu có repeat_start_date)"
    }
  ],
  "meeting_link": "string (optional, link meeting chung cho tất cả sessions)",
  "meeting_id": "string (optional, ID của meeting chung cho tất cả sessions)",
  "meeting_pass": "string (optional, password của meeting chung cho tất cả sessions)"
}
```

---

## Response Structure

### Response 201 Created

```json
{
  "created_count": 5,
  "sessions": [
    {
      "id": "session-uuid-1",
      "classroom": "classroom-uuid-1",
      "topic": "",
      "description": "",
      "start_time": "2026-01-05T18:00:00.000Z",
      "end_time": "2026-01-05T20:00:00.000Z",
      "location": "",
      "meeting_link": "https://zoom.us/j/123456789",
      "meeting_id": "123456789",
      "meeting_pass": "password123",
      "limit": 10,
      "status": "scheduled",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "session-uuid-2",
      "classroom": "classroom-uuid-1",
      "topic": "",
      "description": "",
      "start_time": "2026-01-07T18:00:00.000Z",
      "end_time": "2026-01-07T20:00:00.000Z",
      "location": "",
      "meeting_link": "https://zoom.us/j/123456789",
      "meeting_id": "123456789",
      "meeting_pass": "password123",
      "limit": 10,
      "status": "scheduled",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Response 400 Bad Request

```json
{
  "detail": "Invalid schedule data",
  "errors": {
    "schedules_data": [
      "repeat_end_date must be after repeat_start_date"
    ]
  }
}
```

### Response 404 Not Found

```json
{
  "detail": "Classroom not found"
}
```

---

## Validation Rules

1. **Schedule Validation:**
   - `day_of_week`: Bắt buộc, phải là một trong các giá trị: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
   - `start_time`: Bắt buộc, format `HH:mm`
   - `end_time`: Bắt buộc, format `HH:mm`, phải sau `start_time`
   - `repeat_start_date`: Optional, format `YYYY-MM-DD`. Nếu có thì `repeat_end_date` cũng phải có
   - `repeat_end_date`: Optional, format `YYYY-MM-DD`. Phải có nếu có `repeat_start_date`, và phải >= `repeat_start_date`

2. **Meeting Fields Validation:**
   - `meeting_link`: Optional, phải là URL hợp lệ nếu có
   - `meeting_id`: Optional
   - `meeting_pass`: Optional

3. **General Validation:**
   - `schedules_data`: Bắt buộc, phải có ít nhất 1 item
   - `classroom_id` trong body (nếu có) phải trùng với `classroom_id` trong path

---

## Session Generation Logic

Khi nhận được request, backend sẽ:

1. **Với mỗi schedule item trong `schedules_data`:**

   **Nếu có `repeat_start_date` và `repeat_end_date`:**
   - Tìm tất cả các ngày trong khoảng `[repeat_start_date, repeat_end_date]` có `day_of_week` trùng với `day_of_week` của schedule
   - Tạo một session cho mỗi ngày đó với:
     - `start_time`: Kết hợp ngày + `start_time` từ schedule (format: `YYYY-MM-DDTHH:mm:00.000Z`)
     - `end_time`: Kết hợp ngày + `end_time` từ schedule (format: `YYYY-MM-DDTHH:mm:00.000Z`)
     - `meeting_link`, `meeting_id`, `meeting_pass`: Lấy từ request body (nếu có)
     - `topic`: Để trống hoặc tự động generate
     - `description`: Để trống
     - `status`: `"scheduled"`

   **Nếu không có `repeat_start_date` và `repeat_end_date`:**
   - Không tạo session (hoặc có thể tạo 1 session với ngày hiện tại, tùy vào business logic)

2. **Ví dụ cụ thể:**

   Request:
   ```json
   {
     "classroom_id": "classroom-uuid-1",
     "schedules_data": [
       {
         "day_of_week": "wednesday",
         "start_time": "12:00",
         "end_time": "14:00",
         "repeat_start_date": "2026-01-01",
         "repeat_end_date": "2026-01-10"
       },
       {
         "day_of_week": "friday",
         "start_time": "18:00",
         "end_time": "20:00",
         "repeat_start_date": "2026-01-01",
         "repeat_end_date": "2026-01-10"
       }
     ],
     "meeting_link": "https://zoom.us/j/123456789",
     "meeting_id": "123456789",
     "meeting_pass": "password123"
   }
   ```

   Backend sẽ:
   - Tìm các thứ tư trong khoảng 1/1/2026 - 10/1/2026: giả sử là 1/1/2026, 8/1/2026
   - Tìm các thứ sáu trong khoảng 1/1/2026 - 10/1/2026: giả sử là 3/1/2026, 10/1/2026
   - Tạo 4 sessions:
     - Session 1: 1/1/2026 12:00-14:00 (thứ tư)
     - Session 2: 8/1/2026 12:00-14:00 (thứ tư)
     - Session 3: 3/1/2026 18:00-20:00 (thứ sáu)
     - Session 4: 10/1/2026 18:00-20:00 (thứ sáu)
   - Tất cả 4 sessions đều có `meeting_link`, `meeting_id`, `meeting_pass` giống nhau

---

## Ví dụ Request

### Ví dụ 1: Tạo sessions với 1 schedule item có lặp lại

```http
POST /api/v1/classrooms/classroom-uuid-1/sessions/bulk/
Content-Type: application/json
Authorization: Bearer {token}

{
  "schedules_data": [
    {
      "day_of_week": "monday",
      "start_time": "18:00",
      "end_time": "20:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-26"
    }
  ],
  "meeting_link": "https://zoom.us/j/123456789",
  "meeting_id": "123456789",
  "meeting_pass": "password123"
}
```

### Ví dụ 2: Tạo sessions với nhiều schedule items có lặp lại

```http
POST /api/v1/classrooms/classroom-uuid-1/sessions/bulk/
Content-Type: application/json
Authorization: Bearer {token}

{
  "schedules_data": [
    {
      "day_of_week": "monday",
      "start_time": "18:00",
      "end_time": "20:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-26"
    },
    {
      "day_of_week": "wednesday",
      "start_time": "18:00",
      "end_time": "20:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-26"
    }
  ],
  "meeting_link": "https://zoom.us/j/123456789",
  "meeting_pass": "password123"
}
```

### Ví dụ 3: Tạo sessions không có meeting link

```http
POST /api/v1/classrooms/classroom-uuid-1/sessions/bulk/
Content-Type: application/json
Authorization: Bearer {token}

{
  "schedules_data": [
    {
      "day_of_week": "thursday",
      "start_time": "13:00",
      "end_time": "16:00",
      "repeat_start_date": "2026-01-08",
      "repeat_end_date": "2026-01-29"
    }
  ]
}
```

---

## Error Handling

- Validate `classroom_id` format (UUID) và tồn tại
- Validate `schedules_data` không rỗng
- Validate mỗi schedule item:
  - `day_of_week` hợp lệ
  - `start_time` và `end_time` format đúng và `end_time > start_time`
  - Nếu có `repeat_start_date` thì phải có `repeat_end_date`
  - `repeat_end_date >= repeat_start_date`
- Return 404 nếu classroom không tồn tại
- Return 400 nếu validation fail
- Nếu một số sessions tạo thành công nhưng một số fail, có thể rollback toàn bộ hoặc trả về partial success (tùy vào business logic)

---

## Testing

### Test Cases

1. **Tạo sessions với 1 schedule item có lặp lại:**
   - Request với 1 schedule item có `repeat_start_date` và `repeat_end_date`
   - Expected: Tạo các sessions cho các ngày có `day_of_week` trùng trong khoảng thời gian

2. **Tạo sessions với nhiều schedule items:**
   - Request với nhiều schedule items, mỗi item có repeat dates khác nhau
   - Expected: Tạo sessions cho tất cả các schedule items

3. **Tạo sessions với meeting link:**
   - Request có `meeting_link`, `meeting_id`, `meeting_pass`
   - Expected: Tất cả sessions được tạo đều có meeting information

4. **Tạo sessions không có meeting link:**
   - Request không có `meeting_link`, `meeting_id`, `meeting_pass`
   - Expected: Sessions được tạo với các fields này là `null` hoặc empty string

5. **Validation:**
   - Test với `repeat_end_date < repeat_start_date` → Should fail
   - Test với chỉ có một trong hai `repeat_start_date` hoặc `repeat_end_date` → Should fail
   - Test với `end_time <= start_time` → Should fail
   - Test với `day_of_week` không hợp lệ → Should fail
   - Test với `schedules_data` rỗng → Should fail

6. **Non-existent classroom:**
   - Request với `classroom_id` không tồn tại
   - Expected: 404 Not Found

7. **Invalid classroom_id format:**
   - Request với `classroom_id` không phải UUID
   - Expected: 400 Bad Request

---

## Related Endpoints

- `POST /api/v1/classrooms/{classroom_id}/sessions/` - Tạo một session đơn lẻ (đã có)
- `GET /api/v1/classrooms/{classroom_id}/sessions/` - Lấy danh sách sessions của classroom (đã có)
- `POST /api/v1/classrooms/` - Tạo classroom với schedules (đã có, tự động generate sessions khi có repeat dates)
