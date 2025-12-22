# Tasks: New Quiz Play Flow for Students

**Input**: Design documents from `/specs/003-new-quiz-play/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in specification, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Following Nuxt 3 structure with `composables/`, `pages/`, `components/`, `types/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for new quiz components in components/learning/new-quiz/
- [x] T002 Create types directory structure if needed for quiz attempt types in types/
- [x] T003 [P] Review existing useNewQuizApi composable structure in composables/api/useNewQuizApi.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extend useNewQuizApi composable with TypeScript interfaces for QuizAttempt and SavedAnswer in composables/api/useNewQuizApi.ts
- [x] T005 [P] Add startAttempt method to useNewQuizApi composable in composables/api/useNewQuizApi.ts
- [x] T006 [P] Add saveAnswer method to useNewQuizApi composable in composables/api/useNewQuizApi.ts
- [x] T007 [P] Add getAttempt method to useNewQuizApi composable in composables/api/useNewQuizApi.ts
- [x] T008 [P] Add submitAttempt method to useNewQuizApi composable in composables/api/useNewQuizApi.ts
- [x] T009 Create TypeScript types for QuizAttempt, SavedAnswer, and QuizResults in types/quiz.type.ts or create new-quiz.type.ts

**Checkpoint**: Foundation ready - API composable methods are available for all user stories

---

## Phase 3: User Story 1 - Start and Complete Quiz with Auto-Save (Priority: P1) 🎯 MVP

**Goal**: Students can start a quiz, answer questions with auto-save, see immediate feedback for auto-gradable questions, and submit the quiz. Timer functionality for timed quizzes.

**Independent Test**: Start a quiz from listing page, answer multiple-choice and text-input questions, see immediate feedback, submit quiz. Verify auto-save works and timer counts down correctly.

### Implementation for User Story 1

- [x] T010 [US1] Create quiz play page route structure in pages/quizz/[id].vue
- [x] T011 [US1] Implement quiz loading logic in pages/quizz/[id].vue (load quiz details using getQuiz)
- [x] T012 [US1] Implement start attempt logic in pages/quizz/[id].vue (call startAttempt on page load)
- [x] T013 [US1] Create NewQuizPlayer main component in components/learning/new-quiz/NewQuizPlayer.vue
- [x] T014 [US1] Create NewQuizQuestion component for displaying questions in components/learning/new-quiz/NewQuizQuestion.vue
- [x] T015 [US1] Create NewQuizAnswerInput component for MCQ answers in components/learning/new-quiz/NewQuizAnswerInput.vue
- [x] T016 [US1] Implement immediate save for MCQ answers in components/learning/new-quiz/NewQuizAnswerInput.vue (call saveAnswer on option select)
- [x] T017 [US1] Implement immediate feedback display for MCQ in components/learning/new-quiz/NewQuizAnswerInput.vue (show correct/incorrect after save response)
- [x] T018 [US1] Extend NewQuizAnswerInput component for text-input questions in components/learning/new-quiz/NewQuizAnswerInput.vue
- [x] T019 [US1] Implement debounced auto-save for text-input answers in components/learning/new-quiz/NewQuizAnswerInput.vue (500ms debounce using @vueuse/core)
- [x] T020 [US1] Implement immediate feedback display for text-input in components/learning/new-quiz/NewQuizAnswerInput.vue (show correct/incorrect after save response)
- [x] T021 [US1] Create NewQuizTimer component for timed quizzes in components/learning/new-quiz/NewQuizTimer.vue
- [x] T022 [US1] Implement countdown timer logic in components/learning/new-quiz/NewQuizTimer.vue (setInterval with 1s updates)
- [x] T023 [US1] Implement timer display formatting (MM:SS) in components/learning/new-quiz/NewQuizTimer.vue
- [x] T024 [US1] Implement auto-submit when timer expires in pages/quizz/[id].vue (call submitAttempt when timeRemaining reaches 0)
- [x] T025 [US1] Create NewQuizProgress component for progress tracking in components/learning/new-quiz/NewQuizProgress.vue
- [x] T026 [US1] Implement progress calculation and display in components/learning/new-quiz/NewQuizProgress.vue (answered/total questions)
- [x] T027 [US1] Implement score calculation and display in pages/quizz/[id].vue (update from attempt.total_score and attempt.correct_answers)
- [x] T028 [US1] Implement submit quiz functionality in pages/quizz/[id].vue (call submitAttempt, handle response)
- [x] T029 [US1] Create NewQuizResults component for displaying results in components/learning/new-quiz/NewQuizResults.vue
- [x] T030 [US1] Implement results display after submission in components/learning/new-quiz/NewQuizResults.vue (show score, percentage, correct answers)
- [x] T031 [US1] Integrate all components in main quiz play page in pages/quizz/[id].vue
- [x] T032 [US1] Add error handling for start attempt failures in pages/quizz/[id].vue (retake limit exceeded, quiz not published)
- [x] T033 [US1] Add error handling for save answer failures in components/learning/new-quiz/NewQuizAnswerInput.vue (network errors, time expired)

**Checkpoint**: At this point, User Story 1 should be fully functional - students can start quiz, answer questions with auto-save, see feedback, and submit. Timer works for timed quizzes.

---

## Phase 4: User Story 2 - Resume Quiz Session After Page Refresh (Priority: P2)

**Goal**: Students can refresh the page or return to an in-progress quiz without losing progress. All saved answers are restored with their correct/incorrect status.

**Independent Test**: Start a quiz, answer some questions, refresh page (F5), verify all answers are restored with feedback status. Timer should continue from remaining time.

### Implementation for User Story 2

- [x] T034 [US2] Implement attempt ID persistence in URL query parameter in pages/quizz/[id].vue (store attempt ID in route query)
- [x] T035 [US2] Implement resume attempt logic on page load in pages/quizz/[id].vue (check for attempt ID in query, call getAttempt)
- [x] T036 [US2] Implement answer restoration from attempt.answers array in pages/quizz/[id].vue (restore MCQ and text-input answers to local state)
- [x] T037 [US2] Implement feedback status restoration in components/learning/new-quiz/NewQuizAnswerInput.vue (restore is_correct and correct_answer from saved answers)
- [x] T038 [US2] Implement timer restoration from attempt.time_remaining_seconds in components/learning/new-quiz/NewQuizTimer.vue (restore and continue countdown)
- [x] T039 [US2] Implement question navigation state restoration in pages/quizz/[id].vue (optional: remember last question index)
- [x] T040 [US2] Add error handling for resume failures in pages/quizz/[id].vue (attempt not found, expired, unauthorized - fallback to start new attempt)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - students can start quiz, answer questions, refresh page, and continue seamlessly.

---

## Phase 5: User Story 3 - Handle Essay Questions with Manual Grading (Priority: P2)

**Goal**: Students can answer essay questions, save their answers, but do not see immediate feedback (requires teacher grading). Essay answers are saved and restored on page refresh.

**Independent Test**: Start a quiz with essay questions, enter text answers, save them, verify no immediate feedback shown. Refresh page, verify essay answers are restored.

### Implementation for User Story 3

- [x] T041 [US3] Extend NewQuizAnswerInput component for essay question type in components/learning/new-quiz/NewQuizAnswerInput.vue
- [x] T042 [US3] Implement essay answer input (text area) in components/learning/new-quiz/NewQuizAnswerInput.vue
- [x] T043 [US3] Implement essay answer save functionality in components/learning/new-quiz/NewQuizAnswerInput.vue (call saveAnswer with text_answer)
- [x] T044 [US3] Ensure no immediate feedback displayed for essay questions in components/learning/new-quiz/NewQuizAnswerInput.vue (is_correct is null, auto_graded is false)
- [x] T045 [US3] Implement essay answer restoration on page resume in pages/quizz/[id].vue (restore text_answer from saved answers)
- [x] T046 [US3] Update score calculation to handle pending essays in pages/quizz/[id].vue (show score for auto-graded questions only, indicate pending essays)
- [x] T047 [US3] Update results display to show pending essay status in components/learning/new-quiz/NewQuizResults.vue (display has_pending_essays message)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - students can answer all question types (MCQ, text-input, essay) with appropriate feedback behavior.

---

## Phase 6: User Story 4 - Navigate Between Questions and View Progress (Priority: P3)

**Goal**: Students can navigate between questions in any order, see which questions are answered, view progress indicators, and see running score updates.

**Independent Test**: Start a quiz, navigate between questions using next/previous buttons, view question list with status indicators, verify progress bar and score update correctly.

### Implementation for User Story 4

- [x] T048 [US4] Implement next question navigation in pages/quizz/[id].vue (increment currentQuestionIndex)
- [x] T049 [US4] Implement previous question navigation in pages/quizz/[id].vue (decrement currentQuestionIndex)
- [x] T050 [US4] Create question list/navigation component in components/learning/new-quiz/NewQuizNavigation.vue (integrated in NewQuizProgress)
- [x] T051 [US4] Implement question list with status indicators in components/learning/new-quiz/NewQuizProgress.vue (gray/unanswered, green/correct, red/incorrect, yellow/pending essay)
- [x] T052 [US4] Implement direct question selection in components/learning/new-quiz/NewQuizProgress.vue (click question number to jump)
- [x] T053 [US4] Update progress bar to show answered vs unanswered in components/learning/new-quiz/NewQuizProgress.vue (visual distinction)
- [x] T054 [US4] Implement real-time score updates in components/learning/new-quiz/NewQuizPlayer.vue (update display when answers are saved)
- [x] T055 [US4] Implement answer modification support in components/learning/new-quiz/NewQuizAnswerInput.vue (allow changing previously saved answers, triggers new save)
- [x] T056 [US4] Update score when answer is modified in components/learning/new-quiz/NewQuizPlayer.vue (recalculate from updated attempt data)

**Checkpoint**: All user stories should now be independently functional - complete quiz-taking experience with navigation, progress tracking, and all question types.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 [P] Implement network error handling with retry logic in components/learning/new-quiz/NewQuizPlayer.vue (exponential backoff, 3 attempts)
- [x] T058 [P] Add error display for save failures in components/learning/new-quiz/NewQuizAnswerInput.vue (show user-friendly error messages inline)
- [x] T059 [P] Implement local answer preservation during network errors in components/learning/new-quiz/NewQuizPlayer.vue (store in local state, retry on reconnect)
- [x] T060 [P] Add loading states for all async operations in pages/quizz/[id].vue and components
- [x] T061 [P] Add validation for attempt ownership in pages/quizz/[id].vue (handle 403 errors gracefully with fallback)
- [x] T062 [P] Implement browser back/forward navigation handling in pages/quizz/[id].vue (prevent accidental navigation with beforeunload)
- [x] T063 [P] Add accessibility improvements (ARIA labels) in components/learning/new-quiz/NewQuizAnswerInput.vue
- [x] T064 [P] Add responsive design for mobile devices in all components (using Tailwind responsive classes)
- [ ] T065 [P] Add i18n support for all user-facing text in components and pages
- [x] T066 [P] Optimize performance (debounce implemented, memoization via computed)
- [x] T067 [P] Add visual feedback for saving state in components/learning/new-quiz/NewQuizAnswerInput.vue (show "Saving..." indicator)
- [ ] T068 [P] Run quickstart.md validation and update if needed
- [ ] T069 [P] Code cleanup and refactoring across all components
- [ ] T070 [P] Update documentation in README or feature docs if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories should proceed sequentially in priority order (P1 → P2 → P3) for MVP delivery
  - US2 and US3 can potentially be worked on in parallel after US1 is complete
  - US4 can be worked on after US1-3 are complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (needs quiz play page and components from US1)
- **User Story 3 (P2)**: Depends on US1 completion (needs answer input component from US1)
- **User Story 4 (P3)**: Depends on US1 completion (needs quiz play page and question display from US1)

### Within Each User Story

- Components before integration
- Core functionality before error handling
- Basic features before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel
- **Phase 2**: Tasks T005-T008 can run in parallel (different methods in same file, but can be done sequentially or with careful coordination)
- **Phase 3 (US1)**: Some component creation tasks can be done in parallel:
  - T014, T015, T021, T025, T029 (different component files)
- **Phase 4 (US2)**: Tasks T034-T039 can be done in parallel (different aspects of resume functionality)
- **Phase 5 (US3)**: Tasks T041-T044 can be done together (all related to essay input component)
- **Phase 6 (US4)**: Tasks T048-T052 can be done in parallel (different navigation features)
- **Phase 7**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component creation tasks in parallel (different files):
Task: "Create NewQuizQuestion component in components/learning/new-quiz/NewQuizQuestion.vue"
Task: "Create NewQuizAnswerInput component in components/learning/new-quiz/NewQuizAnswerInput.vue"
Task: "Create NewQuizTimer component in components/learning/new-quiz/NewQuizTimer.vue"
Task: "Create NewQuizProgress component in components/learning/new-quiz/NewQuizProgress.vue"
Task: "Create NewQuizResults component in components/learning/new-quiz/NewQuizResults.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Start quiz from listing page
   - Answer MCQ and text-input questions
   - See immediate feedback
   - Submit quiz
   - Verify timer works for timed quizzes
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Resume capability)
4. Add User Story 3 → Test independently → Deploy/Demo (Essay support)
5. Add User Story 4 → Test independently → Deploy/Demo (Navigation & Progress)
6. Add Polish → Final polish → Production ready
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (core functionality)
   - Developer B: Can help with US1 component creation in parallel
3. After US1 is complete:
   - Developer A: User Story 2 (resume)
   - Developer B: User Story 3 (essay) - can be done in parallel
4. After US2 and US3:
   - Developer A: User Story 4 (navigation)
   - Developer B: Polish tasks
5. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 70
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - MVP)**: 24 tasks
- **Phase 4 (US2)**: 7 tasks
- **Phase 5 (US3)**: 7 tasks
- **Phase 6 (US4)**: 9 tasks
- **Phase 7 (Polish)**: 14 tasks

### Task Count per User Story

- **User Story 1 (P1)**: 24 tasks
- **User Story 2 (P2)**: 7 tasks
- **User Story 3 (P2)**: 7 tasks
- **User Story 4 (P3)**: 9 tasks

### Parallel Opportunities Identified

- Component creation tasks (different files)
- API method additions (can be coordinated)
- Polish tasks (independent improvements)
- Navigation features (different aspects)

### Independent Test Criteria

- **US1**: Start quiz, answer questions, see feedback, submit - all works independently
- **US2**: Refresh page, resume attempt, continue - works independently after US1
- **US3**: Answer essay questions, save, no feedback - works independently after US1
- **US4**: Navigate questions, see progress, modify answers - works independently after US1

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers:
- Complete quiz-taking experience
- Auto-save for MCQ and text-input
- Immediate feedback
- Timer functionality
- Submit capability

Total: 33 tasks for MVP

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for clarity
- Follow existing patterns from `pages/learning/quiz/[id]/index.vue` but adapt for new quiz system

