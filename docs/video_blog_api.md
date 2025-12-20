# Video Blog API Documentation

## Overview

API để quản lý video blog posts - các bài đăng video với nội dung, video URL, và metadata.

**Base URL**: `/api/v1/video_blog/`

---

## Models

### VideoPost

Model chính cho video blog post.

**Fields:**
- `id`: UUID (auto-generated) - ID duy nhất của post
- `title`: String (max 200 chars, required) - Tiêu đề của post
- `content`: Text (required) - Nội dung HTML của post
- `video_url`: URLField (required) - URL của video (YouTube, Vimeo, hoặc direct video URL)
- `thumbnail`: URLField (optional) - URL của thumbnail image
- `author`: String (max 100 chars, optional) - Tên tác giả
- `author_id`: FK to User (optional) - ID của user tạo post
- `is_published`: Boolean (default: False) - Trạng thái xuất bản
- `published_at`: DateTime (nullable) - Thời gian xuất bản
- `created_at`: DateTime (auto-generated) - Thời gian tạo
- `updated_at`: DateTime (auto-updated) - Thời gian cập nhật cuối
- `view_count`: Integer (default: 0) - Số lượt xem
- `tags`: Array of Strings (optional) - Tags để phân loại

---

## Endpoints

### 1. List Video Posts

**Endpoint**: `GET /api/v1/video_blog/posts/`

**Description**: Lấy danh sách các video posts với pagination và filtering.

**Permission**: Public (không cần authentication) hoặc Authenticated

**Query Parameters:**
- `page`: Integer (default: 1) - Số trang
- `page_size`: Integer (default: 20, max: 100) - Số items mỗi trang
- `search`: String (optional) - Tìm kiếm trong title, content, author
- `author`: Integer (optional) - Filter theo author_id
- `is_published`: Boolean (optional) - Filter theo trạng thái published
- `tags`: String (optional, comma-separated) - Filter theo tags
- `ordering`: String (optional) - Sắp xếp (default: "-published_at,-created_at")
  - Các options: `published_at`, `-published_at`, `created_at`, `-created_at`, `view_count`, `-view_count`

**Response 200 OK:**
```json
{
  "count": 50,
  "next": "http://api.example.com/api/v1/video_blog/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu",
      "content": "<p>Trong video này, chúng ta sẽ học cách chào hỏi...</p>",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "author": "Giáo viên Maria",
      "author_id": 1,
      "is_published": true,
      "published_at": "2025-01-15T10:00:00Z",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "view_count": 1250,
      "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi"]
    }
  ]
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Invalid query parameters"
}
```

---

### 2. Get Video Post Detail

**Endpoint**: `GET /api/v1/video_blog/posts/{id}/`

**Description**: Lấy chi tiết một video post.

**Permission**: Public (không cần authentication) hoặc Authenticated

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu",
  "content": "<p>Trong video này, chúng ta sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Ý. Đây là bài học đầu tiên trong series học tiếng Ý cơ bản.</p><p>Chúng ta sẽ bắt đầu với những câu chào hỏi cơ bản như \"Ciao\", \"Buongiorno\", \"Buonasera\" và cách sử dụng chúng trong các tình huống khác nhau.</p>",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "author": "Giáo viên Maria",
  "author_id": 1,
  "is_published": true,
  "published_at": "2025-01-15T10:00:00Z",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "view_count": 1250,
  "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi"]
}
```

**Response 404 Not Found:**
```json
{
  "error": "Video post not found"
}
```

**Note**: Khi get detail, nên tự động tăng `view_count` lên 1.

---

### 3. Create Video Post

**Endpoint**: `POST /api/v1/video_blog/posts/`

**Description**: Tạo video post mới (Admin/Teacher only).

**Permission**: Authenticated (Admin hoặc Teacher)

**Request Body:**
```json
{
  "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu",
  "content": "<p>Trong video này, chúng ta sẽ học cách chào hỏi...</p>",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "author": "Giáo viên Maria",
  "is_published": false,
  "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi"]
}
```

**Validation Rules:**
- `title`: Required, max 200 characters
- `content`: Required, không được rỗng
- `video_url`: Required, phải là valid URL
- `thumbnail`: Optional, phải là valid URL nếu có
- `author`: Optional, max 100 characters
- `is_published`: Optional, default False
- `tags`: Optional, array of strings

**Response 201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu",
  "content": "<p>Trong video này, chúng ta sẽ học cách chào hỏi...</p>",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "author": "Giáo viên Maria",
  "author_id": 1,
  "is_published": false,
  "published_at": null,
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "view_count": 0,
  "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi"]
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": {
    "title": ["This field is required."],
    "video_url": ["Enter a valid URL."]
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Authentication credentials were not provided."
}
```

**Response 403 Forbidden:**
```json
{
  "error": "You do not have permission to perform this action."
}
```

---

### 4. Update Video Post

**Endpoint**: `PUT /api/v1/video_blog/posts/{id}/` hoặc `PATCH /api/v1/video_blog/posts/{id}/`

**Description**: Cập nhật video post (Admin/Teacher only, hoặc chính author của post).

**Permission**: Authenticated (Admin, Teacher, hoặc chính author)

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Request Body (PUT - full update):**
```json
{
  "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu (Updated)",
  "content": "<p>Updated content...</p>",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "author": "Giáo viên Maria",
  "is_published": true,
  "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi", "updated"]
}
```

**Request Body (PATCH - partial update):**
```json
{
  "title": "Updated title only",
  "is_published": true
}
```

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu (Updated)",
  "content": "<p>Updated content...</p>",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "author": "Giáo viên Maria",
  "author_id": 1,
  "is_published": true,
  "published_at": "2025-01-15T10:00:00Z",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z",
  "view_count": 1250,
  "tags": ["tiếng-ý", "cơ-bản", "chào-hỏi", "updated"]
}
```

**Response 404 Not Found:**
```json
{
  "error": "Video post not found"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "You do not have permission to update this post."
}
```

**Note**: Khi `is_published` được set thành `true` lần đầu tiên, tự động set `published_at` = current datetime.

---

### 5. Delete Video Post

**Endpoint**: `DELETE /api/v1/video_blog/posts/{id}/`

**Description**: Xóa video post (Admin only, hoặc chính author của post).

**Permission**: Authenticated (Admin, hoặc chính author)

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Response 204 No Content:**
(No response body)

**Response 404 Not Found:**
```json
{
  "error": "Video post not found"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "You do not have permission to delete this post."
}
```

---

### 6. Publish Video Post

**Endpoint**: `POST /api/v1/video_blog/posts/{id}/publish/`

**Description**: Xuất bản video post (set is_published = true).

**Permission**: Authenticated (Admin, Teacher, hoặc chính author)

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Request Body:**
(Empty body)

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_published": true,
  "published_at": "2025-01-15T10:00:00Z",
  "message": "Post published successfully"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Post is already published"
}
```

---

### 7. Unpublish Video Post

**Endpoint**: `POST /api/v1/video_blog/posts/{id}/unpublish/`

**Description**: Gỡ xuất bản video post (set is_published = false).

**Permission**: Authenticated (Admin, Teacher, hoặc chính author)

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Request Body:**
(Empty body)

**Response 200 OK:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_published": false,
  "published_at": null,
  "message": "Post unpublished successfully"
}
```

---

### 8. Get Related Posts

**Endpoint**: `GET /api/v1/video_blog/posts/{id}/related/`

**Description**: Lấy danh sách các posts liên quan (dựa trên tags hoặc cùng author).

**Permission**: Public

**Path Parameters:**
- `id`: UUID (required) - ID của post

**Query Parameters:**
- `limit`: Integer (default: 3, max: 10) - Số lượng posts liên quan

**Response 200 OK:**
```json
{
  "count": 3,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Related post title",
      "content": "<p>Short content...</p>",
      "video_url": "https://www.youtube.com/watch?v=...",
      "thumbnail": "https://...",
      "author": "Giáo viên Maria",
      "published_at": "2025-01-14T10:00:00Z",
      "view_count": 500
    }
  ]
}
```

---

## Authentication

Tất cả các endpoints (trừ List và Get Detail) yêu cầu authentication.

**Header:**
```
Authorization: Bearer <access_token>
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Error message for this field"]
  }
}
```

### Common Status Codes

- `200 OK`: Request thành công
- `201 Created`: Resource được tạo thành công
- `204 No Content`: Delete thành công
- `400 Bad Request`: Validation error hoặc bad request
- `401 Unauthorized`: Chưa authenticate
- `403 Forbidden`: Không có quyền thực hiện action
- `404 Not Found`: Resource không tồn tại
- `500 Internal Server Error`: Server error

---

## Examples

### Example 1: List published posts

```bash
GET /api/v1/video_blog/posts/?is_published=true&ordering=-published_at&page_size=10
```

### Example 2: Search posts

```bash
GET /api/v1/video_blog/posts/?search=tiếng%20ý&is_published=true
```

### Example 3: Create new post

```bash
POST /api/v1/video_blog/posts/
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Video Post",
  "content": "<p>Content here</p>",
  "video_url": "https://www.youtube.com/watch?v=...",
  "is_published": false
}
```

### Example 4: Update and publish post

```bash
PATCH /api/v1/video_blog/posts/{id}/
Content-Type: application/json
Authorization: Bearer <token>

{
  "is_published": true
}
```

---

## Notes

1. **Video URL Support**: 
   - YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` hoặc `https://youtu.be/VIDEO_ID`
   - Vimeo: `https://vimeo.com/VIDEO_ID`
   - Direct video URLs: `https://example.com/video.mp4`

2. **Thumbnail**: 
   - Nếu không cung cấp thumbnail, backend có thể tự động extract từ YouTube/Vimeo URL
   - YouTube thumbnail format: `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`

3. **Content**: 
   - Content được lưu dưới dạng HTML
   - Nên sanitize HTML để tránh XSS attacks

4. **Tags**: 
   - Tags nên được normalize (lowercase, remove spaces)
   - Có thể dùng để tìm related posts

5. **View Count**: 
   - Tự động tăng khi get detail
   - Có thể cache để tránh spam

6. **Published At**: 
   - Tự động set khi `is_published` chuyển từ `false` sang `true` lần đầu
   - Không thay đổi khi unpublish/publish lại

---

## Database Schema

### VideoPost Table

```sql
CREATE TABLE video_blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    author VARCHAR(100),
    author_id INTEGER REFERENCES auth_user(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    
    CONSTRAINT video_url_valid CHECK (video_url ~ '^https?://'),
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX idx_video_posts_published ON video_blog_posts(is_published, published_at DESC);
CREATE INDEX idx_video_posts_author ON video_blog_posts(author_id);
CREATE INDEX idx_video_posts_tags ON video_blog_posts USING GIN(tags);
CREATE INDEX idx_video_posts_search ON video_blog_posts USING GIN(to_tsvector('english', title || ' ' || content));
```

---

## Frontend Integration Notes

1. **List Posts**: 
   - Chỉ hiển thị posts có `is_published=true` cho public users
   - Admin/Teacher có thể xem tất cả posts

2. **Video Embed**: 
   - Frontend cần parse video URL để tạo embed URL
   - YouTube: `https://www.youtube.com/embed/{VIDEO_ID}`
   - Vimeo: `https://player.vimeo.com/video/{VIDEO_ID}`

3. **Pagination**: 
   - Sử dụng `next` và `previous` URLs từ response
   - Hoặc dùng `page` và `page_size` parameters

4. **Search**: 
   - Debounce search input (500ms)
   - Search trong title, content, author

5. **Related Posts**: 
   - Hiển thị ở detail page
   - Dựa trên tags hoặc cùng author
