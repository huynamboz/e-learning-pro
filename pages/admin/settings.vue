<template>
  <div class="admin-settings">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Platform Settings
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Configure platform-wide settings and preferences.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="tab in settingsTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === tab.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'"
          >
            <UIcon :name="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              General Settings
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  v-model="settings.general.platformName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Description
                </label>
                <textarea
                  v-model="settings.general.platformDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  v-model="settings.general.contactEmail"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- User Settings -->
        <div v-if="activeTab === 'users'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    Allow User Registration
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Allow new users to register on the platform
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.users.allowRegistration"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    Email Verification Required
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Require users to verify their email address
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.users.emailVerificationRequired"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Settings -->
        <div v-if="activeTab === 'courses'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Management
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                    Course Approval Required
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Require admin approval for new courses
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.courses.approvalRequired"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Course Price
                </label>
                <input
                  v-model="settings.courses.maxPrice"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="saveSettings"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Set page title
useHead({
  title: 'Settings'
})

// Reactive data
const activeTab = ref('general')

const settingsTabs = [
  { id: 'general', label: 'General', icon: 'i-heroicons-cog-6-tooth' },
  { id: 'users', label: 'Users', icon: 'i-heroicons-users' },
  { id: 'courses', label: 'Courses', icon: 'i-heroicons-academic-cap' }
]

const settings = ref({
  general: {
    platformName: 'E-Learning Platform',
    platformDescription: 'A comprehensive online learning platform',
    contactEmail: 'admin@example.com'
  },
  users: {
    allowRegistration: true,
    emailVerificationRequired: true
  },
  courses: {
    approvalRequired: true,
    maxPrice: 1000
  }
})

// Methods
const saveSettings = () => {
  // Implement save logic
}
</script>
