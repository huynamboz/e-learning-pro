<script setup lang="ts">
import type { LessonMaterial } from '~/types/course.type'
import { Modal } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useFileUpload } from '~/composables/useFileUpload'

interface Props {
  courseId?: string
  chapterId?: string
  lessonId?: string
}

interface Emits {
  (e: 'uploadComplete', material: LessonMaterial): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const courseApi = useCourseApi()
const { uploadFileWithProgress } = useFileUpload()

const uploading = ref(false)
const uploadProgress = ref(0)
const selectedFile = ref<File | null>(null)
const uploadDraggerRef = ref()
const fileList = ref<any[]>([])

// Get MIME type from file (for upload URL request)
function getMimeTypeFromFile(file: File): string {
  return file.type || 'application/octet-stream'
}

// Convert MIME type to model choice (for materials payload)
function getModelChoiceFromFile(file: File): string {
  const mimeType = file.type.toLowerCase()
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  // PDF
  if (mimeType === 'application/pdf' || fileExtension === 'pdf')
    return 'pdf'

  // Word Documents - check DOCX first (newer format)
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === 'docx')
    return 'docx'

  // Word Documents - DOC (older format)
  if (mimeType === 'application/msword' || fileExtension === 'doc')
    return 'doc'

  // PowerPoint - check PPTX first (newer format)
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileExtension === 'pptx')
    return 'pptx'

  // PowerPoint - PPT (older format)
  if (mimeType === 'application/vnd.ms-powerpoint' || fileExtension === 'ppt')
    return 'ppt'

  // ZIP
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed' || fileExtension === 'zip' || fileExtension === 'rar')
    return 'zip'

  // Images
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileExtension || ''))
    return 'image'

  // Videos
  if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(fileExtension || ''))
    return 'video'

  // Audio
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'aac'].includes(fileExtension || ''))
    return 'audio'

  // Other
  return 'other'
}

// Before upload validation
function beforeUpload(file: File): boolean {
  // Reject video files
  if (file.type.startsWith('video/')) {
    Modal.error({
      title: t('admin.formLesson.materials.notifications.uploadFailed'),
      content: t('admin.resources.form.videoNotAllowedDescription'),
    })
    return false
  }

  const mimeType = file.type.toLowerCase()
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  // Check by MIME type first
  const typeMap: Record<string, string[]> = {
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ppt: ['application/vnd.ms-powerpoint'],
    pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    zip: ['application/zip', 'application/x-zip-compressed'],
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  }

  // Check MIME type
  const isValidMimeType = Object.values(typeMap).some(types => types.includes(mimeType))

  // Check file extension as fallback
  const validExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp3', 'wav', 'm4a', 'ogg']
  const isValidExtension = fileExtension && validExtensions.includes(fileExtension)

  // Validate specific types - check if extension and MIME type match expected format
  // DOC: extension .doc should match application/msword
  if (fileExtension === 'doc' && mimeType && mimeType !== 'application/msword' && mimeType !== 'application/octet-stream') {
    Modal.error({
      title: t('admin.resources.form.invalidFileType'),
      content: 'Invalid DOC file. The file extension does not match the file type. Please ensure the file is a valid Microsoft Word document (.doc).',
    })
    return false
  }

  // DOCX: extension .docx should match application/vnd.openxmlformats-officedocument.wordprocessingml.document
  if (fileExtension === 'docx' && mimeType && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && mimeType !== 'application/octet-stream') {
    Modal.error({
      title: t('admin.resources.form.invalidFileType'),
      content: 'Invalid DOCX file. The file extension does not match the file type. Please ensure the file is a valid Microsoft Word document (.docx).',
    })
    return false
  }

  // PPT: extension .ppt should match application/vnd.ms-powerpoint
  if (fileExtension === 'ppt' && mimeType && mimeType !== 'application/vnd.ms-powerpoint' && mimeType !== 'application/octet-stream') {
    Modal.error({
      title: t('admin.resources.form.invalidFileType'),
      content: 'Invalid PPT file. The file extension does not match the file type. Please ensure the file is a valid Microsoft PowerPoint presentation (.ppt).',
    })
    return false
  }

  // PPTX: extension .pptx should match application/vnd.openxmlformats-officedocument.presentationml.presentation
  if (fileExtension === 'pptx' && mimeType && mimeType !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation' && mimeType !== 'application/octet-stream') {
    Modal.error({
      title: t('admin.resources.form.invalidFileType'),
      content: 'Invalid PPTX file. The file extension does not match the file type. Please ensure the file is a valid Microsoft PowerPoint presentation (.pptx).',
    })
    return false
  }

  if (!isValidMimeType && !isValidExtension) {
    Modal.error({
      title: t('admin.resources.form.invalidFileType'),
      content: t('admin.resources.form.invalidFileTypeDescription'),
    })
    return false
  }

  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    Modal.error({
      title: t('admin.resources.form.fileTooLarge'),
      content: t('admin.resources.form.fileTooLargeDescription'),
    })
    return false
  }

  return false // Prevent auto upload
}

// Handle file change
function handleFileChange(info: any) {
  fileList.value = info.fileList
  if (info.fileList.length > 0) {
    const file = info.fileList[info.fileList.length - 1]
    if (file.originFileObj) {
      selectedFile.value = file.originFileObj as File
    }
  }
  else {
    selectedFile.value = null
  }
}

// Remove file
function removeFile() {
  selectedFile.value = null
  uploadProgress.value = 0
  fileList.value = []
}

// Upload file
async function handleUpload() {
  if (!selectedFile.value) {
    Modal.error({
      title: t('admin.formLesson.materials.notifications.uploadFailed'),
      content: t('admin.resources.form.fileRequired'),
    })
    return
  }

  if (!props.courseId || !props.chapterId || !props.lessonId) {
    Modal.error({
      title: t('admin.formLesson.materials.notifications.uploadFailed'),
      content: 'Course, chapter, or lesson ID is missing',
    })
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0

    // Step 1: Get presigned URL for lesson material
    const presignedResponse = await courseApi.getLessonMaterialUploadUrl(
      props.courseId,
      props.chapterId,
      props.lessonId,
      {
        file_name: selectedFile.value.name,
        content_type: getMimeTypeFromFile(selectedFile.value),
      },
    )

    const uploadUrl = presignedResponse?.upload_url
    const publicUrl = presignedResponse?.public_url

    if (!uploadUrl || !publicUrl) {
      throw new Error(t('admin.resources.form.missingUploadUrls'))
    }

    // Step 2: Upload to S3 with progress tracking
    await uploadFileWithProgress(
      selectedFile.value,
      uploadUrl,
      (percent) => {
        uploadProgress.value = percent
      },
    )

    // Step 3: Create material object and emit (use filename as title)
    const fileName = selectedFile.value.name.replace(/\.[^/.]+$/, '') // Remove extension
    const material: LessonMaterial = {
      title: fileName,
      file_path: publicUrl,
      file_type: getModelChoiceFromFile(selectedFile.value), // Use model choice, not MIME type
      file_size: selectedFile.value.size,
    }

    emit('uploadComplete', material)

    // Reset form
    removeFile()
    uploading.value = false
    uploadProgress.value = 0
  }
  catch (error: any) {
    console.error('Upload failed:', error)
    Modal.error({
      title: t('admin.formLesson.materials.notifications.uploadFailed'),
      content: error?.data?.message || error?.message || t('admin.resources.form.uploadFailed'),
    })
    uploading.value = false
    uploadProgress.value = 0
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>

<template>
  <div class="lesson-material-upload">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ t('admin.formLesson.materials.title') }}
      </h3>
      <p class="text-sm text-gray-500">
        {{ t('admin.formLesson.materials.uploadDescription') }}
      </p>
    </div>

    <!-- File Upload -->
    <div class="mb-4">
      <a-upload-dragger
        ref="uploadDraggerRef"
        :before-upload="beforeUpload"
        :file-list="fileList"
        :max-count="1"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a"
        @change="handleFileChange"
      >
        <p class="ant-upload-drag-icon">
          <Icon name="solar:cloud-upload-bold-duotone" size="48" class="text-blue-500" />
        </p>
        <p class="ant-upload-text">
          {{ t('admin.formLesson.materials.upload') }}
        </p>
        <p class="ant-upload-hint">
          {{ t('admin.formLesson.materials.uploadDescription') }}
        </p>
      </a-upload-dragger>

      <!-- Selected File Info -->
      <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="solar:document-bold-duotone" size="24" class="text-gray-600" />
            <div>
              <p class="font-medium text-gray-900">
                {{ selectedFile.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ formatFileSize(selectedFile.size) }}
              </p>
            </div>
          </div>
          <a-button type="text" danger @click="removeFile">
            <Icon name="solar:trash-bin-trash-bold-duotone" size="20" />
          </a-button>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="mt-4">
          <a-progress :percent="uploadProgress" :status="uploadProgress === 100 ? 'success' : 'active'" />
        </div>
      </div>
    </div>

    <!-- Upload Button -->
    <div class="flex justify-end">
      <a-button
        type="primary"
        :loading="uploading"
        :disabled="!selectedFile"
        @click="handleUpload"
      >
        {{ uploading ? t('admin.formLesson.buttons.uploading') : t('admin.formLesson.materials.addMaterial') }}
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.lesson-material-upload {
  padding: 1rem;
}
</style>
