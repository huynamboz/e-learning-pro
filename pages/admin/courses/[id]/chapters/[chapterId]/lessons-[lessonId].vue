<script lang="ts" setup>
import type { FormInstance, UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { LessonMaterial, LessonPayload } from '~/types/course.type'
import { useCourse } from '#imports'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Modal, notification } from 'ant-design-vue'
import LessonMaterialUpload from '~/components/admin/course/lesson/LessonMaterialUpload.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { generateSlug } from '~/utils/slug'

const { t } = useI18n()

const route = useRoute()
const courseId = computed(() => route.params.id as string)
const chapterId = computed(() => route.params.chapterId as string)
const lessonId = computed(() => route.params.lessonId as string)
const router = useRouter()

const { uploadFile, uploadImage, deleteLesson } = useCourseApi()
const { createLesson, updateLesson, detailLesson, currentLesson, fetchChapters, isCreatingLesson } = useCourse()

const formRef = ref<FormInstance>()
const formState = ref<LessonPayload>({
  chapter_id: chapterId.value,
  title: '',
  slug: '',
  description: '',
  video_url: '',
  video_duration: 0,
  content: '',
  is_preview: false,
  is_published: true,
  is_unlocked: true,
  thumbnail: '',
  materials: [],
} as any)

// Upload state
const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref('')
const imagePreviewUrl = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)
const lastUploadedFile = ref<File | null>(null)

// Delete dialog state
const showDeleteDialog = ref(false)
const isDeleting = ref(false)

// Fetch lesson data
async function fetchLesson() {
  if (lessonId.value && lessonId.value !== 'create') {
    await detailLesson(courseId.value, chapterId.value, lessonId.value)
    if (currentLesson.value) {
      const data = currentLesson.value
      formState.value = {
        chapter_id: chapterId.value,
        title: data.title,
        slug: data.slug,
        description: data.description,
        video_url: data.video_url,
        video_duration: data.video_duration,
        content: (data as any).content || '',
        is_preview: data.is_preview,
        is_published: data.is_published,
        is_unlocked: data.is_unlocked,
        thumbnail: (data as any).thumbnail || '',
        materials: Array.isArray((data as any).materials) ? [...(data as any).materials] : [],
        // materials: [
        //   {
        //     id: '1',
        //     title: 'Material 1',
        //     description: 'Description 1',
        //     file_url: 'https://example.com/material1.pdf',
        //     file_type: 'application/pdf',
        //     file_size: 1000,
        //     uploaded_at: '2021-01-01',
        //     uploaded_by: 1,
        //     has_access: true,
        //   },
        //   {
        //     id: '2',
        //     title: 'Material 2',
        //     description: 'Description 2',
        //     file_url: 'https://example.com/material2.pdf',
        //     file_type: 'application/pdf',
        //     file_size: 1000,
        //     uploaded_at: '2021-01-01',
        //     uploaded_by: 1,
        //     has_access: true,
        //   },
        // ],
      } as any

      // Hiển thị video preview nếu có sẵn
      if (data.video_url) {
        videoPreviewUrl.value = data.video_url
        videoFileList.value = [{
          uid: '-1',
          name: 'current_video.mp4',
          status: 'done',
          url: data.video_url,
        }] as any
        // Set lastUploadedFile to indicate video is already uploaded
        lastUploadedFile.value = new File([''], 'current_video.mp4', { type: 'video/mp4' })
      }

      // Hiển thị thumbnail preview nếu có sẵn
      if ((data as any).thumbnail) {
        imagePreviewUrl.value = (data as any).thumbnail
        imageFileList.value = [{
          uid: '-2',
          name: 'current_thumbnail.jpg',
          status: 'done',
          url: (data as any).thumbnail,
        }] as any
      }
    }
  }
  else {
    // Reset form for new lesson
    formState.value = {
      chapter_id: chapterId.value,
      title: '',
      slug: '',
      description: '',
      video_url: '',
      video_duration: 0,
      content: '',
      is_preview: false,
      is_published: true,
      is_unlocked: true,
      materials: [],
    } as any
    // Reset video states
    videoPreviewUrl.value = ''
    videoFileList.value = []
    lastUploadedFile.value = null
  }
}

onMounted(() => {
  fetchLesson()
})

// Watch route changes
watch(() => lessonId.value, () => {
  fetchLesson()
})

// Watch title changes to auto-generate slug
watch(() => formState.value.title, (newTitle) => {
  // Only generate slug for new lessons (not when editing existing)
  if (!lessonId.value || lessonId.value === 'create') {
    formState.value.slug = generateSlug(newTitle)
  }
})

function beforeUpload() {
  return false
}

function handleVideoChange(info: UploadChangeParam) {
  videoFileList.value = [...info.fileList].slice(-1)
  const last = videoFileList.value[0]
  if (last?.originFileObj) {
    if (videoPreviewUrl.value)
      URL.revokeObjectURL(videoPreviewUrl.value)
    videoPreviewUrl.value = URL.createObjectURL(last.originFileObj as File)
  }
}

function handleImageChange(info: UploadChangeParam) {
  imageFileList.value = [...info.fileList].slice(-1)
  const last = imageFileList.value[0]
  if (last?.originFileObj) {
    if (imagePreviewUrl.value)
      URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = URL.createObjectURL(last.originFileObj as File)
  }
}

function removeVideo() {
  if (videoPreviewUrl.value)
    URL.revokeObjectURL(videoPreviewUrl.value)
  videoPreviewUrl.value = ''
  videoFileList.value = []
  formState.value.video_url = ''
  lastUploadedFile.value = null
}

function removeImage() {
  if (imagePreviewUrl.value)
    URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  imageFileList.value = []
}

// Check if file has changed
function hasFileChanged(currentFile: File): boolean {
  if (!lastUploadedFile.value || !currentFile)
    return true

  return (
    currentFile.name !== lastUploadedFile.value.name
    || currentFile.size !== lastUploadedFile.value.size
    || currentFile.lastModified !== lastUploadedFile.value.lastModified
  )
}

// Upload file with progress tracking
function uploadFileWithProgress(file: File, uploadUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        uploadProgress.value = percentComplete
      }
    })

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        uploadProgress.value = 100
        // Store the uploaded file info
        lastUploadedFile.value = file
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

// Upload image with progress tracking
function uploadImageWithProgress(file: File, uploadUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        uploadProgress.value = percentComplete
      }
    })

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        uploadProgress.value = 100
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

async function uploadVideoAndSaveLesson() {
  await formRef.value?.validateFields()

  if (!courseId.value)
    return

  // Upload video if changed
  if (videoFileList.value.length && videoFileList.value[0].originFileObj) {
    const file = videoFileList.value[0].originFileObj as File

    // Only upload if file has changed
    if (hasFileChanged(file)) {
      try {
        uploading.value = true
        isUploading.value = true
        uploadProgress.value = 0

        const presign = await uploadFile(courseId.value, {
          file_name: file.name,
          content_type: file.type,
        } as any)

        const uploadUrl = presign?.upload_url || presign?.uploadUrl || presign?.url
        const publicUrl = presign?.public_url || presign?.publicUrl

        if (!uploadUrl || !publicUrl)
          throw new Error('Missing upload URLs')

        // Upload file with progress tracking
        await uploadFileWithProgress(file, uploadUrl)
        formState.value.video_url = publicUrl
        isUploading.value = false
      }
      catch (err) {
        notification.error({
          message: t('admin.formLesson.notifications.uploadVideoFailed'),
          description: String(err),
        })
        return
      }
      finally {
        uploading.value = false
        isUploading.value = false
        uploadProgress.value = 0
      }
    }
    else {
      // File hasn't changed, no need to upload
      // File hasn't changed, no need to upload
    }
  }

  // Upload image if changed
  if (imageFileList.value.length && imageFileList.value[0].originFileObj) {
    const file = imageFileList.value[0].originFileObj as File

    try {
      uploading.value = true
      isUploading.value = true
      uploadProgress.value = 0

      const presign = await uploadImage({
        file_name: file.name,
        content_type: file.type,
        folder: 'thumbnails',
      })

      const uploadUrl = presign?.upload_url
      const publicUrl = presign?.public_url

      if (!uploadUrl || !publicUrl)
        throw new Error('Missing upload URLs')

      // Upload image with progress tracking
      await uploadImageWithProgress(file, uploadUrl)
      ;(formState.value as any).thumbnail = publicUrl
      isUploading.value = false
    }
    catch (err) {
      notification.error({
        message: t('admin.formLesson.notifications.uploadImageFailed'),
        description: String(err),
      })
      return
    }
    finally {
      uploading.value = false
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  await saveLesson()
}

async function saveLesson() {
  formState.value.chapter_id = chapterId.value

  if (lessonId.value && lessonId.value !== 'create') {
    const response = await updateLesson(
      courseId.value,
      chapterId.value,
      lessonId.value,
      formState.value,
    )
    if (response.success) {
      notification.success({
        message: t('admin.formLesson.notifications.updateLessonSuccess'),
      })
      // Reload lesson detail to get updated materials from API
      await fetchLesson()
    }
    else {
      notification.error({
        message: t('admin.formLesson.notifications.updateLessonFailed'),
      })
    }
  }
  else {
    const response = await createLesson(courseId.value, chapterId.value, formState.value)
    // If creating new lesson, update URL with new lesson ID
    if (response.success) {
      const newLessonId = response.data?.id
      // New lesson created successfully
      if (newLessonId) {
        notification.success({
          message: t('admin.formLesson.notifications.createLessonSuccess'),
        })
        // Update URL with new lesson ID
        await router.replace({
          params: {
            ...route.params,
            lessonId: newLessonId,
          },
        })
        // Reload lesson detail after URL update
        await fetchLesson()
      }
    }
    else {
      notification.error({
        message: t('admin.formLesson.notifications.createLessonFailed'),
      })
    }
  }

  // notification.success({
  //   message:
  //     lessonId && lessonId !== 'create'
  //       ? 'Update lesson success'
  //       : 'Create lesson success',
  // })
}

// Preview lesson function
function previewLesson() {
  if (lessonId.value && lessonId.value !== 'create') {
    // Replace admin/courses with /learning/ in the current URL

    // Navigate to learning page with lesson ID
    navigateTo(`/learning/${courseId.value}?lessonId=${lessonId.value}`)
  }
}

// Delete lesson functions
function showDeleteConfirm() {
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
}

async function confirmDeleteLesson() {
  if (!lessonId.value || lessonId.value === 'create')
    return

  try {
    isDeleting.value = true
    await deleteLesson(courseId.value, chapterId.value, lessonId.value)

    notification.success({
      message: t('admin.formLesson.notifications.deleteLessonSuccess'),
      description: t('admin.formLesson.notifications.deleteLessonSuccessDescription'),
    })

    // Close dialog and navigate back to chapters list
    showDeleteDialog.value = false

    // Navigate back to all chapters page
    await router.push(`/admin/courses/${courseId.value}/chapters`)

    // Refresh chapters list
    await fetchChapters(courseId.value)
  }
  catch {
    notification.error({
      message: t('admin.formLesson.notifications.deleteLessonFailed'),
      description: t('admin.formLesson.notifications.deleteLessonFailedDescription'),
    })
  }
  finally {
    isDeleting.value = false
  }
}

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Handle material upload complete
async function handleMaterialUpload(material: LessonMaterial) {
  // Add material to formState (clone array to avoid readonly Proxy)

  formState.value.materials?.push(material)

  // For new lessons, just show success (materials will be saved when lesson is created)
  if (!lessonId.value || lessonId.value === 'create') {
    notification.success({
      message: t('admin.formLesson.materials.notifications.uploadSuccess'),
    })
    return
  }

  // Auto-save to existing lesson
  try {
    const response = await updateLesson(
      courseId.value,
      chapterId.value,
      lessonId.value,
      {
        ...formState.value,
        chapter_id: chapterId.value,
      },
    )

    if (response.success) {
      notification.success({
        message: t('admin.formLesson.materials.notifications.uploadSuccess'),
      })
      await fetchLesson()
    }
    else {
      throw new Error('Update lesson failed')
    }
  }
  catch (error: any) {
    console.error('Failed to save material to lesson:', error)
    notification.error({
      message: t('admin.formLesson.materials.notifications.saveFailed'),
    })
    // Rollback: remove the material that failed to save
    formState.value.materials?.pop()
  }
}

// Handle edit material
function handleEditMaterial(_material: LessonMaterial, _index: number) {
  // TODO: Implement edit material modal
  notification.info({
    message: t('admin.formLesson.materials.notifications.editMaterial'),
    description: 'Edit material functionality coming soon',
  })
}

// Handle delete material
async function handleDeleteMaterial(material: LessonMaterial, index: number) {
  Modal.confirm({
    title: t('admin.resources.deleteConfirm.title'),
    content: t('admin.resources.deleteConfirm.content', { title: material.title }),
    okText: t('admin.resources.deleteConfirm.okText'),
    cancelText: t('admin.resources.deleteConfirm.cancelText'),
    okType: 'danger',
    async onOk() {
      // Remove from formState
      if (formState.value.materials) {
        formState.value.materials = formState.value.materials.filter((_, i) => i !== index)
      }

      // If lesson exists, update it
      if (lessonId.value && lessonId.value !== 'create') {
        try {
          const response = await updateLesson(
            courseId.value,
            chapterId.value,
            lessonId.value,
            {
              ...formState.value,
              chapter_id: chapterId.value,
            },
          )

          if (response.success) {
            notification.success({
              message: t('admin.formLesson.materials.notifications.deleteSuccess'),
            })
            await fetchLesson()
          }
          else {
            throw new Error('Update lesson failed')
          }
        }
        catch (error: any) {
          console.error('Failed to delete material:', error)
          notification.error({
            message: t('admin.formLesson.materials.notifications.deleteFailed'),
          })
          // Reload to restore state
          await fetchLesson()
        }
      }
      else {
        notification.success({
          message: t('admin.formLesson.materials.notifications.deleteSuccess'),
        })
      }
    },
  })
}
</script>

<template>
  <div class="form-courses flex flex-col gap-10 sm:gap-20">
    <div class="flex flex-col gap-2">
      <!-- Header Section -->
      <div class="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Title Section -->
          <div class="flex items-center gap-3 sm:gap-4">
            <a-button
              type="text"
              size="large"
              class="!h-10 !w-10 sm:!h-12 sm:!w-12 !flex items-center justify-center !p-0 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              @click="router.back()"
            >
              <Icon name="solar:alt-arrow-left-outline" size="20" class="sm:text-2xl" />
            </a-button>
            <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg">
              <Icon name="solar:video-library-bold-duotone" size="20" class="text-blue-600 sm:text-2xl" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 !m-0">
                {{ lessonId && lessonId !== 'create' ? t('admin.formLesson.title.edit') : t('admin.formLesson.title.create') }}
              </h1>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">
                {{ lessonId && lessonId !== 'create' ? t('admin.formLesson.description.edit') : t('admin.formLesson.description.create') }}
              </p>
            </div>
          </div>

          <!-- Action Section -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <!-- Progress Section -->
            <div v-if="isUploading" class="flex items-center gap-3 w-full sm:min-w-[200px] sm:w-auto">
              <div class="flex-1">
                <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>{{ t('admin.formLesson.upload.uploading') }}</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <a-progress
                  :percent="uploadProgress"
                  :show-info="false"
                  status="active"
                  stroke-color="#16a34a"
                  class="!h-2"
                />
              </div>
            </div>

            <!-- Preview Button (only show when editing existing lesson) -->
            <a-button
              v-if="lessonId && lessonId !== 'create'"
              size="small"
              class="!h-8 sm:!h-12 !flex items-center justify-center gap-1 sm:gap-2 !px-3 sm:!px-6 rounded-lg text-xs sm:text-sm !font-semibold bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 shadow-sm"
              @click="previewLesson"
            >
              <template #icon>
                <Icon name="solar:eye-bold-duotone" size="14" class="sm:text-xl" />
              </template>
              <span class="hidden sm:inline">{{ t('admin.formLesson.buttons.previewLesson') }}</span>
            </a-button>

            <!-- Delete Button (only show when editing existing lesson) -->
            <a-button
              v-if="lessonId && lessonId !== 'create'"
              size="small"
              danger
              class="!h-8 sm:!h-12 !flex items-center justify-center gap-1 sm:gap-2 !px-3 sm:!px-6 rounded-lg text-xs sm:text-sm !font-semibold"
              @click="showDeleteConfirm"
            >
              <template #icon>
                <Icon name="solar:trash-bin-trash-bold-duotone" size="14" class="sm:text-xl" />
              </template>
              <span class="hidden sm:inline">{{ t('admin.formLesson.buttons.deleteLesson') }}</span>
            </a-button>

            <!-- Save Button -->
            <a-button
              type="primary"
              size="small"
              class="!h-8 sm:!h-12 !flex items-center justify-center gap-1 !px-4 sm:!px-8 rounded-lg text-xs sm:text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-sm"
              :loading="uploading || isCreatingLesson"
              :disabled="isUploading"
              @click="uploadVideoAndSaveLesson"
            >
              <template #icon>
                <Icon
                  :name="isUploading ? 'solar:upload-bold-duotone' : (lessonId && lessonId !== 'create' ? 'solar:diskette-bold-duotone' : 'solar:add-circle-bold-duotone')"
                  size="14"
                  class="sm:text-2xl"
                />
              </template>
              <span class="hidden sm:inline">{{ isUploading ? `${t('admin.formLesson.buttons.uploading')} ${uploadProgress}%` : `${lessonId && lessonId !== 'create' ? t('admin.formLesson.buttons.updateLesson') : t('admin.formLesson.buttons.createLesson')}` }}</span>
            </a-button>
          </div>
        </div>
      </div>

      <a-form
        ref="formRef"
        :model="formState"
        name="lessonForm"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pt-4 sm:!pt-6 w-full lg:w-2/3"
      >
        <a-form-item
          :label="t('admin.formLesson.form.title')"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: t('admin.formLesson.form.titleRequired') }]"
        >
          <a-input
            v-model:value="formState.title"
            size="large"
            :placeholder="t('admin.formLesson.form.titlePlaceholder')"
          />
        </a-form-item>

        <a-form-item
          name="slug"
          :label="t('admin.formLesson.form.slug')"
          class="w-full"
        >
          <a-input
            v-model:value="formState.slug"
            :placeholder="t('admin.formLesson.form.slugPlaceholder')"
            size="large"
          />
        </a-form-item>

        <a-form-item
          name="video_duration"
          :label="t('admin.formLesson.form.videoDuration')"
          class="w-full"
          :rules="[
            { type: 'number', min: 0, message: t('admin.formLesson.form.videoDurationRequired') },
          ]"
        >
          <a-input-number
            v-model:value="formState.video_duration"
            :placeholder="t('admin.formLesson.form.videoDurationPlaceholder')"
            class="!w-full"
            size="large"
            :min="0"
          />
        </a-form-item>

        <a-form-item
          name="description"
          :label="t('admin.formLesson.form.description')"
          class="w-full"
        >
          <a-textarea
            v-model:value="formState.description"
            :placeholder="t('admin.formLesson.form.descriptionPlaceholder')"
            :auto-size="{ minRows: 5, maxRows: 5 }"
          />
        </a-form-item>

        <!-- Materials Section -->
        <a-form-item v-if="lessonId && lessonId !== 'create'" class="w-full">
          <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm w-full">
            <LessonMaterialUpload
              :course-id="courseId"
              :chapter-id="chapterId"
              :lesson-id="lessonId"
              @upload-complete="handleMaterialUpload"
            />

            <!-- Materials List (temporary display until LessonMaterialList component) -->
            <div v-if="formState.materials && formState.materials.length > 0" class="mt-6">
              <h4 class="text-md font-semibold text-gray-900 mb-3">
                {{ t('admin.formLesson.materials.title') }} ({{ formState.materials.length }})
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(material, index) in formState.materials"
                  :key="material.id || index"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <Icon name="solar:document-text-bold-duotone" size="24" class="text-gray-600 flex-shrink-0" />
                    <div class="flex-1 min-w-0">
                      <a
                        :href="material.file_path || material.file_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-medium text-gray-900 truncate block !hover:text-blue-600 hover:underline transition-colors"
                      >
                        {{ material.title }}
                      </a>
                      <p v-if="material.description" class="text-sm text-gray-500 truncate mt-1">
                        {{ material.description }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ formatFileSize(material.file_size) }} • {{ material.file_type }}
                      </p>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <a-dropdown :trigger="['click']" placement="bottomRight">
                      <a-button type="text" size="small" class="!h-8 !w-8 !p-0 flex items-center justify-center">
                        <Icon name="solar:menu-dots-bold" size="20" class="text-gray-600" />
                      </a-button>
                      <template #overlay>
                        <a-menu>
                          <a-menu-item key="edit" @click="handleEditMaterial(material, index)">
                            <div class="flex items-center gap-2">
                              <Icon name="solar:pen-bold" size="16" />
                              {{ t('admin.resources.edit') }}
                            </div>
                          </a-menu-item>
                          <a-menu-divider />
                          <a-menu-item key="delete" danger @click="handleDeleteMaterial(material, index)">
                            <div class="flex items-center gap-2">
                              <Icon name="solar:trash-bin-trash-bold" size="16" />
                              {{ t('admin.resources.delete') }}
                            </div>
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-form-item>

        <!-- Preview Switch -->
        <a-form-item name="is_preview" :label="t('admin.formLesson.form.isPreview')" class="w-full">
          <div class="flex items-center gap-2 sm:gap-3">
            <a-switch v-model:checked="formState.is_preview" size="default" />
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm text-gray-700">{{ t('admin.formLesson.form.previewLabel') }}</span>
              <span class="text-xs text-gray-500">{{ t('admin.formLesson.form.previewNote') }}</span>
            </div>
          </div>
        </a-form-item>

        <!-- Video Upload -->
        <a-form-item
          name="video"
          :label="t('admin.formLesson.form.introVideo')"
          class="w-full"
        >
          <a-upload-dragger
            v-model:file-list="videoFileList"
            name="introVideo"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            accept="video/mp4,video/quicktime"
            class="!min-h-[150px] sm:!min-h-[200px] !flex !items-center"
            @change="handleVideoChange"
          >
            <div v-if="videoFileList.length" class="relative w-full flex items-center justify-center px-2 sm:px-4">
              <video :src="videoPreviewUrl" controls class="w-full rounded-lg max-h-[200px] sm:max-h-none" />
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeVideo"
              >
                <CloseOutlined />
              </div>
            </div>

            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-play-bold-duotone text-2xl sm:text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-base sm:text-lg font-semibold text-gray-900">
                {{ t('admin.formLesson.upload.videoDragText') }} <span class="text-blue-600">{{ t('admin.formLesson.upload.videoBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-sm sm:text-base text-gray-500">
                {{ t('admin.formLesson.upload.videoHint') }}
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <!-- Image Upload -->
        <a-form-item
          name="image"
          :label="t('admin.formLesson.form.introImage')"
          class="w-full"
        >
          <a-upload-dragger
            v-model:file-list="imageFileList"
            name="introImage"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            accept="image/png,image/jpeg"
            class="!min-h-[150px] sm:!min-h-[200px] !flex !items-center"
            @change="handleImageChange"
          >
            <div v-if="imageFileList.length" class="relative w-full flex items-center justify-center px-2 sm:px-4">
              <img :src="imagePreviewUrl" alt="preview" class="h-full rounded-lg object-contain max-h-[200px] sm:max-h-none">
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeImage"
              >
                <CloseOutlined />
              </div>
            </div>

            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-gallery-add-bold-duotone text-2xl sm:text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-base sm:text-lg font-semibold text-gray-900">
                {{ t('admin.formLesson.upload.imageDragText') }} <span class="text-blue-600">{{ t('admin.formLesson.upload.imageBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-sm sm:text-base text-gray-500">
                {{ t('admin.formLesson.upload.imageHint') }}
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </div>

    <!-- Delete Confirmation Dialog -->
    <a-modal
      v-model:open="showDeleteDialog"
      :title="t('admin.formLesson.deleteDialog.title')"
      :confirm-loading="isDeleting"
      :ok-text="t('admin.formLesson.buttons.delete')"
      :cancel-text="t('admin.formLesson.buttons.cancel')"
      ok-type="danger"
      width="90vw"
      :style="{ maxWidth: '480px' }"
      @ok="confirmDeleteLesson"
      @cancel="closeDeleteDialog"
    >
      <div class="py-4">
        <div class="flex items-start gap-3 sm:gap-4 mb-4">
          <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg">
            <Icon name="solar:danger-triangle-bold-duotone" size="20" class="text-red-600 sm:text-2xl" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              {{ t('admin.formLesson.deleteDialog.confirmTitle') }}
            </h3>
            <p class="text-xs sm:text-sm text-gray-600">
              {{ t('admin.formLesson.deleteDialog.confirmMessage') }}
            </p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
          <p class="text-xs sm:text-sm text-gray-700 mb-2">
            <strong>{{ t('admin.formLesson.deleteDialog.lessonLabel') }}</strong> {{ formState.title || 'Untitled Lesson' }}
          </p>
          <p class="text-xs sm:text-sm text-gray-600">
            {{ t('admin.formLesson.deleteDialog.confirmDescription') }}
          </p>
        </div>
      </div>
    </a-modal>
  </div>
</template>
