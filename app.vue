<script setup lang="ts">
const { isLoading: authLoading } = useAuth()
const { isLoading: globalLoading, message } = useGlobalLoading()

// Show loading when auth is loading
const showLoading = computed(() => authLoading.value || globalLoading.value)
const loadingMessage = computed(() => {
  if (authLoading.value)
    return 'Initializing...'
  return message.value
})
</script>

<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#49ba61' }, hashed: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Loading Overlay -->
    <BaseGlobalLoading
      :show="showLoading"
      :message="loadingMessage"
    />
  </a-config-provider>
</template>
