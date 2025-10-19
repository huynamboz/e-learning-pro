<script lang="ts" setup>
import type { Course } from '~/types/course.type'

interface Props {
  courseData: Course
}

defineProps<Props>()
const { t } = useI18n()

function getLevelText(level: string): string {
  const levelMap: Record<string, string> = {
    beginner: t('descriptionCourse.levels.beginner'),
    intermediate: t('descriptionCourse.levels.intermediate'),
    advanced: t('descriptionCourse.levels.advanced'),
  }
  return levelMap[level] || level
}
</script>

<template>
  <div class="flex flex-col">
    <div class="realtive flex flex-col gap-4 items-start p-8">
      <!-- <div class="absolute top-0 left-0 w-full bg-[#F8FAFC] p-8">
        
      </div> -->
      <h1 class="text-4xl font-extrabold text-black">
        {{ courseData?.title }}
      </h1>
      <p class="text-[#334155] leading-[24px]">
        {{ courseData?.short_description }}
      </p>
      <div class="flex items-center flex-wrap gap-2 text-[#334155]">
        <div class="flex items-center gap-2">
          <p class="!m-0">
            {{ parseFloat(courseData?.duration_hours) }} {{ t('descriptionCourse.hours') }}.
          </p>
          <p class="!m-0">
            {{ parseFloat(courseData?.lessons_count) }} {{ t('descriptionCourse.lessons') }}.
          </p>
          <p class="!m-0">
            {{ courseData?.level }}
          </p>
        </div>
      </div>
      <div class="flex flex-col gap-5 mt-3">
        <div class="flex items-center gap-3">
          <img :src="courseData?.teacher?.avatar" class="rounded-full w-10 h-10 object-cover" alt="avatar-teacher">
          <p class="!p-0 !m-0">
            Created by <span class="text-[#49ba61]">{{ courseData?.teacher?.full_name || 'Unknown Teacher' }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="mx-8 line border-1 border-[#E2E8F0] my-10" />
    <div class="px-8 flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <h1 class="font-bold text-2xl !mb-0">
          {{ $t('descriptionCourse.description') }}
        </h1>
        <p class="text-[14px] text-gray-700 leading-[24px] !mb-0" v-html="courseData?.description" />
      </div>
      <!-- <div class="flex flex-col gap-1">
        <h1 class="font-bold text-2xl !mb-0">
          Who This Course Is For
        </h1>
        <p class="text-[14px] text-gray-700 leading-[24px] !mb-0">
          This beginner-friendly course is designed for anyone who wants to start learning Italian from scratch. Through interactive lessons, practical exercises, and real-life conversations, you’ll gain the confidence to understand and speak Italian in everyday situations.
          By the end of this course, you will be able to introduce yourself, ask basic questions, order food, navigate travel situations, and build a foundation for further Italian learning.
        </p>
      </div> -->
    </div>

    <div class="mx-8 line border-1 border-[#E2E8F0] my-10" />

    <div class="px-8 flex flex-col gap-3">
      <h1 class="font-bold text-2xl !mb-0">
        {{ $t('descriptionCourse.instructor') }}
      </h1>
      <div class="flex flex-col gap-1">
        <h3 class="text-xl font-bold text-[#49ba61] !m-0">
          {{ courseData?.teacher?.full_name || 'Unknown Teacher' }}
        </h3>
        <p class="!m-0">
          {{ $t('descriptionCourse.instructor') }}
        </p>
      </div>
      <div class="flex items-center flex-wrap gap-4 mt-5">
        <img :src="courseData?.teacher?.avatar" class="rounded-full w-40 h-40 object-cover" alt="avatar-teacher">
        <div class="flex flex-col gap-2 text-gray-900">
          <div class="flex items-center gap-2">
            <Icon name="i-ph-student-fill" class="text-[24px] text-gray-700" />
            <span>{{ courseData?.teacher?.total_students || 0 }} {{ $t('descriptionCourse.students') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="i-material-symbols-play-arrow-outline-rounded" class="text-[24px] text-gray-700" />
            <span>{{ courseData?.teacher?.total_courses || 0 }} {{ $t('descriptionCourse.lessons') }}</span>
          </div>
        </div>
      </div>
      <p class="!mb-0 leading-[24px] text-gray-700 text-[14px]">
        Experienced instructor with {{ courseData?.teacher?.total_courses || 0 }} courses and {{ courseData?.teacher?.total_students || 0 }} students.
      </p>
    </div>

    <div class="mx-8 line border-1 border-[#E2E8F0] my-10" />

    <div class="px-8 flex flex-col gap-3">
      <h1 class="font-bold text-2xl !mb-0">
        {{ $t('descriptionCourse.curriculum') }}
      </h1>
      <CourseSyllabusCourse :syllabus-data="courseData?.chapters" />
    </div>
  </div>
</template>
