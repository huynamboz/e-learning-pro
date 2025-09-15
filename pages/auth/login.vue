<script setup lang="ts">
import type { LoginRequest } from '~/types/auth.type'
import { message } from 'ant-design-vue'

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
      message.success('Đăng nhập thành công!')
      // Redirect sẽ được xử lý bởi login function
      await navigateTo('/learning')
    }
    else {
      message.error(result.error || 'Đăng nhập thất bại')
    }
  }
  catch {
    message.error('Có lỗi xảy ra, vui lòng thử lại')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch min-h-screen">
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
          <!-- Logo -->
          <div class="text-center mb-8">
            <img src="@/assets/images/logo.png" class="w-24 h-24 sm:w-32 sm:h-32 lg:w-[148px] lg:h-[148px] object-cover mx-auto" alt="logo">
            <h1 class="text-[#0F172A] dark:text-white text-2xl sm:text-3xl lg:text-[32px] font-bold mt-6">
              Sign in to your account
            </h1>
          </div>
          <!-- Form Fields -->
          <a-form-item
            label="Email"
            name="email"
            :rules="[{ required: true, message: 'Please input your email!' }]"
          >
            <a-input v-model:value="formState.email" size="large" placeholder="Email" class="h-12" />
          </a-form-item>

          <a-form-item
            label="Password"
            name="password"
            :rules="[{ required: true, message: 'Please input your password!' }]"
          >
            <a-input-password v-model:value="formState.password" placeholder="Enter password" size="large" class="h-12" />
          </a-form-item>

          <!-- Forgot Password Link -->
          <div class="text-right">
            <router-link class="text-gray-900 dark:text-gray-100 hover:text-[#49ba61] text-sm font-medium" to="/auth/forgot-password">
              Forgot password?
            </router-link>
          </div>

          <!-- Sign In Button -->
          <a-button
            type="primary"
            class="w-full !h-12 flex items-center justify-center text-base font-medium bg-[#16A34A] hover:bg-[#15803d] border-[#16A34A] hover:border-[#15803d]"
            html-type="submit"
            :loading="loading"
          >
            <template v-if="!loading">
              Sign in
              <Icon class="ml-2 text-lg" name="i-solar-arrow-right-outline" />
            </template>
          </a-button>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-6">
            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <span class="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              Or sign in with
            </span>
            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </div>

          <!-- Google Sign In -->
          <a-button class="w-full !h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Icon class="mr-3 text-lg" name="i-logos-google-icon" />
            Continue with Google
          </a-button>

          <!-- Sign Up Link -->
          <div class="text-center mt-6">
            <span class="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <NuxtLink to="/auth/register" class="text-[#16A34A] hover:text-[#15803d] font-medium">
              Sign up
            </NuxtLink>
          </div>
        </a-form>
      </div>
    </div>

    <!-- Image Section - Hidden on mobile -->
    <div class="hidden lg:block lg:w-1/2 relative">
      <img src="@/assets/images/auth/bg-register.png" class="w-full h-full object-cover" alt="bg-login">
      <div class="absolute inset-0 bg-gradient-to-br from-[#16A34A]/20 to-transparent" />
    </div>
  </div>
</template>
