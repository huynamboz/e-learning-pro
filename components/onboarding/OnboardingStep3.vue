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

const selectedJob = ref<string | null>(null)

// Initialize selectedJob from formData
watch(() => props.formData.headline, (headline) => {
  if (headline) {
    selectedJob.value = headline
  }
  else {
    selectedJob.value = null
  }
}, { immediate: true })

// Watch selectedJob and update formData
watch(selectedJob, (newValue) => {
  emit('update:form-data', { ...props.formData, headline: newValue || '' })
})

// Job validation
const jobError = computed(() => {
  if (!selectedJob.value) {
    return t('onboarding.step3.profession.required') || 'Vui lòng chọn nghề nghiệp'
  }
  return ''
})
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
      <select
        v-model="selectedJob"
        required
        class="w-full !text-gray-900 h-12 px-4 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        :class="jobError ? 'border-red-500' : 'border-gray-300'"
      >
        <option :value="null" disabled>
          {{ t('onboarding.step3.profession.placeholder') }}
        </option>
        <option
          v-for="job in jobOptions"
          :key="job.value"
          :value="job.value"
          class="!text-gray-900"
        >
          {{ job.label }}
        </option>
      </select>
      <p v-if="jobError" class="text-xs text-red-500 mt-2">
        {{ jobError }}
      </p>
    </div>
  </div>
</template>
