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
      <div class="mb-8 error-content">
        <div class="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-red-100 rounded-full mb-6 error-icon">
          <Icon name="tabler:alert-circle" class="text-red-600 text-4xl sm:text-6xl" />
        </div>

        <!-- 404 Text -->
        <h1 class="text-6xl sm:text-9xl font-bold text-gray-900 mb-4 error-title">
          404
        </h1>

        <!-- Error Message -->
        <h2 class="text-xl sm:text-3xl font-semibold text-gray-800 mb-4">
          {{ t('error.pageNotFound') || 'Page Not Found' }}
        </h2>

        <p class="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {{ t('error.pageNotFoundDescription') || 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <a-button class="!flex items-center gap-1" size="large" @click="goBack">
          <template #icon>
            <Icon name="tabler:arrow-left" />
          </template>
          {{ t('common.goBack') || 'Go Back' }}
        </a-button>

        <a-button class="!flex items-center gap-1" type="primary" size="large" @click="goHome">
          <template #icon>
            <Icon name="tabler:home" />
          </template>
          {{ t('common.goHome') || 'Go Home' }}
        </a-button>
      </div>

      <!-- Popular Links -->
      <div class="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-4">
          {{ t('error.popularLinks') || 'Popular Links' }}
        </h3>
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3 popular-links">
          <NuxtLink
            to="/"
            class="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            {{ t('common.home') || 'Home' }}
          </NuxtLink>
          <NuxtLink
            to="/courses"
            class="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            {{ t('common.courses') || 'Courses' }}
          </NuxtLink>
          <NuxtLink
            to="/learning"
            class="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            {{ t('common.learning') || 'Learning' }}
          </NuxtLink>
        </div>
      </div>

      <!-- Additional Help -->
      <div class="mt-6 pt-6 border-t border-gray-200">
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
/* 404 Page Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  animation: float 3s ease-in-out infinite;
}

.error-title {
  animation: pulse 2s ease-in-out infinite;
}

.error-content {
  animation: fadeInUp 0.8s ease-out;
}

.popular-links a {
  transition: all 0.3s ease;
}

.popular-links a:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
