<script setup lang="ts">
const route = useRoute()

// Bottom bar items
const bottomBarItems = [
  {
    name: 'Home',
    icon: 'solar:home-2-bold',
    link: '/learning',
  },
  {
    name: 'Courses',
    icon: 'solar:book-bookmark-bold',
    link: '/profile?tab=MY_COURSES',
  },
  {
    name: 'Calendar',
    icon: 'solar:calendar-bold',
    link: '/calendars',
  },
  {
    name: 'Settings',
    icon: 'solar:settings-bold',
    link: '/settings',
  },
]

// Check if link is active
function isActive(link: string) {
  if (link === '/learning') {
    return route.path === '/learning'
  }
  if (link.includes('?tab=')) {
    const [path, query] = link.split('?')
    return route.path === path && route.query.tab === query.split('=')[1]
  }
  return route.path.startsWith(link)
}
</script>

<template>
  <!-- Bottom Navigation Bar - Only visible on mobile -->
  <div class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
    <div class="grid grid-cols-4 h-16">
      <NuxtLink
        v-for="item in bottomBarItems"
        :key="item.name"
        :to="item.link"
        class="flex flex-col items-center justify-center gap-1 transition-all duration-200 relative group"
        :class="[
          isActive(item.link)
            ? 'text-green-600'
            : 'text-gray-600 dark:text-gray-400'
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
              : 'scale-100 group-hover:scale-105'
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
                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
            ]"
          />
        </div>

        <!-- Label -->
        <span
          class="text-xs font-medium transition-all duration-200"
          :class="[
            isActive(item.link)
              ? 'text-green-600 font-semibold'
              : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
          ]"
        >
          {{ item.name }}
        </span>
      </NuxtLink>
    </div>
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
