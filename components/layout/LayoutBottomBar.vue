<script setup lang="ts">
const route = useRoute()
const { isLoggedIn } = useAuth()
const { menu } = useSidebar()
const { t } = useI18n()
const cartStore = useCartStore()

// Settings submenu state
const showSettingsMenu = ref(false)

// Get settings menu items
const settingsMenu = computed(() => {
  const settingsItem = menu.value.find(item => item.name === t('menu.settings'))
  return settingsItem?.subItems || []
})

// Type definition for bottom bar items
type BottomBarItem
  = | {
    name: string
    icon: string
    link: string
    type: 'link'
    badge?: number
  }
  | {
    name: string
    icon: string
    link: string
    type: 'menu'
  }

// Bottom bar items for logged in users
const bottomBarItems = computed<BottomBarItem[]>(() => {
  const items: BottomBarItem[] = [
    {
      name: t('menu.home'),
      icon: 'solar:home-2-bold',
      link: '/learning',
      type: 'link',
    },
    {
      name: t('menu.myCourses'),
      icon: 'solar:book-bookmark-bold',
      link: '/my-course',
      type: 'link',
    },
    {
      name: t('menu.calendars'),
      icon: 'solar:calendar-bold',
      link: '/calendars',
      type: 'link',
    },
  ]

  // Add Settings for logged in users
  if (isLoggedIn.value) {
    items.push({
      name: t('menu.settings'),
      icon: 'solar:settings-bold',
      link: '#',
      type: 'menu',
    })
  }
  else {
    // Add Cart for guest users
    items.push({
      name: t('layoutAuthHeader.navigation.cart'),
      icon: 'solar:bag-heart-bold',
      link: '/checkout',
      type: 'link',
      badge: cartStore.totalItems > 0 ? cartStore.totalItems : undefined,
    })
  }

  return items
})

// Check if link is active
function isActive(link: string) {
  if (link === '/learning') {
    return route.path === '/learning'
  }
  if (link === '/my-course') {
    return route.path === '/my-course'
  }
  if (link.includes('?tab=')) {
    const [path, query] = link.split('?')
    return route.path === path && route.query.tab === query.split('=')[1]
  }
  if (link === '#') {
    return false
  }
  return route.path.startsWith(link)
}

// Handle settings menu item click
function handleSettingsItemClick(item: any) {
  showSettingsMenu.value = false
  if (item.link) {
    navigateTo(item.link)
  }
}

// Close settings menu when clicking outside
function closeSettingsMenu() {
  showSettingsMenu.value = false
}

// Get icon for settings submenu item
function getSettingsIcon(name: string) {
  if (name === t('menu.editProfile')) {
    return 'solar:user-bold'
  }
  if (name === t('menu.password')) {
    return 'solar:lock-password-bold'
  }
  if (name === t('menu.devices')) {
    return 'solar:devices-bold'
  }
  return 'solar:settings-bold'
}

// Watch for route changes to close menu
watch(() => route.path, () => {
  showSettingsMenu.value = false
})
</script>

<template>
  <!-- Bottom Navigation Bar - Only visible on mobile -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
    <div class="grid grid-cols-4 h-16 relative">
      <template v-for="item in bottomBarItems" :key="item.name">
        <!-- Regular Link Item -->
        <NuxtLink
          v-if="item.type === 'link'"
          :to="item.link"
          class="flex flex-col items-center justify-center gap-1 transition-all duration-200 relative group"
          :class="[
            isActive(item.link)
              ? 'text-green-600'
              : 'text-gray-600 dark:text-gray-400',
          ]"
        >
          <!-- Active indicator -->
          <div
            v-if="isActive(item.link)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-b-full"
          />

          <!-- Icon with background -->
          <div
            class="relative flex items-center justify-center transition-all duration-200"
            :class="[
              isActive(item.link)
                ? 'scale-110'
                : 'scale-100 group-hover:scale-105',
            ]"
          >
            <div
              v-if="isActive(item.link)"
              class="absolute inset-0 rounded-full scale-150 animate-pulse"
            />
            <Icon
              :name="item.icon"
              size="24"
              :class="[
                isActive(item.link)
                  ? 'text-green-600'
                  : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200',
              ]"
            />
            <!-- Badge for cart -->
            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
            >
              {{ item.badge }}
            </span>
          </div>

          <!-- Label -->
          <span
            class="text-xs font-medium transition-all duration-200"
            :class="[
              isActive(item.link)
                ? 'text-green-600 font-semibold'
                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200',
            ]"
          >
            {{ item.name }}
          </span>
        </NuxtLink>

        <!-- Settings Menu Item -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-1 transition-all duration-200 relative"
        >
          <button
            class="flex flex-col items-center justify-center gap-1 w-full h-full"
            :class="[
              showSettingsMenu
                ? 'text-green-600'
                : 'text-gray-600 dark:text-gray-400',
            ]"
            @click="showSettingsMenu = !showSettingsMenu"
          >
            <!-- Active indicator -->
            <div
              v-if="showSettingsMenu"
              class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-b-full"
            />

            <!-- Icon -->
            <div
              class="relative flex items-center justify-center transition-all duration-200"
              :class="[
                showSettingsMenu
                  ? 'scale-110'
                  : 'scale-100',
              ]"
            >
              <Icon
                :name="item.icon"
                size="24"
                :class="[
                  showSettingsMenu
                    ? 'text-green-600'
                    : 'text-gray-600 dark:text-gray-400',
                ]"
              />
            </div>

            <!-- Label -->
            <span
              class="text-xs font-medium transition-all duration-200"
              :class="[
                showSettingsMenu
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-600 dark:text-gray-400',
              ]"
            >
              {{ item.name }}
            </span>
          </button>

          <!-- Settings Dropdown Menu -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 transform translate-y-2"
            enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 transform translate-y-0"
            leave-to-class="opacity-0 transform translate-y-2"
          >
            <div
              v-if="showSettingsMenu"
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            >
              <button
                v-for="subItem in settingsMenu"
                :key="subItem.link"
                class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                @click="handleSettingsItemClick(subItem)"
              >
                <Icon
                  :name="getSettingsIcon(subItem.name)"
                  size="18"
                  class="text-gray-500"
                />
                <span>{{ subItem.name }}</span>
              </button>
            </div>
          </Transition>
        </div>
      </template>
    </div>

    <!-- Overlay to close settings menu when clicking outside -->
    <div
      v-if="showSettingsMenu"
      class="fixed inset-0 z-40 -top-16"
      @click="closeSettingsMenu"
    />
  </div>
</template>

<style scoped>
/* Safe area for devices with notches */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Smooth scale animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
