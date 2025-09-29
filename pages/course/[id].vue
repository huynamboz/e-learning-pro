<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { categoriesData, coursesData, heroData, instructorsData, reviewsData, statsData } from '@/resources/home'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const courseId = computed(() => route.params.id as string)

const {
  currentCourse,
  isLoading,
  fetchCourseDetail,
  clearCurrentCourse,
} = useCourse()

onMounted(async () => {
  if (courseId.value) {
    await loadCourseDetail()
  }
})

watch(courseId, async (newId) => {
  if (newId) {
    await loadCourseDetail()
  }
}, { immediate: false })

async function loadCourseDetail() {
  try {
    clearCurrentCourse()

    const courseResult = await fetchCourseDetail(courseId.value)

    if (!courseResult.success) {
      notification.error({
        message: 'Failed to load course',
        description: courseResult.error || 'Course not found',
      })
    }
  }
  catch (error) {
    console.error('Error loading course detail:', error)
    notification.error({
      message: 'An error occurred',
      description: 'Failed to load course details. Please try again.',
    })
  }
}

// Handle page unmountx
onUnmounted(() => {
  clearCurrentCourse()
})
</script>

<template>
  <div class="flex p-8 flex-col">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <a-spin size="large">
        <div class="content">
          <p class="text-gray-500">
            Loading course details...
          </p>
        </div>
      </a-spin>
    </div>

    <!-- Course Not Found -->
    <div v-else-if="!currentCourse" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon name="i-solar-document-text-outline" class="text-6xl text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          Course Not Found
        </h2>
        <p class="text-gray-500 mb-6">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <NuxtLink to="/learning" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Icon name="i-solar-arrow-left-outline" class="mr-2" />
          Back to Courses
        </NuxtLink>
      </div>
    </div>

    <!-- Course Content -->
    <div v-else class="flex flex-col lg:flex-row items-start gap-12">
      <course-description-course
        class="lg:w-[65%] w-full"
        :course-data="currentCourse"
      />
      <course-checkout-card
        class="w-full lg:w-[35%]"
        :course-data="currentCourse"
      />
    </div>

    <!-- Related Content -->
    <div v-if="currentCourse && !isLoading">
      <HomeCustomerReviewsSection :reviews-data="reviewsData" />
      <HomeTopCoursesSection :courses-data="coursesData" title="More Courses Like This" />
    </div>
  </div>
</template>
