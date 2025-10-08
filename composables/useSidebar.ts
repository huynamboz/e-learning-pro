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
      link: '/profile',
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
  }
}
