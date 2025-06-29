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
  <div class="flex bg-background min-h-lvh transition-colors duration-300">
    <LayoutSideBar />
    <div class="flex-1 bg-shade-1 flex flex-col ml-[260px] pt-[80px]">
      <LayoutHeader />
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
