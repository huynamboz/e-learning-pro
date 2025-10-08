<script setup lang="ts">
import type { RegisterRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { register } = useAuth()

const formState = reactive<RegisterRequest>({
  email: '',
  username: '',
  password2: '',
  password: '',
})

const loading = ref(false)
const agreedToTerms = ref(false)

async function onFinish() {
  // Validate terms agreement
  if (!agreedToTerms.value) {
    notification.error({
      message: 'Please agree to the Terms and Conditions',
    })
    return
  }

  // Validate password length
  if (formState.password.length < 8) {
    notification.error({
      message: 'Mật khẩu phải có ít nhất 8 ký tự',
    })
    return
  }

  // Validate passwords match
  if (formState.password !== formState.password2) {
    notification.error({
      message: 'Mật khẩu xác nhận không khớp',
    })
    return
  }

  loading.value = true

  try {
    const result = await register(formState)

    if (result.success) {
      notification.success({
        message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      })
      await navigateTo('/auth/login')
    }
    else {
      notification.error({
        message: result.error || 'Đăng ký thất bại',
      })
    }
  }
  catch {
    notification.error({
      message: 'Có lỗi xảy ra, vui lòng thử lại',
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
            Join Our Community
          </h2>
          <p class="text-lg text-white/90 leading-relaxed">
            Create your account and unlock access to world-class Italian courses,
            connect with expert teachers, and join a thriving community of learners.
          </p>
        </div>

        <!-- Benefits -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">Free trial for new members</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">Lifetime access to materials</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:verified-check-bold" size="24" />
            </div>
            <span class="text-white/90">Certificate of completion</span>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur border border-white/20">
          <div class="flex items-center gap-3 mb-3">
            <img src="/images/avatar.jpg" alt="user" class="w-12 h-12 rounded-full border-2 border-white/50">
            <div>
              <div class="font-semibold">Maria Rossi</div>
              <div class="text-sm text-white/80">Student</div>
            </div>
          </div>
          <p class="text-sm text-white/90 italic">
            "Best Italian learning platform! The courses are well-structured and the teachers are amazing."
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
              Create Account
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              Start your learning journey today
            </p>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4">
            <!-- Username -->
            <a-form-item
              label="Username"
              name="username"
              :rules="[
                { required: true, message: 'Please input your username!' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]"
              class="mb-0"
            >
              <a-input
                v-model:value="formState.username"
                size="large"
                placeholder="Choose a username"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:user-bold" size="20" class="text-gray-400" />
                </template>
              </a-input>
            </a-form-item>

            <!-- Email -->
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

            <!-- Password -->
            <a-form-item
              label="Password"
              name="password"
              :rules="[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password"
                placeholder="Create a strong password"
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
              label="Confirm Password"
              name="password2"
              :rules="[
                { required: true, message: 'Please confirm your password!' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password2"
                placeholder="Re-enter your password"
                size="large"
                class="!h-12 !rounded-xl"
              >
                <template #prefix>
                  <Icon name="solar:shield-check-bold" size="20" class="text-gray-400" />
                </template>
              </a-input-password>
            </a-form-item>
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start gap-2 pt-2">
            <a-checkbox v-model:checked="agreedToTerms" class="mt-1" />
            <span class="text-sm text-gray-600">
              I agree to the
              <a href="#" class="text-green-600 hover:text-green-700 font-semibold">Terms and Conditions</a>
              and
              <a href="#" class="text-green-600 hover:text-green-700 font-semibold">Privacy Policy</a>
            </span>
          </div>

          <!-- Create Account Button -->
          <a-button
            type="primary"
            class="w-full !h-12 !rounded-xl !flex !items-center !justify-center text-base font-semibold !bg-gradient-to-r !from-green-500 !to-green-600 hover:!from-green-600 hover:!to-green-700 !border-0 shadow-lg hover:shadow-xl transition-all"
            html-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">Create Account</span>
            <Icon v-if="!loading" class="ml-2 text-lg" name="solar:arrow-right-bold" />
          </a-button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">
                Or sign up with
              </span>
            </div>
          </div>

          <!-- Google Sign Up -->
          <a-button
            class="w-full !h-12 !rounded-xl text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
          >
            <Icon class="mr-3 text-xl" name="logos:google-icon" />
            Continue with Google
          </a-button>

          <!-- Sign In Link -->
          <div class="text-center mt-6 p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">Already have an account? </span>
            <NuxtLink
              to="/auth/login"
              class="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign in
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
