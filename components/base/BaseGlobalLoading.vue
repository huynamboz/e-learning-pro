<script setup lang="ts">
interface Props {
  show?: boolean
  message?: string
}

withDefaults(defineProps<Props>(), {
  show: false,
  message: 'Loading...'
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] bg-white backdrop-blur-sm flex items-center justify-center"
      >
        <div class="text-center">
          <!-- Loading spinner -->
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          
          <!-- Loading message -->
          <p class="text-lg font-medium text-gray-700">
            {{ message }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Custom spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
