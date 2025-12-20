# Implementation Plan: Standalone Quiz Management

**Branch**: `001-standalone-quiz-management` | **Date**: 2025-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-standalone-quiz-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Add a new admin sidebar tab for managing standalone quizzes that are independent of courses, organized by Levels (A1, A2, B1, etc.) instead of course structure. Enable full CRUD operations (create, read, update, delete) and publish/unpublish functionality for standalone quizzes.

**Technical Approach**: 
- Add new "Standalone Quiz Management" tab to admin sidebar navigation
- Create new pages for standalone quiz list, create, edit, and detail views
- Integrate with existing new quiz API endpoints (`/api/v1/new_quiz/`)
- Create new composable `useNewQuizApi` following existing API composable patterns
- Reuse existing quiz editor components, adapted for Level-based organization instead of course/lesson structure
- Support Level management (CRUD for Levels) if not already available
- Maintain backward compatibility with existing course-based quiz management

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3.x, Nuxt 3.x  
**Primary Dependencies**: 
- Nuxt 3 (framework, SSR/SPA)
- Vue 3 Composition API
- Ant Design Vue (UI components)
- Tailwind CSS (styling)
- Pinia (state management)
- @nuxtjs/i18n (internationalization)

**Storage**: 
- Backend: Database stores standalone quiz data via `/api/v1/new_quiz/` API endpoints
- File Storage: Media attachments handled via existing upload infrastructure (AWS S3 via presigned URLs)

**Testing**: 
- Manual testing for CRUD operations
- TypeScript type checking for API contracts
- Component prop/emit validation
- Integration testing with backend API

**Target Platform**: Web browser (desktop and mobile responsive)  
**Project Type**: Web application (Nuxt 3 SPA/SSR)  
**Performance Goals**: 
- Quiz list page loads within 2 seconds (SC-001)
- Quiz creation completes in under 5 minutes (SC-002)
- Filter/search operations complete within 10 seconds (SC-003)
- CRUD operations complete within 3 seconds (SC-007)
- 95% success rate for quiz creation (SC-004)

**Constraints**: 
- Must use existing API client patterns (`useApiClient` from `~/api/apiClient`)
- Must follow existing composable structure patterns
- Must maintain backward compatibility with course-based quiz management
- Must integrate with existing i18n system
- Must follow existing UI/UX patterns from course-based quiz management

**Scale/Scope**: 
- Admin users managing standalone quizzes
- Support for 100+ quizzes with efficient filtering (SC-003)
- Support for quizzes with up to 50 questions (SC-007)
- Multiple question types: multiple choice, text input, essay

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED

**Analysis**: 
- No constitution violations identified
- Feature follows existing architectural patterns
- Uses established composable and API client patterns
- Maintains separation of concerns
- No new external dependencies required beyond existing stack

## Project Structure

### Documentation (this feature)

```text
specs/001-standalone-quiz-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── new-quiz-api.yaml # OpenAPI specification for new quiz endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
composables/
├── api/
│   └── useNewQuizApi.ts          # New composable for standalone quiz API calls
│
pages/
├── admin/
│   └── new-quiz-management/      # New directory for standalone quiz pages
│       ├── index.vue              # Quiz list page with filtering
│       ├── create.vue             # Quiz creation page
│       ├── [id]/
│       │   ├── index.vue          # Quiz detail view
│       │   └── edit.vue           # Quiz edit page
│       └── levels/                # Level management (if needed)
│           ├── index.vue          # Level list
│           ├── create.vue         # Create level
│           └── [id]/
│               └── edit.vue       # Edit level
│
components/
├── admin/
│   └── new-quiz/                  # New components for standalone quiz management
│       ├── QuizList.vue           # Quiz list component with filters
│       ├── QuizEditor.vue         # Quiz editor (reuse/adapt from course quiz)
│       ├── QuizDetail.vue         # Quiz detail view
│       ├── LevelSelector.vue      # Level selection component
│       └── QuestionEditor.vue     # Question editor (reuse from course quiz)
│
composables/
└── useSidebar.ts                  # Update to add new admin menu item
```

**Structure Decision**: Web application structure following existing Nuxt 3 patterns. New pages under `/pages/admin/new-quiz-management/` to clearly distinguish from course-based quiz management. New composable `useNewQuizApi.ts` following existing API composable patterns. Components organized under `components/admin/new-quiz/` for standalone quiz-specific UI.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.

## Phase Completion Status

### Phase 0: Outline & Research ✅ COMPLETE
- **research.md**: Created with all technical decisions documented
- All unknowns resolved
- Implementation patterns established

### Phase 1: Design & Contracts ✅ COMPLETE
- **data-model.md**: Created with entity definitions, relationships, and validation rules
- **contracts/new-quiz-api.yaml**: OpenAPI 3.0 specification for all endpoints
- **quickstart.md**: Implementation guide with code examples
- **Agent Context**: Updated with TypeScript/Vue/Nuxt context

### Phase 2: Task Breakdown
- **Status**: Pending (to be created by `/speckit.tasks` command)
- **Next Step**: Run `/speckit.tasks` to generate detailed implementation tasks

## Generated Artifacts

1. **research.md** - Technical decisions and implementation patterns
2. **data-model.md** - Entity definitions and relationships
3. **contracts/new-quiz-api.yaml** - OpenAPI specification
4. **quickstart.md** - Developer quickstart guide
5. **Agent context updated** - Cursor IDE context file updated

## Next Steps

1. Review generated artifacts (research.md, data-model.md, contracts, quickstart.md)
2. Run `/speckit.tasks` to generate detailed implementation tasks
3. Begin implementation following quickstart guide
4. Test all CRUD operations
5. Verify backward compatibility with course-based quiz management
