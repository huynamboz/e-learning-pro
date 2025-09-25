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

async function onFinish() {
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
  <div class="flex flex-col lg:flex-row items-stretch min-h-screen">
    <!-- Image Section - Hidden on mobile, shown first on desktop -->
    <div class="hidden lg:block lg:w-1/2 relative order-1">
      <img src="@/assets/images/auth/bg-login.png" class="w-full h-full object-cover" alt="bg-login">
      <div class="absolute inset-0 bg-gradient-to-br from-[#16A34A]/20 to-transparent" />
    </div>

    <!-- Form Section -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-12 order-2">
      <div class="w-full max-w-md">
        <div class="text-center lg:text-left mb-8">
          <h1 class="text-[#0F172A] dark:text-white text-2xl sm:text-3xl lg:text-[32px] font-bold">
            Create Your Account
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Join us and start your learning journey
          </p>
        </div>

        <a-form
          :model="formState"
          name="basic"
          autocomplete="off"
          layout="vertical"
          class="space-y-4"
          @finish="onFinish"
        >
          <!-- Username Field -->
          <a-form-item
            label="Username"
            name="username"
            :rules="[{ required: true, message: 'Please input your username!' }]"
          >
            <a-input v-model:value="formState.username" size="large" placeholder="Username" class="h-12" />
          </a-form-item>

          <!-- Email Field -->
          <a-form-item
            label="Email"
            name="email"
            :rules="[{ required: true, message: 'Please input your email!' }]"
          >
            <a-input v-model:value="formState.email" size="large" placeholder="Email" class="h-12" />
          </a-form-item>

          <!-- Password Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a-form-item
              label="Password"
              name="password"
              :rules="[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'The confirmation password must be at least 8 characters long.' },
              ]"
            >
              <a-input-password v-model:value="formState.password" placeholder="Enter password" size="large" class="h-12" />
            </a-form-item>
            <a-form-item
              label="Confirm Password"
              name="password2"
              :rules="[
                { required: true, message: 'Please input confirm password!' },
                { min: 8, message: 'The confirmation password must be at least 8 characters long.' },
              ]"
            >
              <a-input-password v-model:value="formState.password2" placeholder="Enter confirm password" size="large" class="h-12" />
            </a-form-item>
          </div>

          <!-- Create Account Button -->
          <a-button
            type="primary"
            class="w-full !h-12 !items-center !flex !justify-center text-base font-medium bg-[#16A34A] hover:bg-[#15803d] border-[#16A34A] hover:border-[#15803d] mt-6"
            html-type="submit"
            :loading="loading"
            :disabled="loading"
          >
            Create Account
            <Icon class="ml-2 text-lg" name="i-solar-arrow-right-outline" />
          </a-button>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-6">
            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <span class="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              Or sign up with
            </span>
            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </div>

          <!-- Google Sign Up -->
          <a-button class="w-full !h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Icon class="mr-3 text-lg" name="i-logos-google-icon" />
            Continue with Google
          </a-button>

          <!-- Sign In Link -->
          <div class="text-center mt-6">
            <span class="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <NuxtLink to="/auth/login" class="text-[#16A34A] hover:text-[#15803d] font-medium">
              Sign in
            </NuxtLink>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>
