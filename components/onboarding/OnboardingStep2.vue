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

// Date select values
const selectedDay = ref<number | null>(null)
const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)

// Initialize date selects from formData
watch(() => props.formData.date_of_birth, (date) => {
  if (date) {
    selectedDay.value = date.date()
    selectedMonth.value = date.month() + 1 // dayjs month is 0-indexed
    selectedYear.value = date.year()
  }
  else {
    selectedDay.value = null
    selectedMonth.value = null
    selectedYear.value = null
  }
}, { immediate: true })

// Generate year options (from current year back to 100 years ago)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 1; year >= currentYear - 100; year--) {
    years.push({ value: year, label: year.toString() })
  }
  return years
})

// Generate month options (1-12)
const monthOptions = computed(() => {
  const months = []
  for (let month = 1; month <= 12; month++) {
    months.push({ value: month, label: month.toString() })
  }
  return months
})

// Generate day options (always 1-31)
const dayOptions = computed(() => {
  const days = []
  for (let day = 1; day <= 31; day++) {
    days.push({ value: day, label: day.toString() })
  }
  return days
})

// Update date when any select changes
function updateDate() {
  if (selectedDay.value && selectedMonth.value && selectedYear.value) {
    const date = dayjs(`${selectedYear.value}-${selectedMonth.value}-${selectedDay.value}`)
    if (date.isValid()) {
      updateFormData('date_of_birth', date)
    }
  }
  else {
    updateFormData('date_of_birth', null)
  }
}

// Date validation
const dateError = computed(() => {
  if (!selectedDay.value || !selectedMonth.value || !selectedYear.value)
    return ''

  const currentYear = new Date().getFullYear()
  if (selectedYear.value === currentYear) {
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
      <div class="grid grid-cols-3 gap-4">
        <!-- Day Select -->
        <select
          v-model="selectedDay"
          class="w-full h-12 px-4 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          :class="dateError ? 'border-red-500' : 'border-gray-300'"
          @change="updateDate"
        >
          <option :value="null" disabled>
            {{ t('onboarding.step2.dateOfBirth.day') || 'Ngày' }}
          </option>
          <option
            v-for="day in dayOptions"
            :key="day.value"
            :value="day.value"
          >
            {{ day.label }}
          </option>
        </select>

        <!-- Month Select -->
        <select
          v-model="selectedMonth"
          class="w-full h-12 px-4 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          :class="dateError ? 'border-red-500' : 'border-gray-300'"
          @change="updateDate"
        >
          <option :value="null" disabled>
            {{ t('onboarding.step2.dateOfBirth.month') || 'Tháng' }}
          </option>
          <option
            v-for="month in monthOptions"
            :key="month.value"
            :value="month.value"
          >
            {{ month.label }}
          </option>
        </select>

        <!-- Year Select -->
        <select
          v-model="selectedYear"
          class="w-full h-12 px-4 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          :class="dateError ? 'border-red-500' : 'border-gray-300'"
          @change="updateDate"
        >
          <option :value="null" disabled>
            {{ t('onboarding.step2.dateOfBirth.year') || 'Năm' }}
          </option>
          <option
            v-for="year in yearOptions"
            :key="year.value"
            :value="year.value"
          >
            {{ year.label }}
          </option>
        </select>
      </div>
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
