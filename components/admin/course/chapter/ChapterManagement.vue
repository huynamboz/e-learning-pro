<script setup lang="ts">
import { notification } from 'ant-design-vue'
import LessonsList from './LessonsList.vue'

interface Lesson {
  id: number
  title: string
  duration: number // seconds
  publish: boolean
}

interface Chapter {
  id: number
  title: string
  lessons: Lesson[]
}

// Mock data
const chapters = ref<Chapter[]>([
  {
    id: 1,
    title: 'Chapter 1: Starting Basics',
    lessons: [
      { id: 1, title: 'Learn abc from xyz', duration: 270, publish: true },
      { id: 2, title: 'Variables and Data Types', duration: 300, publish: false },
      { id: 3, title: 'Control Flow Introduction', duration: 280, publish: true },
    ],
  },
  {
    id: 2,
    title: 'Inspiration',
    lessons: [
      { id: 4, title: 'Motivation and Mindset', duration: 250, publish: true },
      { id: 5, title: 'Building Learning Habits', duration: 260, publish: true },
    ],
  },
  {
    id: 3,
    title: 'Ideas',
    lessons: [
      { id: 6, title: 'Project Ideas for Beginners', duration: 400, publish: true },
      { id: 7, title: 'How to Structure a Project', duration: 320, publish: false },
      { id: 8, title: 'Debugging Tips', duration: 200, publish: true },
      { id: 9, title: 'Version Control Basics', duration: 330, publish: true },
    ],
  },
])

const activeChapterId = ref<number>(chapters.value[0].id)
const open = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
const formRef = ref()

const formState = ref({
  title: '',
})

async function handleOk() {
  // confirmLoading.value = true
  await formRef.value?.validateFields()
  try {
    //hell
    notification.success({
      message: 'Create Chapter Success',
      description: 'Chapter has been created successfully',
    })
    open.value = false
  } catch(error)
  {
    // console.log(error)
  }
}

const activeChapter = computed(() => {
  return chapters.value.find(ch => ch.id === activeChapterId.value)
})

function handleAddLesson() {

}

function showModal() {
  open.value = true
}
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

    <a-modal v-model:open="open" title="Add Chapter" :confirm-loading="confirmLoading" @ok="handleOk">
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
            @click="handleAddLesson"
          >
            Add lesson
            <Icon name="i-material-symbols-edit-square-outline-rounded" class="text-base ml-2" />
          </a-button>
        </div>
        <!-- List lesson component -->
        <LessonsList :list-lesson="activeChapter.lessons" />
      </div>
    </div>
  </div>
</template>
