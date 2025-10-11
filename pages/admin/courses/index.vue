<script setup lang="ts">
import { useCourseApi } from '@/composables/api/useCourseApi'

import CourseCard from '~/components/course/CourseCard.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { t } = useI18n()

useHead({
  title: t('admin.courses.title'),
})

const router = useRouter()
const { getMyCourses } = useCourseApi()

const { data: coursesData, pending: isFetchingCourses } = await useLazyAsyncData(
  'admin-courses', // Unique key for caching
  async () => {
    try {
      const response = await getMyCourses()

      if (response?.results) {
        return response.results
      }

      return []
    }
    catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.data?.message || error.statusMessage || 'Failed to fetch courses',
      })
    }
  },
  {
    default: () => [],
    server: true,
  },
)
</script>

<template>
  <div class="admin-courses px-4 flex flex-col gap-8">
    <!-- Page Header -->
    <div class="flex justify-between items-center gap-4">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ t('admin.courses.title') }}
      </h1>
      <a-button
        type="primary"
        class="!h-12 rounded-lg text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
        @click="router.push('/admin/courses/create')"
      >
        <Icon name="i-material-symbols-add-2-rounded" class="text-xl text-white mr-1" />
        {{ t('admin.courses.createCourse') }}
      </a-button>
    </div>

    <div
      v-if="isFetchingCourses"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800"
      >
        <a-skeleton active avatar :paragraph="{ rows: 3 }" />
      </div>
    </div>

    <div v-if="coursesData.length > 0 || isFetchingCourses" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
      <CourseCard
        v-for="course in coursesData"
        :key="course.id"
        type="admin"
        v-bind="course"
      />
    </div>
    <div v-else class="text-center flex flex-col justify-center items-center">
      <Icon name="i-solar-document-text-outline" class="text-6xl text-gray-300 mb-4" />
      <h2 class="text-2xl font-bold text-gray-700 mb-2">
        {{ t('admin.courses.courseNotFound') }}
      </h2>
      <a-button
        type="primary"
        class="!h-12 rounded-lg text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
        @click="router.push('/admin/courses/create')"
      >
        <Icon name="i-material-symbols-add-2-rounded" class="text-xl text-white mr-1" />
        {{ t('admin.courses.createCourse') }}
      </a-button>
    </div>
  </div>
</template>
