<script setup lang="ts">
// Initialize dark mode on layout mount
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
  <div class="flex bg-background min-h-lvh max-w-lvw transition-colors duration-300">
    <LayoutSideBar />
    <div class="w-full bg-shade-1 flex flex-col pl-[220px] pt-[80px]">
      <LayoutHeader />
      <div class="flex-1 overflow-x-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>
