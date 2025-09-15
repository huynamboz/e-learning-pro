<script setup>
import { Button } from 'ant-design-vue'
</script>

<template>
  <section class="py-8 sm:py-12 lg:py-16">
    <div class="max-w-[1123px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      <!-- Become an Instructor -->
      <div class="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-[150px]">
        <div class="order-2 lg:order-1 flex-shrink-0">
          <img
            src="@/assets/images/home/instructor_1.webp"
            alt="Become an Instructor"
            class="w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[400px] h-auto sm:h-[300px] lg:h-[425px] object-cover rounded-lg mx-auto"
          >
        </div>
        <div class="order-1 lg:order-2 space-y-4 text-center lg:text-left">
          <h2 class="text-lg sm:text-xl font-semibold text-black max-w-full lg:max-w-[549px]">
            Become an Instructor
          </h2>
          <p class="text-sm sm:text-base text-gray-700 max-w-full lg:max-w-[549px]">
            Instructors from around the world teach millions of students on Byway. We provide the tools and skills to teach what you love.
          </p>
          <Button type="primary" class="bg-green-600 border-green-600 w-full sm:w-auto">
            Start Your Instructor Journey
            <Icon name="solar:arrow-right-outline" class="ml-2 text-xl sm:text-2xl" />
          </Button>
        </div>
      </div>

      <!-- Transform your life -->
      <div class="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-[165px]">
        <div class="space-y-4 text-center lg:text-left">
          <h2 class="text-lg sm:text-xl font-semibold text-black max-w-full lg:max-w-[505px]">
            Transform your life through education
          </h2>
          <p class="text-sm sm:text-base text-gray-700 max-w-full lg:max-w-[511px]">
            Learners around the world are launching new careers, advancing in their fields, and enriching their lives.
          </p>
          <Button type="primary" class="bg-green-600 border-green-600 w-full sm:w-auto">
            Checkout Courses
            <Icon name="solar:arrow-right-outline" class="ml-2 text-xl sm:text-2xl" />
          </Button>
        </div>
        <div class="flex-shrink-0">
          <img
            src="@/assets/images/home/instructor_2.webp"
            alt="Transform your life"
            class="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[471px] h-auto sm:h-[280px] lg:h-[385px] object-cover rounded-lg mx-auto"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ant-btn {
  height: 40px;
  border-radius: 8px;
  background-color: #15803D;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

@media (min-width: 640px) {
  .ant-btn {
    height: 48px;
    min-width: 180px;
  }
}
</style>
