# Research: Upload Attachments for Individual Lessons

**Feature**: Upload Attachments for Individual Lessons  
**Date**: 2025-01-27  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Lesson API Materials Array Structure

**Question**: What is the exact structure of the `materials` array in the lesson API payload?

**Research Method**: 
- Review existing lesson API usage in codebase
- Check lesson edit page implementation
- Review API documentation

**Findings**:
- Lesson API uses `useCourseApi().updateLesson()` and `useCourse().createLesson()`
- Lesson payload is defined in `types/course.type.ts` as `LessonPayload`
- Current `LessonPayload` does not include `materials` field
- Backend API supports materials array (confirmed via user clarification: Option C)

**Decision**: 
- Add `materials?: LessonMaterial[]` to `LessonPayload` interface
- Materials array structure: `{ id?: string, title: string, description?: string, file_url: string, file_type: string, file_size: number }`
- When creating new materials, omit `id` (backend generates)
- When updating existing materials, include `id` to identify which material to update

**Rationale**: 
- Follows existing pattern of lesson API managing lesson data
- Materials are lesson-specific, so including them in lesson payload is logical
- Backend confirmed to support this approach

**Alternatives Considered**:
- Separate materials API endpoint - Rejected: User confirmed materials are managed via lesson API
- Nested materials object - Rejected: Array is simpler and matches backend structure

---

### 2. Upload Workflow Integration

**Question**: How to integrate lesson material upload with existing upload infrastructure?

**Research Method**:
- Review `useAssetApi().getAttachmentUploadUrl()` implementation
- Review `useFileUpload()` composable
- Review existing resource upload component (`ResourceFormModal.vue`)

**Findings**:
- `getAttachmentUploadUrl()` accepts `folder` parameter (default: 'attachments')
- For lesson materials, use `folder: 'lesson-materials'`
- Upload workflow: Get presigned URL → Upload to S3 → Get public URL → Include in lesson payload
- Existing `uploadFileWithProgress()` function handles S3 upload with progress tracking

**Decision**:
- Use `useAssetApi().getAttachmentUploadUrl(fileName, contentType, 'lesson-materials')`
- Use `useFileUpload().uploadFileWithProgress()` for S3 upload
- Store public URL from upload response
- Include material data (title, description, file_url) in lesson `materials` array when saving

**Rationale**:
- Reuses existing, tested upload infrastructure
- Consistent with course asset upload pattern
- Reduces code duplication

**Alternatives Considered**:
- Create new upload composable - Rejected: Existing infrastructure is sufficient
- Direct S3 upload without presigned URLs - Rejected: Security and backend validation requirements

---

### 3. Access Control for Lesson Materials

**Question**: How should access control work for lesson materials?

**Research Method**:
- Review lesson access control logic in learning page
- Review docs on gating logic for lessons
- Check how course assets handle access control

**Findings**:
- Lessons have `has_access` field based on enrollment/CourseAccess
- Preview lessons are always accessible
- Course-type courses: Check enrollment in classroom
- Resource-type courses: Check CourseAccess
- Docs mention `LessonMaterial` has `has_access` field and gating logic

**Decision**:
- Lesson materials follow same access control as lesson video content
- If lesson `has_access === false` and not preview → materials not displayed
- If lesson `has_access === true` or is preview → materials displayed
- Backend handles gating (returns `file_path: null` if no access)

**Rationale**:
- Consistent with existing lesson access patterns
- Backend already implements gating logic
- Simplifies frontend implementation

**Alternatives Considered**:
- Separate access check for materials - Rejected: Materials are part of lesson, should follow lesson access
- Always show materials metadata - Rejected: Security concern, file URLs should be gated

---

### 4. UI Component Structure

**Question**: What is the best component structure for materials management?

**Research Method**:
- Review existing resource upload component structure
- Review lesson edit page structure
- Review learning page structure

**Findings**:
- `ResourceFormModal.vue` handles course asset upload with drag-and-drop
- Lesson edit page uses Ant Design Vue form components
- Learning page uses tabs for different content sections
- Components are organized by feature area (admin vs learning)

**Decision**:
- Create `LessonMaterialUpload.vue` for admin upload interface
- Create `LessonMaterialList.vue` for admin materials list with edit/delete
- Create `LessonMaterialItem.vue` for reusable material item display
- Create `LessonMaterialList.vue` in `components/learning/` for student view
- Integrate into lesson edit page as a new section
- Integrate into learning page in existing lesson view

**Rationale**:
- Follows component-first architecture
- Reusable components reduce duplication
- Clear separation between admin and student interfaces

**Alternatives Considered**:
- Single component for both admin and student - Rejected: Different functionality (edit vs view)
- Inline materials management in lesson edit page - Rejected: Violates component-first principle

---

### 5. File Type Validation

**Question**: What file types should be allowed for lesson materials?

**Research Method**:
- Review course asset upload file type restrictions
- Review upload-attachment.md documentation

**Findings**:
- Course assets support: PDF, DOC, PPT, ZIP, images, audio
- Upload endpoint validates content types
- Same restrictions should apply to lesson materials

**Decision**:
- Support same file types as course assets: PDF, DOC, DOCX, PPT, PPTX, ZIP, images (JPEG, PNG, GIF), audio (MP3, WAV)
- Validate file type on frontend before upload
- Backend will also validate content type

**Rationale**:
- Consistent with existing asset upload behavior
- Reduces complexity
- Users expect same file types to work

**Alternatives Considered**:
- More restrictive file types - Rejected: No business need identified
- More permissive file types - Rejected: Security and storage concerns

---

## Summary

All research tasks completed. No NEEDS CLARIFICATION markers remain. Key decisions:
1. Materials managed via lesson API with `materials` array in payload
2. Use existing upload infrastructure with `folder: 'lesson-materials'`
3. Access control follows lesson access rules
4. Component-first structure with separate admin/student components
5. File type validation matches course assets

