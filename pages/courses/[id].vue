<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useCourseApi } from '@/composables/api/useCourseApi'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.id as string)
const { getDetailCourses } = useCourseApi()

// Use useLazyAsyncData for better data fetching
const { data: currentCourse, pending: isLoading, error: fetchError, refresh: retryFetch } = useLazyAsyncData(
  `course-${courseId.value}`,
  async () => {
    try {
      const response = await getDetailCourses(courseId.value)

      if (!response) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Course not found',
        })
      }

      return response
    }
    catch (error: any) {
      console.log(error)
      // throw createError({
      //   statusCode: error.statusCode || 500,
      //   statusMessage: error.statusMessage || 'Failed to load course details',
      // })
    }
  },
  {
    default: () => null,
    server: true, // Fetch on server-side for better SEO
    watch: [courseId], // Watch for courseId changes
  },
)

// Watch for errors and show notifications
watch(fetchError, (error) => {
  if (error) {
    notification.error({
      message: t('courseDetail.notifications.loadFailed'),
      description: error.statusMessage || t('courseDetail.notifications.courseNotFound'),
    })
  }
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <a-spin size="large">
        <div class="content">
          <p class="text-gray-500">
            {{ $t('courseDetail.loading') }}
          </p>
        </div>
      </a-spin>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon name="solar:danger-circle-bold" class="text-6xl text-red-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('courseDetail.error.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ fetchError.statusMessage || $t('courseDetail.error.description') }}
        </p>
        <div class="flex gap-4 justify-center">
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="() => retryFetch()"
          >
            <Icon name="solar:refresh-bold" class="mr-2" />
            {{ $t('courseDetail.error.tryAgain') }}
          </button>
          <NuxtLink to="/learning" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Icon name="solar:arrow-left-bold" class="mr-2" />
            {{ $t('courseDetail.error.backToCourses') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Course Not Found -->
    <div v-else-if="!currentCourse" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon name="solar:document-text-bold" class="text-6xl text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('courseDetail.notFound.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ $t('courseDetail.notFound.description') }}
        </p>
        <NuxtLink to="/learning" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Icon name="solar:arrow-left-bold" class="mr-2" />
          {{ $t('courseDetail.notFound.backToCourses') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Course Content -->
    <div v-else class="flex flex-col lg:flex-row items-start gap-12">
      <course-description-course
        class="lg:w-[65%] w-full"
        :course-data="currentCourse"
      />
      <div class="pt-8 lg:pr-8 w-full lg:w-[35%] md:pr-4 md:pl-4">
        <course-checkout-card
          class="w-full"
          :course-data="currentCourse"
        />
      </div>
    </div>
  </div>
</template>
