# Quiz Management API Documentation

## Overview

The Quiz Management system provides comprehensive quiz functionality for both teachers and students:
- **Teachers**: Create, manage, and publish quizzes with various question types
- **Students**: Take quizzes, submit answers, and view results with auto-grading

## Table of Contents
1. [Models](#models)
2. [Teacher APIs](#teacher-apis)
3. [Student APIs](#student-apis)
4. [Permissions](#permissions)
5. [Examples](#examples)

---

## Models

### Quiz
Main quiz model with time settings and publishing control.

**Fields:**
- `id`: UUID (auto-generated)
- `title`: String (max 200 chars)
- `description`: Text
- `category`: FK to courses.Category (required)
- `lesson`: FK to courses.Lesson (required)
- `time_type`: Choice (`limit` | `none`)
- `time_value`: Positive Integer (nullable, required if time_type=limit)
- `time_unit`: Choice (`minute` | `second`)
- `is_published`: Boolean (default: False) - controls student visibility
- `created_by`: FK to User (teacher who created it)
- `created_at`, `updated_at`: DateTime

**Computed Properties:**
- `total_questions`: Number of questions in quiz
- `time_limit_in_seconds`: Time limit converted to seconds

### QuizQuestion
Individual questions within a quiz.

**Fields:**
- `id`: UUID
- `quiz`: FK to Quiz
- `question_type`: Choice (`multiple_choice` | `text_input` | `essay`)
- `prompt`: Text (the question itself)
- `explanation`: Text (optional, shown after submission)
- `media`: FileField (optional, upload to `quiz/questions/`)
- `order`: Positive Integer (auto-increments)
- `score`: Decimal (points for this question, default 1.0)

**Question Types:**
1. **multiple_choice**: Auto-graded with options
2. **text_input**: Auto-graded with exact text match
3. **essay**: Manually graded by teacher (requires manual grading)

### QuizOption
Answer options for multiple-choice questions only.

**Fields:**
- `id`: UUID
- `question`: FK to QuizQuestion
- `label`: Choice (`A` | `B` | `C` | `D`)
- `text`: String (max 500 chars)
- `is_correct`: Boolean

**Constraints:**
- Must have exactly ONE correct answer per question
- Minimum 2 options per question

### QuizAnswer
Sample/suggested answers for text-input questions only.

**Fields:**
- `id`: UUID
- `question`: OneToOne to QuizQuestion
- `text`: Text (sample answer)

### QuizAttempt
Student's attempt at taking a quiz.

**Fields:**
- `id`: UUID
- `quiz`: FK to Quiz
- `student`: FK to User
- `status`: Choice (`in_progress` | `completed` | `expired`)
- `started_at`: DateTime
- `completed_at`: DateTime (nullable)
- `time_spent_seconds`: Positive Integer
- `total_score`: Decimal(10,2) - Total points earned
- `max_score`: Decimal(10,2) - Maximum possible points
- `score`: Decimal(5,2) - Percentage score (total_score/max_score * 100)
- `correct_answers`: Positive Integer
- `total_questions`: Positive Integer

### StudentAnswer
Student's answer to a specific question.

**Fields:**
- `id`: UUID
- `attempt`: FK to QuizAttempt
- `question`: FK to QuizQuestion
- `selected_option`: FK to QuizOption (for multiple-choice)
- `text_answer`: Text (for text-input)
- `is_correct`: Boolean (auto-calculated)
- `answered_at`: DateTime

### EssayGrading (NEW)
Manual grading for essay questions.

**Fields:**
- `id`: UUID
- `student_answer`: FK to StudentAnswer
- `grader`: FK to User (teacher who grades)
- `score`: Decimal (points earned, 0 to max_score)
- `max_score`: Decimal (maximum points from question.score)
- `feedback`: Text (teacher's feedback/comments)
- `grading_status`: Choice (`pending` | `graded`)
- `graded_at`: DateTime (when graded)
- `created_at`: DateTime

**Workflow:**
1. Student submits essay answer → Auto-creates EssayGrading with status='pending'
2. Teacher grades essay → Updates score, feedback, status='graded'
3. Quiz score automatically recalculated

---

## Teacher APIs

Base URL: `/api/v1/quiz/quizzes/`

### 1. List All Quizzes
```http
GET /api/v1/quiz/quizzes/
```

**Permission**: Authenticated (Teachers see their own + published, Students see only published)

**Query Parameters:**
- `category={uuid}` - Filter by category
- `lesson={uuid}` - Filter by lesson
- `is_published=true|false` - Filter by publish status
- `created_by={user_id}` - Filter by creator
- `search={keyword}` - Search in title/description
- `ordering=-created_at` - Order results (created_at, updated_at, title)

**Response:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "title": "Python Basics Quiz",
      "description": "Test your knowledge of Python fundamentals",
      "category": "uuid-category",
      "category_name": "Programming",
      "lesson": "uuid-lesson",
      "lesson_title": "Introduction to Python",
      "chapter_title": "Chapter 1: Getting Started",
      "course_title": "Python Programming",
      "time_type": "limit",
      "time_value": 30,
      "time_unit": "minute",
      "time_limit_display": "30 minutes",
      "is_published": true,
      "total_questions": 10,
      "created_by": 18,
      "created_by_name": "John Doe",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 2. Create Quiz
```http
POST /api/v1/quiz/quizzes/
```

**Permission**: Teacher or Admin only

**Request Body:**
```json
{
  "title": "Python Basics Quiz",
  "description": "Test your knowledge of Python fundamentals",
  "category": "uuid-category-id",
  "lesson": "uuid-lesson-id",
  "time_type": "limit",
  "time_value": 30,
  "time_unit": "minute",
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
        {"label": "C", "text": "22", "is_correct": false},
        {"label": "D", "text": "Error", "is_correct": false}
      ]
    },
    {
      "question_type": "text_input",
      "prompt": "Explain the difference between list and tuple in Python",
      "explanation": "Lists are mutable, tuples are immutable",
      "order": 2,
      "score": 5.0,
      "sample_answer": {
        "text": "Lists are mutable collections that can be modified after creation, while tuples are immutable and cannot be changed once created."
      }
    }
  ]
}
```

**Validation Rules:**
1. `time_type=limit` requires `time_value` and `time_unit`
2. `lesson` must belong to the same `category` (via lesson->chapter->course->category)
3. **Question scoring:**
   - `score` must be > 0 (default 1.0 if omitted)
   - Total quiz score = sum of all question scores
4. **Multiple-choice questions:**
   - Must have at least 2 options
   - Must have exactly 1 correct answer (is_correct=true)
   - Option labels must be unique (A, B, C, D)
   - Cannot have sample_answer
5. **Text-input questions:**
   - Cannot have options
   - Should have sample_answer for auto-grading
   - Auto-graded with exact match (case-sensitive, spaces normalized)
6. **Essay questions:**
   - Cannot have options or sample_answer
   - NOT auto-graded (requires manual grading by teacher)
   - Creates EssayGrading record with status='pending'
   - Teacher must manually grade and provide score + feedback

**Response:** `201 Created`
```json
{
  "id": "uuid-here",
  "title": "Python Basics Quiz",
  "description": "Test your knowledge of Python fundamentals",
  "category": "uuid-category",
  "chapter": "uuid-chapter",
  "time_type": "limit",
  "time_value": 30,
  "time_unit": "minute",
  "is_published": false,
  "questions": [
    {
      "id": "uuid-question",
      "question_type": "multiple_choice",
      "prompt": "What is the output of print(2 + 2)?",
      "explanation": "Addition of two integers",
      "media": null,
      "media_url": null,
      "order": 1,
      "options": [
        {"id": "uuid", "label": "A", "text": "3", "is_correct": false},
        {"id": "uuid", "label": "B", "text": "4", "is_correct": true},
        {"id": "uuid", "label": "C", "text": "22", "is_correct": false},
        {"id": "uuid", "label": "D", "text": "Error", "is_correct": false}
      ],
      "sample_answer": null,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "uuid-question-2",
      "question_type": "text_input",
      "prompt": "Explain the difference between list and tuple",
      "explanation": "Lists are mutable, tuples are immutable",
      "media": null,
      "media_url": null,
      "order": 2,
      "options": [],
      "sample_answer": {
        "id": "uuid",
        "text": "Lists are mutable..."
      },
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total_questions": 2,
  "created_by": 18,
  "created_by_name": "John Doe",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

### 3. Get Quiz Details
```http
GET /api/v1/quiz/quizzes/{id}/
```

**Permission**: Authenticated (Teachers can see own unpublished, Students see only published)

**Response:** Same structure as Create response

---

### 4. Update Quiz (Nested PUT/PATCH)
```http
PUT /api/v1/quiz/quizzes/{id}/
PATCH /api/v1/quiz/quizzes/{id}/
```

**Permission**: Quiz owner or Admin only  
When a quiz is already published, only the owner or an admin may edit it (other teachers are rejected).

**Key Rules**
- Include a `questions` array to modify the question set.
- Provide `id` for questions/options you wish to update; omit `id` to create new ones.
- Questions omitted from the payload are deleted.
- Multiple-choice questions must keep the “one correct option” rule.
- Switching a question to `text_input` removes existing options automatically.

**Example Payload**
```json
{
  "title": "Python Basics Quiz – Updated",
  "description": "Refreshed question set",
  "category": "uuid-category",
  "chapter": "uuid-chapter",
  "time_type": "limit",
  "time_value": 25,
  "time_unit": "minute",
  "is_published": true,
  "questions": [
    {
      "id": "existing-question-uuid",
      "question_type": "multiple_choice",
      "prompt": "What does len('hi') return?",
      "order": 1,
      "options": [
        {"label": "A", "text": "1", "is_correct": false},
        {"label": "B", "text": "2", "is_correct": true}
      ]
    },
    {
      "question_type": "text_input",
      "prompt": "Describe how to declare a list in Python.",
      "order": 2,
      "sample_answer": {"text": "Use square brackets, e.g. my_list = [1, 2, 3]"}
    }
  ]
}
```

---

### 5. Delete Quiz
```http
DELETE /api/v1/quiz/quizzes/{id}/
```

**Permission**: Owner or Admin only

**Response:** `204 No Content`

⚠️ **Warning**: This will also delete all attempts and student answers.

---

### 6. Publish Quiz
```http
PATCH /api/v1/quiz/quizzes/{id}/publish/
```

**Permission**: Owner or Admin only

**Description**: Publish a quiz to make it visible to students.

**Validation**: Quiz must have at least one question.

**Response:** `200 OK`
```json
{
  "message": "Quiz published successfully",
  "quiz": {
    "id": "uuid-here",
    "title": "Python Basics Quiz",
    "is_published": true,
    ...
  }
}
```

---

### 7. Unpublish Quiz
```http
PATCH /api/v1/quiz/quizzes/{id}/unpublish/
```

**Permission**: Owner or Admin only

**Description**: Unpublish a quiz to hide it from students.

**Response:** `200 OK`
```json
{
  "message": "Quiz unpublished successfully",
  "quiz": {
    "id": "uuid-here",
    "is_published": false,
    ...
  }
}
```

---

### 8. Get My Quizzes
```http
GET /api/v1/quiz/quizzes/mine/
```

**Permission**: Teacher or Admin only

**Description**: Get all quizzes created by the current teacher (both published and unpublished).

**Response:** Same as List Quizzes

---

### 9. Get Quizzes by Category
```http
GET /api/v1/quiz/quizzes/by_category/?category_id={uuid}
```

**Permission**: Authenticated

**Description**: Get all published quizzes for a specific category.

**Query Parameters:**
- `category_id` (required): UUID of the category

---

### 10. Get Quizzes by Lesson
```http
GET /api/v1/quiz/quizzes/by_lesson/?lesson_id={uuid}
```

**Permission**: Authenticated

**Description**: Get all published quizzes for a specific lesson.

**Query Parameters:**
- `lesson_id` (required): UUID of the lesson

---

### 11. View Quiz Attempts
```http
GET /api/v1/quiz/quizzes/{quiz_id}/attempts/?status=completed&student_id={uuid}
```

**Permission**  
- Quiz owner (teacher) or Admin: view every attempt, filter via query params.  
- Students: automatically limited to their own attempts.

**Response (truncated)**
```json
[
  {
    "id": "attempt-uuid",
    "student": "student-uuid",
    "student_name": "Student One",
    "status": "completed",
    "score": "95.00",
    "correct_answers": 19,
    "total_questions": 20,
    "answers": [
      {
        "id": "answer-uuid",
        "question": "question-uuid",
        "question_prompt": "How do you say hello in Italian?",
        "question_type": "multiple_choice",
        "selected_option": "option-uuid",
        "selected_option_text": "Ciao",
        "is_correct": true,
        "comments": [
          {
            "id": "comment-uuid",
            "author": 7,
            "author_name": "Teacher Jane",
            "role": "teacher",
            "content": "Excellent!",
            "created_at": "2025-01-20T09:00:00Z"
          }
        ]
      }
    ]
  }
]
```

---

### 12. Leaderboard
```http
GET /api/v1/quiz/quizzes/{quiz_id}/leaderboard/
```

**Permission**: Any authenticated user (students and teachers).  
Entries include completed attempts only, ranked by score, then time spent, then completion timestamp.

```json
{
  "quiz_id": "quiz-uuid",
  "entries": [
    {
      "rank": 1,
      "student_id": "student-uuid-1",
      "student_name": "Student One",
      "student_email": "student1@example.com",
      "score": "95.00",
      "correct_answers": 19,
      "time_spent_seconds": 540,
      "completed_at": "2025-01-20T09:00:00Z"
    }
  ]
}
```

---

### 13. Get Recent Quiz Submissions (Teacher Dashboard)
```http
GET /api/v1/quiz/attempts/recent_submissions/
```

**Permission**: Teacher or Admin only

**Description**: Get recent quiz attempts from students in teacher's classrooms.

**Query Parameters:**
- `status`: Filter by attempt status
- `classroom_id`: Filter by specific classroom
- `needs_grading=true`: Only show attempts with pending essay gradings

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": "attempt-uuid",
      "student_name": "John Student",
      "quiz_title": "Python Assessment",
      "status": "completed",
      "score": "75.00",
      "has_pending_essays": true,
      "started_at": "2025-10-19T10:00:00Z"
    }
  ]
}
```

---

### 14. Get Quiz Attempts by Classroom
```http
GET /api/v1/quiz/attempts/by_classroom/?classroom_id={uuid}
```

**Permission**: Teacher or Admin only

**Description**: Get all quiz attempts for a specific classroom.

**Query Parameters:**
- `classroom_id` (required): Classroom UUID
- `quiz_id`: Filter by specific quiz

**Response:** Same as recent submissions

---

## Essay Grading APIs (Teacher Dashboard)

Base URL: `/api/v1/quiz/essay-gradings/`

### 1. Get Essays Needing Grading
```http
GET /api/v1/quiz/essay-gradings/needs_grading/
```

**Permission**: Teacher or Admin only

**Description**: Get all pending essay submissions from teacher's classrooms.

**Query Parameters:**
- `classroom_id`: Filter by specific classroom

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": "grading-uuid",
      "student_answer_id": "answer-uuid",
      "student_name": "John Student",
      "student_email": "john@example.com",
      "question_prompt": "Explain the difference between list and tuple...",
      "student_answer_text": "Lists are mutable...",
      "quiz_title": "Python Assessment",
      "attempt_id": "attempt-uuid",
      "max_score": 10.0,
      "grading_status": "pending",
      "created_at": "2025-10-19T10:05:00Z"
    }
  ]
}
```

---

### 2. Get Pending Essays
```http
GET /api/v1/quiz/essay-gradings/pending/
```

**Permission**: Teacher or Admin only

**Description**: Get all pending essay gradings.

---

### 3. Grade Essay
```http
POST /api/v1/quiz/essay-gradings/{id}/grade/
```

**Permission**: Grader or Admin only

**Description**: Grade an essay question with score and feedback.

**Request Body:**
```json
{
  "score": 8.5,
  "feedback": "Good explanation! Could add more examples.",
  "corrected_answer": "Optional: corrected version of student answer"
}
```

**Validation:**
- Score must be between 0 and max_score
- If `corrected_answer` provided, it replaces student's answer

**Response:**
```json
{
  "id": "grading-uuid",
  "student_answer": "answer-uuid",
  "student_name": "John Student",
  "grader": 7,
  "grader_name": "Teacher Jane",
  "score": 8.5,
  "max_score": 10.0,
  "feedback": "Good explanation! Could add more examples.",
  "grading_status": "graded",
  "graded_at": "2025-10-19T11:00:00Z",
  "created_at": "2025-10-19T10:05:00Z"
}
```

**Side Effects:**
- Updates grading_status to 'graded'
- Sets graded_at timestamp
- Recalculates quiz attempt total score
- Optionally updates student answer if corrected_answer provided

---

### 4. Get My Gradings
```http
GET /api/v1/quiz/essay-gradings/my_gradings/
```

**Permission**: Teacher only

**Description**: Get all essays graded by current teacher.

---

### 5. Get Essay Grading Details
```http
GET /api/v1/quiz/essay-gradings/{id}/
```

**Permission**: Grader, Student (own), or Admin

**Description**: Get detailed information about an essay grading.

---

## Question Comments API

Teachers can leave feedback tied to individual student answers per question.

- `GET  /api/v1/quiz/quizzes/{quiz_id}/questions/{question_id}/comments/`
  - Teachers/Admins: view every comment.
  - Students: view only comments linked to their answers.
- `POST /api/v1/quiz/quizzes/{quiz_id}/questions/{question_id}/comments/`
  - Teachers/Admins only (payload: `{ "answer": "student-answer-uuid", "content": "Well done!" }`)
- `GET/PUT/PATCH/DELETE /api/v1/quiz/quizzes/{quiz_id}/questions/{question_id}/comments/{comment_id}/`
  - Teachers/Admins: manage comments they created (admins can manage all).
  - Students may retrieve comments that reference their answers.

Response objects match:
```json
{
  "id": "comment-uuid",
  "question": "question-uuid",
  "answer": "student-answer-uuid",
  "author": 7,
  "author_name": "Teacher Jane",
  "role": "teacher",
  "content": "Try to mention tuple immutability.",
  "created_at": "2025-01-20T08:15:00Z"
}
```

---

## Student APIs

Base URL: `/api/v1/quiz/attempts/`

### 1. Start Quiz Attempt
```http
POST /api/v1/quiz/attempts/start/
```

**Permission**: Authenticated (Students only)

**Description**: Start a new quiz attempt. If an in-progress attempt exists, it will be resumed.

**Request Body:**
```json
{
  "quiz_id": "uuid-of-quiz"
}
```

**Validation:**
- Quiz must exist and be published
- User must be a student (not teacher or staff)

**Response:** `201 Created` (or `200 OK` if resuming)
```json
{
  "message": "Quiz attempt started",
  "attempt": {
    "id": "attempt-uuid",
    "quiz": "quiz-uuid",
    "quiz_title": "Python Basics Quiz",
    "student": 16,
    "student_name": "John Student",
    "status": "in_progress",
    "started_at": "2025-10-12T10:00:00Z",
    "completed_at": null,
    "time_spent_seconds": 0,
    "total_score": 0,
    "max_score": 25.0,
    "score": null,
    "correct_answers": 0,
    "total_questions": 10,
    "answers": [],
    "time_remaining_seconds": 1800
  }
}
```

**Note**: `time_remaining_seconds` is only present for timed quizzes and shows remaining seconds.

---

### 2. Submit Quiz Answers
```http
POST /api/v1/quiz/attempts/{attempt_id}/submit/
```

**Permission**: Authenticated (Owner of attempt only)

**Description**: Submit answers for a quiz attempt. Answers are auto-graded and score is calculated.

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
      "selected_option_id": "uuid-option-a"
    },
    {
      "question_id": "uuid-question-3",
      "text_answer": "Lists are mutable, tuples are immutable"
    }
  ]
}
```

**Answer Format:**
- **Multiple-choice**: Provide `selected_option_id`
- **Text-input**: Provide `text_answer`

**Validation:**
- Attempt must be in `in_progress` status
- Only the student who started the attempt can submit
- Time limit must not have expired (for timed quizzes)
- Question IDs must belong to the quiz
- Option IDs must belong to the question

**Response:** `200 OK`
```json
{
  "message": "Quiz submitted successfully",
  "attempt": {
    "id": "attempt-uuid",
    "quiz": "quiz-uuid",
    "quiz_title": "Python Basics Quiz",
    "student": 16,
    "student_name": "John Student",
    "status": "completed",
    "started_at": "2025-10-12T10:00:00Z",
    "completed_at": "2025-10-12T10:05:30Z",
    "time_spent_seconds": 330,
    "score": "80.00",
    "correct_answers": 8,
    "total_questions": 10,
    "answers": [
      {
        "id": "answer-uuid",
        "question": "question-uuid",
        "question_prompt": "What is Python?",
        "question_type": "multiple_choice",
        "selected_option": "option-uuid",
        "selected_option_text": "A programming language",
        "text_answer": "",
        "is_correct": true,
        "correct_answer": {
          "label": "B",
          "text": "A programming language"
        },
        "answered_at": "2025-10-12T10:05:30Z"
      },
      {
        "id": "answer-uuid-2",
        "question": "question-uuid-2",
        "question_prompt": "Explain list comprehension",
        "question_type": "text_input",
        "selected_option": null,
        "selected_option_text": null,
        "text_answer": "List comprehension is a concise way...",
        "is_correct": true,
        "correct_answer": {
          "text": "List comprehension provides a concise way to create lists..."
        },
        "answered_at": "2025-10-12T10:05:30Z"
      }
    ],
    "time_remaining_seconds": null
  },
  "results": {
    "total_score": 18.5,
    "max_score": 23.0,
    "percentage": 80.43,
    "correct_answers": 8,
    "total_questions": 10,
    "formatted": "18.5/23.0 (80.4%)"
  }
}
```

**Notes:**
- `correct_answer` is only shown **after submission** (when status=completed)
- `is_correct` indicates if the answer was correct
- For text-input questions, `is_correct` is true if text_answer is not empty (manual grading may be needed)

---

### 3. Get Attempt Details
```http
GET /api/v1/quiz/attempts/{attempt_id}/
```

**Permission**: Authenticated (Owner or Admin)

**Description**: Get detailed information about a quiz attempt including all answers.

**Response:** Same structure as Submit response

**Use Cases:**
- Review completed quiz results
- Check in-progress attempt status
- See which answers were correct/incorrect
- View correct answers for learning

---

### 4. Get My Quiz Attempts
```http
GET /api/v1/quiz/attempts/my_attempts/
```

**Permission**: Authenticated (Students)

**Description**: Get all quiz attempts for the current student.

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "attempt-uuid",
      "quiz": "quiz-uuid",
      "quiz_title": "Python Basics Quiz",
      "student": 16,
      "student_name": "John Student",
      "status": "completed",
      "started_at": "2025-10-12T10:00:00Z",
      "completed_at": "2025-10-12T10:05:30Z",
      "time_spent_seconds": 330,
      "total_score": 18.50,
      "max_score": 23.00,
      "score": "80.43",
      "correct_answers": 8,
      "total_questions": 10,
      "answers": [...],
      "time_remaining_seconds": null
    },
    {
      "id": "attempt-uuid-2",
      "quiz": "quiz-uuid-2",
      "quiz_title": "Django Advanced",
      "status": "in_progress",
      "started_at": "2025-10-12T11:00:00Z",
      "time_remaining_seconds": 1200,
      ...
    }
  ]
}
```

---

### 5. List Quiz Attempts (Admin)
```http
GET /api/v1/quiz/attempts/
```

**Permission**: Admin only

**Description**: Get all quiz attempts (for monitoring/grading).

**Response:** Paginated list of all attempts

---

## Permissions

### Permission Matrix

| Action | Anonymous | Student | Teacher | Admin |
|--------|-----------|---------|---------|-------|
| **QUIZ MANAGEMENT** |
| List quizzes | ✓ (published) | ✓ (published) | ✓ (own + published) | ✓ (all) |
| View quiz | ✓ (published) | ✓ (published) | ✓ (own + published) | ✓ (all) |
| Create quiz | ✗ | ✗ | ✓ | ✓ |
| Update quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Delete quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Publish quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Unpublish quiz | ✗ | ✗ | ✓ (own) | ✓ (all) |
| Get my quizzes | ✗ | ✗ | ✓ | ✓ |
| **QUIZ ATTEMPTS** |
| Start quiz | ✗ | ✓ | ✗ | ✗ |
| Submit answers | ✗ | ✓ (own) | ✗ | ✓ (all) |
| View attempt | ✗ | ✓ (own) | ✗ | ✓ (all) |
| View my attempts | ✗ | ✓ | ✗ | ✗ |
| List all attempts | ✗ | ✗ | ✗ | ✓ |

### Role Restrictions

**Teachers:**
- Cannot take quizzes (start attempts)
- Can create and manage quizzes
- Can view all their created quizzes (published + unpublished)

**Students:**
- Cannot create quizzes
- Can only view published quizzes
- Can start attempts and submit answers
- Can only view their own attempts

**Admins:**
- Full access to all quizzes and attempts
- Can view and manage all data

---

## Examples

### Teacher Workflow

#### 1. Create a Simple Multiple-Choice Quiz

```bash
curl -X POST http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "title": "Python Basics",
    "description": "Test basic Python knowledge",
    "category": "b78a1a43-7b1a-4d8c-bd95-c6bf7b2adc19",
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
          {"label": "B", "text": "A programming language", "is_correct": true},
          {"label": "C", "text": "A database", "is_correct": false}
        ]
      }
    ]
  }'
```

#### 2. Create Mixed Quiz (Multiple-Choice + Text)

```bash
curl -X POST http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "title": "Python Assessment",
    "category": "uuid-category",
    "time_type": "none",
    "questions": [
      {
        "question_type": "multiple_choice",
        "prompt": "Which is a Python framework?",
        "order": 1,
        "options": [
          {"label": "A", "text": "Django", "is_correct": true},
          {"label": "B", "text": "React", "is_correct": false},
          {"label": "C", "text": "Angular", "is_correct": false}
        ]
      },
      {
        "question_type": "text_input",
        "prompt": "Explain list comprehension in Python",
        "order": 2,
        "sample_answer": {
          "text": "List comprehension provides a concise way to create lists based on existing lists or iterables."
        }
      }
    ]
  }'
```

#### 3. Publish Quiz

```bash
curl -X PATCH http://localhost:8000/api/v1/quiz/quizzes/{quiz_id}/publish/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

#### 4. View My Quizzes

```bash
curl -X GET http://localhost:8000/api/v1/quiz/quizzes/mine/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

#### 5. Create Quiz with Essay Questions

```bash
curl -X POST http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "title": "Python Assessment - Mixed",
    "category": "uuid-category",
    "time_type": "limit",
    "time_value": 30,
    "time_unit": "minute",
    "questions": [
      {
        "question_type": "multiple_choice",
        "prompt": "What is Python?",
        "score": 5,
        "order": 1,
        "options": [
          {"label": "A", "text": "A snake", "is_correct": false},
          {"label": "B", "text": "A programming language", "is_correct": true}
        ]
      },
      {
        "question_type": "essay",
        "prompt": "Explain the difference between list and tuple in Python",
        "score": 10,
        "order": 2
      }
    ]
  }'
```

#### 6. View Pending Essay Gradings

```bash
curl -X GET http://localhost:8000/api/v1/quiz/essay-gradings/needs_grading/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

#### 7. Grade Essay

```bash
curl -X POST "http://localhost:8000/api/v1/quiz/essay-gradings/{essay_id}/grade/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "score": 8.5,
    "feedback": "Good explanation! Add more examples next time.",
    "corrected_answer": "Lists are mutable [1,2,3], tuples are immutable (1,2,3)"
  }'
```

---

### Student Workflow

#### 1. Browse Available Quizzes

```bash
# List all published quizzes
curl -X GET http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"

# Filter by category
curl -X GET "http://localhost:8000/api/v1/quiz/quizzes/?category=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"

# Search quizzes
curl -X GET "http://localhost:8000/api/v1/quiz/quizzes/?search=Python" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

#### 2. View Quiz Details

```bash
curl -X GET http://localhost:8000/api/v1/quiz/quizzes/{quiz_id}/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

**Response shows:**
- Quiz metadata (title, description, time limit)
- All questions with their prompts
- All options (for multiple-choice)
- Question order
- ⚠️ Does NOT show correct answers or explanations (only after submission)

#### 3. Start Quiz Attempt

```bash
curl -X POST http://localhost:8000/api/v1/quiz/attempts/start/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "quiz_id": "655bddbf-aa6e-4f06-8ebe-1d9cfe141386"
  }'
```

**Response includes:**
- `attempt.id` - Use this for submitting answers
- `time_remaining_seconds` - Countdown timer (if quiz is timed)
- `total_questions` - Number of questions to answer

#### 4. Submit Answers

```bash
curl -X POST http://localhost:8000/api/v1/quiz/attempts/{attempt_id}/submit/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device-id" \
  -d '{
    "answers": [
      {
        "question_id": "ecf10361-a1a7-4bf8-8555-e20bc9dad094",
        "selected_option_id": "0ee7d2ae-ac00-4a5e-952c-12db87e96936"
      },
      {
        "question_id": "c1d43208-8b57-4137-a4df-9630ea3e7f62",
        "selected_option_id": "9175a0fb-25e4-43fa-96d7-0823f0d935f6"
      }
    ]
  }'
```

**Response includes:**
- **Auto-graded score** (percentage)
- **Correct answer count**
- **Time spent**
- **Detailed answers** with correct/incorrect flags
- **Correct answers** shown for learning
- **Explanations** (if provided by teacher)

#### 5. View Quiz Results

```bash
# Get specific attempt with results
curl -X GET http://localhost:8000/api/v1/quiz/attempts/{attempt_id}/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"

# Get all my attempts (quiz history)
curl -X GET http://localhost:8000/api/v1/quiz/attempts/my_attempts/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id"
```

---

## Complete Flow Examples

### Teacher Flow: Create and Publish Quiz

```bash
# 1. Login as teacher
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: teacher-device" \
  -d '{"username": "teacher", "password": "password"}' \
  -s | jq -r '.access')

# 2. Create quiz
QUIZ_RESPONSE=$(curl -X POST http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: teacher-device" \
  -d '{
    "title": "Python Quiz",
    "category": "category-uuid",
    "time_type": "limit",
    "time_value": 30,
    "time_unit": "minute",
    "questions": [
      {
        "question_type": "multiple_choice",
        "prompt": "What is 2+2?",
        "order": 1,
        "options": [
          {"label": "A", "text": "3", "is_correct": false},
          {"label": "B", "text": "4", "is_correct": true}
        ]
      }
    ]
  }' -s)

QUIZ_ID=$(echo "$QUIZ_RESPONSE" | jq -r '.id')
echo "Quiz created: $QUIZ_ID"

# 3. Publish quiz
curl -X PATCH "http://localhost:8000/api/v1/quiz/quizzes/$QUIZ_ID/publish/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Device-ID: teacher-device"

echo "Quiz published successfully"
```

---

### Student Flow: Take Quiz and View Results

```bash
# 1. Login as student
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: student-device" \
  -d '{"username": "student", "password": "password"}' \
  -s | jq -r '.access')

# 2. Browse quizzes
curl -X GET "http://localhost:8000/api/v1/quiz/quizzes/?category=uuid" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Device-ID: student-device"

# 3. Start quiz attempt
QUIZ_ID="655bddbf-aa6e-4f06-8ebe-1d9cfe141386"

ATTEMPT_RESPONSE=$(curl -X POST http://localhost:8000/api/v1/quiz/attempts/start/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: student-device" \
  -d "{\"quiz_id\": \"$QUIZ_ID\"}" \
  -s)

ATTEMPT_ID=$(echo "$ATTEMPT_RESPONSE" | jq -r '.attempt.id')
echo "Started attempt: $ATTEMPT_ID"

# 4. Submit answers
curl -X POST "http://localhost:8000/api/v1/quiz/attempts/$ATTEMPT_ID/submit/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: student-device" \
  -d '{
    "answers": [
      {
        "question_id": "question-uuid-1",
        "selected_option_id": "option-uuid-b"
      },
      {
        "question_id": "question-uuid-2",
        "text_answer": "Your essay answer here"
      }
    ]
  }'

# 5. View results
curl -X GET "http://localhost:8000/api/v1/quiz/attempts/$ATTEMPT_ID/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Device-ID: student-device"

# 6. View quiz history
curl -X GET "http://localhost:8000/api/v1/quiz/attempts/my_attempts/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Device-ID: student-device"
```

---

## Error Responses

### 400 Bad Request

**Validation errors:**
```json
{
  "code": "validation_error",
  "message": "Validation failed",
  "details": {
    "time_value": ["Time value is required when time type is \"limit\""],
    "questions": [
      {
        "options": ["Multiple-choice questions must have exactly one correct answer"]
      }
    ]
  }
}
```

**Cannot publish quiz without questions:**
```json
{
  "code": "validation_error",
  "message": "Cannot publish quiz without questions",
  "details": {
    "questions": ["Quiz must have at least one question"]
  }
}
```

**Time expired:**
```json
{
  "error": "Quiz time has expired"
}
```

**Already submitted:**
```json
{
  "error": "Attempt is already completed"
}
```

### 403 Forbidden

**Student trying to create quiz:**
```json
{
  "code": 403,
  "message": "You do not have permission to perform this action."
}
```

**Teacher trying to take quiz:**
```json
{
  "error": "Teachers cannot take quizzes"
}
```

**Submit someone else's attempt:**
```json
{
  "error": "You can only submit your own attempts"
}
```

### 404 Not Found

```json
{
  "code": 404,
  "message": "Not found."
}
```

---

## Media Upload

To upload media files for questions (images, audio):

**Using multipart/form-data:**

```bash
# Create quiz with media question
curl -X POST http://localhost:8000/api/v1/quiz/quizzes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Device-ID: device-id" \
  -F "title=Image Quiz" \
  -F "category=uuid" \
  -F "time_type=none" \
  -F "questions[0][question_type]=multiple_choice" \
  -F "questions[0][prompt]=Identify this Python library" \
  -F "questions[0][media]=@/path/to/image.jpg" \
  -F "questions[0][options][0][label]=A" \
  -F "questions[0][options][0][text]=NumPy" \
  -F "questions[0][options][0][is_correct]=true"
```

**Media Files:**
- Stored in `MEDIA_ROOT/quiz/questions/`
- Accessed via `media_url` field in response
- Supports images and audio files

---

## Grading Logic

### Weighted Scoring System

**NEW**: Each question has individual `score` points (default 1.0).

**Calculation:**
```
total_score = Sum of scores for correct answers
max_score = Sum of all question scores
percentage = (total_score / max_score) × 100
```

**Example:**
```
Quiz with 3 questions:
- Q1 (MCQ): 1 point  ✅ Correct → +1
- Q2 (MCQ): 3 points ❌ Wrong   → +0
- Q3 (Text): 5 points ✅ Correct → +5

Result: 6/9 points = 66.67%
```

### Multiple-Choice Questions
✅ **Auto-graded**
- Compares `selected_option.is_correct` with correct answer
- If correct: adds `question.score` points to `total_score`
- Instantly shows if correct/incorrect
- Shows correct answer after submission

### Text-Input Questions
✅ **Auto-graded with exact matching**

**Matching Rules:**
1. **Case-sensitive**: "Python" ≠ "python"
2. **Space normalization**: 
   - Trim leading/trailing spaces
   - Collapse multiple spaces to single space
   - `"  Python   web  "` → `"Python web"`
3. **Exact match** with sample answer required

**Examples:**
```
Sample answer: "Version control system"

✅ "Version control system" → Correct
✅ "  Version   control    system  " → Correct (spaces normalized)
❌ "version control system" → Wrong (case mismatch)
❌ "Version control" → Wrong (not exact)
```

**Grading:**
- If student answer matches sample (after normalization): adds `question.score` points
- If no match or no sample answer: 0 points

**Note**: Ensure sample answers are set for accurate auto-grading of text questions.

### Essay Questions
⏸️ **Manually graded by teacher**

**Workflow:**
1. **Student submits essay** → Creates `EssayGrading` record with `status='pending'`
2. **Teacher reviews** → Reads essay in dashboard
3. **Teacher grades** → Assigns score (0 to max_score) and feedback
4. **Quiz score updates** → Total score automatically recalculated

**Features:**
- Teacher can provide detailed feedback
- Teacher can correct student's answer (optional)
- Score must be within 0 to question.score range
- Supports partial credit (e.g., 7.5/10)

**Student View:**
- Before grading: Shows "Pending review" status
- After grading: Shows score, feedback, and corrected answer (if provided)

**Teacher Dashboard:**
- `/api/v1/quiz/essay-gradings/needs_grading/` - List pending essays
- `/api/v1/quiz/essay-gradings/{id}/grade/` - Grade specific essay
- `/api/v1/quiz/attempts/recent_submissions/?needs_grading=true` - Quiz attempts with pending essays

---

## Time Limit Behavior

### Timed Quizzes (`time_type=limit`)
- Timer starts when attempt is created
- `time_remaining_seconds` shows countdown
- Frontend should display timer
- Submission after time expires returns error
- Auto-expires in-progress attempts

### Untimed Quizzes (`time_type=none`)
- No time limit
- `time_remaining_seconds` is null
- Student can take as long as needed

---

## Best Practices

### For Teachers

1. **Always add explanations** to questions for better learning
2. **Use sample answers** for text-input questions to guide students
3. **Test quiz before publishing** to ensure quality
4. **Set appropriate time limits** based on question count
5. **Use categories and chapters** for organization

### For Students

1. **Read all options carefully** before selecting
2. **Watch the timer** for timed quizzes
3. **Review results** to learn from mistakes
4. **Check explanations** for better understanding

### For Developers

1. **Always validate** question types and options
2. **Handle time expiration** gracefully on frontend
3. **Show correct answers** only after submission
4. **Implement retry logic** for network errors during submission
5. **Cache quiz data** to avoid re-fetching during attempt

---

## Testing

### Run All Quiz Tests

```bash
# Run all tests
docker compose exec web python manage.py test src.quiz

# Run specific test class
docker compose exec web python manage.py test src.quiz.tests.QuizAPITests

# Run with coverage
docker compose exec web coverage run --source='src.quiz' manage.py test src.quiz
docker compose exec web coverage report
```

### Manual Testing Checklist

**Teacher:**
- [ ] Create quiz with multiple-choice questions
- [ ] Create quiz with text-input questions
- [ ] Create mixed quiz
- [ ] Update quiz (add/remove questions)
- [ ] Publish quiz
- [ ] Unpublish quiz
- [ ] Delete quiz
- [ ] View my quizzes

**Student:**
- [ ] List published quizzes
- [ ] View quiz details
- [ ] Start quiz attempt
- [ ] Submit all correct answers (expect 100%)
- [ ] Submit mixed answers (expect calculated %)
- [ ] View attempt results
- [ ] View quiz history
- [ ] Try to submit after time expires (expect error)
- [ ] Try to submit twice (expect error)

---

## Database Schema

```sql
-- Quiz table
CREATE TABLE quiz_quiz (
    id uuid PRIMARY KEY,
    title varchar(200) NOT NULL,
    description text,
    category_id uuid REFERENCES courses_category(id),
    chapter_id uuid REFERENCES courses_chapter(id),
    created_by_id bigint REFERENCES accounts_user(id),
    time_type varchar(10) DEFAULT 'none',
    time_value integer,
    time_unit varchar(10) DEFAULT 'minute',
    is_published boolean DEFAULT false,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

-- Quiz question table
CREATE TABLE quiz_quizquestion (
    id uuid PRIMARY KEY,
    quiz_id uuid REFERENCES quiz_quiz(id) ON DELETE CASCADE,
    question_type varchar(20) NOT NULL,
    prompt text NOT NULL,
    explanation text,
    media varchar(100),
    order integer NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    UNIQUE (quiz_id, order)
);

-- Quiz option table (multiple-choice only)
CREATE TABLE quiz_quizoption (
    id uuid PRIMARY KEY,
    question_id uuid REFERENCES quiz_quizquestion(id) ON DELETE CASCADE,
    label varchar(1) NOT NULL,
    text varchar(500) NOT NULL,
    is_correct boolean NOT NULL,
    UNIQUE (question_id, label)
);

-- Quiz answer table (text-input only)
CREATE TABLE quiz_quizanswer (
    id uuid PRIMARY KEY,
    question_id uuid UNIQUE REFERENCES quiz_quizquestion(id) ON DELETE CASCADE,
    text text NOT NULL
);

-- Quiz attempt table
CREATE TABLE quiz_quizattempt (
    id uuid PRIMARY KEY,
    quiz_id uuid REFERENCES quiz_quiz(id) ON DELETE CASCADE,
    student_id bigint REFERENCES accounts_user(id) ON DELETE CASCADE,
    status varchar(20) DEFAULT 'in_progress',
    started_at timestamptz NOT NULL,
    completed_at timestamptz,
    time_spent_seconds integer DEFAULT 0,
    score numeric(5,2),
    correct_answers integer DEFAULT 0,
    total_questions integer DEFAULT 0
);

-- Student answer table
CREATE TABLE quiz_studentanswer (
    id uuid PRIMARY KEY,
    attempt_id uuid REFERENCES quiz_quizattempt(id) ON DELETE CASCADE,
    question_id uuid REFERENCES quiz_quizquestion(id) ON DELETE CASCADE,
    selected_option_id uuid REFERENCES quiz_quizoption(id) ON DELETE CASCADE,
    text_answer text DEFAULT '',
    is_correct boolean DEFAULT false,
    answered_at timestamptz NOT NULL,
    UNIQUE (attempt_id, question_id)
);
```

---

## API Response Codes

| Code | Description | When |
|------|-------------|------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST (create) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, expired time |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Changelog

### Version 3.0.0 (2025-10-19)

**Added:**
- ✨ **Essay question type**: New question type for long-form written answers
- ✨ **Manual grading system**: `EssayGrading` model for teacher grading workflow
- ✨ **Teacher dashboard APIs**: View and manage student submissions
- ✨ **Pending grading queue**: Track essays waiting for teacher review
- ✨ **Grading with feedback**: Teachers can score essays and provide detailed feedback
- ✨ **Answer correction**: Teachers can optionally correct student answers
- ✨ **Auto-recalculation**: Quiz scores automatically update after essay grading

**New Endpoints:**
- `GET /api/v1/quiz/attempts/recent_submissions/` - Recent student submissions
- `GET /api/v1/quiz/attempts/by_classroom/` - Submissions by classroom
- `GET /api/v1/quiz/essay-gradings/needs_grading/` - Pending essays for grading
- `GET /api/v1/quiz/essay-gradings/pending/` - All pending essays
- `POST /api/v1/quiz/essay-gradings/{id}/grade/` - Grade an essay
- `GET /api/v1/quiz/essay-gradings/my_gradings/` - Teacher's graded essays

**Changed:**
- 🔄 QuizQuestion: Added `essay` to question_type choices
- 🔄 StudentAnswer: Renamed `text_answer` to `answer_text` for consistency
- 🔄 Quiz scoring: Now accounts for pending essay gradings
- 🔄 Teacher dashboard: Enhanced with grading workflow

**New Models:**
- `EssayGrading`: Tracks essay submissions and teacher grading

**Features:**
- Teachers see pending essay count in dashboard
- Students see "Pending review" status for ungraded essays
- Partial credit support for essay questions
- Bulk view of pending essays across all classrooms
- Filter by classroom for targeted grading

---

### Version 2.0.0 (2025-10-13)

**Added:**
- ✨ **Weighted scoring system**: Each question has individual score points
- ✨ **Text exact matching**: Auto-grade text-input with case-sensitive exact match
- ✨ **Space normalization**: Automatically trim and collapse spaces for text answers
- ✨ **Lesson-based quizzes**: Migrated from chapter to lesson linkage
- ✨ **Enhanced scoring metrics**: `total_score`, `max_score`, `percentage`

**Changed:**
- 🔄 Quiz model: `chapter` → `lesson` (FK to courses.Lesson)
- 🔄 QuizQuestion: Added `score` field (default 1.0)
- 🔄 QuizAttempt: Added `total_score` and `max_score` fields
- 🔄 Score calculation: Now based on weighted points instead of question count
- 🔄 Text-input grading: Exact match instead of "any answer"
- 🔄 Endpoint: `/by_chapter/` → `/by_lesson/`

**Improved:**
- Better text answer validation (case-sensitive, space-normalized)
- More accurate scoring with weighted questions
- Enhanced API responses with detailed score breakdown
- Admin interface shows score column

**Migration:**
- Auto-migrated existing quizzes from chapter to lesson (first lesson in chapter)
- All existing questions default to score=1.0
- All existing attempts get `total_score=0`, `max_score=0` (will recalculate)

---

### Version 1.0.0 (2025-10-12)

**Added:**
- Quiz management for teachers (CRUD operations)
- Quiz attempt system for students
- Auto-grading for multiple-choice questions
- Time limit support
- Publish/unpublish workflow
- Nested serializers for efficient quiz creation
- Comprehensive validation
- Admin interface
- Full documentation

**Models:**
- Quiz, QuizQuestion, QuizOption, QuizAnswer
- QuizAttempt, StudentAnswer

**Endpoints:**
- 10 teacher endpoints
- 4 student endpoints

**Features:**
- Auto-increment question order
- Time remaining calculation
- Score calculation
- Sample answers for text questions
- Media upload support
- Filtering and search

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


Tất cả các yêu cầu của bạn đã được implement đầy đủ:

### ✅ **1. Get list quiz học sinh đã làm gần đây**
```http
GET /api/v1/quiz/attempts/recent_submissions/
```
- Trả về danh sách quiz attempts gần đây từ học sinh trong lớp của giáo viên
- Support filter: `?status=completed`, `?classroom_id=xxx`, `?needs_grading=true`
- Có field `has_pending_essays` để biết quiz nào có essay chưa chấm

### ✅ **2. Get list quiz học sinh đã làm theo lớp**
```http
GET /api/v1/quiz/attempts/by_classroom/?classroom_id={uuid}
```
- Trả về tất cả quiz attempts của học sinh trong lớp cụ thể
- Filter theo quiz: `?quiz_id=xxx`
- Verify teacher phải là owner của classroom đó

### ✅ **3. Quiz có câu tự luận → status pending**
- Khi student submit essay, tự động tạo `EssayGrading` với `grading_status='pending'`
- API `recent_submissions` có field `has_pending_essays=true` để highlight
- API `needs_grading` chỉ trả pending essays

### ✅ **4. Giáo viên xem danh sách pending**
```http
GET /api/v1/quiz/essay-gradings/needs_grading/
```
- Chỉ hiện essays từ học sinh trong lớp của giáo viên
- Filter theo classroom: `?classroom_id=xxx`
- Thông tin đầy đủ: student name, question, answer, quiz title

### ✅ **5. Giáo viên bấm vào → nhập đáp án sửa → cho điểm**
```http
POST /api/v1/quiz/essay-gradings/{id}/grade/
```
**Request:**
```json
{
  "score": 8.5,                          // Cho điểm
  "feedback": "Good work!",              // Comment
  "corrected_answer": "Corrected text"  // Sửa đáp án (optional)
}
```

**Tính năng:**
- ✅ Validate score (0 ≤ score ≤ max_score)
- ✅ Cập nhật `grading_status` từ `pending` → `graded`
- ✅ Nếu có `corrected_answer`, sẽ update đáp án của học sinh
- ✅ Tự động tính lại tổng điểm quiz attempt
- ✅ Set `graded_at` timestamp

### 📊 **Bonus Features (đã có):**
- `GET /api/v1/quiz/essay-gradings/my_gradings/` - Xem bài mình đã chấm
- `GET /api/v1/quiz/essay-gradings/pending/` - Tất cả bài pending
- `GET /api/v1/quiz/essay-gradings/{id}/` - Chi tiết 1 bài chấm

### 🎯 **Workflow hoàn chỉnh:**

1. **Dashboard admin** → `recent_submissions?needs_grading=true`
2. **Chọn lớp** → `by_classroom?classroom_id=xxx`  
3. **Xem pending essays** → `needs_grading?classroom_id=xxx`
4. **Click vào essay** → `GET essay-gradings/{id}/` (xem chi tiết)
5. **Nhập điểm + sửa** → `POST essay-gradings/{id}/grade/`
6. **Quiz score tự động update** ✅

### 📝 **Documentation:**
- ✅ Full API docs: `docs/QUIZ_API.md`
- ✅ Quick guide: `README_ESSAY_QUIZ.md`
- ✅ Test script: `test_essay_quiz_flow.sh`

---

## 🎉 **KẾT LUẬN: ĐÃ ĐỦ TẤT CẢ!**

Tất cả các tính năng bạn yêu cầu đã được implement và test thành công. Giáo viên có thể:
- ✅ Xem quiz gần đây của học sinh
- ✅ Xem quiz theo từng lớp
- ✅ Thấy status "pending" cho quiz có essay chưa chấm
- ✅ Vào chi tiết essay để đọc
- ✅ Sửa đáp án của học sinh
- ✅ Cho điểm và feedback
- ✅ Tự động cập nhật tổng điểm quiz

Hệ thống sẵn sàng để sử dụng! 🚀