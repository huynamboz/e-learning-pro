<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8">API Integration Test</h1>
      
      <!-- API Test Demo Component -->
      <ApiTestDemo />
      
      <!-- API Info -->
      <div class="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">API Configuration</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-2">Base URL</h3>
            <p class="text-sm font-mono bg-gray-100 p-2 rounded">{{ apiBaseUrl }}</p>
          </div>
          
          <div>
            <h3 class="font-semibold mb-2">Device ID</h3>
            <p class="text-sm font-mono bg-gray-100 p-2 rounded">{{ deviceId }}</p>
          </div>
        </div>
        
        <div class="mt-6">
          <h3 class="font-semibold mb-2">Test Endpoints</h3>
          <ul class="text-sm space-y-1">
            <li><code class="bg-gray-100 px-2 py-1 rounded">POST /auth/login/</code> - Login with email/password</li>
            <li><code class="bg-gray-100 px-2 py-1 rounded">GET /auth/me/</code> - Get user profile (protected)</li>
            <li><code class="bg-gray-100 px-2 py-1 rounded">POST /auth/refresh/</code> - Refresh access token</li>
          </ul>
        </div>
        
        <div class="mt-6">
          <h3 class="font-semibold mb-2">Headers</h3>
          <ul class="text-sm space-y-1">
            <li><code class="bg-gray-100 px-2 py-1 rounded">Content-Type: application/json</code></li>
            <li><code class="bg-gray-100 px-2 py-1 rounded">X-Device-ID: {{ deviceId }}</code></li>
            <li><code class="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer [token]</code> (when authenticated)</li>
          </ul>
        </div>
        
        <div class="mt-6">
          <h3 class="font-semibold mb-2">Features</h3>
          <ul class="text-sm space-y-1 list-disc list-inside">
            <li>Functional programming API client</li>
            <li>Automatic 401 error handling with logout</li>
            <li>Token refresh before expiration</li>
            <li>Device ID generation and persistence</li>
            <li>Type-safe requests and responses</li>
            <li>Error handling with proper status codes</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const apiBaseUrl = computed(() => config.public.apiBase)

const deviceId = computed(() => {
  if (process.client) {
    return localStorage.getItem('device-id') || 'Not generated yet'
  }
  return 'Server-side rendering'
})

// Set page meta
definePageMeta({
  layout: 'default',
  title: 'API Test'
})
</script>
