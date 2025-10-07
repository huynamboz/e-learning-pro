<script setup lang="ts">
import { useCourseApi } from '@/composables/api/useCourseApi'
import { categoriesData, heroData, instructorsData, reviewsData, statsData } from '@/resources/home'

definePageMeta({
  layout: 'auth',
})

// Use course API directly
const { getCourses } = useCourseApi()

// Use useLazyAsyncData for better UX (non-blocking)
// This provides automatic caching, SSR support, and better error handling
const { data: coursesData, pending: isFetchingCourses, error: fetchError, refresh: retryFetch } = await useLazyAsyncData(
  'homepage-courses', // Unique key for caching
  async () => {
    try {
      const response = await getCourses({ limit: 8 })

      if (response?.results) {
        return response.results // Return raw API data
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
    default: () => [], // Default value while loading
    server: true, // Fetch on server-side for better SEO and initial load
  },
)
</script>

<template>
  <div class="bg-white min-h-screen space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-20 xl:space-y-[60px]">
    <HomeHeroSection :hero-data="heroData" />
    <HomeStatsSection :stats-data="statsData" />
    <HomeTopCategoriesSection :categories-data="categoriesData" />
    <HomeTopCoursesSection
      :courses-data="coursesData"
      title="Top Courses"
      :loading="isFetchingCourses"
      :error="fetchError?.message"
      @retry="retryFetch"
    />
    <HomeTopInstructorsSection :instructors-data="instructorsData" />
    <HomeCustomerReviewsSection :reviews-data="reviewsData" />
    <HomeCTASection />
  </div>
</template>

<style scoped>
.ant-btn.ant-btn-text {
  color: #3B82F6;
}
</style>
