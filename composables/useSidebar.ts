export interface SubMenuItem {
  name: string
  link: string
}

export interface MenuItem {
  name: string
  icon: string
  link?: string
  subItems?: SubMenuItem[]
}

const globalSidebarState = {
  isCollapsed: ref(false),
  _initialized: false,
}

export function useSidebar() {
  const { isCollapsed } = globalSidebarState
  const menu = ref<MenuItem[]>([
    {
      name: 'Home',
      icon: 'solar:home-2-bold',
      link: '/learning',
    },
    {
      name: 'My Courses',
      icon: 'solar:book-bookmark-bold',
      link: '/profile?tab=MY_COURSES',
    },
    {
      name: 'Calendars',
      icon: 'solar:calendar-bold',
      link: '/calendars',
    },
    {
      name: 'Settings',
      icon: 'solar:settings-bold',
      subItems: [
        { name: 'Edit Profile', link: '/settings/general' },
        { name: 'Language', link: '/settings/language' },
        { name: 'Notifications', link: '/settings/notifications' },
        { name: 'Password', link: '/settings/password' },
      ],
    },
  ])

  const menuAdmin = ref<MenuItem[]>([
    {
      name: 'Overview',
      icon: 'i-heroicons-chart-bar',
      link: '/admin',
    },
    {
      name: 'Course',
      icon: 'i-heroicons-academic-cap',
      link: '/admin/courses',
    },
    {
      name: 'Classroom',
      icon: 'i-heroicons-building-office-2',
      link: '/admin/classrooms',
    },
    {
      name: 'Students',
      icon: 'i-heroicons-users',
      link: '/admin/users',
    },
    {
      name: 'Orders',
      icon: 'i-heroicons-shopping-cart',
      link: '/admin/orders',
    },
    {
      name: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      link: '/admin/settings',
    },
  ])

  function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
  }

  function collapseSidebar() {
    isCollapsed.value = true
  }

  function expandSidebar() {
    isCollapsed.value = false
  }

  return {
    isCollapsed,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    menu,
    menuAdmin,
  }
}
