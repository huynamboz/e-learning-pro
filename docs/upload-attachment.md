# 📚 Lesson Materials Upload & Management - Hướng dẫn Chi tiết

## 🎯 Tổng quan

Lesson Materials là các tài liệu (PDF, DOC, PPT, ZIP, Image, Audio, Video) được gắn với từng lesson cụ thể. Hệ thống hỗ trợ:

1. **Upload file** qua S3 Presigned URL (riêng cho lesson)
2. **Tạo/Cập nhật materials** khi update lesson (nested write)
3. **Quản lý materials** qua API riêng

---

## 📋 Workflow Tổng Quan

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 1. POST /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/upload-material-url/
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Django)   │
└──────┬──────┘
       │
       │ 2. Generate presigned URL từ S3
       │
       ▼
┌─────────────┐
│  AWS S3     │
└──────┬──────┘
       │
       │ 3. Trả về upload_url + public_url
       │
       ▼
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 4. PUT file lên S3 bằng upload_url
       │
       ▼
┌─────────────┐
│  AWS S3     │
│  (Storage)  │
└──────┬──────┘
       │
       │ 5. File đã upload, dùng public_url
       │
       ▼
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 6. PUT/PATCH /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/
       │    với materials array chứa public_url
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Database) │
└─────────────┘
```

---

## 📤 Upload Material File

### Endpoint: `POST /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/upload-material-url/`

**URL:** `https://api.hoctiengycungphantam.com/api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/upload-material-url/`

**Permission:** `IsOwnerTeacherOrAdmin` (teacher của course hoặc staff)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body (Payload):**
```json
{
  "file_name": "lesson-material.pdf",
  "content_type": "application/pdf"
}
```

**Request Fields:**
- `file_name` (required): Tên file gốc với extension (e.g., `"lesson-material.pdf"`, `"lecture-notes.docx"`)
- `content_type` (required): MIME type của file (e.g., `"application/pdf"`, `"image/jpeg"`)

**Response (200 OK):**
```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.pdf?X-Amz-Algorithm=...&X-Amz-Expires=3600&X-Amz-Signature=...",
  "key": "courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.pdf",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.pdf",
  "expires_in": 3600,
  "file_name": "{uuid}.pdf"
}
```

**Response Fields:**
- `upload_url`: Presigned URL để upload file (PUT request), **expires sau 1 giờ**
- `key`: S3 object key (path trong bucket) - Format: `courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.{ext}`
- `public_url`: URL công khai để truy cập file sau khi upload (permanent) - **Dùng URL này trong LessonMaterial.file_path**
- `expires_in`: Thời gian hết hạn của upload_url (seconds), default: 3600 (1 giờ)
- `file_name`: Tên file unique được generate (UUID + extension)

**Lưu ý:**
- Backend tự động generate unique filename (UUID) để tránh conflict
- File được lưu tại: `courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.{ext}` - **riêng biệt cho từng lesson**
- `upload_url` chỉ valid trong **1 giờ** - phải upload ngay sau khi nhận được
- Sau khi upload thành công, dùng `public_url` để tạo/update LessonMaterial

**Example Request (cURL):**
```bash
curl -X POST "https://api.hoctiengycungphantam.com/api/v1/courses/b53225f9-e3ec-48e8-998e-b90ee0630757/chapters/aa0fa051-72a9-4e14-b897-094ac16fc91f/lessons/bde01fd9-e51b-4085-b30b-5aafbb276d0e/upload-material-url/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "lesson-material.pdf",
    "content_type": "application/pdf"
  }'
```

**Example Request (JavaScript/Fetch):**
```javascript
const response = await fetch('https://api.hoctiengycungphantam.com/api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/upload-material-url/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    file_name: 'lesson-material.pdf',
    content_type: 'application/pdf'
  }),
});

const data = await response.json();
console.log('Upload URL:', data.upload_url);
console.log('Public URL:', data.public_url); // Dùng URL này cho LessonMaterial
```

---

## 📝 Create/Update Lesson với Materials (Nested Write)

### Endpoint: `PUT/PATCH /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/`

**URL:** `https://api.hoctiengycungphantam.com/api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/`

**Permission:** `IsOwnerTeacherOrAdmin` (teacher của course hoặc staff)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body (Payload):**
```json
{
  "chapter_id": "aa0fa051-72a9-4e14-b897-094ac16fc91f",
  "title": "Lesson Title",
  "slug": "lesson-slug",
  "description": "Lesson description",
  "video_url": "https://...",
  "video_duration": 3600,
  "content": "Lesson content",
  "is_preview": false,
  "is_published": true,
  "is_unlocked": true,
  "thumbnail": "https://...",
  "materials": [
    {
      "id": "existing-material-id",  // Optional: có id = update, không có = create mới
      "title": "Photo on 8-5-25 at 23.01",
      "file_url": "https://elearn-platform.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.jpg",
      "file_type": "image/jpeg",
      "file_size": 313496,
      "order": 0,
      "is_downloadable": true
    },
    {
      "title": "New Material",
      "file_url": "https://elearn-platform.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.pdf",
      "file_type": "application/pdf",
      "file_size": 102400,
      "order": 1,
      "is_downloadable": true
    }
  ]
}
```

**Request Fields:**

**Lesson Fields:**
- `chapter_id` (optional): Chapter ID
- `title` (optional): Lesson title
- `slug` (optional): URL-friendly slug
- `description` (optional): Lesson description
- `video_url` (optional): Video URL
- `video_duration` (optional): Video duration in seconds
- `content` (optional): Lesson text content
- `is_preview` (optional): Is preview lesson?
- `is_published` (optional): Is published?
- `is_unlocked` (optional): Is unlocked?
- `thumbnail` (optional): Thumbnail URL

**Materials Array:**
- `materials` (optional): Array of material objects

**Material Object Fields:**
- `id` (optional): Material ID - **Nếu có id → update material đó, nếu không có → tạo mới**
- `title` (required): Material title
- `file_url` (required): Public URL từ upload step (sẽ được map thành `file_path`)
- `file_type` (required): MIME type hoặc model choice
  - MIME types: `"application/pdf"`, `"image/jpeg"`, `"image/png"`, `"application/msword"`, etc.
  - Model choices: `"pdf"`, `"doc"`, `"ppt"`, `"zip"`, `"image"`, `"video"`, `"audio"`, `"other"`
  - **Backend tự động convert MIME type → model choice**
- `file_size` (required): File size in bytes
- `order` (optional): Display order, default: auto-increment
- `is_downloadable` (optional): Can students download?, default: `true`

**Behavior:**
- **Materials có `id` trong payload** → Update material đó
- **Materials không có `id` trong payload** → Create material mới
- **Materials không có trong payload** → Delete materials đó (xóa khỏi lesson)

**Response (200 OK):**
```json
{
  "id": "bde01fd9-e51b-4085-b30b-5aafbb276d0e",
  "chapter_id": "aa0fa051-72a9-4e14-b897-094ac16fc91f",
  "title": "Lesson Title",
  "slug": "lesson-slug",
  "description": "Lesson description",
  "video_url": "https://...",
  "video_duration": 3600,
  "video_duration_formatted": "01:00:00",
  "content": "Lesson content",
  "order": 0,
  "is_preview": false,
  "is_published": true,
  "is_unlocked": true,
  "thumbnail": "https://...",
  "materials": [
    {
      "id": "material-uuid-1",
      "lesson_id": "bde01fd9-e51b-4085-b30b-5aafbb276d0e",
      "title": "Photo on 8-5-25 at 23.01",
      "file_path": "https://elearn-platform.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.jpg",
      "file_type": "image",
      "file_size": 313496,
      "file_size_formatted": "306.0 KB",
      "order": 0,
      "is_downloadable": true,
      "download_count": 0,
      "has_access": true,
      "uploaded_at": "2025-12-10T11:00:00Z"
    },
    {
      "id": "material-uuid-2",
      "lesson_id": "bde01fd9-e51b-4085-b30b-5aafbb276d0e",
      "title": "New Material",
      "file_path": "https://elearn-platform.s3.ap-southeast-2.amazonaws.com/courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/{uuid}.pdf",
      "file_type": "pdf",
      "file_size": 102400,
      "file_size_formatted": "100.0 KB",
      "order": 1,
      "is_downloadable": true,
      "download_count": 0,
      "has_access": true,
      "uploaded_at": "2025-12-10T11:00:00Z"
    }
  ],
  "is_completed": false,
  "comment_count": 0,
  "quiz_count": 0,
  "has_access": true,
  "created_at": "2025-12-10T10:00:00Z",
  "updated_at": "2025-12-10T11:00:00Z"
}
```

**Lưu ý:**
- Response trả về `file_path` (không phải `file_url`) vì model dùng `file_path`
- `file_type` trong response là model choice (`"image"`, `"pdf"`, etc.) không phải MIME type
- Materials được tự động sắp xếp theo `order`

---

## 🔧 Frontend Implementation

### TypeScript/JavaScript Example

```typescript
// Step 1: Get presigned URL for lesson material
async function getLessonMaterialUploadUrl(
  courseId: string,
  chapterId: string,
  lessonId: string,
  file: File
): Promise<{ upload_url: string; public_url: string }> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/upload-material-url/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type,
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }
  
  return await response.json();
}

// Step 2: Upload file to S3
async function uploadToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 204) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

// Step 3: Update lesson with materials
async function updateLessonWithMaterials(
  courseId: string,
  chapterId: string,
  lessonId: string,
  lessonData: {
    title?: string;
    description?: string;
    video_url?: string;
    materials?: Array<{
      id?: string;  // Optional: có id = update, không có = create mới
      title: string;
      file_url: string;
      file_type: string;
      file_size: number;
      order?: number;
      is_downloadable?: boolean;
    }>;
  }
): Promise<any> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...lessonData,
        chapter_id: chapterId,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update lesson');
  }
  
  return await response.json();
}

// Complete workflow: Upload file and update lesson
async function uploadAndAddMaterialToLesson(
  courseId: string,
  chapterId: string,
  lessonId: string,
  file: File,
  materialTitle: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  try {
    // Step 1: Get upload URL
    const { upload_url, public_url } = await getLessonMaterialUploadUrl(
      courseId,
      chapterId,
      lessonId,
      file
    );
    
    if (onProgress) onProgress(10);
    
    // Step 2: Upload to S3
    await uploadToS3(upload_url, file, (progress) => {
      if (onProgress) {
        onProgress(10 + (progress * 0.8));
      }
    });
    
    if (onProgress) onProgress(90);
    
    // Step 3: Get current lesson to preserve existing materials
    const currentLesson = await fetch(
      `/api/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    ).then(res => res.json());
    
    // Step 4: Add new material to existing materials
    const existingMaterials = currentLesson.materials || [];
    const newMaterial = {
      title: materialTitle,
      file_url: public_url,
      file_type: file.type,
      file_size: file.size,
      order: existingMaterials.length,
      is_downloadable: true,
    };
    
    const updatedMaterials = [...existingMaterials, newMaterial];
    
    // Step 5: Update lesson with all materials
    const updatedLesson = await updateLessonWithMaterials(
      courseId,
      chapterId,
      lessonId,
      {
        materials: updatedMaterials,
      }
    );
    
    if (onProgress) onProgress(100);
    
    return updatedLesson;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

function useLessonMaterialUpload(
  courseId: string,
  chapterId: string,
  lessonId: string
) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const uploadMaterial = async (
    file: File,
    materialTitle: string
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const lesson = await uploadAndAddMaterialToLesson(
        courseId,
        chapterId,
        lessonId,
        file,
        materialTitle,
        setProgress
      );
      
      setUploading(false);
      return lesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      throw err;
    }
  };
  
  return { uploadMaterial, uploading, progress, error };
}

// Usage in component
function LessonMaterialForm({ 
  courseId, 
  chapterId, 
  lessonId 
}: { 
  courseId: string;
  chapterId: string;
  lessonId: string;
}) {
  const { uploadMaterial, uploading, progress, error } = useLessonMaterialUpload(
    courseId,
    chapterId,
    lessonId
  );
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;
    
    try {
      const lesson = await uploadMaterial(file, title);
      console.log('Lesson updated:', lesson);
      // Reset form or show success message
      setFile(null);
      setTitle('');
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Material title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      {uploading && (
        <div>
          <progress value={progress} max={100} />
          <span>{progress}%</span>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={uploading || !file || !title}>
        Upload Material
      </button>
    </form>
  );
}
```

---

## 📊 Material Types Reference

| Material Type | MIME Type Examples | Model Choice | Extensions |
|--------------|-------------------|-------------|------------|
| **PDF** | `application/pdf` | `pdf` | `.pdf` |
| **Word Document** | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `doc` | `.doc`, `.docx` |
| **PowerPoint** | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `ppt` | `.ppt`, `.pptx` |
| **ZIP Archive** | `application/zip` | `zip` | `.zip`, `.rar` |
| **Image** | `image/jpeg`, `image/png`, `image/gif` | `image` | `.jpg`, `.jpeg`, `.png`, `.gif` |
| **Video** | `video/mp4` | `video` | `.mp4`, `.avi`, `.mov` |
| **Audio** | `audio/mpeg`, `audio/wav` | `audio` | `.mp3`, `.wav`, `.m4a` |
| **Other** | Any other type | `other` | Any |

**Lưu ý:** Backend tự động convert MIME type → model choice khi nhận payload.

---

## 🔍 LessonMaterial API (Standalone)

Ngoài nested write trong Lesson update, bạn cũng có thể quản lý materials qua API riêng:

### List Materials
```
GET /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/materials/
```

### Create Material
```
POST /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/materials/
```

### Update Material
```
PUT/PATCH /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/materials/{id}/
```

### Delete Material
```
DELETE /api/v1/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/materials/{id}/
```

---

## ⚠️ Error Handling

### Common Errors

**1. Upload URL Expired:**
```json
{
  "error": "Upload URL has expired. Please request a new one."
}
```
**Solution:** Request a new upload URL and upload immediately.

**2. Invalid Content Type:**
```json
{
  "file_type": ["Invalid file type. Allowed: pdf, doc, ppt, zip, image, video, audio, other"]
}
```
**Solution:** Check allowed file types.

**3. Permission Denied:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```
**Solution:** Ensure user is teacher of the course or staff.

**4. Material Not Found (when updating with id):**
- Material với `id` không tồn tại → sẽ bị skip (không tạo mới)
- Chỉ materials không có `id` mới được tạo mới

---

## 📊 Best Practices

1. **Upload Immediately:** `upload_url` expires in 1 hour, upload file as soon as possible
2. **Progress Tracking:** Use XMLHttpRequest or fetch with progress events for better UX
3. **Error Handling:** Always handle errors at each step (URL generation, upload, lesson update)
4. **File Validation:** Validate file size and type on frontend before upload
5. **Material Management:** 
   - Use nested write trong Lesson update để quản lý materials cùng lúc
   - Hoặc dùng API riêng nếu chỉ cần CRUD materials
6. **Preserve Existing Materials:** Khi update lesson, luôn include existing materials trong payload nếu không muốn xóa chúng

---

## 🔄 So sánh: CourseAsset vs LessonMaterial

| Feature | CourseAsset | LessonMaterial |
|---------|-------------|----------------|
| **Level** | Course-level | Lesson-level |
| **Model** | `CourseAsset` | `LessonMaterial` |
| **Upload Endpoint** | `/courses/{course_id}/upload-document-url/` | `/courses/{course_pk}/chapters/{chapter_pk}/lessons/{lesson_pk}/upload-material-url/` |
| **S3 Path** | `courses/{course_id}/documents/` | `courses/{course_id}/chapters/{chapter_id}/lessons/{lesson_id}/materials/` |
| **Nested Write** | ❌ No | ✅ Yes (trong Lesson update) |
| **Use Case** | Tài liệu chung của course | Tài liệu gắn với lesson cụ thể |

---

## 📚 Related Documentation

- [CourseAsset Upload](./COURSE_ASSET_UPLOAD.md) - Upload tài liệu theo course
- [Course vs Resource](./COURSE_VS_RESOURCE.md) - Phân biệt course-type và resource-type
- [Lesson API](../src/courses/views.py) - LessonViewSet implementatio