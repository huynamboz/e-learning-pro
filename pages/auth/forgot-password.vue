<script setup lang="ts">
import type { ResetRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

const { resetPassword, confirmPassword } = useAuth()

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const formState = reactive<ResetRequest>({
  email: '',
  token: '',
  new_password: '',
  new_password2: '',
})

const isReset = ref<boolean>(false)
const loading = ref<boolean>(false)

async function onFinish() {
  loading.value = true

  try {
    if (!isReset.value) {
      const result = await resetPassword(formState.email)

      if (result.success) {
        if (result.token) {
          formState.token = result.token
        }
        isReset.value = true
        notification.success({
          message: 'Password reset email sent successfully!',
        })
      }
      else {
        notification.error({
          message: result.error || 'Failed to send password reset email',
        })
      }
    }
    else {
      if (formState.new_password !== formState.new_password2) {
        notification.error({
          message: 'Password confirmation does not match',
        })
        return
      }

      const confirmData = {
        token: formState.token,
        new_password: formState.new_password,
        new_password2: formState.new_password2,
      }

      const result = await confirmPassword(confirmData)

      if (result.success) {
        notification.success({
          message: 'Password reset successful! Please login.',
        })
        await navigateTo('/auth/login')
      }
      else {
        notification.error({
          message: result.error || 'Password reset failed',
        })
      }
    }
  }
  catch {
    notification.error({
      message: 'An error occurred, please try again',
    })
  }
  finally {
    loading.value = false
  }
}

function goBack() {
  if (isReset.value) {
    isReset.value = false
  }
  else {
    navigateTo('/auth/login')
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <!-- Form Section -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      <div class="w-full max-w-md">
        <a-form
          :model="formState"
          name="forgot-password"
          autocomplete="off"
          layout="vertical"
          class="space-y-6"
          @finish="onFinish"
        >
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <div class="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-lg mb-6">
              <Icon name="solar:lock-password-unlocked-bold" size="64" class="text-white" />
            </div>
            <h1 class="text-gray-900 dark:text-white text-3xl sm:text-4xl font-bold mb-2">
              {{ !isReset ? 'Forgot Password?' : 'Reset Password' }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              {{ !isReset ? 'No worries, we\'ll send you reset instructions' : 'Enter your new password below' }}
            </p>
          </div>

          <!-- Email Input -->
          <div v-if="!isReset">
            <a-form-item
              label="Email Address"
              name="email"
              :rules="[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]"
              class="mb-0"
            >
              <a-input
                v-model:value="formState.email"
                size="large"
                placeholder="your.email@example.com"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:letter-bold" size="20" class="text-gray-400" />
                </template>
              </a-input>
            </a-form-item>
          </div>

          <!-- Reset Password Form -->
          <div v-else class="space-y-4">
            <a-form-item
              label="New Password"
              name="new_password"
              :rules="[
                { required: true, message: 'Please input your new password!' },
                { min: 8, message: 'Password must be at least 8 characters long' }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.new_password"
                placeholder="Create a new password"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:lock-password-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item
              label="Confirm Password"
              name="new_password2"
              :rules="[
                { required: true, message: 'Please confirm your password!' },
                { min: 8, message: 'Confirm password must be at least 8 characters long' }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.new_password2"
                placeholder="Re-enter your new password"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:shield-check-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>
          </div>

          <!-- Submit Button -->
          <a-button
            type="primary"
            class="w-full !h-12 !rounded-xl !flex !items-center !justify-center text-base font-semibold !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !border-0 shadow-lg hover:shadow-xl transition-all"
            html-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">{{ !isReset ? 'Send Reset Email' : 'Reset Password' }}</span>
            <Icon v-if="!loading" class="ml-2 text-lg" name="solar:arrow-right-bold" />
          </a-button>

          <!-- Back to Login -->
          <div class="text-center mt-6">
            <a-button
              type="text"
              class="!text-gray-600 !flex items-center justify-center hover:!text-green-600 font-semibold transition-colors !p-0 !h-auto"
              @click="goBack"
            >
              <Icon name="solar:arrow-left-bold" size="18" class="mr-2" />
              {{ isReset ? 'Back to Email' : 'Back to Login' }}
            </a-button>
          </div>

          <!-- Help Text -->
          <div v-if="!isReset" class="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div class="flex items-start gap-3">
              <Icon name="solar:info-circle-bold" size="20" class="text-blue-600 mt-0.5" />
              <div class="text-sm text-gray-700 text-left">
                <p class="font-semibold mb-1">Can't find the email?</p>
                <p class="text-gray-600">Check your spam folder or try using a different email address.</p>
              </div>
            </div>
          </div>
        </a-form>
      </div>
    </div>

    <!-- Image Section -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-500 to-green-700 items-center justify-center p-12">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div class="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div class="relative z-10 text-white max-w-lg">
        <div class="mb-8">
          <Icon name="solar:shield-check-bold" size="64" class="text-white/90 mb-6" />
          <h2 class="text-4xl font-bold mb-4">
            Account Security
          </h2>
          <p class="text-lg text-white/90 leading-relaxed">
            We take your account security seriously. Follow the instructions sent to your email to reset your password safely.
          </p>
        </div>

        <!-- Security Tips -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Use a strong, unique password</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Don't share your password</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Enable two-factor authentication</span>
          </div>
        </div>

        <!-- Support -->
        <div class="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur border border-white/20">
          <div class="flex items-start gap-3">
            <Icon name="solar:question-circle-bold" size="24" class="text-white/90 mt-1" />
            <div>
              <h3 class="font-semibold text-lg mb-2">Need Help?</h3>
              <p class="text-sm text-white/80 mb-3">
                If you're having trouble resetting your password, our support team is here to help.
              </p>
              <a href="#" class="text-sm font-semibold text-white underline hover:text-white/80 transition-colors">
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom input styles */
:deep(.ant-input-affix-wrapper) {
  border-radius: 0.75rem;
}

:deep(.ant-input) {
  border-radius: 0.75rem;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
}

/* Smooth transitions */
button, a {
  transition: all 0.2s ease;
}
</style>
