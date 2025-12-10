<script setup lang="ts">
const { logout, user, profile } = useAuth()
const { t } = useI18n()

interface ProfileOption {
  title: string
  options: {
    icon: string
    name: string
    link?: string
    action?: string
  }[]
}

// Computed profile options based on user type
const profileOptions = computed(() => {
  const baseOptions: ProfileOption[] = [
    {
      title: t('profile.profile'),
      options: [
        // trang học
        { icon: 'solar-book-linear', name: t('profile.learning'), link: '/learning' },
        { icon: 'solar-user-linear', name: t('profile.profile'), link: '/profile?tab=PROFILE' },
        { icon: 'solar-book-bookmark-linear', name: t('profile.myCourses'), link: '/my-course' },
      ],
    },
  ]

  // Add Dashboard option for teachers at the beginning of Profile section
  if (user.value?.is_teacher) {
    baseOptions[0].options.unshift({
      icon: 'solar-chart-square-linear',
      name: t('profile.dashboard'),
      link: '/admin',
    })
  }

  // Add Actions section
  baseOptions.push({
    title: t('profile.actions'),
    options: [
      { icon: 'solar-logout-linear', name: t('profile.logout'), action: 'logout' },
    ],
  })

  return baseOptions
})

async function handleItemClick(item: any) {
  if (item.action === 'logout') {
    await logout()
  }
  else if (item.link) {
    await navigateTo(item.link)
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <BaseAvatar :src="profile?.avatar || ''" size="40px" />
    </PopoverTrigger>
    <PopoverContent class="w-fit border-0 p-3 shadow-none bg-transparent">
      <div class="h-fit border-[1px] bg-shade-1 shadow-none w-[221px] p-0 rounded-[20px]" style="box-shadow: var(--popover-box-shadow);">
        <!-- User Info Section -->
        <div class="p-4 border-b border-shade-3">
          <div class="flex items-center gap-3">
            <a-avatar
              :size="40"
              :src="profile?.avatar"
              class="border-4 border-white shadow-sm"
            >
            {{ profile?.first_name?.charAt(0) }}
          </a-avatar>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-shade-9 truncate">
                {{ profile?.first_name && profile?.last_name ? `${profile.last_name} ${profile.first_name}` : 'User' }}
              </h3>
              <p class="text-xs text-shade-6 truncate">
                {{ profile?.email || '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Options -->
        <div
          v-for="(option, index) in profileOptions" :key="index" :class="{
            'border-b border-shade-3': index < profileOptions.length - 1,
          }"
        >
          <ul class="p-2 pb-2">
            <li
              v-for="(item, itemIndex) in option.options"
              :key="itemIndex"
              class="hover:bg-shade-3 font-medium rounded-[12px] cursor-pointer flex items-center gap-3 p-2"
              @click="handleItemClick(item)"
            >
              <div class="flex items-center justify-center size-6">
                <Icon :name="item.icon" class="text-[20px] text-shade-9" />
              </div>
              <span class="text-sm text-shade-9 hover:text-primary transition-colors">
                {{ item.name }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
