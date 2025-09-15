<script setup>
import { Button } from 'ant-design-vue'

// Props
defineProps({
  categoriesData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="max-w-[1280px] mx-auto xl:px-0 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
        Top Categories
      </h2>
      <Button type="text" class="text-blue-600 self-start sm:self-auto">
        See All
      </Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-9">
      <div
        v-for="category in categoriesData"
        :key="category.id"
        class="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col items-center gap-2.5">
          <div class="relative w-20 h-20 sm:w-[100px] sm:h-[100px]">
            <div class="absolute inset-0 bg-green-50 rounded-full" />
            <div class="absolute top-[24px] left-[24px] sm:top-[30px] sm:left-[30px] w-8 h-8 sm:w-10 sm:h-10">
              <Icon :name="category.icon" class="text-[32px] sm:text-[40px] text-[#15803D]" />
            </div>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 !mb-0">
            {{ category.name }}
          </h3>
          <p class="text-sm text-gray-600 !mb-0">
            {{ category.coursesCount }}
          </p>
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
