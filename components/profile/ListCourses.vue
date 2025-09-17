<script setup lang="ts">
import type { Course } from '~/types/learning.type'
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import CourseCard from '~/components/learning/CourseCard.vue'
import CustomPagination from '~/components/learning/CustomPagination.vue'
import SearchFilter from '~/components/learning/SearchFilter.vue'
import {
  calculateTotalPages,
  getPaginatedCourses,
  mockCourses,
} from '~/resources/learning'

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth', // Yêu cầu đăng nhập
})

const router = useRouter()

// Reactive data
const courses = ref<Course[]>(mockCourses)
const searchQuery = ref('')
const sortBy = ref('relevance')
const currentPage = ref(1)

// Computed properties
const filteredCourses = computed(() => {
  let filtered = [...courses.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(query)
      || course.instructor.toLowerCase().includes(query),
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      // For demo purposes, reverse order
      filtered = filtered.reverse()
      break
    case 'alphabetical':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'price-low':
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
      break
    case 'price-high':
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    default:
      // relevance - keep original order
      break
  }

  return filtered
})

const totalCourses = computed(() => filteredCourses.value.length)
const totalPages = computed(() => calculateTotalPages(filteredCourses.value.length))
const paginatedCourses = computed(() =>
  getPaginatedCourses(filteredCourses.value, currentPage.value),
)

function handleSearchChange(query: string) {
  searchQuery.value = query
  currentPage.value = 1 // Reset to first page
}

function handleSortChange(sort: string) {
  sortBy.value = sort
  currentPage.value = 1 // Reset to first page
}

function handleFilterClick() {
  message.info('Filter options clicked (not implemented)')
}

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

function handlePageChange(page: number) {
  currentPage.value = page
  router.push({ query: { page } })
  // Scroll to top of courses section
  document.querySelector('.courses-grid')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div class="bg-white p-6 w-full">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Header with title and search/filter -->
      <div class="flex flex-col gap-4">
        <h4 class="text-xl font-semibold text-gray-900 m-0 leading-6">
          Courses ({{ totalCourses }})
        </h4>

        <SearchFilter
          :search-query="searchQuery"
          :sort-by="sortBy"
          @search-change="handleSearchChange"
          @sort-change="handleSortChange"
          @filter-click="handleFilterClick"
        />
      </div>

      <!-- Courses Grid -->
      <div class="flex flex-col gap-10">
        <div class="courses-grid grid grid-cols-[repeat(auto-fill,minmax(298px,1fr))] gap-6 w-full">
          <CourseCard
            v-for="course in paginatedCourses"
            :key="course.id"
            :course="course"
            @join-course="handleJoinCourse"
            @cancel-course="handleCancelCourse"
          />
        </div>

        <!-- Pagination -->
        <CustomPagination
          v-if="totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
