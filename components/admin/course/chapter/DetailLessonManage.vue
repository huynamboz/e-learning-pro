<script lang="ts" setup>
import FormLesson from './FormLesson.vue'

const props = defineProps<{
  courseId: string
  chapterId: string
  lessonId: string
}>()
</script>

<template>
  <FormLesson
    :course-id="props.courseId"
    :chapter-id="props.chapterId"
    :lesson-id="props.lessonId"
  />
</template>
