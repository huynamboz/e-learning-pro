<!--
Sync Impact Report:
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial creation)
Added sections: All core principles (I-VII), Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section updated with Vue/Nuxt-specific gates
  ⚠️ spec-template.md - No changes needed (generic template works for Vue/Nuxt)
  ⚠️ tasks-template.md - No changes needed (generic template works for Vue/Nuxt)
Follow-up TODOs: None
-->

# E-Learning Platform Constitution

## Core Principles

### I. Component-First Architecture
Every feature MUST be implemented as reusable Vue components. Components MUST be self-contained with clear props/emits contracts. Shared logic MUST be extracted into composables. Page components SHOULD orchestrate components rather than contain business logic directly.

**Rationale**: Vue's component model enables reusability, testability, and maintainability. Separating concerns between components, composables, and pages reduces coupling and improves developer experience.

### II. Type Safety (NON-NEGOTIABLE)
All TypeScript interfaces MUST be defined in `types/` directory. API responses MUST be typed. Props and emits MUST have explicit types. Avoid `any` type except for third-party library integrations where unavoidable.

**Rationale**: Type safety prevents runtime errors, improves IDE support, and serves as living documentation. This is critical for a complex e-learning platform with multiple data models.

### III. API Integration Standards
API calls MUST use composables from `composables/api/`. All API errors MUST be handled with user-friendly messages. Loading states MUST be displayed during async operations. Authentication tokens MUST be managed centrally via `useAuth()` composable.

**Rationale**: Centralized API logic ensures consistent error handling, authentication, and reduces code duplication across the application.

### IV. Internationalization (i18n)
All user-facing text MUST use `$t()` or `t()` from `useI18n()`. Translation keys MUST follow hierarchical structure (e.g., `admin.orders.table.columns.invoice`). New features MUST include translations for both Vietnamese (`vi.json`) and English (`en.json`).

**Rationale**: The platform serves Vietnamese and international users. i18n ensures maintainable multi-language support and enables future language additions.

### V. State Management
Global state MUST use Pinia stores. Component-local state SHOULD use `ref()` or `reactive()`. Shared state between sibling components SHOULD be lifted to a common parent or Pinia store. Cart, authentication, and user preferences MUST use Pinia stores.

**Rationale**: Pinia provides type-safe, devtools-integrated state management. Clear boundaries between local and global state prevent prop drilling and maintainability issues.

### VI. UI Component Libraries
Ant Design Vue components MUST be used for complex UI patterns (tables, forms, modals, notifications). shadcn-nuxt components SHOULD be used for custom UI elements. Tailwind CSS utility classes MUST be used for styling. Custom CSS SHOULD be avoided unless absolutely necessary.

**Rationale**: Leveraging established component libraries accelerates development and ensures accessibility. Tailwind provides consistent design system implementation.

### VII. Error Handling & User Feedback
API errors MUST display user-friendly notifications via `notification` from Ant Design Vue. Form validation errors MUST be displayed inline using Ant Design Vue form validation. Critical errors MUST log to console for debugging. User actions MUST provide immediate feedback (loading states, success/error messages).

**Rationale**: Clear error communication improves user experience and reduces support burden. Consistent error handling patterns make debugging easier.

## Development Workflow

### Code Quality
- ESLint MUST pass before commit (enforced via `@nuxt/eslint`)
- Prettier MUST format code (enforced via `prettier` script)
- TypeScript errors MUST be resolved before merge
- Components MUST follow Vue 3 Composition API with `<script setup lang="ts">`

### Testing Requirements
- Critical user flows (authentication, checkout, enrollment) SHOULD have manual test scenarios documented
- API integration points MUST be tested with real backend responses
- Component props/emits MUST be validated at development time via TypeScript

### File Organization
- Pages MUST be in `pages/` directory following Nuxt routing conventions
- Components MUST be in `components/` with logical subdirectories (e.g., `components/admin/`, `components/course/`)
- Composables MUST be in `composables/` directory
- Types MUST be in `types/` directory organized by domain (e.g., `course.type.ts`, `auth.type.ts`)
- API client logic MUST be in `composables/api/` directory

## Governance

This constitution supersedes all other coding standards and practices. All pull requests and code reviews MUST verify compliance with these principles. When principles conflict with implementation needs, the conflict MUST be documented in the PR with justification for the deviation.

Amendments to this constitution require:
1. Documentation of the proposed change and rationale
2. Review and approval from project maintainers
3. Update to version number following semantic versioning (MAJOR.MINOR.PATCH)
4. Propagation of changes to dependent templates and documentation

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
