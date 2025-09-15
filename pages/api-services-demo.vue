<script setup lang="ts">
import {
  useAuthApi,
  useCourseApi,
  useUserApi,
} from '~/composables/api'
import { useAuth } from '~/composables/useAuth'

const { isLoggedIn } = useAuth()

// API instances
const authApi = useAuthApi()
const userApi = useUserApi()
const courseApi = useCourseApi()

// Auth API states
const authLoading = ref(false)
const authResult = ref<any>(null)
const authError = ref('')

// User API states
const userLoading = ref(false)
const userResult = ref<any>(null)
const userError = ref('')

// Course API states
const courseLoading = ref(false)
const courseResult = ref<any>(null)
const courseError = ref('')

// Auth API tests
async function testAuthLogin() {
  authLoading.value = true
  authError.value = ''
  authResult.value = null

  try {
    const result = await authApi.login({
      email: 'admin@gmail.com',
      password: 'admin123',
    })
    authResult.value = result
  }
  catch (error: any) {
    authError.value = error.statusMessage || error.message || 'Login failed'
  }
  finally {
    authLoading.value = false
  }
}

async function testAuthRefresh() {
  authLoading.value = true
  authError.value = ''
  authResult.value = null

  try {
    const result = await authApi.refreshToken()
    authResult.value = result
  }
  catch (error: any) {
    authError.value = error.statusMessage || error.message || 'Refresh failed'
  }
  finally {
    authLoading.value = false
  }
}

// User API tests
async function testUserProfile() {
  userLoading.value = true
  userError.value = ''
  userResult.value = null

  try {
    const result = await userApi.getProfile()
    userResult.value = result
  }
  catch (error: any) {
    userError.value = error.statusMessage || error.message || 'Get profile failed'
  }
  finally {
    userLoading.value = false
  }
}

async function testUserUpdate() {
  userLoading.value = true
  userError.value = ''
  userResult.value = null

  try {
    const result = await userApi.updateProfile({
      first_name: 'Updated Name',
    })
    userResult.value = result
  }
  catch (error: any) {
    userError.value = error.statusMessage || error.message || 'Update profile failed'
  }
  finally {
    userLoading.value = false
  }
}

// Course API tests
async function testCourseList() {
  courseLoading.value = true
  courseError.value = ''
  courseResult.value = null

  try {
    const result = await courseApi.getCourses({ limit: 5 })
    courseResult.value = result
  }
  catch (error: any) {
    courseError.value = error.statusMessage || error.message || 'Get courses failed'
  }
  finally {
    courseLoading.value = false
  }
}

async function testCourseSearch() {
  courseLoading.value = true
  courseError.value = ''
  courseResult.value = null

  try {
    const result = await courseApi.searchCourses('javascript', { limit: 3 })
    courseResult.value = result
  }
  catch (error: any) {
    courseError.value = error.statusMessage || error.message || 'Search courses failed'
  }
  finally {
    courseLoading.value = false
  }
}

// Set page meta
definePageMeta({
  layout: 'default',
  title: 'API Services Demo',
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8">
        API Services Demo
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Auth API Demo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-blue-600">
            Auth API
          </h2>

          <div class="space-y-4">
            <button
              :disabled="authLoading"
              class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              @click="testAuthLogin"
            >
              {{ authLoading ? 'Testing...' : 'Test Login' }}
            </button>

            <button
              :disabled="!isLoggedIn || authLoading"
              class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              @click="testAuthRefresh"
            >
              Test Refresh Token
            </button>

            <div v-if="authResult" class="bg-gray-50 p-3 rounded text-sm">
              <strong>Result:</strong>
              <pre>{{ JSON.stringify(authResult, null, 2) }}</pre>
            </div>

            <div v-if="authError" class="text-red-500 text-sm">
              <strong>Error:</strong> {{ authError }}
            </div>
          </div>
        </div>

        <!-- User API Demo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-green-600">
            User API
          </h2>

          <div class="space-y-4">
            <button
              :disabled="!isLoggedIn || userLoading"
              class="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              @click="testUserProfile"
            >
              {{ userLoading ? 'Loading...' : 'Get Profile' }}
            </button>

            <button
              :disabled="!isLoggedIn || userLoading"
              class="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
              @click="testUserUpdate"
            >
              Test Update Profile
            </button>

            <div v-if="userResult" class="bg-gray-50 p-3 rounded text-sm">
              <strong>Result:</strong>
              <pre>{{ JSON.stringify(userResult, null, 2) }}</pre>
            </div>

            <div v-if="userError" class="text-red-500 text-sm">
              <strong>Error:</strong> {{ userError }}
            </div>
          </div>
        </div>

        <!-- Course API Demo -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 text-purple-600">
            Course API
          </h2>

          <div class="space-y-4">
            <button
              :disabled="courseLoading"
              class="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 disabled:opacity-50"
              @click="testCourseList"
            >
              {{ courseLoading ? 'Loading...' : 'Get Courses' }}
            </button>

            <button
              :disabled="courseLoading"
              class="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 disabled:opacity-50"
              @click="testCourseSearch"
            >
              Search Courses
            </button>

            <div v-if="courseResult" class="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
              <strong>Result:</strong>
              <pre>{{ JSON.stringify(courseResult, null, 2) }}</pre>
            </div>

            <div v-if="courseError" class="text-red-500 text-sm">
              <strong>Error:</strong> {{ courseError }}
            </div>
          </div>
        </div>
      </div>

      <!-- Simple API Demo -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-bold mb-4 text-orange-600">
          Simplified API Client
        </h2>

        <div class="bg-green-50 p-4 rounded-md">
          <h3 class="font-semibold text-green-800 mb-2">
            ✅ Refactored Features:
          </h3>
          <ul class="text-sm text-green-700 space-y-1">
            <li>• Removed token expiry checking logic</li>
            <li>• Simple 401 → logout flow</li>
            <li>• Cleaner, more maintainable code</li>
            <li>• Functional programming approach</li>
            <li>• Automatic device ID headers</li>
          </ul>
        </div>

        <div class="bg-blue-50 p-4 rounded-md mt-4">
          <h3 class="font-semibold text-blue-800 mb-2">
            🔄 How it works:
          </h3>
          <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Make API request with token</li>
            <li>If 401 response → clear auth state & redirect to login</li>
            <li>No complex token validation or refresh logic</li>
            <li>Simple and reliable</li>
          </ol>
        </div>
      </div>

      <!-- API Structure Info -->
      <div class="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 class="text-xl font-bold mb-4">
          New API Structure
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="font-semibold mb-2">
              📁 composables/api/
            </h3>
            <ul class="text-sm space-y-1">
              <li><code class="bg-gray-100 px-2 py-1 rounded">useAuthApi.ts</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">useUserApi.ts</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">useCourseApi.ts</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">useApiService.ts</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">index.ts</code></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-2">
              🔧 Usage Examples
            </h3>
            <div class="text-sm space-y-2">
              <div><code class="bg-gray-100 px-2 py-1 rounded text-xs">import { useAuthApi } from '~/composables/api'</code></div>
              <div><code class="bg-gray-100 px-2 py-1 rounded text-xs">const authApi = useAuthApi()</code></div>
              <div><code class="bg-gray-100 px-2 py-1 rounded text-xs">await authApi.login(credentials)</code></div>
            </div>
          </div>

          <div>
            <h3 class="font-semibold mb-2">
              🚀 Key Features
            </h3>
            <ul class="text-sm space-y-1">
              <li><code class="bg-gray-100 px-2 py-1 rounded">Auto 401 logout</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">Device ID headers</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">Functional API</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">Type-safe</code></li>
              <li><code class="bg-gray-100 px-2 py-1 rounded">Modular services</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
