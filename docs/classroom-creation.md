# Classroom Creation API Update

## Tổng quan

Tài liệu này mô tả các thay đổi trong form tạo lớp học và cấu trúc payload API mới cho endpoint `POST /api/v1/classrooms/`.

**File liên quan:** `pages/admin/courses/[id]/classrooms/all-classrooms.vue`

---

## Các thay đổi trong Form

### 1. Các trường đã bỏ

- ❌ **`start_date`** (Ngày bắt đầu) - Đã xóa khỏi form
- ❌ **`end_date`** (Ngày kết thúc) - Đã xóa khỏi form
- ❌ **`is_free`** (Lớp học miễn phí) - Đã xóa checkbox và logic liên quan

### 2. Các trường mới trong Schedule

Mỗi schedule item trong `schedules_data` có thêm các trường sau:

- ✅ **`repeat`** (boolean) - Checkbox "Lặp lại" cho phép lặp lại lịch học
- ✅ **`repeat_start_date`** (string, format: `YYYY-MM-DD`) - Ngày bắt đầu lặp lại (hiển thị khi `repeat = true`)
- ✅ **`repeat_end_date`** (string, format: `YYYY-MM-DD`) - Ngày kết thúc lặp lại (hiển thị khi `repeat = true`)

### 3. Thay đổi UI Labels

- **"Phần định giá"** → **"Giá cả"**

---

## Cấu trúc Payload API

### Endpoint

```
POST /api/v1/classrooms/
```

### Request Body Structure

```typescript
{
  course_id: string // UUID của khóa học
  title: string // Tên lớp học
  student_count: number // Số lượng học viên
  schedules_data: Array<{ // Danh sách lịch học
    day_of_week: string // "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
    start_time: string // Format: "HH:mm" (ví dụ: "18:00")
    end_time: string // Format: "HH:mm" (ví dụ: "20:00")
    repeat_start_date?: string // Optional: Format "YYYY-MM-DD" (chỉ có khi repeat = true)
    repeat_end_date?: string // Optional: Format "YYYY-MM-DD" (chỉ có khi repeat = true)
  }>
  price: string // Giá gốc (Decimal string, ví dụ: "100.00")
  discount_price: string | null // Giá khuyến mãi (Decimal string hoặc null)
  background_color?: string // Màu nền cho calendar event (hex color, ví dụ: "#268100")
}
```

### Validation Rules

1. **Schedule Validation:**
   - `day_of_week`: Bắt buộc, phải là một trong các giá trị: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
   - `start_time`: Bắt buộc, format `HH:mm`
   - `end_time`: Bắt buộc, format `HH:mm`, phải sau `start_time`
   - `repeat_start_date`: Bắt buộc nếu `repeat = true`, phải là ngày hợp lệ
   - `repeat_end_date`: Bắt buộc nếu `repeat = true`, phải sau `repeat_start_date`

2. **Price Validation:**
   - `price`: Bắt buộc, phải > 0
   - `discount_price`: Optional, nếu có thì phải < `price`

3. **Background Color Validation:**
   - `background_color`: Optional, nếu có thì phải là hex color code hợp lệ (format: `#RRGGBB`)
   - Ví dụ hợp lệ: `#268100`, `#FF5733`
   - Ví dụ không hợp lệ: `268100` (thiếu `#`), `#2681` (thiếu 2 chữ số)

---

## Ví dụ Payload

### Ví dụ 1: Lớp học không lặp lại

```json
{
  "course_id": "9a067bbf-a263-479f-a48d-d58475b34440",
  "title": "Lớp 1 thành viên",
  "student_count": 1,
  "schedules_data": [
    {
      "day_of_week": "monday",
      "start_time": "18:00",
      "end_time": "20:00"
    },
    {
      "day_of_week": "wednesday",
      "start_time": "18:00",
      "end_time": "20:00"
    }
  ],
  "price": "100.00",
  "discount_price": null,
  "background_color": "#268100"
}
```

### Ví dụ 2: Lớp học có lặp lại

```json
{
  "course_id": "9a067bbf-a263-479f-a48d-d58475b34440",
  "title": "Lớp 3 thành viên",
  "student_count": 3,
  "schedules_data": [
    {
      "day_of_week": "thursday",
      "start_time": "13:00",
      "end_time": "16:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-25"
    },
    {
      "day_of_week": "saturday",
      "start_time": "13:00",
      "end_time": "16:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-25"
    }
  ],
  "price": "80.00",
  "discount_price": "70.00",
  "background_color": "#FF5733"
}
```

### Ví dụ 3: Lớp học có một số schedule lặp lại, một số không

```json
{
  "course_id": "9a067bbf-a263-479f-a48d-d58475b34440",
  "title": "Lớp hỗn hợp",
  "student_count": 5,
  "schedules_data": [
    {
      "day_of_week": "monday",
      "start_time": "18:00",
      "end_time": "20:00"
    },
    {
      "day_of_week": "wednesday",
      "start_time": "18:00",
      "end_time": "20:00",
      "repeat_start_date": "2026-01-05",
      "repeat_end_date": "2026-01-25"
    }
  ],
  "price": "90.00",
  "discount_price": null,
  "background_color": "#268100"
}
```

---

## Logic xử lý ở Frontend

### 1. Format Time cho API

```typescript
function formatTimeForApi(time: any): string {
  if (!time)
    return ''
  if (typeof time === 'string')
    return time
  if (time.format) {
    return time.format('HH:mm')
  }
  return ''
}
```

### 2. Transform Form Data

```typescript
const classroomPayload = {
  course_id: courseId.value,
  title: formState.value.title,
  student_count: Number.parseInt(formState.value.student_count),
  schedules_data: formState.value.schedule
    .filter(schedule => schedule.day && schedule.start && schedule.end)
    .map((schedule) => {
      const scheduleData: any = {
        day_of_week: schedule.day,
        start_time: formatTimeForApi(schedule.start),
        end_time: formatTimeForApi(schedule.end),
      }

      // Add repeat dates if repeat is enabled
      if (schedule.repeat && schedule.repeat_start_date && schedule.repeat_end_date) {
        scheduleData.repeat_start_date = schedule.repeat_start_date.format('YYYY-MM-DD')
        scheduleData.repeat_end_date = schedule.repeat_end_date.format('YYYY-MM-DD')
      }

      return scheduleData
    }),
  price: formState.value.price?.toString() || '0',
  discount_price: formState.value.discount_price ? formState.value.discount_price.toString() : null,
  background_color: formState.value.background_color || undefined,
}
```

---

## Backend Implementation Notes

### 1. Database Schema

Backend cần cập nhật model `ClassroomSchedule` để hỗ trợ các trường mới:

```python
class ClassroomSchedule(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=20, choices=DAY_OF_WEEK_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    # New fields for repeat functionality
    repeat_start_date = models.DateField(null=True, blank=True)
    repeat_end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2. Validation Logic

- Nếu `repeat_start_date` hoặc `repeat_end_date` được gửi lên, cả hai đều phải có giá trị
- `repeat_end_date` phải >= `repeat_start_date`
- Khi có `repeat_start_date` và `repeat_end_date`, backend cần tự động tạo các session cho các ngày trong khoảng thời gian này theo `day_of_week`

### 3. Session Generation

Khi nhận được schedule có `repeat_start_date` và `repeat_end_date`, backend cần:

1. Xác định các ngày trong khoảng `[repeat_start_date, repeat_end_date]` có `day_of_week` trùng với `day_of_week` của schedule
2. Tạo các `ClassroomSession` tương ứng cho mỗi ngày đó
3. Mỗi session có:
   - `start_time`: Kết hợp ngày + `start_time` từ schedule (format: `YYYY-MM-DDTHH:mm:00.000Z`)
   - `end_time`: Kết hợp ngày + `end_time` từ schedule (format: `YYYY-MM-DDTHH:mm:00.000Z`)
   - `topic`: Có thể để trống hoặc tự động generate

**Ví dụ cụ thể:**

Nếu schedule có:
- `day_of_week`: `"wednesday"` (thứ tư)
- `start_time`: `"12:00"`
- `end_time`: `"14:00"`
- `repeat_start_date`: `"2026-01-01"`
- `repeat_end_date`: `"2026-01-10"`

Backend sẽ:
1. Tìm tất cả các thứ tư trong khoảng từ 1/1/2026 đến 10/1/2026
2. Các thứ tư trong khoảng này là: 1/1/2026 (nếu là thứ tư), 8/1/2026 (nếu là thứ tư), v.v.
3. Tạo các sessions tương ứng cho mỗi thứ tư:
   - Session cho thứ tư đầu tiên: `start_time = "2026-01-01T12:00:00.000Z"`, `end_time = "2026-01-01T14:00:00.000Z"` (nếu 1/1/2026 là thứ tư)
   - Session cho thứ tư tiếp theo: `start_time = "2026-01-08T12:00:00.000Z"`, `end_time = "2026-01-08T14:00:00.000Z"` (nếu 8/1/2026 là thứ tư)
   - Và tiếp tục cho đến hết khoảng `repeat_end_date`

**Lưu ý:**
- Chỉ generate sessions cho các ngày có `day_of_week` trùng với `day_of_week` của schedule
- Nếu trong khoảng `[repeat_start_date, repeat_end_date]` không có ngày nào có `day_of_week` trùng, thì không tạo session nào
- Các ngày được tính trong khoảng bao gồm cả `repeat_start_date` và `repeat_end_date`

---

## Migration Path

### Frontend (✅ Đã hoàn thành)

- [x] Bỏ `start_date` và `end_date` khỏi form
- [x] Thêm checkbox "Lặp lại" cho mỗi schedule item
- [x] Thêm date pickers cho `repeat_start_date` và `repeat_end_date`
- [x] Đổi label "Phần định giá" thành "Giá cả"
- [x] Bỏ checkbox `is_free`
- [x] Cập nhật payload structure
- [x] Thêm validation cho repeat dates

### Backend (⏳ Cần implement)

- [ ] Cập nhật model `ClassroomSchedule` để thêm `repeat_start_date` và `repeat_end_date`
- [ ] Cập nhật serializer để accept các trường mới
- [ ] Implement logic tự động tạo sessions khi có repeat dates
- [ ] Cập nhật validation để đảm bảo `repeat_end_date >= repeat_start_date`
- [ ] Cập nhật API documentation
- [ ] Bỏ `is_free` khỏi payload (nếu cần)
- [ ] Bỏ `start_date` và `end_date` khỏi payload (nếu cần)
- [ ] Thêm field `background_color` vào model `Classroom` (xem thêm `docs/classroom-background-color.md`)

---

## Testing

### Test Cases

1. **Tạo lớp học không lặp lại:**
   - Tạo lớp với schedule không có `repeat_start_date` và `repeat_end_date`
   - Verify: Chỉ tạo schedule, không tự động tạo sessions

2. **Tạo lớp học có lặp lại:**
   - Tạo lớp với schedule có `repeat_start_date` và `repeat_end_date`
   - Verify: Tự động tạo các sessions cho các ngày trong khoảng thời gian

3. **Tạo lớp học hỗn hợp:**
   - Tạo lớp với một số schedule có repeat, một số không
   - Verify: Chỉ tạo sessions cho các schedule có repeat

4. **Validation:**
   - Test với `repeat_end_date < repeat_start_date` → Should fail
   - Test với chỉ có một trong hai `repeat_start_date` hoặc `repeat_end_date` → Should fail
   - Test với `discount_price >= price` → Should fail

---

## Notes

- Frontend hiện tại đang log payload ra console để test. Khi backend sẵn sàng, uncomment dòng `await createClassroom(classroomPayload)` trong `handleOk()` function.
- Payload structure đã được định nghĩa sẵn và sẵn sàng để backend implement.
- Các trường `repeat_start_date` và `repeat_end_date` là optional trong payload, chỉ được gửi lên khi `repeat = true` và cả hai đều có giá trị.
