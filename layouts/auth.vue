<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
    <layout-auth-header />
    <main class="flex-1">
      <slot />
    </main>
    <layout-footer />
  </div>
</template>
