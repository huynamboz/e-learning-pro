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
  const { t } = useI18n()

  const menu = computed<MenuItem[]>(() => [
    {
      name: t('menu.home'),
      icon: 'solar:home-2-bold',
      link: '/learning',
    },
    {
      name: t('menu.myCourses'),
      icon: 'solar:book-bookmark-bold',
      link: '/profile?tab=MY_COURSES',
    },
    {
      name: t('menu.calendars'),
      icon: 'solar:calendar-bold',
      link: '/calendars',
    },
    {
      name: t('menu.settings'),
      icon: 'solar:settings-bold',
      subItems: [
        { name: t('menu.editProfile'), link: '/profile' },
        { name: t('menu.password'), link: '/settings/password' },
      ],
    },
  ])

  const menuAdmin = computed<MenuItem[]>(() => [
    {
      name: t('adminMenu.overview'),
      icon: 'i-heroicons-chart-bar',
      link: '/admin',
    },
    {
      name: t('adminMenu.course'),
      icon: 'i-heroicons-academic-cap',
      link: '/admin/courses',
    },
    {
      name: t('adminMenu.classroom'),
      icon: 'i-heroicons-building-office-2',
      link: '/admin/classrooms',
    },
    {
      name: t('adminMenu.students'),
      icon: 'i-heroicons-users',
      link: '/admin/users',
    },
    {
      name: t('adminMenu.orders'),
      icon: 'i-heroicons-shopping-cart',
      link: '/admin/orders',
    },
    {
      name: t('adminMenu.settings'),
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
