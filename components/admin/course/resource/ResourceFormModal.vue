<script setup lang="ts">
import type { CourseAssetPayload } from '~/composables/api/useAssetApi'
import { message, Modal } from 'ant-design-vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useFileUpload } from '~/composables/useFileUpload'

interface Resource {
  id: string
  course: string
  asset_type: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio' | 'other'
  title: string
  description: string
  file_url: string
  duration?: number
  file_size: number
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
}

interface FileItem {
  uid: string
  name: string
  size: number
  type: string
  file: File
  assetType: Resource['asset_type']
  publicUrl?: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress?: number
  errorMessage?: string
}

interface Props {
  open: boolean
  courseId: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getAttachmentUploadUrl, createAsset } = useAssetApi()
const { uploadFileWithProgress } = useFileUpload()

const uploading = ref(false)
const overallProgress = ref(0)

const formRef = ref()
const uploadDraggerRef = ref()
const fileItems = ref<FileItem[]>([])
const isModalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

// Get asset type from file (video not allowed)
function getAssetTypeFromFile(file: File): Resource['asset_type'] {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, Resource['asset_type']> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'doc',
    ppt: 'ppt',
    pptx: 'ppt',
    zip: 'zip',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio', // Only audio ogg, video ogg is rejected in beforeUpload
    m4a: 'audio',
    m4b: 'audio',
    m4p: 'audio',
  }
  if (fileExtension && typeMap[fileExtension]) {
    return typeMap[fileExtension]
  }
  return 'other'
}

// Get asset type icon
function getAssetTypeIcon(type: Resource['asset_type']): string {
  const iconMap: Record<Resource['asset_type'], string> = {
    video: 'solar:videocamera-record-bold',
    pdf: 'solar:document-text-bold',
    doc: 'solar:document-bold',
    ppt: 'solar:presentation-graph-bold',
    zip: 'solar:archive-bold',
    image: 'solar:gallery-bold',
    audio: 'solar:music-note-bold',
    other: 'solar:file-bold',
  }
  return iconMap[type] || iconMap.other
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

// Before upload validation
function beforeUpload(file: File): boolean {
  // Reject video files
  if (file.type.startsWith('video/')) {
    Modal.error({
      title: t('admin.resources.form.videoNotAllowed'),
      content: t('admin.resources.form.videoNotAllowedDescription'),
    })
    return false
  }

  const isValidType = ['pdf', 'doc', 'ppt', 'zip', 'image', 'audio'].some((type) => {
    const typeMap: Record<string, string[]> = {
      pdf: ['application/pdf'],
      doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ppt: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      zip: ['application/zip', 'application/x-zip-compressed'],
      image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    }
    return typeMap[type]?.includes(file.type)
  })

  if (!isValidType) {
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
  info.fileList.forEach((file: any) => {
    // Only add files that have originFileObj (new files)
    if (file.originFileObj) {
      const fileObj = file.originFileObj as File
      const assetType = getAssetTypeFromFile(fileObj)

      // Check if file already exists
      const exists = fileItems.value.some(item =>
        item.name === fileObj.name && item.size === fileObj.size,
      )

      if (!exists && assetType !== 'other') {
        fileItems.value.push({
          uid: file.uid,
          name: fileObj.name,
          size: fileObj.size,
          type: fileObj.type,
          file: fileObj,
          assetType,
          status: 'pending',
        })
      }
    }
  })
}

// Remove file from list
function removeFile(uid: string) {
  fileItems.value = fileItems.value.filter(item => item.uid !== uid)
}

// Upload single file
async function uploadSingleFile(fileItem: FileItem): Promise<void> {
  try {
    fileItem.status = 'uploading'
    fileItem.progress = 0
    fileItem.errorMessage = undefined

    // Step 1: Get presigned URL (video not allowed, always use attachment endpoint)
    let presignedResponse

    try {
      presignedResponse = await getAttachmentUploadUrl(
        fileItem.file.name,
        fileItem.file.type,
        'attachments',
      )
    }
    catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || t('admin.resources.form.getPresignedUrlFailed')
      fileItem.errorMessage = `${t('admin.resources.form.getPresignedUrlFailed')}: ${errorMsg}`
      throw new Error(`${fileItem.name}: ${fileItem.errorMessage}`)
    }

    const uploadUrl = presignedResponse?.upload_url
    const publicUrl = presignedResponse?.public_url

    if (!uploadUrl || !publicUrl) {
      fileItem.errorMessage = t('admin.resources.form.missingUploadUrls')
      throw new Error(`${fileItem.name}: ${fileItem.errorMessage}`)
    }

    // Step 2: Upload to S3 with progress tracking
    try {
      await uploadFileWithProgress(
        fileItem.file,
        uploadUrl,
        (percent) => {
          fileItem.progress = percent
        },
      )
    }
    catch (error: any) {
      const errorMsg = error?.message || t('admin.resources.form.uploadToS3Failed')
      fileItem.errorMessage = `${t('admin.resources.form.uploadToS3Failed')}: ${errorMsg}`
      throw new Error(`${fileItem.name}: ${fileItem.errorMessage}`)
    }

    fileItem.publicUrl = publicUrl
    fileItem.progress = 100

    // Step 3: Create asset record
    try {
      const payload: CourseAssetPayload = {
        asset_type: fileItem.assetType,
        title: fileItem.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
        description: '',
        file_url: publicUrl,
        file_size: fileItem.size,
        order: undefined, // null/undefined as per requirement
        is_downloadable: true, // Default true
      }

      await createAsset(props.courseId, payload)
    }
    catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || t('admin.resources.form.createAssetFailed')
      fileItem.errorMessage = `${t('admin.resources.form.createAssetFailed')}: ${errorMsg}`
      throw new Error(`${fileItem.name}: ${fileItem.errorMessage}`)
    }

    fileItem.status = 'done'
  }
  catch (error: any) {
    console.error('Upload failed for file:', fileItem.name, error)
    fileItem.status = 'error'
    if (!fileItem.errorMessage) {
      fileItem.errorMessage = error?.message || error?.data?.message || t('admin.resources.form.uploadFailed')
    }
    throw error
  }
}

// Handle save - upload all files
async function handleSave() {
  if (fileItems.value.length === 0) {
    message.error(t('admin.resources.form.fileRequired'))
    return
  }

  try {
    uploading.value = true
    overallProgress.value = 0

    const pendingFiles = fileItems.value.filter(
      item => item.status === 'pending' || item.status === 'error',
    )

    if (pendingFiles.length === 0) {
      message.info(t('admin.resources.notifications.allFilesUploaded'))
      resetForm() // Clear all values first
      emit('save')
      isModalOpen.value = false // Close dialog after clearing
      return
    }

    // Upload all files sequentially
    let successCount = 0
    let failCount = 0
    const failedFiles: string[] = []

    for (let i = 0; i < pendingFiles.length; i++) {
      const fileItem = pendingFiles[i]
      try {
        await uploadSingleFile(fileItem)
        successCount++
      }
      catch (error: any) {
        failCount++
        failedFiles.push(fileItem.name)
        console.error('Failed to upload file:', fileItem.name, error)
      }

      // Update overall progress
      overallProgress.value = Math.round(((i + 1) / pendingFiles.length) * 100)
    }

    // Show result message
    if (failCount === 0) {
      message.success(
        t('admin.resources.notifications.uploadSuccess', { count: successCount }),
      )
      // Only close dialog and reset form when all files uploaded successfully
      resetForm() // Clear all values first
      emit('save')
      isModalOpen.value = false // Close dialog after clearing
    }
    else if (successCount > 0) {
      const failedFilesList = failedFiles.slice(0, 3).join(', ')
      const moreFiles = failedFiles.length > 3 ? ` và ${failedFiles.length - 3} file khác` : ''
      message.warning(
        t('admin.resources.notifications.uploadPartialSuccess', {
          failed: failCount,
          total: pendingFiles.length,
          files: failedFilesList + moreFiles,
        }),
      )
      // Don't close dialog when there are errors - let user see errors and retry
    }
    else {
      const failedFilesList = failedFiles.slice(0, 3).join(', ')
      const moreFiles = failedFiles.length > 3 ? ` và ${failedFiles.length - 3} file khác` : ''
      message.error(
        t('admin.resources.notifications.uploadAllFailed', {
          files: failedFilesList + moreFiles,
        }),
      )
      // Don't close dialog when all files failed - let user see errors and retry
    }
  }
  catch (error: any) {
    console.error('Save failed:', error)
    const errorMessage = error?.data?.message || error?.message || t('admin.resources.notifications.saveFailed')
    message.error(errorMessage)
  }
  finally {
    uploading.value = false
    overallProgress.value = 0
  }
}

// Reset form - clear all values
function resetForm() {
  fileItems.value = []
  uploading.value = false
  overallProgress.value = 0
  formRef.value?.resetFields()
}

// Handle cancel - clear and close
function handleCancel() {
  resetForm()
  isModalOpen.value = false
}

// Watch for modal close
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<template>
  <a-modal
    v-model:open="isModalOpen"
    :title="t('admin.resources.form.addTitle')"
    :width="900"
    :confirm-loading="uploading"
    :ok-text="t('admin.resources.form.upload')"
    :cancel-text="t('admin.resources.form.cancel')"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      layout="vertical"
      class="w-full"
    >
      <!-- File Upload Area -->
      <a-form-item
        :label="t('admin.resources.form.file')"
        :rules="[{ required: true, message: t('admin.resources.form.fileRequired') }]"
      >
        <a-upload-dragger
          ref="uploadDraggerRef"
          :before-upload="beforeUpload"
          :multiple="true"
          :file-list="fileItems"
          :show-upload-list="false"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,image/*,audio/*"
          class="!min-h-[120px] !flex !items-center !justify-center"
          @change="handleFileChange"
        >
          <div class="text-center py-4">
            <p class="ant-upload-drag-icon mb-2">
              <Icon name="solar:cloud-upload-bold-duotone" size="36" class="text-blue-500" />
            </p>
            <p class="ant-upload-text text-base font-semibold text-gray-900 mb-1">
              {{ t('admin.resources.form.dragText') }}
            </p>
            <p class="ant-upload-hint text-xs text-gray-500 mb-3">
              {{ t('admin.resources.form.dragHint') }}
            </p>
            <a-button type="primary" size="middle">
              <Icon name="solar:folder-with-files-bold" size="18" class="mr-2" />
              {{ t('admin.resources.form.selectFiles') }}
            </a-button>
          </div>
        </a-upload-dragger>
      </a-form-item>

      <!-- File List -->
      <div v-if="fileItems.length > 0" class="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
        <div
          v-for="fileItem in fileItems"
          :key="fileItem.uid"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <!-- File Icon -->
          <div class="flex-shrink-0">
            <div class="size-[50px] flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <Icon :name="getAssetTypeIcon(fileItem.assetType)" size="24" class="text-blue-600" />
            </div>
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">
              {{ fileItem.name }}
            </div>
            <div class="text-sm text-gray-500 mt-1">
              {{ formatFileSize(fileItem.size) }}
            </div>
            <!-- Upload Progress -->
            <div v-if="fileItem.status === 'uploading'" class="mt-2">
              <a-progress :percent="fileItem.progress || 0" :show-info="false" size="small" />
            </div>
            <!-- Status -->
            <div v-if="fileItem.status === 'done'" class="mt-1 text-xs text-green-600 flex items-center gap-1">
              <Icon name="solar:check-circle-bold" size="14" />
              {{ t('admin.resources.form.uploaded') }}
            </div>
            <div v-if="fileItem.status === 'error'" class="mt-1">
              <div class="text-xs text-red-600 flex items-center gap-1">
                <Icon name="solar:close-circle-bold" size="14" />
                {{ t('admin.resources.form.uploadFailed') }}
              </div>
              <div v-if="fileItem.errorMessage" class="text-xs text-red-500 mt-1 pl-5">
                {{ fileItem.errorMessage }}
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <div class="flex-shrink-0">
            <a-button
              type="text"
              danger
              size="small"
              :disabled="fileItem.status === 'uploading'"
              @click="removeFile(fileItem.uid)"
            >
              <Icon name="solar:trash-bin-trash-bold" size="18" />
            </a-button>
          </div>
        </div>
      </div>

      <!-- Upload Progress (Overall) -->
      <div v-if="uploading" class="mt-4">
        <div class="mb-2 text-sm text-gray-600">
          {{ t('admin.resources.form.uploadingProgress', { percent: overallProgress }) }}
        </div>
        <a-progress :percent="overallProgress" :status="uploading ? 'active' : 'normal'" />
      </div>
    </a-form>
  </a-modal>
</template>
