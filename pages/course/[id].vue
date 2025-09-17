<script lang="ts" setup>
import { categoriesData, coursesData, heroData, instructorsData, reviewsData, statsData } from '@/resources/home'
</script>

<template>
  <div class="flex p-8 flex-col">
    <div class="flex flex-col lg:flex-row items-start gap-12">
      <course-description-course class="lg:w-[65%] w-full" />
      <course-checkout-card class="w-full lg:w-[35%]"/>
    </div>
    <HomeCustomerReviewsSection :reviews-data="reviewsData" />
    <HomeTopCoursesSection :courses-data="coursesData" title="More Courses Like This" />
  </div>
</template>
