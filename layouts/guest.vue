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
  <div class="min-h-screen bg-background transition-colors duration-300 flex flex-col">
    <main class="flex-1 pt-[80px]">
      <slot />
    </main>
  </div>
</template>
