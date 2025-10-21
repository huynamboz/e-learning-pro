<script setup lang="ts">
import { notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useUserApi } from '~/composables/api/useUserApi'
import { useAuth } from '~/composables/useAuth'
import { useFileUpload } from '~/composables/useFileUpload'
import OnboardingStep1 from './OnboardingStep1.vue'
import OnboardingStep2 from './OnboardingStep2.vue'
import OnboardingStep3 from './OnboardingStep3.vue'
import OnboardingStep4 from './OnboardingStep4.vue'

const { profile, fetchProfile, fetchUser } = useAuth()
const { updateProfile } = useUserApi()
const { uploadProgress, isUploading, uploadWithPresignedUrl } = useFileUpload()
const router = useRouter()
const { t } = useI18n()

// Form state
const formRef = ref()
const loading = ref(false)
const currentStep = ref(1)

// Form data
const formData = ref({
  first_name: profile.value?.first_name || '',
  last_name: profile.value?.last_name || '',
  avatar: null as File | null,
  gender: profile.value?.gender || '',
  date_of_birth: profile.value?.date_of_birth ? dayjs(profile.value.date_of_birth) : null,
  phone_number: profile.value?.phone_number || '',
  contact_address: profile.value?.contact_address || '',
  headline: profile.value?.headline || '',
})

// Avatar preview
const avatarPreview = ref(profile.value?.avatar || '')
const selectedAvatar = ref('')

// Step titles and descriptions
const stepInfo = computed(() => [
  {
    title: t('onboarding.steps.basicInfo.title'),
    description: t('onboarding.steps.basicInfo.description'),
  },
  {
    title: t('onboarding.steps.personalInfo.title'),
    description: t('onboarding.steps.personalInfo.description'),
  },
  {
    title: t('onboarding.steps.contactInfo.title'),
    description: t('onboarding.steps.contactInfo.description'),
  },
  {
    title: t('onboarding.steps.confirmation.title'),
    description: t('onboarding.steps.confirmation.description'),
  },
])

// Get step title
function getStepTitle(step: number) {
  return stepInfo.value[step - 1]?.title || ''
}

// Get step description
function getStepDescription(step: number) {
  return stepInfo.value[step - 1]?.description || ''
}

// Get step rules
function getStepRules(step: number) {
  const rules: any = {}

  if (step === 1) {
    rules.first_name = [
      { required: true, message: t('onboarding.validation.firstNameRequired'), trigger: 'blur' },
      { min: 2, message: t('onboarding.validation.firstNameMinLength'), trigger: 'blur' },
    ]
    rules.last_name = [
      { required: true, message: t('onboarding.validation.lastNameRequired'), trigger: 'blur' },
      { min: 2, message: t('onboarding.validation.lastNameMinLength'), trigger: 'blur' },
    ]
  }

  return rules
}

// Get button text
function getButtonText() {
  if (isUploading.value) {
    return t('onboarding.navigation.uploading', { progress: uploadProgress.value })
  }
  return currentStep.value === 4 ? t('onboarding.navigation.complete') : t('onboarding.navigation.next')
}

// Get button icon
function getButtonIcon() {
  if (isUploading.value) {
    return 'solar:upload-bold'
  }
  return currentStep.value === 4 ? 'solar:check-circle-bold' : 'solar:alt-arrow-right-outline'
}

// Get footer text
function getFooterText(step: number) {
  const texts = [
    t('onboarding.footer.step1'),
    t('onboarding.footer.step2'),
    t('onboarding.footer.step3'),
    t('onboarding.footer.step4'),
  ]
  return texts[step - 1] || ''
}

// Check if current step is complete
function isCurrentStepComplete(): boolean {
  switch (currentStep.value) {
    case 1:
      // Step 1: First name, last name, and avatar selection
      return !!(formData.value.first_name?.trim()
        && formData.value.last_name?.trim()
        && (selectedAvatar.value || formData.value.avatar || profile.value?.avatar))

    case 2: {
      // Step 2: Gender, date of birth, phone number
      const phone = formData.value.phone_number?.trim()
      const phoneValid = phone && phone.startsWith('0') && phone.length >= 10 && /^0\d{9,}$/.test(phone)

      const currentYear = new Date().getFullYear()
      const birthYear = formData.value.date_of_birth?.year()
      const dateValid = formData.value.date_of_birth && birthYear !== currentYear

      return !!(formData.value.gender && dateValid && phoneValid)
    }

    case 3:
      // Step 3: Address, profession
      return !!(formData.value.contact_address?.trim() && formData.value.headline)

    case 4:
      // Step 4: Always complete (confirmation step)
      return true

    default:
      return false
  }
}

// Check if next button should be disabled
const isNextDisabled = computed(() => {
  return !isCurrentStepComplete() || loading.value || isUploading.value
})

// Get disabled reason for tooltip
const getDisabledReason = computed(() => {
  if (loading.value)
    return t('global.loading.message')
  if (isUploading.value)
    return t('onboarding.navigation.uploading', { progress: uploadProgress.value })

  switch (currentStep.value) {
    case 1:
      if (!formData.value.first_name?.trim())
        return t('onboarding.validation.firstNameRequired')
      if (!formData.value.last_name?.trim())
        return t('onboarding.validation.lastNameRequired')
      if (!selectedAvatar.value && !formData.value.avatar)
        return t('onboarding.validation.avatarRequired')
      break
    case 2: {
      if (!formData.value.gender)
        return t('onboarding.validation.genderRequired')
      if (!formData.value.date_of_birth)
        return t('onboarding.validation.dateOfBirthRequired')
      if (!formData.value.phone_number?.trim())
        return t('onboarding.validation.phoneRequired')

      // Check phone validation
      const phone = formData.value.phone_number?.trim()
      if (!phone.startsWith('0') || phone.length < 10 || !/^0\d{9,}$/.test(phone))
        return t('onboarding.step2.phone.validation.invalid')

      // Check date validation
      const currentYear = new Date().getFullYear()
      const birthYear = formData.value.date_of_birth?.year()
      if (formData.value.date_of_birth && birthYear === currentYear)
        return t('onboarding.step2.validation.birthYearInvalid')
      break
    }
    case 3:
      if (!formData.value.contact_address?.trim())
        return t('onboarding.validation.addressRequired')
      if (!formData.value.headline)
        return t('onboarding.validation.professionRequired')
      break
  }
  return ''
})

// Handle next step
async function handleNext() {
  try {
    await formRef.value.validate()

    if (currentStep.value < 4) {
      currentStep.value++
    }
    else {
      await handleSubmit()
    }
  }
  catch (error) {
    console.error('Validation error:', error)
  }
}

// Handle previous step
function handlePrevious() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Handle form submission
async function handleSubmit() {
  try {
    loading.value = true

    // Prepare update data
    const updateData: any = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      gender: formData.value.gender,
      date_of_birth: formData.value.date_of_birth && typeof formData.value.date_of_birth === 'object' && 'format' in formData.value.date_of_birth
        ? (formData.value.date_of_birth as any).format('YYYY-MM-DD')
        : formData.value.date_of_birth,
      phone_number: formData.value.phone_number,
      contact_address: formData.value.contact_address,
      headline: formData.value.headline,
    }

    // Upload avatar if selected
    if (formData.value.avatar as File) {
      try {
        const publicUrl = await uploadWithPresignedUrl(
          formData.value.avatar as File,
          'Tải lên avatar thất bại',
        )
        updateData.avatar = publicUrl
      }
      catch (error) {
        console.error('Error uploading avatar:', error)
        return
      }
    }
    else if (selectedAvatar.value as string) {
      // Use selected avatar
      const avatarOptions = [
        { id: 'avatar1', src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Sunglasses&hatColor=Pink&hairColor=Platinum&facialHairType=MoustacheMagnum&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Blue01&graphicType=Bear&eyeType=Squint&eyebrowType=FlatNatural&mouthType=Grimace&skinColor=Light' },
        { id: 'avatar2', src: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Kurt&hatColor=PastelRed&hairColor=Black&facialHairType=BeardMajestic&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=Black&eyeType=Close&eyebrowType=AngryNatural&mouthType=ScreamOpen&skinColor=Pale' },
        { id: 'avatar3', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Prescription01&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Platinum&clotheType=BlazerSweater&eyeType=Wink&eyebrowType=Angry&mouthType=Smile&skinColor=Light' },
        { id: 'avatar4', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Wayfarers&hairColor=Platinum&facialHairType=Blank&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Gray02&eyeType=WinkWacky&eyebrowType=RaisedExcited&mouthType=Serious&skinColor=Yellow' },
        { id: 'avatar5', src: 'https://avataaars.io/?avatarStyle=Circle&topType=Hijab&accessoriesType=Kurt&hatColor=PastelYellow&hairColor=Black&facialHairType=BeardLight&facialHairColor=Blonde&clotheType=ShirtScoopNeck&clotheColor=Pink&graphicType=Cumbia&eyeType=Happy&eyebrowType=SadConcernedNatural&mouthType=Serious&skinColor=Pale' },
        { id: 'avatar6', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=Platinum&facialHairType=Blank&facialHairColor=Platinum&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Default&skinColor=Tanned' },
      ]
      const avatar = avatarOptions.find(a => a.id === selectedAvatar.value as string)
      if (avatar) {
        updateData.avatar = avatar.src
      }
    }

    // Update profile
    await updateProfile(updateData)

    // Refresh user data
    await fetchProfile()
    await fetchUser()

    notification.success({ message: 'Cập nhật thông tin thành công!' })

    // Redirect to learning page
    router.push('/learning')
  }
  catch (error: any) {
    console.error('Error updating profile:', error)
    notification.error({ message: 'Cập nhật thông tin thất bại' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Icon name="solar:user-circle-bold" size="32" class="text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ getStepTitle(currentStep) }}
        </h1>
        <p class="text-gray-600">
          {{ getStepDescription(currentStep) }}
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div
            v-for="step in 4"
            :key="step"
            class="flex items-center flex-auto"
          >
            <div
              class="flex-auto h-1 transition-all"
              :class="{
                'bg-blue-500': step <= currentStep,
                'bg-gray-200': step > currentStep,
                'opacity-0': step === 1,
              }"
            />
            <div
              class="w-8 h-8 mx-2 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
              :class="step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'"
            >
              {{ step }}
            </div>
            <div
              class="flex-auto h-1 transition-all"
              :class="{
                'bg-blue-500': step < currentStep,
                'bg-gray-200': step >= currentStep,
                'opacity-0': step === 4,
              }"
            />
          </div>
        </div>
        <div class="text-center">
          <span class="text-sm text-gray-500">
            Bước {{ currentStep }} / 4
          </span>
        </div>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="getStepRules(currentStep)"
          layout="vertical"
          @finish="handleNext"
        >
          <!-- Step Content -->
          <div class="mb-8">
            <OnboardingStep1
              v-if="currentStep === 1"
              v-model:form-data="formData"
              v-model:avatar-preview="avatarPreview"
              v-model:selected-avatar="selectedAvatar"
            />
            <OnboardingStep2
              v-else-if="currentStep === 2"
              v-model:form-data="formData"
            />
            <OnboardingStep3
              v-else-if="currentStep === 3"
              v-model:form-data="formData"
            />
            <OnboardingStep4
              v-else-if="currentStep === 4"
              :form-data="{ ...formData, avatarPreview: profile?.avatar || '' }"
            />
          </div>

          <!-- Progress Section -->
          <div v-if="isUploading" class="mb-6">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Đang tải lên avatar...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <a-progress
              :percent="uploadProgress"
              :show-info="false"
              status="active"
              stroke-color="#3b82f6"
              class="!h-2"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between">
            <a-button
              v-if="currentStep > 1"
              size="large"
              class="!flex items-center"
              @click="handlePrevious"
            >
              <Icon name="solar:alt-arrow-left-outline" size="16" class="mr-2" />
              {{ $t('onboarding.navigation.previous') }}
            </a-button>
            <div v-else />

            <a-tooltip
              :title="isNextDisabled ? getDisabledReason : ''"
              placement="top"
            >
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="loading"
                :disabled="isNextDisabled"
                class="min-w-[160px] !flex !items-center !justify-center"
              >
                <Icon
                  :name="getButtonIcon()"
                  size="16"
                  class="mr-2"
                />
                {{ getButtonText() }}
              </a-button>
            </a-tooltip>
          </div>

          <!-- Step Completion Indicator -->
          <div v-if="!isCurrentStepComplete() && !loading && !isUploading" class="mt-4 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Icon name="solar:info-circle-bold" size="16" class="text-amber-600" />
              <span class="text-sm text-amber-700">
                {{ getDisabledReason }}
              </span>
            </div>
          </div>
        </a-form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500">
          {{ getFooterText(currentStep) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better visual appeal */
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
}

:deep(.ant-input) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.ant-input:hover) {
  border-color: #3b82f6;
}

:deep(.ant-input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

:deep(.ant-btn) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
}
</style>
