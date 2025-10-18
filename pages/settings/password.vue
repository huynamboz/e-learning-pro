<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useAuth } from '~/composables/useAuth'
import { useUserApi } from '~/composables/api/useUserApi'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { user } = useAuth()
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
const rules = {
  oldPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== formData.newPassword) {
          return Promise.reject('Mật khẩu xác nhận không khớp')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
}

// Password strength indicator
const getPasswordStrength = (password: string) => {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[@$!%*?&]/.test(password)) score++
  return Math.min(score, 5) // Cap at 5 for display
}

const passwordStrength = computed(() => {
  const score = getPasswordStrength(formData.newPassword)
  const strength = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][score] || 'Rất yếu'
  const color = ['#ff4d4f', '#ff7a45', '#ffa940', '#52c41a', '#389e0d'][score] || '#ff4d4f'
  return { score, strength, color }
})

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // Call API change password
    await changePassword({
      old_password: formData.oldPassword,
      new_password: formData.newPassword,
      new_password2: formData.confirmPassword,
    })
    
    message.success('Cập nhật mật khẩu thành công!')
    
    // Reset form
    formData.oldPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
    formRef.value.resetFields()
    
  } catch (error: any) {
    console.error('Error updating password:', error)
    
    // Handle specific error messages
    if (error?.response?.data?.details?.old_password) {
      message.error('Mật khẩu hiện tại không đúng')
    } else if (error?.response?.data?.details?.new_password) {
      message.error('Mật khẩu mới không hợp lệ')
    } else if (error?.response?.data?.details?.new_password2) {
      message.error('Mật khẩu xác nhận không khớp')
    } else if (error?.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error('Cập nhật mật khẩu thất bại')
    }
  } finally {
    loading.value = false
  }
}

// Handle form reset
const handleReset = () => {
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
              Cài đặt mật khẩu
            </h1>
            <p class="text-shade-6">
              Bảo mật tài khoản của bạn bằng cách cập nhật mật khẩu
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
              Thay đổi mật khẩu
            </h2>

            <a-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              layout="vertical"
              @finish="handleSubmit"
            >
              <!-- Current Password -->
              <a-form-item label="Mật khẩu hiện tại" name="oldPassword" class="mb-6">
                <a-input-password
                  v-model:value="formData.oldPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
                  class="rounded-xl"
                >
                  <template #prefix>
                    <Icon name="solar:lock-bold" size="16" class="text-shade-5" />
                  </template>
                </a-input-password>
              </a-form-item>

              <!-- New Password -->
              <a-form-item label="Mật khẩu mới" name="newPassword" class="mb-4">
                <a-input-password
                  v-model:value="formData.newPassword"
                  placeholder="Nhập mật khẩu mới"
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
                    <span class="text-sm text-shade-6">Độ mạnh mật khẩu:</span>
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
                        backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#e5e7eb' 
                      }"
                    />
                  </div>
                </div>
              </a-form-item>

              <!-- Confirm Password -->
              <a-form-item label="Xác nhận mật khẩu mới" name="confirmPassword" class="mb-8">
                <a-input-password
                  v-model:value="formData.confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
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
                  Cập nhật mật khẩu
                </a-button>
                
                <a-button
                  size="large"
                  @click="handleReset"
                >
                  Đặt lại
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
                Thông tin tài khoản
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-blue-100 rounded-lg">
                    <Icon name="solar:user-bold" size="16" class="text-blue-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-shade-9">{{ user?.full_name || 'N/A' }}</p>
                    <p class="text-xs text-shade-6">Tên đầy đủ</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-green-100 rounded-lg">
                    <Icon name="solar:letter-unread-bold" size="16" class="text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-shade-9">{{ user?.email || 'N/A' }}</p>
                    <p class="text-xs text-shade-6">Email</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center bg-orange-100 rounded-lg">
                    <Icon name="solar:calendar-bold" size="16" class="text-orange-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-shade-9">
                      {{ user?.date_joined ? new Date(user.date_joined).toLocaleDateString('vi-VN') : 'N/A' }}
                    </p>
                    <p class="text-xs text-shade-6">Ngày tham gia</p>
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
