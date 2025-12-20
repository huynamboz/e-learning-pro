import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useVideoBlogApi } from '~/composables/api/useVideoBlogApi'
import { useFileUpload } from '~/composables/useFileUpload'

export function useVideoUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  const { getVideoUploadUrl } = useVideoBlogApi()
  const { uploadFileWithProgress: uploadFile } = useFileUpload()

  // Upload video file
  async function uploadVideoFile(
    file: File,
    errorMessage: string = 'Tải lên video thất bại',
  ): Promise<string> {
    try {
      uploading.value = true
      isUploading.value = true
      uploadProgress.value = 0
      error.value = null

      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
      if (!validTypes.includes(file.type)) {
        throw new Error('Định dạng video không được hỗ trợ. Vui lòng chọn file MP4, WebM, OGG, MOV hoặc AVI.')
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        throw new Error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 500MB.')
      }

      // Step 1: Get presigned URL
      const presignedResponse = await getVideoUploadUrl(file.name, file.type)

      // Extract URLs from response
      const uploadUrl = presignedResponse?.upload_url
      const publicUrl = presignedResponse?.public_url

      if (!uploadUrl || !publicUrl) {
        throw new Error('Missing upload URLs')
      }

      // Step 2: Upload file to S3 with progress tracking
      await uploadFile(file, uploadUrl, (percent) => {
        uploadProgress.value = percent
      })

      // Step 3: Return public_url to use in video post
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
    uploadVideoFile,
    resetUploadState,
  }
}
