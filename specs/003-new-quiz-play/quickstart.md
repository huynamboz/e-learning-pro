# Quick Start: New Quiz Play Flow

**Feature**: 003-new-quiz-play  
**Date**: 2025-01-20

## Overview

This guide helps developers quickly understand and implement the new quiz play flow for students. The feature enables students to take standalone quizzes with auto-save, immediate feedback, and session resume capabilities.

## Key Concepts

1. **Auto-Save**: Answers are saved automatically as students answer questions (no need to wait until submit)
2. **Immediate Feedback**: MCQ and text-input questions show correct/incorrect status immediately after saving
3. **Session Resume**: Students can refresh the page without losing progress (answers restored from server)
4. **Timer**: Timed quizzes display countdown and auto-submit when time expires

## Implementation Steps

### 1. Extend useNewQuizApi Composable

Add attempt management methods to `composables/api/useNewQuizApi.ts`:

```typescript
// Add to useNewQuizApi return object:

// Start quiz attempt
startAttempt: (quizId: string) =>
  apiClient.post<{ message: string; attempt: QuizAttempt }>(
    '/new_quiz/attempts/start/',
    { quiz_id: quizId }
  ),

// Save answer (auto-save)
saveAnswer: (attemptId: string, answerData: SaveAnswerRequest) =>
  apiClient.post<SaveAnswerResponse>(
    `/new_quiz/attempts/${attemptId}/save-answer/`,
    answerData
  ),

// Get attempt (for resume)
getAttempt: (attemptId: string) =>
  apiClient.get<QuizAttempt>(`/new_quiz/attempts/${attemptId}/`),

// Submit attempt
submitAttempt: (attemptId: string) =>
  apiClient.post<SubmitResponse>(
    `/new_quiz/attempts/${attemptId}/submit/`,
    {}
  ),
```

### 2. Create Quiz Play Page

Create `pages/quizz/[id].vue`:

```vue
<script setup lang="ts">
// 1. Get quiz ID from route params
const route = useRoute()
const quizId = route.params.id as string

// 2. Load quiz details
const { getQuiz } = useNewQuizApi()
const quiz = ref<NewQuizDetail | null>(null)

// 3. Start or resume attempt
const { startAttempt, getAttempt, saveAnswer, submitAttempt } = useNewQuizApi()
const attempt = ref<QuizAttempt | null>(null)
const attemptId = ref<string | null>(null)

// 4. State management
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, any>>({})
const timeRemaining = ref<number | null>(null)

// 5. Load quiz and start/resume attempt
onMounted(async () => {
  await loadQuiz()
  await startOrResumeAttempt()
})

// Implementation details in full component...
</script>
```

### 3. Implement Auto-Save

For multiple-choice questions:
```typescript
async function handleMCQAnswer(questionId: string, optionId: string) {
  // Update local state immediately
  answers.value[questionId] = optionId
  
  // Save to server
  if (attemptId.value) {
    try {
      const response = await saveAnswer(attemptId.value, {
        question_id: questionId,
        selected_option_id: optionId
      })
      
      // Show immediate feedback
      if (response.is_correct) {
        showSuccessFeedback(questionId)
      } else {
        showErrorFeedback(questionId, response.answer.correct_answer)
      }
      
      // Update score
      updateScore(response.answer)
    } catch (error) {
      handleSaveError(questionId, error)
    }
  }
}
```

For text-input questions (with debounce):
```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSaveTextAnswer = useDebounceFn(async (questionId: string, text: string) => {
  if (attemptId.value) {
    await saveAnswer(attemptId.value, {
      question_id: questionId,
      text_answer: text
    })
  }
}, 500)

function handleTextAnswer(questionId: string, text: string) {
  answers.value[questionId] = text
  debouncedSaveTextAnswer(questionId, text)
}
```

### 4. Implement Timer

```typescript
let timerInterval: NodeJS.Timeout | null = null

function startTimer() {
  if (timeRemaining.value && timeRemaining.value > 0) {
    timerInterval = setInterval(() => {
      if (timeRemaining.value && timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        handleTimeExpired()
      }
    }, 1000)
  }
}

function handleTimeExpired() {
  stopTimer()
  submitQuiz() // Auto-submit when time expires
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
```

### 5. Implement Session Resume

```typescript
async function startOrResumeAttempt() {
  // Check if attempt ID exists in URL (from previous session)
  const urlAttemptId = route.query.attempt as string | undefined
  
  if (urlAttemptId) {
    // Resume existing attempt
    await resumeAttempt(urlAttemptId)
  } else {
    // Start new attempt
    await startNewAttempt()
  }
}

async function resumeAttempt(attemptId: string) {
  try {
    const attemptData = await getAttempt(attemptId)
    attempt.value = attemptData
    attemptId.value = attemptId
    
    // Restore answers
    attemptData.answers.forEach(answer => {
      if (answer.question_type === 'multiple_choice') {
        answers.value[answer.question] = answer.selected_option
      } else {
        answers.value[answer.question] = answer.text_answer
      }
    })
    
    // Restore timer
    if (attemptData.time_remaining_seconds) {
      timeRemaining.value = attemptData.time_remaining_seconds
      startTimer()
    }
    
    // Restore question index (optional: could remember last question)
    // currentQuestionIndex.value = ...
  } catch (error) {
    // Handle error (attempt not found, expired, etc.)
    console.error('Failed to resume attempt:', error)
    await startNewAttempt()
  }
}
```

### 6. Implement Submit

```typescript
async function submitQuiz() {
  if (!attemptId.value) return
  
  try {
    const response = await submitAttempt(attemptId.value)
    
    // Show results
    showResults(response.results)
    
    // Navigate to results page or show completion dialog
    navigateTo(`/quizz/${quizId}/results?attempt=${attemptId.value}`)
  } catch (error) {
    // Handle error
    console.error('Failed to submit quiz:', error)
  }
}
```

### 7. Error Handling

```typescript
async function handleSaveError(questionId: string, error: any) {
  // Show error message to user
  showErrorToast('Failed to save answer. Retrying...')
  
  // Retry with exponential backoff
  let retries = 0
  const maxRetries = 3
  
  while (retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
    
    try {
      // Retry save
      await saveAnswer(attemptId.value!, answers.value[questionId])
      showSuccessToast('Answer saved successfully')
      return
    } catch (retryError) {
      retries++
    }
  }
  
  // If all retries failed, show error and allow manual retry
  showErrorToast('Failed to save answer. Please try again.')
  // Store failed answer for manual retry button
}
```

## Component Structure

```
pages/quizz/[id].vue (Main page)
├── components/learning/new-quiz/
│   ├── NewQuizPlayer.vue (Main container)
│   │   ├── NewQuizTimer.vue (Timer display)
│   │   ├── NewQuizProgress.vue (Progress bar)
│   │   ├── NewQuizQuestion.vue (Question display)
│   │   │   └── NewQuizAnswerInput.vue (Answer input)
│   │   └── NewQuizNavigation.vue (Next/Prev buttons)
│   └── NewQuizResults.vue (Results after submit)
```

## Key Files to Create/Modify

1. **Extend**: `composables/api/useNewQuizApi.ts` - Add attempt methods
2. **Create**: `pages/quizz/[id].vue` - Quiz play page
3. **Create**: `components/learning/new-quiz/NewQuizPlayer.vue` - Main player component
4. **Create**: `components/learning/new-quiz/NewQuizQuestion.vue` - Question component
5. **Create**: `components/learning/new-quiz/NewQuizAnswerInput.vue` - Answer input component
6. **Create**: `components/learning/new-quiz/NewQuizTimer.vue` - Timer component
7. **Create**: `components/learning/new-quiz/NewQuizProgress.vue` - Progress component
8. **Create**: `components/learning/new-quiz/NewQuizResults.vue` - Results component

## Testing Checklist

- [ ] Start quiz attempt successfully
- [ ] Save MCQ answer and see immediate feedback
- [ ] Save text-input answer (with debounce) and see immediate feedback
- [ ] Save essay answer (no immediate feedback)
- [ ] Navigate between questions
- [ ] See progress indicator update
- [ ] See score update in real-time
- [ ] Timer counts down correctly
- [ ] Timer auto-submits when expired
- [ ] Refresh page and resume session
- [ ] Submit quiz successfully
- [ ] Handle network errors gracefully
- [ ] Retry failed saves
- [ ] Prevent starting if retake limit exceeded

## Common Pitfalls

1. **Not debouncing text inputs**: Causes excessive API calls
2. **Not handling timer on page resume**: Timer should sync with server time
3. **Not restoring answers on resume**: Must restore from server, not localStorage
4. **Not handling network errors**: Should retry and show user feedback
5. **Not validating attempt ownership**: Backend handles this, but frontend should handle 403 errors gracefully

## Next Steps

1. Review the full specification in `spec.md`
2. Review the data model in `data-model.md`
3. Review API contracts in `contracts/new-quiz-attempt-api.yaml`
4. Review research findings in `research.md`
5. Start implementation following this quick start guide

