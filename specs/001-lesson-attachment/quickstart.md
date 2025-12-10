# Quickstart: Upload Attachments for Individual Lessons

**Feature**: Upload Attachments for Individual Lessons  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Overview

This feature enables teachers to upload file attachments (PDFs, documents, images, audio) to individual lessons, allowing lesson-specific content organization. Materials are managed through the lesson API and displayed to students based on access control.

## Key Components

### Admin Components (Teacher Interface)

1. **`LessonMaterialUpload.vue`**
   - Location: `components/admin/course/lesson/LessonMaterialUpload.vue`
   - Purpose: File upload interface with drag-and-drop
   - Props: `lessonId`, `onUploadComplete`
   - Emits: `upload-complete` (with material data)

2. **`LessonMaterialList.vue`**
   - Location: `components/admin/course/lesson/LessonMaterialList.vue`
   - Purpose: Display and manage list of materials
   - Props: `materials: LessonMaterial[]`, `lessonId`
   - Emits: `update`, `delete`

3. **`LessonMaterialItem.vue`**
   - Location: `components/admin/course/lesson/LessonMaterialItem.vue`
   - Purpose: Individual material item with edit/delete actions
   - Props: `material: LessonMaterial`
   - Emits: `edit`, `delete`

### Student Components (Learning Interface)

1. **`LessonMaterialList.vue`**
   - Location: `components/learning/LessonMaterialList.vue`
   - Purpose: Display materials for students (read-only)
   - Props: `materials: LessonMaterial[]`

## Integration Points

### Lesson Edit Page

**File**: `pages/admin/courses/[id]/chapters/[chapterId]/lessons-[lessonId].vue`

**Changes**:
1. Add materials section to form
2. Include `materials` in `formState`
3. Load materials when fetching lesson
4. Save materials array when saving lesson

**Example Integration**:
```vue
<template>
  <!-- Existing lesson form fields -->
  
  <!-- New Materials Section -->
  <div class="materials-section">
    <h3>{{ t('admin.formLesson.materials.title') }}</h3>
    <LessonMaterialUpload 
      :lesson-id="lessonId"
      @upload-complete="handleMaterialUpload"
    />
    <LessonMaterialList
      v-if="formState.materials?.length"
      :materials="formState.materials"
      :lesson-id="lessonId"
      @update="handleMaterialUpdate"
      @delete="handleMaterialDelete"
    />
  </div>
</template>

<script setup lang="ts">
// Add materials to formState
const formState = ref<LessonPayload>({
  // ... existing fields
  materials: [],
})

// Load materials when fetching lesson
async function fetchLesson() {
  // ... existing code
  if (currentLesson.value?.materials) {
    formState.value.materials = currentLesson.value.materials
  }
}

// Handle material upload
function handleMaterialUpload(material: LessonMaterial) {
  if (!formState.value.materials) {
    formState.value.materials = []
  }
  formState.value.materials.push(material)
}

// Handle material update/delete
function handleMaterialUpdate(updatedMaterials: LessonMaterial[]) {
  formState.value.materials = updatedMaterials
}

function handleMaterialDelete(materialId: string) {
  if (formState.value.materials) {
    formState.value.materials = formState.value.materials.filter(m => m.id !== materialId)
  }
}
</script>
```

### Learning Page

**File**: `pages/learning/[id].vue`

**Changes**:
1. Display materials in lesson view
2. Check access before displaying materials

**Example Integration**:
```vue
<template>
  <!-- Existing lesson content -->
  
  <!-- Materials Section -->
  <div v-if="activeLesson?.materials?.length && (activeLesson.has_access || activeLesson.is_preview)">
    <h3>{{ t('learning.lesson.materials.title') }}</h3>
    <LessonMaterialList :materials="activeLesson.materials" />
  </div>
</template>
```

## Type Definitions

**File**: `types/course.type.ts`

```typescript
export interface LessonMaterial {
  id?: string
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at?: string
  uploaded_by?: number
  has_access?: boolean
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

## API Usage

### Upload Material

```typescript
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useFileUpload } from '~/composables/useFileUpload'

const assetApi = useAssetApi()
const { uploadFileWithProgress } = useFileUpload()

// Step 1: Get presigned URL
const presignedResponse = await assetApi.getAttachmentUploadUrl(
  file.name,
  file.type,
  'lesson-materials'
)

// Step 2: Upload to S3
await uploadFileWithProgress(
  file,
  presignedResponse.upload_url,
  (progress) => {
    // Update progress
  }
)

// Step 3: Create material object
const material: LessonMaterial = {
  title: 'Lesson Notes',
  description: 'Additional notes',
  file_url: presignedResponse.public_url,
  file_type: file.type,
  file_size: file.size
}

// Step 4: Add to lesson materials array and save
formState.value.materials = [...(formState.value.materials || []), material]
await saveLesson() // Includes materials in payload
```

### Update Lesson with Materials

```typescript
import { useCourse } from '~/composables/useCourse'

const { updateLesson } = useCourse()

await updateLesson(
  courseId,
  chapterId,
  lessonId,
  {
    ...formState.value,
    materials: formState.value.materials // Full array
  }
)
```

## Translation Keys

**Files**: `i18n/locales/vi.json`, `i18n/locales/en.json`

```json
{
  "admin": {
    "formLesson": {
      "materials": {
        "title": "Tài liệu bài học",
        "upload": "Tải lên tài liệu",
        "uploadDescription": "Kéo thả file hoặc click để chọn",
        "addMaterial": "Thêm tài liệu",
        "editMaterial": "Chỉnh sửa tài liệu",
        "deleteMaterial": "Xóa tài liệu",
        "materialTitle": "Tiêu đề",
        "materialDescription": "Mô tả",
        "fileType": "Loại file",
        "fileSize": "Kích thước",
        "uploadedAt": "Ngày tải lên",
        "empty": "Chưa có tài liệu nào",
        "notifications": {
          "uploadSuccess": "Tải lên tài liệu thành công",
          "uploadFailed": "Tải lên tài liệu thất bại",
          "saveSuccess": "Lưu tài liệu thành công",
          "saveFailed": "Lưu tài liệu thất bại",
          "deleteSuccess": "Xóa tài liệu thành công",
          "deleteFailed": "Xóa tài liệu thất bại"
        }
      }
    }
  },
  "learning": {
    "lesson": {
      "materials": {
        "title": "Tài liệu bài học",
        "download": "Tải xuống",
        "open": "Mở",
        "empty": "Không có tài liệu nào",
        "noAccess": "Bạn không có quyền truy cập tài liệu này"
      }
    }
  }
}
```

## Testing Checklist

- [ ] Upload single material to lesson
- [ ] Upload multiple materials to lesson
- [ ] Edit material title/description
- [ ] Delete material from lesson
- [ ] View materials as student (enrolled)
- [ ] View materials as student (preview lesson)
- [ ] Materials not visible when no access
- [ ] File type validation (reject invalid types)
- [ ] File size validation
- [ ] Upload progress display
- [ ] Error handling (network errors, S3 errors)
- [ ] Materials persist after lesson save
- [ ] Materials load when editing existing lesson

## Next Steps

1. Create component files
2. Add type definitions
3. Add translation keys
4. Integrate into lesson edit page
5. Integrate into learning page
6. Test upload flow
7. Test access control

