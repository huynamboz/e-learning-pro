<script setup>
import { Icon } from '#components'
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
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

// Define emits
defineEmits(['retry'])
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

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
      <div
        v-for="i in 8"
        :key="i"
        class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-pulse"
      >
        <div class="space-y-4">
          <div class="w-full h-32 sm:h-36 lg:h-[139px] bg-gray-200 rounded-lg" />
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-3 bg-gray-200 rounded w-1/2" />
            <div class="h-3 bg-gray-200 rounded w-2/3" />
            <div class="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">
        <Icon name="solar:danger-circle-bold" class="w-12 h-12 mx-auto mb-2" />
        <p class="text-lg font-medium">
          Failed to load courses
        </p>
        <p class="text-sm text-gray-600">
          {{ error }}
        </p>
      </div>
      <Button type="primary" @click="$emit('retry')">
        Try Again
      </Button>
    </div>

    <div v-else-if="coursesData.length === 0" class="text-center py-8">
      <div class="text-gray-500">
        <Icon name="solar:book-2-bold" class="w-12 h-12 mx-auto mb-2" />
        <p class="text-lg font-medium">
          No courses available
        </p>
        <p class="text-sm">
          Check back later for new courses
        </p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
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
