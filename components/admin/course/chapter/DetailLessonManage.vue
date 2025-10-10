<script lang="ts" setup>
import type { LessonPayload } from '~/types/course.type'
import { useCourse } from '#imports'
import { notification } from 'ant-design-vue'

import { listOptionsDetailLesson } from '~/constant/admin'
import FormLesson from './FormLesson.vue'
import FormResearch from './FormResearch.vue'

const props = defineProps<{
  courseId: string
  chapterId: string
  lessonId: string
}>()

const router = useRouter()
const route = useRoute()

const { createLesson, updateLesson, detailLesson, currentLesson, fetchChapters, isCreatingLesson } = useCourse()
const activeTab = ref('DETAIL')

const formState = defineModel<LessonPayload>({
  default: () => ({
    chapter_id: '',
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
  }),
})

watch(currentLesson, (newLesson) => {
  if (newLesson && props.lessonId && props.lessonId !== 'default') {
    formState.value = {
      chapter_id: props.chapterId,
      title: newLesson.title,
      slug: newLesson.slug,
      description: newLesson.description,
      video_url: newLesson.video_url,
      video_duration: newLesson.video_duration,
      content: '',
      order: newLesson.order,
      is_preview: newLesson.is_preview,
      is_published: newLesson.is_published,
      is_unlocked: newLesson.is_unlocked,
    }
  }
}, { immediate: true })

function handleChangeTab(tab: string) {
  activeTab.value = tab
}

async function handleAddLesson() {  
  try {
    // await formLessonRef.value?.validateFields()
    formState.value.chapter_id = props.chapterId

    let response
    if (props.lessonId && props.lessonId !== 'default') {
      response = await updateLesson(props.courseId, props.chapterId, props.lessonId, formState.value)
    }
    else {
      response = await createLesson(props.courseId, props.chapterId, formState.value)
    }

    if (response.success) {
      notification.success({
        message: props.lessonId && props.lessonId !== 'default' ? 'Update lesson success' : 'Create lesson success',
      })
      await fetchChapters(props.courseId)
    }
    else {
      notification.error({
        message: props.lessonId && props.lessonId !== 'default' ? 'Update lesson failed' : 'Create lesson failed',
        description: `${response.error}`
      })
    }
  }
  catch (error) {
    console.error('Validation or API error:', error)
  }
}

onMounted(() => {
  if (props.lessonId && props.lessonId !== 'default') {
    detailLesson(props.courseId, props.chapterId, props.lessonId)
  }
  else {
    formState.value.chapter_id = props.chapterId
  }
})
</script>

<template>
  <div class="">
    <div class="flex items-center gap-4 justify-between mb-6">
      <div class="flex items-center gap-1 cursor-pointer" @click="router.push(`/admin/courses/${route.params.id}`)">
        <Icon name="i-material-symbols-chevron-left-rounded" class="text-[24px]" />
        <h1 class="text-xl font-bold text-gray-900 !m-0">
          {{ currentLesson ? currentLesson?.title : 'Untitle' }}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <a-button
          type="primary"
          class="w-full !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          :loading="isCreatingLesson"
          @click="handleAddLesson"
        >
          {{ currentLesson ? 'Update' : 'Add' }} Lesson
        </a-button>
      </div>
    </div>
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane v-for="tab in listOptionsDetailLesson" :key="tab.key" :tab="tab.name" @change="handleChangeTab(tab.key)">
        <FormLesson v-if="activeTab === 'DETAIL'" v-model="formState" />
        <FormResearch v-if="activeTab === 'RESEARCH'" v-model="formState" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
