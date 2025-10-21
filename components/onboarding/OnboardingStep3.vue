<script setup lang="ts">
interface Props {
  formData: {
    contact_address: string
    headline: string
  }
}

interface Emits {
  (e: 'update:form-data', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Job options
const jobOptions = computed(() => [
  { value: 'student', label: t('onboarding.step3.jobs.student'), icon: 'solar:book-bold' },
  { value: 'teacher', label: t('onboarding.step3.jobs.teacher'), icon: 'solar:graduation-bold' },
  { value: 'engineer', label: t('onboarding.step3.jobs.engineer'), icon: 'solar:settings-bold' },
  { value: 'doctor', label: t('onboarding.step3.jobs.doctor'), icon: 'solar:heart-bold' },
  { value: 'lawyer', label: t('onboarding.step3.jobs.lawyer'), icon: 'solar:scale-bold' },
  { value: 'business', label: t('onboarding.step3.jobs.business'), icon: 'solar:chart-bold' },
  { value: 'designer', label: t('onboarding.step3.jobs.designer'), icon: 'solar:palette-bold' },
  { value: 'developer', label: t('onboarding.step3.jobs.developer'), icon: 'solar:code-bold' },
  { value: 'marketing', label: t('onboarding.step3.jobs.marketing'), icon: 'solar:megaphone-bold' },
  { value: 'sales', label: t('onboarding.step3.jobs.sales'), icon: 'solar:shop-bold' },
  { value: 'freelancer', label: t('onboarding.step3.jobs.freelancer'), icon: 'solar:user-plus-bold' },
  { value: 'retired', label: t('onboarding.step3.jobs.retired'), icon: 'solar:home-bold' },
  { value: 'unemployed', label: t('onboarding.step3.jobs.unemployed'), icon: 'solar:search-bold' },
  { value: 'other', label: t('onboarding.step3.jobs.other'), icon: 'solar:more-circle-bold' },
])
</script>

<template>
  <div class="space-y-6">
    <!-- Address -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ t('onboarding.step3.address.title') }}
      </h3>
      <a-textarea
        :value="formData.contact_address"
        :placeholder="t('onboarding.step3.address.placeholder')"
        :rows="3"
        size="large"
        @input="(e: any) => emit('update:form-data', { ...props.formData, contact_address: e.target.value })"
      />
      <p class="text-xs text-gray-500 mt-2">
        {{ t('onboarding.step3.address.description') }}
      </p>
    </div>

    <!-- Job/Profession -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ t('onboarding.step3.profession.title') }}
      </h3>
      <a-select
        :value="formData.headline"
        :placeholder="t('onboarding.step3.profession.placeholder')"
        size="large"
        class="w-full"
        @change="(e: any) => emit('update:form-data', { ...props.formData, headline: e })"
      >
        <a-select-option
          v-for="job in jobOptions"
          :key="job.value"
          :value="job.value"
        >
          {{ job.label }}
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>
