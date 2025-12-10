# Tasks: Upload Attachments for Individual Lessons

**Input**: Design documents from `/specs/001-lesson-attachment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and not included in this feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Nuxt 3 project structure
- Components: `components/admin/` and `components/learning/`
- Pages: `pages/admin/` and `pages/learning/`
- Types: `types/course.type.ts`
- Translations: `i18n/locales/vi.json` and `i18n/locales/en.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and translation keys that all user stories depend on

- [x] T001 [P] Add `LessonMaterial` interface to `types/course.type.ts`
- [x] T002 [P] Update `LessonPayload` interface to include `materials?: LessonMaterial[]` in `types/course.type.ts`
- [x] T003 [P] Update `Lesson` interface to include `materials?: LessonMaterial[]` in `types/course.type.ts`
- [x] T004 [P] Add admin materials translation keys to `i18n/locales/vi.json` (admin.formLesson.materials.*)
- [x] T005 [P] Add admin materials translation keys to `i18n/locales/en.json` (admin.formLesson.materials.*)
- [x] T006 [P] Add learning materials translation keys to `i18n/locales/vi.json` (learning.lesson.materials.*)
- [x] T007 [P] Add learning materials translation keys to `i18n/locales/en.json` (learning.lesson.materials.*)

**Checkpoint**: Type definitions and translations ready - foundational work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Verify `useAssetApi().getAttachmentUploadUrl()` supports `folder: "lesson-materials"` parameter in `composables/api/useAssetApi.ts`
- [x] T009 Verify `useFileUpload().uploadFileWithProgress()` is available and functional in `composables/useFileUpload.ts`
- [x] T010 Verify lesson API (`useCourse().updateLesson()` and `useCourse().createLesson()`) accepts `materials` array in payload (backend confirmation)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Teacher Uploads Material to a Lesson (Priority: P1) 🎯 MVP

**Goal**: Enable teachers to upload file attachments (PDFs, documents, images, audio) to individual lessons, allowing lesson-specific content organization.

**Independent Test**: Navigate to lesson edit page, upload a PDF file attachment, save the lesson, and verify the material appears associated with that specific lesson when viewing lesson details.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create `LessonMaterialUpload.vue` component in `components/admin/course/lesson/LessonMaterialUpload.vue` with drag-and-drop file upload interface
- [x] T012 [US1] Implement file type validation in `components/admin/course/lesson/LessonMaterialUpload.vue` (PDF, DOC, PPT, ZIP, images, audio)
- [x] T013 [US1] Implement file size validation in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [x] T014 [US1] Implement upload workflow in `components/admin/course/lesson/LessonMaterialUpload.vue` (get presigned URL → upload to S3 → return material data)
- [x] T015 [US1] Add upload progress tracking in `components/admin/course/lesson/LessonMaterialUpload.vue` using `a-progress` component
- [x] T016 [US1] Add error handling for upload failures in `components/admin/course/lesson/LessonMaterialUpload.vue` with user-friendly notifications
- [x] T017 [US1] Add form fields for material title and description in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [x] T018 [US1] Emit `upload-complete` event with material data from `components/admin/course/lesson/LessonMaterialUpload.vue`
- [x] T019 [US1] Add materials section to lesson edit page in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [x] T020 [US1] Integrate `LessonMaterialUpload` component into lesson edit page in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [x] T021 [US1] Add `materials` field to `formState` in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [x] T022 [US1] Handle `upload-complete` event to add material to `formState.materials` array in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [x] T023 [US1] Include `materials` array in lesson payload when saving lesson in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [x] T024 [US1] Load `materials` from lesson API response when fetching existing lesson in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`

**Checkpoint**: At this point, User Story 1 should be fully functional - teachers can upload materials to lessons and they are saved with the lesson

---

## Phase 4: User Story 2 - Teacher Views and Manages Lesson Materials (Priority: P2)

**Goal**: Enable teachers to view all materials attached to a lesson, edit material metadata (title, description), and remove materials that are no longer needed.

**Independent Test**: View a lesson with existing materials, edit a material's title/description, delete a material, and verify changes are reflected in the materials list.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create `LessonMaterialList.vue` component in `components/admin/course/lesson/LessonMaterialList.vue` to display materials list
- [ ] T026 [P] [US2] Create `LessonMaterialItem.vue` component in `components/admin/course/lesson/LessonMaterialItem.vue` for individual material display
- [ ] T027 [US2] Display materials list with title, file type, file size, and upload date in `components/admin/course/lesson/LessonMaterialList.vue`
- [ ] T028 [US2] Add edit button to each material item in `components/admin/course/lesson/LessonMaterialItem.vue`
- [ ] T029 [US2] Add delete button to each material item in `components/admin/course/lesson/LessonMaterialItem.vue`
- [ ] T030 [US2] Create edit material modal/dialog in `components/admin/course/lesson/LessonMaterialItem.vue` or separate component
- [ ] T031 [US2] Implement edit material functionality (update title/description) in edit modal
- [ ] T032 [US2] Emit `update` event with updated materials array from `components/admin/course/lesson/LessonMaterialList.vue`
- [ ] T033 [US2] Emit `delete` event with material ID from `components/admin/course/lesson/LessonMaterialItem.vue`
- [ ] T034 [US2] Integrate `LessonMaterialList` component into lesson edit page in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [ ] T035 [US2] Handle material update event to update `formState.materials` array in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [ ] T036 [US2] Handle material delete event to remove material from `formState.materials` array in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`
- [ ] T037 [US2] Include updated `materials` array in lesson payload when saving lesson after edit/delete in `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - teachers can upload, view, edit, and delete materials

---

## Phase 5: User Story 3 - Student Accesses Lesson Materials (Priority: P3)

**Goal**: Enable students enrolled in a course to access materials attached to a specific lesson they are studying, with access control based on enrollment status and lesson preview status.

**Independent Test**: As a student, navigate to a lesson you have access to, verify materials are displayed, click on a material to open/download it, and verify materials are not displayed for lessons without access.

### Implementation for User Story 3

- [ ] T038 [P] [US3] Create `LessonMaterialList.vue` component in `components/learning/LessonMaterialList.vue` for student-facing materials display
- [ ] T039 [US3] Display materials list with title, file type, file size in `components/learning/LessonMaterialList.vue` (read-only, no edit/delete)
- [ ] T040 [US3] Add click handler to open/download material based on file type in `components/learning/LessonMaterialList.vue`
- [ ] T041 [US3] Handle `file_url: null` case (no access) in `components/learning/LessonMaterialList.vue` with appropriate message
- [ ] T042 [US3] Add materials section to learning page in `pages/learning/[id].vue`
- [ ] T043 [US3] Check lesson `has_access` or `is_preview` before displaying materials in `pages/learning/[id].vue`
- [ ] T044 [US3] Display materials only when `activeLesson.materials` exists and access is granted in `pages/learning/[id].vue`
- [ ] T045 [US3] Integrate `LessonMaterialList` component (learning version) into learning page in `pages/learning/[id].vue`
- [ ] T046 [US3] Add empty state message when no materials available in `components/learning/LessonMaterialList.vue`
- [ ] T047 [US3] Add "no access" message when materials exist but `file_url` is null in `components/learning/LessonMaterialList.vue`

**Checkpoint**: At this point, all user stories should be independently functional - complete feature from teacher upload to student access

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, edge case handling, and final polish

- [ ] T048 [P] Add error handling for file upload size limit exceeded in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [ ] T049 [P] Add error handling for network errors during upload in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [ ] T050 [P] Add error handling for S3 upload failures in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [ ] T051 [P] Add error handling for invalid file types in `components/admin/course/lesson/LessonMaterialUpload.vue`
- [ ] T052 [P] Add loading states for materials list in `components/admin/course/lesson/LessonMaterialList.vue`
- [ ] T053 [P] Add loading states for materials list in `components/learning/LessonMaterialList.vue`
- [ ] T054 [P] Add empty state UI when no materials exist in `components/admin/course/lesson/LessonMaterialList.vue`
- [ ] T055 [P] Verify concurrent uploads are handled correctly (multiple materials to same lesson)
- [ ] T056 [P] Verify materials persist correctly after lesson save
- [ ] T057 [P] Verify materials load correctly when editing existing lesson
- [ ] T058 [P] Test access control for preview lessons (materials should be accessible)
- [ ] T059 [P] Test access control for enrolled students (materials should be accessible)
- [ ] T060 [P] Test access control for non-enrolled users (materials should not be accessible)
- [ ] T061 [P] Verify file type icons/display for different material types (PDF, DOC, images, etc.)
- [ ] T062 [P] Add responsive design for materials components (mobile/tablet support)
- [ ] T063 [P] Run TypeScript type checking to ensure no type errors
- [ ] T064 [P] Run ESLint to ensure code quality standards
- [ ] T065 [P] Verify all translation keys are used and present in both vi.json and en.json
- [ ] T066 [P] Update quickstart.md validation if needed
- [ ] T067 [P] Code cleanup and refactoring for consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for materials data structure, but can be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for materials data, but can be independently testable

### Within Each User Story

- Component creation before integration
- Upload workflow before UI integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T007) marked [P] can run in parallel
- All Foundational tasks (T008-T010) marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Component creation tasks within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component creation and integration tasks in parallel:
Task: "Create LessonMaterialUpload.vue component"
Task: "Add materials section to lesson edit page"

# Launch validation and error handling in parallel:
Task: "Implement file type validation"
Task: "Implement file size validation"
Task: "Add error handling for upload failures"
```

---

## Parallel Example: User Story 2

```bash
# Launch component creation in parallel:
Task: "Create LessonMaterialList.vue component"
Task: "Create LessonMaterialItem.vue component"

# Launch feature implementation in parallel:
Task: "Add edit button to each material item"
Task: "Add delete button to each material item"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (type definitions, translations)
2. Complete Phase 2: Foundational (verify APIs)
3. Complete Phase 3: User Story 1 (teacher uploads materials)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish phase → Final validation → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (upload functionality)
   - Developer B: User Story 2 (view/edit/delete) - can start after US1 structure is clear
   - Developer C: User Story 3 (student access) - can start after US1 structure is clear
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 67
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 14 tasks
- **Phase 4 (User Story 2)**: 13 tasks
- **Phase 5 (User Story 3)**: 10 tasks
- **Phase 6 (Polish)**: 20 tasks

**Tasks per User Story**:
- User Story 1 (P1): 14 tasks
- User Story 2 (P2): 13 tasks
- User Story 3 (P3): 10 tasks

**Parallel Opportunities**: 
- 7 tasks in Setup phase
- 3 tasks in Foundational phase
- Multiple component creation tasks within each story
- All polish tasks can run in parallel

**Independent Test Criteria**:
- **User Story 1**: Upload material to lesson, save lesson, verify material appears in lesson details
- **User Story 2**: View materials list, edit material metadata, delete material, verify changes persist
- **User Story 3**: As student, view materials for accessible lesson, click to open/download, verify no access for non-accessible lessons

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) - enables teachers to upload materials to lessons

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are absolute from repository root
- Type definitions must be complete before component implementation
- Translation keys must be added before UI components use them

