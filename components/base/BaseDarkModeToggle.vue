<script setup lang="ts">
const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <ClientOnly>
    <BaseButton
      type="button"
      class="p-[10px]"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleDarkMode"
    >
      <!-- Background circle with transition -->
      <div
        class="absolute inset-1 rounded-lg transition-all duration-300"
        :class="isDark ? 'bg-shade-3' : 'bg-transparent'"
      />

      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="scale-0 rotate-180 opacity-0"
        enter-to-class="scale-100 rotate-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="scale-100 rotate-0 opacity-100"
        leave-to-class="scale-0 -rotate-180 opacity-0"
        mode="out-in"
      >
        <!-- Sun icon for dark mode (when dark mode is active, show sun to switch to light) -->
        <div
          v-if="isDark"
          key="sun"
          class="relative z-10 flex items-center justify-center"
        >
          <Icon
            name="solar-sun-bold"
            class="w-5 h-5 text-yellow drop-shadow-sm"
          />
          <!-- Sun rays animation -->
          <div class="absolute inset-0 animate-spin" style="animation-duration: 8s;">
            <Icon
              name="solar-sun-bold"
              class="w-5 h-5 text-yellow/30"
            />
          </div>
        </div>

        <!-- Moon icon for light mode (when light mode is active, show moon to switch to dark) -->
        <div
          v-else
          key="moon"
          class="relative z-10 flex items-center justify-center"
        >
          <Icon
            name="solar-moon-bold"
            class="w-5 h-5 text-shade-6 group-hover:text-shade-8 transition-colors duration-200"
          />
          <!-- Subtle glow effect -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200">
            <Icon
              name="solar-moon-bold"
              class="w-5 h-5 text-blue blur-sm"
            />
          </div>
        </div>
      </Transition>
    </BaseButton>
  </ClientOnly>
</template>
