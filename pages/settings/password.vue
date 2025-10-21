<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useUserApi } from '~/composables/api/useUserApi'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['auth', 'onboarding'],
  layout: 'default',
})

const { user, profile } = useAuth()
const { t } = useI18n()
const { changePassword } = useUserApi()

// Form state
const formRef = ref()
const loading = ref(false)

// Form data
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Form rules
const rules = computed(() => ({
  oldPassword: [
    { required: true, message: t('password.validation.currentPasswordRequired'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: t('password.validation.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('password.validation.newPasswordMinLength'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('password.validation.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== formData.newPassword) {
          return Promise.reject(t('password.validation.passwordsNotMatch'))
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}))

// Password strength indicator
function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 6)
    score++
  if (password.length >= 8)
    score++
  if (password.length >= 12)
    score++
  if (/[a-z]/.test(password))
    score++
  if (/[A-Z]/.test(password))
    score++
  if (/\d/.test(password))
    score++
  if (/[@$!%*?&]/.test(password))
    score++
  return Math.min(score, 5) // Cap at 5 for display
}

const passwordStrength = computed(() => {
  const score = getPasswordStrength(formData.newPassword)
  const strengthLevels = [
    t('password.strength.levels.veryWeak'),
    t('password.strength.levels.weak'),
    t('password.strength.levels.medium'),
    t('password.strength.levels.strong'),
    t('password.strength.levels.veryStrong'),
  ]
  const strength = strengthLevels[score] || t('password.strength.levels.veryWeak')
  const color = ['#ff4d4f', '#ff7a45', '#ffa940', '#52c41a', '#389e0d'][score] || '#ff4d4f'
  return { score, strength, color }
})

// Handle form submission
async function handleSubmit() {
  try {
    await formRef.value.validate()
    loading.value = true

    // Call API change password
    await changePassword({
      old_password: formData.oldPassword,
      new_password: formData.newPassword,
      new_password2: formData.confirmPassword,
    })

    message.success(t('password.notifications.success'))

    // Reset form
    formData.oldPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
    formRef.value.resetFields()
  }
  catch (error: any) {
    console.error('Error updating password:', error)

    // Handle specific error messages
    if (error?.response?.data?.details?.old_password) {
      message.error(t('password.notifications.currentPasswordIncorrect'))
    }
    else if (error?.response?.data?.details?.new_password) {
      message.error(t('password.notifications.newPasswordInvalid'))
    }
    else if (error?.response?.data?.details?.new_password2) {
      message.error(t('password.notifications.confirmPasswordMismatch'))
    }
    else if (error?.response?.data?.message) {
      message.error(error.response.data.message)
    }
    else {
      message.error(t('password.notifications.updateFailed'))
    }
  }
  finally {
    loading.value = false
  }
}

// Handle form reset
function handleReset() {
  formData.oldPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
  formRef.value.resetFields()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-shade-1 via-shade-1 to-shade-2 p-4 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-gradient-to-br from-blue to-blue/80 rounded-xl shadow-lg">
            <Icon name="solar:lock-password-bold" size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-shade-9">
              {{ t('password.title') }}
            </h1>
            <p class="text-shade-6">
              {{ t('password.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Form Section -->
        <div class="lg:col-span-2">
          <div class="bg-card border rounded-2xl p-6 sm:p-8 shadow-md">
            <h2 class="text-xl font-bold text-shade-9 mb-6 flex items-center gap-2">
              <Icon name="solar:shield-keyhole-bold" size="20" class="text-blue" />
              {{ t('password.form.title') }}
            </h2>

            <a-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              layout="vertical"
              @finish="handleSubmit"
            >
              <!-- Current Password -->
              <a-form-item :label="t('password.form.currentPassword')" name="oldPassword" class="mb-6">
                <a-input-password
                  v-model:value="formData.oldPassword"
                  :placeholder="t('password.form.currentPasswordPlaceholder')"
                  size="large"
                  class="rounded-xl"
                >
                  <template #prefix>
                    <Icon name="solar:lock-bold" size="16" class="text-shade-5" />
                  </template>
                </a-input-password>
              </a-form-item>

              <!-- New Password -->
              <a-form-item :label="t('password.form.newPassword')" name="newPassword" class="mb-4">
                <a-input-password
                  v-model:value="formData.newPassword"
                  :placeholder="t('password.form.newPasswordPlaceholder')"
                  size="large"
                  class="rounded-xl"
                >
                  <template #prefix>
                    <Icon name="solar:lock-keyhole-bold" size="16" class="text-shade-5" />
                  </template>
                </a-input-password>

                <!-- Password Strength Indicator -->
                <div v-if="formData.newPassword" class="mt-3">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm text-shade-6">{{ t('password.strength.label') }}</span>
                    <span
                      class="text-sm font-medium"
                      :style="{ color: passwordStrength.color }"
                    >
                      {{ passwordStrength.strength }}
                    </span>
                  </div>
                  <div class="flex gap-1">
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="h-2 flex-1 rounded-full transition-all duration-300"
                      :class="i <= passwordStrength.score ? 'opacity-100' : 'opacity-20'"
                      :style="{
                        backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#e5e7eb',
                      }"
                    />
                  </div>
                </div>
              </a-form-item>

              <!-- Confirm Password -->
              <a-form-item :label="t('password.form.confirmPassword')" name="confirmPassword" class="mb-8">
                <a-input-password
                  v-model:value="formData.confirmPassword"
                  :placeholder="t('password.form.confirmPasswordPlaceholder')"
                  size="large"
                  class="rounded-xl"
                >
                  <template #prefix>
                    <Icon name="solar:check-circle-bold" size="16" class="text-shade-5" />
                  </template>
                </a-input-password>
              </a-form-item>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4">
                <a-button
                  html-type="submit"
                  size="large"
                  :loading="loading"
                >
                  {{ t('password.form.updateButton') }}
                </a-button>

                <a-button
                  size="large"
                  @click="handleReset"
                >
                  {{ t('password.form.resetButton') }}
                </a-button>
              </div>
            </a-form>
          </div>
        </div>

        <!-- Account Info Sidebar -->
        <div class="lg:col-span-1">
          <div class="space-y-6">
            <!-- Account Info -->
            <div class="bg-card border rounded-2xl p-6 shadow-md">
              <h3 class="text-lg font-bold text-shade-9 mb-4 flex items-center gap-2">
                <Icon name="solar:user-circle-bold" size="20" class="text-blue" />
                {{ t('password.accountInfo.title') }}
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-blue-100 rounded-lg">
                    <Icon name="solar:user-bold" size="16" class="text-blue-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-shade-9">
                      {{ profile?.first_name || 'N/A' }}
                    </p>
                    <p class="text-xs text-shade-6">
                      {{ profile?.last_name || 'N/A' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-green-100 rounded-lg">
                    <Icon name="solar:letter-unread-bold" size="16" class="text-green-600" />
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-medium text-shade-9 line-clamp-1 truncate">
                      {{ user?.email || 'N/A' }}
                    </p>
                    <p class="text-xs text-shade-6">
                      {{ t('password.accountInfo.email') }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-orange-100 rounded-lg">
                    <Icon name="solar:calendar-bold" size="16" class="text-orange-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-shade-9">
                      {{ profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A' }}
                    </p>
                    <p class="text-xs text-shade-6">
                      {{ t('password.accountInfo.joinDate') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better visual appeal */
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: var(--shade-9);
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: var(--blue);
}

:deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--blue);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, var(--blue), var(--blue-dark));
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

:deep(.ant-btn) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
}
</style>
