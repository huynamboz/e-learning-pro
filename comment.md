# Lesson Comments & Reply System

## Overview

Hệ thống bình luận cho lesson với hỗ trợ reply 1 cấp (root + reply). Comments tự động ghi nhận role (student/teacher) và chỉ cho phép enrolled students hoặc course teachers tương tác.

---

## Model Structure

### LessonComment

**Purpose**: Store comments on lessons with 1-level reply support.

**Fields:**
```python
id = UUIDField (primary key)
lesson = ForeignKey(Lesson)
author = ForeignKey(User)
role = CharField(choices=['student', 'teacher'])  # Auto-set based on user
content = TextField
parent = ForeignKey('self', null=True)  # Null for root comments
root = ForeignKey('self', null=True)  # Reference to root comment
depth = PositiveSmallIntegerField  # 0 for root, 1 for replies
created_at = DateTimeField
updated_at = DateTimeField
```

**Structure:**
```
Root Comment (depth=0, parent=None)
 ├─ Reply 1 (depth=1, parent=root, root=root)
 ├─ Reply 2 (depth=1, parent=root, root=root)
 └─ Reply 3 (depth=1, parent=root, root=root)

Maximum depth = 1 (no nested replies)
```

**Constraints:**
- `depth` must be 0 or 1
- Reply (`depth=1`) must have `parent` with `depth=0`
- Cannot reply to a reply

**Indexes:**
- `(lesson, created_at)` - List comments by lesson
- `(root, created_at)` - Query replies efficiently
- `(author, created_at)` - User's comment history

---

## API Endpoints

### Base URL Pattern
```
/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/
```

### 1. List Comments (with Replies)

**Endpoint:**
```http
GET /courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/
```

**Permission:** 
- Enrolled students
- Course teacher
- Admin/staff

**Response:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "comment-uuid",
      "lesson": "lesson-uuid",
      "author": 6,
      "author_name": "cuong nguyen",
      "author_email": "cuong@gmail.com",
      "role": "teacher",
      "content": "Great lesson! Well explained.",
      "depth": 0,
      "parent_id": null,
      "replies": [
        {
          "id": "reply-uuid",
          "author": 28,
          "author_name": "Test Student",
          "author_email": "student@example.com",
          "role": "student",
          "content": "Thank you professor!",
          "depth": 1,
          "created_at": "2025-10-13T06:26:11.295806Z",
          "updated_at": "2025-10-13T06:26:11.295880Z"
        }
      ],
      "created_at": "2025-10-13T06:23:37.198020Z",
      "updated_at": "2025-10-13T06:23:37.198030Z"
    }
  ]
}
```

**Features:**
- ✅ Paginated (root comments only)
- ✅ Replies nested in `replies` array
- ✅ Ordered by `created_at` (oldest first)
- ✅ Author info included
- ✅ Role badge (student/teacher)

---

### 2. Create Root Comment

**Endpoint:**
```http
POST /courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/
```

**Permission:**
- Enrolled students
- Course teacher
- Admin/staff

**Request Body:**
```json
{
  "content": "This lesson is very helpful!"
}
```

**Response: 201 Created**
```json
{
  "id": "new-comment-uuid",
  "lesson": "lesson-uuid",
  "author": 28,
  "author_name": "Test Student",
  "author_email": "student@example.com",
  "role": "student",
  "content": "This lesson is very helpful!",
  "depth": 0,
  "parent_id": null,
  "replies": [],
  "created_at": "2025-10-13T06:30:00.000000Z",
  "updated_at": "2025-10-13T06:30:00.000000Z"
}
```

---

### 3. Create Reply

**Endpoint:**
```http
POST /courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/{comment_id}/reply/
```

**Permission:**
- Enrolled students
- Course teacher
- Admin/staff

**Request Body:**
```json
{
  "content": "Thank you for the explanation!"
}
```

**Response: 201 Created**
```json
{
  "id": "reply-uuid",
  "lesson": "lesson-uuid",
  "author": 6,
  "author_name": "cuong nguyen",
  "author_email": "cuong@gmail.com",
  "role": "teacher",
  "content": "Thank you for the explanation!",
  "depth": 1,
  "parent_id": "root-comment-uuid",
  "replies": [],
  "created_at": "2025-10-13T06:31:00.000000Z",
  "updated_at": "2025-10-13T06:31:00.000000Z"
}
```

---

### 4. Delete Comment

**Endpoint:**
```http
DELETE /courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/{comment_id}/
```

**Permission:**
- Comment author (own comment)
- Course teacher (any comment on their course)
- Admin/staff (any comment)

**Response: 204 No Content**
```json
{
  "message": "Comment deleted successfully"
}
```

**Note:** Deleting a root comment will cascade delete all its replies.

---

## Business Rules

### 1. Comment Creation

| User Type | Can Comment If... |
|-----------|------------------|
| **Student** | Enrolled in course (active enrollment) |
| **Teacher** | Owns the course |
| **Admin/Staff** | Always allowed |

### 2. Reply Creation

- ✅ Can only reply to root comments (`depth=0`)
- ❌ Cannot reply to replies (`depth=1`)
- ✅ Reply inherits lesson from parent
- ✅ Same permission rules as comment creation

### 3. Comment Deletion

| User Type | Can Delete |
|-----------|-----------|
| **Author** | Own comments only |
| **Course Teacher** | Any comment on their lessons |
| **Admin/Staff** | Any comment |

### 4. Role Assignment

Role is **auto-set** based on user type:

```python
if user.is_teacher or user.is_staff:
    role = 'teacher'
else:
    role = 'student'
```

---

## Validation Rules

### 1. Depth Constraint

```python
# Root comment
parent = None
depth = 0
root = None

# Reply
parent = <root_comment>
depth = 1
root = <root_comment>

# ❌ NOT ALLOWED
parent = <reply>  # Cannot reply to reply!
```

**Error Response:**
```json
{
  "parent": ["Cannot reply to a reply. Only root comments can have replies."]
}
```

### 2. Enrollment Check (Students)

Students must be enrolled in the course to comment:

```python
is_enrolled = Enrollment.objects.filter(
    user=user,
    classroom__course=lesson.chapter.course,
    is_active=True
).exists()
```

**Error Response: 400 Bad Request**
```json
{
  "non_field_errors": ["You must be enrolled in this course to comment on lessons."]
}
```

### 3. Teacher Ownership Check

Teachers can only comment on their own course lessons:

```python
if lesson.chapter.course.teacher != user:
    raise ValidationError("You can only comment on lessons in your own courses.")
```

---

## Usage Examples

### Example 1: Student Comments and Teacher Replies

```bash
# 1. Student creates root comment
curl -X POST "http://localhost:8000/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I don'\''t understand the concept at 5:30. Can you explain?"
  }'

# Response
{
  "id": "abc123",
  "role": "student",
  "content": "I don't understand...",
  "depth": 0,
  "replies": []
}

# 2. Teacher replies
curl -X POST "http://localhost:8000/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/abc123/reply/" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Good question! Let me clarify: the concept means..."
  }'

# Response
{
  "id": "def456",
  "role": "teacher",
  "content": "Good question! Let me clarify...",
  "depth": 1,
  "parent_id": "abc123"
}

# 3. List comments
curl -X GET "http://localhost:8000/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Response
{
  "count": 1,
  "results": [
    {
      "id": "abc123",
      "author_name": "John Doe",
      "role": "student",
      "content": "I don't understand...",
      "depth": 0,
      "replies": [
        {
          "id": "def456",
          "author_name": "Prof. Smith",
          "role": "teacher",
          "content": "Good question! Let me clarify...",
          "depth": 1
        }
      ]
    }
  ]
}
```

---

### Example 2: Try to Reply to a Reply (Fails)

```bash
# Try to create nested reply
curl -X POST "http://localhost:8000/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/def456/reply/" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This should fail"
  }'

# Response: 400 Bad Request
{
  "error": "Cannot reply to a reply. Only root comments can have replies."
}
```

---

### Example 3: Delete Comment

```bash
# Author deletes own comment
curl -X DELETE "http://localhost:8000/api/v1/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/comments/abc123/" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Response: 204 No Content
{
  "message": "Comment deleted successfully"
}
```

**Note:** Deleting root comment `abc123` will also delete its reply `def456` (cascade).

---

## Response Fields

### Root Comment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Comment ID |
| `lesson` | UUID | Lesson ID |
| `author` | int | User ID |
| `author_name` | string | Full name |
| `author_email` | string | Email |
| `role` | string | `student` or `teacher` |
| `content` | string | Comment text |
| `depth` | int | Always `0` for root |
| `parent_id` | UUID/null | Always `null` for root |
| `replies` | array | Array of reply objects |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Reply Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Reply ID |
| `author` | int | User ID |
| `author_name` | string | Full name |
| `author_email` | string | Email |
| `role` | string | `student` or `teacher` |
| `content` | string | Reply text |
| `depth` | int | Always `1` for replies |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Error Responses

### 400 Bad Request

**Not enrolled:**
```json
{
  "non_field_errors": ["You must be enrolled in this course to comment on lessons."]
}
```

**Reply to reply:**
```json
{
  "error": "Cannot reply to a reply. Only root comments can have replies."
}
```

**Parent not found:**
```json
{
  "parent_id": ["Parent comment not found."]
}
```

### 403 Forbidden

**Teacher commenting on another teacher's course:**
```json
{
  "non_field_errors": ["You can only comment on lessons in your own courses."]
}
```

**Delete permission denied:**
```json
{
  "error": "You can only delete your own comments or comments on your courses (teachers)."
}
```

---

## Implementation Details

### Auto-set Fields

**Role:**
```python
if author.is_teacher or author.is_staff:
    role = 'teacher'
else:
    role = 'student'
```

**Depth & Root:**
```python
if parent:
    depth = 1
    root = parent  # Point to root comment
else:
    depth = 0
    root = None
```

### Query Optimization

**List comments with prefetch:**
```python
LessonComment.objects.filter(
    lesson_id=lesson_id,
    depth=0  # Only root comments
).select_related('author', 'lesson').prefetch_related(
    Prefetch('replies', queryset=LessonComment.objects.select_related('author').order_by('created_at'))
).order_by('created_at')
```

**Result:** 2 queries total (1 for roots, 1 for all replies)

---

## Frontend Integration

### React/Next.js Example

```typescript
interface Comment {
  id: string;
  author: number;
  author_name: string;
  author_email: string;
  role: 'student' | 'teacher';
  content: string;
  depth: number;
  parent_id: string | null;
  replies: Reply[];
  created_at: string;
  updated_at: string;
}

interface Reply {
  id: string;
  author: number;
  author_name: string;
  role: 'student' | 'teacher';
  content: string;
  depth: number;
  created_at: string;
}

// Fetch comments
const fetchComments = async (courseId: string, chapterId: string, lessonId: string) => {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};

// Create root comment
const createComment = async (courseId: string, chapterId: string, lessonId: string, content: string) => {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    }
  );
  return response.json();
};

// Create reply
const createReply = async (
  courseId: string,
  chapterId: string,
  lessonId: string,
  commentId: string,
  content: string
) => {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${commentId}/reply/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    }
  );
  return response.json();
};

// Delete comment
const deleteComment = async (courseId: string, chapterId: string, lessonId: string, commentId: string) => {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${commentId}/`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.status === 204;
};
```

### Display Component

```tsx
const CommentThread = ({ comment }: { comment: Comment }) => {
  return (
    <div className="comment-thread">
      {/* Root comment */}
      <div className="comment root">
        <div className="comment-header">
          <span className={`badge ${comment.role}`}>{comment.role}</span>
          <strong>{comment.author_name}</strong>
          <span className="time">{formatTime(comment.created_at)}</span>
        </div>
        <p className="content">{comment.content}</p>
        
        {/* Reply button */}
        <button onClick={() => showReplyForm(comment.id)}>Reply</button>
      </div>
      
      {/* Replies */}
      {comment.replies.map(reply => (
        <div key={reply.id} className="comment reply">
          <div className="comment-header">
            <span className={`badge ${reply.role}`}>{reply.role}</span>
            <strong>{reply.author_name}</strong>
            <span className="time">{formatTime(reply.created_at)}</span>
          </div>
          <p className="content">{reply.content}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## Testing

### Manual Testing

```bash
# Setup
COURSE_ID="057f65b8-064d-4e5c-840e-f4e9aa847e51"
CHAPTER_ID="f9f3374e-20db-461b-b825-4d687b1e0dc5"
LESSON_ID="e2234340-a89d-4655-bafe-275cd30d22ab"

# 1. Teacher creates root comment
curl -X POST "http://localhost:8000/api/v1/courses/$COURSE_ID/chapters/$CHAPTER_ID/lessons/$LESSON_ID/comments/" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great lesson!"}'

# 2. Student replies
curl -X POST "http://localhost:8000/api/v1/courses/$COURSE_ID/chapters/$CHAPTER_ID/lessons/$LESSON_ID/comments/{root_id}/reply/" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Thank you!"}'

# 3. List comments
curl "http://localhost:8000/api/v1/courses/$COURSE_ID/chapters/$CHAPTER_ID/lessons/$LESSON_ID/comments/" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# 4. Try reply to reply (should fail)
curl -X POST "http://localhost:8000/api/v1/courses/$COURSE_ID/chapters/$CHAPTER_ID/lessons/$LESSON_ID/comments/{reply_id}/reply/" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"This should fail"}'

# Response: 400 Bad Request
# {"error": "Cannot reply to a reply..."}
```

### Test Results

| Test Case | Status |
|-----------|--------|
| Teacher creates root comment | ✅ PASS |
| Student creates reply | ✅ PASS |
| List comments with nested replies | ✅ PASS |
| Non-enrolled student comments | ✅ BLOCKED (403) |
| Reply to reply | ✅ BLOCKED (400) |
| Author deletes own comment | ✅ PASS |
| Teacher deletes student comment | ✅ PASS |
| Student deletes teacher comment | ✅ BLOCKED (403) |

---

## Database Schema

```sql
CREATE TABLE courses_lesson_comment (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES courses_lesson(id),
    author_id BIGINT NOT NULL REFERENCES accounts_user(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES courses_lesson_comment(id) ON DELETE CASCADE,
    root_id UUID REFERENCES courses_lesson_comment(id) ON DELETE CASCADE,
    depth SMALLINT NOT NULL CHECK (depth >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT lesson_comment_depth_valid CHECK (depth IN (0, 1))
);

-- Indexes
CREATE INDEX courses_les_lesson__8f8b79_idx ON courses_lesson_comment (lesson_id, created_at);
CREATE INDEX courses_les_root_id_c8293d_idx ON courses_lesson_comment (root_id, created_at);
CREATE INDEX courses_les_author__b08c1b_idx ON courses_lesson_comment (author_id, created_at);
```

---

## Files Modified

### Models
1. **`src/courses/models.py`**
   - Added `LessonComment` model with role, depth, parent, root fields
   - Validation in `clean()` for depth logic
   - Auto-set role in `save()`

### Serializers
2. **`src/courses/serializers.py`**
   - `LessonCommentSerializer` - Read with nested replies
   - `LessonCommentReplySerializer` - Reply format
   - `LessonCommentCreateSerializer` - Write with validation

### Views
3. **`src/courses/views.py`**
   - `LessonCommentViewSet` with GET/POST/DELETE
   - `reply()` action for creating replies
   - Permission checks in queryset and destroy

### URLs
4. **`src/courses/urls.py`**
   - Nested route: `/lessons/{id}/comments/`
   - Auto-registered reply action

### Migrations
5. **`src/courses/migrations/0006_lessoncomment_and_more.py`**
   - Create table with indexes and constraints

---

## Performance

### Query Count

| Operation | Queries | Notes |
|-----------|---------|-------|
| List comments | 2 | 1 for roots + 1 prefetch for replies |
| Create comment | 3 | Validation + enrollment check + insert |
| Create reply | 3 | Get parent + validation + insert |
| Delete comment | 2 | Get + delete (cascade) |

### Optimization Tips

1. **Prefetch replies** to avoid N+1 queries
2. **Index on (lesson, created_at)** for fast listing
3. **Cache enrollment status** if needed
4. **Paginate root comments**, inline all replies

---

## Future Enhancements (Optional)

- [ ] Soft delete (mark as deleted instead of actual delete)
- [ ] Edit comment (with edit history)
- [ ] Like/upvote system
- [ ] Mention users (@username)
- [ ] Pin important comments
- [ ] Report inappropriate comments
- [ ] Email notifications on replies

---

## Changelog

### Version 1.0 (2025-10-13)
- ✅ Initial implementation
- ✅ Root + 1-level reply support
- ✅ Role auto-assignment
- ✅ Permission-based access
- ✅ Cascade deletion
- ✅ Query optimization with prefetch

---

## Summary

✅ **Fully functional lesson comment system:**
- Root comments + 1-level replies
- Role-based UI (student/teacher badges)
- Permission checks (enrollment/ownership)
- Efficient queries (prefetch replies)
- Comprehensive validation
- Easy frontend integration

**Ready for production!** 🎉
