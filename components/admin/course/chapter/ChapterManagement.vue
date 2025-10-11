<script setup lang="ts">
import { useCourse } from '#imports'
import { notification } from 'ant-design-vue'
import LessonsList from './LessonsList.vue'
import { generateSlug } from '~/utils/slug'

const { fetchChapters, createChapter, updateChapter, chapters, isCreatingChapter } = useCourse()
const route = useRoute()

const courseId = computed(() => route.params.id as string)

const router = useRouter()
const open = ref<boolean>(false)
const formRef = ref()

const formState = ref({
  title: '',
  description: '',
})

const activeChapterId = ref<string>('')

async function handleAddChapter() {
  await formRef.value?.validateFields()
  try {
    // Generate slug from title
    const chapterData = {
      ...formState.value,
      slug: generateSlug(formState.value.title)
    }
    
    const response = createChapter(courseId.value, chapterData as any)
    if ((await response).success) {
      notification.success({
        message: 'Create chapter success',
      })
      fetchChapters(courseId.value)
      open.value = false
      // Reset form
      formState.value = {
        title: '',
        description: '',
      }
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
        <!-- Empty state for chapters -->
        <div v-if="!chapters || chapters.length === 0" class="flex flex-col gap-2 items-center text-center py-8">
          <div class="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <Icon name="solar:book-2-bold-duotone" size="32" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No chapters yet</h3>
          <p class="text-sm text-gray-500 mb-4">Create your first chapter to start organizing your course content.</p>
          <a-button
            type="primary"
            size="small"
            class="!h-8 !flex gap-1 items-center !px-4 rounded-lg text-xs !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
            @click="showModal"
          >
            <template #icon>
              <Icon name="solar:add-circle-bold-duotone" size="14" />
            </template>
            Create Chapter
          </a-button>
        </div>

        <!-- Chapter list -->
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
          label="Chapter description"
          name="description"
          class="w-full"
        >
          <a-textarea v-model:value="formState.description" size="large" placeholder="Enter chapter description" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Lesson List -->
    <div class="flex-1 bg-white rounded-md shadow p-4">
      <!-- Empty state when no chapter is selected -->
      <div v-if="!activeChapter && chapters && chapters.length > 0" class="text-center py-12">
        <div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6">
          <Icon name="solar:playlist-bold-duotone" size="40" class="text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Select a chapter</h3>
        <p class="text-sm text-gray-500">Choose a chapter from the sidebar to view and manage its lessons.</p>
      </div>

      <!-- Empty state when no chapters exist -->
      <div v-else-if="!chapters || chapters.length === 0" class="text-center flex flex-col gap-2 items-center py-12">
        <div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6">
          <Icon name="solar:book-2-bold-duotone" size="40" class="text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">No chapters available</h3>
        <p class="text-sm text-gray-500 mb-6">Create your first chapter to start organizing your course content.</p>
        <a-button
          type="primary"
          class="!h-10 !flex gap-1 items-center !px-6 rounded-lg text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
          @click="showModal"
        >
          <template #icon>
            <Icon name="solar:add-circle-bold-duotone" size="16" />
          </template>
          Create First Chapter
        </a-button>
      </div>

      <!-- Chapter content -->
      <div v-else-if="activeChapter">
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

        <!-- Empty state for lessons -->
        <div v-if="!activeChapter.lessons || activeChapter.lessons.length === 0" class="text-center py-12">
          <div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6">
            <Icon name="solar:playlist-bold-duotone" size="40" class="text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">No lessons yet</h3>
          <p class="text-sm text-gray-500 mb-6">This chapter doesn't have any lessons. Create your first lesson to start teaching.</p>
          <a-button
            type="primary"
            class="!h-10 !px-6 rounded-lg text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
            @click="router.push(`?chapterId=${activeChapter.id}&lessonId=default`)"
          >
            <template #icon>
              <Icon name="solar:add-circle-bold-duotone" size="16" />
            </template>
            Create First Lesson
          </a-button>
        </div>

        <!-- Lessons list -->
        <LessonsList v-else :chapter-id="activeChapter.id" :list-lesson="activeChapter.lessons" />
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
