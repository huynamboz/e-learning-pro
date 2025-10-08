<script setup lang="ts">
import type { LoginRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()

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
      notification.success({ message: 'Đăng nhập thành công!' })
      await navigateTo('/learning')
    }
    else {
      notification.error({ message: result.error || 'Đăng nhập thất bại' })
    }
  }
  catch {
    notification.error({ message: 'Có lỗi xảy ra, vui lòng thử lại' })
  }
  finally {
    loading.value = false
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
              Welcome Back!
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-base">
              Sign in to continue your learning journey
            </p>
          </div>

          <!-- Form Fields -->
          <div class="space-y-5">
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

            <a-form-item
              label="Password"
              name="password"
              :rules="[{ required: true, message: 'Please input your password!' }]"
              class="mb-0"
            >
              <a-input-password
                v-model:value="formState.password"
                placeholder="Enter your password"
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
              Remember me
            </a-checkbox>
            <NuxtLink
              class="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
              to="/auth/forgot-password"
            >
              Forgot password?
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
            <span v-if="!loading">Sign in</span>
            <Icon v-if="!loading" class="ml-2 text-lg" name="solar:arrow-right-bold" />
          </a-button>

          <!-- Divider -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <!-- Social Sign In -->
          <div class="grid grid-cols-1 gap-3">
            <a-button
              class="!h-12 !flex items-center justify-center !rounded-xl text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
            >
              <template #icon>
                <Icon class="mr-2 text-xl" name="logos:google-icon" />
              </template>
              Google
            </a-button>
          </div>

          <!-- Sign Up Link -->
          <div class="text-center mt-6 p-4 bg-gray-50 rounded-xl">
            <span class="text-gray-600">Don't have an account? </span>
            <NuxtLink
              to="/auth/register"
              class="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign up now
            </NuxtLink>
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
          <Icon name="solar:book-bookmark-bold" size="64" class="text-white/90 mb-6" />
          <h2 class="text-4xl font-bold mb-4">
            Start Your Learning Journey
          </h2>
          <p class="text-lg text-white/90 leading-relaxed">
            Join thousands of students learning Italian with interactive courses,
            expert instructors, and personalized learning paths.
          </p>
        </div>

        <!-- Features -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Access to 100+ courses</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Learn at your own pace</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Icon name="solar:check-circle-bold" size="24" />
            </div>
            <span class="text-white/90">Get certified on completion</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
          <div>
            <div class="text-3xl font-bold">10K+</div>
            <div class="text-sm text-white/80">Students</div>
          </div>
          <div>
            <div class="text-3xl font-bold">100+</div>
            <div class="text-sm text-white/80">Courses</div>
          </div>
          <div>
            <div class="text-3xl font-bold">4.8★</div>
            <div class="text-sm text-white/80">Rating</div>
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
