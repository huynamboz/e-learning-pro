<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { VideoPostCreate } from '~/composables/api/useVideoBlogApi'
import { notification } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useVideoBlogApi } from '~/composables/api/useVideoBlogApi'
import { useFileUpload } from '~/composables/useFileUpload'
import { useVideoUpload } from '~/composables/useVideoUpload'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const { t } = useI18n()
const router = useRouter()
const { createPost } = useVideoBlogApi()
const { uploadVideoFile, uploadProgress, isUploading } = useVideoUpload()
const { uploadImage } = useCourseApi()
const { uploadFileWithProgress, uploading } = useFileUpload()

const formRef = ref()
const loading = ref(false)
const error = ref<string | null>(null)
const videoFileList = ref<any[]>([])
const videoPreviewUrl = ref<string>('')
const imageFileList = ref<any[]>([])
const imagePreviewUrl = ref<string>('')

const formData = reactive<VideoPostCreate>({
  title: '',
  content: '',
  video_url: '',
  thumbnail: '',
  author: '',
  is_published: false,
  tags: [],
})

const rules: Record<string, Rule[]> = {
  title: [
    { required: true, message: t('admin.videoPosts.editor.titleRequired'), trigger: 'blur' },
    { max: 200, message: t('admin.videoPosts.editor.titleMaxLength'), trigger: 'blur' },
  ],
  content: [
    { required: true, message: t('admin.videoPosts.editor.contentRequired'), trigger: 'blur' },
  ],
  author: [
    { max: 100, message: t('admin.videoPosts.editor.authorMaxLength'), trigger: 'blur' },
  ],
}

function beforeUpload() {
  return false
}

function handleVideoChange(info: any) {
  videoFileList.value = [...info.fileList].slice(-1)
  const last = videoFileList.value[0]
  if (last?.originFileObj) {
    const file = last.originFileObj as File

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    if (!validTypes.includes(file.type)) {
      notification.error({ message: 'Định dạng video không được hỗ trợ. Vui lòng chọn file MP4, WebM, OGG, MOV hoặc AVI.' })
      videoFileList.value = []
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      notification.error({ message: 'Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 500MB.' })
      videoFileList.value = []
      return
    }

    if (videoPreviewUrl.value)
      URL.revokeObjectURL(videoPreviewUrl.value)
    videoPreviewUrl.value = URL.createObjectURL(file)
    formData.video_url = '' // Clear URL if file is selected
  }
  else if (last?.url) {
    // Existing video from URL
    videoPreviewUrl.value = last.url
    formData.video_url = last.url
  }
}

function removeVideo() {
  if (videoPreviewUrl.value && videoPreviewUrl.value.startsWith('blob:'))
    URL.revokeObjectURL(videoPreviewUrl.value)
  videoPreviewUrl.value = ''
  videoFileList.value = []
  formData.video_url = ''
}

function handleImageChange(info: any) {
  imageFileList.value = [...info.fileList].slice(-1)
  const last = imageFileList.value[0]
  if (last?.originFileObj) {
    if (imagePreviewUrl.value)
      URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = URL.createObjectURL(last.originFileObj as File)
    formData.thumbnail = '' // Clear thumbnail URL when new image is selected
  }
  else if (last?.url) {
    // Existing image from URL
    imagePreviewUrl.value = last.url
    formData.thumbnail = last.url
  }
}

function removeImage() {
  if (imagePreviewUrl.value && imagePreviewUrl.value.startsWith('blob:'))
    URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  imageFileList.value = []
  formData.thumbnail = ''
}

// Extract first frame from video and upload as thumbnail
async function extractAndUploadThumbnail(videoFile: File): Promise<string | null> {
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
              folder: 'thumbnails',
            })

            const uploadUrl = presignedResponse?.upload_url
            const publicUrl = presignedResponse?.public_url

            if (!uploadUrl || !publicUrl) {
              reject(new Error('Missing upload URLs'))
              return
            }

            // Upload thumbnail to S3
            await uploadFileWithProgress(thumbnailFile, uploadUrl)

            resolve(publicUrl)
          }
          catch (err) {
            reject(err)
          }
        }, 'image/jpeg', 0.9) // 90% quality
      }
      catch (err) {
        reject(err)
      }
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }

    // Load video file
    video.src = URL.createObjectURL(videoFile)
  })
}

// Handle tag input
const tagInput = ref('')
const tagInputVisible = ref(false)

function handleTagInputConfirm() {
  if (tagInput.value && !formData.tags?.includes(tagInput.value)) {
    if (!formData.tags) {
      formData.tags = []
    }
    formData.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
  tagInputVisible.value = false
}

function removeTag(tag: string) {
  if (formData.tags) {
    const index = formData.tags.indexOf(tag)
    if (index > -1) {
      formData.tags.splice(index, 1)
    }
  }
}

function showTagInput() {
  tagInputVisible.value = true
}

// Handle form submission
async function handleSubmit() {
  try {
    await formRef.value?.validate()

    // Validate video file
    if (!videoFileList.value.length) {
      notification.error({ message: t('admin.videoPosts.editor.videoRequired') })
      return
    }

    loading.value = true
    error.value = null

    // Upload video file
    const file = videoFileList.value[0].originFileObj as File
    if (!file) {
      notification.error({ message: t('admin.videoPosts.editor.videoRequired') })
      loading.value = false
      return
    }

    let videoUrl = ''
    try {
      videoUrl = await uploadVideoFile(file, t('admin.videoPosts.messages.uploadError'))
    }
    catch (uploadErr) {
      console.error('Error uploading video:', uploadErr)
      loading.value = false
      return
    }

    // Upload thumbnail image if selected
    let thumbnailUrl = formData.thumbnail?.trim() || ''
    if (imageFileList.value.length && imageFileList.value[0].originFileObj) {
      const imageFile = imageFileList.value[0].originFileObj as File
      try {
        uploading.value = true
        isUploading.value = true
        uploadProgress.value = 0

        const presign = await uploadImage({
          file_name: imageFile.name,
          content_type: imageFile.type,
          folder: 'thumbnails',
        })

        const uploadUrl = presign?.upload_url
        const publicUrl = presign?.public_url

        if (!uploadUrl || !publicUrl)
          throw new Error('Missing upload URLs')

        // Upload image with progress tracking
        await uploadFileWithProgress(imageFile, uploadUrl)
        thumbnailUrl = publicUrl
        isUploading.value = false
      }
      catch (err) {
        notification.error({
          message: t('admin.videoPosts.messages.uploadThumbnailFailed') || 'Upload thumbnail failed',
          description: String(err),
        })
        loading.value = false
        uploading.value = false
        isUploading.value = false
        uploadProgress.value = 0
        return
      }
      finally {
        uploading.value = false
        isUploading.value = false
        uploadProgress.value = 0
      }
    }
    // Auto-extract and upload thumbnail from video if not provided
    else if (!thumbnailUrl && videoUrl) {
      try {
        const extractedThumbnailUrl = await extractAndUploadThumbnail(file)
        if (extractedThumbnailUrl) {
          thumbnailUrl = extractedThumbnailUrl
        }
      }
      catch (thumbnailErr) {
        console.warn('Failed to extract thumbnail:', thumbnailErr)
        // Don't block submission if thumbnail extraction fails
      }
    }

    const payload: VideoPostCreate = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      video_url: videoUrl,
      thumbnail: thumbnailUrl || undefined,
      author: formData.author?.trim() || undefined,
      is_published: formData.is_published,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
    }

    await createPost(payload)
    notification.success({ message: t('admin.videoPosts.messages.createSuccess') })
    router.push('/admin/video-posts')
  }
  catch (err: any) {
    if (err?.errorFields) {
      // Validation errors
      return
    }
    error.value = err?.message || t('admin.videoPosts.messages.createError')
    notification.error({ message: error.value })
    console.error('Error creating post:', err)
  }
  finally {
    loading.value = false
  }
}

function handleBack() {
  router.back()
}

// SEO
useHead({
  title: () => `${t('admin.videoPosts.editor.createTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('admin.videoPosts.editor.createDescription') },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pt-0 max-md:px-0">
    <div class="w-full max-w-4xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Icon name="solar:video-frame-play-vertical-bold" size="24" class="text-white" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ $t('admin.videoPosts.editor.createTitle') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ $t('admin.videoPosts.editor.createDescription') }}
            </p>
          </div>
          <a-button class="!flex !justify-center !items-center !gap-1" @click="handleBack">
            <Icon name="solar:arrow-left-bold" size="18" />
            {{ $t('admin.videoPosts.editor.back') }}
          </a-button>
        </div>
      </div>

      <!-- Error Alert -->
      <a-alert
        v-if="error"
        type="error"
        :message="error"
        show-icon
        closable
        class="mb-6"
        @close="error = null"
      />

      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <!-- Basic Information Section -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <Icon name="solar:document-text-bold" size="20" class="text-purple-600" />
              <h2 class="text-lg font-semibold text-gray-900">
                {{ $t('admin.videoPosts.editor.basicInfo') }}
              </h2>
            </div>

            <div class="space-y-4">
              <!-- Title -->
              <a-form-item :label="$t('admin.videoPosts.editor.title')" name="title">
                <a-input
                  v-model:value="formData.title"
                  :placeholder="$t('admin.videoPosts.editor.titlePlaceholder')"
                  size="large"
                >
                  <template #prefix>
                    <Icon name="solar:text-field-bold" size="16" class="text-gray-400" />
                  </template>
                </a-input>
              </a-form-item>

              <!-- Author -->
              <a-form-item :label="$t('admin.videoPosts.editor.author')" name="author">
                <a-input
                  v-model:value="formData.author"
                  :placeholder="$t('admin.videoPosts.editor.authorPlaceholder')"
                  size="large"
                >
                  <template #prefix>
                    <Icon name="solar:user-bold" size="16" class="text-gray-400" />
                  </template>
                </a-input>
              </a-form-item>

              <!-- Content -->
              <a-form-item :label="$t('admin.videoPosts.editor.content')" name="content">
                <a-textarea
                  v-model:value="formData.content"
                  :placeholder="$t('admin.videoPosts.editor.contentPlaceholder')"
                  :rows="8"
                  size="large"
                />
                <div class="text-xs text-gray-500 mt-1">
                  {{ $t('admin.videoPosts.editor.contentHint') }}
                </div>
              </a-form-item>
            </div>
          </div>

          <!-- Video Information Section -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <Icon name="solar:video-frame-play-vertical-bold" size="20" class="text-purple-600" />
              <h2 class="text-lg font-semibold text-gray-900">
                {{ $t('admin.videoPosts.editor.videoInfo') }}
              </h2>
            </div>

            <div class="space-y-4">
              <!-- Video File Upload -->
              <a-form-item :label="$t('admin.videoPosts.editor.videoFile')" name="video_file">
                <a-upload-dragger
                  v-model:file-list="videoFileList"
                  name="video"
                  :multiple="false"
                  :before-upload="beforeUpload"
                  :max-count="1"
                  :show-upload-list="false"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                  class="!min-h-[200px] !flex !items-center"
                  @change="handleVideoChange"
                >
                  <div v-if="videoFileList.length && videoPreviewUrl" class="relative w-full flex items-center justify-center px-2 sm:px-4">
                    <video :src="videoPreviewUrl" controls class="w-full rounded-lg max-h-[300px]" />
                    <div
                      class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-8 w-8 rounded-full !flex !justify-center !items-center border border-gray-700 cursor-pointer"
                      @click.stop.prevent="removeVideo"
                    >
                      <Icon name="solar:close-circle-bold" size="20" class="text-gray-700" />
                    </div>
                  </div>

                  <template v-else>
                    <p class="ant-upload-drag-icon">
                      <Icon name="solar:video-frame-play-vertical-bold" size="48" class="text-purple-500" />
                    </p>
                    <p class="ant-upload-text">
                      {{ $t('admin.videoPosts.editor.videoFileUploadText') }}
                    </p>
                    <p class="ant-upload-hint">
                      {{ $t('admin.videoPosts.editor.videoFileUploadHint') }}
                    </p>
                  </template>
                </a-upload-dragger>

                <!-- Upload Progress -->
                <div v-if="isUploading" class="mt-3 space-y-2">
                  <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>{{ $t('admin.videoPosts.editor.uploadingVideo') }}</span>
                    <span>{{ uploadProgress }}%</span>
                  </div>
                  <a-progress
                    :percent="uploadProgress"
                    :show-info="false"
                    status="active"
                    stroke-color="#9333ea"
                    class="!h-2"
                  />
                </div>
              </a-form-item>

              <!-- Thumbnail -->
              <a-form-item :label="$t('admin.videoPosts.editor.thumbnail')" name="thumbnail">
                <a-upload-dragger
                  v-model:file-list="imageFileList"
                  name="thumbnail"
                  :multiple="false"
                  :before-upload="beforeUpload"
                  :max-count="1"
                  :show-upload-list="false"
                  accept="image/png,image/jpeg"
                  class="!min-h-[150px] sm:!min-h-[200px] !flex !items-center"
                  @change="handleImageChange"
                >
                  <div v-if="imageFileList.length && imagePreviewUrl" class="relative w-full flex items-center justify-center px-2 sm:px-4">
                    <img :src="imagePreviewUrl" alt="thumbnail preview" class="h-full rounded-lg object-contain max-h-[200px] sm:max-h-none">
                    <div
                      class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full !flex !justify-center !items-center border border-gray-700 cursor-pointer"
                      @click.stop.prevent="removeImage"
                    >
                      <Icon name="solar:close-circle-bold" size="16" class="text-gray-700" />
                    </div>
                  </div>

                  <template v-else>
                    <p class="ant-upload-drag-icon">
                      <Icon name="solar:gallery-add-bold-duotone" size="48" class="text-purple-500" />
                    </p>
                    <p class="ant-upload-text">
                      {{ $t('admin.videoPosts.editor.thumbnailUploadText') || 'Kéo thả ảnh vào đây hoặc' }} <span class="text-blue-600">{{ $t('admin.videoPosts.editor.thumbnailBrowse') || 'chọn ảnh' }}</span>
                    </p>
                  </template>
                </a-upload-dragger>
                <div class="text-xs text-gray-500 mt-1">
                  {{ $t('admin.videoPosts.editor.thumbnailAutoHint') || 'Nếu không chọn ảnh, hệ thống sẽ tự động tạo thumbnail từ frame đầu tiên của video.' }}
                </div>
              </a-form-item>
            </div>
          </div>

          <!-- Tags Section -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <Icon name="solar:tag-bold" size="20" class="text-purple-600" />
              <h2 class="text-lg font-semibold text-gray-900">
                {{ $t('admin.videoPosts.editor.tags') }}
              </h2>
            </div>

            <div class="space-y-2">
              <div v-if="formData.tags && formData.tags.length > 0" class="flex flex-wrap gap-2 mb-2">
                <a-tag
                  v-for="tag in formData.tags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                >
                  {{ tag }}
                </a-tag>
              </div>
              <div v-if="tagInputVisible" class="flex gap-2">
                <a-input
                  v-model:value="tagInput"
                  size="small"
                  :placeholder="$t('admin.videoPosts.editor.tagPlaceholder')"
                  @press-enter="handleTagInputConfirm"
                  @blur="handleTagInputConfirm"
                />
              </div>
              <a-button
                v-else
                size="small"
                type="dashed"
                class="!flex !justify-center !items-center !gap-1"
                @click="showTagInput"
              >
                <Icon name="solar:add-circle-bold" size="16" />
                {{ $t('admin.videoPosts.editor.addTag') }}
              </a-button>
            </div>
          </div>

          <!-- Settings Section -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <Icon name="solar:settings-bold" size="20" class="text-purple-600" />
              <h2 class="text-lg font-semibold text-gray-900">
                {{ $t('admin.videoPosts.editor.settings') }}
              </h2>
            </div>

            <div class="space-y-4">
              <!-- Published Status -->
              <a-form-item name="is_published">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ $t('admin.videoPosts.editor.isPublished') }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ $t('admin.videoPosts.editor.isPublishedHint') }}
                    </div>
                  </div>
                  <a-switch v-model:checked="formData.is_published" />
                </div>
              </a-form-item>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <a-button size="large" class="!flex !justify-center !items-center" @click="handleBack">
              {{ $t('admin.videoPosts.editor.cancel') }}
            </a-button>
            <a-button
              type="primary"
              size="large"
              :loading="loading || isUploading"
              :disabled="isUploading"
              html-type="submit"
              class="!flex !justify-center !items-center !gap-1"
            >
              <Icon name="solar:check-circle-bold" size="18" />
              {{ $t('admin.videoPosts.editor.create') }}
            </a-button>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>
