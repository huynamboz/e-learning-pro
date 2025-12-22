# Implementation Plan: New Quiz Play Flow for Students

**Branch**: `003-new-quiz-play` | **Date**: 2025-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-new-quiz-play/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Implement a quiz play page for students to take new quizzes (standalone quizzes organized by Level) with auto-save functionality, immediate feedback for auto-gradable questions, session resume capability, and real-time progress tracking.

**Technical Approach**: 
- Create new quiz play page at `/quizz/[id]` route (matching the link from quiz listing page)
- Extend `useNewQuizApi` composable to add attempt management methods (start, save-answer, retrieve, submit)
- Implement auto-save with debouncing for text inputs
- Implement immediate feedback display for multiple-choice and text-input questions
- Add timer functionality for timed quizzes with auto-submit on expiration
- Implement session resume by retrieving attempt data on page load
- Create UI components for question display, answer input, progress tracking, and navigation
- Handle network errors gracefully with retry logic and local answer preservation
- Integrate with existing authentication and API client patterns

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3.x, Nuxt 3.x  
**Primary Dependencies**: 
- Nuxt 3 (framework, SSR/SPA)
- Vue 3 Composition API
- Ant Design Vue (UI components)
- Tailwind CSS (styling)
- Pinia (state management, if needed for quiz state)
- @nuxtjs/i18n (internationalization)
- Existing API client (`~/api/apiClient`)

**Storage**: 
- Backend: Quiz attempt data stored via `/api/v1/new_quiz/attempts/` API endpoints
- Client-side: Browser localStorage for temporary answer caching during network issues (optional, for resilience)

**Testing**: 
- Manual testing for quiz flow (start, answer, save, submit)
- TypeScript type checking for API contracts
- Component prop/emit validation
- Integration testing with backend API
- Timer accuracy testing
- Session resume testing (page refresh scenarios)

**Target Platform**: Web browser (desktop and mobile responsive)  
**Project Type**: Web application (Nuxt 3 SPA/SSR)  
**Performance Goals**: 
- Quiz start completes within 3 seconds (SC-001)
- Answer auto-save completes within 2 seconds for 95% of operations (SC-002)
- Immediate feedback displayed within 1 second (SC-005)
- Quiz submission completes within 5 seconds for up to 50 questions (SC-006)
- Timer accuracy maintained within 1 second (SC-007)
- Navigation and progress updates under 500ms (SC-008)

**Constraints**: 
- Must use existing API client patterns (`useApiClient` from `~/api/apiClient`)
- Must extend existing `useNewQuizApi` composable (not create new one)
- Must follow existing composable structure patterns
- Must integrate with existing authentication system
- Must follow existing UI/UX patterns from course-based quiz play page (for consistency)
- Must handle network errors gracefully (retry, show error, preserve locally)
- Must prevent unauthorized access to quiz attempts

**Scale/Scope**: 
- Students taking standalone quizzes
- Support for quizzes with up to 50 questions (SC-006)
- Multiple question types: multiple choice, text input, essay
- Support for timed and untimed quizzes
- Session resume capability (page refresh)
- Real-time score calculation and progress tracking

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

**Analysis**: 
- No constitution violations identified
- Feature follows existing architectural patterns
- Uses established composable and API client patterns
- Extends existing `useNewQuizApi` composable (no new dependencies)
- Maintains separation of concerns
- No new external dependencies required beyond existing stack
- Follows existing quiz play page patterns for consistency

## Project Structure

### Documentation (this feature)

```text
specs/003-new-quiz-play/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── new-quiz-attempt-api.yaml # OpenAPI specification for attempt endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
composables/
├── api/
│   └── useNewQuizApi.ts          # Extend with attempt management methods:
│                                 # - startAttempt(quizId)
│                                 # - saveAnswer(attemptId, answerData)
│                                 # - getAttempt(attemptId)
│                                 # - submitAttempt(attemptId)

pages/
├── quizz/
│   └── [id].vue                  # New quiz play page (route: /quizz/{quiz_id})

components/
├── learning/
│   └── new-quiz/                 # New components for new quiz system
│       ├── NewQuizPlayer.vue     # Main quiz player component
│       ├── NewQuizQuestion.vue   # Question display component
│       ├── NewQuizAnswerInput.vue # Answer input component (MCQ/text/essay)
│       ├── NewQuizProgress.vue   # Progress indicator component
│       ├── NewQuizTimer.vue      # Timer component for timed quizzes
│       └── NewQuizResults.vue    # Results display component (after submit)

types/
└── quiz.type.ts                  # Extend with new quiz attempt types if needed
```

**Structure Decision**: 
- Extend existing `useNewQuizApi` composable rather than creating a new one (maintains consistency)
- Create new page at `/quizz/[id]` to match the link from quiz listing page (`pages/quizz.vue`)
- Create new components in `components/learning/new-quiz/` to distinguish from old quiz system components
- Reuse existing patterns from `pages/learning/quiz/[id]/index.vue` but adapt for new quiz system with auto-save

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified - feature follows existing patterns and extends existing composables.
