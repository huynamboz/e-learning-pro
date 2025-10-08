<script setup lang="ts">
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

// Reactive data
const userProfile = ref(mockUserProfile)

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
  message.success('Profile link copied to clipboard!')
}
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
      <ProfileForm v-if="activeTab === 'PROFILE'" />
    </div>
  </div>
</template>
