# New Quiz Auto-Save & Auto-Check API Documentation

## Overview

New Quiz system hỗ trợ **auto-save** và **auto-check** (hiển thị kết quả ngay) cho từng câu hỏi. Học sinh có thể:
- ✅ Làm từng câu và lưu ngay (không cần làm hết mới lưu)
- ✅ Xem kết quả đúng/sai ngay lập tức cho câu trắc nghiệm và text-input
- ✅ Refresh trang (F5) mà không mất dữ liệu đã làm (nếu còn thời gian quiz)
- ✅ Submit quiz mà không cần gửi lại tất cả answers

## Table of Contents

1. [Workflow](#workflow)
2. [Auto-Save Answer](#auto-save-answer)
3. [Auto-Check Results](#auto-check-results)
4. [Retrieve Attempt (Resume Session)](#retrieve-attempt-resume-session)
5. [Submit Quiz](#submit-quiz)
6. [Frontend Integration](#frontend-integration)
7. [Examples](#examples)

---

## Workflow

```
1. Start Quiz Attempt
   POST /api/v1/new_quiz/attempts/start/
   
2. Save Answer (Làm câu nào lưu câu đó)
   POST /api/v1/new_quiz/attempts/{id}/save-answer/
   → Auto-check và trả về is_correct ngay
   
3. (Optional) Refresh Page (F5)
   GET /api/v1/new_quiz/attempts/{id}/
   → Load lại các answers đã lưu
   
4. Submit Quiz
   POST /api/v1/new_quiz/attempts/{id}/submit/
   → Complete attempt, tính điểm cuối cùng
```

---

## Auto-Save Answer

**Endpoint**: `POST /api/v1/new_quiz/attempts/{attempt_id}/save-answer/`

**Description**: Lưu một câu trả lời và tự động kiểm tra (cho MCQ và text-input).

**Permission**: Authenticated (chỉ owner của attempt)

**Path Parameters:**
- `attempt_id`: UUID (required) - ID của quiz attempt

**Request Body:**
```json
{
  "question_id": "uuid-of-question",
  "selected_option_id": "uuid-of-option",  // Cho MCQ
  "text_answer": "Your answer here",       // Cho text-input hoặc essay
  "attachment_url": "https://..."          // (Optional) Cho essay questions
}
```

**Validation:**
- **MCQ**: Bắt buộc `selected_option_id`, không được có `text_answer` hoặc `attachment_url`
- **Text-input**: Bắt buộc `text_answer`, không được có `selected_option_id` hoặc `attachment_url`
- **Essay**: Cần `text_answer` hoặc `attachment_url` (hoặc cả hai), không được có `selected_option_id`

**Response 200 OK:**
```json
{
  "message": "Answer saved successfully",
  "answer": {
    "id": "uuid",
    "question": "uuid",
    "question_prompt": "What is 2 + 2?",
    "question_type": "multiple_choice",
    "selected_option": "uuid",
    "selected_option_text": "4",
    "text_answer": "",
    "is_correct": true,
    "correct_answer": {
      "label": "B",
      "text": "4"
    },
    "answered_at": "2025-01-20T10:30:00Z"
  },
  "is_correct": true,
  "auto_graded": true
}
```

**Response Fields:**
- `answer`: Chi tiết answer đã lưu (đầy đủ thông tin, bao gồm `correct_answer` nếu auto-graded)
- `is_correct`: Boolean - Kết quả đúng/sai (chỉ có cho MCQ và text-input, `null` cho essay)
- `auto_graded`: Boolean - Có được auto-check không (true cho MCQ/text-input, false cho essay)

**Auto-Check Behavior:**
- ✅ **Multiple Choice**: Check ngay khi lưu → `is_correct = true/false`
- ✅ **Text Input**: Check ngay khi lưu (exact match) → `is_correct = true/false`
- ⏸️ **Essay**: Không auto-check → `is_correct = null`, cần teacher chấm

**Error Responses:**

`400 Bad Request` - Validation error:
```json
{
  "question_id": ["Question not found"],
  "selected_option_id": ["Selected option is required for multiple-choice questions"]
}
```

`400 Bad Request` - Time expired:
```json
{
  "error": "Quiz time has expired"
}
```

`403 Forbidden` - Not owner:
```json
{
  "error": "You can only save answers to your own attempts"
}
```

`400 Bad Request` - Attempt already completed:
```json
{
  "error": "Cannot save answer. Attempt is already completed"
}
```

---

## Auto-Check Results

### Immediate Feedback

Khi gọi `save-answer` endpoint, response sẽ trả về:
- ✅ `is_correct`: Boolean (true/false) cho MCQ và text-input
- ✅ `correct_answer`: Đáp án đúng (hiển thị ngay, không cần chờ submit)

### Response Structure

**For MCQ (Multiple Choice):**
```json
{
  "is_correct": true,
  "auto_graded": true,
  "answer": {
    "correct_answer": {
      "label": "B",
      "text": "4"
    },
    "selected_option_text": "4",
    "is_correct": true
  }
}
```

**For Text Input:**
```json
{
  "is_correct": false,
  "auto_graded": true,
  "answer": {
    "correct_answer": {
      "text": "Paris"
    },
    "text_answer": "paris",
    "is_correct": false
  }
}
```

**For Essay:**
```json
{
  "is_correct": null,
  "auto_graded": false,
  "answer": {
    "correct_answer": null,  // Essay không có "correct answer"
    "text_answer": "My essay answer...",
    "is_correct": false  // Mặc định false cho đến khi teacher chấm
  }
}
```

---

## Retrieve Attempt (Resume Session)

**Endpoint**: `GET /api/v1/new_quiz/attempts/{attempt_id}/`

**Description**: Lấy thông tin attempt và các answers đã lưu. Dùng để resume session khi user refresh trang (F5).

**Permission**: Authenticated (chỉ owner hoặc admin/teacher)

**Path Parameters:**
- `attempt_id`: UUID (required) - ID của quiz attempt

**Response 200 OK:**
```json
{
  "id": "attempt-uuid",
  "quiz": "quiz-uuid",
  "quiz_title": "Python Basics Quiz",
  "student": 16,
  "student_name": "John Student",
  "status": "in_progress",
  "started_at": "2025-01-20T10:00:00Z",
  "completed_at": null,
  "time_spent_seconds": 300,
  "total_score": 15.0,
  "max_score": 30.0,
  "score": 50.0,
  "correct_answers": 3,
  "total_questions": 5,
  "time_remaining_seconds": 1500,
  "has_pending_essays": false,
  "answers": [
    {
      "id": "answer-uuid-1",
      "question": "question-uuid-1",
      "question_prompt": "What is 2 + 2?",
      "question_type": "multiple_choice",
      "selected_option": "option-uuid",
      "selected_option_text": "4",
      "text_answer": "",
      "is_correct": true,
      "correct_answer": {
        "label": "B",
        "text": "4"
      },
      "answered_at": "2025-01-20T10:05:00Z"
    },
    {
      "id": "answer-uuid-2",
      "question": "question-uuid-2",
      "question_prompt": "What is the capital of France?",
      "question_type": "text_input",
      "selected_option": null,
      "text_answer": "Paris",
      "is_correct": true,
      "correct_answer": {
        "text": "Paris"
      },
      "answered_at": "2025-01-20T10:06:00Z"
    }
  ]
}
```

**Key Points:**
- ✅ `answers` array chứa tất cả các answers đã lưu
- ✅ Mỗi answer có `is_correct` và `correct_answer` (cho MCQ/text-input) ngay cả khi attempt đang `in_progress`
- ✅ Frontend có thể restore UI state từ `answers` array

**Resume Flow:**
1. User làm quiz → Lưu các answers
2. User refresh trang (F5) hoặc đóng tab
3. Frontend gọi `GET /attempts/{id}/` khi user quay lại
4. Frontend restore answers từ response và hiển thị lại các câu đã làm
5. User tiếp tục làm các câu còn lại

---

## Submit Quiz

**Endpoint**: `POST /api/v1/new_quiz/attempts/{attempt_id}/submit/`

**Description**: Hoàn thành quiz attempt. Tất cả answers đã được lưu qua `save-answer` endpoint, nên không cần gửi lại answers.

**Permission**: Authenticated (chỉ owner của attempt)

**Path Parameters:**
- `attempt_id`: UUID (required) - ID của quiz attempt

**Request Body:**
```json
{}
```
(Không cần gửi gì, hoặc empty object)

**Response 200 OK:**
```json
{
  "message": "Quiz submitted successfully",
  "attempt": {
    "id": "attempt-uuid",
    "quiz": "quiz-uuid",
    "status": "completed",
    "started_at": "2025-01-20T10:00:00Z",
    "completed_at": "2025-01-20T10:30:00Z",
    "time_spent_seconds": 1800,
    "total_score": 25.0,
    "max_score": 30.0,
    "score": 83.33,
    "correct_answers": 5,
    "total_questions": 6,
    "answers": [...]
  },
  "results": {
    "total_score": 25.0,
    "max_score": 30.0,
    "percentage": 83.33,
    "correct_answers": 5,
    "total_questions": 6,
    "formatted": "25.0/30.0 (83.3%)"
  }
}
```

**Submit Process:**
1. Recalculate scores từ tất cả saved answers
2. Mark attempt status = `completed`
3. Set `completed_at` timestamp
4. Calculate final score và percentage
5. Return complete results

**Error Responses:**

`400 Bad Request` - Already completed:
```json
{
  "error": "Attempt is already completed"
}
```

`400 Bad Request` - Time expired:
```json
{
  "error": "Quiz time has expired"
}
```

---

## Frontend Integration

### Auto-Save Implementation

```javascript
// Example: Save answer when user selects an option
async function saveAnswer(attemptId, questionId, selectedOptionId) {
  try {
    const response = await fetch(
      `/api/v1/new_quiz/attempts/${attemptId}/save-answer/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_option_id: selectedOptionId,
        }),
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      // Show immediate feedback
      if (data.is_correct) {
        showSuccess('✓ Correct!');
      } else {
        showError('✗ Incorrect');
        // Show correct answer
        showCorrectAnswer(data.answer.correct_answer);
      }
      
      // Update UI
      updateQuestionStatus(questionId, {
        answered: true,
        is_correct: data.is_correct,
        correct_answer: data.answer.correct_answer,
      });
    }
  } catch (error) {
    console.error('Failed to save answer:', error);
  }
}
```

### Resume Session on Page Load

```javascript
// Restore quiz state when page loads
async function resumeQuiz(attemptId) {
  try {
    const response = await fetch(
      `/api/v1/new_quiz/attempts/${attemptId}/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const attempt = await response.json();
    
    // Restore saved answers
    attempt.answers.forEach(answer => {
      restoreAnswer(answer);
    });
    
    // Update progress indicator
    updateProgress(attempt.correct_answers, attempt.total_questions);
    
    // Update timer
    if (attempt.time_remaining_seconds) {
      startTimer(attempt.time_remaining_seconds);
    }
  } catch (error) {
    console.error('Failed to resume quiz:', error);
  }
}
```

### Submit Quiz

```javascript
// Submit quiz (no need to send answers again)
async function submitQuiz(attemptId) {
  try {
    const response = await fetch(
      `/api/v1/new_quiz/attempts/${attemptId}/submit/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      // Show results
      showResults(data.results);
      // Redirect to results page
      window.location.href = `/quiz-results/${attemptId}/`;
    }
  } catch (error) {
    console.error('Failed to submit quiz:', error);
  }
}
```

### Auto-Save on Change

```javascript
// Auto-save when user changes answer
function setupAutoSave(attemptId, questionId) {
  const selectElement = document.querySelector(
    `[data-question-id="${questionId}"]`
  );
  
  selectElement.addEventListener('change', (e) => {
    const selectedOptionId = e.target.value;
    
    // Debounce: Wait 500ms after user stops typing/clicking
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      saveAnswer(attemptId, questionId, selectedOptionId);
    }, 500);
  });
}
```

---

## Examples

### Example 1: Complete Flow

```bash
# 1. Start quiz
curl -X POST "http://localhost:8000/api/v1/new_quiz/attempts/start/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quiz_id": "quiz-uuid"}'

# Response: { "attempt": { "id": "attempt-uuid", ... } }

# 2. Save answer 1 (MCQ)
curl -X POST "http://localhost:8000/api/v1/new_quiz/attempts/attempt-uuid/save-answer/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "question-1-uuid",
    "selected_option_id": "option-correct-uuid"
  }'

# Response: {
#   "is_correct": true,
#   "auto_graded": true,
#   "answer": { "correct_answer": {...}, ... }
# }

# 3. Save answer 2 (Text Input)
curl -X POST "http://localhost:8000/api/v1/new_quiz/attempts/attempt-uuid/save-answer/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "question-2-uuid",
    "text_answer": "Paris"
  }'

# 4. Refresh attempt (simulate F5)
curl -X GET "http://localhost:8000/api/v1/new_quiz/attempts/attempt-uuid/" \
  -H "Authorization: Bearer TOKEN"

# Response: { "answers": [...2 answers...], ... }

# 5. Submit quiz
curl -X POST "http://localhost:8000/api/v1/new_quiz/attempts/attempt-uuid/submit/" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example 2: Handling Wrong Answer

```javascript
// User selects wrong answer
await saveAnswer(attemptId, questionId, wrongOptionId);

// Response: { "is_correct": false, ... }

// Frontend shows:
// - ✗ Incorrect (red indicator)
// - Correct answer: "B. 4" (highlighted in green)
// - User can change answer and save again

// User changes to correct answer
await saveAnswer(attemptId, questionId, correctOptionId);

// Response: { "is_correct": true, ... }

// Frontend updates:
// - ✓ Correct (green indicator)
// - Score updates automatically
```

### Example 3: Partial Save Before Submit

```javascript
// User only answers 3 out of 5 questions
await saveAnswer(attemptId, q1Id, optionId1); // ✓
await saveAnswer(attemptId, q2Id, optionId2); // ✓
await saveAnswer(attemptId, q3Id, optionId3); // ✗

// User submits without answering q4 and q5
await submitQuiz(attemptId);

// Response:
// {
//   "results": {
//     "correct_answers": 2,
//     "total_questions": 5,
//     "total_score": 20.0,
//     "max_score": 50.0,
//     "percentage": 40.0
//   }
// }

// Unanswered questions count as incorrect (0 points)
```

---

## Comparison with Old Submit-All Flow

### Old Flow (Submit All Answers at Once)
```
Start → Do all questions → Submit all answers → Get results
```
❌ Risk: Lose all progress if page refreshed  
❌ No immediate feedback  
❌ Must complete all questions before submit

### New Flow (Auto-Save per Question)
```
Start → Save question 1 → See result → Save question 2 → See result → ... → Submit
```
✅ Auto-save: Progress preserved  
✅ Immediate feedback: Know right/wrong instantly  
✅ Can submit anytime: Even if not all questions answered  
✅ Resume session: Refresh page without losing data

---

## Best Practices

### 1. Auto-Save Timing
- ✅ Save immediately when user selects/enters answer
- ✅ Debounce saves for text-input (wait 500ms after user stops typing)
- ✅ Show saving indicator while request is in progress

### 2. Error Handling
- ✅ Handle network errors gracefully (retry save)
- ✅ Show error message if save fails
- ✅ Keep answer in UI even if save fails (user can retry)

### 3. UI/UX
- ✅ Show visual indicator for:
  - Questions answered (✓ or ✗)
  - Questions not answered (gray/unanswered)
  - Current score/progress
- ✅ Highlight correct answer after user answers
- ✅ Allow user to change answer (will update score automatically)

### 4. Performance
- ✅ Batch saves if user answers multiple questions quickly
- ✅ Cache attempt data locally (localStorage) for offline resilience
- ✅ Sync with server when connection restored

---

## Notes

1. **Essay Questions**: Không được auto-check, cần teacher chấm. `is_correct` sẽ là `false` cho đến khi teacher chấm điểm.

2. **Time Limit**: Nếu quiz có time limit và đã hết giờ:
   - `save-answer` sẽ return error "Quiz time has expired"
   - Attempt sẽ tự động chuyển sang status `expired`

3. **Score Calculation**: Score được tính real-time mỗi khi save answer:
   - `attempt.total_score`: Tổng điểm đã đạt được
   - `attempt.correct_answers`: Số câu đúng
   - Có thể hiển thị progress bar dựa trên `correct_answers / total_questions`

4. **Resume Session**: Khi retrieve attempt, `answers` array chứa tất cả answers đã lưu. Frontend có thể:
   - Restore selected options
   - Show correct/incorrect indicators
   - Display correct answers for reviewed questions
   - Continue from where user left off