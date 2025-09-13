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
  <section class="max-w-[1280px] mx-auto xl:px-0 px-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Top Categories
      </h2>
      <Button type="text" class="text-blue-600">
        See All
      </Button>
    </div>

    <div class="grid grid-cols-4 gap-9">
      <div
        v-for="category in categoriesData"
        :key="category.id"
        class="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col items-center gap-2.5">
          <div class="relative w-[100px] h-[100px]">
            <div class="absolute inset-0 bg-green-50 rounded-full" />
            <div class="absolute top-[30px] left-[30px] w-10 h-10">
              <Icon :name="category.icon" class="text-[40px] text-[#15803D]" />
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 !mb-0">
            {{ category.name }}
          </h3>
          <p class="text-gray-600 !mb-0">
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
