# 📚 Course vs Resource - Hệ thống Quản lý Khóa học và Tài nguyên

## 🎯 Tổng quan

Tài liệu này mô tả hệ thống phân biệt giữa **Course** (khóa học) và **Resource** (tài nguyên) trong nền tảng e-learning, bao gồm:

- Mô hình dữ liệu cho CourseAsset và CourseAccess
- Luồng Order khác nhau cho course và resource
- API endpoints cho quản lý assets
- Logic gating (kiểm soát truy cập) cho lessons và materials
- Email notifications

---

## 📋 Mô hình Dữ liệu

### 1. Course Model

Model `Course` đã có sẵn field `course_type` với 2 giá trị:

- `'course'` - Khóa học (default)
- `'resource'` - Tài nguyên

```python
course_type = models.CharField(
    max_length=20,
    choices=COURSE_TYPE_CHOICES,
    default='course',
    db_index=True,
    help_text="Course type: course (khóa học) or resource (tài nguyên)"
)
```

### 2. CourseAsset Model

**Bảng:** `courses_course_asset`

**Mục đích:** Quản lý assets cấp course (video, PDF, documents) dùng chung cho cả course và resource.

**Các trường chính:**

- `id` (UUID, PK)
- `course` (FK → Course)
- `asset_type` (video/pdf/doc/ppt/zip/image/audio/other)
- `title`, `description`
- `file_url` (presigned/public URL)
- `duration` (seconds, cho video/audio)
- `file_size` (bytes)
- `order` (thứ tự hiển thị)
- `is_downloadable` (boolean)
- `uploaded_by` (FK → User)
- `uploaded_at`, `updated_at`
- `visible_classrooms` (M2M → Classroom) - **Chỉ dùng cho course_type='course'**

**Quy tắc:**

- **course_type='course'**: Asset có thể gán `visible_classrooms` để chỉ định lớp nào được xem
  - Để trống `visible_classrooms` = không lớp nào xem được (hoặc convention "mọi lớp" nếu cần)
- **course_type='resource'**: Bỏ qua `visible_classrooms`, asset áp dụng cho cả course

**Indexes:**

```python
indexes = [
    models.Index(fields=['course', 'order']),
    models.Index(fields=['course', 'asset_type']),
    models.Index(fields=['course', 'is_downloadable']),
    models.Index(fields=['uploaded_by', 'uploaded_at']),
]
```

### 3. CourseAccess Model

**Bảng:** `courses_course_access`

**Mục đích:** Quản lý quyền truy cập cho resource-type courses (course_type='resource').

**Các trường chính:**

- `id` (UUID, PK)
- `user` (FK → User)
- `course` (FK → Course, course_type='resource')
- `is_active` (boolean, indexed)
- `purchased_at` (DateTime, auto_now_add)
- `expires_at` (DateTime, optional)
- `created_at`, `updated_at`

**Constraints:**

- `unique_together = [('user', 'course')]` - Mỗi user chỉ có 1 CourseAccess per resource
- Validation: `course.course_type` phải là `'resource'`

**Indexes:**

```python
indexes = [
    models.Index(fields=['user', 'is_active']),
    models.Index(fields=['course', 'is_active']),
    models.Index(fields=['user', 'course']),
    models.Index(fields=['expires_at', 'is_active']),
    models.Index(fields=['-purchased_at']),
]
```

**Properties:**

- `is_expired`: Kiểm tra nếu `expires_at` đã qua
- `is_valid`: Kiểm tra access còn hiệu lực (`is_active=True` và chưa expired)

---

## 🔄 Luồng Order

### Order Model Changes

**Field `classroom`:**

- **Trước:** `null=False` (bắt buộc)
- **Sau:** `null=True, blank=True` (cho phép null cho resource)

**Validation trong `clean()`:**

```python
# For course_type='course': classroom is required
if self.course.course_type == 'course':
    if not self.classroom:
        raise ValidationError({
            "classroom": "Classroom is required for course-type orders."
        })

# For course_type='resource': classroom should be null
if self.course.course_type == 'resource':
    if self.classroom:
        raise ValidationError({
            "classroom": "Classroom should not be set for resource-type orders."
        })
```

**Constraint:**

```python
models.UniqueConstraint(
    fields=["student", "classroom"],
    condition=Q(status="pending") & Q(classroom__isnull=False),
    name="unique_active_order_per_classroom",
)
```

### Order.mark_complete() Logic

#### 1. course_type='course'

**Flow giữ nguyên:**

- Bắt buộc `classroom` khi tạo order
- Khi `mark_complete()`:
  - Tạo/activate `Enrollment` vào classroom
  - Nếu `student.account_type='self_registered'`:
    - Tạo generated account mới
    - Tạo Enrollment cho generated account (KHÔNG phải self_registered account)
    - Gửi email với credentials đến self_registered user
  - Nếu không phải self_registered:
    - Tạo Enrollment cho student hiện tại

**Email:** Template `course_enrollment` với generated account credentials

#### 2. course_type='resource'

**Flow mới:**

- Cho phép order không `classroom` (`classroom=None`)
- `price_amount` lấy từ `course.effective_price`
- Khi `mark_complete()`:
  - Tạo/activate `CourseAccess` (không tạo Enrollment, không tạo generated account)
  - Gửi email thông báo access granted (không có credentials)

**Email:** Template `resource_access_granted` (không có username/password)

**Code:**

```python
if self.course.course_type == 'resource':
    from src.courses.models import CourseAccess
    from src.accounts.tasks import send_resource_access_granted_email_task
    
    # Create or activate CourseAccess
    course_access, created = CourseAccess.objects.update_or_create(
        user=self.student,
        course=self.course,
        defaults={
            'is_active': True,
            'purchased_at': now,
        }
    )
    
    # Send resource access email (no generated account credentials)
    send_resource_access_granted_email_task.delay(...)
```

### Order.mark_cancel() Logic

- **course_type='course'**: Deactivate Enrollment
- **course_type='resource'**: Deactivate CourseAccess

---

## 🌐 API Endpoints

### CourseAsset API

**Base URL:** `/api/v1/courses/{course_id}/assets/`

#### GET `/api/v1/courses/{course_id}/assets/`

**Mục đích:** List assets của course với gating logic.

**Permissions:**

- **List/Retrieve:** `AllowAny` (anonymous có thể xem metadata)
- **Create/Update/Delete:** `IsOwnerTeacherOrAdmin` (teacher của course hoặc staff)

**Query Parameters:**

- `asset_type` (filter)
- `is_downloadable` (filter)
- `ordering` (order, uploaded_at)

**Response Format:**

```json
{
  "count": 2,
  "results": [
    {
      "id": "uuid",
      "asset_type": "video",
      "title": "Introduction Video",
      "description": "...",
      "file_url": "https://...",  // null nếu không có quyền
      "duration": 3600,
      "duration_formatted": "01:00:00",
      "file_size": 1048576,
      "file_size_formatted": "1.0 MB",
      "order": 0,
      "is_downloadable": true,
      "has_access": true,  // true nếu có quyền xem file_url
      "uploaded_at": "2025-12-08T..."
    }
  ]
}
```

**Gating Logic:**

- **Staff:** Thấy tất cả assets + full `file_url`
- **Teacher (owner):** Thấy tất cả assets + full `file_url`
- **Student (course-type):** 
  - Chỉ thấy assets mà `visible_classrooms` chứa classroom mà user đang enrolled
  - Nếu không có enrollment → rỗng hoặc metadata không có `file_url`
- **Student (resource-type):**
  - Thấy tất cả assets (metadata)
  - `file_url` chỉ có nếu có `CourseAccess` active
- **Anonymous:**
  - Thấy metadata (title, description, type, duration/size)
  - `file_url=null`

#### POST `/api/v1/courses/{course_id}/assets/`

**Payload:**

```json
{
  "asset_type": "video",
  "title": "New Video",
  "description": "Video description",
  "file_url": "https://s3.../video.mp4",  // từ presigned upload
  "duration": 3600,
  "file_size": 1048576,
  "order": 0,
  "is_downloadable": true,
  "visible_classroom_ids": ["uuid1", "uuid2"]  // chỉ cho course-type
}
```

**Validation:**

- `visible_classroom_ids` chỉ hợp lệ cho `course_type='course'`
- Tất cả classrooms phải thuộc course
- Với `course_type='resource'`: bỏ qua `visible_classroom_ids`

**Response:** 201 Created với asset data

#### PATCH `/api/v1/courses/{course_id}/assets/{id}/`

**Payload:** Tương tự POST, có thể update `visible_classroom_ids`

#### DELETE `/api/v1/courses/{course_id}/assets/{id}/`

**Response:** 204 No Content

## 📤 Upload Assets - Workflow Chi Tiết

### Tổng Quan

Hệ thống sử dụng **AWS S3 Presigned URLs** để upload assets trực tiếp từ frontend lên S3, không qua backend server. Điều này giúp:

- ✅ Giảm tải cho backend server
- ✅ Upload nhanh hơn (direct to S3)
- ✅ Hỗ trợ upload file lớn (video, PDF, etc.)
- ✅ Bảo mật với presigned URLs có expiration

### Workflow Upload Assets

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ 1. POST /api/v1/courses/{id}/upload-video-url/
       │    hoặc POST /api/v1/common/upload-attachment-url/
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
       │ 6. POST /api/v1/courses/{id}/assets/
       │    với file_url = public_url
       │
       ▼
┌─────────────┐
│   Backend   │
│  (Database) │
└─────────────┘
```

### Endpoint 1: Upload Video URL

**URL:** `POST /api/v1/courses/{course_id}/upload-video-url/`

**Permission:** `IsOwnerTeacherOrAdmin` (teacher của course hoặc staff)

**Request Body:**

```json
{
  "file_name": "lesson-intro.mp4",
  "content_type": "video/mp4"
}
```

**Request Fields:**

- `file_name` (required): Tên file gốc với extension (e.g., `"lesson-01.mp4"`)
- `content_type` (required): MIME type của video

**Allowed Content Types:**

- `video/mp4`
- `video/avi`
- `video/quicktime` (MOV)
- `video/x-msvideo` (AVI)
- `video/x-ms-wmv` (WMV)
- `video/x-flv` (FLV)
- `video/x-matroska` (MKV)

**Allowed Extensions:**

- `.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.mkv`

**Response (200 OK):**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/courses/uuid/videos/abc123.mp4?X-Amz-Algorithm=...&X-Amz-Expires=3600&X-Amz-Signature=...",
  "key": "courses/550e8400-e29b-41d4-a716-446655440000/videos/abc123.mp4",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/courses/550e8400-e29b-41d4-a716-446655440000/videos/abc123.mp4",
  "expires_in": 3600,
  "file_name": "abc123.mp4"
}
```

**Response Fields:**

- `upload_url`: Presigned URL để upload file (PUT request), **expires sau 1 giờ**
- `key`: S3 object key (path trong bucket)
- `public_url`: URL công khai để truy cập file sau khi upload (permanent)
- `expires_in`: Thời gian hết hạn của upload_url (seconds)
- `file_name`: Tên file unique được generate (UUID + extension)

**Lưu ý:**

- Backend tự động generate unique filename (UUID) để tránh conflict
- File được lưu tại: `courses/{course_id}/videos/{uuid}.{ext}`
- `upload_url` chỉ valid trong **1 giờ** - phải upload ngay sau khi nhận được

### Endpoint 2: Upload Attachment URL

**URL:** `POST /api/v1/common/upload-attachment-url/`

**Permission:** `IsAuthenticated` (bất kỳ user đã đăng nhập)

**Request Body:**

```json
{
  "file_name": "document.pdf",
  "content_type": "application/pdf",
  "folder": "attachments"  // optional
}
```

**Request Fields:**

- `file_name` (required): Tên file gốc với extension
- `content_type` (required): MIME type của file
- `folder` (optional): Folder để tổ chức files (default: `"attachments"`)

**Allowed Folders:**

- `attachments` (default)
- `lesson-materials`
- `quiz-media`
- `general`

**Allowed Content Types & Extensions:**

Tùy theo cấu hình trong `settings.ATTACHMENT_UPLOAD_ALLOWED_CONTENT_TYPES` và `ATTACHMENT_UPLOAD_ALLOWED_EXTENSIONS`. Thường bao gồm:

- **PDF:** `application/pdf` (`.pdf`)
- **Word:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`)
- **PowerPoint:** `application/vnd.openxmlformats-officedocument.presentationml.presentation` (`.pptx`)
- **Excel:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (`.xlsx`)
- **ZIP:** `application/zip` (`.zip`)
- **Images:** `image/jpeg`, `image/png` (`.jpg`, `.png`)
- **Audio:** `audio/mpeg`, `audio/wav` (`.mp3`, `.wav`)

**Response (200 OK):**

```json
{
  "upload_url": "https://s3-ap-southeast-2.amazonaws.com/bucket/attachments/attachments/xyz789.pdf?X-Amz-Algorithm=...",
  "key": "attachments/attachments/xyz789.pdf",
  "public_url": "https://bucket.s3.ap-southeast-2.amazonaws.com/attachments/attachments/xyz789.pdf",
  "expires_in": 3600,
  "file_name": "xyz789.pdf"
}
```

**Lưu ý:**

- File được lưu tại: `{ATTACHMENT_UPLOAD_ROOT}/{folder}/{uuid}.{ext}`
- Default `ATTACHMENT_UPLOAD_ROOT` = `"attachments"`

### Frontend Implementation Example

#### JavaScript/TypeScript Example

```typescript
// Step 1: Get presigned URL
async function uploadAsset(
  courseId: string,
  file: File,
  assetType: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio'
): Promise<string> {
  // Choose endpoint based on asset type
  const isVideo = assetType === 'video';
  const endpoint = isVideo
    ? `/api/v1/courses/${courseId}/upload-video-url/`
    : `/api/v1/common/upload-attachment-url/`;
  
  // Step 1: Request presigned URL
  const uploadResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
      ...(isVideo ? {} : { folder: 'attachments' }),
    }),
  });
  
  if (!uploadResponse.ok) {
    throw new Error('Failed to get upload URL');
  }
  
  const { upload_url, public_url } = await uploadResponse.json();
  
  // Step 2: Upload file directly to S3
  const uploadResult = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });
  
  if (!uploadResult.ok) {
    throw new Error('Failed to upload file to S3');
  }
  
  // Step 3: Return public_url to use in asset creation
  return public_url;
}

// Step 4: Create CourseAsset
async function createAsset(
  courseId: string,
  publicUrl: string,
  metadata: {
    asset_type: string;
    title: string;
    description?: string;
    duration?: number;
    file_size: number;
    visible_classroom_ids?: string[];
  }
) {
  const response = await fetch(`/api/v1/courses/${courseId}/assets/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...metadata,
      file_url: publicUrl,
    }),
  });
  
  return response.json();
}

// Complete workflow
async function uploadAndCreateAsset(
  courseId: string,
  file: File,
  assetData: {
    asset_type: string;
    title: string;
    description?: string;
    visible_classroom_ids?: string[];
  }
) {
  try {
    // Get file metadata
    const fileSize = file.size;
    const assetType = getAssetTypeFromFile(file);
    
    // Upload to S3
    const publicUrl = await uploadAsset(courseId, file, assetType);
    
    // Create asset record
    const asset = await createAsset(courseId, publicUrl, {
      ...assetData,
      asset_type: assetType,
      file_size: fileSize,
      // duration can be extracted from video metadata if needed
    });
    
    return asset;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

function getAssetTypeFromFile(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'mp4': 'video',
    'avi': 'video',
    'mov': 'video',
    'pdf': 'pdf',
    'doc': 'doc',
    'docx': 'doc',
    'ppt': 'ppt',
    'pptx': 'ppt',
    'zip': 'zip',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'mp3': 'audio',
    'wav': 'audio',
  };
  return typeMap[ext || ''] || 'other';
}
```

#### React Hook Example

```typescript
import { useState } from 'react';

function useAssetUpload(courseId: string) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const uploadAsset = async (
    file: File,
    assetData: {
      asset_type: string;
      title: string;
      description?: string;
      visible_classroom_ids?: string[];
    }
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Step 1: Get presigned URL
      const isVideo = assetData.asset_type === 'video';
      const endpoint = isVideo
        ? `/api/v1/courses/${courseId}/upload-video-url/`
        : `/api/v1/common/upload-attachment-url/`;
      
      const uploadUrlResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: file.name,
          content_type: file.type,
          ...(isVideo ? {} : { folder: 'attachments' }),
        }),
      });
      
      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { upload_url, public_url } = await uploadUrlResponse.json();
      setProgress(30);
      
      // Step 2: Upload to S3 with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(30 + (percentComplete * 0.7)); // 30-100%
          }
        });
        
        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            setProgress(100);
            
            // Step 3: Create asset record
            try {
              const assetResponse = await fetch(
                `/api/v1/courses/${courseId}/assets/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    ...assetData,
                    file_url: public_url,
                    file_size: file.size,
                  }),
                }
              );
              
              if (!assetResponse.ok) {
                throw new Error('Failed to create asset');
              }
              
              const asset = await assetResponse.json();
              resolve(asset);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error('Upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload error'));
        });
        
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };
  
  return { uploadAsset, uploading, progress, error };
}
```

### Error Handling

**Common Errors:**

1. **400 Bad Request:**
   ```json
   {
     "file_name": ["Unsupported file extension. Allowed: .mp4, .avi, .mov"]
   }
   ```
   → File extension không được hỗ trợ

2. **400 Bad Request:**
   ```json
   {
     "content_type": ["Unsupported video format. Allowed: video/mp4, video/avi"]
   }
   ```
   → Content type không được hỗ trợ

3. **403 Forbidden:**
   → User không có quyền upload (không phải teacher của course hoặc staff)

4. **500 Internal Server Error:**
   ```json
   {
     "error": "Failed to generate upload URL. Please check AWS configuration."
   }
   ```
   → Lỗi cấu hình AWS S3

5. **Upload URL Expired:**
   → `upload_url` đã hết hạn (1 giờ). Cần request lại presigned URL.

### Best Practices

1. **Upload ngay sau khi nhận upload_url:**
   - `upload_url` chỉ valid trong 1 giờ
   - Không cache `upload_url` để dùng sau

2. **Validate file trước khi request presigned URL:**
   ```typescript
   // Check file size
   const MAX_SIZE = 1024 * 1024 * 1024; // 1GB
   if (file.size > MAX_SIZE) {
     throw new Error('File too large');
   }
   
   // Check file type
   const allowedTypes = ['video/mp4', 'application/pdf'];
   if (!allowedTypes.includes(file.type)) {
     throw new Error('File type not allowed');
   }
   ```

3. **Show upload progress:**
   - Dùng `XMLHttpRequest` hoặc `fetch` với `ReadableStream` để track progress
   - Update UI với progress percentage

4. **Handle upload failures:**
   - Retry logic cho network errors
   - Clear state nếu upload fail
   - Show error message cho user

5. **Cleanup on cancel:**
   - Nếu user cancel upload, có thể cần cleanup file đã upload một phần (optional)

6. **File size calculation:**
   - Luôn gửi `file_size` chính xác khi create asset
   - Backend có thể validate file_size nếu cần

### Asset Types Mapping

| Asset Type | Endpoint | Folder | Common Extensions |
|------------|----------|--------|-------------------|
| `video` | `/courses/{id}/upload-video-url/` | `courses/{id}/videos/` | `.mp4`, `.avi`, `.mov` |
| `pdf` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.pdf` |
| `doc` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.doc`, `.docx` |
| `ppt` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.ppt`, `.pptx` |
| `zip` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.zip`, `.rar` |
| `image` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.jpg`, `.png`, `.gif` |
| `audio` | `/common/upload-attachment-url/` | `attachments/attachments/` | `.mp3`, `.wav` |
| `other` | `/common/upload-attachment-url/` | `attachments/attachments/` | Other extensions |

### Complete Example: Upload Video Asset

```typescript
// Complete example: Upload video and create asset
async function uploadVideoAsset(
  courseId: string,
  videoFile: File,
  title: string,
  description: string,
  visibleClassroomIds: string[]
) {
  // 1. Validate file
  if (!videoFile.type.startsWith('video/')) {
    throw new Error('File must be a video');
  }
  
  // 2. Get presigned URL
  const uploadUrlResponse = await fetch(
    `/api/v1/courses/${courseId}/upload-video-url/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        file_name: videoFile.name,
        content_type: videoFile.type,
      }),
    }
  );
  
  if (!uploadUrlResponse.ok) {
    const error = await uploadUrlResponse.json();
    throw new Error(error.details?.file_name?.[0] || 'Failed to get upload URL');
  }
  
  const { upload_url, public_url } = await uploadUrlResponse.json();
  
  // 3. Upload to S3
  const uploadResult = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': videoFile.type,
    },
    body: videoFile,
  });
  
  if (!uploadResult.ok) {
    throw new Error('Failed to upload video to S3');
  }
  
  // 4. Extract duration (optional - can use video metadata library)
  const duration = await getVideoDuration(videoFile); // e.g., using ffmpeg.js
  
  // 5. Create asset record
  const assetResponse = await fetch(
    `/api/v1/courses/${courseId}/assets/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_type: 'video',
        title,
        description,
        file_url: public_url,
        duration: duration, // in seconds
        file_size: videoFile.size,
        is_downloadable: true,
        visible_classroom_ids: visibleClassroomIds,
      }),
    }
  );
  
  if (!assetResponse.ok) {
    const error = await assetResponse.json();
    throw new Error(error.message || 'Failed to create asset');
  }
  
  return await assetResponse.json();
}
```

---

## 🔒 Gating Logic cho Lesson/LessonMaterial

### Lesson Serializer

**Field mới:** `has_access` (read-only)

**Logic:**

```python
def get_has_access(self, obj):
    user = request.user
    course = obj.chapter.course
    
    # Staff/teacher always have access
    if user.is_staff or (user.is_teacher and course.teacher == user):
        return True
    
    # Preview lessons are always accessible
    if obj.is_preview:
        return True
    
    # For course-type: check enrollment
    if course.course_type == 'course':
        return Enrollment.objects.filter(
            user=user,
            classroom__course=course,
            is_active=True
        ).exists()
    
    # For resource-type: check CourseAccess
    elif course.course_type == 'resource':
        return CourseAccess.objects.filter(
            user=user,
            course=course,
            is_active=True
        ).exists()
    
    return False
```

**Gating trong `to_representation()`:**

```python
# For resource-type: hide video_url if no access (unless preview)
if course.course_type == 'resource' and not has_access and not instance.is_preview:
    data['video_url'] = None
```

### LessonMaterial Serializer

**Tương tự Lesson:**

- Field `has_access` (read-only)
- Gating `file_path` cho resource-type
- Preview materials luôn accessible

**Response:**

```json
{
  "id": "uuid",
  "title": "Material 1",
  "file_path": null,  // null nếu không có quyền
  "file_type": "pdf",
  "file_size": 1048576,
  "has_access": false
}
```

---

## 📧 Email Templates

### Resource Access Granted Email

**Template:** `templates/emails/resource_access_granted.html` và `.txt`

**Task:** `src.accounts.tasks.send_resource_access_granted_email_task`

**Context:**

```python
{
    'user': user_context,
    'course_title': course_title,
    'course_description': course_description,
    'course_url': course_url,
}
```

**Khác biệt với Course Enrollment Email:**

- ❌ **KHÔNG có** `generated_username`, `generated_email`, `generated_password`
- ✅ Chỉ thông báo access granted với link đến resource

**Subject:** `Xác nhận mua tài nguyên: {course_title}`

---

## 🗄️ Migrations

### 1. `0013_add_course_asset_and_access.py`

Tạo 2 models mới:

- `CourseAsset` với M2M `visible_classrooms`
- `CourseAccess`

### 2. `0003_allow_classroom_null_for_resource.py` (orders app)

- Cho phép `Order.classroom` null
- Cập nhật constraint để chỉ áp dụng khi `classroom__isnull=False`

### 3. `0014_backfill_course_access_from_orders.py` (courses app)

**Mục đích:** Backfill `CourseAccess` từ các orders đã complete cho resource-type courses.

**Logic:**

```python
resource_orders = Order.objects.filter(
    status='complete',
    course__course_type='resource'
)

for order in resource_orders:
    CourseAccess.objects.update_or_create(
        user=order.student,
        course=order.course,
        defaults={
            'is_active': True,
            'purchased_at': order.approved_at or order.created_at,
        }
    )
```

**Chạy migration:**

```bash
python manage.py migrate courses
```

---

## 🧪 Tests

**File:** `src/courses/tests/test_course_resource_assets.py`

**Test Cases:**

1. **CourseResourceAssetTests:**
   - `test_course_asset_visibility_course_type` - Asset visibility với classroom filtering
   - `test_course_asset_visibility_resource_type` - Asset visibility với CourseAccess
   - `test_teacher_can_create_asset_with_classrooms` - Teacher tạo asset với classrooms
   - `test_anonymous_sees_metadata_only` - Anonymous chỉ thấy metadata

2. **CourseResourceOrderTests:**
   - `test_order_complete_course_creates_enrollment` - Course tạo Enrollment
   - `test_order_complete_resource_creates_course_access` - Resource tạo CourseAccess
   - `test_order_cancel_resource_deactivates_course_access` - Cancel deactivate CourseAccess

3. **LessonMaterialResourceGatingTests:**
   - `test_lesson_video_url_gated_without_access` - Gate video_url khi không có access
   - `test_lesson_video_url_visible_with_access` - Hiện video_url khi có access
   - `test_preview_lesson_always_visible` - Preview luôn visible
   - `test_material_file_path_gated_without_access` - Gate file_path
   - `test_material_file_path_visible_with_access` - Hiện file_path khi có access

**Chạy tests:**

```bash
python manage.py test src.courses.tests.test_course_resource_assets
```

---

## 🎨 Frontend Integration

### Course Detail (type='course')

**API Call:**

```javascript
GET /api/v1/courses/{id}/assets/
```

**Render:**

- List assets với `visible_classroom_ids`
- Student chỉ thấy assets của lớp mình enrolled
- Link bật nếu `has_access=true`

**Form "Thêm tài liệu":**

```javascript
{
  asset_type: 'video' | 'pdf' | ...,
  title: string,
  description: string,
  file_url: string,  // từ presigned upload
  duration?: number,
  file_size: number,
  order?: number,
  is_downloadable?: boolean,
  visible_classroom_ids: string[]  // multi-select
}
```

### Course Detail (type='resource')

**API Call:**

```javascript
GET /api/v1/courses/{id}/assets/
// hoặc
GET /api/v1/courses/{id}/chapters/{id}/lessons/
```

**Render:**

- Meta only (title, description, type, duration/size)
- Nếu `is_purchased=true` (check CourseAccess) → hiện link/video embed
- Nút "Mua" khi chưa mua

**Check Purchase Status:**

```javascript
// Option 1: Check CourseAccess via API
GET /api/v1/courses/{id}/access/  // (nếu có endpoint)

// Option 2: Check từ asset response
// has_access=true → đã mua
```

---

## 📊 Database Schema

### CourseAsset Table

```sql
CREATE TABLE courses_course_asset (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses_course(id),
    asset_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    file_url VARCHAR(500),
    duration INTEGER,
    file_size BIGINT NOT NULL,
    "order" INTEGER NOT NULL,
    is_downloadable BOOLEAN NOT NULL,
    uploaded_by_id BIGINT REFERENCES accounts_user(id),
    uploaded_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE courses_course_asset_visible_classrooms (
    id BIGSERIAL PRIMARY KEY,
    courseasset_id UUID REFERENCES courses_course_asset(id),
    classroom_id UUID REFERENCES classrooms_classroom(id),
    UNIQUE(courseasset_id, classroom_id)
);
```

### CourseAccess Table

```sql
CREATE TABLE courses_course_access (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES accounts_user(id),
    course_id UUID NOT NULL REFERENCES courses_course(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    purchased_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(user_id, course_id)
);

CREATE INDEX ON courses_course_access(user_id, is_active);
CREATE INDEX ON courses_course_access(course_id, is_active);
CREATE INDEX ON courses_course_access(expires_at, is_active);
```

### Order Table Changes

```sql
ALTER TABLE orders_order 
    ALTER COLUMN classroom_id DROP NOT NULL;

-- Constraint chỉ áp dụng khi classroom không null
CREATE UNIQUE INDEX unique_active_order_per_classroom 
    ON orders_order(student_id, classroom_id) 
    WHERE status = 'pending' AND classroom_id IS NOT NULL;
```

---

## 🔐 Permissions Summary

### CourseAsset

| Action | Permission | Notes |
|--------|-----------|-------|
| List | AllowAny | Anonymous thấy metadata, không thấy file_url |
| Retrieve | AllowAny | Tương tự list |
| Create | IsOwnerTeacherOrAdmin | Teacher của course hoặc staff |
| Update | IsOwnerTeacherOrAdmin | Tương tự create |
| Delete | IsOwnerTeacherOrAdmin | Tương tự create |

### CourseAccess

- **Read:** Staff/Teacher (owner)
- **Create:** Tự động khi order complete (không có API endpoint riêng)
- **Update/Delete:** Staff only (thông qua admin hoặc order cancel)

---

## 🚀 Deployment Checklist

- [ ] Chạy migrations: `python manage.py migrate`
- [ ] Chạy backfill migration: `python manage.py migrate courses 0014`
- [ ] Verify CourseAsset và CourseAccess tables được tạo
- [ ] Verify Order.classroom có thể null
- [ ] Test API endpoints với Postman/curl
- [ ] Verify email templates tồn tại
- [ ] Test order flow cho cả course và resource
- [ ] Verify gating logic cho lessons/materials
- [ ] Update frontend để sử dụng API mới

---

## 📝 Notes

1. **Convention cho visible_classrooms:**
   - Để trống = không lớp nào xem được (hoặc có thể dùng convention "mọi lớp" nếu cần)
   - Chọn nhiều classrooms = chỉ các lớp đó xem được

2. **Resource pricing:**
   - Lấy từ `course.effective_price` (discount_price nếu có, không thì price)

3. **Preview content:**
   - `is_preview=True` → luôn accessible (không cần enrollment/access)

4. **DRM/Security:**
   - Chỉ expose signed URLs/policies, không bao giờ raw storage paths
   - File URLs nên là presigned với expiration

---

## 🔗 Related Documentation

- [COURSE_TYPE_AND_LEVELS.md](./COURSE_TYPE_AND_LEVELS.md) - Course type và level classification
- [ORDER_FLOW.md](./ORDER_FLOW.md) - Chi tiết luồng order
- [Image_upload.md](./Image_upload.md) - S3 upload workflow

---

**Last Updated:** 2025-12-08