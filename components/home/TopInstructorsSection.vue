<script setup>
import { Button } from 'ant-design-vue'

// Props
defineProps({
  instructorsData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="max-w-[1280px] mx-auto xl:px-0 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
        Top Instructors
      </h2>
      <Button type="text" class="text-blue-600 self-start sm:self-auto">
        See All
      </Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:justify-between gap-6">
      <div
        v-for="instructor in instructorsData"
        :key="instructor.id"
        class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="text-center space-y-4">
          <img
            :src="instructor.image"
            :alt="instructor.name"
            class="w-full sm:w-[177px] h-32 sm:h-[132px] object-cover rounded-lg mx-auto"
          >
          <div class="space-y-2">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">
              {{ instructor.name }}
            </h3>
            <p class="text-xs sm:text-sm text-gray-600">
              {{ instructor.designation }}
            </p>
            <hr class="border-gray-200">
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-1">
                <Icon name="solar:star-bold" class="w-4 h-4 text-yellow-400" />
                <span class="font-semibold">{{ instructor.rating }}</span>
              </div>
              <span class="text-gray-600 font-semibold">{{ instructor.studentsCount }} Students</span>
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
