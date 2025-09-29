<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'

interface Props {
  type: string
}

const props = defineProps<Props>()

const formState = ref({
  name: '',
  description: '',
})

const formRef = ref()

// Upload states
const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref<string>('')
const imagePreviewUrl = ref<string>('')
const loading = ref(false)

function beforeUpload() {
  return false
}

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

function handleDraft() {
}

async function handleSave () {
  loading.value = true
  await formRef.value?.validateFields()
  try {

  } catch(error)
  {
    // console.log(error)
  }
}

function handlePublish() {

}
</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <div class="flex items-center gap-5 justify-between">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ props.type === 'detail' ? 'Detail' : 'Create' }}
      </h1>
      <div class="flex gap-2 items-center">
        <a-button
          class="w-full !px-6 !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="handleDraft"
        >
          Draft
        </a-button>
        <a-button
          type="primary"
          class="w-full !px-6 !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="handleSave"
        >
          Save
        </a-button>
        <a-button
          type="primary"
          class="!h-12 !px-6 rounded-lg text-sm !font-semibold !flex !items-center justify-center !bg-blue-500 !border-blue-500 text-white !hover:bg-blue-600 !hover:border-blue-600"
          @click="handlePublish"
        >
          Publish
        </a-button>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Course Details
      </h2>
      <a-form
        :model="formState"
        ref="formRef"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pb-20 w-2/3"
        @finish="handleSave"
      >
        <a-form-item
          label="Course Name"
          name="name"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your course name!' }]"
        >
          <a-input v-model:value="formState.name" size="large" placeholder="Enter course name" />
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
