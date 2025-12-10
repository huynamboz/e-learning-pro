# Data Model: Upload Attachments for Individual Lessons

**Feature**: Upload Attachments for Individual Lessons  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Entities

### LessonMaterial

Represents a file attachment associated with a specific lesson.

**Attributes**:
- `id` (string, optional): Unique identifier for the material. Omitted when creating new materials, included when updating.
- `title` (string, required): Display name for the material
- `description` (string, optional): Additional description or notes about the material
- `file_url` (string, required): Public URL of the uploaded file (from S3)
- `file_type` (string, required): MIME type of the file (e.g., "application/pdf", "image/png")
- `file_size` (number, required): Size of the file in bytes
- `uploaded_at` (string, optional, read-only): ISO 8601 timestamp when material was uploaded
- `uploaded_by` (number, optional, read-only): User ID of the person who uploaded the material

**Relationships**:
- Belongs to: `Lesson` (many-to-one)
- A lesson can have multiple materials
- Materials are deleted when lesson is deleted (cascade)

**Validation Rules**:
- `title`: Required, max length 255 characters
- `file_url`: Required, must be valid URL
- `file_type`: Required, must be in allowed list (PDF, DOC, PPT, ZIP, images, audio)
- `file_size`: Required, must be positive number, max size per backend configuration

**State Transitions**:
- **Create**: Material added to lesson's `materials` array → Backend creates material record
- **Update**: Material `id` and updated fields in `materials` array → Backend updates material
- **Delete**: Material removed from `materials` array → Backend deletes material record

---

### Lesson (Updated)

**New Fields**:
- `materials?: LessonMaterial[]` (optional): Array of materials associated with this lesson

**Updated Relationships**:
- Has many: `LessonMaterial` (one-to-many)

**Validation Rules**:
- `materials`: Optional array, each item must be valid `LessonMaterial` object
- When updating lesson, entire `materials` array is sent (not incremental updates)

---

## API Data Flow

### Upload Material Flow

1. **Get Presigned URL**:
   ```
   POST /api/v1/system/upload-attachment-url/
   Body: { file_name: string, content_type: string, folder: "lesson-materials" }
   Response: { upload_url: string, public_url: string, key: string, expires_in: number }
   ```

2. **Upload to S3**:
   ```
   PUT {upload_url}
   Body: File binary
   Headers: Content-Type: {file.type}
   ```

3. **Create/Update Lesson with Material**:
   ```
   PATCH /api/v1/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}/
   Body: {
     ...existing lesson fields,
     materials: [
       {
         id?: string,  // Omit for new, include for existing
         title: string,
         description?: string,
         file_url: string,  // From step 1 response
         file_type: string,
         file_size: number
       }
     ]
   }
   ```

### Retrieve Lesson with Materials

```
GET /api/v1/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}/
Response: {
  ...lesson fields,
  materials: [
    {
      id: string,
      title: string,
      description: string,
      file_url: string | null,  // null if no access
      file_type: string,
      file_size: number,
      uploaded_at: string,
      uploaded_by: number,
      has_access: boolean  // Read-only, from backend
    }
  ]
}
```

---

## TypeScript Interfaces

```typescript
// types/course.type.ts

export interface LessonMaterial {
  id?: string  // Optional for create, required for update
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at?: string  // Read-only from API
  uploaded_by?: number  // Read-only from API
  has_access?: boolean  // Read-only from API
}

// Update existing interfaces
export interface LessonPayload {
  // ... existing fields
  materials?: LessonMaterial[]
}

export interface Lesson {
  // ... existing fields
  materials?: LessonMaterial[]
}
```

---

## Database Schema (Backend Reference)

**Note**: This is for reference only. Frontend does not directly interact with database.

```sql
-- LessonMaterial table (backend)
CREATE TABLE courses_lesson_material (
    id UUID PRIMARY KEY,
    lesson_id UUID REFERENCES courses_lesson(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by INTEGER REFERENCES accounts_user(id),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lesson_material_lesson ON courses_lesson_material(lesson_id);
```

---

## Access Control Rules

### Teacher/Admin
- Can view all materials for any lesson
- Can create, update, and delete materials for lessons they own or have admin access

### Student
- Can view materials only if:
  - Lesson `has_access === true` OR
  - Lesson `is_preview === true`
- Backend returns `file_url: null` if no access
- Backend returns `has_access: false` in material object if no access

### Anonymous
- Can view materials only for preview lessons
- `file_url` will be `null` for non-preview lessons

---

## Edge Cases Handled

1. **File Upload Failure**: Material not added to lesson, error displayed to user
2. **Lesson Save Failure**: Uploaded file remains in S3, but material not associated with lesson (may need cleanup)
3. **Concurrent Uploads**: Each upload handled independently, materials array updated atomically on lesson save
4. **Large Files**: Progress tracking displayed, timeout handling for very large files
5. **Invalid File Types**: Frontend validation prevents upload, error message displayed
6. **Network Errors**: Retry mechanism or clear error message to user
7. **Lesson Deletion**: Backend cascade deletes associated materials (handled by backend)

