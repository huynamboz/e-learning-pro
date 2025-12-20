# Data Model: Standalone Quiz Management

**Feature**: Standalone Quiz Management
**Date**: 2025-01-15

## Entities

### Level

Organizational entity for grouping standalone quizzes (e.g., A1, A2, B1, B2). Independent of course levels.

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `code`: String (max 20 chars, unique, required) - e.g., "A1", "A2", "B1"
- `name`: String (max 100 chars, required) - e.g., "Beginner A1"
- `order`: Positive Integer (required) - Display order (lower numbers appear first)
- `description`: Text (optional) - Description of the level
- `is_active`: Boolean (default: True) - Whether level is visible/active
- `created_at`: DateTime (auto-generated)
- `updated_at`: DateTime (auto-updated)

**Validation Rules**:
- `code` must be unique across all levels
- `code` cannot be null or empty
- `name` cannot be null or empty
- `order` must be a positive integer

**Relationships**:
- One-to-Many with `NewQuiz` (one level has many quizzes)

**State Transitions**:
- `is_active: true` → `is_active: false`: Level is hidden from selection (existing quizzes remain)
- `is_active: false` → `is_active: true`: Level becomes available for selection

---

### NewQuiz (Standalone Quiz)

Main quiz entity independent of courses/lessons, organized by Level.

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `title`: String (max 200 chars, required)
- `description`: Text (optional)
- `level`: UUID (foreign key to Level, required, NOT NULL)
- `level_code`: String (computed/denormalized) - Level code for display
- `level_name`: String (computed/denormalized) - Level name for display
- `time_type`: Enum (`limit` | `none`, required)
- `time_value`: Positive Integer (nullable, required if `time_type=limit`)
- `time_unit`: Enum (`minute` | `second`, nullable, required if `time_type=limit`)
- `time_limit_display`: String (computed) - Human-readable time limit
- `is_published`: Boolean (default: False) - Controls student visibility
- `retake_limit`: Positive Integer (default: 1) - Maximum attempts allowed
- `total_questions`: Integer (computed) - Number of questions in quiz
- `time_limit_in_seconds`: Integer (computed) - Time limit converted to seconds
- `created_by`: UUID (foreign key to User, required) - Teacher/admin who created it
- `created_by_name`: String (computed/denormalized) - Creator's name for display
- `created_at`: DateTime (auto-generated)
- `updated_at`: DateTime (auto-updated)

**Validation Rules**:
- `level` is required (cannot be null)
- `time_type=limit` requires both `time_value` and `time_unit`
- `time_type=none` requires `time_value` and `time_unit` to be null
- `retake_limit` must be at least 1
- Quiz must have at least one question to be published
- `title` cannot be null or empty

**Relationships**:
- Many-to-One with `Level` (many quizzes belong to one level)
- Many-to-One with `User` (created_by)
- One-to-Many with `NewQuizQuestion` (one quiz has many questions)
- One-to-Many with `NewQuizAttempt` (one quiz has many student attempts)

**State Transitions**:
- `is_published: false` → `is_published: true`: Quiz becomes visible to students (requires at least one question)
- `is_published: true` → `is_published: false`: Quiz is hidden from students
- Level can be changed: Quiz moves to different level organization

**Computed Properties**:
- `total_questions`: Count of associated questions
- `time_limit_in_seconds`: Convert `time_value` and `time_unit` to seconds
- `time_limit_display`: Format as "30 minutes" or "1800 seconds"

---

### NewQuizQuestion

Individual questions within a standalone quiz.

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `quiz`: UUID (foreign key to NewQuiz, required)
- `question_type`: Enum (`multiple_choice` | `text_input` | `essay`, required)
- `prompt`: Text (required) - The question itself
- `explanation`: Text (optional) - Shown after submission
- `media`: URL (optional) - Public URL for attachment (image, audio, video)
- `order`: Positive Integer (required, auto-increments) - Display order
- `score`: Decimal (default: 1.0, required) - Points for this question
- `created_at`: DateTime (auto-generated)
- `updated_at`: DateTime (auto-updated)

**Validation Rules**:
- `quiz` is required
- `question_type` must be one of the three allowed values
- `prompt` cannot be null or empty
- `order` must be unique within a quiz
- `score` must be positive

**Relationships**:
- Many-to-One with `NewQuiz` (many questions belong to one quiz)
- One-to-Many with `NewQuizOption` (for multiple_choice questions)
- One-to-One with `NewQuizSampleAnswer` (for text_input questions)
- One-to-Many with `NewStudentAnswer` (many student answers for one question)

**Question Type Specifics**:
- **multiple_choice**: Must have at least 2 options, exactly one correct option
- **text_input**: Must have one sample answer for auto-grading
- **essay**: No options or sample answers required (manual grading)

---

### NewQuizOption

Answer options for multiple choice questions.

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `question`: UUID (foreign key to NewQuizQuestion, required)
- `label`: String (max 10 chars, required) - e.g., "A", "B", "C"
- `text`: String (required) - Option text
- `is_correct`: Boolean (required) - Whether this is the correct answer
- `order`: Positive Integer (optional) - Display order

**Validation Rules**:
- `question` is required
- `label` must be unique within a question
- At least one option must have `is_correct: true` per question
- Exactly one option should have `is_correct: true` (enforced by business logic)

**Relationships**:
- Many-to-One with `NewQuizQuestion` (many options belong to one question)

---

### NewQuizSampleAnswer

Sample answers for text input questions (used for auto-grading).

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `question`: UUID (foreign key to NewQuizQuestion, required, unique)
- `text`: String (required) - The correct answer text

**Validation Rules**:
- `question` is required
- `text` cannot be null or empty
- One sample answer per text input question

**Relationships**:
- One-to-One with `NewQuizQuestion` (one sample answer per text input question)

---

### NewQuizAttempt

Student submissions for standalone quizzes.

**Fields**:
- `id`: UUID (primary key, auto-generated)
- `quiz`: UUID (foreign key to NewQuiz, required)
- `student`: UUID (foreign key to User, required)
- `status`: Enum (`in_progress` | `completed` | `expired`, required)
- `started_at`: DateTime (required)
- `completed_at`: DateTime (nullable)
- `time_spent_seconds`: Integer (computed)
- `total_score`: Decimal (computed)
- `max_score`: Decimal (computed)
- `score`: String (nullable) - Percentage or formatted score
- `correct_answers`: Integer (computed)
- `total_questions`: Integer (computed)
- `time_remaining_seconds`: Integer (nullable) - For timed quizzes

**Validation Rules**:
- `quiz` must be published
- Student must not exceed `retake_limit` for the quiz
- `status` transitions: `in_progress` → `completed` or `expired`

**Relationships**:
- Many-to-One with `NewQuiz` (many attempts for one quiz)
- Many-to-One with `User` (student who made the attempt)
- One-to-Many with `NewStudentAnswer` (one attempt has many answers)

**Note**: While not directly managed in this admin feature, attempts affect quiz deletion rules (quizzes with attempts may need special handling).

---

## Data Flow

### Quiz Creation Flow
1. Admin selects Level (required)
2. Admin enters quiz details (title, description, time settings, retake limit)
3. Admin adds questions (with type-specific requirements)
4. System validates: Level required, questions present, time settings valid
5. Quiz created with `is_published: false` by default
6. Quiz appears in list under selected Level

### Quiz Update Flow
1. Admin selects quiz to edit
2. Admin can modify: title, description, Level, time settings, retake limit, questions
3. System validates changes
4. If Level changed, quiz moves to new Level organization
5. If questions removed and quiz was published, system may auto-unpublish or warn

### Quiz Deletion Flow
1. Admin initiates deletion
2. System checks for existing attempts
3. If attempts exist: Show warning or prevent deletion (business rule)
4. If no attempts: Delete quiz and all associated questions/options/answers
5. Quiz removed from list

### Publish/Unpublish Flow
1. Admin clicks "Publish" on unpublished quiz
2. System validates: Quiz must have at least one question
3. If valid: Set `is_published: true`, quiz becomes visible to students
4. If invalid: Show error message, prevent publication
5. Unpublish: Set `is_published: false`, quiz hidden from students

## Constraints and Business Rules

1. **Level Requirement**: Every standalone quiz MUST have a Level (cannot be null)
2. **Publish Validation**: Quiz can only be published if it has at least one question
3. **Time Settings**: If `time_type=limit`, both `time_value` and `time_unit` are required
4. **Retake Limit**: Must be at least 1 (no zero or negative values)
5. **Question Types**:
   - Multiple choice: Must have at least 2 options, exactly one correct
   - Text input: Must have one sample answer
   - Essay: No special requirements (manual grading)
6. **Deletion**: Quizzes with existing student attempts may need special handling (warn, prevent, or archive)
7. **Level Independence**: Levels are independent of course levels (separate entity)

## API Integration Points

All entities are managed through `/api/v1/new_quiz/` endpoints:
- Levels: `/api/v1/new_quiz/levels/`
- Quizzes: `/api/v1/new_quiz/quizzes/`
- Questions: Managed as part of quiz create/update payload
- Options/Sample Answers: Managed as part of question payload

See `contracts/new-quiz-api.yaml` for detailed API specifications.
