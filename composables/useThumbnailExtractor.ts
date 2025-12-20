import { useCourseApi } from '~/composables/api/useCourseApi'
import { useFileUpload } from '~/composables/useFileUpload'

/**
 * Composable for extracting and uploading thumbnails
 * Handles both extracting thumbnails from videos and uploading user-selected thumbnail images
 */
export function useThumbnailExtractor() {
  const { uploadImage } = useCourseApi()
  const { uploadFileWithProgress } = useFileUpload()

  /**
   * Upload a user-selected thumbnail image file to S3
   * @param imageFile - The image file to upload
   * @param folder - S3 folder to upload thumbnail to (default: 'thumbnails')
   * @returns Promise resolving to the public URL of the uploaded thumbnail
   */
  async function uploadThumbnailImage(
    imageFile: File,
    folder: string = 'thumbnails',
  ): Promise<string> {
    const presign = await uploadImage({
      file_name: imageFile.name,
      content_type: imageFile.type,
      folder,
    })

    const uploadUrl = presign?.upload_url
    const publicUrl = presign?.public_url

    if (!uploadUrl || !publicUrl)
      throw new Error('Missing upload URLs')

    // Upload image with progress tracking
    await uploadFileWithProgress(imageFile, uploadUrl)

    return publicUrl
  }

  /**
   * Extract first frame from video and upload as thumbnail
   * @param videoFile - The video file to extract thumbnail from
   * @param folder - S3 folder to upload thumbnail to (default: 'thumbnails')
   * @returns Promise resolving to the public URL of the uploaded thumbnail, or null if extraction fails
   */
  async function extractAndUploadThumbnail(
    videoFile: File,
    folder: string = 'thumbnails',
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Seek to first frame (0 seconds)
        video.currentTime = 0
      }

      video.onseeked = async () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Convert canvas to blob (JPEG format)
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to extract frame from video'))
              return
            }

            try {
              // Create file from blob
              const thumbnailFile = new File([blob], `thumbnail-${Date.now()}.jpg`, {
                type: 'image/jpeg',
              })

              // Get presigned URL for thumbnail upload
              const presignedResponse = await uploadImage({
                file_name: thumbnailFile.name,
                content_type: thumbnailFile.type,
                folder,
              })

              const uploadUrl = presignedResponse?.upload_url
              const publicUrl = presignedResponse?.public_url

              if (!uploadUrl || !publicUrl) {
                reject(new Error('Missing upload URLs'))
                return
              }

              // Upload thumbnail to S3
              await uploadFileWithProgress(thumbnailFile, uploadUrl)

              // Clean up object URL
              URL.revokeObjectURL(video.src)

              resolve(publicUrl)
            }
            catch (err) {
              // Clean up object URL on error
              URL.revokeObjectURL(video.src)
              reject(err)
            }
          }, 'image/jpeg', 0.9) // 90% quality
        }
        catch (err) {
          // Clean up object URL on error
          URL.revokeObjectURL(video.src)
          reject(err)
        }
      }

      video.onerror = () => {
        // Clean up object URL on error
        if (video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src)
        }
        reject(new Error('Failed to load video'))
      }

      // Load video file
      video.src = URL.createObjectURL(videoFile)
    })
  }

  return {
    extractAndUploadThumbnail,
    uploadThumbnailImage,
  }
}
