<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

interface Props {
  formData: {
    gender: string
    date_of_birth: Dayjs | null
    phone_number: string
  }
}

interface Emits {
  (e: 'update:form-data', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Gender options
const genderOptions = computed(() => [
  { value: 'male', label: t('onboarding.step2.gender.male'), icon: 'solar:user-bold' },
  { value: 'female', label: t('onboarding.step2.gender.female'), icon: 'solar:user-bold' },
  { value: 'other', label: t('onboarding.step2.gender.other'), icon: 'solar:user-bold' },
])

// Phone validation
const phoneError = computed(() => {
  if (!props.formData.phone_number)
    return ''

  const phone = props.formData.phone_number.trim()
  if (!phone.startsWith('0') || phone.length < 10 || !/^0\d{9,}$/.test(phone)) {
    return t('onboarding.step2.phone.validation.invalid')
  }
  return ''
})

// Date validation
const dateError = computed(() => {
  if (!props.formData.date_of_birth)
    return ''

  const currentYear = new Date().getFullYear()
  const birthYear = props.formData.date_of_birth.year()

  if (birthYear === currentYear) {
    return t('onboarding.step2.validation.birthYearInvalid')
  }
  return ''
})

// Update form data
function updateFormData(field: string, value: any) {
  // Emit the entire updated formData object
  const updatedData = { ...props.formData, [field]: value }
  emit('update:form-data', updatedData)
}

// Disable future dates
function disabledDate(current: Dayjs) {
  return current && current > dayjs().endOf('day')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Gender Selection -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ t('onboarding.step2.gender.title') }}
      </h3>

      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="gender in genderOptions"
          :key="gender.value"
          class="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105"
          :class="formData.gender === gender.value ? '!border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
          @click="updateFormData('gender', gender.value)"
        >
          <Icon :name="gender.icon" size="24" class="mb-2" :class="formData.gender === gender.value ? 'text-blue-600' : 'text-gray-400'" />
          <span class="text-sm font-medium" :class="formData.gender === gender.value ? 'text-blue-600' : 'text-gray-600'">
            {{ gender.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Date of Birth -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ t('onboarding.step2.dateOfBirth.title') }}
      </h3>
      <a-date-picker
        :value="formData.date_of_birth"
        :placeholder="t('onboarding.step2.dateOfBirth.placeholder')"
        size="large"
        class="w-full"
        :status="dateError ? 'error' : ''"
        :disabled-date="disabledDate"
        format="DD/MM/YYYY"
        @change="(date: any) => updateFormData('date_of_birth', date)"
      >
        <template #prefix>
          <Icon name="solar:calendar-bold" size="16" class="text-gray-400" />
        </template>
      </a-date-picker>
      <p v-if="dateError" class="text-xs text-red-500 mt-2">
        {{ dateError }}
      </p>
    </div>

    <!-- Phone Number -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ t('onboarding.step2.phone.title') }}
      </h3>
      <a-input
        :value="formData.phone_number"
        :placeholder="t('onboarding.step2.phone.placeholder')"
        size="large"
        :status="phoneError ? 'error' : ''"
        @input="(e: any) => updateFormData('phone_number', e.target.value)"
      >
        <template #prefix>
          <Icon name="solar:phone-bold" size="16" class="text-gray-400" />
        </template>
      </a-input>
      <p v-if="phoneError" class="text-xs text-red-500 mt-2">
        {{ phoneError }}
      </p>
      <p v-else class="text-xs text-gray-500 mt-2">
        {{ t('onboarding.step2.phone.description') }}
      </p>
    </div>
  </div>
</template>
