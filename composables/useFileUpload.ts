import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useApiClient } from '~/api/apiClient'

export function useFileUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  const apiClient = useApiClient()

  // Upload file with progress tracking
  function uploadFileWithProgress(
    file: File,
    uploadUrl: string,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          // Update global progress if no callback provided
          if (onProgress) {
            onProgress(percentComplete)
          }
          else {
            uploadProgress.value = percentComplete
          }
        }
      })

      // Handle successful upload
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) {
            onProgress(100)
          }
          else {
            uploadProgress.value = 100
          }
          resolve()
        }
        else {
          reject(new Error(`Upload failed with status: ${xhr.status}`))
        }
      })

      // Handle upload error
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      // Start upload
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  async function getPresignedUrl(file: File) {
    const presignedResponse = await apiClient.post('/system/upload-image/', {
      file_name: file.name,
      content_type: file.type,
      folder: 'covers',
    })
    return presignedResponse
  }

  // Upload with presigned URL
  async function uploadWithPresignedUrl(
    file: File,
    errorMessage: string = 'Tải lên file thất bại',
  ): Promise<string> {
    try {
      uploading.value = true
      isUploading.value = true
      uploadProgress.value = 0
      error.value = null

      // Get presigned URL
      const presignedResponse = await getPresignedUrl(file)

      // Extract URLs from response
      const uploadUrl = presignedResponse?.upload_url || presignedResponse?.uploadUrl || presignedResponse?.url
      const publicUrl = presignedResponse?.public_url || presignedResponse?.publicUrl

      if (!uploadUrl || !publicUrl) {
        throw new Error('Missing upload URLs')
      }

      // Upload file with progress tracking
      await uploadFileWithProgress(file, uploadUrl)

      return publicUrl
    }
    catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      error.value = errorMsg
      message.error(errorMessage)
      console.error('Upload failed:', err)
      throw err
    }
    finally {
      uploading.value = false
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // Reset upload state
  function resetUploadState() {
    uploading.value = false
    uploadProgress.value = 0
    isUploading.value = false
    error.value = null
  }

  return {
    // State
    uploading: readonly(uploading),
    uploadProgress: readonly(uploadProgress),
    isUploading: readonly(isUploading),
    error: readonly(error),

    // Methods
    uploadFileWithProgress,
    uploadWithPresignedUrl,
    resetUploadState,
  }
}
