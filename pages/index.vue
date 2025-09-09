<script setup lang="ts">
const { isDark } = useDarkMode()
</script>

<template>
  <div class="space-y-8 p-6">
    <!-- Hero Section -->
    <div class="space-y-4">
      <h1 class="text-4xl font-bold tracking-tight">
        Welcome to <span class="text-green">NULive</span>
      </h1>
      <p class="text-xl text-muted-foreground font-light max-w-2xl">
        A modern Nuxt 3 application with shadcn/ui components, dark mode support, and beautiful animations.
      </p>
    </div>

    <!-- Dark Mode Demo Section -->
    <div class="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 class="text-2xl font-semibold">
        Dark Mode
        <a-space wrap>
          <a-button type="primary">
            Primary Button
          </a-button>
          <a-button>Default Button</a-button>
          <a-button type="dashed">
            Dashed Button
          </a-button>
          <a-button type="text">
            Text Button
          </a-button>
          <a-button type="link">
            Link Button
          </a-button>
        </a-space>
      </h2>
      <p class="text-muted-foreground">
        Toggle between light and dark modes using the button in the sidebar. The theme persists across sessions and respects your system preference.
      </p>
      <div class="flex items-center gap-4">
        <span class="text-sm">Current mode:</span>
        <div class="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted">
          <Icon
            :name="isDark ? 'solar-moon-bold' : 'solar-sun-bold'"
            :class="isDark ? 'text-blue' : 'text-yellow'"
            class="w-4 h-4"
          />
          <span class="text-sm font-medium">{{ isDark ? 'Dark' : 'Light' }}</span>
        </div>
      </div>
    </div>

    <!-- Components Demo Section -->
    <div class="bg-card border border-border rounded-lg p-6 space-y-6">
      <h2 class="text-2xl font-semibold">
        UI Components
      </h2>

      <div class="space-y-4">
        <h3 class="text-lg font-medium">
          Buttons
        </h3>
        <div class="flex flex-wrap gap-3">
          <BaseButton>Default</BaseButton>
          <BaseButton variant="secondary">
            Secondary
          </BaseButton>
          <BaseButton variant="outline">
            Outline
          </BaseButton>
          <BaseButton variant="destructive">
            Destructive
          </BaseButton>
          <BaseButton variant="ghost">
            Ghost
          </BaseButton>
          <BaseButton variant="link">
            Link
          </BaseButton>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-lg font-medium">
          Button Sizes
        </h3>
        <div class="flex flex-wrap items-center gap-3">
          <BaseButton size="sm">
            Small
          </BaseButton>
          <BaseButton size="md">
            Default
          </BaseButton>
          <BaseButton size="lg">
            Large
          </BaseButton>
          <BaseButton>
            <Icon name="solar-heart-bold" class="w-4 h-4" />
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Theme Colors Section -->
    <div class="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 class="text-2xl font-semibold">
        Theme Colors
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <div class="w-full h-12 bg-green rounded-lg" />
          <p class="text-sm font-medium">
            Green
          </p>
        </div>
        <div class="space-y-2">
          <div class="w-full h-12 bg-blue rounded-lg" />
          <p class="text-sm font-medium">
            Blue
          </p>
        </div>
        <div class="space-y-2">
          <div class="w-full h-12 bg-orange rounded-lg" />
          <p class="text-sm font-medium">
            Orange
          </p>
        </div>
        <div class="space-y-2">
          <div class="w-full h-12 bg-purple rounded-lg" />
          <p class="text-sm font-medium">
            Purple
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
