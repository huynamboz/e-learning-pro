# Research: Standalone Quiz Management

**Feature**: Standalone Quiz Management  
**Date**: 2025-01-15  
**Purpose**: Resolve technical unknowns and establish implementation patterns

## API Integration Patterns

### Decision: Use Existing API Client Pattern
**Rationale**: The project already has a well-established pattern using `useApiClient()` from `~/api/apiClient`. All existing composables (e.g., `useQuizApi`, `useCourseApi`, `useAuthApi`) follow this pattern. Maintaining consistency reduces cognitive load and ensures proper error handling, authentication, and token management.

**Alternatives Considered**:
- Creating a new API client specifically for new quiz endpoints
- Using direct fetch calls
- Using a different HTTP client library

**Rejected Because**: Would introduce inconsistency, duplicate error handling logic, and require additional maintenance.

### Decision: Create New Composable `useNewQuizApi`
**Rationale**: Following the existing pattern where each domain has its own composable (e.g., `useQuizApi` for course-based quizzes, `useCourseApi` for courses). This provides clear separation of concerns and makes it easy to distinguish between course-based and standalone quiz operations.

**Implementation Pattern**:
```typescript
export function useNewQuizApi() {
  const apiClient = useApiClient()
  
  return {
    // Level management
    getLevels: (params?) => apiClient.get('/new_quiz/levels/', params),
    createLevel: (data) => apiClient.post('/new_quiz/levels/', data),
    // ... etc
  }
}
```

**Alternatives Considered**:
- Extending existing `useQuizApi` with new methods
- Creating a single unified quiz API composable

**Rejected Because**: Would create confusion between course-based and standalone quizzes, and violate single responsibility principle.

## Component Reuse Strategy

### Decision: Adapt Existing Quiz Editor Components
**Rationale**: The existing `QuizEditor.vue` component already handles quiz creation/editing with questions, options, and validation. Adapting it for Level-based organization instead of course/lesson structure minimizes code duplication while maintaining consistency in UI/UX.

**Changes Required**:
- Replace course/lesson selectors with Level selector
- Update form validation to require Level instead of lesson
- Update API payload structure to use `level_id` instead of `lesson`
- Maintain all existing question type support (MCQ, text input, essay)

**Alternatives Considered**:
- Creating completely new components from scratch
- Creating wrapper components that modify existing ones

**Rejected Because**: Would duplicate significant logic and increase maintenance burden. Wrapper approach would add unnecessary complexity.

## Navigation and Routing

### Decision: Add New Admin Sidebar Tab
**Rationale**: The admin sidebar already has a pattern for navigation items (see `composables/useSidebar.ts`). Adding a new tab clearly separates standalone quiz management from course-based quiz management, making it easy for admins to understand the distinction.

**Implementation**:
- Add new menu item to `menuAdmin` computed property in `useSidebar.ts`
- Use route `/admin/new-quiz-management` to distinguish from `/admin/quiz-management` (existing course-based)
- Follow existing icon and styling patterns

**Alternatives Considered**:
- Adding submenu under existing quiz management
- Using tabs within existing quiz management page

**Rejected Because**: Would create confusion about which quizzes are course-based vs standalone. Clear separation improves UX.

## Level Management

### Decision: Implement Level Management if Not Available
**Rationale**: Based on spec assumptions, Level management may or may not be implemented. The new quiz API requires Level selection, so we need to ensure Levels can be managed (CRUD operations). If backend already provides Level management, we'll integrate with it. If not, we'll implement it as part of this feature.

**Implementation Approach**:
- Check if Level management endpoints are available in backend
- If available: Create composable methods to call Level API
- If not available: Document as dependency/assumption for backend team
- Create Level selector component for quiz forms
- Support Level filtering in quiz list

**Alternatives Considered**:
- Hardcoding Levels
- Using course levels instead

**Rejected Because**: Spec explicitly states Levels are independent of course levels. Hardcoding would limit flexibility.

## Type Definitions

### Decision: Create New Type Definitions for Standalone Quizzes
**Rationale**: While similar to course-based quiz types, standalone quizzes have different structure (Level instead of course/lesson, different API endpoints). Creating separate types ensures type safety and prevents confusion.

**Type Structure**:
```typescript
// New types in composables/api/useNewQuizApi.ts or types/new-quiz.type.ts
export interface NewQuizLevel { ... }
export interface NewQuiz { ... }
export interface NewQuizQuestion { ... }
// Similar to existing Quiz types but with Level references
```

**Alternatives Considered**:
- Reusing existing Quiz types
- Using generic types with union types

**Rejected Because**: Would require complex type guards and reduce type safety. Separate types are clearer and safer.

## Internationalization

### Decision: Add i18n Keys for New Feature
**Rationale**: The project uses `@nuxtjs/i18n` for internationalization. All new UI labels, messages, and error texts must be added to i18n locale files (`i18n/locales/vi.json`, `i18n/locales/en.json`).

**Keys to Add**:
- `adminMenu.newQuizManagement`: "Quản lý Quiz độc lập" / "Standalone Quiz Management"
- `newQuiz.*`: All quiz-related labels
- `newQuizLevel.*`: All level-related labels
- Error messages, validation messages, success messages

**Alternatives Considered**:
- Hardcoding strings temporarily
- Using English only

**Rejected Because**: Project already has i18n infrastructure. Not using it would create inconsistency and require refactoring later.

## Error Handling

### Decision: Use Existing Error Handling Patterns
**Rationale**: The existing `useApiClient` already handles 401 errors (unauthorized), network errors, and API errors. Following the same pattern ensures consistent user experience.

**Pattern**:
- API errors are thrown and caught in components
- Use Ant Design Vue notification for user feedback
- Display appropriate error messages from API responses
- Handle validation errors from form submissions

**Alternatives Considered**:
- Creating custom error handling
- Using different notification system

**Rejected Because**: Would create inconsistency. Existing patterns are well-established and work effectively.

## State Management

### Decision: Use Component-Level State with Composables
**Rationale**: The project uses Pinia for global state, but most quiz management operations are component-scoped. Using reactive refs in composables and components is sufficient and follows existing patterns (see `useQuizApi` usage in components).

**Pattern**:
- Component-level reactive state for quiz list, current quiz, loading states
- Composable methods return promises (no global state caching)
- Use Pinia only if cross-component state sharing is needed

**Alternatives Considered**:
- Creating Pinia stores for quiz management
- Using global state for all quiz data

**Rejected Because**: Would add unnecessary complexity. Component-level state is sufficient for admin management pages.

## Performance Considerations

### Decision: Implement Efficient Filtering and Pagination
**Rationale**: Success criteria require filtering 100+ quizzes within 10 seconds. Backend API supports query parameters for filtering. Frontend should implement:
- Debounced search input
- Efficient filter application
- Pagination support if backend provides it
- Loading states during API calls

**Implementation**:
- Use `watch` with debounce for search
- Build query parameters efficiently
- Show loading indicators during API calls
- Cache Level list (changes infrequently)

**Alternatives Considered**:
- Client-side filtering only
- Loading all quizzes at once

**Rejected Because**: Would not scale. Backend filtering is more efficient for large datasets.

## Summary

All technical decisions align with existing project patterns and architecture. No major unknowns remain. Implementation can proceed following established conventions for:
- API composables
- Component structure
- Routing and navigation
- Type definitions
- Error handling
- Internationalization
