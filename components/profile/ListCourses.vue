<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'
import CustomPagination from '~/components/learning/CustomPagination.vue'
import SearchFilter from '~/components/learning/SearchFilter.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
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
const { user } = useAuth()
const { t } = useI18n()

// Reactive data
const courses = ref<Course[]>([])
const searchQuery = ref('')
const sortBy = ref('relevance')
const currentPage = ref(1)
const loading = ref(false)
const error = ref<string | null>(null)

// Check if user is teacher
const isTeacher = computed(() => user.value?.is_teacher || false)

// Load enrolled courses
async function loadEnrolledCourses() {
  try {
    loading.value = true
    error.value = null
    const response = await courseApi.getEnrolledCourses()
    courses.value = response.results
  }
  catch (err: any) {
    console.error('Error loading enrolled courses:', err)
    error.value = err.message || 'Failed to load enrolled courses'
    message.error('Failed to load enrolled courses')
  }
  finally {
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
      filtered.sort((a, b) => Number.parseFloat(a.effective_price.toString()) - Number.parseFloat(b.effective_price.toString()))
      break
    case 'price-high':
      filtered.sort((a, b) => Number.parseFloat(b.effective_price.toString()) - Number.parseFloat(a.effective_price.toString()))
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

function formatDate(dateString: string) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(timeString: string) {
  if (!timeString)
    return 'N/A'
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

// Load data on mount
onMounted(() => {
  // Only load enrolled courses if user is not a teacher
  if (!isTeacher.value) {
    loadEnrolledCourses()
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Header with title and search/filter -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 m-0 leading-6">
            {{ $t('profile.courses.title') }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ totalCourses }} {{ totalCourses === 1 ? $t('profile.courses.course') : $t('profile.courses.courses') }}
          </p>
        </div>

        <!-- Only show search/filter for non-teachers -->
        <div v-if="!isTeacher" class="w-full sm:w-auto">
          <SearchFilter
            :search-query="searchQuery"
            :sort-by="sortBy"
            @search-change="handleSearchChange"
            @sort-change="handleSortChange"
            @filter-click="handleFilterClick"
          />
        </div>
      </div>

      <!-- Teacher Message -->
      <div v-if="isTeacher" class="text-center py-12">
        <div class="max-w-md mx-auto flex flex-col items-center justify-center">
          <Icon name="solar:graduation-cap-bold-duotone" class="text-blue-500 text-6xl mx-auto mb-6" />
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            {{ $t('profile.courses.teacher.title') }}
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            {{ $t('profile.courses.teacher.message') }}
          </p>
          <a-button
            type="primary"
            size="large"
            class="!h-12 !px-8 !rounded-lg !flex !items-center !gap-2"
            @click="() => navigateTo('/admin/courses')"
          >
            <template #icon>
              <Icon name="solar:settings-bold" size="18" />
            </template>
            {{ $t('profile.courses.teacher.goToDashboard') }}
          </a-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex items-center justify-center py-12">
        <a-spin size="large">
          <div class="text-center">
            <p class="text-gray-600 mt-4">
              {{ $t('profile.courses.loading') }}
            </p>
          </div>
        </a-spin>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ $t('profile.courses.error.title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ error }}
        </p>
        <a-button type="primary" @click="loadEnrolledCourses">
          {{ $t('profile.courses.error.tryAgain') }}
        </a-button>
      </div>

      <!-- Courses Grid -->
      <div v-else class="flex flex-col gap-6">
        <div v-if="paginatedCourses.length === 0" class="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
          <div class="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <Icon name="solar:book-2-bold-duotone" class="text-gray-400 text-4xl" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ $t('profile.courses.empty.title') }}
          </h3>
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            {{ $t('profile.courses.empty.message') }}
          </p>
          <a-button type="primary" size="large" class="!h-12 !px-8 !rounded-lg" @click="() => navigateTo('/learning')">
            <template #icon>
              <Icon name="solar:book-bookmark-bold" size="18" />
            </template>
            {{ $t('profile.courses.empty.browseCourses') }}
          </a-button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <div
            v-for="course in paginatedCourses"
            :key="course.id"
            class="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            @click="() => navigateTo(`/learning/${course.id}`)"
          >
            <!-- Course Image -->
            <div class="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-100">
              <img
                :src="course.thumbnail || '/images/course-thumbnail-default.webp'"
                :alt="course.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                @error="(e) => (e.target as HTMLImageElement).src = '/images/course-thumbnail-default.webp'"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <!-- Progress Badge -->
              <div v-if="course.enrollment" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                <span class="text-xs font-bold text-gray-900">{{ Math.round(course.enrollment.completion_percentage) }}%</span>
              </div>
            </div>

            <!-- Course Info -->
            <div class="p-4 sm:p-5 flex flex-col gap-3">
              <!-- Title and Category -->
              <div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                  {{ course.title }}
                </h3>
                <div class="flex items-center flex-wrap gap-2 mb-3">
                  <span
                    v-if="course.category"
                    class="px-2.5 py-1 text-xs font-medium rounded-full"
                    :style="{
                      backgroundColor: `${course.category.color}20`,
                      color: course.category.color,
                    }"
                  >
                    {{ course.category.name }}
                  </span>
                  <span class="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {{ $t(`homepage.courses.levels.${course.level}`) || course.level }}
                  </span>
                </div>
              </div>

              <!-- Teacher Info -->
              <div class="flex items-center gap-2.5">
                <a-avatar
                  :size="32"
                  :src="course.teacher?.avatar"
                  class="flex-shrink-0"
                >
                  {{ course.teacher?.full_name?.charAt(0) || 'T' }}
                </a-avatar>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ course.teacher?.full_name || 'Teacher' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ course.teacher?.total_courses || 0 }} {{ $t('profile.courses.courses') }}
                  </p>
                </div>
              </div>

              <!-- Schedule Section -->
              <div v-if="course.classroom?.schedules?.length" class="bg-blue-50 rounded-lg p-3 space-y-1.5">
                <div class="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                  <Icon name="solar:calendar-bold" size="14" />
                  <span>{{ $t('profile.courses.schedule') }}</span>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="schedule in course.classroom.schedules.slice(0, 2)"
                    :key="schedule.id"
                    class="flex items-center gap-1.5 text-xs text-blue-800"
                  >
                    <Icon name="solar:clock-circle-bold" size="12" class="text-blue-600 flex-shrink-0" />
                    <span class="font-medium">{{ schedule.day_display }}</span>
                    <span class="text-blue-600">•</span>
                    <span>{{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}</span>
                  </div>
                  <div v-if="course.classroom.schedules.length > 2" class="text-xs text-blue-600 font-medium pt-1">
                    +{{ course.classroom.schedules.length - 2 }} {{ $t('profile.courses.moreSchedules') }}
                  </div>
                </div>
              </div>

              <!-- Progress Section -->
              <div v-if="course.enrollment" class="space-y-2 pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600 font-medium">{{ $t('profile.courses.progress') }}</span>
                  <span class="font-bold text-gray-900">{{ Math.round(course.enrollment.completion_percentage) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="{
                      'bg-gradient-to-r from-green-500 to-green-600': course.enrollment.completion_percentage >= 80,
                      'bg-gradient-to-r from-blue-500 to-blue-600': course.enrollment.completion_percentage >= 50 && course.enrollment.completion_percentage < 80,
                      'bg-gradient-to-r from-yellow-500 to-yellow-600': course.enrollment.completion_percentage >= 25 && course.enrollment.completion_percentage < 50,
                      'bg-gradient-to-r from-red-500 to-red-600': course.enrollment.completion_percentage < 25,
                    }"
                    :style="{ width: `${course.enrollment.completion_percentage}%` }"
                  />
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="capitalize">{{ course.enrollment.progress_status }}</span>
                  <span>{{ formatDate(course.enrollment.enrolled_at) }}</span>
                </div>
              </div>

              <!-- Course Stats -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <Icon name="solar:clock-circle-bold" size="14" class="text-gray-400" />
                    <span>{{ course.duration_hours || '0' }}h</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon name="solar:play-circle-bold" size="14" class="text-gray-400" />
                    <span>{{ course.lessons_count || '0' }}</span>
                  </div>
                  <div v-if="course.rating_average > 0" class="flex items-center gap-1">
                    <Icon name="solar:star-bold" size="14" class="text-yellow-500" />
                    <span>{{ course.rating_average }}</span>
                  </div>
                </div>
              </div>

              <!-- Continue Learning Button -->
              <div v-if="course.enrollment && course.enrollment.completion_percentage > 0 && course.enrollment.completion_percentage < 100" class="pt-2">
                <a-button
                  type="primary"
                  block
                  class="!bg-green-600 hover:!bg-green-700 !border-green-600"
                  @click.stop="() => navigateTo(`/learning/${course.id}`)"
                >
                  <template #icon>
                    <Icon name="solar:play-circle-bold" size="16" />
                  </template>
                  {{ $t('profile.courses.continueLearning') }}
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <!-- <CustomPagination
          v-if="totalPages > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        /> -->
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
