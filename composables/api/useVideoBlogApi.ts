import type { ListApiResponse } from '~/api/apiClient'
import { useApiClient } from '~/api/apiClient'

// Video Post entity types
export interface VideoPost {
  id: string
  title: string
  content: string
  video_url: string | null
  thumbnail?: string | null
  author?: string | null
  author_id?: number | null
  is_published: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
  view_count: number
  tags?: string[]
  has_access?: boolean
}

export interface VideoPostListResponse extends ListApiResponse<VideoPost> {}

export interface VideoPostListParams {
  page?: number
  page_size?: number
  search?: string
  author?: number
  is_published?: boolean
  tags?: string
  ordering?: string
}

export interface VideoPostCreate {
  title: string
  content: string
  video_url: string
  thumbnail?: string
  author?: string
  is_published?: boolean
  tags?: string[]
}

export interface VideoPostUpdate extends Partial<VideoPostCreate> {}

export function useVideoBlogApi() {
  const apiClient = useApiClient()

  /**
   * Get list of video posts
   */
  async function getPosts(params?: VideoPostListParams): Promise<VideoPostListResponse> {
    return await apiClient.get('/video_blog/posts/', { query: params })
  }

  /**
   * Get single video post by ID
   */
  async function getPost(id: string): Promise<VideoPost> {
    return await apiClient.get(`/video_blog/posts/${id}/`)
  }

  /**
   * Create new video post
   */
  async function createPost(data: VideoPostCreate): Promise<VideoPost> {
    return await apiClient.post('/video_blog/posts/', data)
  }

  /**
   * Update video post
   */
  async function updatePost(id: string, data: VideoPostUpdate): Promise<VideoPost> {
    return await apiClient.patch(`/video_blog/posts/${id}/`, data)
  }

  /**
   * Delete video post
   */
  async function deletePost(id: string): Promise<void> {
    return await apiClient.delete(`/video_blog/posts/${id}/`)
  }

  /**
   * Publish video post
   */
  async function publishPost(id: string): Promise<VideoPost> {
    return await apiClient.post(`/video_blog/posts/${id}/publish/`)
  }

  /**
   * Unpublish video post
   */
  async function unpublishPost(id: string): Promise<VideoPost> {
    return await apiClient.post(`/video_blog/posts/${id}/unpublish/`)
  }

  /**
   * Get related posts
   * Endpoint: GET /api/v1/video_blog/posts/{id}/related/
   *
   * @param id - UUID of the post
   * @param limit - Number of related posts (default: 3, max: 10)
   * @returns List of related posts (only is_published=true, except for Admin/Staff/Teacher)
   *
   * Note: video_url will be null if user hasn't purchased any course
   */
  async function getRelatedPosts(id: string, limit?: number): Promise<VideoPostListResponse> {
    return await apiClient.get(`/video_blog/posts/${id}/related/`, {
      query: { limit },
    })
  }

  /**
   * Get presigned URL for video upload
   */
  async function getVideoUploadUrl(fileName: string, contentType: string): Promise<{
    upload_url: string
    key: string
    public_url: string
    expires_in: number
    file_name: string
  }> {
    return await apiClient.post('/video_blog/posts/upload-video-url/', {
      file_name: fileName,
      content_type: contentType,
    })
  }

  return {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    getRelatedPosts,
    getVideoUploadUrl,
  }
}
