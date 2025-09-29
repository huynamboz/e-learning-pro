import type { User, UserRole } from '~/types/auth.type'

export function useAdmin() {
  const { user, isLoggedIn } = useAuth()

  // Check if current user is admin
  const isAdmin = computed(() => {
    return isLoggedIn.value && user.value?.role === 'admin'
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

  // Admin navigation items
  const adminNavItems = computed(() => {
    // if (!isAdmin.value)
    //   return []

    return [
      {
        label: 'Overview',
        icon: 'i-heroicons-chart-bar',
        to: '/admin',
      },
      {
        label: 'Course',
        icon: 'i-heroicons-academic-cap',
        to: '/admin/courses',
      },
      {
        label: 'Classroom',
        icon: 'i-heroicons-building-office-2',
        to: '/admin/classrooms',
      },
      {
        label: 'Students',
        icon: 'i-heroicons-users',
        to: '/admin/users',
      },
      {
        label: 'Orders',
        icon: 'i-heroicons-shopping-cart',
        to: '/admin/orders',
      },
      {
        label: 'Settings',
        icon: 'i-heroicons-cog-6-tooth',
        to: '/admin/settings',
      },
    ]
  })

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
    isAdmin,
    hasRole,
    hasAnyRole,
    isTeacherOrAdmin,
    canManageCourses,
    canAccessAdmin,
    adminNavItems,
    redirectToAdmin,
    redirectToDashboard,
  }
}
