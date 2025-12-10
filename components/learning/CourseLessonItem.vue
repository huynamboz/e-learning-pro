<script setup lang="ts">
import type { CourseLesson } from '~/stores/learn.store'
import { useLearnStore } from '~/stores/learn.store'

interface Props {
  lesson: CourseLesson
  lessonIndex: number
}

const props = defineProps<Props>()
const learnStore = useLearnStore()
const course = computed(() => learnStore.course)
function selectLesson() {
  learnStore.setActiveLesson(props.lesson)
}

// Manual completion disabled - lessons are completed automatically when watching >80% of video
// async function toggleCompletion(e: any) {
//   try {
//     await learnStore.toggleLessonCompletion(props.lesson.id, e.target.checked)
//   }
//   catch (error) {
//     console.error('Error toggling lesson completion:', error)
//     // Revert checkbox state on error
//     e.target.checked = !e.target.checked
//   }
// }

const activeLesson = computed(() => learnStore.activeLesson)

const isLessonActive = computed(() => {
  return activeLesson.value?.id === props.lesson.id
})
</script>

<template>
  <div
    class="flex items-center justify-between py-4 px-4 group rounded-lg lesson-item hover:bg-green-600 hover:text-white cursor-pointer transition-all duration-200"
    :class="{
      '!bg-green-600 !text-white': isLessonActive,
    }"
    @click="selectLesson"
  >
    <div class="flex items-center gap-3">
      <div v-if="course?.course_type === 'course'" class="flex items-center justify-center w-5 h-5">
        <!-- Manual completion disabled - lessons complete automatically when watching >80% -->
        <a-tooltip
          :title="lesson.is_completed ? 'Bài học đã hoàn thành' : 'Xem video >80% để hoàn thành bài học'"
          placement="top"
        >
          <div
            v-if="lesson.is_completed"
            class="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center cursor-help"
          >
            <Icon name="tabler:check" size="12" class="text-white" />
          </div>
          <div
            v-else
            class="w-5 h-5 rounded-full border-2 border-gray-300 cursor-help"
          />
        </a-tooltip>
      </div>
      <span class="text-sm font-medium lesson-text group-hover:text-white" :class="{ '!text-white': isLessonActive, 'text-gray-900': !isLessonActive }">
        {{ lessonIndex + 1 }}. {{ lesson.title }}
      </span>
    </div>
    <div class="flex items-center gap-1.5 group-hover:text-white" :class="{ '!text-white': isLessonActive, 'text-gray-500': !lesson.isActive }">
      <Icon name="tabler:video" size="16" />
      <span class="text-sm">{{ lesson.video_duration_formatted || '0min' }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Custom completion indicator styling */
.completion-indicator {
  transition: all 0.2s ease;
}

/* Video icon styling for active lesson */
.bg-green-600 .tabler-video {
  color: white !important;
}

/* Lesson item hover effects */
.lesson-item:hover {
  background-color: #f3f4f6;
}

.lesson-item:hover .lesson-text {
  color: #1f2937;
}
</style>
