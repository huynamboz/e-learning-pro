<script setup lang="ts">
import { cn } from '~/lib/utils'

// Get sidebar collapse state
const { isCollapsed } = useSidebar()
</script>

<template>
  <div class="flex bg-white transition-colors duration-300 h-dvh">
    <LayoutAdminSideBar />
    <div
      class="w-full bg-shade-1 flex flex-col pt-[80px] transition-all duration-300 ease-in-out"
      :class="cn(isCollapsed ? 'pl-[80px]' : 'pl-[280px]')"
    >
      <LayoutHeader />
      <div class="flex-1 p-4 overflow-x-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>
