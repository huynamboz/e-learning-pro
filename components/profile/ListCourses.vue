<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { message } from 'ant-design-vue'
import CourseCard from '~/components/learning/CourseCard.vue'

interface Props {
  courses: Course[]
}

const props = defineProps<Props>()

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const router = useRouter()

const totalCourses = computed(() => props.courses.length)
function handleJoinCourse(courseId: string) {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    course.enrolled = true
    course.progress = 0
    course.schedule = [
      { id: `s${courseId}_1`, text: 'Monday (8:30pm-9pm)' },
      { id: `s${courseId}_2`, text: 'Thursday (8:30pm-9pm)' },
    ]
    message.success(`Successfully joined "${course.title}"!`)
  }
}

function handleCancelCourse(courseId: string) {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    course.enrolled = false
    course.progress = undefined
    course.schedule = undefined
    message.warning(`Cancelled "${course.title}"`)
  }
}

</script>

<template>
  <div class="bg-white p-6 w-full">
    <!-- Header with title and search/filter -->
    <div class="flex flex-col gap-4 mb-6">
      <h4 class="text-xl font-semibold text-gray-900 m-0 leading-6">
        My Courses ({{ totalCourses }})
      </h4>
    </div>
    <div class="flex flex-col gap-10">
      <div class="courses-grid grid grid-cols-[repeat(auto-fill,minmax(298px,1fr))] gap-6 w-full">
        <CourseCard
          v-for="course in courses"
          :key="course?.id"
          :course="course"
          @join-course="handleJoinCourse"
          @cancel-course="handleCancelCourse"
        />
      </div>
    </div>
  </div>
</template>
