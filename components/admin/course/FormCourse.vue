<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { CoursePayload } from '~/types/course.type'
import { CloseOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { useAuth } from '@/composables/useAuth'
import { useCourse } from '@/composables/useCourse'

const route = useRoute()
const router = useRouter()

const { fetchCategories, categories, fetchCourseDetail, currentCourse, clearCurrentCourse, createCourse, updateCourse, isCreatingCourse } = useCourse()
const { user } = useAuth()

const formState = ref<CoursePayload>({
  title: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: '',
  teacher_id: '',
  level: 'beginner',
  language: 'en',
  duration_hours: '',
  price: '0',
  discount_price: '0',
  is_free: false,
  is_published: true,
  is_featured: false,
  video_preview: '',
})

const formRef = ref()

// Upload states
const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref<string>('')
const imagePreviewUrl = ref<string>('')
const loading = ref(false)

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
  categories.value.results?.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  })),
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
}

function removeImage() {
  if (imagePreviewUrl.value)
    URL.revokeObjectURL(imagePreviewUrl.value)
  imagePreviewUrl.value = ''
  imageFileList.value = []
}

async function handleSave() {
  formState.value.teacher_id = user.value?.id
  loading.value = true
  await formRef.value?.validateFields()
  try {
    if (courseId.value) {
      const response = await updateCourse(courseId.value, formState.value)
      if (response) {
        notification.success({
          message: 'Update course success',
        })
      }
    }
    else {
      const response = await createCourse(formState.value)
      if (response) {
        router.push('/admin/courses')
        notification.success({
          message: 'Create course success',
        })
      }
    }
  }
  catch (error) {
    notification.error({
      message: courseId.value ? 'Update course failed' : 'Create course failed',
      description: `${error}`
    })
  }
}

onMounted(async () => {
  clearCurrentCourse()
  await fetchCategories()
  if (courseId.value)
    await fetchCourseDetail(courseId.value)
  if (currentCourse.value) {
    formState.value.category_id = currentCourse.value?.category.id
    formState.value.title = currentCourse.value?.title
    formState.value.slug = currentCourse.value?.slug
    formState.value.short_description = currentCourse.value?.short_description
    formState.value.description = currentCourse.value?.description
    formState.value.teacher_id = currentCourse.value?.teacher?.id
    formState.value.duration_hours = currentCourse.value?.duration_hours
    formState.value.level = currentCourse.value?.level
    formState.value.discount_price = currentCourse.value?.discount_price
    formState.value.is_free = currentCourse.value?.is_free
    formState.value.price = currentCourse.value?.price
  }
})

watch(categoryOptions, () => {
  if (categoryOptions.value.length > 0 && !formState.value.category_id) {
    formState.value.category_id = categoryOptions.value[0].value
  }
})
</script>

<template>
  <div class="form-courses flex flex-col gap-10">
    <div class="flex items-center gap-5 justify-between">
      <h1 class="text-3xl font-bold text-gray-900">
        {{ courseId ? 'Detail' : 'Create' }}
      </h1>
      <div class="flex gap-2 items-center">
        <a-button
          type="primary"
          class="w-full !px-6 !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          :loading="isCreatingCourse"
          @click="handleSave"
        >
          Save
        </a-button>
        <!-- <a-button
          type="primary"
          class="!h-12 !px-6 rounded-lg text-sm !font-semibold !flex !items-center justify-center !bg-blue-500 !border-blue-500 text-white !hover:bg-blue-600 !hover:border-blue-600"
          @click="handlePublish"
        >
          Publish
        </a-button> -->
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold text-gray-900">
        Course Details
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
          label="Course Title"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your course title!' }]"
        >
          <a-input v-model:value="formState.title" size="large" placeholder="Enter course title" />
        </a-form-item>
        <a-form-item
          label="Course Slug"
          name="slug"
          class="w-full"
          :rules="[
            { required: true, message: 'Please input your course slug!' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Enter a valid slug (letters, numbers, underscores, hyphens)' },
          ]"
        >
          <a-input v-model:value="formState.slug" size="large" placeholder="Enter course slug" />
        </a-form-item>
        <a-form-item
          label="Course Sort Description"
          name="short_description"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your course sort description!' }]"
        >
          <a-textarea v-model:value="formState.short_description" size="large" placeholder="Enter course sort description" :auto-size="{ minRows: 3, maxRows: 3 }" />
        </a-form-item>
        <div class="flex items-center w-full gap-3">
          <a-form-item
            label="Course Category"
            name="category_id"
            class="w-full"
            :rules="[{ required: true, message: 'Please input your course category!' }]"
          >
            <a-select
              v-model:value="formState.category_id"
              placeholder="Select category"
              :options="categoryOptions"
              class="w-full"
            />
          </a-form-item>
          <a-form-item
            label="Course Level"
            name="level"
            class="w-full"
            :rules="[{ required: true, message: 'Please input your level!' }]"
          >
            <a-select
              v-model:value="formState.level"
              placeholder="Select level"
              :options="levelOptions"
              class="w-full"
            />
          </a-form-item>
        </div>
        <div class="flex items-center w-full gap-3">
          <a-form-item
            label="Course price"
            name="price"
            class="w-full"
            :rules="[{ required: true, message: 'Please input your course price!' }]"
          >
            <a-input-number v-model:value="formState.price" class="!w-full" size="large" placeholder="Enter course price" />
          </a-form-item>
          <a-form-item
            label="Course discount price"
            name="discount_price"
            class="w-full"
          >
            <a-input-number v-model:value="formState.discount_price" class="!w-full" size="large" placeholder="Enter course discount price" />
          </a-form-item>
        </div>
        <a-form-item
          label="Course duration hours"
          name="duration_hours"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your course duration hours!' }]"
        >
          <a-input-number v-model:value="formState.duration_hours" class="!w-full" size="large" placeholder="Enter course duration hours" />
        </a-form-item>
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
                Drag and drop files, or <span class="text-blue-600">Browse</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
                Upload Video in Mov, MP4.
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <a-form-item name="image" label="Upload Intro Image" class="w-full">
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
                Drag and drop files, or <span class="text-blue-600">Browse</span>
              </p>
              <p class="ant-upload-hint text-gray-500">
                Upload Thumbnail in JPEG, PNG.
              </p>
            </template>
          </a-upload-dragger>
        </a-form-item>

        <a-form-item name="description" label="Description" class="w-full">
          <QuillEditor
            v-model:content="formState.description"
            content-type="html"
            theme="snow"
          />
        </a-form-item>
      </a-form>
    </div>
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
