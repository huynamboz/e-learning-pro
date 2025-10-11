<script lang="ts" setup>
import type { FormInstance, UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { LessonPayload } from '~/types/course.type'
import { useCourse } from '#imports'
import { CloseOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

const props = defineProps<{
  courseId: string
  chapterId: string
  lessonId?: string
}>()

const { uploadFile } = useCourseApi()
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
  order: null,
  is_preview: true,
  is_published: true,
  is_unlocked: true,
})

// Upload state
const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref('')
const imagePreviewUrl = ref('')
const uploading = ref(false)

onMounted(async () => {
  if (props.lessonId && props.lessonId !== 'default') {
    await detailLesson(props.courseId, props.chapterId, props.lessonId)
    if (currentLesson.value) {
      const data = currentLesson.value
      formState.value = {
        chapter_id: props.chapterId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        video_url: data.video_url,
        video_duration: data.video_duration,
        content: data.content || '',
        order: data.order,
        is_preview: data.is_preview,
        is_published: data.is_published,
        is_unlocked: data.is_unlocked,
      }

      // Hiển thị video preview nếu có sẵn
      if (data.video_url) {
        videoPreviewUrl.value = data.video_url
        videoFileList.value = [{
          uid: '-1',
          name: 'current_video.mp4',
          status: 'done',
          url: data.video_url,
        }] as any
      }
    }
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
}

function removeImage() {
  if (imagePreviewUrl.value)
    URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  imageFileList.value = []
}

async function uploadVideoAndSaveLesson() {
  await formRef.value?.validateFields()

  if (!props.courseId)
    return

  if (videoFileList.value.length) {
    const file = videoFileList.value[0].originFileObj as File
    try {
      uploading.value = true
      const presign = await uploadFile(props.courseId, {
        file_name: file.name,
        content_type: file.type,
      })

      const uploadUrl = presign?.upload_url || presign?.uploadUrl || presign?.url
      const publicUrl = presign?.public_url || presign?.publicUrl

      if (!uploadUrl || !publicUrl)
        throw new Error('Missing upload URLs')

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!putRes.ok)
        throw new Error(`Upload failed: ${putRes.status}`)

      formState.value.video_url = publicUrl
    }
    catch (err) {
      notification.error({
        message: 'Upload video failed',
        description: String(err),
      })
      return
    }
    finally {
      uploading.value = false
    }
  }

  await saveLesson()
}

async function saveLesson() {
  formState.value.chapter_id = props.chapterId

  let response
  if (props.lessonId && props.lessonId !== 'default') {
    response = await updateLesson(
      props.courseId,
      props.chapterId,
      props.lessonId,
      formState.value,
    )
  }
  else {
    response = await createLesson(props.courseId, props.chapterId, formState.value)
  }

  if (response?.success) {
    notification.success({
      message:
        props.lessonId && props.lessonId !== 'default'
          ? 'Update lesson success'
          : 'Create lesson success',
    })
    await fetchChapters(props.courseId)
  }
  else {
    notification.error({
      message:
        props.lessonId && props.lessonId !== 'default'
          ? 'Update lesson failed'
          : 'Create lesson failed',
      description: `${response?.error}`,
    })
  }
}
</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900 !m-0">
          {{ props.lessonId && props.lessonId !== 'default' ? 'Edit Lesson' : 'Create Lesson' }}
        </h2>

        <a-button
          type="primary"
          class="mt-6 !h-12 rounded-lg text-sm !font-semibold bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          :loading="uploading || isCreatingLesson"
          @click="uploadVideoAndSaveLesson"
        >
          {{ props.lessonId && props.lessonId !== 'default' ? 'Update' : 'Add' }} Lesson
        </a-button>
      </div>

      <a-form
        ref="formRef"
        :model="formState"
        name="lessonForm"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pt-6 w-2/3"
      >
        <a-form-item
          label="Title"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your lesson title!' }]"
        >
          <a-input v-model:value="formState.title" size="large" placeholder="Enter lesson title" />
        </a-form-item>

        <a-form-item
          name="slug"
          label="Slug"
          class="w-full"
          :rules="[
            { required: true, message: 'Please input your lesson slug!' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Enter a valid slug (letters, numbers, underscores, hyphens)' },
          ]"
        >
          <a-input v-model:value="formState.slug" placeholder="Enter lesson slug" size="large" />
        </a-form-item>

        <div class="flex items-center w-full gap-3">
          <a-form-item
            name="video_duration"
            label="Video Duration (minutes)"
            class="w-full"
            :rules="[
              { type: 'number', min: 0, message: 'Video duration must be ≥ 0!' },
            ]"
          >
            <a-input-number
              v-model:value="formState.video_duration"
              placeholder="Enter video duration"
              class="!w-full"
              size="large"
              :min="0"
            />
          </a-form-item>

          <a-form-item
            name="order"
            label="Order"
            class="w-full"
            :rules="[
              { required: true, message: 'Please input your lesson order!' },
              { type: 'number', min: 0, message: 'Order must be ≥ 0!' },
            ]"
          >
            <a-input-number
              v-model:value="formState.order"
              placeholder="Enter order"
              class="!w-full"
              size="large"
              :min="0"
            />
          </a-form-item>
        </div>

        <a-form-item name="description" label="Description" class="w-full">
          <a-textarea
            v-model:value="formState.description"
            placeholder="Enter description"
            :auto-size="{ minRows: 5, maxRows: 5 }"
          />
        </a-form-item>

        <!-- Video Upload -->
        <a-form-item name="video" label="Upload Intro Video" class="w-full">
          <a-upload-dragger
            v-model:file-list="videoFileList"
            name="introVideo"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            accept="video/mp4,video/quicktime"
            class="!min-h-[200px] !flex !items-center"
            @change="handleVideoChange"
          >
            <div
              v-if="videoFileList.length"
              class="relative w-full flex items-center justify-center px-4"
            >
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
                Drag and drop files, or <span class="text-blue-600">Browse</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
                Upload Video in MOV, MP4.
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <!-- Image Upload -->
        <a-form-item name="image" label="Upload Intro Image" class="w-full">
          <a-upload-dragger
            v-model:file-list="imageFileList"
            name="introImage"
            :multiple="false"
            :before-upload="beforeUpload"
            :max-count="1"
            :show-upload-list="false"
            accept="image/png,image/jpeg"
            class="!min-h-[200px] !flex !items-center"
            @change="handleImageChange"
          >
            <div
              v-if="imageFileList.length"
              class="relative w-full flex items-center justify-center px-4"
            >
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
                Drag and drop files, or <span class="text-blue-600">Browse</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
                Upload Thumbnail in JPEG, PNG.
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
