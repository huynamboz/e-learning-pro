<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue'
import type { LessonPayload } from '~/types/course.type'

const formState = defineModel<LessonPayload>({
  required: true,
})

const formRef = ref<FormInstance>()

defineExpose({
  validate: formRef,
})
</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold text-gray-900 !m-0">
        Chapter details
      </h2>
      <p class="!m-0 text-[#334155] text-[15px]">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
      </p>
      <a-form
        :ref="formRef"
        :model="formState"
        name="basic"
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
          <a-input
            v-model:value="formState.slug"
            placeholder="Enter lesson slug"
            size="large"
          />
        </a-form-item>

        <div class="flex items-center w-full gap-3">
          <a-form-item
            name="video_duration"
            label="Video Duration (minutes)"
            class="w-full"
            :rules="[
              { type: 'number', min: 0, message: 'Video duration must be greater than or equal to 0!' },
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
              { type: 'number', min: 0, message: 'Order must be greater than or equal to 0!' },
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
