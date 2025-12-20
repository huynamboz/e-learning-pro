# Tasks: Standalone Quiz Management

**Input**: Design documents from `/specs/001-standalone-quiz-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - manual testing and TypeScript type checking will be used.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Frontend-only (Nuxt 3)
- Paths: `composables/`, `pages/`, `components/`, `i18n/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and i18n setup

- [x] T001 Add i18n keys for standalone quiz management in `i18n/locales/vi.json`
- [x] T002 [P] Add i18n keys for standalone quiz management in `i18n/locales/en.json`
- [x] T003 Create directory structure `pages/admin/new-quiz-management/`
- [x] T004 [P] Create directory structure `components/admin/new-quiz/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript type definitions for Level entity in `composables/api/useNewQuizApi.ts`
- [x] T006 [P] Create TypeScript type definitions for NewQuiz entity in `composables/api/useNewQuizApi.ts`
- [x] T007 [P] Create TypeScript type definitions for NewQuizQuestion entity in `composables/api/useNewQuizApi.ts`
- [x] T008 [P] Create TypeScript type definitions for NewQuizOption and NewQuizSampleAnswer in `composables/api/useNewQuizApi.ts`
- [x] T009 Implement useNewQuizApi composable with Level CRUD methods in `composables/api/useNewQuizApi.ts`
- [x] T010 Implement useNewQuizApi composable with Quiz CRUD methods in `composables/api/useNewQuizApi.ts`
- [x] T011 Implement useNewQuizApi composable with publish/unpublish methods in `composables/api/useNewQuizApi.ts`
- [x] T012 Implement useNewQuizApi composable with filtering and search methods in `composables/api/useNewQuizApi.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Accesses Standalone Quiz Management (Priority: P1) 🎯 MVP

**Goal**: Admin can navigate to standalone quiz management from sidebar and view quiz list

**Independent Test**: Navigate to admin panel, verify new quiz management tab appears in sidebar, click it, confirm quiz management page loads successfully with list of quizzes organized by Level

### Implementation for User Story 1

- [x] T013 [US1] Update admin sidebar menu to add new quiz management tab in `composables/useSidebar.ts`
- [x] T014 [US1] Create quiz list page component `components/admin/new-quiz/QuizList.vue` with basic structure
- [x] T015 [US1] Create quiz list page `pages/admin/new-quiz-management/index.vue` that displays quizzes
- [x] T016 [US1] Implement quiz list data fetching with useNewQuizApi in `pages/admin/new-quiz-management/index.vue`
- [x] T017 [US1] Add loading states and error handling to quiz list page in `pages/admin/new-quiz-management/index.vue`
- [x] T018 [US1] Implement quiz list display grouped by Level in `components/admin/new-quiz/QuizList.vue`
- [x] T019 [US1] Add empty state message when no quizzes exist in `components/admin/new-quiz/QuizList.vue`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - admin can navigate to standalone quiz management and see quiz list

---

## Phase 4: User Story 2 - Admin Creates Standalone Quiz (Priority: P1)

**Goal**: Admin can create new standalone quiz organized by Level with questions

**Independent Test**: Navigate to quiz management page, click "Create Quiz", fill form with Level selection (instead of course/lesson), add questions, save successfully

### Implementation for User Story 2

- [x] T020 [US2] Create LevelSelector component `components/admin/new-quiz/LevelSelector.vue` for Level selection
- [x] T021 [US2] Create quiz creation page `pages/admin/new-quiz-management/create.vue` with basic structure
- [x] T022 [US2] Adapt existing QuizEditor component or create new one for standalone quizzes in `components/admin/new-quiz/QuizEditor.vue`
- [x] T023 [US2] Replace course/lesson selectors with Level selector in quiz editor `components/admin/new-quiz/QuizEditor.vue`
- [x] T024 [US2] Update quiz form validation to require Level selection in `components/admin/new-quiz/QuizEditor.vue`
- [x] T025 [US2] Update quiz form API payload to use level_id instead of lesson in `components/admin/new-quiz/QuizEditor.vue`
- [x] T026 [US2] Implement quiz creation API call in `pages/admin/new-quiz-management/create.vue`
- [x] T027 [US2] Add form validation for Level requirement in `components/admin/new-quiz/QuizEditor.vue`
- [x] T028 [US2] Add success/error notifications for quiz creation in `pages/admin/new-quiz-management/create.vue`
- [x] T029 [US2] Implement redirect to quiz list after successful creation in `pages/admin/new-quiz-management/create.vue`
- [x] T030 [US2] Support all question types (multiple choice, text input, essay) in quiz editor `components/admin/new-quiz/QuizEditor.vue`

**Checkpoint**: At this point, User Story 2 should be fully functional - admin can create standalone quizzes with Level assignment

---

## Phase 5: User Story 3 - Admin Views and Filters Standalone Quizzes (Priority: P1)

**Goal**: Admin can view quiz list and filter by Level, publish status, or search

**Independent Test**: Navigate to quiz management page, view quiz list organized by Levels, apply Level filter, apply publish status filter, search by title/description, verify list updates correctly

### Implementation for User Story 3

- [x] T031 [US3] Add Level filter dropdown to quiz list page in `pages/admin/new-quiz-management/index.vue`
- [x] T032 [US3] Add publish status filter to quiz list page in `pages/admin/new-quiz-management/index.vue`
- [x] T033 [US3] Add search input field to quiz list page in `pages/admin/new-quiz-management/index.vue`
- [x] T034 [US3] Implement debounced search functionality in `pages/admin/new-quiz-management/index.vue`
- [x] T035 [US3] Implement Level filter functionality with API call in `pages/admin/new-quiz-management/index.vue`
- [x] T036 [US3] Implement publish status filter functionality with API call in `pages/admin/new-quiz-management/index.vue`
- [x] T037 [US3] Update quiz list component to handle filtered results in `components/admin/new-quiz/QuizList.vue`
- [x] T038 [US3] Add empty state message for filtered results with no matches in `components/admin/new-quiz/QuizList.vue`
- [x] T039 [US3] Display quiz count and filter summary in quiz list page `pages/admin/new-quiz-management/index.vue`

**Checkpoint**: At this point, User Story 3 should be fully functional - admin can efficiently filter and search quizzes

---

## Phase 6: User Story 4 - Admin Updates Standalone Quiz (Priority: P2)

**Goal**: Admin can edit existing standalone quiz including changing Level assignment

**Independent Test**: Navigate to quiz detail page, click "Edit", modify quiz information including Level, update questions, save changes, verify changes reflected

### Implementation for User Story 4

- [x] T040 [US4] Create quiz detail page `pages/admin/new-quiz-management/[id]/index.vue` to display quiz information
- [x] T041 [US4] Create quiz detail component `components/admin/new-quiz/QuizDetail.vue` to show quiz details
- [x] T042 [US4] Add "Edit" button to quiz detail page in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T043 [US4] Create quiz edit page `pages/admin/new-quiz-management/[id]/edit.vue` with pre-filled form data
- [x] T044 [US4] Implement quiz data fetching for edit form in `pages/admin/new-quiz-management/[id]/edit.vue`
- [x] T045 [US4] Update quiz editor to support edit mode in `components/admin/new-quiz/QuizEditor.vue`
- [x] T046 [US4] Implement quiz update API call in `pages/admin/new-quiz-management/[id]/edit.vue`
- [x] T047 [US4] Handle Level reassignment in quiz update in `pages/admin/new-quiz-management/[id]/edit.vue`
- [x] T048 [US4] Update quiz questions in edit mode in `components/admin/new-quiz/QuizEditor.vue`
- [x] T049 [US4] Add success/error notifications for quiz update in `pages/admin/new-quiz-management/[id]/edit.vue`
- [x] T050 [US4] Implement redirect to quiz detail after successful update in `pages/admin/new-quiz-management/[id]/edit.vue`

**Checkpoint**: At this point, User Story 4 should be fully functional - admin can update quizzes including Level changes

---

## Phase 7: User Story 5 - Admin Deletes Standalone Quiz (Priority: P2)

**Goal**: Admin can delete standalone quiz with confirmation

**Independent Test**: Navigate to quiz detail page or list item, click "Delete", confirm deletion, verify quiz removed from list

### Implementation for User Story 5

- [x] T051 [US5] Add "Delete" button to quiz detail page in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T052 [US5] Add "Delete" action to quiz list items in `components/admin/new-quiz/QuizList.vue`
- [x] T053 [US5] Implement delete confirmation dialog using Ant Design Vue Modal in `components/admin/new-quiz/QuizList.vue`
- [x] T054 [US5] Implement delete confirmation dialog in quiz detail page `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T055 [US5] Implement quiz deletion API call in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T056 [US5] Implement quiz deletion API call from list in `components/admin/new-quiz/QuizList.vue`
- [x] T057 [US5] Handle deletion cancellation (close dialog without deleting) in delete dialogs
- [x] T058 [US5] Add success notification after successful deletion
- [x] T059 [US5] Refresh quiz list after deletion in `pages/admin/new-quiz-management/index.vue`
- [x] T060 [US5] Handle deletion errors with appropriate error messages

**Checkpoint**: At this point, User Story 5 should be fully functional - admin can delete quizzes with confirmation

---

## Phase 8: User Story 6 - Admin Publishes/Unpublishes Standalone Quiz (Priority: P2)

**Goal**: Admin can publish/unpublish standalone quiz to control student visibility

**Independent Test**: Navigate to quiz, click "Publish" or "Unpublish", verify status changes and quiz visibility updates accordingly

### Implementation for User Story 6

- [x] T061 [US6] Add "Publish" button to unpublished quiz detail page in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T062 [US6] Add "Unpublish" button to published quiz detail page in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T063 [US6] Add publish/unpublish actions to quiz list items in `components/admin/new-quiz/QuizList.vue`
- [x] T064 [US6] Implement publish quiz API call in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T065 [US6] Implement unpublish quiz API call in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T066 [US6] Add validation to prevent publishing quiz with no questions in `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T067 [US6] Display error message when attempting to publish quiz without questions
- [x] T068 [US6] Update quiz status display after publish/unpublish in `components/admin/new-quiz/QuizList.vue`
- [x] T069 [US6] Update quiz status display in quiz detail page `pages/admin/new-quiz-management/[id]/index.vue`
- [x] T070 [US6] Add success notifications for publish/unpublish operations
- [x] T071 [US6] Refresh quiz data after publish/unpublish operations

**Checkpoint**: At this point, User Story 6 should be fully functional - admin can control quiz visibility

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T072 [P] Add loading skeletons for quiz list loading state in `components/admin/new-quiz/QuizList.vue`
- [x] T073 [P] Add loading skeletons for quiz detail loading state in `components/admin/new-quiz/QuizDetail.vue`
- [x] T074 [P] Improve error handling and user feedback across all pages
- [x] T075 [P] Add responsive design improvements for mobile devices
- [x] T076 [P] Optimize quiz list performance for large datasets (100+ quizzes)
- [x] T077 [P] Add keyboard navigation support for quiz management pages
- [x] T078 [P] Verify all i18n keys are properly used across all components
- [x] T079 [P] Add accessibility improvements (ARIA labels, keyboard support)
- [x] T080 [P] Verify backward compatibility with course-based quiz management (no regressions)
- [x] T081 [P] Run quickstart.md validation and update if needed
- [x] T082 [P] Code cleanup and refactoring for consistency
- [x] T083 [P] Add TypeScript type checking validation across all new files
- [x] T084 [P] Performance testing for success criteria (2s page load, 3s CRUD operations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Stories 1, 2, 3 (P1) can proceed in parallel after foundational
  - User Stories 4, 5, 6 (P2) can proceed after P1 stories or in parallel
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (creates quizzes independently)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (list page) but can be implemented together
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Requires quiz detail view, can work with US1
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Requires quiz detail view, can work with US1
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Requires quiz detail view, can work with US1

### Within Each User Story

- Components before pages (reusable components first)
- Data fetching before UI display
- Core implementation before error handling
- Basic functionality before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational type definitions (T005-T008) can run in parallel
- Foundational API methods (T009-T012) can run in parallel after types
- Once Foundational phase completes, User Stories 1, 2, 3 (P1) can start in parallel
- User Stories 4, 5, 6 (P2) can start in parallel after P1 stories
- Polish tasks marked [P] can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Can work on these in parallel:
Task: "Update admin sidebar menu to add new quiz management tab in composables/useSidebar.ts"
Task: "Create quiz list page component components/admin/new-quiz/QuizList.vue with basic structure"
Task: "Create quiz list page pages/admin/new-quiz-management/index.vue that displays quizzes"
```

---

## Parallel Example: User Story 2

```bash
# Can work on these in parallel:
Task: "Create LevelSelector component components/admin/new-quiz/LevelSelector.vue for Level selection"
Task: "Create quiz creation page pages/admin/new-quiz-management/create.vue with basic structure"
Task: "Adapt existing QuizEditor component or create new one for standalone quizzes in components/admin/new-quiz/QuizEditor.vue"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Navigation and list)
4. Complete Phase 4: User Story 2 (Create quiz)
5. Complete Phase 5: User Story 3 (Filter and search)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic navigation)
3. Add User Story 2 → Test independently → Deploy/Demo (Can create quizzes)
4. Add User Story 3 → Test independently → Deploy/Demo (Can filter/search)
5. Add User Story 4 → Test independently → Deploy/Demo (Can update)
6. Add User Story 5 → Test independently → Deploy/Demo (Can delete)
7. Add User Story 6 → Test independently → Deploy/Demo (Can publish)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Navigation and list)
   - Developer B: User Story 2 (Create quiz)
   - Developer C: User Story 3 (Filter and search)
3. Once P1 stories complete:
   - Developer A: User Story 4 (Update)
   - Developer B: User Story 5 (Delete)
   - Developer C: User Story 6 (Publish/Unpublish)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing and TypeScript type checking will be used (no automated tests required)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All API calls use existing `/api/v1/new_quiz/` endpoints (backend already implemented)
- Maintain backward compatibility with course-based quiz management at all times
