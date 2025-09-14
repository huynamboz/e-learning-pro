<script setup>
import { Button } from 'ant-design-vue'
</script>

<template>
  <section class="py-16">
    <div class="max-w-[1123px] mx-auto space-y-16">
      <!-- Become an Instructor -->
      <div class="flex items-center gap-[150px]">
        <img
          src="@/assets/images/home/instructor_1.webp"
          alt="Become an Instructor"
          class="w-[400px] h-[425px] object-cover rounded-lg"
        >
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-black max-w-[549px]">
            Become an Instructor
          </h2>
          <p class="text-gray-700 max-w-[549px]">
            Instructors from around the world teach millions of students on Byway. We provide the tools and skills to teach what you love.
          </p>
          <Button type="primary" class="bg-green-600 border-green-600">
            Start Your Instructor Journey
            <Icon name="solar:arrow-right-outline" class="ml-2 text-2xl" />
          </Button>
        </div>
      </div>

      <!-- Transform your life -->
      <div class="flex items-center gap-[165px]">
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-black max-w-[505px]">
            Transform your life through education
          </h2>
          <p class="text-gray-700 max-w-[511px]">
            Learners around the world are launching new careers, advancing in their fields, and enriching their lives.
          </p>
          <Button type="primary" class="bg-green-600 border-green-600">
            Checkout Courses
            <Icon name="solar:arrow-right-outline" class="ml-2 text-2xl" />
          </Button>
        </div>
        <img
          src="@/assets/images/home/instructor_2.webp"
          alt="Transform your life"
          class="w-[471px] h-[385px] object-cover rounded-lg"
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
.ant-btn {
  height: 48px;
  border-radius: 8px;
  background-color: #15803D;
  display: flex;
  align-items: center;
}
</style>
