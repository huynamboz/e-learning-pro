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

const { fetchCategories, categories, fetchCourseDetail, currentCourse, clearCurrentCourse, createCourse, updateCourse, isCreatingCourse } = useCourse()
const { user } = useAuth()

const formState = ref<CoursePayload>({
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  teacher_id: 0,
  level: 'beginner',
  language: 'en',
  duration_hours: '',
  price: '0',
  discount_price: '0',
  is_free: false,
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

const levelOptions = ref([
  {
    label: 'Beginner',
    value: 'beginner',
  },
  {
    label: 'Intermediate',
    value: 'intermediate',
  },
  {
    label: 'Advanced',
    value: 'advanced',
  },
])

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
  formState.value.teacher_id = user.value?.id
  await formRef.value?.validateFields()
  loading.value = true

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
          console.log(t('admin.formCourse.upload.fileUnchanged'))
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

        formState.value.thumbnail = public_url
        isUploading.value = false
      }

      await updateCourse(courseId.value, formState.value)
      notification.success({ message: t('admin.formCourse.notifications.updateSuccess') })
    }
    else {
      await createCourse(formState.value)
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
    const c = currentCourse.value
    formState.value = {
      title: c.title || '',
      slug: c.slug || '',
      short_description: c.short_description || '',
      description: c.description || '',
      category_id: c.category?.id || '',
      teacher_id: c.teacher?.id,
      duration_hours: c.duration_hours || '',
      level: c.level || 'beginner',
      discount_price: c.discount_price || '0',
      is_free: c.is_free || false,
      price: c.price || '0',
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
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <!-- Title Section -->
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
            <Icon name="solar:book-2-bold-duotone" size="24" class="text-blue-600" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 !m-0">
              {{ courseId ? t('admin.formCourse.title.edit') : t('admin.formCourse.title.create') }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ courseId ? t('admin.formCourse.description.edit') : t('admin.formCourse.description.create') }}
            </p>
          </div>
        </div>

        <!-- Action Section -->
        <div class="flex items-center gap-4">
          <!-- Progress Section -->
          <div v-if="isUploading" class="flex items-center gap-3 min-w-[200px]">
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
            class="!h-8 !flex items-center justify-center gap-2 !px-4 rounded-lg text-xs !font-semibold bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 shadow-sm"
            @click="previewCourse"
          >
            <template #icon>
              <Icon name="solar:eye-bold-duotone" size="16" />
            </template>
            {{ t('admin.formCourse.buttons.previewCourse') }}
          </a-button>

          <!-- Delete Button (only show when editing existing course) -->
          <a-button
            v-if="courseId"
            size="small"
            danger
            class="!h-8 !flex items-center justify-center gap-2 !px-4 rounded-lg text-xs !font-semibold"
            @click="showDeleteConfirm"
          >
            <template #icon>
              <Icon name="solar:trash-bin-trash-bold-duotone" size="16" />
            </template>
            {{ t('admin.formCourse.buttons.deleteCourse') }}
          </a-button>

          <!-- Save Button -->
          <a-button
            type="primary"
            size="small"
            class="!h-8 !flex items-center justify-center gap-1 !px-6 rounded-lg text-xs !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-sm"
            :loading="loading"
            :disabled="isUploading"
            @click="handleSave"
          >
            <template #icon>
              <Icon
                :name="isUploading ? 'solar:upload-bold-duotone' : (courseId ? 'solar:diskette-bold-duotone' : 'solar:add-circle-bold-duotone')"
                size="16"
              />
            </template>
            {{ isUploading ? `${t('admin.formCourse.buttons.uploading')} ${uploadProgress}%` : `${courseId ? t('admin.formCourse.buttons.updateCourse') : t('admin.formCourse.buttons.createCourse')}` }}
          </a-button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('admin.formCourse.courseDetails') }}
      </h2>
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pb-20 w-2/3"
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
        <div class="flex items-center w-full gap-3">
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
            :label="t('admin.formCourse.form.level')"
            name="level"
            class="w-full"
            :rules="[{ required: true, message: t('admin.formCourse.form.levelRequired') }]"
          >
            <a-select
              v-model:value="formState.level"
              :placeholder="t('admin.formCourse.form.levelPlaceholder')"
              :options="levelOptions"
              class="w-full"
            />
          </a-form-item>
        </div>
        <div class="flex items-center w-full gap-3">
          <a-form-item
            :label="t('admin.formCourse.form.price')"
            name="price"
            class="w-full"
            :rules="[{ required: true, message: t('admin.formCourse.form.priceRequired') }]"
          >
            <a-input-number v-model:value="formState.price" class="!w-full" size="large" :placeholder="t('admin.formCourse.form.pricePlaceholder')" />
          </a-form-item>
          <a-form-item
            :label="t('admin.formCourse.form.discountPrice')"
            name="discount_price"
            class="w-full"
          >
            <a-input-number v-model:value="formState.discount_price" class="!w-full" size="large" :placeholder="t('admin.formCourse.form.discountPricePlaceholder')" />
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
            class="!min-h-[200px] !flex !items-center"
            @change="handleVideoChange"
          >
            <div v-if="videoFileList.length" class="relative w-full flex items-center justify-center px-4">
              <video :src="videoPreviewUrl" controls class="w-full rounded-lg" />
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeVideo"
              >
                <CloseOutlined />
              </div>
            </div>
            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-play-bold-duotone text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-lg font-semibold text-gray-900">
                {{ t('admin.formCourse.upload.videoDragText') }} <span class="text-blue-600">{{ t('admin.formCourse.upload.videoBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
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
            class="!min-h-[200px] !flex !items-center"
            @change="handleImageChange"
          >
            <div v-if="imageFileList.length" class="relative w-full flex items-center justify-center px-4">
              <img :src="imagePreviewUrl" alt="preview" class="h-full rounded-lg object-contain">
              <div
                class="!absolute !-top-2 !right-2 !bg-white/90 hover:!bg-white h-6 w-6 rounded-full flex items-center justify-center border border-grey-700"
                @click.stop.prevent="removeImage"
              >
                <CloseOutlined />
              </div>
            </div>
            <template v-else>
              <p class="ant-upload-drag-icon">
                <i class="i-solar-gallery-add-bold-duotone text-3xl text-gray-800" />
              </p>
              <p class="ant-upload-text text-lg font-semibold text-gray-900">
                {{ t('admin.formCourse.upload.imageDragText') }} <span class="text-blue-600">{{ t('admin.formCourse.upload.imageBrowse') }}</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
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
