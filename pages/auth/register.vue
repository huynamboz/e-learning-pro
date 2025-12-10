<script setup lang="ts">
import type { RegisterRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { register, login } = useAuth()
const { t } = useI18n()

const formState = reactive<RegisterRequest>({
  email: '',
  username: '',
  password2: '',
  password: '',
})

const loading = ref(false)

/**
 * Generate username from email by taking the part before @
 */
function generateUsernameFromEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return ''
  }
  return email.split('@')[0]
}

// Watch email changes and auto-generate username
watch(() => formState.email, (newEmail) => {
  if (newEmail) {
    formState.username = generateUsernameFromEmail(newEmail)
  }
})

async function onFinish() {
  // Validate password length
  if (formState.password.length < 8) {
    notification.error({
      message: t('auth.register.validation.passwordLength'),
    })
    return
  }

  // Validate passwords match
  if (formState.password !== formState.password2) {
    notification.error({
      message: t('auth.register.validation.passwordMismatch'),
    })
    return
  }

  // Auto-generate username from email if not set
  if (!formState.username && formState.email) {
    formState.username = generateUsernameFromEmail(formState.email)
  }

  // Validate username is generated
  if (!formState.username || formState.username.length < 3) {
    notification.error({
      message: t('auth.register.form.usernameMinLength'),
    })
    return
  }

  loading.value = true

  try {
    const result = await register(formState)

    if (result.success) {
      // Save account credentials to cookie for account switching feature
      const savedAccountsCookie = useCookie<Array<{ email: string, password: string }>>('saved_accounts', {
        default: () => [],
        maxAge: 60 * 60 * 24 * 365, // 1 year
        secure: true,
        sameSite: 'strict',
      })

      // Check if account already exists in saved accounts
      const existingAccountIndex = savedAccountsCookie.value.findIndex(
        account => account.email === formState.email,
      )

      if (existingAccountIndex >= 0) {
        // Update existing account
        savedAccountsCookie.value[existingAccountIndex] = {
          email: formState.email,
          password: formState.password,
        }
      }
      else {
        // Add new account
        savedAccountsCookie.value.push({
          email: formState.email,
          password: formState.password,
        })
      }

      // Auto login after successful registration
      const loginResult = await login({
        email: formState.email,
        password: formState.password,
      })

      if (loginResult.success) {
        notification.success({
          message: t('auth.register.notifications.success'),
        })
        // Navigate to home page or dashboard
        await navigateTo('/')
      }
      else {
        notification.error({
          message: loginResult.error || t('auth.register.notifications.loginFailed'),
        })
        // If auto login fails, redirect to login page
        await navigateTo('/auth/login')
      }
    }
    else {
      notification.error({
        message: result.error || t('auth.register.notifications.failed'),
      })
    }
  }
  catch (error: any) {
    console.error('Register error:', error)
    notification.error({
      message: t('auth.register.notifications.error'),
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <!-- Image Section - Left on desktop -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-500 to-green-700 items-center justify-center p-12">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div class="relative z-10 text-white max-w-lg">
        <div class="mb-8">
          <Icon name="solar:users-group-rounded-bold" size="64" class="text-white/90 mb-6" />
          <h2 class="text-4xl font-bold mb-4">
            {{ t('auth.register.hero.title') }}
          </h2>
          <p class="text-lg text-white/90 leading-relaxed">
            {{ t('auth.register.hero.description') }}
          </p>
        </div>

        <!-- Benefits -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.register.benefits.freeTrial') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.register.benefits.lifetimeAccess') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.register.benefits.qualityInstructors') }}</span>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur border border-white/20">
          <div class="flex items-center gap-3 mb-3">
            <img src="/images/avatar.jpg" alt="user" class="w-12 h-12 rounded-full border-2 border-white/50">
            <div>
              <div class="font-semibold">
                {{ t('auth.register.testimonial.name') }}
              </div>
              <div class="text-sm text-white/80">
                {{ t('auth.register.testimonial.role') }}
              </div>
            </div>
          </div>
          <p class="text-sm text-white/90 italic">
            "{{ t('auth.register.testimonial.quote') }}"
          </p>
          <div class="flex gap-1 mt-2">
            <Icon v-for="i in 5" :key="i" name="solar:star-bold" size="16" class="text-yellow-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Section - Right on desktop -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      <div class="w-full max-w-md">
        <a-form
          :model="formState"
          name="register"
          autocomplete="off"
          layout="vertical"
          class="space-y-5"
          @finish="onFinish"
        >
          <!-- Logo & Header -->
          <div class="text-center mb-8">
            <h1 class="text-gray-900 dark:text-white text-3xl sm:text-4xl font-bold mb-2">
              {{ t('auth.register.form.title') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              {{ t('auth.register.form.subtitle') }}
            </p>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <!-- Email -->
            <a-form-item
              :label="t('auth.register.form.email')"
              name="email"
              :rules="[
                { required: true, message: t('auth.register.form.emailRequired') },
                { type: 'email', message: t('auth.register.form.emailInvalid') },
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

            <!-- Password -->
            <a-form-item
              :label="t('auth.register.form.password')"
              name="password"
              :rules="[
                { required: true, message: t('auth.register.form.passwordRequired') },
                { min: 8, message: t('auth.register.form.passwordMinLength') },
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password"
                :placeholder="t('auth.register.form.passwordPlaceholder')"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:lock-password-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>

            <!-- Confirm Password -->
            <a-form-item
              :label="t('auth.register.form.confirmPassword')"
              name="password2"
              :rules="[
                { required: true, message: t('auth.register.form.confirmPasswordRequired') },
                { min: 8, message: t('auth.register.form.passwordMinLength') },
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password2"
                :placeholder="t('auth.register.form.confirmPasswordPlaceholder')"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:shield-check-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>
          </div>

          <!-- Create Account Button -->
          <a-button
            type="primary"
            class="w-full !h-12 !rounded-xl !flex !items-center !justify-center text-base font-semibold !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !border-0 shadow-lg hover:shadow-xl transition-all"
            html-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">{{ t('auth.register.form.submitButton') }}</span>
            <Icon v-if="!loading" class="ml-2 text-lg" name="solar:arrow-right-bold" />
          </a-button>

          <!-- Sign In Link -->
          <div class="flex justify-center gap-1 text-center mt-6 p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">{{ t('auth.register.form.loginPrompt') }} </span>
            <NuxtLink
              to="/auth/login"
              class="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              {{ t('auth.register.form.loginLink') }}
            </NuxtLink>
          </div>
        </a-form>
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
