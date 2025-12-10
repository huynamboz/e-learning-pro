<script setup lang="ts">
import { cn } from '~/lib/utils'

// Get sidebar collapse state
const { isCollapsed } = useSidebar()

const isSidebarOpen = ref(false)

function openSidebar() {
  isSidebarOpen.value = true
}
function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="flex bg-white transition-colors duration-300 h-dvh">
    <!-- Overlay Sidebar for Admin -->
    <transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-50 bg-black/40 lg:hidden"
        @click="closeSidebar"
      />
    </transition>
    <transition name="slide">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 lg:hidden"
      >
        <LayoutAdminSideBar />
      </div>
    </transition>
    <!-- Keep persistent sidebar hidden on small screens, visible on lg -->
    <div class="hidden lg:block">
      <LayoutAdminSideBar />
    </div>
    <div
      class="w-full bg-shade-1 flex flex-col pt-[80px] transition-all duration-300 ease-in-out"
      :class="cn(isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]')"
    >
      <LayoutHeader :show-hamburger="true" @hamburger-click="openSidebar" />
      <div class="flex-1 p-4 overflow-x-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from { transform: translateX(-100%); }
.slide-leave-to { transform: translateX(-100%); }
</style>
