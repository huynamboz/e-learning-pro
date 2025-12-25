<script setup lang="ts">
import dayjs from 'dayjs'

interface Props {
  formData: {
    first_name: string
    last_name: string
    gender: string
    date_of_birth: any
    phone_number: string
    contact_address: string
    headline: string
    avatarPreview: string
  }
}

defineProps<Props>()
const { t } = useI18n()

// Get gender label
function getGenderLabel(gender: string) {
  const genderMap: Record<string, string> = {
    male: t('onboarding.step2.gender.male'),
    female: t('onboarding.step2.gender.female'),
    other: t('onboarding.step2.gender.other'),
  }
  return genderMap[gender] || t('onboarding.step4.summary.notUpdated')
}

// Get job label
function getJobLabel(profession: string) {
  const jobMap: Record<string, string> = {
    student: t('onboarding.step3.jobs.student'),
    teacher: t('onboarding.step3.jobs.teacher'),
    engineer: t('onboarding.step3.jobs.engineer'),
    doctor: t('onboarding.step3.jobs.doctor'),
    lawyer: t('onboarding.step3.jobs.lawyer'),
    business: t('onboarding.step3.jobs.business'),
    designer: t('onboarding.step3.jobs.designer'),
    developer: t('onboarding.step3.jobs.developer'),
    marketing: t('onboarding.step3.jobs.marketing'),
    sales: t('onboarding.step3.jobs.sales'),
    freelancer: t('onboarding.step3.jobs.freelancer'),
    retired: t('onboarding.step3.jobs.retired'),
    unemployed: t('onboarding.step3.jobs.unemployed'),
    other: t('onboarding.step3.jobs.other'),
  }
  return jobMap[profession] || t('onboarding.step4.summary.notUpdated')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Header -->
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <Icon name="solar:check-circle-bold" size="32" class="text-green-600" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">
        {{ t('onboarding.step4.title') }}
      </h3>
      <p class="text-gray-600">
        {{ t('onboarding.step4.description') }}
      </p>
    </div>

    <!-- Information Summary -->
    <div class="bg-gray-50 rounded-lg p-6 space-y-4">
      <!-- Basic Info -->
      <div class="grid md:grid-cols-2 gap-4">
        <div class="flex items-center space-x-3">
          <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              v-if="formData.avatarPreview"
              :src="formData.avatarPreview"
              alt="Avatar"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
              <Icon name="solar:user-bold" size="20" class="text-gray-400" />
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">
              {{ formData.first_name }} {{ formData.last_name }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ getGenderLabel(formData.gender) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Personal Info -->
      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Icon name="solar:calendar-bold" size="16" class="text-gray-400" />
            <span class="text-sm text-gray-600">{{ t('onboarding.step4.summary.dateOfBirth') }}</span>
            <span class="text-sm font-medium text-gray-900">
              {{ formData.date_of_birth ? dayjs(formData.date_of_birth).format('DD/MM/YYYY') : t('onboarding.step4.summary.notUpdated') }}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <Icon name="solar:phone-bold" size="16" class="text-gray-400" />
            <span class="text-sm text-gray-600">{{ t('onboarding.step4.summary.phoneNumber') }}</span>
            <span class="text-sm font-medium text-gray-900">
              {{ formData.phone_number || t('onboarding.step4.summary.notUpdated') }}
            </span>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Icon name="solar:briefcase-bold" size="16" class="text-gray-400" />
            <span class="text-sm text-gray-600">{{ t('onboarding.step4.summary.profession') }}</span>
            <span class="text-sm font-medium text-gray-900">
              {{ getJobLabel(formData.headline) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div v-if="formData.contact_address" class="space-y-2">
        <div class="flex items-start space-x-2">
          <Icon name="solar:map-point-bold" size="16" class="text-gray-400 mt-0.5" />
          <div>
            <span class="text-sm text-gray-600">{{ t('onboarding.step4.summary.address') }}</span>
            <p class="text-sm font-medium text-gray-900 mt-1">
              {{ formData.contact_address }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms and Conditions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <Icon name="solar:info-circle-bold" size="20" class="min-w-5 text-blue-600 mt-0.5" />
        <div class="flex-auto text-sm text-blue-800">
          <p class="font-medium mb-1">
            {{ t('onboarding.step4.privacy.title') }}
          </p>
          <p>
            {{ t('onboarding.step4.privacy.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
