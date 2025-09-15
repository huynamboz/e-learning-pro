<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">API Test Demo</h2>
    
    <!-- Login Form -->
    <div v-if="!isLoggedIn" class="space-y-4">
      <h3 class="text-lg font-semibold">Login Test</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          v-model="loginForm.email"
          type="email" 
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="admin@gmail.com"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Password</label>
        <input 
          v-model="loginForm.password"
          type="password" 
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="admin123"
        />
      </div>
      
      <button 
        @click="testLogin"
        :disabled="isLoading"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isLoading ? 'Logging in...' : 'Test Login' }}
      </button>
      
      <div v-if="loginError" class="text-red-500 text-sm">
        {{ loginError }}
      </div>
    </div>
    
    <!-- User Info -->
    <div v-else class="space-y-4">
      <h3 class="text-lg font-semibold">Logged in successfully!</h3>
      
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-medium">User Info:</h4>
        <pre class="text-sm mt-2">{{ JSON.stringify(user, null, 2) }}</pre>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-medium">Device ID:</h4>
        <p class="text-sm mt-1 font-mono">{{ deviceId }}</p>
      </div>
      
      <div class="space-y-2">
        <button 
          @click="testApiCall"
          :disabled="apiLoading"
          class="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {{ apiLoading ? 'Testing...' : 'Test Protected API Call' }}
        </button>
        
        <button 
          @click="testLogout"
          class="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <div v-if="apiResult" class="bg-gray-50 p-4 rounded-md">
        <h4 class="font-medium">API Result:</h4>
        <pre class="text-sm mt-2">{{ JSON.stringify(apiResult, null, 2) }}</pre>
      </div>
      
      <div v-if="apiError" class="text-red-500 text-sm">
        API Error: {{ apiError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useApiClient } from '~/api/apiClient'

const { user, isLoggedIn, isLoading, login, logout } = useAuth()
const apiClient = useApiClient()

// Login form
const loginForm = ref({
  email: 'admin@gmail.com',
  password: 'admin123'
})

const loginError = ref('')
const apiLoading = ref(false)
const apiResult = ref(null)
const apiError = ref('')

// Get device ID for display
const deviceId = computed(() => {
  if (process.client) {
    return localStorage.getItem('device-id') || 'Not set'
  }
  return 'Server-side'
})

// Test login
async function testLogin() {
  loginError.value = ''
  
  const result = await login(loginForm.value)
  
  if (!result.success) {
    loginError.value = result.error || 'Login failed'
  }
}

// Test protected API call
async function testApiCall() {
  apiLoading.value = true
  apiError.value = ''
  apiResult.value = null
  
  try {
    // Test getting user profile
    const result = await apiClient.get('/auth/me/')
    apiResult.value = result
  } catch (error: any) {
    apiError.value = error.statusMessage || error.message || 'API call failed'
  } finally {
    apiLoading.value = false
  }
}

// Test logout
async function testLogout() {
  await logout()
  apiResult.value = null
  apiError.value = ''
  loginError.value = ''
}
</script>
