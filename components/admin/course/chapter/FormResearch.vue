<script lang="ts" setup>
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import type { LessonPayload } from '~/types/course.type'

const formState = defineModel<LessonPayload>({
  required: true
})

const formRef = ref()

const videoFileList = ref<UploadFile<any>[]>([])
const imageFileList = ref<UploadFile<any>[]>([])
const videoPreviewUrl = ref<string>('')
const imagePreviewUrl = ref<string>('')

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
    // Update formState with video URL (in real app, you'd upload to server first)
    formState.value.video_url = videoPreviewUrl.value
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
</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white !m-0">
        Upload Notes
      </h2>
      <p class="!m-0 text-[#334155] text-[15px]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pt-6 w-2/3"
      >
        <a-form-item 
          name="video" 
          label="Upload Intro Video" 
          class="w-full"
          :rules="[
            { required: true, message: 'Please upload a video!' }
          ]"
        >
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

        <a-form-item 
          name="image" 
          label="Upload Intro Image" 
          class="w-full"
          :rules="[
            { required: true, message: 'Please upload an image!' }
          ]"
        >
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
