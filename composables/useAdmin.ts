import { useApiClient } from '~/api/apiClient'
import type { UserRole } from '~/types/auth.type'

// Types for dashboard stats
export interface DashboardStats {
  total_students: {
    value: number
    growth: number
  }
  active_courses: {
    value: number
    growth: number
  }
  monthly_revenue: {
    value: number
    growth: number
  }
  completion_rate: {
    value: number
    growth: number
  }
}

export interface StatsCard {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: string
  gradient: string
  cardBg: string
  iconBg: string
  iconColor: string
}

export function useAdmin() {
  const { user, isLoggedIn } = useAuth()
  const apiClient = useApiClient()

  // Dashboard stats data
  const dashboardStats = ref<DashboardStats>({
    total_students: { value: 0, growth: 0 },
    active_courses: { value: 0, growth: 0 },
    monthly_revenue: { value: 0, growth: 0 },
    completion_rate: { value: 0, growth: 0 },
  })

  const isLoadingStats = ref(false)
  const statsError = ref<string | null>(null)

  // Check if current user is admin
  const isAdmin = computed(() => {
    return isLoggedIn.value && user.value?.is_teacher
  })

  // Check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return isLoggedIn.value && user.value?.role === role
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return isLoggedIn.value && user.value?.role ? roles.includes(user.value.role) : false
  }

  // Check if user is teacher or admin
  const isTeacherOrAdmin = computed(() => {
    return hasAnyRole(['teacher', 'admin'])
  })

  // Check if user can manage courses (teacher or admin)
  const canManageCourses = computed(() => {
    return isTeacherOrAdmin.value
  })

  // Check if user can access admin panel
  const canAccessAdmin = computed(() => {
    return isAdmin.value
  })

  // Format growth percentage
  function formatGrowth(growth: number): string {
    if (growth === 0)
      return '0%'
    return growth > 0 ? `+${growth}%` : `${growth}%`
  }

  // Format values based on type
  function formatValue(key: string, value: number): string {
    switch (key) {
      case 'total_students':
        return value.toLocaleString()
      case 'active_courses':
        return value.toLocaleString()
      case 'monthly_revenue':
        return `$${value.toLocaleString()}`
      case 'completion_rate':
        return `${(value * 100).toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  // Get change type based on growth
  function getChangeType(growth: number): 'increase' | 'decrease' | 'neutral' {
    if (growth > 0)
      return 'increase'
    if (growth < 0)
      return 'decrease'
    return 'neutral'
  }

  // Fetch dashboard stats from API
  async function fetchDashboardStats(): Promise<void> {
    try {
      isLoadingStats.value = true
      statsError.value = null
      const response = await apiClient.get('/system/dashboard/summary/')
      dashboardStats.value = response
    }
    catch (error: any) {
      console.error('Error fetching dashboard stats:', error)
      statsError.value = error.message || 'Failed to fetch dashboard statistics'
    }
    finally {
      isLoadingStats.value = false
    }
  }

  // Generate stats cards from dashboard data
  const statsCards = computed<StatsCard[]>(() => [
      {
        title: 'Tổng học viên',
        value: formatValue('total_students', dashboardStats.value.total_students.value),
        change: formatGrowth(dashboardStats.value.total_students.growth),
        changeType: getChangeType(dashboardStats.value.total_students.growth),
        icon: 'i-heroicons-users-solid',
        gradient: 'from-blue-500 to-cyan-500',
        cardBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
      },
      {
        title: 'Khóa học hoạt động',
        value: formatValue('active_courses', dashboardStats.value.active_courses.value),
        change: formatGrowth(dashboardStats.value.active_courses.growth),
        changeType: getChangeType(dashboardStats.value.active_courses.growth),
        icon: 'i-heroicons-academic-cap-solid',
        gradient: 'from-purple-500 to-pink-500',
        cardBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
      },
      {
        title: 'Doanh thu tháng',
        value: formatValue('monthly_revenue', dashboardStats.value.monthly_revenue.value),
        change: formatGrowth(dashboardStats.value.monthly_revenue.growth),
        changeType: getChangeType(dashboardStats.value.monthly_revenue.growth),
        icon: 'i-heroicons-currency-dollar-solid',
        gradient: 'from-emerald-500 to-teal-500',
        cardBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
      },
      {
        title: 'Tỷ lệ hoàn thành',
        value: formatValue('completion_rate', dashboardStats.value.completion_rate.value),
        change: formatGrowth(dashboardStats.value.completion_rate.growth),
        changeType: getChangeType(dashboardStats.value.completion_rate.growth),
        icon: 'i-heroicons-chart-bar-solid',
        gradient: 'from-orange-500 to-red-500',
        cardBg: 'bg-gradient-to-br from-orange-500 to-red-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
      },
  ])

  // Refresh dashboard stats
  async function refreshDashboardStats(): Promise<void> {
    await fetchDashboardStats()
  }

  // Redirect to admin dashboard if user is admin
  const redirectToAdmin = () => {
    if (isAdmin.value) {
      return navigateTo('/admin')
    }
  }

  // Redirect to appropriate dashboard based on role
  const redirectToDashboard = () => {
    if (!isLoggedIn.value) {
      return navigateTo('/auth/login')
    }

    switch (user.value?.role) {
      case 'admin':
        return navigateTo('/admin')
      case 'teacher':
        return navigateTo('/profile')
      default:
        return navigateTo('/')
    }
  }

  return {
    // Role and permission checks
    isAdmin,
    hasRole,
    hasAnyRole,
    isTeacherOrAdmin,
    canManageCourses,
    canAccessAdmin,

    // Dashboard stats
    dashboardStats: readonly(dashboardStats),
    statsCards,
    isLoadingStats: readonly(isLoadingStats),
    statsError: readonly(statsError),

    // Functions
    fetchDashboardStats,
    refreshDashboardStats,
    formatGrowth,
    formatValue,
    getChangeType,
    redirectToAdmin,
    redirectToDashboard,
  }
}
