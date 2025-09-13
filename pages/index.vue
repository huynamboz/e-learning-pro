<script setup>
import { categoriesData, coursesData, heroData, instructorsData, reviewsData, statsData } from '@/resources/home'

definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div class="bg-white min-h-screen space-y-[60px]">
    <HomeHeroSection :hero-data="heroData" />
    <HomeStatsSection :stats-data="statsData" />
    <HomeTopCategoriesSection :categories-data="categoriesData" />
    <HomeTopCoursesSection :courses-data="coursesData" />
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
