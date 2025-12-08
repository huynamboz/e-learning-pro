# Classroom Pricing Documentation

## Tổng quan

Hệ thống e-learning hỗ trợ **pricing độc lập cho từng Classroom**, cho phép mỗi classroom có giá riêng biệt, không phụ thuộc vào giá của Course. Điều này cho phép:

- **1-on-1 classes** (1 học viên) có thể có giá cao hơn **group classes** (nhiều học viên)
- Mỗi classroom có thể có pricing riêng, phù hợp với format và số lượng học viên
- Hỗ trợ discount pricing và free classrooms
- Order tự động sử dụng giá từ classroom thay vì course

## Business Model

### Pricing Structure

```
Course (base price: 100.00)
├── Group Classroom (30 students) → price: 80.00
├── Group Classroom (20 students) → price: 90.00
└── 1-on-1 Classroom (1 student) → price: 200.00
```

**Lưu ý:**
- Giá của Course chỉ là reference, không còn được sử dụng khi tạo Order
- Mỗi Classroom có thể có giá khác nhau
- 1-on-1 classes thường có giá cao hơn group classes

## Models

### Classroom Model

Classroom model có các trường pricing sau:

```python
class Classroom(models.Model):
    # Pricing fields
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Classroom price (1-on-1 classes typically have higher price than group classes)"
    )
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Discounted price (optional, used if set)"
    )
    is_free = models.BooleanField(
        default=False,
        help_text="Is this classroom free? (overrides price if True)"
    )
    
    # Properties
    @property
    def effective_price(self):
        """Return the effective price (discount price if available, otherwise regular price, 0 if free)."""
        if self.is_free:
            return 0
        return self.discount_price if self.discount_price else self.price
    
    @property
    def is_one_on_one(self):
        """Check if this is a 1-on-1 classroom (student_count == 1)."""
        return self.student_count == 1
```

### Validation Rules

1. **Price validation:**
   - Nếu `is_free = True`: price có thể là bất kỳ giá trị nào (sẽ bị override)
   - Nếu `is_free = False`: `price` phải > 0

2. **Discount price validation:**
   - `discount_price` phải < `price` (nếu được set)

3. **Effective price logic:**
   - Nếu `is_free = True` → `effective_price = 0`
   - Nếu `discount_price` được set → `effective_price = discount_price`
   - Ngược lại → `effective_price = price`

## API Endpoints

### 1. Create Classroom with Pricing

**Endpoint:** `POST /api/v1/classrooms/`

**Request Body:**
```json
{
    "course_id": "uuid",
    "title": "Group Class (30 students)",
    "student_count": 30,
    "price": "80.00",
    "discount_price": null,  // optional
    "is_free": false
}
```

**Response:**
```json
{
    "id": "uuid",
    "title": "Group Class (30 students)",
    "student_count": 30,
    "price": "80.00",
    "discount_price": null,
    "is_free": false,
    "effective_price": "80.00",
    "is_one_on_one": false,
    "course": {...},
    "schedules": [...],
    "enrollment_count": 0,
    "session_count": 0,
    "created_at": "2025-12-07T00:00:00Z",
    "updated_at": "2025-12-07T00:00:00Z"
}
```

### 2. Create 1-on-1 Classroom

**Request Body:**
```json
{
    "course_id": "uuid",
    "title": "1-on-1 Class",
    "student_count": 1,
    "price": "200.00",
    "discount_price": null,
    "is_free": false
}
```

**Response:**
```json
{
    "id": "uuid",
    "title": "1-on-1 Class",
    "student_count": 1,
    "price": "200.00",
    "effective_price": "200.00",
    "is_one_on_one": true,  // automatically true when student_count == 1
    ...
}
```

### 3. Create Classroom with Discount

**Request Body:**
```json
{
    "course_id": "uuid",
    "title": "Discounted Class",
    "student_count": 30,
    "price": "100.00",
    "discount_price": "75.00",
    "is_free": false
}
```

**Response:**
```json
{
    "id": "uuid",
    "price": "100.00",
    "discount_price": "75.00",
    "effective_price": "75.00",  // uses discount_price
    ...
}
```

### 4. Create Free Classroom

**Request Body:**
```json
{
    "course_id": "uuid",
    "title": "Free Trial Class",
    "student_count": 30,
    "price": "100.00",
    "is_free": true
}
```

**Response:**
```json
{
    "id": "uuid",
    "price": "100.00",
    "is_free": true,
    "effective_price": "0.00",  // always 0 for free classrooms
    ...
}
```

### 5. List Classrooms

**Endpoint:** `GET /api/v1/classrooms/`

**Response:**
```json
{
    "count": 2,
    "results": [
        {
            "id": "uuid",
            "title": "Group Class",
            "price": "80.00",
            "effective_price": "80.00",
            "is_one_on_one": false,
            ...
        },
        {
            "id": "uuid",
            "title": "1-on-1 Class",
            "price": "200.00",
            "effective_price": "200.00",
            "is_one_on_one": true,
            ...
        }
    ]
}
```

### 6. Get Classroom Detail

**Endpoint:** `GET /api/v1/classrooms/{id}/`

**Response:** Tương tự như create response, bao gồm đầy đủ pricing fields.

## Order Creation

### Order sử dụng Classroom Price

Khi student tạo Order, hệ thống **tự động lấy giá từ Classroom** thay vì Course:

**Endpoint:** `POST /api/v1/orders/`

**Request Body:**
```json
{
    "course_id": "uuid",
    "classroom_id": "uuid"
    // price_amount không cần truyền, sẽ tự động lấy từ classroom.effective_price
}
```

**Response:**
```json
{
    "id": "uuid",
    "invoice_code": "ABC123XYZ",
    "course": {...},
    "classroom": {
        "id": "uuid",
        "title": "Group Class (30 students)",
        "price": "80.00",
        "effective_price": "80.00",
        "is_one_on_one": false
    },
    "price_amount": "80.00",  // từ classroom.effective_price
    "price_currency": "VND",
    "status": "pending",
    ...
}
```

### Logic trong OrderCreateSerializer

```python
def create(self, validated_data):
    course = validated_data.pop("course")
    classroom = validated_data.pop("classroom")
    
    price_amount = validated_data.get("price_amount")
    if price_amount in (None, 0, 0.0):
        # Get price from classroom instead of course
        validated_data["price_amount"] = classroom.effective_price
    
    order = Order.objects.create(
        student=student,
        course=course,
        classroom=classroom,
        **validated_data,
    )
    return order
```

**Lưu ý quan trọng:**
- Order lưu `price_amount` tại thời điểm checkout (snapshot)
- Nếu classroom price thay đổi sau khi order được tạo, order vẫn giữ giá cũ
- Student có thể override `price_amount` nếu cần (nhưng thường không cần)

## Migration

### Data Migration

Migration `0008_add_classroom_pricing` tự động copy giá từ Course sang Classroom cho dữ liệu hiện có:

```python
def migrate_course_price_to_classroom(apps, schema_editor):
    """Copy price from course to classroom for existing classrooms."""
    Classroom = apps.get_model('classrooms', 'Classroom')
    
    for classroom in Classroom.objects.select_related('course').all():
        course = classroom.course
        classroom.price = course.price
        classroom.discount_price = course.discount_price
        classroom.is_free = course.is_free
        classroom.save(update_fields=['price', 'discount_price', 'is_free'])
```

**Sau migration:**
- Tất cả classrooms hiện có sẽ có giá giống với course của chúng
- Teacher có thể chỉnh sửa giá cho từng classroom sau đó

## Use Cases

### Use Case 1: Group Class vs 1-on-1 Pricing

**Scenario:** Course có base price 100.00, nhưng muốn:
- Group class (30 students): 80.00
- 1-on-1 class: 200.00

**Implementation:**
```bash
# Create group classroom
POST /api/v1/classrooms/
{
    "course_id": "...",
    "title": "Group Class",
    "student_count": 30,
    "price": "80.00"
}

# Create 1-on-1 classroom
POST /api/v1/classrooms/
{
    "course_id": "...",
    "title": "1-on-1 Class",
    "student_count": 1,
    "price": "200.00"
}
```

### Use Case 2: Discount Campaign

**Scenario:** Giảm giá 25% cho một classroom cụ thể

**Implementation:**
```bash
POST /api/v1/classrooms/
{
    "course_id": "...",
    "title": "Summer Sale Class",
    "student_count": 30,
    "price": "100.00",
    "discount_price": "75.00"  # 25% discount
}
```

### Use Case 3: Free Trial

**Scenario:** Cung cấp free trial classroom

**Implementation:**
```bash
POST /api/v1/classrooms/
{
    "course_id": "...",
    "title": "Free Trial Class",
    "student_count": 30,
    "price": "100.00",
    "is_free": true  # effective_price will be 0.00
}
```

## Admin Interface

### Classroom Admin

Django Admin hiển thị pricing fields trong:

1. **List View:**
   - `price`, `discount_price`, `is_free`, `effective_price`
   - Filter theo `is_free`

2. **Detail View:**
   - Fieldset "Pricing" với:
     - `price`
     - `discount_price`
     - `is_free`
     - `effective_price` (read-only)
     - `is_one_on_one` (read-only)

## Testing

### Unit Tests

File: `src/orders/tests/test_classroom_pricing.py`

**Test Cases:**
1. ✅ Classroom có giá riêng độc lập với course
2. ✅ 1-on-1 classroom có giá cao hơn group class
3. ✅ Discount price hoạt động đúng
4. ✅ Free classroom hoạt động đúng
5. ✅ Order sử dụng classroom price thay vì course price
6. ✅ API endpoints hiển thị pricing đúng
7. ✅ Validation hoạt động đúng

**Chạy tests:**
```bash
docker compose exec web python manage.py test src.orders.tests.test_classroom_pricing
```

### End-to-End Test Script

File: `test_classroom_pricing_flow.sh`

**Test Flow:**
1. Tạo teacher và course
2. Tạo group classroom (30 students, giá 80.00)
3. Tạo 1-on-1 classroom (1 student, giá 200.00)
4. Tạo order và verify giá từ classroom
5. Test discount price
6. Test free classroom

**Chạy script:**
```bash
./test_classroom_pricing_flow.sh
```

## Best Practices

### 1. Pricing Strategy

- **Group Classes:** Giá thấp hơn course base price (ví dụ: 80% của course price)
- **1-on-1 Classes:** Giá cao hơn course base price (ví dụ: 200% của course price)
- **Small Groups (5-10 students):** Giá trung bình (ví dụ: 120% của course price)

### 2. Discount Management

- Sử dụng `discount_price` cho các campaign ngắn hạn
- Luôn đảm bảo `discount_price < price`
- Có thể set `discount_price = null` để tắt discount

### 3. Free Classes

- Sử dụng `is_free = true` cho trial classes
- Không cần set `price = 0`, chỉ cần set `is_free = true`
- `effective_price` sẽ tự động là 0.00

### 4. Order Price Snapshot

- Order lưu `price_amount` tại thời điểm checkout
- Nếu classroom price thay đổi, orders cũ vẫn giữ giá cũ
- Điều này đảm bảo tính nhất quán và audit trail

## API Examples

### Example 1: Create Group Classroom

```bash
curl -X POST http://localhost:8000/api/v1/classrooms/ \
  -H "Authorization: Bearer {teacher_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-uuid",
    "title": "Evening Group Class",
    "student_count": 30,
    "price": "80.00"
  }'
```

### Example 2: Create 1-on-1 Classroom

```bash
curl -X POST http://localhost:8000/api/v1/classrooms/ \
  -H "Authorization: Bearer {teacher_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-uuid",
    "title": "Private 1-on-1 Class",
    "student_count": 1,
    "price": "200.00"
  }'
```

### Example 3: Create Order (uses classroom price)

```bash
curl -X POST http://localhost:8000/api/v1/orders/ \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "course-uuid",
    "classroom_id": "classroom-uuid"
  }'
```

**Response sẽ có:**
```json
{
    "price_amount": "80.00",  // từ classroom.effective_price
    "classroom": {
        "effective_price": "80.00",
        "is_one_on_one": false
    }
}
```

## Troubleshooting

### Issue 1: Order vẫn dùng course price

**Nguyên nhân:** Migration chưa chạy hoặc code chưa được update.

**Giải pháp:**
1. Chạy migration: `docker compose exec web python manage.py migrate classrooms`
2. Verify code trong `OrderCreateSerializer` sử dụng `classroom.effective_price`

### Issue 2: Validation error khi tạo classroom

**Lỗi:** `discount_price must be less than regular price`

**Nguyên nhân:** `discount_price >= price`

**Giải pháp:** Đảm bảo `discount_price < price`

### Issue 3: effective_price không đúng

**Kiểm tra:**
1. `is_free = True` → `effective_price = 0`
2. `discount_price` được set → `effective_price = discount_price`
3. Ngược lại → `effective_price = price`

## Summary

- ✅ Giá nằm ở **Classroom**, không còn ở Course
- ✅ Mỗi classroom có thể có pricing riêng
- ✅ 1-on-1 classes có thể có giá cao hơn group classes
- ✅ Hỗ trợ discount pricing và free classrooms
- ✅ Order tự động sử dụng `classroom.effective_price`
- ✅ Migration tự động copy giá từ course sang classroom
- ✅ Full test coverage và documentation