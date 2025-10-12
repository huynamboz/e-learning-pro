<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import CustomPagination from '~/components/learning/CustomPagination.vue'
import SearchFilter from '~/components/learning/SearchFilter.vue'
import {
  calculateTotalPages,
  getPaginatedCourses,
} from '~/resources/learning'

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth', // Yêu cầu đăng nhập
})

const router = useRouter()
const courseApi = useCourseApi()

// Reactive data
const courses = ref<Course[]>([])
const searchQuery = ref('')
const sortBy = ref('relevance')
const currentPage = ref(1)
const loading = ref(false)
const error = ref<string | null>(null)

// Load enrolled courses
const loadEnrolledCourses = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await courseApi.getEnrolledCourses()
    courses.value = response.results
  } catch (err: any) {
    console.error('Error loading enrolled courses:', err)
    error.value = err.message || 'Failed to load enrolled courses'
    message.error('Failed to load enrolled courses')
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredCourses = computed(() => {
  let filtered = [...courses.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(query)
      || course.teacher?.full_name?.toLowerCase().includes(query),
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'alphabetical':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'price-low':
      filtered.sort((a, b) => parseFloat(a.effective_price.toString()) - parseFloat(b.effective_price.toString()))
      break
    case 'price-high':
      filtered.sort((a, b) => parseFloat(b.effective_price.toString()) - parseFloat(a.effective_price.toString()))
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
  message.info('Join course functionality not implemented yet')
  // TODO: Implement join course API call
}

function handleCancelCourse(courseId: string) {
  message.info('Cancel course functionality not implemented yet')
  // TODO: Implement cancel course API call
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

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(timeString: string) {
  if (!timeString) return 'N/A'
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

// Load data on mount
onMounted(() => {
  loadEnrolledCourses()
})
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

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <a-spin size="large">
          <div class="text-center">
            <p class="text-gray-600 mt-4">Loading enrolled courses...</p>
          </div>
        </a-spin>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <a-button type="primary" @click="loadEnrolledCourses">Try Again</a-button>
      </div>

      <!-- Courses Grid -->
      <div v-else class="flex flex-col gap-10">
        <div v-if="paginatedCourses.length === 0" class="text-center py-12">
          <Icon name="solar:book-2-bold-duotone" class="text-gray-300 text-4xl mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h3>
          <p class="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
          <a-button type="primary" @click="() => navigateTo('/learning')">
            Browse Courses
          </a-button>
        </div>

        <div v-else class="courses-grid grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 w-full">
          <div
            v-for="course in paginatedCourses"
            :key="course.id"
            class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            @click="() => navigateTo(`/learning/${course.id}`)"
          >
            <!-- Course Image -->
            <div class="w-full h-48 rounded-xl overflow-hidden mb-4">
              <img 
                :src="course.thumbnail" 
                :alt="course.title" 
                class="w-full h-full object-cover"
                @error="(e) => (e.target as HTMLImageElement).src = '/images/placeholder-course.jpg'"
              >
            </div>

            <!-- Course Info -->
            <div class="flex flex-col gap-3">
              <!-- Title and Category -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {{ course.title }}
                </h3>
                <div class="flex items-center gap-2 mb-2">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :style="{ 
                      backgroundColor: course.category?.color + '20', 
                      color: course.category?.color 
                    }"
                  >
                    {{ course.category?.name }}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {{ course.level }}
                  </span>
                </div>
              </div>

              <!-- Teacher Info -->
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {{ course.teacher?.full_name?.charAt(0) || 'T' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ course.teacher?.full_name || 'Teacher' }}</p>
                  <p class="text-xs text-gray-500">{{ course.teacher?.total_courses || 0 }} courses</p>
                </div>
              </div>

              <!-- Schedule Section -->
              <div v-if="course.classroom?.schedules?.length" class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Icon name="solar:calendar-bold" size="16" />
                  <span>Schedule</span>
                </div>
                <div class="space-y-1">
                  <div 
                    v-for="schedule in course.classroom.schedules" 
                    :key="schedule.id"
                    class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <Icon name="solar:clock-circle-bold" size="14" class="text-gray-500" />
                    <span class="text-sm text-gray-700">
                      {{ schedule.day_display }} {{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Progress Section -->
              <div v-if="course.enrollment" class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Progress</span>
                  <span class="font-medium text-gray-900">{{ Math.round(course.enrollment.completion_percentage) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': course.enrollment.completion_percentage >= 80,
                      'bg-blue-500': course.enrollment.completion_percentage >= 50 && course.enrollment.completion_percentage < 80,
                      'bg-yellow-500': course.enrollment.completion_percentage >= 25 && course.enrollment.completion_percentage < 50,
                      'bg-red-500': course.enrollment.completion_percentage < 25
                    }"
                    :style="{ width: `${course.enrollment.completion_percentage}%` }"
                  />
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ course.enrollment.progress_status }}</span>
                  <span>{{ formatDate(course.enrollment.enrolled_at) }}</span>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <Icon name="solar:clock-circle-bold" size="14" />
                    <span>{{ course.duration_hours }}h</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon name="solar:users-group-rounded-bold" size="14" />
                    <span>{{ course.enrollment_count }}</span>
                  </div>
                  <div v-if="course.rating_average > 0" class="flex items-center gap-1">
                    <Icon name="solar:star-bold" size="14" class="text-yellow-500" />
                    <span>{{ course.rating_average }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">
                    {{ course.classroom?.title || 'Classroom' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
