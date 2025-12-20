<script setup lang="ts">
import { notification } from 'ant-design-vue'
import { useUserApi } from '~/composables/api/useUserApi'
import { useAuth } from '~/composables/useAuth'
import { useFileUpload } from '~/composables/useFileUpload'
import OnboardingStep1 from './OnboardingStep1.vue'

const { profile, fetchProfile, fetchUser } = useAuth()
const { updateProfile } = useUserApi()
const { uploadProgress, isUploading, uploadWithPresignedUrl } = useFileUpload()
const cartStore = useCartStore()
const router = useRouter()
const { t } = useI18n()

// Form state
const formRef = ref()
const loading = ref(false)

// Form data
const formData = ref({
  first_name: profile.value?.first_name || '',
  last_name: profile.value?.last_name || '',
  avatar: null as File | null,
})

// Avatar preview
const avatarPreview = ref(profile.value?.avatar || '')
const selectedAvatar = ref('')

// Step title and description
const stepTitle = computed(() => t('onboarding.steps.basicInfo.title'))
const stepDescription = computed(() => t('onboarding.steps.basicInfo.description'))

// Get step rules
const formRules = computed(() => ({
  first_name: [
    { required: true, message: t('onboarding.validation.firstNameRequired'), trigger: 'blur' },
    { min: 2, message: t('onboarding.validation.firstNameMinLength'), trigger: 'blur' },
  ],
  last_name: [
    { required: true, message: t('onboarding.validation.lastNameRequired'), trigger: 'blur' },
    { min: 2, message: t('onboarding.validation.lastNameMinLength'), trigger: 'blur' },
  ],
}))

// Get button text
const buttonText = computed(() => {
  if (isUploading.value) {
    return t('onboarding.navigation.uploading', { progress: uploadProgress.value })
  }
  return t('onboarding.navigation.complete')
})

// Get button icon
const buttonIcon = computed(() => {
  if (isUploading.value) {
    return 'solar:upload-bold'
  }
  return 'solar:check-circle-bold'
})

// Check if form is complete
const isFormComplete = computed(() => {
  return !!(formData.value.first_name?.trim()
    && formData.value.last_name?.trim()
    && (selectedAvatar.value || formData.value.avatar || profile.value?.avatar))
})

// Check if submit button should be disabled
const isSubmitDisabled = computed(() => {
  return !isFormComplete.value || loading.value || isUploading.value
})

// Get disabled reason
const disabledReason = computed(() => {
  if (loading.value)
    return t('global.loading.message')
  if (isUploading.value)
    return t('onboarding.navigation.uploading', { progress: uploadProgress.value })
  if (!formData.value.first_name?.trim())
    return t('onboarding.validation.firstNameRequired')
  if (!formData.value.last_name?.trim())
    return t('onboarding.validation.lastNameRequired')
  if (!selectedAvatar.value && !formData.value.avatar && !profile.value?.avatar)
    return t('onboarding.validation.avatarRequired')
  return ''
})

// Handle form submit
async function handleSubmit() {
  try {
    await formRef.value.validate()
    await saveProfile()
  }
  catch (error) {
    console.error('Validation error:', error)
  }
}

// Save profile
async function saveProfile() {
  try {
    loading.value = true

    // Prepare update data
    const updateData: any = {
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
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

    // Load cart to check if there are items
    await cartStore.loadCart()

    notification.success({ message: 'Cập nhật thông tin thành công!' })

    // Redirect to checkout if cart has items, otherwise to learning page
    if (cartStore.totalItems > 0) {
      router.push('/checkout')
    }
    else {
      router.push('/learning')
    }
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
        <!-- <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Icon name="solar:user-circle-bold" size="32" class="text-white" />
        </div> -->
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ stepTitle }}
        </h1>
        <p class="text-gray-600">
          {{ stepDescription }}
        </p>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <!-- Step Content -->
          <div class="mb-8">
            <OnboardingStep1
              v-model:form-data="formData"
              v-model:avatar-preview="avatarPreview"
              v-model:selected-avatar="selectedAvatar"
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
          <div class="flex justify-end">
            <a-tooltip
              :title="isSubmitDisabled ? disabledReason : ''"
              placement="top"
            >
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="loading"
                :disabled="isSubmitDisabled"
                class="min-w-[160px] !flex !items-center !justify-center !gap-1"
              >
                <Icon
                  :name="buttonIcon"
                  size="16"
                />
                {{ buttonText }}
              </a-button>
            </a-tooltip>
          </div>

          <!-- Form Completion Indicator -->
          <div v-if="!isFormComplete && !loading && !isUploading" class="mt-4 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Icon name="solar:info-circle-bold" size="16" class="text-amber-600" />
              <span class="text-sm text-amber-700">
                {{ disabledReason }}
              </span>
            </div>
          </div>
        </a-form>
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
  background: #16A34A;
  border: none;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: #15803D;
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
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
