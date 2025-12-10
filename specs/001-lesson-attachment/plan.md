# Implementation Plan: Upload Attachments for Individual Lessons

**Branch**: `001-lesson-attachment` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lesson-attachment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Enable teachers to upload file attachments (PDFs, documents, images, audio) to individual lessons, allowing lesson-specific content organization instead of only course-level assets.

**Technical Approach**: 
- Extend the existing lesson edit page to include a materials management section
- Use existing upload infrastructure (`/api/v1/system/upload-attachment-url/` with `folder: "lesson-materials"`)
- Manage materials through the lesson API (PATCH/PUT lesson with `materials` array in payload)
- Display materials in both teacher edit interface and student lesson view
- Enforce access control based on enrollment and lesson preview status

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3.x, Nuxt 3.x  
**Primary Dependencies**: 
- Ant Design Vue (UI components)
- Nuxt 3 (framework)
- Pinia (state management)
- Vue 3 Composition API
- AWS S3 (file storage via presigned URLs)

**Storage**: 
- Backend: Database stores lesson materials metadata (file_url, title, description) via lesson API
- File Storage: AWS S3 (files uploaded via presigned URLs to `lesson-materials/` folder)

**Testing**: 
- Manual testing for upload flows
- TypeScript type checking for API contracts
- Component prop/emit validation

**Target Platform**: Web browser (desktop and mobile responsive)  
**Project Type**: Web application (Nuxt 3 SPA/SSR)  
**Performance Goals**: 
- Material upload completes in under 2 minutes (SC-001)
- Materials list loads within 1 second (SC-003)
- Student access to materials within 2 seconds (SC-004)
- 99% upload success rate (SC-002)

**Constraints**: 
- Must use existing upload infrastructure (presigned URLs, S3)
- Must integrate with existing lesson API (PATCH/PUT with materials array)
- Must follow access control rules (enrollment-based for course-type, CourseAccess for resource-type)
- Must support same file types as course assets (PDF, DOC, PPT, ZIP, images, audio)

**Scale/Scope**: 
- Feature affects 2 pages: lesson edit page (admin) and lesson view page (student)
- Estimated 3-4 new components: LessonMaterialUpload, LessonMaterialList, LessonMaterialItem
- 1 new composable: useLessonMaterial (optional, if logic is complex)
- Updates to existing: LessonPayload interface, Lesson interface, lesson edit page, learning page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Component-First**: ✅ PASS
- Feature will be implemented as reusable Vue components:
  - `LessonMaterialUpload.vue` - Upload component with drag-and-drop
  - `LessonMaterialList.vue` - List of materials with edit/delete actions
  - `LessonMaterialItem.vue` - Individual material item display
- Components will have clear props/emits contracts
- Shared upload logic can be extracted to composable if needed

**Type Safety**: ✅ PASS
- New interfaces will be defined in `types/course.type.ts`:
  - `LessonMaterial` interface (id, title, description, file_url, file_type, file_size, uploaded_at, etc.)
  - Update `LessonPayload` to include `materials?: LessonMaterial[]`
  - Update `Lesson` interface to include `materials?: LessonMaterial[]`
- API responses will be typed via existing `useCourseApi` composable

**API Integration**: ✅ PASS
- Upload API calls will use `useAssetApi().getAttachmentUploadUrl()` with `folder: "lesson-materials"`
- Lesson update API calls will use existing `useCourse().updateLesson()` and `useCourse().createLesson()`
- Error handling will use Ant Design Vue `notification` for user feedback
- Loading states will be displayed during async operations

**i18n**: ✅ PASS
- All user-facing text will use `$t()` or `t()` from `useI18n()`
- Translation keys will follow hierarchical structure:
  - `admin.formLesson.materials.*` for teacher interface
  - `learning.lesson.materials.*` for student interface
- Translations will be added to both `i18n/locales/vi.json` and `i18n/locales/en.json`

**State Management**: ✅ PASS
- Component-local state using `ref()` for:
  - Upload progress, file lists, form state
  - Materials list (fetched from lesson API)
- No Pinia store needed (materials are lesson-specific, not global state)

**UI Components**: ✅ PASS
- Ant Design Vue components will be used:
  - `a-upload-dragger` for file upload
  - `a-table` or `a-list` for materials list
  - `a-modal` for edit material dialog
  - `a-button`, `a-progress` for UI elements
- Tailwind CSS for styling and layout

**Error Handling**: ✅ PASS
- API errors will display user-friendly notifications via `notification.error()`
- Upload errors will show inline error messages
- Form validation errors will use Ant Design Vue form validation
- Critical errors will log to console for debugging

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
components/
├── admin/
│   └── course/
│       └── lesson/
│           ├── LessonMaterialUpload.vue      # New: Upload component
│           ├── LessonMaterialList.vue       # New: Materials list component
│           └── LessonMaterialItem.vue       # New: Material item component
└── learning/
    └── LessonMaterialList.vue               # New: Student-facing materials list

pages/
├── admin/
│   └── courses/
│       └── [id]/
│           └── chapters/
│               └── [chapterId]/
│                   └── lessons-[lessonId].vue  # Update: Add materials section
└── learning/
    └── [id].vue                              # Update: Display materials in lesson view

composables/
└── api/
    └── useCourseApi.ts                       # Update: Ensure lesson API supports materials array

types/
└── course.type.ts                            # Update: Add LessonMaterial interface, update Lesson/LessonPayload

i18n/
└── locales/
    ├── vi.json                               # Update: Add materials translations
    └── en.json                               # Update: Add materials translations
```

**Structure Decision**: Single Nuxt 3 web application. Components organized by feature area (admin vs learning). Types centralized in `types/` directory. API logic in composables. Pages orchestrate components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution principles are followed.

---

## Phase 0: Research Complete ✅

**Output**: `research.md`

All research tasks completed:
- ✅ Lesson API materials array structure confirmed
- ✅ Upload workflow integration researched
- ✅ Access control rules documented
- ✅ UI component structure designed
- ✅ File type validation rules established

No NEEDS CLARIFICATION markers remain.

---

## Phase 1: Design & Contracts Complete ✅

**Outputs**:
- ✅ `data-model.md` - Entity definitions, relationships, validation rules
- ✅ `contracts/lesson-materials-api.yaml` - OpenAPI specification
- ✅ `quickstart.md` - Integration guide and examples

**Key Design Decisions**:
1. Materials managed via lesson API with `materials` array in payload
2. Reuse existing upload infrastructure (`useAssetApi`, `useFileUpload`)
3. Component-first architecture with separate admin/student components
4. Access control follows lesson access rules
5. Type definitions in `types/course.type.ts`

---

## Phase 2: Tasks (Next Step)

**Command**: `/speckit.tasks`

Tasks will be generated from the plan and specification. This phase is handled by a separate command.
