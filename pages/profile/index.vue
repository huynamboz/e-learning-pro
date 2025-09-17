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

// Reactive data
const userProfile = ref(mockUserProfile)
const activeTab = ref('PROFILE')

// Event handlers
function handleTabChange(tabKey: string) {
  activeTab.value = tabKey
}

function handleShareProfile() {
  message.success('Profile link copied to clipboard!')
}
</script>

<template>
  <div class="bg-white p-6">
    <div class="flex gap-6 mx-auto items-start">
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
