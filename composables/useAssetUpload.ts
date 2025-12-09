import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useFileUpload } from '~/composables/useFileUpload'

export function useAssetUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const error = ref<string | null>(null)
  const { getVideoUploadUrl, getAttachmentUploadUrl } = useAssetApi()
  const { uploadFileWithProgress: uploadFile } = useFileUpload()

  // Upload asset file (video or attachment)
  async function uploadAssetFile(
    courseId: string,
    file: File,
    assetType: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio' | 'other',
    errorMessage: string = 'Tải lên file thất bại',
  ): Promise<string> {
    try {
      uploading.value = true
      isUploading.value = true
      uploadProgress.value = 0
      error.value = null

      // Step 1: Get presigned URL based on asset type
      const isVideo = assetType === 'video'
      let presignedResponse

      if (isVideo) {
        // Use video upload endpoint
        presignedResponse = await getVideoUploadUrl(courseId, file.name, file.type)
      }
      else {
        // Use attachment upload endpoint
        presignedResponse = await getAttachmentUploadUrl(file.name, file.type, 'attachments')
      }

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

      // Step 3: Return public_url to use in asset creation
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
    uploadAssetFile,
    resetUploadState,
  }
}
