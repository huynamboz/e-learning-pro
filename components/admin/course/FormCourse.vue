<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { CoursePayload } from '~/types/course.type'
import { CloseOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { useAuth } from '@/composables/useAuth'
import { useCourse } from '@/composables/useCourse'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { generateSlug } from '~/utils/slug'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { uploadFile, uploadImage, delete: deleteCourse } = useCourseApi()

const { fetchCategories, categories, fetchCourseDetail, currentCourse, clearCurrentCourse, createCourse, updateCourse } = useCourse()
const { user } = useAuth()

const formState = ref<CoursePayload>({
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  teacher_id: undefined,
  course_type: 'course',
  course_level: undefined,
  course_sub_level: undefined,
  level: 'beginner', // Will be auto-mapped from course_level
  language: 'en',
  duration_hours: '',
  is_published: true,
  is_featured: false,
  video_preview: '',
  thumbnail: '',
})

const formRef = ref()

// Upload states
const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref<string>('')
const imagePreviewUrl = ref<string>('')
const loading = ref(false)
const uploadProgress = ref(0)
const isUploading = ref(false)
const lastUploadedFile = ref<File | null>(null)

// Delete dialog state
const showDeleteDialog = ref(false)
const isDeleting = ref(false)

const courseTypeOptions = ref([
  {
    label: 'Khóa học',
    value: 'course',
  },
  {
    label: 'Tài nguyên',
    value: 'resource',
  },
])

const courseLevelOptions = ref([
  {
    label: 'Cơ bản',
    value: 'basic',
  },
  {
    label: 'Trung cấp',
    value: 'intermediate',
  },
  {
    label: 'Nâng cao',
    value: 'advanced',
  },
  {
    label: 'Lý thuyết lái xe',
    value: 'driving_theory',
  },
])

const courseSubLevelOptions = computed(() => {
  const level = formState.value.course_level
  if (level === 'basic') {
    return [
      { label: 'A1', value: 'A1' },
      { label: 'A1+', value: 'A1+' },
      { label: 'A2', value: 'A2' },
    ]
  }
  else if (level === 'intermediate') {
    return [
      { label: 'B1', value: 'B1' },
      { label: 'B2', value: 'B2' },
    ]
  }
  else if (level === 'advanced') {
    return [
      { label: 'C1', value: 'C1' },
      { label: 'C2', value: 'C2' },
    ]
  }
  // driving_theory không có sub-level
  return []
})

function beforeUpload() {
  return false
}

const categoryOptions = computed(() =>
  (categories.value as any)?.results?.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  })) || [],
)

const courseId = computed(() => route?.params?.id as string)

function handleVideoChange(info: UploadChangeParam) {
  videoFileList.value = [...info.fileList].slice(-1)
  const last = videoFileList.value[0]
  if (last && last.originFileObj) {
    if (videoPreviewUrl.value)
      URL.revokeObjectURL(videoPreviewUrl.value)
    videoPreviewUrl.value = URL.createObjectURL(last.originFileObj as File)
  }
}

function handleImageChange(info: UploadChangeParam) {
  imageFileList.value = [...info.fileList].slice(-1)
  const last = imageFileList.value[0]
  if (last && last.originFileObj) {
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
  if (!lastUploadedFile.value)
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

async function handleSave() {
  if (!user.value?.id) {
    notification.error({ message: t('admin.formCourse.notifications.loginRequired') })
    return
  }

  await formRef.value?.validateFields()
  loading.value = true

  // Prepare payload
  const payload: CoursePayload = {
    ...formState.value,
    teacher_id: user.value?.id, // Set teacher_id from current user
  } as CoursePayload

  // Auto-map course_level to level (legacy field)
  if (payload.course_level) {
    // Map course_level to level: basic/intermediate/advanced -> beginner/intermediate/advanced
    const levelMap: Record<string, string> = {
      basic: 'beginner',
      intermediate: 'intermediate',
      advanced: 'advanced',
      driving_theory: 'beginner', // Default to beginner for driving_theory
    }
    payload.level = levelMap[payload.course_level] || 'beginner'
  }
  else {
    // Default to beginner if no course_level
    payload.level = 'beginner'
  }

  // Remove undefined optional fields
  if (!payload.course_level) {
    delete payload.course_level
  }
  if (!payload.course_sub_level) {
    delete payload.course_sub_level
  }
  if (!payload.duration_hours) {
    delete payload.duration_hours
  }

  try {
    if (courseId.value) {
      // Upload video if changed
      if (videoFileList.value.length > 0 && videoFileList.value[0].originFileObj) {
        const file = videoFileList.value[0].originFileObj as File

        // Only upload if file has changed
        if (hasFileChanged(file)) {
          // Reset progress and start upload
          uploadProgress.value = 0
          isUploading.value = true

          const { upload_url, public_url } = await uploadFile(courseId.value, {
            file_name: file.name,
            content_type: file.type,
          } as any)

          // Upload file with progress tracking
          await uploadFileWithProgress(file, upload_url)

          formState.value.video_preview = public_url
          isUploading.value = false
        }
        else {
          // File hasn't changed, no need to upload
          console.error(t('admin.formCourse.upload.fileUnchanged'))
        }
      }
      else {
        formState.value.video_preview = ''
        // Reset last uploaded file when no file is selected
        lastUploadedFile.value = null
      }

      // Upload image if changed
      if (imageFileList.value.length > 0 && imageFileList.value[0].originFileObj) {
        const file = imageFileList.value[0].originFileObj as File

        // Reset progress and start upload
        uploadProgress.value = 0
        isUploading.value = true

        const { upload_url, public_url } = await uploadImage({
          file_name: file.name,
          content_type: file.type,
          folder: 'covers',
        })

        // Upload image with progress tracking
        await uploadImageWithProgress(file, upload_url)

        // Update both formState and payload with the uploaded thumbnail URL
        formState.value.thumbnail = public_url
        payload.thumbnail = public_url
        isUploading.value = false
      }

      // Update payload with latest video_preview if it was uploaded
      payload.video_preview = formState.value.video_preview

      await updateCourse(courseId.value, payload)
      notification.success({ message: t('admin.formCourse.notifications.updateSuccess') })
    }
    else {
      await createCourse(payload)
      notification.success({ message: t('admin.formCourse.notifications.createSuccess') })
      router.push('/admin/courses')
    }
  }
  catch (error) {
    notification.error({
      message: courseId.value ? t('admin.formCourse.notifications.updateFailed') : t('admin.formCourse.notifications.createFailed'),
      description: `${error}`,
    })
  }
  finally {
    loading.value = false
    isUploading.value = false
    uploadProgress.value = 0
  }
}

onMounted(async () => {
  clearCurrentCourse()
  await fetchCategories()

  if (courseId.value)
    await fetchCourseDetail(courseId.value)

  if (currentCourse.value) {
    const c = currentCourse.value as any
    formState.value = {
      title: c.title || '',
      slug: c.slug || '',
      short_description: c.short_description || '',
      description: c.description || '',
      category_id: c.category?.id || '',
      teacher_id: c.teacher?.id,
      course_type: c.course_type || 'course',
      course_level: c.course_level || undefined,
      course_sub_level: c.course_sub_level || undefined,
      duration_hours: c.duration_hours || '',
      level: 'beginner', // Will be auto-mapped from course_level on save
      video_preview: c.video_preview || '',
      thumbnail: c.thumbnail || '',
      is_featured: c.is_featured || false,
      is_published: c.is_published ?? true,
      language: c.language || 'en',
    }

    if (c.video_preview) {
      videoPreviewUrl.value = c.video_preview
      videoFileList.value = [{
        uid: '-1',
        name: 'intro-video.mp4',
        status: 'done',
        url: c.video_preview,
      }]
      // Set lastUploadedFile to indicate video is already uploaded
      lastUploadedFile.value = new File([''], 'intro-video.mp4', { type: 'video/mp4' })
    }

    if (c.thumbnail) {
      imagePreviewUrl.value = c.thumbnail
      imageFileList.value = [{
        uid: '-2',
        name: 'thumbnail.jpg',
        status: 'done',
        url: c.thumbnail,
      }]
    }
  }
})

watch(categoryOptions, () => {
  if (categoryOptions.value.length > 0 && !formState.value.category_id) {
    formState.value.category_id = categoryOptions.value[0].value
  }
})

// Watch title changes to auto-generate slug
watch(() => formState.value.title, (newTitle) => {
  // Only generate slug for new courses (not when editing existing)
  if (!courseId.value) {
    formState.value.slug = generateSlug(newTitle)
  }
})

// Preview course function
function previewCourse() {
  if (courseId.value) {
    // Navigate to course detail page
    navigateTo(`/courses/${courseId.value}`)
  }
}

// Watch course_level to reset course_sub_level when level changes
watch(() => formState.value.course_level, (newLevel, oldLevel) => {
  if (newLevel !== oldLevel) {
    formState.value.course_sub_level = undefined
  }
  // Nếu chọn driving_theory, đảm bảo không có sub-level
  if (newLevel === 'driving_theory') {
    formState.value.course_sub_level = undefined
  }
})

// Delete course functions
function showDeleteConfirm() {
  showDeleteDialog.value = true
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
}

async function confirmDeleteCourse() {
  if (!courseId.value)
    return

  try {
    isDeleting.value = true
    await deleteCourse(courseId.value)

    notification.success({
      message: t('admin.formCourse.notifications.deleteSuccess'),
      description: t('admin.formCourse.notifications.deleteSuccessDescription'),
    })

    // Close dialog and navigate back to courses list
    showDeleteDialog.value = false
    await router.push('/admin/courses')
  }
  catch (error) {
    console.error('Error deleting course:', error)
    notification.error({
      message: t('admin.formCourse.notifications.deleteFailed'),
      description: t('admin.formCourse.notifications.deleteFailedDescription'),
    })
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="form-courses flex flex-col gap-10">
    <!-- Header Section -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Title Section -->
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg">
            <Icon name="solar:book-2-bold-duotone" size="20" class="text-blue-600 sm:text-2xl" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 !m-0">
              {{ courseId ? t('admin.formCourse.title.edit') : t('admin.formCourse.title.create') }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ courseId ? t('admin.formCourse.description.edit') : t('admin.formCourse.description.create') }}
            </p>
          </div>
        </div>

        <!-- Action Section -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
          <!-- Progress Section -->
          <div v-if="isUploading" class="flex items-center gap-3 w-full sm:min-w-[200px] sm:w-auto">
            <div class="flex-1">
              <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>{{ t('admin.formCourse.upload.uploading') }}</span>
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

          <!-- Preview Button (only show when editing existing course) -->
          <a-button
            v-if="courseId"
            size="small"
            class="!h-8 !flex items-center justify-center gap-2 !px-3 sm:!px-4 rounded-lg text-xs !font-semibold bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 shadow-sm"
            @click="previewCourse"
          >
            <template #icon>
              <Icon name="solar:eye-bold-duotone" size="14" class="sm:text-base" />
            </template>
            <span class="hidden sm:inline">{{ t('admin.formCourse.buttons.previewCourse') }}</span>
          </a-button>

          <!-- Delete Button (only show when editing existing course) -->
          <a-button
            v-if="courseId"
            size="small"
            danger
            class="!h-8 !flex items-center justify-center gap-2 !px-3 sm:!px-4 rounded-lg text-xs !font-semibold"
            @click="showDeleteConfirm"
          >
            <template #icon>
              <Icon name="solar:trash-bin-trash-bold-duotone" size="14" class="sm:text-base" />
            </template>
            <span class="hidden sm:inline">{{ t('admin.formCourse.buttons.deleteCourse') }}</span>
          </a-button>

          <!-- Save Button -->
          <a-button
            type="primary"
            size="small"
            class="!h-8 !flex items-center justify-center gap-1 !px-4 sm:!px-6 rounded-lg text-xs !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-sm"
            :loading="loading"
            :disabled="isUploading"
            @click="handleSave"
          >
            <template #icon>
              <Icon
                :name="isUploading ? 'solar:upload-bold-duotone' : (courseId ? 'solar:diskette-bold-duotone' : 'solar:add-circle-bold-duotone')"
                size="14"
                class="sm:text-base"
              />
            </template>
            <span class="hidden sm:inline">{{ isUploading ? `${t('admin.formCourse.buttons.uploading')} ${uploadProgress}%` : `${courseId ? t('admin.formCourse.buttons.updateCourse') : t('admin.formCourse.buttons.createCourse')}` }}</span>
          </a-button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
        {{ t('admin.formCourse.courseDetails') }}
      </h2>
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pb-20 w-full lg:w-2/3"
        @finish="handleSave"
      >
        <a-form-item
          :label="t('admin.formCourse.form.title')"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: t('admin.formCourse.form.titleRequired') }]"
        >
          <a-input v-model:value="formState.title" size="large" :placeholder="t('admin.formCourse.form.titlePlaceholder')" />
        </a-form-item>
        <a-form-item
          :label="t('admin.formCourse.form.slug')"
          name="slug"
          class="w-full"
        >
          <a-input v-model:value="formState.slug" size="large" :placeholder="t('admin.formCourse.form.slugPlaceholder')" />
        </a-form-item>
        <a-form-item
          :label="t('admin.formCourse.form.shortDescription')"
          name="short_description"
          class="w-full"
          :rules="[{ required: true, message: t('admin.formCourse.form.shortDescriptionRequired') }]"
        >
          <a-textarea v-model:value="formState.short_description" size="large" :placeholder="t('admin.formCourse.form.shortDescriptionPlaceholder')" :auto-size="{ minRows: 3, maxRows: 3 }" />
        </a-form-item>
        <div class="flex flex-col sm:flex-row items-center w-full gap-3">
          <a-form-item
            :label="t('admin.formCourse.form.category')"
            name="category_id"
            class="w-full"
            :rules="[{ required: true, message: t('admin.formCourse.form.categoryRequired') }]"
          >
            <a-select
              v-model:value="formState.category_id"
              :placeholder="t('admin.formCourse.form.categoryPlaceholder')"
              :options="categoryOptions"
              class="w-full"
            />
          </a-form-item>
          <a-form-item
            :label="t('admin.formCourse.form.courseType')"
            name="course_type"
            class="w-full"
            :rules="[{ required: true, message: t('admin.formCourse.form.courseTypeRequired') }]"
          >
            <a-select
              v-model:value="formState.course_type"
              :placeholder="t('admin.formCourse.form.courseTypePlaceholder')"
              :options="courseTypeOptions"
              class="w-full"
            />
          </a-form-item>
        </div>

        <div class="flex flex-col sm:flex-row items-center w-full gap-3">
          <a-form-item
            :label="t('admin.formCourse.form.courseLevel')"
            name="course_level"
            class="w-full"
          >
            <a-select
              v-model:value="formState.course_level"
              :placeholder="t('admin.formCourse.form.courseLevelPlaceholder')"
              :options="courseLevelOptions"
              class="w-full"
              allow-clear
            />
          </a-form-item>
          <a-form-item
            :label="t('admin.formCourse.form.courseSubLevel')"
            name="course_sub_level"
            class="w-full"
          >
            <a-select
              v-model:value="formState.course_sub_level"
              :placeholder="t('admin.formCourse.form.courseSubLevelPlaceholder')"
              :options="courseSubLevelOptions"
              class="w-full"
              :disabled="!formState.course_level || formState.course_level === 'driving_theory'"
              allow-clear
            />
          </a-form-item>
        </div>

        <a-form-item
          :label="t('admin.formCourse.form.durationHours')"
          name="duration_hours"
          class="w-full"
          :rules="[{ required: true, message: t('admin.formCourse.form.durationHoursRequired') }]"
        >
          <a-input-number v-model:value="formState.duration_hours" class="!w-full" size="large" :placeholder="t('admin.formCourse.form.durationHoursPlaceholder')" />
        </a-form-item>
        <a-form-item v-if="courseId" name="video" :label="t('admin.formCourse.form.introVideo')" class="w-full">
          <a-upload-dragger
            v-model:file-list="videoFileList"
            name="introVideo"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            accept="video/mp4"
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
                {{ t('admin.formCourse.upload.videoDragText') }} <span class="text-blue-600">{{ t('admin.formCourse.upload.videoBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-sm sm:text-base text-gray-500">
                {{ t('admin.formCourse.upload.videoHint') }}
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <a-form-item v-if="courseId" name="image" :label="t('admin.formCourse.form.introImage')" class="w-full">
          <a-upload-dragger
            v-model:file-list="imageFileList"
            name="introImage"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            list-type="picture"
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
                {{ t('admin.formCourse.upload.imageDragText') }} <span class="text-blue-600">{{ t('admin.formCourse.upload.imageBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-sm sm:text-base text-gray-500">
                {{ t('admin.formCourse.upload.imageHint') }}
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <a-form-item
          name="description" :label="t('admin.formCourse.form.description')" class="w-full"
          :rules="[{ required: true, message: t('admin.formCourse.form.descriptionRequired') }]"
        >
          <QuillEditor
            v-model:content="formState.description"
            content-type="html"
            theme="snow"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- Delete Confirmation Dialog -->
    <a-modal
      v-model:open="showDeleteDialog"
      :title="t('admin.formCourse.deleteDialog.title')"
      :confirm-loading="isDeleting"
      :ok-text="t('admin.formCourse.buttons.delete')"
      :cancel-text="t('admin.formCourse.buttons.cancel')"
      ok-type="danger"
      @ok="confirmDeleteCourse"
      @cancel="closeDeleteDialog"
    >
      <div class="py-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
            <Icon name="solar:danger-triangle-bold-duotone" size="24" class="text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              {{ t('admin.formCourse.deleteDialog.confirmTitle') }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ t('admin.formCourse.deleteDialog.confirmMessage') }}
            </p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-700 mb-2">
            <strong>{{ t('admin.formCourse.deleteDialog.courseLabel') }}</strong> {{ formState.title || 'Untitled Course' }}
          </p>
          <p class="text-sm text-gray-600">
            {{ t('admin.formCourse.deleteDialog.confirmDescription') }}
          </p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="css">
:deep(.ql-editor) {
  min-height: 200px;
}
:deep(.ql-toolbar.ql-snow) {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
:deep(.ql-container.ql-snow) {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

:deep(.ql-editor) {
  height: 300px !important;
  overflow-y: auto;
}
</style>
