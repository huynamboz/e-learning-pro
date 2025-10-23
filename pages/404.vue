<script setup lang="ts">
definePageMeta({
  layout: 'guest',
})

const { t } = useI18n()

function goHome() {
  navigateTo('/')
}

function goBack() {
  window.history.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Error Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
          <Icon name="tabler:alert-circle" class="text-red-600 text-6xl" />
        </div>

        <!-- 404 Text -->
        <h1 class="text-9xl font-bold text-gray-900 mb-4">
          404
        </h1>

        <!-- Error Message -->
        <h2 class="text-3xl font-semibold text-gray-800 mb-4">
          {{ t('error.pageNotFound') || 'Page Not Found' }}
        </h2>

        <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {{ t('error.pageNotFoundDescription') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a-button size="large" @click="goBack">
          <template #icon>
            <Icon name="tabler:arrow-left" />
          </template>
          {{ t('common.goBack') || 'Go Back' }}
        </a-button>

        <a-button type="primary" size="large" @click="goHome">
          <template #icon>
            <Icon name="tabler:home" />
          </template>
          {{ t('common.goHome') || 'Go Home' }}
        </a-button>
      </div>

      <!-- Additional Help -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          {{ t('error.needHelp') || 'Need help?' }}
          <NuxtLink to="/contact" class="text-blue-600 hover:text-blue-700 font-medium ml-1">
            {{ t('common.contactSupport') || 'Contact Support' }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom animations or styles here */
</style>
