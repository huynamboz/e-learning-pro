<script setup lang="ts">
import { useCourseApi } from '@/composables/api/useCourseApi'

import CourseCard from '~/components/course/CourseCard.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({
  title: 'Course Management',
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
        Course Management
      </h1>
      <a-button
        type="primary"
        class="!h-12 rounded-lg text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
        @click="router.push('/admin/courses/create')"
      >
        <Icon name="i-material-symbols-add-2-rounded" class="text-xl text-white mr-1" />
        Create course
      </a-button>
    </div>

    <div v-if="coursesData.length > 0 || isFetchingCourses" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
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
        Course Not Found
      </h2>
      <a-button
        type="primary"
        class="!h-12 rounded-lg text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
        @click="router.push('/admin/courses/create')"
      >
        <Icon name="i-material-symbols-add-2-rounded" class="text-xl text-white mr-1" />
        Create course
      </a-button>
    </div>

    <!-- <div class="flex justify-center mt-4">
      <a-pagination
        :current="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        :show-size-changer="false"
        :hide-on-single-page="true"
        @change="handlePageChange"
      />
    </div> -->
  </div>
</template>
