# Test Resource Price Plans Feature
## Tổng quan
Test suite toàn diện cho tính năng Resource Price Plans - pricing theo thời hạn (tháng) cho `course_type=resource`.
**ResourcePricePlan là gì?**
- Gói giá cho khóa học dạng resource, gắn với một course.
- Trường chính: `duration_months`, `price_amount`, `price_currency`, `is_active`, `is_default`, `starts_at`, `ends_at`, `created_by`.
- Ràng buộc: mỗi course chỉ có 1 plan active cho mỗi `duration_months` (unique khi `is_active=True`).
- Plan được dùng để chốt giá khi tạo order: client gửi `price_plan_id`, backend lấy giá/tiền tệ/duration từ plan, không cho override.
## Test Scripts
### 1. Shell Script Test (API Integration Test)
```bash
bash test_resource_price_plans.sh
```
**Test Cases:**
- ✅ Setup users (teacher, student)
- ✅ Create resource course
- ✅ Create price plans (2 plans với duration khác nhau)
- ✅ GET price plans API (public view)
- ✅ Course detail không trả price cho resource
- ✅ Course detail trả price_plans và has_pricing
- ✅ Create order với price_plan_id
- ✅ Order price matches plan price
- ✅ Order metadata contains price_plan_id
- ✅ Order without price_plan_id fails
- ✅ Order with invalid price_plan_id fails
- ✅ Order with deactivated plan fails
- ✅ Course-type course không bị ảnh hưởng (vẫn có price)
- ✅ Order complete tạo CourseAccess với đúng duration
### 2. Python Script Test (Detailed Unit Tests)
```bash
python test_resource_price_plans_detailed.py
```
**Test Cases:**
- ✅ Unique constraint: (course, duration_months, is_active=True)
- ✅ is_available property với date ranges
- ✅ OrderCreateSerializer validation
- ✅ Order price/currency/duration từ plan
- ✅ Course serializer ẩn price cho resource
- ✅ Order.mark_complete sử dụng duration từ plan
- ✅ Soft delete plan với orders
## Manual Test Checklist
### 1. Model Tests
- [ ] Tạo ResourcePricePlan cho resource course
- [ ] Không thể tạo ResourcePricePlan cho course-type course
- [ ] Unique constraint: không thể có 2 active plans cùng duration cho 1 course
- [ ] Có thể có nhiều inactive plans cùng duration
- [ ] is_available property hoạt động đúng với starts_at/ends_at
### 2. API Tests
#### Price Plans API
- [ ] `POST /api/v1/courses/{course_id}/price-plans/` - Tạo plan (teacher/admin)
- [ ] `GET /api/v1/courses/{course_id}/price-plans/` - List plans (public chỉ thấy active)
- [ ] `PATCH /api/v1/courses/{course_id}/price-plans/{plan_id}/` - Update plan
- [ ] `DELETE /api/v1/courses/{course_id}/price-plans/{plan_id}/` - Soft delete
#### Course API
- [ ] `GET /api/v1/courses/{course_id}/` - Resource course không có price field
- [ ] `GET /api/v1/courses/{course_id}/` - Resource course có price_plans array
- [ ] `GET /api/v1/courses/{course_id}/` - Resource course có has_pricing flag
- [ ] `GET /api/v1/courses/{course_id}/` - Course-type course vẫn có price field
### 3. Order Tests
#### Order Creation
- [ ] Order cho resource yêu cầu price_plan_id (bắt buộc)
- [ ] Order cho resource không yêu cầu classroom_id
- [ ] Order price = plan price (không thể override)
- [ ] Order currency = plan currency
- [ ] Order access_duration_months = plan duration_months
- [ ] Order metadata chứa price_plan_id
#### Order Validation
- [ ] Order không có price_plan_id → 400 error
- [ ] Order với price_plan_id không tồn tại → 400 error
- [ ] Order với price_plan_id không thuộc course → 400 error
- [ ] Order với price_plan không active → 400 error
- [ ] Order với price_plan hết hạn (ends_at) → 400 error
- [ ] Order với price_plan chưa bắt đầu (starts_at) → 400 error
#### Order Complete
- [ ] Order complete tạo CourseAccess
- [ ] CourseAccess expires_at = purchased_at + duration_months
- [ ] CourseAccess is_active = True
- [ ] Không tạo Enrollment cho resource
- [ ] Không tạo generated account cho resource
### 4. Edge Cases
- [ ] Plan với starts_at trong tương lai → không available
- [ ] Plan với ends_at trong quá khứ → không available
- [ ] Plan với date range hợp lệ → available
- [ ] Soft delete plan có orders → set is_active=False
- [ ] Hard delete plan không có orders → xóa hoàn toàn
- [ ] Course-type course không bị ảnh hưởng
## Expected Results
### Resource Course Detail Response
```json
{
  "id": "...",
  "title": "...",
  "course_type": "resource",
  // NO price, discount_price, effective_price, has_discount
  "price_plans": [
    {
      "id": "...",
      "duration_months": 1,
      "price_amount": "50000.00",
      "price_currency": "VND",
      "is_available": true,
      "is_default": false
    },
    {
      "id": "...",
      "duration_months": 3,
      "price_amount": "120000.00",
      "price_currency": "VND",
      "is_available": true,
      "is_default": true
    }
  ],
  "has_pricing": true
}
```
### Order Create Request (Resource)
```json
{
  "course_id": "...",
  "price_plan_id": "...",  // REQUIRED
  "notes": "..."
  // NO classroom_id, price_amount, price_currency, access_duration_months
}
```
### Order Response (Resource)
```json
{
  "id": "...",
  "course_id": "...",
  "price_amount": "50000.00",  // From plan
  "price_currency": "VND",      // From plan
  "access_duration_months": 1,  // From plan
  "metadata": {
    "price_plan_id": "..."      // Reference to plan
  }
}
```
## Notes
1. **Migration**: Cần chạy migration trước khi test:
   ```bash
   python manage.py makemigrations courses
   python manage.py migrate
   ```
2. **Cleanup**: Scripts tự động cleanup test data, nhưng có thể cần manual cleanup nếu test bị interrupt.
3. **Dependencies**: Scripts cần Django environment và database connection.
4. **Permissions**: Teacher/Admin có thể tạo/update/delete plans. Student chỉ có thể xem active plans.