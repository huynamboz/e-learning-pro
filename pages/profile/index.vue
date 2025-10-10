<script setup lang="ts">
import { useAuth } from '#imports'
import { message } from 'ant-design-vue'
import ProfileSidebar from '~/components/profile/ProfileSidebar.vue'

import {
  mockUserProfile,
} from '~/resources/learning'

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
const { fetchProfile, user } = useAuth()
const userProfile = ref(mockUserProfile)
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

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="bg-white p-6">
    <div class="flex gap-6 mx-auto items-start sm:flex-row flex-col">
      <!-- Profile Sidebar -->
      <ProfileSidebar
        :user-profile="userProfile"
        :active-tab="activeTab"
        @tab-change="handleTabChange"
        @share-profile="handleShareProfile"
      />

      <ProfileListCourses v-if="activeTab === 'MY_COURSES'" />
      <ProfileForm v-if="activeTab === 'PROFILE'" :data-profile="userProfileData" :is-fetching-profile="isFetchingProfile" />
    </div>
  </div>
</template>
