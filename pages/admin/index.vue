<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { ref } from 'vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useUsersAdminApi } from '~/composables/api/useUsersAdminApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({
  title: 'Dashboard - Admin Panel',
})

// Use composables
const { users, loading: isLoadingUsers, fetchLatestUsers } = useUsersAdminApi()
const { getCourses } = useCourseApi()

// Format functions
function formatUserDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Vừa xong'
  }
  else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }
  else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ngày trước`
  }
}

function getUserInitials(email: string) {
  return email.split('@')[0].substring(0, 2).toUpperCase()
}

function getUserDisplayName(user: any) {
  const emailPrefix = user.email.split('@')[0]
  return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
}

// Stats data
const statsCards = ref([
  {
    title: 'Tổng học viên',
    value: '12,543',
    change: '+15.3%',
    changeType: 'increase',
    icon: 'i-heroicons-users-solid',
    gradient: 'from-blue-500 to-cyan-500',
    cardBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    title: 'Khóa học hoạt động',
    value: '287',
    change: '+23.1%',
    changeType: 'increase',
    icon: 'i-heroicons-academic-cap-solid',
    gradient: 'from-purple-500 to-pink-500',
    cardBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    title: 'Doanh thu tháng này',
    value: '₫125.4M',
    change: '+18.2%',
    changeType: 'increase',
    icon: 'i-heroicons-currency-dollar-solid',
    gradient: 'from-emerald-500 to-teal-500',
    cardBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    title: 'Tỷ lệ hoàn thành',
    value: '87.5%',
    change: '+5.2%',
    changeType: 'increase',
    icon: 'i-heroicons-chart-bar-solid',
    gradient: 'from-orange-500 to-red-500',
    cardBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
])

// Quick actions
const quickActions = ref([
  {
    title: 'Tạo khóa học',
    icon: 'i-heroicons-plus-circle',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    to: '/admin/courses/create',
  },
  {
    title: 'Quản lý học viên',
    icon: 'i-heroicons-users',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    to: '/admin/students',
  },
  {
    title: 'Xem đơn hàng',
    icon: 'i-heroicons-shopping-bag',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    to: '/admin/orders',
  },
  {
    title: 'Cài đặt',
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
      fetchLatestUsers(5),
      fetchTopCourses(),
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
        <h1 class="text-3xl md:text-4xl !font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Chào mừng trở lại! Đây là tổng quan hiệu suất của bạn hôm nay.
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in statsCards"
        :key="stat.title"
        class="group relative overflow-hidden rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/20 hover:scale-[1.03] transition-all duration-300"
        :class="stat.cardBg"
      >
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
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Icon name="i-heroicons-bolt-solid" class="w-6 h-6 text-yellow-500" />
        Thao tác nhanh
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.title"
          :to="action.to"
          class="group transition-all duration-300 flex flex-col items-center justify-center p-6 rounded-xl hover:scale-105 hover:shadow-lg"
          :class="action.bgColor"
        >
          <div class="size-10 flex items-center items-center justify-center rounded-full mb-3 bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Icon :name="action.icon" class="w-7 h-7" :class="action.color" />
          </div>
          <span class="text-sm font-bold text-white text-center">
            {{ action.title }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Latest Users -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Học viên mới nhất
        </h2>
        <NuxtLink to="/admin/users" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Xem tất cả
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingUsers" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-3">
          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>

      <!-- Users List -->
      <div v-else class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
        >
          <div class="relative">
            <a-avatar
              :size="40"
              class="ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-300"
            >
              {{ getUserInitials(user.email) }}
            </a-avatar>
            <div
              v-if="user.is_active"
              class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ getUserDisplayName(user) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ user.email }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatUserDate(user.date_joined) }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <div
                :class="user.is_active ? 'bg-emerald-500' : 'bg-gray-400'"
                class="w-2 h-2 rounded-full"
              />
              <span
                :class="user.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'"
                class="text-xs font-medium"
              >
                {{ user.is_active ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingUsers && users.length === 0" class="text-center py-8">
        <Icon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          Chưa có học viên nào
        </p>
      </div>
    </div>

    <!-- Top Courses -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          Khóa học hàng đầu
        </h2>
        <NuxtLink to="/admin/courses" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Xem tất cả
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingCourses" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 animate-pulse">
          <div class="h-36 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4" />
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
            <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
            <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
            <div class="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3" />
          </div>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CourseCard
          v-for="course in topCourses"
          :key="course.id"
          v-bind="course"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!isLoadingCourses && topCourses.length === 0" class="text-center py-8">
        <Icon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          Chưa có khóa học nào
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
