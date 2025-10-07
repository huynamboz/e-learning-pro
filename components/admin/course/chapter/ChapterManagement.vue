<script setup lang="ts">
import { useCourse } from '#imports'
import { notification } from 'ant-design-vue'
import LessonsList from './LessonsList.vue'

const { fetchChapters, createChapter, updateChapter, chapters, isCreatingChapter } = useCourse()
const route = useRoute()

const courseId = computed(() => route.params.id as string)

const router = useRouter()
const open = ref<boolean>(false)
const formRef = ref()

const formState = ref({
  title: '',
  slug: '',
  description: '',
  order: '',
})

const activeChapterId = ref<string>('')

async function handleAddChapter() {
  await formRef.value?.validateFields()
  try {
    const response = createChapter(courseId.value, formState.value)
    if ((await response).success) {
      notification.success({
        message: 'Create chapter cuccess',
      })
      fetchChapters(courseId.value)
      open.value = false
    }
  }
  catch (error) {
    notification.error({
      message: 'Create chapter failed',
    })
  }
}

const activeChapter = computed(() => {
  return chapters.value?.find(ch => ch.id === activeChapterId.value)
})

function showModal() {
  open.value = true
}

onMounted(async () => {
  await fetchChapters(courseId.value)
  // Set first chapter as active if available
  if (chapters.value && chapters.value.length > 0) {
    activeChapterId.value = chapters.value[0].id
  }
})
</script>

<template>
  <div class="flex gap-4">
    <!-- Sidebar Chapter List -->
    <div class="w-1/4">
      <div class="bg-white rounded-md shadow p-3 flex flex-col gap-2">
        <div class="flex items-center justify-between mb-5">
          <h1 class="text-lg font-semibold mb-2 text-gray-600 !m-0">
            Chapters
          </h1>
          <a-button
            type="primary"
            class="!h-10 rounded-lg text-sm !font-semibold !flex !items-center !justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
            @click="showModal"
          >
            Add chapter
            <Icon name="i-material-symbols-edit-square-outline-rounded" class="text-base ml-2" />
          </a-button>
        </div>
        <div
          v-for="ch in chapters"
          :key="ch.id"
          class="px-3 py-2 rounded-lg cursor-pointer border transition-all flex items-center"
          :class="activeChapterId === ch.id
            ? 'border-green-500 bg-green-50 font-medium'
            : 'border-gray-300 hover:bg-gray-100'"
          @click="activeChapterId = ch.id"
        >
          <Icon v-if="activeChapterId === ch.id" name="i-charm-tick" class="text-lg mr-2 text-green-600" />
          <span class="truncate">{{ ch.title }}</span>
        </div>
      </div>
    </div>

    <a-modal v-model:open="open" title="Add Chapter" width="600px" :confirm-loading="isCreatingChapter" @ok="handleAddChapter">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          label="Chapter title"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your chapter title!' }]"
        >
          <a-input v-model:value="formState.title" size="large" placeholder="Enter chapter title" />
        </a-form-item>
        <a-form-item
          label="Chapter Slug"
          name="slug"
          class="w-full"
          :rules="[
            { required: true, message: 'Please input your chapter slug!' },
            { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Enter a valid slug (letters, numbers, underscores, hyphens)' },
          ]"
        >
          <a-input v-model:value="formState.slug" size="large" placeholder="Enter chapter slug" />
        </a-form-item>
        <a-form-item
          label="Order"
          name="order"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your order!' }]"
        >
          <a-input-number v-model:value="formState.order" class="!w-full" size="large" placeholder="Enter order" />
        </a-form-item>
        <!-- <a-form-item name="description" label="Description" class="w-full">
          <QuillEditor
            v-model:content="formState.description"
            content-type="html"
            theme="snow"
          />
        </a-form-item> -->
      </a-form>
    </a-modal>

    <!-- Lesson List -->
    <div class="flex-1 bg-white rounded-md shadow p-4">
      <div v-if="activeChapter">
        <div class="flex items-center justify-between gap-4 mb-6">
          <h2 class="text-2xl font-semibold !m-0">
            {{ activeChapter.title }} ({{ activeChapter.lessons.length }} lessons)
          </h2>
          <a-button
            type="primary"
            class="!h-12 !mt-4 rounded-lg text-sm !font-semibold !flex !items-center !justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
            @click="router.push(`?chapterId=${activeChapter.id}&lessonId=default`)"
          >
            Add lesson
            <Icon name="i-material-symbols-edit-square-outline-rounded" class="text-base ml-2" />
          </a-button>
        </div>
        <LessonsList :chapter-id="activeChapter.id"  :list-lesson="activeChapter.lessons" />
      </div>
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
  height: 200px !important;
  overflow-y: auto;
}
</style>
