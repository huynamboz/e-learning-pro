<script setup>
import { Button } from 'ant-design-vue'
import CourseCard from '@/components/course/CourseCard.vue'

// Props
defineProps({
  coursesData: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="max-w-[1280px] mx-auto xl:px-0 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
        {{ title }}
      </h2>
      <Button type="text" class="text-blue-600 self-start sm:self-auto">
        See All
      </Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
      <CourseCard
        v-for="course in coursesData"
        :key="course.id"
        v-bind="course"
      />
    </div>
  </section>
</template>

<style scoped>
.ant-btn.ant-btn-text {
  color: #3B82F6;
}
</style>
