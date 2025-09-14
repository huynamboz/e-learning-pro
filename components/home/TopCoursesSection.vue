<script setup>
import { Button } from 'ant-design-vue'

// Props
defineProps({
  coursesData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="max-w-[1280px] mx-auto xl:px-0 px-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Top Courses
      </h2>
      <Button type="text" class="text-blue-600">
        See All
      </Button>
    </div>

    <div class="grid grid-cols-4 gap-10">
      <div
        v-for="course in coursesData"
        :key="course.id"
        class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="space-y-4">
          <img
            :src="course.image"
            :alt="course.title"
            class="w-full h-[139px] object-cover rounded-lg"
          >
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900 leading-tight">
              {{ course.title }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ course.instructor }}
            </p>
            <div class="flex items-center gap-2">
              <div class="flex">
                <Icon v-for="star in 5" :key="star" name="solar:star-bold" class="w-5 h-5 text-yellow-400" />
              </div>
              <span class="text-xs font-semibold text-gray-600">
                ({{ course.ratingsCount }} Ratings)
              </span>
            </div>
            <p class="text-sm text-gray-600">
              {{ course.duration }}
            </p>
            <div class="text-xl font-semibold text-gray-900">
              ${{ course.price }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ant-btn.ant-btn-text {
  color: #3B82F6;
}
</style>
