<script setup lang="ts">
import { useAuth } from '#imports'
import { message } from 'ant-design-vue'
// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

// Get route and router
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Reactive data
const { fetchProfile, user, profile } = useAuth()
const isFetchingProfile = ref(false)

// Use user data directly
const userProfileData = computed(() => {
  return user.value || undefined
})

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

function handleShareProfile() {
  message.success(t('profilePage.shareProfileSuccess'))
}

function formatDate(dateString: string | undefined) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Enhanced Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="flex items-center gap-6">
          <a-avatar :src="profile?.avatar" v-if="profile?.avatar" :size="80" class="bg-green-500 shadow-lg">
            <span class="text-2xl font-semibold text-white">
              {{ (profile?.first_name || userProfileData?.first_name || 'U')[0].toUpperCase() }}
            </span>
          </a-avatar>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-1">
              {{ profile?.first_name || userProfileData?.first_name }} {{ profile?.last_name || userProfileData?.last_name }}
            </h1>
            <p class="text-gray-600 text-lg mb-3">
              {{ profile?.email || userProfileData?.email }}
            </p>
            <div class="flex items-center space-x-6 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Icon name="i-heroicons-calendar-days" class="w-4 h-4" />
                <span>Tham gia từ {{ formatDate(profile?.created_at || userProfileData?.created_at) }}</span>
              </div>
              <!-- <div class="flex items-center space-x-2">
                <Icon name="i-heroicons-academic-cap" class="w-4 h-4" />
                <span>{{ profile?.enrolled_courses?.length || 0 }} khóa học</span>
              </div> -->
            </div>
          </div>
          <div class="flex space-x-3">
            <a-button type="primary">
              <template #icon>
                <Icon name="i-heroicons-pencil" />
              </template>
              Chỉnh sửa
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Enhanced Tabs -->
      <a-card :bordered="false" class="shadow-sm">
        <a-tabs
          v-model:active-key="activeTab"
          size="large"
          @change="handleTabChange"
        >
          <a-tab-pane key="PROFILE">
            <template #tab>
              <span class="flex items-center space-x-2">
                <Icon name="i-heroicons-user" class="w-4 h-4" />
                <span>Thông tin cá nhân</span>
              </span>
            </template>
            <div class="p-6">
              <ProfileForm
                :data-profile="userProfileData"
                :is-fetching-profile="isFetchingProfile"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="MY_COURSES">
            <template #tab>
              <span class="flex items-center space-x-2">
                <Icon name="i-heroicons-academic-cap" class="w-4 h-4" />
                <span>Khóa học của tôi</span>
              </span>
            </template>
            <div class="p-6">
              <ProfileListCourses />
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>
