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
      name: 'Courses',
      icon: 'fluent:learning-app-24-regular',
      link: '/course',
    },
    {
      name: 'Shop',
      icon: 'famicons:cart',
      link: '/shop',
    },
    {
      name: 'Scheduled',
      icon: 'mingcute:schedule-fill',
      link: '/scheduled',
    },
    {
      name: 'Profile',
      icon: 'solar:user-bold',
      link: '/profile',
    },
    {
      name: 'Settings',
      icon: 'material-symbols:settings-rounded',
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
