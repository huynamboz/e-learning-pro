<script lang="ts" setup>
const loading = ref(false)

const formState = ref({
  title: '',
  subTitle: '',
  description: '',
})

const formRef = ref()

async function handleSave() {
  loading.value = true
  await formRef.value?.validateFields()
  try {
    // hell
  }
  catch (error) {
    // console.log(error)
  }
}

</script>

<template>
  <div class="form-courses flex flex-col gap-20">
    <!-- <div class="flex items-center gap-5 justify-between">
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
      </div>
    </div> -->

    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white !m-0">
        Chapter details
      </h2>
      <p class="!m-0 text-[#334155] text-[15px]">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col !pt-6 w-2/3"
        @finish="handleSave"
      >
        <a-form-item
          label="Title"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your lesson title!' }]"
        >
          <a-input v-model:value="formState.title" size="large" placeholder="Enter course title" />
        </a-form-item>

        <a-form-item name="image" label="SubTitle" class="w-full" :rules="[{ required: true, message: 'Please input your lesson subtitle!' }]">
          <a-textarea
            v-model:value="formState.subTitle"
            placeholder="Enter subTitle"
            :auto-size="{ minRows: 3, maxRows: 3 }"
          />
        </a-form-item>

        <a-form-item name="description" label="Description" class="w-full" :rules="[{ required: true, message: 'Please input your description!' }]">
          <a-textarea
            v-model:value="formState.description"
            placeholder="Enter description"
            :auto-size="{ minRows: 10, maxRows: 10 }"
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
