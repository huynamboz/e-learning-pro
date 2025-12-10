<script setup lang="ts">
import ListCourses from '~/components/my-course/ListCourses.vue'
// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'onboarding'],
})

const { t } = useI18n()

// Set page title
useHead({
  title: t('menu.myCourses'),
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 lg:pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        {{ t('menu.myCourses') }}
      </h1>
      <ListCourses />
    </div>
  </div>
</template>

