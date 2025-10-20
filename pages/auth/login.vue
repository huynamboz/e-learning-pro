<script setup lang="ts">
import type { LoginRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'
import { GoogleSignInButton } from 'vue3-google-signin'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login, loginWithGoogle } = useAuth()
const { t } = useI18n()
const config = useRuntimeConfig()
const googleLoading = ref(false)

// Handle Google login success
async function handleGoogleSuccess(response: any) {
  if (response.credential) {
    googleLoading.value = true
    const result = await loginWithGoogle(response.credential)

    if (result.success) {
      if (result.isNewUser) {
        notification.success({
          message: t('auth.login.notifications.googleWelcome') || 'Welcome! Your account has been created successfully.',
        })
      }
      else {
        notification.success({
          message: t('auth.login.notifications.googleSuccess') || 'Welcome back!',
        })
      }
    }
    else {
      notification.error({
        message: result.error || t('auth.login.notifications.googleFailed') || 'Google login failed',
      })
    }
  }
  googleLoading.value = false
}

// Handle Google login error
function handleGoogleError(error: any) {
  console.error('Google login error:', error)

  // Handle specific Google OAuth errors
  let errorMessage = t('auth.login.notifications.googleFailed') || 'Google login failed'

  if (error?.type === 'popup_closed_by_user') {
    errorMessage = t('auth.login.notifications.googlePopupClosed') || 'Login was cancelled'
  }
  else if (error?.type === 'access_denied') {
    errorMessage = t('auth.login.notifications.googleAccessDenied') || 'Access denied by Google'
  }
  else if (error?.type === 'popup_blocked') {
    errorMessage = t('auth.login.notifications.googlePopupBlocked') || 'Popup was blocked. Please allow popups for this site.'
  }

  notification.error({ message: errorMessage })
}

const formState = reactive<LoginRequest>({
  email: '',
  password: '',
})

const loading = ref(false)

async function onFinish() {
  loading.value = true

  try {
    const result = await login(formState)

    if (result.success) {
      notification.success({ message: t('auth.login.notifications.success') })
    }
    else {
      notification.error({ message: result.error || t('auth.login.notifications.failed') })
    }
  }
  catch {
    notification.error({ message: t('auth.login.notifications.error') })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <!-- Form Section -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12">
      <div class="w-full max-w-md">
        <a-form
          :model="formState"
          name="basic"
          autocomplete="off"
          layout="vertical"
          class="space-y-6"
          @finish="onFinish"
        >
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <div class="inline-block p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-lg mb-6">
              <img src="@/assets/images/logo.png" class="rounded-lg w-16 h-16 sm:w-20 sm:h-20 object-cover" alt="logo">
            </div>
            <h1 class="text-gray-900 dark:text-white text-3xl sm:text-4xl font-bold mb-2">
              {{ t('auth.login.form.title') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              {{ t('auth.login.form.subtitle') }}
            </p>
          </div>

          <!-- Form Fields -->
          <div class="space-y-5">
            <a-form-item
              :label="t('auth.login.form.email')"
              name="email"
              :rules="[
                { required: true, message: t('auth.login.form.emailRequired') },
                { type: 'email', message: t('auth.login.form.emailInvalid') },
              ]"
              class="mb-0"
            >
              <a-input
                v-model:value="formState.email"
                size="large"
                placeholder="email@example.com"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:letter-bold" size="20" class="text-gray-400" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
              :label="t('auth.login.form.password')"
              name="password"
              :rules="[{ required: true, message: t('auth.login.form.passwordRequired') }]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password"
                :placeholder="t('auth.login.form.passwordPlaceholder')"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:lock-password-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>
          </div>

          <!-- Remember & Forgot Password -->
          <div class="flex items-center justify-between">
            <a-checkbox class="text-sm text-gray-600">
              {{ t('auth.login.form.rememberMe') }}
            </a-checkbox>
            <NuxtLink
              class="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
              to="/auth/forgot-password"
            >
              {{ t('auth.login.form.forgotPassword') }}
            </NuxtLink>
          </div>

          <!-- Sign In Button -->
          <a-button
            type="primary"
            class="w-full !h-12 !rounded-xl !flex !items-center !justify-center text-base font-semibold !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !border-0 shadow-lg hover:shadow-xl transition-all"
            html-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">{{ t('auth.login.form.submitButton') }}</span>
            <Icon v-if="!loading" class="ml-2 text-lg" name="solar:arrow-right-bold" />
            <span v-if="loading" class="ml-2">
              {{ t('auth.login.form.loading') }}
            </span>
          </a-button>

          <!-- Divider -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">
                {{ t('auth.login.form.divider') }}
              </span>
            </div>
          </div>

          <!-- Social Sign In -->
          <div class="flex justify-center">
            <GoogleSignInButton
              v-if="config.public.googleClientId"
              :loading="googleLoading"
              @success="handleGoogleSuccess"
              @error="handleGoogleError"
            />
          </div>

          <!-- Sign Up Link -->
          <div class="flex justify-center gap-1 text-center mt-6 p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">{{ t('auth.login.form.registerPrompt') }} </span>
            <NuxtLink
              to="/auth/register"
              class="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              {{ t('auth.login.form.registerLink') }}
            </NuxtLink>
          </div>
        </a-form>
      </div>
    </div>

    <!-- Image Section -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-500 to-green-700 items-center justify-center">
      <img src="/images/italia.jpg" class="w-full h-full object-cover" alt="">
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
