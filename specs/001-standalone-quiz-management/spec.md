# Feature Specification: Standalone Quiz Management

**Feature Branch**: `001-standalone-quiz-management`  
**Created**: 2025-01-15  
**Status**: Draft  
**Input**: User description: "hiện giờ quiz đang đi theo course, tức là admin phải vào detail course để có thể CRUD quiz, nhưng giờ có 1 update mới nữa là quiz sẽ không cần đi theo course nữa, đây là docs mới @docs/new_quiz.md , không xoá feature cũ mà là thêm feature mới, trong sidebar admin thêm 1 tab quản lý quiz, ở trong này có thể CRUD quiz"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Accesses Standalone Quiz Management (Priority: P1)

An admin navigates to the standalone quiz management section from the admin sidebar to view and manage quizzes that are independent of courses.

**Why this priority**: This is the foundational user journey that enables all other quiz management operations. Without this navigation entry point, admins cannot access the new standalone quiz management feature.

**Independent Test**: Can be fully tested by navigating to the admin panel, verifying the new quiz management tab appears in the sidebar, clicking it, and confirming the quiz management page loads successfully. This delivers immediate value by providing admins with a dedicated space for managing standalone quizzes.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the admin panel, **When** they view the admin sidebar, **Then** they see a new "Quiz Management" tab (or similar label) alongside existing tabs
2. **Given** an admin is viewing the admin sidebar, **When** they click the new quiz management tab, **Then** they are navigated to the standalone quiz management page
3. **Given** an admin is on the standalone quiz management page, **When** the page loads, **Then** they see a list of all standalone quizzes organized by Level (A1, A2, B1, etc.)

---

### User Story 2 - Admin Creates Standalone Quiz (Priority: P1)

An admin creates a new standalone quiz that is organized by Level instead of being tied to a course structure.

**Why this priority**: Creating quizzes is a core CRUD operation and essential for the feature to deliver value. This enables admins to build a library of standalone assessments independent of course content.

**Independent Test**: Can be fully tested by navigating to the quiz management page, clicking a "Create Quiz" button, filling out the quiz form with Level selection (instead of course/lesson), adding questions, and successfully saving. This delivers value by allowing admins to create assessments that can be used across multiple contexts.

**Acceptance Scenarios**:

1. **Given** an admin is on the standalone quiz management page, **When** they click "Create Quiz" (or similar action), **Then** they are taken to a quiz creation form
2. **Given** an admin is on the quiz creation form, **When** they fill in quiz details (title, description, Level selection), **Then** the form validates that Level is required and cannot be empty
3. **Given** an admin has filled in quiz details and added questions, **When** they submit the form, **Then** a new standalone quiz is created and they are redirected to the quiz list or detail view
4. **Given** an admin creates a quiz with Level A1, **When** they view the quiz list, **Then** the quiz appears under the A1 Level section

---

### User Story 3 - Admin Views and Filters Standalone Quizzes (Priority: P1)

An admin views the list of standalone quizzes and filters them by Level, publish status, or other criteria.

**Why this priority**: Viewing and filtering is essential for managing a collection of quizzes. Without this capability, admins cannot efficiently find and organize their standalone quizzes.

**Independent Test**: Can be fully tested by navigating to the quiz management page, viewing the quiz list organized by Levels, applying filters (by Level, publish status, search), and verifying the list updates correctly. This delivers value by enabling efficient quiz discovery and management.

**Acceptance Scenarios**:

1. **Given** an admin is on the standalone quiz management page, **When** the page loads, **Then** they see all standalone quizzes grouped by Level (A1, A2, B1, etc.)
2. **Given** an admin is viewing the quiz list, **When** they select a Level filter (e.g., "A1"), **Then** only quizzes for that Level are displayed
3. **Given** an admin is viewing the quiz list, **When** they filter by "Published" status, **Then** only published quizzes are shown
4. **Given** an admin is viewing the quiz list, **When** they search by quiz title or description, **Then** matching quizzes are displayed

---

### User Story 4 - Admin Updates Standalone Quiz (Priority: P2)

An admin edits an existing standalone quiz to modify its details, questions, or Level assignment.

**Why this priority**: Update functionality is a core CRUD operation that enables admins to maintain and improve their quiz content over time.

**Independent Test**: Can be fully tested by navigating to a quiz detail page, clicking "Edit", modifying quiz information (including changing Level), updating questions, and saving changes. This delivers value by allowing continuous improvement of quiz content.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a standalone quiz in the list, **When** they click "Edit" (or similar action), **Then** they are taken to the quiz edit form with pre-filled data
2. **Given** an admin is editing a quiz, **When** they modify the Level assignment, **Then** the quiz is moved to the new Level upon saving
3. **Given** an admin is editing a quiz, **When** they update questions and save, **Then** the changes are persisted and reflected in the quiz detail view
4. **Given** an admin is editing a published quiz, **When** they make changes, **Then** they can save the changes (publish status may remain or change based on business rules)

---

### User Story 5 - Admin Deletes Standalone Quiz (Priority: P2)

An admin deletes a standalone quiz that is no longer needed.

**Why this priority**: Delete functionality completes the CRUD operations and allows admins to remove obsolete or incorrect quizzes.

**Independent Test**: Can be fully tested by navigating to a quiz detail page or list item, clicking "Delete", confirming the deletion, and verifying the quiz is removed from the list. This delivers value by enabling cleanup of unwanted content.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a standalone quiz, **When** they click "Delete" (or similar action), **Then** a confirmation dialog appears asking them to confirm deletion
2. **Given** an admin has initiated quiz deletion, **When** they confirm the deletion, **Then** the quiz is permanently removed from the system
3. **Given** an admin has initiated quiz deletion, **When** they cancel the deletion, **Then** the quiz remains unchanged and they return to the previous view
4. **Given** a quiz has existing student attempts, **When** an admin deletes the quiz, **Then** the system handles this appropriately (either prevents deletion, archives attempts, or provides appropriate warning)

---

### User Story 6 - Admin Publishes/Unpublishes Standalone Quiz (Priority: P2)

An admin publishes a standalone quiz to make it available to students or unpublishes it to hide it from student view.

**Why this priority**: Publish/unpublish functionality controls quiz visibility to students and is essential for managing the student-facing quiz catalog.

**Independent Test**: Can be fully tested by navigating to a quiz, clicking "Publish" or "Unpublish", and verifying the status changes and the quiz visibility updates accordingly. This delivers value by enabling controlled release of quizzes to students.

**Acceptance Scenarios**:

1. **Given** an admin is viewing an unpublished standalone quiz, **When** they click "Publish", **Then** the quiz becomes visible to students (if it has at least one question)
2. **Given** an admin is viewing a published standalone quiz, **When** they click "Unpublish", **Then** the quiz is hidden from student view
3. **Given** an admin attempts to publish a quiz with no questions, **When** they click "Publish", **Then** the system prevents publication and shows an appropriate error message
4. **Given** a quiz is published, **When** students browse available quizzes, **Then** they can see and access the published quiz

---

### Edge Cases

- What happens when an admin tries to create a quiz without selecting a Level? (System should prevent creation and show validation error)
- How does the system handle a quiz that has been moved to a different Level but has existing student attempts? (Attempts should remain associated with the quiz, not the Level)
- What happens when an admin deletes a Level that has associated quizzes? (System should either prevent deletion, require moving quizzes first, or handle cascading appropriately)
- How does the system handle concurrent edits when multiple admins edit the same quiz simultaneously? (Last save wins or conflict resolution)
- What happens when an admin filters by a Level that has no quizzes? (Should show empty state message)
- How does the system handle very long quiz titles or descriptions? (Should enforce character limits or truncate appropriately)
- What happens when an admin tries to publish a quiz that was previously published but then had all questions deleted? (Should prevent publication)
- How does the system handle navigation when an admin is editing a quiz and the quiz's Level is changed? (Should update the quiz's position in Level-based organization)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a new "Quiz Management" tab (or equivalent label) in the admin sidebar navigation
- **FR-002**: System MUST display a dedicated page for standalone quiz management accessible from the admin sidebar
- **FR-003**: System MUST allow admins to create new standalone quizzes that are organized by Level (A1, A2, B1, etc.) instead of course structure
- **FR-004**: System MUST require Level selection when creating or editing a standalone quiz (Level cannot be null or empty)
- **FR-005**: System MUST display standalone quizzes grouped or filterable by Level
- **FR-006**: System MUST allow admins to view a list of all standalone quizzes with filtering capabilities (by Level, publish status, search by title/description)
- **FR-007**: System MUST allow admins to view detailed information about a specific standalone quiz
- **FR-008**: System MUST allow admins to edit existing standalone quizzes, including changing the Level assignment
- **FR-009**: System MUST allow admins to delete standalone quizzes with appropriate confirmation
- **FR-010**: System MUST allow admins to publish standalone quizzes (making them visible to students) only if the quiz has at least one question
- **FR-011**: System MUST allow admins to unpublish standalone quizzes (hiding them from student view)
- **FR-012**: System MUST support all question types for standalone quizzes (multiple choice, text input, essay) as defined in the new quiz API documentation
- **FR-013**: System MUST support quiz settings for standalone quizzes (time limits, retake limits, etc.) as defined in the new quiz API documentation
- **FR-014**: System MUST maintain the existing course-based quiz management feature without modification (feature addition, not replacement)
- **FR-015**: System MUST clearly distinguish between course-based quizzes and standalone quizzes in the admin interface
- **FR-016**: System MUST integrate with the new quiz API endpoints (`/api/v1/new_quiz/`) for all CRUD operations
- **FR-017**: System MUST support Level management (list, create, update, delete Levels) if not already implemented separately
- **FR-018**: System MUST display appropriate error messages when quiz operations fail (validation errors, API errors, etc.)
- **FR-019**: System MUST provide loading states and feedback during quiz operations (create, update, delete, publish)
- **FR-020**: System MUST handle quiz deletion appropriately when quizzes have existing student attempts (either prevent deletion, show warning, or archive attempts)

### Key Entities *(include if feature involves data)*

- **Standalone Quiz**: A quiz entity that is independent of course structure, organized by Level instead. Key attributes include: title, description, Level assignment (required), time settings (type, value, unit), publish status, retake limit, questions, and metadata (created_by, created_at, updated_at).

- **Level**: An organizational entity for grouping standalone quizzes (e.g., A1, A2, B1, B2). Key attributes include: code (unique identifier like "A1"), name (display name), order (for sorting), description, active status, and metadata. Levels are independent of course levels.

- **Quiz Question**: Individual questions within a standalone quiz. Key attributes include: question type (multiple_choice, text_input, essay), prompt, explanation, media attachments, order, score, and question-specific data (options for MCQ, sample answers for text input).

- **Quiz Attempt**: Student submissions for standalone quizzes. While not directly managed in this feature, attempts are associated with standalone quizzes and may affect deletion rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can navigate to standalone quiz management from the admin sidebar and view the quiz list within 2 seconds of page load
- **SC-002**: Admins can create a new standalone quiz with Level assignment and basic questions in under 5 minutes
- **SC-003**: Admins can filter and find a specific quiz from a list of 100+ quizzes within 10 seconds using Level filters or search
- **SC-004**: 95% of quiz creation attempts complete successfully without validation errors on first submission (assuming valid input)
- **SC-005**: Admins can update quiz details (including Level reassignment) and see changes reflected immediately upon save
- **SC-006**: System prevents publication of quizzes with zero questions with 100% accuracy
- **SC-007**: All CRUD operations (create, read, update, delete) complete within 3 seconds for typical quiz sizes (up to 50 questions)
- **SC-008**: The standalone quiz management feature operates independently without affecting existing course-based quiz functionality (zero regression in course quiz features)

## Assumptions

- The backend API for new quiz management (`/api/v1/new_quiz/`) is already implemented and available as documented in `docs/new_quiz.md`
- Level management (CRUD for Levels) may need to be implemented as part of this feature if not already available, or Levels may be managed separately
- The existing course-based quiz management feature will remain unchanged and continue to function independently
- Admins have appropriate permissions to manage standalone quizzes (permission checks are handled by the backend API)
- Student-facing quiz browsing and attempt functionality for standalone quizzes is handled separately (not part of this admin management feature)
- The UI/UX patterns for quiz creation and editing can be similar to existing course-based quiz management, adapted for Level-based organization instead of course/lesson structure
- Internationalization (i18n) support will be added for all new UI labels and messages related to standalone quiz management
