<script setup lang="ts">
import type { ResetRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

const { resetPassword, confirmPassword } = useAuth()
const { t } = useI18n()

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
          message: t('auth.forgotPassword.notifications.emailSent'),
        })
      }
      else {
        notification.error({
          message: result.error || t('auth.forgotPassword.notifications.emailFailed'),
        })
      }
    }
    else {
      if (formState.new_password !== formState.new_password2) {
        notification.error({
          message: t('auth.forgotPassword.notifications.passwordMismatch'),
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
          message: t('auth.forgotPassword.notifications.resetSuccess'),
        })
        await navigateTo('/auth/login')
      }
      else {
        notification.error({
          message: result.error || t('auth.forgotPassword.notifications.resetFailed'),
        })
      }
    }
  }
  catch {
    notification.error({
      message: t('auth.forgotPassword.notifications.error'),
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
              {{ !isReset ? t('auth.forgotPassword.form.title') : t('auth.forgotPassword.form.resetTitle') }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              {{ !isReset ? t('auth.forgotPassword.form.subtitle') : t('auth.forgotPassword.form.resetSubtitle') }}
            </p>
          </div>

          <!-- Email Input -->
          <div v-if="!isReset">
            <a-form-item
              :label="t('auth.forgotPassword.form.email')"
              name="email"
              :rules="[
                { required: true, message: t('auth.forgotPassword.form.emailRequired') },
                { type: 'email', message: t('auth.forgotPassword.form.emailInvalid') }
              ]"
              class="mb-0"
            >
              <a-input
                v-model:value="formState.email"
                size="large"
                :placeholder="t('auth.forgotPassword.form.emailPlaceholder')"
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
              :label="t('auth.forgotPassword.form.newPassword')"
              name="new_password"
              :rules="[
                { required: true, message: t('auth.forgotPassword.form.newPasswordRequired') },
                { min: 8, message: t('auth.forgotPassword.form.passwordMinLength') }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.new_password"
                :placeholder="t('auth.forgotPassword.form.newPasswordPlaceholder')"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:lock-password-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item
              :label="t('auth.forgotPassword.form.confirmPassword')"
              name="new_password2"
              :rules="[
                { required: true, message: t('auth.forgotPassword.form.confirmPasswordRequired') },
                { min: 8, message: t('auth.forgotPassword.form.confirmPasswordMinLength') }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.new_password2"
                :placeholder="t('auth.forgotPassword.form.confirmPasswordPlaceholder')"
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
            <span v-if="!loading">{{ !isReset ? t('auth.forgotPassword.form.sendButton') : t('auth.forgotPassword.form.resetButton') }}</span>
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
              {{ isReset ? t('auth.forgotPassword.form.backToEmail') : t('auth.forgotPassword.form.backToLogin') }}
            </a-button>
          </div>

          <!-- Help Text -->
          <div v-if="!isReset" class="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div class="flex items-start gap-3">
              <Icon name="solar:info-circle-bold" size="20" class="text-blue-600 mt-0.5" />
              <div class="text-sm text-gray-700 text-left">
                <p class="font-semibold mb-1">{{ t('auth.forgotPassword.form.helpTitle') }}</p>
                <p class="text-gray-600">{{ t('auth.forgotPassword.form.helpText') }}</p>
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
            {{ t('auth.forgotPassword.hero.title') }}
          </h2>
          <p class="text-lg text-white/90 leading-relaxed">
            {{ t('auth.forgotPassword.hero.description') }}
          </p>
        </div>

        <!-- Security Tips -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.forgotPassword.securityTips.strongPassword') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.forgotPassword.securityTips.dontShare') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">{{ t('auth.forgotPassword.securityTips.twoFactor') }}</span>
          </div>
        </div>

        <!-- Support -->
        <div class="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur border border-white/20">
          <div class="flex items-start gap-3">
            <Icon name="solar:question-circle-bold" size="24" class="text-white/90 mt-1" />
            <div>
              <h3 class="font-semibold text-lg mb-2">{{ t('auth.forgotPassword.support.title') }}</h3>
              <p class="text-sm text-white/80 mb-3">
                {{ t('auth.forgotPassword.support.description') }}
              </p>
              <a href="#" class="text-sm font-semibold text-white underline hover:text-white/80 transition-colors">
                {{ t('auth.forgotPassword.support.contactLink') }}
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
