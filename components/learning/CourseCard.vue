<script setup lang="ts">
import { ClockCircleOutlined } from '@ant-design/icons-vue'
import type { Course } from '~/composables/api'


interface Props {
  course: Course
  hideActions?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  joinCourse: [courseId: string]
  cancelCourse: [courseId: string]
}>()

function handleJoinCourse() {
  emit('joinCourse', props.course.id)
}

function handleCancelCourse() {
  emit('cancelCourse', props.course.id)
}
</script>

<template>
  <NuxtLink
    :to="`/learning/${course.id}`"
    class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2 w-full
           transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="w-full h-[139px] rounded-lg overflow-hidden mb-2">
      <img :src="course.thumbnail" :alt="course.title" class="w-full h-full object-cover">
    </div>

    <div class="flex flex-col gap-2 flex-1">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-col gap-1.5">
          <h5 class="text-lg font-semibold text-gray-900 m-0 leading-[1.6] line-clamp-2">
            {{ course.title }}
          </h5>
          <p class="text-sm font-normal text-gray-600 m-0 leading-6">
            {{ course.instructor }}
          </p>
        </div>

        <!-- Progress bar - chỉ hiện khi enrolled -->
        <div v-if="course.enrolled && course.progress !== undefined" class="my-2">
          <div class="relative w-full h-0.5 rounded-full overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full bg-blue-100 rounded-full" />
            <div
              class="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-300"
              :style="{ width: `${course.progress}%` }"
            />
          </div>
        </div>

        <!-- Schedule - chỉ hiện khi enrolled -->
        <div v-if="course.enrolled && course.schedule" class="flex flex-col gap-2">
          <div
            v-for="schedule in course.schedule"
            :key="schedule.id"
            class="flex items-center py-2 px-2 bg-white border border-gray-300 rounded-xl gap-2"
          >
            <ClockCircleOutlined class="text-black/80 text-xs" />
            <span class="text-xs font-normal text-black leading-[1.21] tracking-[-0.01em]">{{ schedule.text }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="!hideActions" class="mt-2">
        <a-button
          v-if="!course.enrolled"
          type="primary"
          class="w-full h-12 rounded-lg text-sm font-medium flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          @click="handleJoinCourse"
        >
          Join now
        </a-button>

        <a-button
          v-if="course.enrolled"
          danger
          class="w-full h-12 rounded-lg text-sm font-medium flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="handleCancelCourse"
        >
          Cancel Course
        </a-button>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.ant-btn {
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.ant-btn-primary {
    background-color: #15803D;
    color: #fff;
}
.ant-btn-dangerous {
    background-color: #FEE2E2;
    color: #DC2626;
    border: none;
}
</style>
