# Research: New Quiz Play Flow for Students

**Feature**: 003-new-quiz-play  
**Date**: 2025-01-20  
**Status**: Complete

## Research Tasks

### 1. Auto-Save Patterns and Debouncing

**Task**: Research best practices for auto-saving user input with debouncing, especially for text inputs in quiz/assessment contexts.

**Findings**:

**Decision**: Use debounced auto-save for text inputs (500ms delay after user stops typing), immediate save for multiple-choice selections.

**Rationale**: 
- Text inputs benefit from debouncing to avoid excessive API calls while user is typing
- Multiple-choice selections are discrete events, so immediate save provides better UX
- 500ms is a standard debounce delay that balances responsiveness with API efficiency
- Backend API supports per-question saves (`/api/v1/new_quiz/attempts/{id}/save-answer/`)

**Alternatives Considered**:
- Immediate save for all inputs: Would cause too many API calls for text inputs
- Longer debounce (1000ms+): Would feel sluggish and delay feedback
- Batch saving: More complex, doesn't provide immediate feedback per question

**Implementation Notes**:
- Use Vue's `watch` with debounce utility from `@vueuse/core` or custom debounce function
- Show "Saving..." indicator during save operations
- Handle save errors gracefully with retry logic

---

### 2. Timer Implementation Patterns

**Task**: Research best practices for implementing countdown timers in web applications, especially for quiz/assessment contexts with auto-submit on expiration.

**Findings**:

**Decision**: Use `setInterval` with 1-second updates, sync with server time on page load/resume, handle browser tab visibility changes.

**Rationale**:
- `setInterval` is reliable for countdown timers in browser
- 1-second granularity is sufficient for user display (format as MM:SS)
- Server time sync ensures accuracy even if client clock drifts
- Handle tab visibility to pause/resume timer appropriately (optional enhancement)

**Alternatives Considered**:
- Web Workers: Overkill for simple countdown, adds complexity
- RequestAnimationFrame: Designed for animations, not timers
- Server-side only: Would require constant polling, inefficient

**Implementation Notes**:
- Store `time_remaining_seconds` from server response
- Update timer every 1 second, decrementing `timeRemaining` ref
- When timer reaches 0, automatically call submit function
- On page resume, use `time_remaining_seconds` from server response
- Format display as "MM:SS" (e.g., "15:30" for 15 minutes 30 seconds)

---

### 3. Session Resume Patterns

**Task**: Research best practices for resuming user sessions after page refresh, especially for in-progress quiz attempts.

**Findings**:

**Decision**: Retrieve attempt data from server on page load using attempt ID, restore all saved answers and UI state from server response.

**Rationale**:
- Server is source of truth for attempt state and saved answers
- Backend API provides `/api/v1/new_quiz/attempts/{id}/` endpoint that returns full attempt with answers
- Server response includes `is_correct` and `correct_answer` for auto-graded questions, enabling immediate UI restoration
- No need for complex client-side state management if server provides complete state

**Alternatives Considered**:
- localStorage only: Would lose data if cleared, not reliable
- Hybrid (localStorage + server): Adds complexity, server is sufficient
- URL parameters: Limited data capacity, not secure for sensitive data

**Implementation Notes**:
- On page load, check if attempt ID exists (from URL or route params)
- Call `getAttempt(attemptId)` to retrieve attempt data
- Restore answers from `attempt.answers` array
- Restore timer from `attempt.time_remaining_seconds`
- Restore question navigation state (current question index)
- Show visual indicators for answered questions based on `is_correct` status

---

### 4. Error Handling and Retry Strategies

**Task**: Research best practices for handling network errors during auto-save operations, including retry logic and user feedback.

**Findings**:

**Decision**: Implement exponential backoff retry (3 attempts), show error message to user, preserve answer locally for manual retry, allow user to continue working.

**Rationale**:
- Network errors are transient in most cases, retry can resolve them
- Exponential backoff prevents overwhelming server during outages
- User should be informed but not blocked from continuing
- Local preservation allows manual retry if auto-retry fails

**Alternatives Considered**:
- No retry: Poor UX, user must manually retry every error
- Infinite retry: Could overwhelm server, user might not notice persistent errors
- Queue all saves: Adds complexity, immediate feedback is better UX

**Implementation Notes**:
- Retry failed saves up to 3 times with exponential backoff (1s, 2s, 4s)
- Show error toast/notification on save failure
- Store failed answers in local state for manual retry
- Allow user to manually retry failed saves via UI button
- Continue allowing user to answer other questions even if one save fails
- On submit, ensure all answers are saved (retry any failed saves before submitting)

---

### 5. Immediate Feedback Display Patterns

**Task**: Research best practices for displaying immediate feedback (correct/incorrect) for auto-gradable questions in quiz interfaces.

**Findings**:

**Decision**: Show visual indicators (checkmark/X, color coding) immediately after save response, display correct answer for incorrect responses, allow answer modification.

**Rationale**:
- Immediate feedback enhances learning (formative assessment)
- Visual indicators are clear and non-intrusive
- Showing correct answer helps learning even when wrong
- Allowing modification enables learning from mistakes

**Alternatives Considered**:
- No feedback until submit: Reduces learning opportunity
- Popup/modal feedback: Intrusive, interrupts flow
- Sound feedback: Can be annoying, accessibility concerns

**Implementation Notes**:
- For correct answers: Show green checkmark, highlight answer in green
- For incorrect answers: Show red X, highlight answer in red, show correct answer in green
- For essay questions: No immediate feedback (requires teacher grading)
- Update score and progress indicators immediately after feedback
- Allow user to change answer (will trigger new save and update feedback)

---

### 6. Question Navigation Patterns

**Task**: Research best practices for navigating between questions in quiz interfaces, including progress indicators and question list.

**Findings**:

**Decision**: Provide next/previous buttons, question list/number navigation, progress bar showing answered/unanswered status, visual indicators for question status.

**Rationale**:
- Multiple navigation methods accommodate different user preferences
- Progress indicators reduce anxiety and help users plan time
- Visual status indicators (answered/unanswered/correct/incorrect) provide at-a-glance overview

**Alternatives Considered**:
- Linear only (next only): Too restrictive, users can't review
- Question list only: Can be overwhelming for long quizzes
- No progress indicator: Increases anxiety, poor UX

**Implementation Notes**:
- Implement question index state management
- Provide next/previous navigation buttons
- Show question numbers (e.g., "Question 3 of 10")
- Display progress bar (answered/total questions)
- Show question list with status indicators:
  - Gray/unanswered: Not answered
  - Green/checkmark: Answered correctly
  - Red/X: Answered incorrectly
  - Yellow/pending: Essay question (pending grading)
- Allow direct navigation to any question via question list

---

## Summary

All research tasks completed. Key decisions:
1. **Auto-save**: Debounced (500ms) for text, immediate for MCQ
2. **Timer**: `setInterval` with 1s updates, sync with server
3. **Session resume**: Retrieve from server on page load
4. **Error handling**: Exponential backoff retry (3 attempts), local preservation
5. **Feedback**: Immediate visual indicators with correct answer display
6. **Navigation**: Multiple methods (next/prev/list) with progress indicators

No unresolved clarifications. Ready for Phase 1 design.

