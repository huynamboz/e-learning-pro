<script setup lang="ts">
import type { CourseChapterStore } from '~/stores/learn.store'
import { useLearnStore } from '~/stores/learn.store'
import CourseLessonItem from './CourseLessonItem.vue'

interface Props {
  chapter: CourseChapterStore
}

const props = defineProps<Props>()
const learnStore = useLearnStore()
function toggleChapter() {
  learnStore.toggleChapter(props.chapter.id)
}
</script>

<template>
  <div class="border-b pb-2 border-gray-200 last:border-b-0">
    <!-- Chapter Header -->
    <div
      class="flex items-center justify-between py-4 px-4 cursor-pointer chapter-header transition-all duration-200"
      @click="toggleChapter"
    >
      <div class="flex items-center gap-3">
        <Icon
          v-show="chapter.isExpanded"
          name="tabler:chevron-up"
          class="text-gray-600"
          size="20"
        />
        <Icon
          v-show="!chapter.isExpanded"
          name="tabler:chevron-down"
          class="text-gray-600"
          size="20"
        />
        <span class="text-lg font-bold text-gray-900">{{ chapter.title }}</span>
      </div>
    </div>

    <!-- Chapter Lessons (shown when expanded) -->
    <div v-show="chapter.isExpanded" class="space-y-0 px-2">
      <CourseLessonItem
        v-for="(lesson, lessonIndex) in chapter.lessons"
        :key="lesson.id"
        :lesson="lesson as any"
        :lesson-index="lessonIndex"
      />
    </div>
  </div>
</template>

<style scoped>
/* Chapter header styling */
.chapter-header:hover {
  background-color: #f9fafb;
}
</style>
