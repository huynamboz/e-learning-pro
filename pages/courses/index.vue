<script lang="ts" setup>
import { useCourseApi } from '@/composables/api/useCourseApi'

definePageMeta({
  middleware: 'auth',
  layout: 'auth',
})

const { getCourses } = useCourseApi()

// Search and filter states
const searchQuery = ref('')
const selectedCategory = ref<string>('')
const selectedLevel = ref<string>('')
const selectedPrice = ref<string>('')
const sortBy = ref<string>('popular')

// Pagination
const currentPage = ref(1)
const pageSize = ref(12)

// Fetch courses
const { data: coursesData, pending: loadingCourses, refresh } = await useLazyAsyncData(
  'all-courses',
  async () => {
    try {
      const filters: any = {
        page: currentPage.value,
        limit: pageSize.value,
      }

      if (searchQuery.value)
        filters.search = searchQuery.value
      if (selectedCategory.value && selectedCategory.value !== 'all')
        filters.category = selectedCategory.value
      if (selectedLevel.value)
        filters.level = selectedLevel.value
      if (selectedPrice.value === 'free')
        filters.is_free = true

      const response = await getCourses(filters)
      return response
    }
    catch (error) {
      console.error('Error fetching courses:', error)
      return { results: [], count: 0, next: null, previous: null }
    }
  },
  {
    default: () => ({ results: [], count: 0, next: null, previous: null }),
    watch: [currentPage, searchQuery, selectedCategory, selectedLevel, selectedPrice, sortBy],
  },
)

const courses = computed(() => coursesData.value?.results || [])
const totalCourses = computed(() => coursesData.value?.count || 0)
const totalPages = computed(() => Math.ceil(totalCourses.value / pageSize.value))

// Stats
const stats = computed(() => [
  { icon: 'solar:book-bold', label: 'Total Courses', value: totalCourses.value.toLocaleString(), color: 'from-blue-500 to-blue-600' },
  { icon: 'solar:users-group-rounded-bold', label: 'Active Students', value: '45,283', color: 'from-green-500 to-green-600' },
  { icon: 'solar:star-bold', label: 'Expert Instructors', value: '1,250', color: 'from-yellow-500 to-yellow-600' },
  { icon: 'solar:chat-round-line-bold', label: 'Languages Available', value: '12+', color: 'from-purple-500 to-purple-600' },
])

// Filter options
const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
const priceOptions = [
  { label: 'All Prices', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
]
const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

// Methods
function handleSearch() {
  currentPage.value = 1
  refresh()
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedLevel.value = ''
  selectedPrice.value = ''
  sortBy.value = 'popular'
  currentPage.value = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div class="text-center space-y-4">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
            <Icon name="solar:fire-bold" size="16" />
            <span>Explore Language Courses</span>
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Discover Your Next
            <span class="block bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
              Language Journey
            </span>
          </h1>

          <p class="text-base sm:text-lg text-green-100 max-w-xl mx-auto">
            Master new languages with expert instructors and interactive lessons
          </p>

          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto mt-6">
            <div class="bg-white rounded-xl shadow-lg p-1">
              <div class="flex flex-col sm:flex-row gap-1">
                <div class="flex-1 relative">
                  <Icon name="solar:magnifer-linear" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="20" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search for language courses..."
                    class="w-full pl-12 pr-3 py-3 rounded-lg !text-gray-800 placeholder-gray-400 focus:outline-none text-sm bg-white"
                    @keyup.enter="handleSearch"
                  >
                </div>
                <button
                  class="!flex !items-center !justify-center gap-1 bg-gradient-to-r from-green-500 to-green-600 !text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-sm"
                  @click="handleSearch"
                >
                  <Icon name="solar:magnifer-linear" size="18" class="sm:hidden" />
                  <span class="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all"
          >
            <div :class="`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`">
              <Icon :name="stat.icon" size="24" class="text-white" />
            </div>
            <div class="text-2xl sm:text-3xl font-bold mb-1">
              {{ stat.value }}
            </div>
            <div class="text-sm text-green-100">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Courses -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters Bar -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div class="flex flex-wrap gap-3 flex-1">
            <!-- Level Filter -->
            <select
              v-model="selectedLevel"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">
                All Levels
              </option>
              <option v-for="level in levels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>

            <!-- Price Filter -->
            <select
              v-model="selectedPrice"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option v-for="option in priceOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <!-- Sort -->
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <!-- Clear Filters -->
            <button
              v-if="searchQuery || selectedCategory || selectedLevel || selectedPrice"
              class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              @click="clearFilters"
            >
              Clear All
            </button>
          </div>

          <div class="text-sm text-gray-600">
            <span class="font-semibold">{{ totalCourses }}</span> courses found
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingCourses" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div class="bg-gray-200 h-40 rounded-lg mb-4" />
          <div class="bg-gray-200 h-4 rounded mb-2" />
          <div class="bg-gray-200 h-4 rounded w-2/3 mb-2" />
          <div class="bg-gray-200 h-4 rounded w-1/2" />
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else-if="courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CourseCard
          v-for="course in courses"
          :key="course.id"
          v-bind="course"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-flex p-6 bg-gray-100 rounded-full mb-4">
          <Icon name="solar:box-minimalistic-bold" size="48" class="text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No courses found
        </h3>
        <p class="text-gray-600 mb-6">
          Try adjusting your filters or search query
        </p>
        <button
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 !text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && courses.length > 0" class="mt-8 flex justify-center">
        <div class="flex items-center gap-1 sm:gap-2">
          <button
            :disabled="currentPage === 1"
            class="p-2 rounded-lg transition-all"
            :class="[
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="handlePageChange(currentPage - 1)"
          >
            <Icon name="solar:arrow-left-bold" size="18" />
          </button>

          <div class="flex gap-1 overflow-x-auto max-w-xs sm:max-w-none">
            <button
              v-for="page in totalPages"
              v-show="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              :key="page"
              class="min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 rounded-lg transition-all font-medium text-sm sm:text-base flex-shrink-0"
              :class="[
                currentPage === page
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg transition-all"
            :class="[
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="handlePageChange(currentPage + 1)"
          >
            <Icon name="solar:arrow-right-bold" size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Success Stories Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-12">
        <div class="text-center mb-12">
          <div class="inline-flex p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Icon name="solar:star-bold" size="32" class="text-white" />
          </div>

          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Join 50,000+ Language Learners
          </h2>

          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Start your language journey today and unlock new opportunities with our proven learning methods
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="text-center">
            <div class="inline-flex p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4">
              <Icon name="solar:users-group-rounded-bold" size="32" class="text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              Interactive Learning
            </h3>
            <p class="text-gray-600">
              Practice with native speakers and AI-powered conversations
            </p>
          </div>

          <div class="text-center">
            <div class="inline-flex p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4">
              <Icon name="solar:medal-star-bold" size="32" class="text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              Certified Progress
            </h3>
            <p class="text-gray-600">
              Earn certificates and track your fluency improvement
            </p>
          </div>

          <div class="text-center">
            <div class="inline-flex p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-4">
              <Icon name="solar:clock-circle-bold" size="32" class="text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              Flexible Schedule
            </h3>
            <p class="text-gray-600">
              Learn at your own pace, anytime, anywhere
            </p>
          </div>
        </div>

        <div class="text-center">
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 !text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-xl">
              Start Learning Now
            </button>
            <button class="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-lg">
              View Success Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
