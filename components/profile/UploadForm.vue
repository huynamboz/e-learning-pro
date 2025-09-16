<script lang="ts" setup>
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'

const formState = reactive<any>({
  email: '',
  password: '',
  image: null as File | null,
  imageUrl: '' as string,
})

async function handleUpload({ file }: UploadRequestOption) {
  formState.image = file as File
  formState.imageUrl = URL.createObjectURL(file as File)
}

function onFinish() {
}
</script>

<template>
  <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    layout="vertical"
    class="flex flex-col w-full rounded-lg border border-[#E2E8F0] !p-6"
    @finish="onFinish"
  >
    <div class="flex flex-col gap-3">
      <h3 class="text-xl font-semibold">
        Image Preview
      </h3>
      <div class="w-1/3 h-[198px] rounded-lg border border-[#E2E8F0] p-2 cursor-pointer">
        <img
          v-if="formState.imageUrl"
          :src="formState.imageUrl"
          alt="preview"
          class="w-full h-full object-cover"
        >
        <div v-else class="bg-[#E2E8F0] flex items-center justify-center h-full rounded-lg">
          <img src="@/assets/images/image-default.png" alt="default">
        </div>
      </div>
    </div>

    <a-upload
      :multiple="false"
      :show-upload-list="false"
      drag
      name="image"
      :custom-request="handleUpload"
    >
      <a-button
        class="max-w-[138px] !h-[40px] flex items-center justify-center !mt-4"
        html-type="submit"
      >
        Upload image
      </a-button>
    </a-upload>

    <!-- <a-button
      type="primary"
      class="max-w-[138px] !h-[40px] flex items-center justify-center !bg-black"
      html-type="submit"
    >
      Save Image
    </a-button> -->
  </a-form>
</template>
