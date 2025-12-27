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
      link: '/my-course',
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
        // { name: t('menu.devices'), link: '/settings/devices' },
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
    // {
    //   name: t('adminMenu.classroom'),
    //   icon: 'i-heroicons-building-office-2',
    //   link: '/admin/classrooms',
    // },
    {
      name: t('adminMenu.quizManagement'),
      icon: 'i-heroicons-clipboard-document-list',
      link: '/admin/quiz-management',
    },
    {
      name: t('adminMenu.newQuizManagement'),
      icon: 'i-heroicons-clipboard-document-list',
      link: '/admin/new-quiz-management',
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
      name: t('adminMenu.videoPosts'),
      icon: 'solar:video-frame-play-vertical-bold',
      link: '/admin/video-posts',
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
