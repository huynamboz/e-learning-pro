Dưới đây là phiên bản **đã xoá hoàn toàn mọi phần liên quan đến “teacher”**, chỉ giữ lại phần **API và logic dành cho student** 👇

---

# Progress Tracking API Documentation (Student Only)

## Overview

The Progress Tracking system allows students to track their learning progress through courses.

## Features

* **Student Progress Tracking**: Students can mark lessons as complete/incomplete
* **Course Progress Calculation**: Automatic calculation based on completed lessons
* **Real-time Updates**: Progress percentage updates automatically

---

## API Endpoints

### 1. Mark Lesson Complete/Incomplete

**Endpoint**: `PATCH /api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/`

**Authentication**: Required (Student must be enrolled)

**Description**: Mark a lesson as completed or incomplete by updating ONLY the `is_completed` field. This is for student progress tracking.

#### Request Body

```json
{
  "is_completed": true  // or false to mark as incomplete
}
```

#### Response (Success - 200 OK)

```json
{
  "progress_percentage": 16.67,
  "is_completed": false,
  "completed_lessons_count": 1,
  "total_lessons_count": 6
}
```

#### Response (Error - 403 Forbidden)

```json
{
  "detail": "You must be enrolled in this course to mark lessons as complete."
}
```

#### Example Request

```bash
curl -X PATCH \
  http://localhost:8000/api/v1/courses/057f65b8-064d-4e5c-840e-f4e9aa847e51/chapters/f9f3374e-20db-461b-b825-4d687b1e0dc5/lessons/e2234340-a89d-4655-bafe-275cd30d22ab/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'
```

---

### 2. Get Student Progress

**Endpoint**: `GET /api/v1/courses/{course_id}/progress/`

**Authentication**: Required (Student must be enrolled)

**Description**: Get the current user's progress in a specific course.

#### Response (Success - 200 OK)

```json
{
  "course_id": "057f65b8-064d-4e5c-840e-f4e9aa847e51",
  "course_title": "Git & GitHub Essentials for Developers",
  "progress_percentage": 33.33,
  "is_completed": false,
  "completed_lessons_count": 2,
  "total_lessons_count": 6,
  "completed_lessons": [
    {
      "id": "e2234340-a89d-4655-bafe-275cd30d22ab",
      "title": "Introduction to Git",
      "chapter_title": "Getting Started",
      "chapter_order": 1,
      "lesson_order": 1
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Git Installation",
      "chapter_title": "Getting Started",
      "chapter_order": 1,
      "lesson_order": 2
    }
  ],
  "created_at": "2025-10-12T14:34:27.282622Z",
  "updated_at": "2025-10-12T14:35:19.318584Z"
}
```

#### Response (Error - 403 Forbidden)

```json
{
  "detail": "You are not enrolled in this course."
}
```

#### Example Request

```bash
curl -X GET \
  http://localhost:8000/api/v1/courses/057f65b8-064d-4e5c-840e-f4e9aa847e51/progress/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Data Models

### CourseProgress

| Field                 | Type       | Description                |
| --------------------- | ---------- | -------------------------- |
| `id`                  | UUID       | Primary key                |
| `user`                | ForeignKey | Student user               |
| `course`              | ForeignKey | Related course             |
| `completed_lessons`   | ManyToMany | Lessons marked as complete |
| `progress_percentage` | Decimal    | Progress (0.00–100.00)     |
| `is_completed`        | Boolean    | Course completion status   |
| `created_at`          | DateTime   | Record creation time       |
| `updated_at`          | DateTime   | Last update time           |

**Constraints**:

* `unique_together`: `['user', 'course']`
* `progress_percentage`: Min 0.00, Max 100.00

---

## Progress Calculation

```
progress_percentage = (completed_lessons_count / total_lessons_count) * 100
```

### Rules

1. Only counts published lessons (`is_published=True`)
2. Automatically recalculates when marking complete/incomplete
3. Marks `is_completed = True` when progress = 100%
4. Stored with 2 decimal places (e.g., 33.33%)

---

## Business Logic

### Mark Lesson Complete

1. **Validation**:

   * Must be enrolled in course
2. **Process**:

   * Add lesson to `completed_lessons`
   * Recalculate progress
   * Update `is_completed` if 100%
3. **Response**: Updated progress metrics

### Mark Lesson Incomplete

1. **Validation**: Same as above
2. **Process**:

   * Remove lesson from `completed_lessons`
   * Recalculate progress
3. **Response**: Updated metrics

### Get Progress

1. **Validation**: Must be enrolled
2. **Process**:

   * Fetch or create progress record
   * Include completed lessons
3. **Response**: Progress data

---

## Frontend Integration

```javascript
// Get student progress
async function fetchProgress(courseId) {
  const res = await fetch(`/api/v1/courses/${courseId}/progress/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return await res.json();
}

// Mark lesson complete
async function markLessonComplete(courseId, chapterId, lessonId) {
  const res = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_completed: true }),
    }
  );
  return await res.json();
}
```

---

## UI/UX Recommendations (Student View)

1. **Progress Bar**: Show overall progress
2. **Lesson Checkboxes**: Allow toggling complete/incomplete
3. **Completed Lessons List**: Display visually
4. **Completion Badge**: When course = 100%
5. **Last Updated**: Show timestamp

---

## Performance Considerations

### Database Indexes

```python
indexes = [
    models.Index(fields=['user', 'course']),
    models.Index(fields=['progress_percentage']),
    models.Index(fields=['is_completed']),
]
```

### Optimization

* Use `select_related` and `prefetch_related`
* Cache frequent progress queries
* Background updates for heavy workloads

---

## Error Handling

| Status | Error        | Solution              |
| ------ | ------------ | --------------------- |
| 401    | Unauthorized | Invalid/missing token |
| 403    | Forbidden    | Not enrolled          |
| 404    | Not Found    | Invalid ID            |
| 500    | Server Error | Check logs            |

---

## Testing

1. **Mark Lesson Complete** ✅
2. **Mark Lesson Incomplete** ✅
3. **Get Progress** ✅

Example:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"testpass123"}' | jq -r '.access')

curl -X PATCH \
  http://localhost:8000/api/v1/courses/COURSE_ID/chapters/CHAPTER_ID/lessons/LESSON_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'
```

---

## Migration

```bash
python manage.py makemigrations courses
python manage.py migrate courses
```

---

## Future Enhancements

* **Lesson Time Tracking**
* **Progress Streaks**
* **Certificates**
* **Notifications**
* **Learning Path Recommendations**

---

👉 File này giờ **chỉ còn phần student**, mọi endpoint và logic của teacher (analytics, student list, export, chart, etc.) đều đã được **xoá sạch**.
Bạn có muốn tôi format lại thành **Markdown sạch chuẩn để commit vào docs/** (ví dụ `docs/student-progress-api.md`) không?
