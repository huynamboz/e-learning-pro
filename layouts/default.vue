<script setup lang="ts">
import { cn } from '~/lib/utils'

// Initialize dark mode on layout mount
const { isCollapsed } = useSidebar()
const { isDark } = useDarkMode()

// Set HTML class on SSR
if (process.server) {
  useHead({
    htmlAttrs: {
      class: computed(() => isDark.value ? 'dark' : ''),
    },
  })
}
</script>

<template>
  <div class="flex bg-background transition-colors duration-300 h-dvh">
    <!-- Hide sidebar on mobile, show on desktop -->
    <LayoutSideBar class="hidden lg:block" />

    <div
      class="w-full bg-shade-1 flex flex-col pt-[80px] transition-all duration-300 ease-in-out"
      :class="cn(isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]')"
    >
      <LayoutHeader />
      <!-- Add bottom padding on mobile for bottom bar space -->
      <div class="flex-1 overflow-x-hidden pb-16 lg:pb-0">
        <slot />
      </div>
    </div>

    <!-- Bottom bar - mobile only -->
    <LayoutBottomBar />
  </div>
</template>
