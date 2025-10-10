<script setup lang="ts">
// Define page meta
const { $i18n } = useNuxtApp()

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

// Set page title
useHead({
  title: 'Settings',
})

// Reactive data
const activeTab = ref('general')

const settingsTabs = computed(() => [
  { id: 'general', label: $t('admin.settings.tabs.general'), icon: 'i-heroicons-cog-6-tooth' },
  { id: 'users', label: $t('admin.settings.tabs.users'), icon: 'i-heroicons-users' },
  { id: 'courses', label: $t('admin.settings.tabs.courses'), icon: 'i-heroicons-academic-cap' },
  { id: 'language', label: $t('admin.settings.tabs.language'), icon: 'i-heroicons-language' },
])

// Language settings with cookie persistence
const languageCookie = useCookie('locale', {
  default: () => 'vi',
  maxAge: 60 * 60 * 24 * 365, // 1 year
})

const settings = ref({
  general: {
    platformName: 'E-Learning Platform',
    platformDescription: 'A comprehensive online learning platform',
    contactEmail: 'admin@example.com',
  },
  users: {
    allowRegistration: true,
    emailVerificationRequired: true,
  },
  courses: {
    approvalRequired: true,
    maxPrice: 1000,
  },
  language: {
    selectedLanguage: languageCookie.value,
  },
})

// Available languages
const availableLanguages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

// Language switching function
function switchLanguage(languageCode: string) {
  settings.value.language.selectedLanguage = languageCode
  languageCookie.value = languageCode
  // Trigger i18n locale change
  $i18n.locale.value = languageCode
}



// Methods
function saveSettings() {
  // Save language setting to cookie
  languageCookie.value = settings.value.language.selectedLanguage
  // Implement other save logic here
}
</script>

<template>
  <div class="admin-settings">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        {{ $t('admin.settings.title') }}
      </h1>
      <p class="mt-2 text-gray-600">
        {{ $t('admin.settings.description') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="tab in settingsTabs"
            :key="tab.id"
            class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ $t('admin.settings.general.title') }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('admin.settings.general.platformName') }}
                </label>
                <input
                  v-model="settings.general.platformName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('admin.settings.general.platformDescription') }}
                </label>
                <textarea
                  v-model="settings.general.platformDescription"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('admin.settings.general.contactEmail') }}
                </label>
                <input
                  v-model="settings.general.contactEmail"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- User Settings -->
        <div v-if="activeTab === 'users'" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ $t('admin.settings.users.title') }}
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ $t('admin.settings.users.allowRegistration') }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ $t('admin.settings.users.allowRegistrationDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.users.allowRegistration"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ $t('admin.settings.users.emailVerificationRequired') }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ $t('admin.settings.users.emailVerificationDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.users.emailVerificationRequired"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Settings -->
        <div v-if="activeTab === 'courses'" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ $t('admin.settings.courses.title') }}
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">
                    {{ $t('admin.settings.courses.approvalRequired') }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ $t('admin.settings.courses.approvalRequiredDesc') }}
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.courses.approvalRequired"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('admin.settings.courses.maxPrice') }}
                </label>
                <input
                  v-model="settings.courses.maxPrice"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Language Settings -->
        <div v-if="activeTab === 'language'" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              {{ $t('admin.settings.language.title') }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('admin.settings.language.selectLanguage') }}
                </label>
                <p class="text-sm text-gray-500 mb-4">
                  {{ $t('admin.settings.language.languageDesc') }}
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="language in availableLanguages"
                    :key="language.code"
                    class="relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                    :class="settings.language.selectedLanguage === language.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'"
                    @click="switchLanguage(language.code)"
                  >
                    <div class="flex items-center space-x-3">
                      <span class="text-2xl">{{ language.flag }}</span>
                      <div>
                        <h3 class="font-medium text-gray-900">
                          {{ language.name }}
                        </h3>
                        <p class="text-sm text-gray-500">
                          {{ language.code.toUpperCase() }}
                        </p>
                      </div>
                    </div>
                    <div
                      v-if="settings.language.selectedLanguage === language.code"
                      class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Icon name="i-heroicons-check" class="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 mb-2">
                  {{ $t('admin.settings.language.currentLanguage') }}
                </h4>
                <p class="text-sm text-gray-600">
                  {{ availableLanguages.find(lang => lang.code === settings.language.selectedLanguage)?.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="saveSettings"
          >
            {{ $t('admin.settings.saveSettings') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
