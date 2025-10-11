<script setup lang="ts">
import { useLearnStore } from '~/stores/learn.store'

interface Props {
  lesson: CourseLesson
  lessonIndex: number
}

const props = defineProps<Props>()
const learnStore = useLearnStore()

function selectLesson() {
  learnStore.setActiveLesson(props.lesson)
}

function toggleCompletion(e: any) {
  learnStore.toggleLessonCompletion(props.lesson.id, e.target.checked)
}
</script>

<template>
  <div
    class="flex items-center justify-between py-4 px-4 group lesson-item hover:bg-green-600 hover:text-white cursor-pointer transition-all duration-200"
    :class="{
      '!bg-green-600 !text-white': lesson.isActive,
    }"
    @click="selectLesson"
  >
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center w-5 h-5">
        <a-checkbox
          :checked="lesson.isCompleted"
          :class="{
            '!text-white': lesson.isActive,
            'text-blue-600': !lesson.isActive && lesson.isCompleted,
            'text-gray-400': !lesson.isActive && !lesson.isCompleted,
          }"
          @change="toggleCompletion"
        />
      </div>
      <span class="text-sm font-medium lesson-text group-hover:text-white" :class="{ '!text-white': lesson.isActive, 'text-gray-900': !lesson.isActive }">
        {{ lessonIndex + 1 }}. {{ lesson.title }}
      </span>
    </div>
    <div class="flex items-center gap-1.5 group-hover:text-white" :class="{ 'text-white': lesson.isActive, 'text-gray-500': !lesson.isActive }">
      <Icon name="tabler:video" size="16" />
      <span class="text-sm">{{ lesson.video_duration_formatted || '0min' }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Custom checkbox styling for completed lessons */
:deep(.ant-checkbox-wrapper-checked .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Override checkbox colors for active lesson */
.bg-green-600 :deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: white;
  border-color: white;
}

.bg-green-600 :deep(.ant-checkbox-checked .ant-checkbox-inner):after {
  border-color: #16a34a;
}

/* Unchecked checkbox styling for active lesson */
.bg-green-600 :deep(.ant-checkbox .ant-checkbox-inner) {
  background-color: white;
  border-color: #d1d5db;
}

.bg-green-600 :deep(.ant-checkbox .ant-checkbox-inner):hover {
  border-color: #9ca3af;
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
