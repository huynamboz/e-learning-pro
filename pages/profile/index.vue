<script setup lang="ts">
import { useAuth } from '#imports'
import { useUserApi } from '~/composables/api/useUserApi'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'onboarding'],
})

// Get route and router
const route = useRoute()
const router = useRouter()

// Reactive data
const { fetchProfile, profile } = useAuth()
const { updateProfile } = useUserApi()
const { uploadWithPresignedUrl, uploadProgress, isUploading } = useFileUpload()
const { t } = useI18n()
const isFetchingProfile = ref(false)
const isEditing = ref(false)
const loading = ref(false)

// Initialize activeTab from query params or default to 'PROFILE'
const activeTab = ref((route.query.tab as string) || 'PROFILE')

// Watch for query param changes
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab as string
  }
})

// Event handlers
function handleTabChange(tabKey: string) {
  activeTab.value = tabKey
  // Update URL query param
  router.push({
    query: {
      ...route.query,
      tab: tabKey,
    },
  })
}

function formatDate(dateString: string | undefined) {
  if (!dateString)
    return t('profile.info.notAvailable')
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get gender label
function getGenderLabel(gender: string | undefined) {
  if (!gender)
    return t('profile.info.notAvailable')
  const genderMap: Record<string, string> = {
    male: t('profile.genders.male'),
    female: t('profile.genders.female'),
    other: t('profile.genders.other'),
  }
  return genderMap[gender] || t('profile.info.notAvailable')
}

// Get profession label
function getProfessionLabel(profession: string | undefined) {
  if (!profession)
    return t('profile.info.notAvailable')
  // You can add profession mapping here if needed
  return t(`onboarding.step3.jobs.${profession}`)
}

// Edit form data
const editForm = ref({
  first_name: '',
  last_name: '',
  phone_number: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  date_of_birth: '',
  contact_address: '',
  headline: '',
  bio: '',
  avatar: null as File | null,
})

// Avatar state
const avatarPreview = ref('')

// Initialize edit form
function initializeEditForm() {
  if (profile.value) {
    editForm.value = {
      first_name: profile.value.first_name || '',
      last_name: profile.value.last_name || '',
      phone_number: profile.value.phone_number || '',
      gender: profile.value.gender || '',
      date_of_birth: "",
      contact_address: profile.value.contact_address || '',
      headline: profile.value.headline || '',
      bio: profile.value.bio || '',
      avatar: null,
    }
    avatarPreview.value = profile.value.avatar || ''
  }
}

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

// Handle edit
function handleEdit() {
  isEditing.value = true
  initializeEditForm()
}

// Handle save
async function handleSave() {
  try {
    loading.value = true
    
    // Prepare update data
    const updateData: any = {
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      phone_number: editForm.value.phone_number,
      gender: editForm.value.gender || undefined,
      date_of_birth: editForm.value.date_of_birth,
      contact_address: editForm.value.contact_address,
      headline: editForm.value.headline,
      bio: editForm.value.bio,
    }

    // Handle avatar upload if new file is selected
    if (editForm.value.avatar) {
      try {
        const publicUrl = await uploadWithPresignedUrl(
          editForm.value.avatar as File,
          'Tải lên avatar thất bại',
        )
        updateData.avatar = publicUrl
      }
      catch (error) {
        console.error('Error uploading avatar:', error)
        return
      }
    }

    await updateProfile(updateData)
    await fetchProfile()
    isEditing.value = false
    message.success(t('profile.edit.success'))
  } catch (error) {
    console.error('Error updating profile:', error)
    message.error(t('profile.edit.error'))
  } finally {
    loading.value = false
  }
}

// Handle cancel
function handleCancel() {
  isEditing.value = false
  initializeEditForm()
}

// Handle avatar upload
function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error(t('onboarding.step1.notifications.invalidFileType'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error(t('onboarding.step1.notifications.fileSizeExceeded'))
      return
    }

    editForm.value.avatar = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Handle avatar remove
function handleAvatarRemove() {
  editForm.value.avatar = null
  avatarPreview.value = ''
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
/* Responsive tabs for mobile */
@media (max-width: 640px) {
  :deep(.ant-tabs) {
    overflow-x: auto;
  }
  
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
  
  :deep(.ant-tabs-tab) {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  :deep(.ant-tabs-content-holder) {
    padding-top: 16px;
  }
}

/* Ensure proper spacing on mobile */
@media (max-width: 640px) {
  :deep(.ant-card-body) {
    padding: 12px;
  }
}

/* Better text wrapping on mobile */
@media (max-width: 640px) {
  .profile-info-item {
    word-break: break-word;
  }
}
</style>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 lg:pb-8">
    <!-- Enhanced Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <a-avatar 
            v-if="profile?.avatar" 
            :src="profile?.avatar" 
            :size="80" 
            class="bg-green-500 shadow-lg flex-shrink-0"
          >
            <span class="text-2xl font-semibold text-white">
              {{ (profile?.first_name || 'U')[0].toUpperCase() }}
            </span>
          </a-avatar>
          <div class="flex-1 min-w-0 w-full sm:w-auto">
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
              {{ profile?.last_name }} {{ profile?.first_name }} 
            </h1>
            <p class="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-3 truncate">
              {{ profile?.email }}
            </p>
            <div class="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Icon name="i-heroicons-calendar-days" class="w-4 h-4 flex-shrink-0" />
                <span class="whitespace-nowrap">{{ t('profile.joinDate') }} {{ formatDate(profile?.created_at) }}</span>
              </div>
              <!-- <div class="flex items-center space-x-2">
                <Icon name="i-heroicons-academic-cap" class="w-4 h-4" />
                <span>{{ profile?.enrolled_courses?.length || 0 }} khóa học</span>
              </div> -->
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 sm:space-x-3 w-full sm:w-auto">
            <a-button 
              v-if="!isEditing" 
              class="!flex items-center justify-center gap-1 w-full sm:w-auto" 
              type="primary" 
              @click="handleEdit"
            >
              <template #icon>
                <Icon name="i-heroicons-pencil" />
              </template>
              <span class="hidden sm:inline">{{ t('profile.editButton') }}</span>
              <span class="sm:hidden">{{ t('profile.editButton') }}</span>
            </a-button>
            <template v-else>
              <a-button 
                class="!flex items-center justify-center gap-1 w-full sm:w-auto" 
                type="primary" 
                :loading="loading" 
                @click="handleSave"
              >
                <template #icon>
                  <Icon name="i-heroicons-check" />
                </template>
                <span class="hidden sm:inline">{{ t('profile.edit.save') }}</span>
                <span class="sm:hidden">{{ t('profile.edit.save') }}</span>
              </a-button>
              <a-button 
                class="!flex items-center justify-center gap-1 w-full sm:w-auto" 
                @click="handleCancel"
              >
                <template #icon>
                  <Icon name="i-heroicons-x-mark" />
                </template>
                <span class="hidden sm:inline">{{ t('profile.edit.cancel') }}</span>
                <span class="sm:hidden">{{ t('profile.edit.cancel') }}</span>
              </a-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Enhanced Tabs -->
      <a-card :bordered="false" class="shadow-sm">
        <a-tabs
          v-model:active-key="activeTab"
          size="large"
          :tab-position="'top'"
          class="profile-tabs"
          @change="handleTabChange"
        >
          <a-tab-pane key="PROFILE">
            <template #tab>
              <span class="flex items-center space-x-2">
                <Icon name="i-heroicons-user" class="w-4 h-4" />
                <span>{{ t('profile.tabs.personalInfo') }}</span>
              </span>
            </template>
            <div class="p-4 sm:p-6">
              <!-- Profile Information Overview -->
              <div v-if="profile" class="mb-6 sm:mb-8">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="i-heroicons-information-circle" class="w-4 h-5 text-blue-600 flex-shrink-0" />
                  <span>{{ t('profile.title') }}</span>
                </h3>

                <!-- Edit Form -->
                <div v-if="isEditing" class="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h4 class="text-md font-semibold text-gray-900 mb-4">{{ t('profile.edit.title') }}</h4>
                  
                  <!-- Avatar Section -->
                  <div class="mb-4 sm:mb-6">
                    <h5 class="text-sm font-medium text-gray-700 mb-3">{{ t('profile.avatar.title') }}</h5>
                    
                    <!-- Upload Progress -->
                    <div v-if="isUploading" class="mb-4">
                      <div class="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                        <span>{{ t('profile.avatar.uploading') }}</span>
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
                    
                    <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <!-- Current Avatar -->
                      <div class="relative">
                        <a-avatar :size="80" :src="avatarPreview" class="border-2 border-gray-200">
                          <span class="text-2xl font-semibold text-white">
                            {{ (profile?.first_name || 'U')[0].toUpperCase() }}
                          </span>
                        </a-avatar>
                        <!-- Loading overlay -->
                        <div v-if="isUploading" class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <Icon name="i-heroicons-arrow-path" size="20" class="text-white animate-spin" />
                        </div>
                        <!-- Remove button -->
                        <div v-if="avatarPreview && !isUploading" class="absolute -top-1 -right-1">
                          <a-button
                            type="text"
                            size="small"
                            danger
                            @click="handleAvatarRemove"
                            class="!p-1 !min-w-0 !h-6 !w-6 rounded-full bg-red-500 hover:bg-red-600"
                          >
                            <Icon name="i-heroicons-x-mark" size="12" class="text-white" />
                          </a-button>
                        </div>
                      </div>
                      
                      <!-- Upload Controls -->
                      <div class="flex-1 w-full sm:w-auto">
                        <div class="space-y-2">
                          <label 
                            class="inline-flex items-center justify-center sm:justify-start px-4 py-2 rounded-lg cursor-pointer transition-colors w-full sm:w-auto"
                            :class="isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100'"
                          >
                            <Icon 
                              :name="isUploading ? 'i-heroicons-arrow-path' : 'i-heroicons-photo'" 
                              size="16" 
                              class="mr-2 flex-shrink-0"
                              :class="isUploading ? 'text-gray-400 animate-spin' : 'text-blue-600'"
                            />
                            <span class="text-sm">{{ isUploading ? t('profile.avatar.uploading') : t('profile.avatar.upload') }}</span>
                            <input
                              type="file"
                              accept="image/*"
                              class="hidden"
                              :disabled="isUploading"
                              @change="handleAvatarUpload"
                            >
                          </label>
                          <p class="text-xs text-gray-500 text-center sm:text-left">
                            {{ t('profile.avatar.formats') }} • {{ t('profile.avatar.maxSize') }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <!-- Basic Information -->
                    <div class="space-y-3 sm:space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('onboarding.step1.name.firstName') }}</label>
                        <a-input
                          v-model:value="editForm.first_name"
                          :placeholder="t('onboarding.step1.name.firstNamePlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('onboarding.step1.name.lastName') }}</label>
                        <a-input
                          v-model:value="editForm.last_name"
                          :placeholder="t('onboarding.step1.name.lastNamePlaceholder')"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.email') }}</label>
                        <a-input
                          :value="profile.email"
                          disabled
                          class="bg-gray-100"
                        />
                        <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.phone') }}</label>
                        <a-input
                          v-model:value="editForm.phone_number"
                          :placeholder="t('profile.info.phone')"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.gender') }}</label>
                        <a-select
                          v-model:value="editForm.gender"
                          :placeholder="t('profile.info.gender')"
                          class="w-full"
                        >
                          <a-select-option value="male">{{ t('profile.genders.male') }}</a-select-option>
                          <a-select-option value="female">{{ t('profile.genders.female') }}</a-select-option>
                          <a-select-option value="other">{{ t('profile.genders.other') }}</a-select-option>
                        </a-select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.dateOfBirth') }}</label>
                        <a-date-picker
                        :value="dayjs(editForm.date_of_birth, 'YYYY-MM-DD')"
                        size="large"
                        class="w-full"
                        format="YYYY-MM-DD"
                        @change="(date: any) => editForm.date_of_birth = dayjs(date).format('YYYY-MM-DD')"
                      >
                        <template #prefix>
                          <Icon name="solar:calendar-bold" size="16" class="text-gray-400" />
                        </template>
                      </a-date-picker>
                      </div>
                    </div>

                    <!-- Additional Information -->
                    <div class="space-y-3 sm:space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.address') }}</label>
                        <a-textarea
                          v-model:value="editForm.contact_address"
                          :placeholder="t('profile.info.address')"
                          :rows="3"
                        />
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.profession') }}</label>
                        <a-select
                          v-model:value="editForm.headline"
                          :placeholder="t('profile.info.profession')"
                          class="w-full"
                        >
                          <a-select-option v-for="option in jobOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </a-select-option>
                        </a-select>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.info.bio') }}</label>
                        <a-textarea
                          v-model:value="editForm.bio"
                          :placeholder="t('profile.info.bio')"
                          :rows="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Display Mode -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <!-- Basic Information -->
                  <div class="space-y-3 sm:space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('onboarding.step1.name.firstName') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 break-words">{{ profile.first_name || t('profile.info.notAvailable') }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('onboarding.step1.name.lastName') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 break-words">{{ profile.last_name || t('profile.info.notAvailable') }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.email') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 break-all">{{ profile.email || t('profile.info.notAvailable') }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.phone') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 break-words">{{ profile.phone_number || t('profile.info.notAvailable') }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.gender') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900">{{ getGenderLabel(profile.gender) }}</span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.dateOfBirth') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900">
                        {{ profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : t('profile.info.notAvailable') }}
                      </span>
                    </div>
                  </div>

                  <!-- Additional Information -->
                  <div class="space-y-3 sm:space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.address') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 sm:text-right break-words max-w-full sm:max-w-xs">
                        {{ profile.contact_address || t('profile.info.notAvailable') }}
                      </span>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.profession') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 break-words">{{ getProfessionLabel(profile.headline) || t('profile.info.notAvailable') }}</span>
                    </div>

                    <div v-if="profile.bio" class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 py-2 border-b border-gray-100">
                      <span class="text-xs sm:text-sm font-medium text-gray-600">{{ t('profile.info.bio') }}</span>
                      <span class="text-xs sm:text-sm text-gray-900 sm:text-right break-words max-w-full sm:max-w-xs">
                        {{ profile.bio }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </a-tab-pane>

        </a-tabs>
      </a-card>
    </div>
  </div>
</template>
