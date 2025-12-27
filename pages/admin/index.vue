<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { ref } from 'vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({
  title: 'Dashboard - Admin Panel',
})

// Use composables
const { getCourses, getAllStudents } = useCourseApi()
const {
  statsCards,
  isLoadingStats,
  statsError,
  fetchDashboardStats,
  refreshDashboardStats,
} = useAdmin()

// Students data
const users = ref<any[]>([])
const isLoadingUsers = ref(false)

function getUserDisplayName(user: any) {
  return `${user.first_name} ${user.last_name}`.trim()
}

// Fetch latest students
async function fetchLatestStudents() {
  try {
    isLoadingUsers.value = true
    const response = await getAllStudents()
    // Get only the first 5 students for dashboard
    users.value = response.results.slice(0, 5)
  }
  catch (error) {
    console.error('Error fetching latest students:', error)
    users.value = []
  }
  finally {
    isLoadingUsers.value = false
  }
}

// Quick actions
const quickActions = computed(() => [
  {
    title: $t('admin.dashboard.quickActions.createCourse'),
    icon: 'i-heroicons-plus-circle',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    to: '/admin/courses/create',
  },
  {
    title: $t('admin.dashboard.quickActions.manageStudents'),
    icon: 'i-heroicons-users',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    to: '/admin/users',
  },
  {
    title: $t('admin.dashboard.quickActions.viewOrders'),
    icon: 'i-heroicons-shopping-bag',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    to: '/admin/orders',
  },
  {
    title: $t('admin.dashboard.quickActions.settings'),
    icon: 'i-heroicons-cog-6-tooth',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
    to: '/admin/settings',
  },
])

// Top courses
const topCourses = ref<any[]>([])
const isLoadingCourses = ref(false)

// Fetch top courses from API
async function fetchTopCourses() {
  try {
    isLoadingCourses.value = true
    const response = await getCourses({
      limit: 3,
    })

    // Transform API data to match CourseCard props
    topCourses.value = response.results.map((course: Course) => ({
      id: course.id.toString(),
      title: course.title,
      category: course.category || { name: 'Uncategorized' },
      teacher: course.teacher || { full_name: 'Unknown Teacher' },
      thumbnail: course.thumbnail,
      level: course.level || 'Beginner',
      duration_hours: course.duration_hours?.toString() || '0',
      price: course.price?.toString() || '0',
      effective_price: course.effective_price || 0,
      has_discount: course.has_discount || false,
      is_free: course.is_free || false,
      is_featured: course.is_featured || false,
      enrollment_count: course.enrollment_count || 0,
      rating_average: course.rating_average?.toString() || '0',
      rating_count: course.rating_count || 0,
      lessons_count: course.lessons_count?.toString() || '0',
      type: 'admin',
    }))
  }
  catch (error) {
    console.error('Error fetching top courses:', error)
    // Fallback to empty array if API fails
    topCourses.value = []
  }
  finally {
    isLoadingCourses.value = false
  }
}

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([
      fetchLatestStudents(),
      fetchTopCourses(),
      fetchDashboardStats(),
    ])
  }
  catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
})
</script>

<template>
  <div class="space-y-6 px-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl !font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {{ $t('admin.dashboard.title') }}
        </h1>
        <p class="mt-2 text-gray-600">
          {{ $t('admin.dashboard.welcome') }}
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Show loading skeleton when no data -->
      <div
        v-for="i in 4"
        v-if="statsCards.length === 0 && isLoadingStats"
        :key="`loading-${i}`"
        class="group relative overflow-hidden rounded-2xl p-6 bg-gray-200 animate-pulse"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 bg-gray-300 rounded-xl" />
            <div class="w-20 h-6 bg-gray-300 rounded-full" />
          </div>
          <div class="space-y-2">
            <div class="w-24 h-4 bg-gray-300 rounded" />
            <div class="w-16 h-8 bg-gray-300 rounded" />
          </div>
        </div>
      </div>

      <!-- Show actual stats cards -->
      <div
        v-for="stat in statsCards"
        :key="stat.title"
        class="group relative overflow-hidden rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/20 hover:scale-[1.03] transition-all duration-300"
        :class="stat.cardBg"
      >
        <!-- Loading State -->
        <div v-if="isLoadingStats" class="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <a-spin size="large" />
        </div>

        <!-- Error State -->
        <div v-if="statsError" class="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
          <div class="text-center text-white">
            <Icon name="i-heroicons-exclamation-triangle" class="w-8 h-8 mx-auto mb-2" />
            <p class="text-sm font-medium">
              Lỗi tải dữ liệu
            </p>
            <a-button size="small" type="primary" ghost class="mt-2" @click="refreshDashboardStats">
              Thử lại
            </a-button>
          </div>
        </div>
        <div class="absolute top-0 right-0 w-40 h-40 opacity-20">
          <div class="w-full h-full rounded-full blur-3xl bg-white" />
        </div>
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <div class="size-10 flex items-center justify-center rounded-xl backdrop-blur-sm" :class="stat.iconBg">
              <Icon :name="stat.icon" class="w-7 h-7" :class="stat.iconColor" />
            </div>
            <span class="inline-flex items-center gap-1 text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Icon name="i-heroicons-arrow-trending-up" class="w-4 h-4" />
              {{ stat.change }}
            </span>
          </div>
          <h3 class="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">
            {{ stat.title }}
          </h3>
          <p class="text-4xl font-black text-white drop-shadow-lg">
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="i-heroicons-bolt-solid" class="w-6 h-6 text-yellow-500" />
        {{ $t('admin.dashboard.quickActions.title') }}
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.title"
          :to="action.to"
          class="group transition-all duration-300 flex flex-col items-center justify-center p-6 rounded-xl hover:scale-105 hover:shadow-lg"
          :class="action.bgColor"
        >
          <div class="size-10 flex items-center justify-center rounded-full mb-3 bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Icon :name="action.icon" class="w-7 h-7" :class="action.color" />
          </div>
          <span class="text-sm font-bold text-white text-center">
            {{ action.title }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Latest Users -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">
          {{ $t('admin.dashboard.latestUsers.title') }}
        </h2>
        <NuxtLink to="/admin/users" class="text-sm font-medium text-blue-600 hover:underline">
          {{ $t('admin.dashboard.latestUsers.viewAll') }}
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingUsers" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div class="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>

      <!-- Users List -->
      <div v-else class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div class="relative">
            <a-avatar
              :size="40"
              class="ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all duration-300"
            >
              {{ getUserDisplayName(user).charAt(0).toUpperCase() }}
            </a-avatar>
            <div
              v-if="user.stats && user.stats.active_courses > 0"
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {{ getUserDisplayName(user) }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user.email }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              @{{ user.username }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500">
              ID: {{ user.id }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <div
                :class="user.stats && user.stats.active_courses > 0 ? 'bg-emerald-500' : 'bg-gray-400'"
                class="w-2 h-2 rounded-full"
              />
              <span
                :class="user.stats && user.stats.active_courses > 0 ? 'text-emerald-600' : 'text-gray-500'"
                class="text-xs font-medium"
              >
                {{ user.stats && user.stats.active_courses > 0 ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {{ user.stats ? `${user.stats.total_courses} courses` : '0 courses' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingUsers && users.length === 0" class="text-center py-8">
        <Icon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">
          {{ $t('admin.dashboard.latestUsers.noUsers') }}
        </p>
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
