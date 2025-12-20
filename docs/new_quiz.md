# New Quiz Management API Documentation

## Overview

The New Quiz Management system provides comprehensive quiz functionality **independent of courses/lessons**. Quizzes are organized by **Level** (A1, A2, B1, etc.) instead of course structure.

**Key Differences from Regular Quiz:**
- ✅ Organized by **Level** (not category/lesson/chapter)
- ✅ **Independent** of course structure
- ✅ All quiz features: MCQ, text input, essay questions
- ✅ Auto-grading + manual grading
- ✅ Retake limit, time limit, attempts tracking
- ✅ Comments, leaderboard, dashboard

## Table of Contents
1. [Models](#models)
2. [Level APIs](#level-apis)
3. [Teacher APIs](#teacher-apis)
4. [Student APIs](#student-apis)
5. [Permissions](#permissions)
6. [Examples](#examples)

---

## Models

### Level
Level model for organizing quizzes (A1, A2, B1, etc.). **Independent of course levels.**

**Fields:**
- `id`: UUID (auto-generated)
- `code`: String (max 20 chars, unique) - e.g., "A1", "A2", "B1"
- `name`: String (max 100 chars) - e.g., "Beginner A1"
- `order`: Positive Integer - Display order (lower numbers appear first)
- `description`: Text (optional)
- `is_active`: Boolean (default: True) - Whether level is visible
- `created_at`, `updated_at`: DateTime

### NewQuiz
Main quiz model **independent of courses/lessons**, organized by Level.

**Fields:**
- `id`: UUID (auto-generated)
- `title`: String (max 200 chars)
- `description`: Text
- `level`: FK to Level (**required, NOT NULL**)
- `time_type`: Choice (`limit` | `none`)
- `time_value`: Positive Integer (nullable, required if time_type=limit)
- `time_unit`: Choice (`minute` | `second`)
- `is_published`: Boolean (default: False) - controls student visibility
- `retake_limit`: Positive Integer (default: 1) - Maximum attempts allowed
- `created_by`: FK to User (teacher who created it)
- `created_at`, `updated_at`: DateTime

**Computed Properties:**
- `total_questions`: Number of questions in quiz
- `time_limit_in_seconds`: Time limit converted to seconds

### NewQuizQuestion
Individual questions within a quiz. Same structure as regular QuizQuestion.

**Fields:**
- `id`: UUID
- `quiz`: FK to NewQuiz
- `question_type`: Choice (`multiple_choice` | `text_input` | `essay`)
- `prompt`: Text (the question itself)
- `explanation`: Text (optional, shown after submission)
- `media`: URLField (optional, public URL for attachment)
- `order`: Positive Integer (auto-increments)
- `score`: Decimal (points for this question, default 1.0)

**Question Types:**
1. **multiple_choice**: Auto-graded with options
2. **text_input**: Auto-graded with exact text match
3. **essay**: Manually graded by teacher

### NewQuizOption, NewQuizAnswer, NewQuizAttempt, NewStudentAnswer, NewEssayGrading, NewQuestionComment
Same structure as regular quiz models, but for new_quiz system.

---

## Level APIs

Base URL: `/api/v1/new_quiz/levels/`

### 1. List Levels
```http
GET /api/v1/new_quiz/levels/
```

**Permission**: Authenticated or Read-Only

**Query Parameters:**
- `is_active=true|false` - Filter by active status
- `search={keyword}` - Search in code, name, description
- `ordering=order,code` - Order results

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": "uuid-here",
      "code": "A1",
      "name": "Beginner A1",
      "order": 1,
      "description": "Beginner level",
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Create Level
```http
POST /api/v1/new_quiz/levels/
```

**Permission**: Authenticated (typically Teacher/Admin)

**Request Body:**
```json
{
  "code": "B1",
  "name": "Intermediate B1",
  "order": 3,
  "description": "Intermediate level",
  "is_active": true
}
```

**Validation:**
- `code` must be unique
- `order` should be positive integer

**Response:** `201 Created`

### 3. Update/Delete Level
```http
PUT /api/v1/new_quiz/levels/{id}/
PATCH /api/v1/new_quiz/levels/{id}/
DELETE /api/v1/new_quiz/levels/{id}/
```

**Permission**: Authenticated (typically Teacher/Admin)

---

## Teacher APIs

Base URL: `/api/v1/new_quiz/quizzes/`

### 1. List All Quizzes
```http
GET /api/v1/new_quiz/quizzes/
```

**Permission**: Authenticated (Teachers see their own + published, Students see only published)

**Query Parameters:**
- `level={uuid}` - Filter by level
- `is_published=true|false` - Filter by publish status
- `created_by={user_id}` - Filter by creator
- `search={keyword}` - Search in title/description
- `ordering=-created_at` - Order results

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "id": "uuid-here",
      "title": "Python Basics Quiz",
      "description": "Test your knowledge",
      "level": "uuid-level",
      "level_code": "A1",
      "level_name": "Beginner A1",
      "time_type": "limit",
      "time_value": 30,
      "time_unit": "minute",
      "time_limit_display": "30 minutes",
      "is_published": true,
      "retake_limit": 3,
      "total_questions": 10,
      "created_by": 18,
      "created_by_name": "John Doe",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 2. Create Quiz
```http
POST /api/v1/new_quiz/quizzes/
```

**Permission**: Teacher or Admin only

**Request Body:**
```json
{
  "title": "Python Basics Quiz",
  "description": "Test your knowledge of Python fundamentals",
  "level_id": "uuid-level-id",
  "time_type": "limit",
  "time_value": 30,
  "time_unit": "minute",
  "retake_limit": 3,
  "is_published": false,
  "questions": [
    {
      "question_type": "multiple_choice",
      "prompt": "What is the output of print(2 + 2)?",
      "explanation": "Addition of two integers",
      "order": 1,
      "score": 2.0,
      "options": [
        {"label": "A", "text": "3", "is_correct": false},
        {"label": "B", "text": "4", "is_correct": true},
        {"label": "C", "text": "22", "is_correct": false}
      ]
    },
    {
      "question_type": "text_input",
      "prompt": "Explain the difference between list and tuple",
      "order": 2,
      "score": 5.0,
      "sample_answer": {
        "text": "Lists are mutable, tuples are immutable"
      }
    },
    {
      "question_type": "essay",
      "prompt": "Write a detailed explanation of Python decorators",
      "order": 3,
      "score": 10.0
    }
  ]
}
```

**Validation Rules:**
1. `level_id` is **required** (NOT NULL)
2. `time_type=limit` requires `time_value` and `time_unit`
3. `retake_limit` must be at least 1
4. Question validation same as regular quiz (MCQ/text/essay rules)

**Response:** `201 Created` with full quiz details

---

### 3. Get Quiz Details
```http
GET /api/v1/new_quiz/quizzes/{id}/
```

**Permission**: Authenticated (Teachers can see own unpublished, Students see only published)

**Response:** Full quiz with all questions, options, and sample answers

---

### 4. Update Quiz
```http
PUT /api/v1/new_quiz/quizzes/{id}/
PATCH /api/v1/new_quiz/quizzes/{id}/
```

**Permission**: Quiz owner or Admin only

**Key Rules:**
- Include `questions` array to modify questions
- Provide `id` for questions to update; omit `id` to create new
- Questions omitted from payload are deleted
- Can update `level_id` to move quiz to different level

---

### 5. Delete Quiz
```http
DELETE /api/v1/new_quiz/quizzes/{id}/
```

**Permission**: Owner or Admin only

**Response:** `204 No Content`

---

### 6. Publish/Unpublish Quiz
```http
PATCH /api/v1/new_quiz/quizzes/{id}/publish/
PATCH /api/v1/new_quiz/quizzes/{id}/unpublish/
```

**Permission**: Owner or Admin only

**Validation**: Quiz must have at least one question to publish

---

### 7. Get My Quizzes
```http
GET /api/v1/new_quiz/quizzes/mine/
```

**Permission**: Teacher or Admin only

**Description**: Get all quizzes created by current teacher

---

### 8. Get Quizzes by Level
```http
GET /api/v1/new_quiz/quizzes/by_level/?level_id={uuid}
```

**Permission**: Authenticated

**Description**: Get all published quizzes for a specific level

**Query Parameters:**
- `level_id` (required): UUID of the level

---

### 9. View Quiz Attempts
```http
GET /api/v1/new_quiz/quizzes/{quiz_id}/attempts/?status=completed&student_id={uuid}
```

**Permission**: 
- Quiz owner (teacher) or Admin: view all attempts
- Students: automatically limited to their own attempts

---

### 10. Leaderboard
```http
GET /api/v1/new_quiz/quizzes/{quiz_id}/leaderboard/
```

**Permission**: Any authenticated user

**Description**: Return leaderboard for completed attempts, ranked by score, time spent, completion timestamp

---

## Student APIs

Base URL: `/api/v1/new_quiz/attempts/`

### 1. Start Quiz Attempt
```http
POST /api/v1/new_quiz/attempts/start/
```

**Permission**: Authenticated (Students)

**Request Body:**
```json
{
  "quiz_id": "uuid-of-quiz"
}
```

**Validation:**
- Quiz must exist and be published
- Student must not have exceeded retake limit

**Response:** `201 Created`
```json
{
  "message": "Quiz attempt started",
  "attempt": {
    "id": "attempt-uuid",
    "quiz": "quiz-uuid",
    "quiz_title": "Python Basics Quiz",
    "status": "in_progress",
    "started_at": "2025-10-12T10:00:00Z",
    "total_questions": 10,
    "max_score": 25.0,
    "time_remaining_seconds": 1800
  }
}
```

---

### 2. Submit Quiz Answers
```http
POST /api/v1/new_quiz/attempts/{attempt_id}/submit/
```

**Permission**: Authenticated (Owner of attempt only)

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": "uuid-question-1",
      "selected_option_id": "uuid-option-b"
    },
    {
      "question_id": "uuid-question-2",
      "text_answer": "Lists are mutable, tuples are immutable"
    },
    {
      "question_id": "uuid-question-3",
      "text_answer": "Django is a framework",
      "attachment_url": "https://s3.../essay.pdf"
    }
  ]
}
```

**Answer Format:**
- **Multiple-choice**: Provide `selected_option_id`
- **Text-input**: Provide `text_answer`
- **Essay**: Provide `text_answer` and/or `attachment_url`

**Response:** `200 OK` with results and scoring

---

### 3. Get My Quiz Attempts
```http
GET /api/v1/new_quiz/attempts/my_attempts/
```

**Permission**: Authenticated (Students)

**Description**: Get all quiz attempts for current student

---

### 4. Get Recent Submissions (Teacher Dashboard)
```http
GET /api/v1/new_quiz/attempts/recent_submissions/
```

**Permission**: Teacher or Admin only

**Query Parameters:**
- `status`: Filter by attempt status
- `level_id`: Filter by level
- `needs_grading=true`: Only show attempts with pending essay gradings

---

### 5. Get Attempts by Level
```http
GET /api/v1/new_quiz/attempts/by_level/?level_id={uuid}
```

**Permission**: Teacher or Admin only

**Description**: Get quiz attempts filtered by level

---

## Essay Grading APIs

Base URL: `/api/v1/new_quiz/essay-gradings/`

### 1. Get Essays Needing Grading
```http
GET /api/v1/new_quiz/essay-gradings/needs_grading/
```

**Permission**: Teacher or Admin only

**Query Parameters:**
- `level_id`: Filter by level

**Response:** List of pending essay submissions

---

### 2. Grade Essay
```http
POST /api/v1/new_quiz/essay-gradings/{id}/grade/
```

**Permission**: Grader or Admin only

**Request Body:**
```json
{
  "score": 8.5,
  "feedback": "Good explanation! Could add more examples.",
  "corrected_answer": "Optional: corrected version"
}
```

**Validation:**
- Score must be between 0 and max_score
- If `corrected_answer` provided, it replaces student's answer

**Side Effects:**
- Updates grading_status to 'graded'
- Sets graded_at timestamp
- Recalculates quiz attempt total score

---

### 3. Get Pending Essays
```http
GET /api/v1/new_quiz/essay-gradings/pending/
```

**Permission**: Teacher or Admin only

---

### 4. Get My Gradings
```http
GET /api/v1/new_quiz/essay-gradings/my_gradings/
```

**Permission**: Teacher only

---

## Question Comments API

Teachers can leave feedback tied to individual student answers per question.

- `GET  /api/v1/new_quiz/quizzes/{quiz_id}/questions/{question_id}/comments/`
- `POST /api/v1/new_quiz/quizzes/{quiz_id}/questions/{question_id}/comments/`
- `GET/PUT/PATCH/DELETE /api/v1/new_quiz/quizzes/{quiz_id}/questions/{question_id}/comments/{comment_id}/`

**Permissions:**
- Teachers/Admins: view and create comments
- Students: view only comments linked to their answers

---

## Permissions

### Permission Matrix

| Action | Anonymous | Student | Teacher | Admin |
|--------|-----------|---------|---------|-------|
| **LEVEL MANAGEMENT** |
| List levels | ✓ | ✓ | ✓ | ✓ |
| Create level | ✗ | ✗ | ✓ | ✓ |
| Update/Delete level | ✗ | ✗ | ✓ | ✓ |
| **QUIZ MANAGEMENT** |
| List quizzes | ✓ (published) | ✓ (published) | ✓ (own + published) | ✓ (all) |
| View quiz | ✓ (published) | ✓ (published) | ✓ (own + published) | ✓ (all) |
| Create quiz | ✗ | ✗ | ✓ | ✓ |
| Update quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Delete quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Publish quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| **QUIZ ATTEMPTS** |
| Start quiz | ✗ | ✓ | ✗ | ✗ |
| Submit answers | ✗ | ✓ (own) | ✗ | ✓ (all) |
| View attempt | ✗ | ✓ (own) | ✗ | ✓ (all) |
| View my attempts | ✗ | ✓ | ✗ | ✗ |

---

## Examples

### Teacher Workflow

#### 1. Create Level
```bash
curl -X POST http://localhost:8000/api/v1/new_quiz/levels/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "A1",
    "name": "Beginner A1",
    "order": 1,
    "description": "Beginner level",
    "is_active": true
  }'
```

#### 2. Create Quiz
```bash
curl -X POST http://localhost:8000/api/v1/new_quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics",
    "description": "Test basic Python knowledge",
    "level_id": "uuid-level-id",
    "time_type": "limit",
    "time_value": 15,
    "time_unit": "minute",
    "questions": [
      {
        "question_type": "multiple_choice",
        "prompt": "What is Python?",
        "order": 1,
        "options": [
          {"label": "A", "text": "A snake", "is_correct": false},
          {"label": "B", "text": "A programming language", "is_correct": true}
        ]
      }
    ]
  }'
```

#### 3. Publish Quiz
```bash
curl -X PATCH http://localhost:8000/api/v1/new_quiz/quizzes/{quiz_id}/publish/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. View Quizzes by Level
```bash
curl -X GET "http://localhost:8000/api/v1/new_quiz/quizzes/by_level/?level_id=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Student Workflow

#### 1. Browse Available Quizzes
```bash
# List all published quizzes
curl -X GET http://localhost:8000/api/v1/new_quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by level
curl -X GET "http://localhost:8000/api/v1/new_quiz/quizzes/?level=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2. Start Quiz Attempt
```bash
curl -X POST http://localhost:8000/api/v1/new_quiz/attempts/start/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "uuid-quiz-id"
  }'
```

#### 3. Submit Answers
```bash
curl -X POST http://localhost:8000/api/v1/new_quiz/attempts/{attempt_id}/submit/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "question_id": "uuid-question-1",
        "selected_option_id": "uuid-option-b"
      },
      {
        "question_id": "uuid-question-2",
        "text_answer": "Your answer here"
      }
    ]
  }'
```

---

## Key Differences from Regular Quiz

| Feature | Regular Quiz | New Quiz |
|---------|-------------|----------|
| Organization | Category → Course → Chapter → Lesson | **Level** (A1, A2, etc.) |
| Course Dependency | ✅ Linked to course structure | ❌ **Independent** |
| Level Source | Course level | **Custom Level model** |
| Filtering | By category/lesson | **By level** |
| Use Case | Course-specific quizzes | **Standalone assessment** |

---

## Testing

### Run Tests
```bash
# Run all new_quiz tests
docker compose exec web python manage.py test src.new_quiz

# Run specific test class
docker compose exec web python manage.py test src.new_quiz.tests.NewQuizEndToEndFlowTestCase
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review the examples
3. Check validation errors in response
4. Contact backend team

---

## License

This module is part of the E-Learning Backend project.