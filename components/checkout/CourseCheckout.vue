<script lang="ts" setup>
import type { Course } from '~/types/course.type'

interface Props {
  courseData: Course
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col sm:flex-row items-stretch gap-3 border border-grey-400 rounded-lg p-4 cursor-pointer h-full w-full">
    <div class="w-full sm:w-[192px] self-stretch overflow-hidden rounded-lg">
      <img :src="props.courseData?.thumbnail || '/images/image-default.png'" class="object-cover w-full h-full" alt="main-course">
    </div>
    <div class="flex flex-1 items-center justify-between gap-4">
      <div class="flex gap-3 flex-col flex-1">
        <div class="border border-grey-500 rounded-full p-2 flex items-center justify-center max-w-[250px]">
          {{ props.courseData?.level || 'Beginner' }}
        </div>
        <h2 class="text-lg font-bold !m-0">
          {{ props.courseData?.title }}
        </h2>
        <p class="!m-0 !-mt-2 text-[15px] text-gray-700">
          By {{ props.courseData?.teacher?.full_name || 'Unknown Teacher' }}
        </p>
        <div class="flex items-center gap-2 text-[#334155]">
          <div class="flex items-center gap-1">
            <span class="text-base text-yellow-500 font-medium">{{ parseFloat(props.courseData?.rating_average || '0').toFixed(1) }}</span>
            <Icon name="i-material-symbols-star-rounded" class="text-[16px] text-yellow-500" />
            <span class="text-xs">{{ `(${props.courseData?.rating_count || 0} rating)` }}</span>
          </div>
          <div class="text-[#334155] text-xs">
            |
          </div>
          <p class="!m-0 !p-0 text-xs">
            {{ props.courseData?.duration_hours || '0' }} hours
          </p>
        </div>
        <div class="flex items-center">
          <div class="text-blue-400">
            Save for later
          </div>
          <div class="text-[#334155] text-xs mx-2">
            |
          </div>
          <div class="text-red-400">
            Remove
          </div>
        </div>
      </div>
      <div class="text-2xl font-bold">
        <span v-if="props.courseData?.is_free" class="text-green-600">Free</span>
        <span v-else-if="props.courseData?.has_discount" class="flex flex-col items-end">
          <span class="text-gray-500 line-through text-lg">€{{ Number(props.courseData?.price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          <span class="text-green-600">€{{ Number(props.courseData?.effective_price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </span>
        <span v-else>€{{ Number(props.courseData?.effective_price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
      </div>
    </div>
  </div>
</template>
