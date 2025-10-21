<script lang="ts" setup>
import OnboardingWizard from '~/components/onboarding/OnboardingWizard.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'onboarding',
})

const { profile } = useAuth()

const router = useRouter()
onMounted(() => {
  if (profile.value) {
    router.push('/learning')
  }
})
</script>

<template>
  <OnboardingWizard />
</template>
