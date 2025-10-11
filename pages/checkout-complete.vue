<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const { t } = useI18n()

// Auto redirect to learning page after 5 seconds
onMounted(() => {
  setTimeout(() => {
    router.push('/learning')
  }, 5000)
})

// Manual redirect function
function goToLearning() {
  router.push('/learning')
}

function goToCourses() {
  router.push('/courses')
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center">
    <div class="text-center max-w-md mx-auto px-6">
      <!-- Success Icon -->
      <div class="mb-8">
        <div class="size-40 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <Icon name="solar:check-circle-bold" size="100" class="text-white" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ $t('checkoutComplete.title') }}
      </h1>

      <!-- Description -->
      <p class="text-lg text-gray-600 mb-8">
        {{ $t('checkoutComplete.description') }}
      </p>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          @click="goToLearning"
        >
          {{ $t('checkoutComplete.buttons.goToMyCourses') }}
        </button>
        
        <button
          class="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          @click="goToCourses"
        >
          {{ $t('checkoutComplete.buttons.continueShopping') }}
        </button>
      </div>

      <!-- Auto redirect notice -->
      <p class="text-sm text-gray-500 mt-6">
        {{ $t('checkoutComplete.autoRedirect') }}
      </p>
    </div>
  </div>
</template>
