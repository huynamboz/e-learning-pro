# Feature Specification: New Quiz Play Flow for Students

**Feature Branch**: `003-new-quiz-play`  
**Created**: 2025-01-20  
**Status**: Draft  
**Input**: User description: "phân tích flow play quiz mới cho student và implement, đây là docs backend gửi tôi @docs/quiz_auto_save.md @docs/new_quiz.md , bấm bắt đầu ở đây để play quiz @pages/quizz.vue"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start and Complete Quiz with Auto-Save (Priority: P1)

A student browses available quizzes on the quiz listing page, selects a quiz, and completes it with automatic saving of each answer. The system provides immediate feedback for auto-gradable questions (multiple choice and text input) while the student is working.

**Why this priority**: This is the core user journey - students must be able to start and complete quizzes. Auto-save ensures progress is never lost, and immediate feedback enhances learning.

**Independent Test**: Can be fully tested by starting a quiz, answering questions one by one, seeing immediate feedback for correct/incorrect answers, and submitting the quiz. This delivers the complete quiz-taking experience with progress preservation.

**Acceptance Scenarios**:

1. **Given** a student is viewing the quiz listing page (`/quizz`), **When** they click "Bắt đầu" (Start) on a published quiz, **Then** the system starts a new quiz attempt and navigates to the quiz play page
2. **Given** a student has started a quiz attempt, **When** they select an answer for a multiple-choice question, **Then** the answer is automatically saved and the system immediately shows whether the answer is correct or incorrect
3. **Given** a student has started a quiz attempt, **When** they enter text for a text-input question, **Then** the answer is automatically saved (with debounce) and the system immediately shows whether the answer is correct or incorrect
4. **Given** a student has answered all questions they want to answer, **When** they click the submit button, **Then** the quiz is completed, final score is calculated, and results are displayed
5. **Given** a quiz has a time limit, **When** the student is taking the quiz, **Then** a countdown timer is displayed showing remaining time, and the quiz auto-submits when time expires

---

### User Story 2 - Resume Quiz Session After Page Refresh (Priority: P2)

A student accidentally refreshes the page or closes the browser while taking a quiz. When they return, all their saved answers are restored, and they can continue from where they left off (if time remains).

**Why this priority**: Prevents frustration and data loss. Students should not lose progress due to accidental page refreshes or browser crashes.

**Independent Test**: Can be fully tested by starting a quiz, answering some questions, refreshing the page (F5), and verifying that all previous answers are restored with their correct/incorrect status. This delivers resilience and user confidence.

**Acceptance Scenarios**:

1. **Given** a student has started a quiz and saved answers to at least one question, **When** they refresh the page (F5), **Then** the quiz attempt is retrieved from the server, all saved answers are restored, and the student can continue from where they left off
2. **Given** a student has an in-progress quiz attempt, **When** they navigate to the quiz play page using the attempt ID, **Then** the system loads the attempt data and restores all saved answers with their feedback status
3. **Given** a student refreshes the page during a timed quiz, **When** the attempt is restored, **Then** the timer continues from the remaining time, not from the start

---

### User Story 3 - Handle Essay Questions with Manual Grading (Priority: P2)

A student encounters essay questions in a quiz. These questions cannot be auto-graded, so the student can save their answer but will not see immediate feedback. The answer is saved for teacher review.

**Why this priority**: Essay questions are a core question type. Students need to be able to answer them, even though feedback is delayed until teacher grading.

**Independent Test**: Can be fully tested by starting a quiz with essay questions, entering text answers, saving them, and verifying that the answers are saved but no immediate correct/incorrect feedback is shown. This delivers support for all question types.

**Acceptance Scenarios**:

1. **Given** a quiz contains essay questions, **When** a student enters text for an essay question and saves it, **Then** the answer is saved but no immediate correct/incorrect feedback is displayed (since essay requires teacher grading)
2. **Given** a student has answered essay questions, **When** they submit the quiz, **Then** the quiz is marked as completed with pending essay grading, and the student can see their score for auto-graded questions only
3. **Given** a student has saved an essay answer, **When** they refresh the page, **Then** the essay answer text is restored so they can continue editing if needed

---

### User Story 4 - Navigate Between Questions and View Progress (Priority: P3)

A student can navigate between questions in any order, see which questions have been answered, view their current progress, and see their running score as they answer questions.

**Why this priority**: Enhances user experience by allowing flexible navigation and providing clear progress indicators. Students can review and change answers before submitting.

**Independent Test**: Can be fully tested by starting a quiz, navigating between questions using next/previous buttons or a question list, and verifying that progress indicators update correctly. This delivers navigation flexibility and progress visibility.

**Acceptance Scenarios**:

1. **Given** a student is taking a quiz with multiple questions, **When** they navigate to the next or previous question, **Then** the question changes and the progress indicator updates
2. **Given** a student has answered some questions, **When** they view the question list or progress bar, **Then** answered questions are visually distinguished from unanswered questions
3. **Given** a student is taking a quiz, **When** they answer auto-gradable questions, **Then** their current score and number of correct answers are displayed and update in real-time
4. **Given** a student wants to review their answers, **When** they navigate to a previously answered question, **Then** their saved answer is displayed and they can modify it (which will update the score)

---

### Edge Cases

- What happens when a student tries to start a quiz but has exceeded the retake limit?
- How does the system handle network errors when auto-saving answers? (Should retry, show error message, preserve answer locally)
- What happens when a student tries to submit a quiz that has already been completed?
- How does the system handle time expiration during answer save operations?
- What happens if a student tries to access a quiz attempt that doesn't belong to them?
- How does the system handle quiz attempts that were started but the quiz was later unpublished?
- What happens when a student answers a question, then changes their answer before submitting?
- How does the system handle browser back/forward navigation during a quiz?
- What happens if a student has multiple browser tabs open with the same quiz attempt?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated students to start a new quiz attempt from the quiz listing page by clicking "Bắt đầu" (Start) button
- **FR-002**: System MUST automatically save each answer when a student selects an option (for multiple-choice) or enters text (for text-input/essay) with appropriate debouncing for text inputs
- **FR-003**: System MUST immediately display correct/incorrect feedback for multiple-choice and text-input questions after saving the answer
- **FR-004**: System MUST NOT display immediate feedback for essay questions (as they require teacher grading)
- **FR-005**: System MUST allow students to navigate between questions in any order (next, previous, or direct selection)
- **FR-006**: System MUST display a progress indicator showing answered vs unanswered questions
- **FR-007**: System MUST display and update a running score (total points earned and percentage) as students answer auto-gradable questions
- **FR-008**: System MUST display a countdown timer for quizzes with time limits, showing remaining time in a readable format (e.g., "15:30" for 15 minutes 30 seconds)
- **FR-009**: System MUST automatically submit the quiz when the time limit expires
- **FR-010**: System MUST allow students to submit the quiz at any time, even if not all questions are answered
- **FR-011**: System MUST retrieve and restore all saved answers when a student refreshes the page or returns to an in-progress attempt
- **FR-012**: System MUST preserve the correct/incorrect status and correct answer information for restored answers
- **FR-013**: System MUST allow students to modify previously saved answers, which will update the score automatically
- **FR-014**: System MUST display quiz results (score, percentage, correct answers count) after submission
- **FR-015**: System MUST prevent students from starting a new attempt if they have exceeded the quiz's retake limit
- **FR-016**: System MUST handle network errors gracefully when saving answers (show error message, allow retry, preserve answer locally)
- **FR-017**: System MUST validate that quiz attempts belong to the current student before allowing access
- **FR-018**: System MUST prevent access to quiz attempts for quizzes that are no longer published (unless the attempt was already started)
- **FR-019**: System MUST show visual indicators (e.g., checkmark for correct, X for incorrect, gray for unanswered) for each question's status
- **FR-020**: System MUST display the correct answer for questions that have been answered and auto-graded

### Key Entities *(include if feature involves data)*

- **Quiz Attempt**: Represents a student's session taking a quiz. Contains attempt ID, quiz reference, status (in_progress/completed/expired), start time, time remaining, current score, and list of saved answers.
- **Saved Answer**: Represents a student's answer to a single question. Contains question ID, answer content (selected option ID for MCQ, text for text-input/essay), is_correct status (for auto-graded questions), correct_answer information, and timestamp.
- **Question**: Represents a quiz question. Contains question type (multiple_choice, text_input, essay), prompt text, options (for MCQ), and scoring information.
- **Quiz Results**: Represents the final outcome after quiz submission. Contains total score, max score, percentage, number of correct answers, total questions, and status of essay grading (if applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can start a quiz attempt from the listing page and begin answering questions within 3 seconds of clicking "Bắt đầu"
- **SC-002**: Answer auto-save completes successfully for 95% of save operations within 2 seconds
- **SC-003**: Students can successfully resume a quiz session after page refresh, with 100% of previously saved answers restored correctly
- **SC-004**: 90% of students can complete a quiz (start to submit) without encountering blocking errors
- **SC-005**: Immediate feedback (correct/incorrect) is displayed within 1 second of saving an answer for auto-gradable questions
- **SC-006**: Quiz submission completes successfully within 5 seconds for quizzes with up to 50 questions
- **SC-007**: Timer accuracy is maintained within 1 second of actual elapsed time for the duration of the quiz
- **SC-008**: Students can navigate between questions and view progress indicators without noticeable delay (under 500ms)
- **SC-009**: System handles network interruptions gracefully, with 90% of interrupted save operations successfully retried and completed
- **SC-010**: Students report satisfaction score of at least 4 out of 5 for the quiz-taking experience (based on user feedback surveys)

## Assumptions

- Students are authenticated before accessing the quiz play page
- The backend API endpoints for new quiz system are available and functional (`/api/v1/new_quiz/attempts/start/`, `/api/v1/new_quiz/attempts/{id}/save-answer/`, `/api/v1/new_quiz/attempts/{id}/`, `/api/v1/new_quiz/attempts/{id}/submit/`)
- Quiz data (questions, options, correct answers) are provided by the backend API
- Browser localStorage or similar client-side storage is available for temporary answer caching during network issues
- Students have a stable internet connection for the majority of the quiz-taking session (network errors are edge cases)
- The quiz listing page (`/quizz`) already exists and displays published quizzes with "Bắt đầu" buttons
- The route `/quizz/{quiz_id}` will be used for the quiz play page (matching the link in the listing page)
- Essay questions require teacher grading, so immediate feedback is not possible (this is expected behavior, not a limitation)

## Dependencies

- Backend API must support the new quiz attempt endpoints (start, save-answer, retrieve, submit) as documented in `docs/quiz_auto_save.md` and `docs/new_quiz.md`
- Backend must validate retake limits and prevent starting new attempts when limit is exceeded
- Backend must handle time limit enforcement and auto-expiration of attempts
- Authentication system must be functional to identify the current student
- Quiz listing page (`/quizz`) must pass the correct quiz ID when navigating to the play page

## Out of Scope

- Teacher grading interface for essay questions (separate feature)
- Quiz results page with detailed breakdown (assumed to exist or be separate feature)
- Leaderboard display (separate feature)
- Quiz attempt history viewing (separate feature)
- Offline quiz-taking mode (network is required)
- Real-time collaboration or multi-user quiz sessions
- Quiz attempt analytics or reporting for teachers
