<script lang="ts" setup>
import {
  detailCourseData,
} from '~/resources/course'

const detailCourse = ref(detailCourseData)
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-4 items-start bg-[#F8FAFC]">
      <h1 class="text-4xl font-extrabold text-black">
        {{ detailCourse?.title }}
      </h1>
      <p class="text-[#334155] leading-[24px]">
        {{ detailCourse?.description }}
      </p>
      <div class="flex items-center gap-2 text-[#334155]">
        <div class="flex items-center gap-1">
          <span class="text-base text-yellow-500 font-medium">{{ detailCourse?.rating }}</span>
          <Icon name="i-material-symbols-star-rounded" class="text-[16px] text-yellow-500" />
          <span>{{ `(${detailCourse?.countRating} rating)` }}</span>
        </div>
        <div class="text-[#334155]">
          |
        </div>
        <p class="!m-0 !p-0">
          {{ detailCourse?.details }}
        </p>
      </div>
      <div class="flex flex-col gap-5 mt-3">
        <div class="flex items-center gap-3">
          <img :src="detailCourse?.teacher?.avatar" class="rounded-full w-10 h-10" alt="avatar-teacher">
          <p class="!p-0 !m-0">
            Created by <span class="text-[#49ba61]">{{ detailCourse?.teacher?.fullName }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="i-tabler-world" class="text-[20px] text-gray-700" />
          <div class="flex items-center gap-2 text-gray-700">
            <span v-for="value in detailCourse?.teacher?.langeuages" :key="value" class="">
              {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="line border-1 border-[#E2E8F0] my-10" />
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <h1 class="font-bold text-2xl !mb-0">
          Course Description
        </h1>
        <p class="text-[14px] text-gray-700 leading-[24px] !mb-0">
          This beginner-friendly course is designed for anyone who wants to start learning Italian from scratch. Through interactive lessons, practical exercises, and real-life conversations, you’ll gain the confidence to understand and speak Italian in everyday situations.
          By the end of this course, you will be able to introduce yourself, ask basic questions, order food, navigate travel situations, and build a foundation for further Italian learning.
        </p>
      </div>
      <div class="flex flex-col gap-1">
        <h1 class="font-bold text-2xl !mb-0">
          Who This Course Is For
        </h1>
        <p class="text-[14px] text-gray-700 leading-[24px] !mb-0">
          This beginner-friendly course is designed for anyone who wants to start learning Italian from scratch. Through interactive lessons, practical exercises, and real-life conversations, you’ll gain the confidence to understand and speak Italian in everyday situations.
          By the end of this course, you will be able to introduce yourself, ask basic questions, order food, navigate travel situations, and build a foundation for further Italian learning.
        </p>
      </div>
    </div>

    <div class="line border-1 border-[#E2E8F0] my-10" />

    <div class="flex flex-col gap-3">
      <h1 class="font-bold text-2xl !mb-0">
        Instructor
      </h1>
      <div class="flex flex-col gap-1">
        <h3 class="text-xl font-bold text-[#49ba61] !m-0">
          {{ detailCourse?.teacher?.fullName }}
        </h3>
        <p class="!m-0">
          {{ detailCourse?.teacher?.job }}
        </p>
      </div>
      <div class="flex items-center gap-4 mt-5">
        <img :src="detailCourse?.teacher?.avatar" class="w-40 h-40 rounded-full" alt="avatar-image">
        <div class="flex flex-col gap-2 text-gray-900">
          <div class="flex items-center gap-2">
            <Icon name="i-mingcute-certificate-line" class="text-[24px] text-gray-700" />
            <span>{{ detailCourse?.countRating }} Reviews</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="i-ph-student-fill" class="text-[24px] text-gray-700" />
            <span>{{ detailCourse?.countStudent }} Students</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="i-material-symbols-play-arrow-outline-rounded" class="text-[24px] text-gray-700" />
            <span>{{ detailCourse?.countCourse }} Courses</span>
          </div>
        </div>
      </div>
      <p class="!mb-0 leading-[24px] text-gray-700 text-[14px]">
        {{ detailCourse?.teacher.description }}
      </p>
    </div>

    <div class="line border-1 border-[#E2E8F0] my-10" />

    <div class="flex flex-col gap-3">
      <h1 class="font-bold text-2xl !mb-0">
        Syllabus
      </h1>
      <CourseSyllabusCourse :syllabus-data="detailCourse?.syllabus" />
    </div>
  </div>
</template>
