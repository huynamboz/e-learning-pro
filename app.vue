<script setup lang="ts">
const { isLoading: authLoading } = useAuth()
const { isLoading: globalLoading, message } = useGlobalLoading()
const { t } = useI18n()
// Show loading when auth is loading
const showLoading = computed(() => authLoading.value || globalLoading.value)
const loadingMessage = computed(() => {
  if (authLoading.value)
    return t('global.loading.message')
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
