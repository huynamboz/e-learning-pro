import { useApiClient } from '~/api/apiClient'

export interface CourseAsset {
  id: string
  course: string
  asset_type: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio' | 'other'
  title: string
  description: string
  file_url: string
  duration?: number
  duration_formatted?: string
  file_size: number
  file_size_formatted?: string
  order: number
  is_downloadable: boolean
  uploaded_by: {
    id: string
    username: string
    email: string
  }
  uploaded_at: string
  updated_at: string
  visible_classrooms?: Array<{
    id: string
    title: string
  }>
  has_access?: boolean
}

export interface CourseAssetPayload {
  asset_type: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio' | 'other'
  title: string
  description?: string
  file_url: string
  duration?: number
  file_size: number
  order?: number
  is_downloadable?: boolean
  visible_classroom_ids?: string[]
}

export interface UploadVideoUrlResponse {
  upload_url: string
  key: string
  public_url: string
  expires_in: number
  file_name: string
}

export interface UploadAttachmentUrlResponse {
  upload_url: string
  key: string
  public_url: string
  expires_in: number
  file_name: string
}

export function useAssetApi() {
  const apiClient = useApiClient()

  // Get presigned URL for video upload
  async function getVideoUploadUrl(
    courseId: string,
    fileName: string,
    contentType: string,
  ): Promise<UploadVideoUrlResponse> {
    return apiClient.post<UploadVideoUrlResponse>(
      `/courses/${courseId}/upload-video-url/`,
      {
        file_name: fileName,
        content_type: contentType,
      },
    )
  }

  // Get presigned URL for attachment upload
  async function getAttachmentUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'attachments',
  ): Promise<UploadAttachmentUrlResponse> {
    return apiClient.post<UploadAttachmentUrlResponse>(
      '/system/upload-attachment-url/',
      {
        file_name: fileName,
        content_type: contentType,
        folder,
      },
    )
  }

  // List assets for a course
  function getAssets(
    courseId: string,
    params?: {
      asset_type?: string
      is_downloadable?: boolean
      ordering?: string
      visible_classrooms?: string
      page?: number
      limit?: number
    },
  ) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const queryString = queryParams.toString()
    return apiClient.get<{ count: number, results: CourseAsset[], next: string | null, previous: string | null }>(
      `/courses/${courseId}/assets/${queryString ? `?${queryString}` : ''}`,
    )
  }

  // Get single asset
  function getAsset(courseId: string, assetId: string) {
    return apiClient.get<CourseAsset>(`/courses/${courseId}/assets/${assetId}/`)
  }

  // Create asset
  function createAsset(courseId: string, payload: CourseAssetPayload) {
    return apiClient.post<CourseAsset>(`/courses/${courseId}/assets/`, payload)
  }

  // Update asset
  function updateAsset(
    courseId: string,
    assetId: string,
    payload: Partial<CourseAssetPayload>,
  ) {
    return apiClient.patch<CourseAsset>(
      `/courses/${courseId}/assets/${assetId}/`,
      payload,
    )
  }

  // Delete asset
  function deleteAsset(courseId: string, assetId: string) {
    return apiClient.delete(`/courses/${courseId}/assets/${assetId}/`)
  }

  return {
    getVideoUploadUrl,
    getAttachmentUploadUrl,
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
  }
}
