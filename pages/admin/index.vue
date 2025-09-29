<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

// Set page title
useHead({
  title: 'Dashboard',
})
</script>

<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Welcome to the admin panel. Manage your e-learning platform from here.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              1,234
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Courses
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              89
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-heroicons-tag" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Categories
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              12
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Revenue
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              $12,345
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          to="/admin/users"
          class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              Manage Users
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              View and manage user accounts
            </p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/courses"
          class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              Manage Courses
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Review and approve courses
            </p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/admin/settings"
          class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-gray-600 dark:text-gray-400 mr-3" />
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              Settings
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Configure platform settings
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div class="space-y-4">
        <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">
              New user <span class="font-medium">John Doe</span> registered
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              2 hours ago
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-full">
            <UIcon name="i-heroicons-academic-cap" class="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">
              Course <span class="font-medium">"React Fundamentals"</span> was published
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              4 hours ago
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">
              Course <span class="font-medium">"Advanced JavaScript"</span> needs review
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              6 hours ago
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
