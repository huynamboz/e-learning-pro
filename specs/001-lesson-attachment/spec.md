# Feature Specification: Upload Attachments for Individual Lessons

**Feature Branch**: `001-lesson-attachment`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "@docs/upload-attachment.md hiện tại chúng ta đã có apply upload tài liệu nhưng là upload cho toàn bộ course, giờ tôi cần upload cho từng lessons, kiểm tra docs tôi đính kèm xem có api nào support không"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Teacher Uploads Material to a Lesson (Priority: P1)

A teacher wants to attach supplementary materials (PDFs, documents, images, etc.) to a specific lesson to provide additional resources for students. Currently, materials can only be uploaded at the course level, which doesn't allow for lesson-specific content organization.

**Why this priority**: This is the core functionality that enables teachers to provide lesson-specific materials, improving content organization and student learning experience. Without this, teachers cannot associate materials with specific lessons.

**Independent Test**: Can be fully tested by navigating to a lesson edit page, uploading a file attachment, and verifying it appears associated with that specific lesson. Delivers immediate value by allowing granular content organization.

**Acceptance Scenarios**:

1. **Given** a teacher is editing a lesson, **When** they upload a PDF file attachment, **Then** the file is successfully uploaded and associated with that specific lesson
2. **Given** a teacher has uploaded a material to a lesson, **When** they view the lesson details, **Then** the material is displayed in a materials section for that lesson
3. **Given** a teacher uploads multiple files to a lesson, **When** they save the lesson, **Then** all files are associated with the lesson and displayed in a list

---

### User Story 2 - Teacher Views and Manages Lesson Materials (Priority: P2)

A teacher wants to view all materials attached to a lesson, edit material metadata (title, description), and remove materials that are no longer needed.

**Why this priority**: Essential for content management and maintenance. Teachers need to review, update, and clean up lesson materials over time.

**Independent Test**: Can be fully tested by viewing a lesson with existing materials, editing material details, and deleting materials. Delivers value through content lifecycle management.

**Acceptance Scenarios**:

1. **Given** a lesson has multiple materials attached, **When** a teacher views the lesson edit page, **Then** all materials are displayed in a materials list with their titles, file types, and file sizes
2. **Given** a teacher is viewing a lesson material, **When** they edit the material's title or description, **Then** the changes are saved and reflected in the materials list
3. **Given** a teacher wants to remove a material, **When** they delete it from the lesson, **Then** the material is removed from the lesson and no longer appears in the materials list

---

### User Story 3 - Student Accesses Lesson Materials (Priority: P3)

A student enrolled in a course wants to access materials attached to a specific lesson they are studying. The materials should be accessible based on their enrollment status and lesson access permissions.

**Why this priority**: Students need to access lesson-specific materials to complete their learning. This completes the user journey from teacher upload to student consumption.

**Independent Test**: Can be fully tested by a student navigating to a lesson they have access to and viewing/downloading the associated materials. Delivers value by providing students with lesson-specific resources.

**Acceptance Scenarios**:

1. **Given** a student is enrolled in a course and viewing a lesson, **When** the lesson has materials attached, **Then** the materials are displayed in a materials section within the lesson view
2. **Given** a student is viewing lesson materials, **When** they click on a material, **Then** the material opens or downloads based on its file type
3. **Given** a student is viewing a preview lesson, **When** the lesson has materials, **Then** the materials are accessible (following preview lesson access rules)
4. **Given** a student is not enrolled in a course, **When** they view a non-preview lesson, **Then** lesson materials are not displayed or are gated based on access permissions

---

### Edge Cases

- What happens when a teacher uploads a file that exceeds the maximum file size limit?
- How does the system handle upload failures (network errors, S3 errors) during material upload?
- What happens when a lesson is deleted - should associated materials be deleted or orphaned?
- How does the system handle concurrent uploads of multiple materials to the same lesson?
- What happens when a teacher uploads a file with an unsupported file type?
- How does the system handle materials when a lesson is moved to a different chapter?
- What happens when a student's enrollment expires - should they lose access to lesson materials?
- How does the system handle materials for lessons in resource-type courses vs course-type courses?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow teachers to upload file attachments (PDF, DOC, PPT, ZIP, images, audio) to individual lessons
- **FR-002**: System MUST associate uploaded materials with a specific lesson, not just the course
- **FR-003**: System MUST display uploaded materials in the lesson edit interface for teachers
- **FR-004**: System MUST allow teachers to view, edit, and delete materials associated with a lesson
- **FR-005**: System MUST validate file types and sizes before allowing upload
- **FR-006**: System MUST use the existing upload infrastructure (presigned URLs, S3) for lesson materials
- **FR-007**: System MUST display lesson materials to enrolled students in the lesson view
- **FR-008**: System MUST enforce access control for lesson materials based on student enrollment and lesson preview status
- **FR-009**: System MUST support multiple materials per lesson
- **FR-010**: System MUST display material metadata (title, file type, file size, upload date) to both teachers and students
- **FR-011**: System MUST allow teachers to provide a title and description for each uploaded material
- **FR-012**: System MUST handle upload progress and display errors if upload fails
- **FR-013**: System MUST use the `lesson-materials` folder option when uploading via the system upload endpoint
- **FR-014**: System MUST manage lesson materials through the lesson API (PATCH/PUT lesson with materials array in payload)

### Key Entities *(include if feature involves data)*

- **Lesson Material**: Represents a file attachment associated with a specific lesson. Key attributes include: lesson association, file URL, file type, file size, title, description, upload date, uploaded by user
- **Lesson**: Represents a lesson within a course chapter. Relationship: A lesson can have multiple materials, materials belong to one lesson

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Teachers can upload a material to a lesson in under 2 minutes from the lesson edit page
- **SC-002**: System successfully uploads and associates materials with lessons 99% of the time (allowing for network/S3 failures)
- **SC-003**: Teachers can view all materials for a lesson within 1 second of loading the lesson edit page
- **SC-004**: Students can access lesson materials within 2 seconds of opening a lesson they have access to
- **SC-005**: 95% of material uploads complete without requiring retry or manual intervention
- **SC-006**: System displays appropriate error messages for failed uploads 100% of the time
- **SC-007**: Access control correctly gates lesson materials based on enrollment status 100% of the time

## Assumptions

- Lesson materials are managed through the lesson API (PATCH/PUT lesson endpoint) with materials included as an array in the lesson payload
- The lesson API supports a `materials` field (array) in the lesson payload for creating/updating lesson materials
- The system upload endpoint `/api/v1/system/upload-attachment-url/` with `folder: "lesson-materials"` is available and functional
- File size limits and allowed file types follow the same rules as course-level asset uploads
- Access control for lesson materials follows the same gating logic as lesson video content (enrollment for course-type, CourseAccess for resource-type, preview lessons always accessible)
- Materials are stored in S3 using the same presigned URL workflow as course assets
- The lesson edit page can be extended to include a materials management section
- When updating lesson materials, the entire materials array is sent in the lesson PATCH/PUT request

## Dependencies

- Lesson API endpoint (PATCH/PUT) that supports `materials` array field in the lesson payload
- Existing upload infrastructure (presigned URLs, S3 integration)
- Lesson edit page UI component
- Student lesson view UI component
- Access control system for lessons

## Out of Scope

- Bulk upload of materials to multiple lessons at once
- Material versioning or revision history
- Material sharing between lessons
- Material analytics (download counts, view counts)
- Material comments or annotations
- Material organization within a lesson (folders, categories)
