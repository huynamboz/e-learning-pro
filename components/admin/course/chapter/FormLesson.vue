<script lang="ts" setup>
import type { FormInstance, UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { LessonPayload } from '~/types/course.type'
import { useCourse } from '#imports'
import { CloseOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { generateSlug } from '~/utils/slug'

const { t } = useI18n()

const props = defineProps<{
  courseId: string
  chapterId: string
  lessonId?: string
}>()

const route = useRoute()
const router = useRouter()
const lessonIdQuery = computed(() => route.query.lessonId as string)

const { uploadFile, deleteLesson } = useCourseApi()
const { createLesson, updateLesson, detailLesson, currentLesson, fetchChapters, isCreatingLesson } = useCourse()

const formRef = ref<FormInstance>()
const formState = ref<LessonPayload>({
  chapter_id: props.chapterId,
  title: '',
  slug: '',
  description: '',
  video_url: '',
  video_duration: 0,
  content: '',
  is_preview: false,
  is_published: true,
  is_unlocked: true,
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
  const lessonId = lessonIdQuery.value as string
  if (lessonId && lessonId !== 'default') {
    await detailLesson(props.courseId, props.chapterId, lessonId)
    if (currentLesson.value) {
      const data = currentLesson.value
      formState.value = {
        chapter_id: props.chapterId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        video_url: data.video_url,
        video_duration: data.video_duration,
        content: (data as any).content || '',
        is_preview: data.is_preview,
        is_published: data.is_published,
        is_unlocked: data.is_unlocked,
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
    }
  } else {
    // Reset form for new lesson
    formState.value = {
      chapter_id: props.chapterId,
      title: '',
      slug: '',
      description: '',
      video_url: '',
      video_duration: 0,
      content: '',
      is_preview: false,
      is_published: true,
      is_unlocked: true,
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
watch(() => lessonIdQuery.value, () => {
  fetchLesson()
})

// Watch title changes to auto-generate slug
watch(() => formState.value.title, (newTitle) => {
  // Only generate slug for new lessons (not when editing existing)
  const lessonId = lessonIdQuery.value
  if (!lessonId || lessonId === 'default') {
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
  if (!lastUploadedFile.value) return true

  return (
    currentFile.name !== lastUploadedFile.value.name ||
    currentFile.size !== lastUploadedFile.value.size ||
    currentFile.lastModified !== lastUploadedFile.value.lastModified
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
      } else {
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

  if (!props.courseId)
    return

  if (videoFileList.value.length) {
    const file = videoFileList.value[0].originFileObj as File

    // Only upload if file has changed
    if (hasFileChanged(file)) {
      try {
        uploading.value = true
        isUploading.value = true
        uploadProgress.value = 0

        const presign = await uploadFile(props.courseId, {
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
    } else {
      // File hasn't changed, no need to upload
      console.log(t('admin.formLesson.upload.fileUnchanged'))
    }
  }

  await saveLesson()
}

async function saveLesson() {
  formState.value.chapter_id = props.chapterId
  const lessonId = lessonIdQuery.value as string

  if (lessonId && lessonId !== 'default') {
    const response = await updateLesson(
      props.courseId,
      props.chapterId,
      lessonId,
      formState.value,
    )
    if (response.success) {
      notification.success({
        message: t('admin.formLesson.notifications.updateLessonSuccess')
      })
    }
    else {
      notification.error({
        message: t('admin.formLesson.notifications.updateLessonFailed')
      })
    }
  }
  else {
    const response = await createLesson(props.courseId, props.chapterId, formState.value)
    // If creating new lesson, update URL with new lesson ID
    if (response.success) {
      const newLessonId = response.data?.id
      console.log('newLessonId', newLessonId)
      if (newLessonId) {
        notification.success({
          message: t('admin.formLesson.notifications.createLessonSuccess')
        })
        // Update URL with new lesson ID
        await router.replace({
          query: {
            ...route.query,
            lessonId: newLessonId
          }
        })
      }
    }
    else {
      notification.error({
        message: t('admin.formLesson.notifications.createLessonFailed')
      })
    }
  }

  // notification.success({
  //   message:
  //     lessonId && lessonId !== 'default'
  //       ? 'Update lesson success'
  //       : 'Create lesson success',
  // })
}

// Preview lesson function
function previewLesson() {
  const lessonId = lessonIdQuery.value
  if (lessonId && lessonId !== 'default') {
    // Replace admin/courses with /learning/ in the current URL
    const currentPath = route.path
    const learningPath = currentPath.replace('/admin/courses/', '/learning/')
    
    // Navigate to learning page with lesson ID
    navigateTo(`${learningPath}?lessonId=${lessonId}`)
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
  const lessonId = lessonIdQuery.value
  if (!lessonId || lessonId === 'default') return

  try {
    isDeleting.value = true
    await deleteLesson(props.courseId, props.chapterId, lessonId)
    
    notification.success({
      message: t('admin.formLesson.notifications.deleteLessonSuccess'),
      description: t('admin.formLesson.notifications.deleteLessonSuccessDescription')
    })
    
    // Close dialog and navigate back to chapter
    showDeleteDialog.value = false
    
    // Navigate back to chapter without lesson ID
    await router.replace({
      query: {
        ...route.query,
        lessonId: undefined
      }
    })
    
    // Refresh chapters list
    await fetchChapters(props.courseId)
  } catch (error) {
    notification.error({
      message: t('admin.formLesson.notifications.deleteLessonFailed'),
      description: t('admin.formLesson.notifications.deleteLessonFailedDescription')
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <div class="flex flex-col gap-2">
      <!-- Header Section -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <!-- Title Section -->
          <div class="flex items-center gap-4">
            <a-button
              type="text"
              size="large"
              class="!h-12 !w-12 !flex items-center justify-center !p-0 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              @click="router.back()"
            >
              <Icon name="solar:alt-arrow-left-outline" size="24" />
            </a-button>
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Icon name="solar:video-library-bold-duotone" size="24" class="text-blue-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 !m-0">
                {{ lessonIdQuery && lessonIdQuery !== 'default' ? t('admin.formLesson.title.edit') : t('admin.formLesson.title.create') }}
              </h1>
              <p class="text-sm text-gray-500 mt-1">
                {{ lessonIdQuery && lessonIdQuery !== 'default' ? t('admin.formLesson.description.edit') : t('admin.formLesson.description.create') }}
              </p>
            </div>
          </div>

          <!-- Action Section -->
          <div class="flex items-center gap-4">
            <!-- Progress Section -->
            <div v-if="isUploading" class="flex items-center gap-3 min-w-[200px]">
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
              v-if="lessonIdQuery && lessonIdQuery !== 'default'"
              size="large"
              class="!h-12 !flex items-center justify-center gap-2 !px-6 rounded-lg text-sm !font-semibold bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 shadow-sm"
              @click="previewLesson"
            >
              <template #icon>
                <Icon name="solar:eye-bold-duotone" size="20" />
              </template>
              {{ t('admin.formLesson.buttons.previewLesson') }}
            </a-button>

            <!-- Delete Button (only show when editing existing lesson) -->
            <a-button 
              v-if="lessonIdQuery && lessonIdQuery !== 'default'"
              size="large"
              danger
              class="!h-12 !flex items-center justify-center gap-2 !px-6 rounded-lg text-sm !font-semibold"
              @click="showDeleteConfirm"
            >
              <template #icon>
                <Icon name="solar:trash-bin-trash-bold-duotone" size="20" />
              </template>
              {{ t('admin.formLesson.buttons.deleteLesson') }}
            </a-button>

            <!-- Save Button -->
            <a-button 
              type="primary"
              size="large"
              class="!h-12 !flex items-center justify-center gap-1 !px-8 rounded-lg text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-sm"
              :loading="uploading || isCreatingLesson" 
              :disabled="isUploading" 
              @click="uploadVideoAndSaveLesson"
            >
              <template #icon>
                <Icon 
                  :name="isUploading ? 'solar:upload-bold-duotone' : (lessonIdQuery && lessonIdQuery !== 'default' ? 'solar:diskette-bold-duotone' : 'solar:add-circle-bold-duotone')" 
                  size="26" 
                />
              </template>
              {{ isUploading ? `${t('admin.formLesson.buttons.uploading')} ${uploadProgress}%` : `${lessonIdQuery && lessonIdQuery !== 'default' ? t('admin.formLesson.buttons.updateLesson') : t('admin.formLesson.buttons.createLesson')}` }}
            </a-button>
          </div>
        </div>
      </div>

      <a-form ref="formRef" :model="formState" name="lessonForm" autocomplete="off" layout="vertical"
        class="flex items-start flex-col !pt-6 w-2/3">
        <a-form-item :label="t('admin.formLesson.form.title')" name="title" class="w-full"
          :rules="[{ required: true, message: t('admin.formLesson.form.titleRequired') }]">
          <a-input v-model:value="formState.title" size="large" :placeholder="t('admin.formLesson.form.titlePlaceholder')" />
        </a-form-item>

        <a-form-item name="slug" :label="t('admin.formLesson.form.slug')" class="w-full">
          <a-input v-model:value="formState.slug" :placeholder="t('admin.formLesson.form.slugPlaceholder')" size="large" />
        </a-form-item>

        <a-form-item name="video_duration" :label="t('admin.formLesson.form.videoDuration')" class="w-full" :rules="[
          { type: 'number', min: 0, message: t('admin.formLesson.form.videoDurationRequired') },
        ]">
          <a-input-number v-model:value="formState.video_duration" :placeholder="t('admin.formLesson.form.videoDurationPlaceholder')" class="!w-full"
            size="large" :min="0" />
          </a-form-item>

        <a-form-item name="description" :label="t('admin.formLesson.form.description')" class="w-full">
          <a-textarea v-model:value="formState.description" :placeholder="t('admin.formLesson.form.descriptionPlaceholder')"
            :auto-size="{ minRows: 5, maxRows: 5 }" />
        </a-form-item>

        <!-- Preview Switch -->
        <a-form-item name="is_preview" :label="t('admin.formLesson.form.isPreview')" class="w-full">
          <div class="flex items-center gap-3">
            <a-switch v-model:checked="formState.is_preview" size="default" />
            <div class="flex flex-col">
              <span class="text-sm text-gray-700">{{ t('admin.formLesson.form.previewLabel') }}</span>
              <span class="text-xs text-gray-500">{{ t('admin.formLesson.form.previewNote') }}</span>
            </div>
          </div>
        </a-form-item>

        <!-- Video Upload -->
        <a-form-item name="video" :label="t('admin.formLesson.form.introVideo')" class="w-full">
          <a-upload-dragger v-model:file-list="videoFileList" name="introVideo" :multiple="false"
            :before-upload="beforeUpload" :max-count="1" :show-upload-list="false" accept="video/mp4,video/quicktime"
            class="!min-h-[200px] !flex !items-center" @change="handleVideoChange">
            <div v-if="videoFileList.length" class="relative w-full flex items-center justify-center px-4">
              <video :src="videoPreviewUrl" controls class="w-full rounded-lg" />
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeVideo">
                <CloseOutlined />
              </div>
            </div>

            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-play-bold-duotone text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-lg font-semibold text-gray-900">
                {{ t('admin.formLesson.upload.videoDragText') }} <span class="text-blue-600">{{ t('admin.formLesson.upload.videoBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
                {{ t('admin.formLesson.upload.videoHint') }}
              </p>
            </template>
          </a-upload-dragger>
          </a-form-item>

        <!-- Image Upload -->
        <a-form-item name="image" :label="t('admin.formLesson.form.introImage')" class="w-full">
          <a-upload-dragger v-model:file-list="imageFileList" name="introImage" :multiple="false"
            :before-upload="beforeUpload" :max-count="1" :show-upload-list="false" accept="image/png,image/jpeg"
            class="!min-h-[200px] !flex !items-center" @change="handleImageChange">
            <div v-if="imageFileList.length" class="relative w-full flex items-center justify-center px-4">
              <img :src="imagePreviewUrl" alt="preview" class="h-full rounded-lg object-contain">
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeImage">
                <CloseOutlined />
              </div>
        </div>

            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-gallery-add-bold-duotone text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-lg font-semibold text-gray-900">
                {{ t('admin.formLesson.upload.imageDragText') }} <span class="text-blue-600">{{ t('admin.formLesson.upload.imageBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
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
      @ok="confirmDeleteLesson"
      @cancel="closeDeleteDialog"
      :ok-text="t('admin.formLesson.buttons.delete')"
      :cancel-text="t('admin.formLesson.buttons.cancel')"
      ok-type="danger"
    >
      <div class="py-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
            <Icon name="solar:danger-triangle-bold-duotone" size="24" class="text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ t('admin.formLesson.deleteDialog.confirmTitle') }}</h3>
            <p class="text-sm text-gray-600">{{ t('admin.formLesson.deleteDialog.confirmMessage') }}</p>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700 mb-2">
            <strong>{{ t('admin.formLesson.deleteDialog.lessonLabel') }}</strong> {{ formState.title || 'Untitled Lesson' }}
          </p>
          <p class="text-sm text-gray-600">
            {{ t('admin.formLesson.deleteDialog.confirmDescription') }}
          </p>
        </div>
      </div>
    </a-modal>
  </div>
</template>
