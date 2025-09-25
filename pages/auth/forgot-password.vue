<script setup lang="ts">
import type { ResetRequest } from '~/types/auth.type'
import { notification } from 'ant-design-vue'

const { resetPassword, confirmPassword } = useAuth()

definePageMeta({
  layout: 'guest',
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
          message: 'Password reset email sent successfully!' 
        })
      }
      else {
        notification.error({ 
          message: result.error || 'Failed to send password reset email' 
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
          message: 'Password reset successful! Please login.' 
        })
        await navigateTo('/auth/login')
      }
      else {
        notification.error({ 
          message: result.error || 'Password reset failed' 
        })
      }
    }
  }
  catch {
    notification.error({ 
      message: 'An error occurred, please try again' 
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-12">
    <div class="w-full ml-12">
      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-center justify-center flex-col mb-4"
        @finish="onFinish"
      >
        <img src="@/assets/images/logo.png" class="w-[148px] h-[148px] object-cover" alt="logo">
        <h1 class="text-[#0F172A] text-[32px] font-bold">
          {{ !isReset ? 'Forgot Password' : 'Reset Password' }}
        </h1>
        <a-form-item
          v-if="!isReset"
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.email" size="large" placeholder="Enter your email" />
        </a-form-item>

        <div v-else class="w-full"> 
          <a-form-item
            label="New Password"
            name="new_password"
            class="w-full"
            :rules="[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters long' },
            ]"
          >
            <a-input-password v-model:value="formState.new_password" placeholder="Enter new password" size="large" />
          </a-form-item>
          <a-form-item
            label="Confirm Password"
            name="new_password2"
            class="w-full"
            :rules="[
              { required: true, message: 'Please confirm your password!' },
              { min: 8, message: 'Confirm password must be at least 8 characters long' },
            ]"
          >
            <a-input-password v-model:value="formState.new_password2" placeholder="Confirm new password" size="large" />
          </a-form-item>
        </div>

        <a-button type="primary" class="w-full !h-[40px] !flex !items-center !justify-center" html-type="submit" :loading="loading" :disabled="loading">
          {{ !isReset ? 'Send Reset Email' : 'Reset Password' }}
          <Icon class="ml-2 -mb-1 text-base" name="i-solar-arrow-right-outline" />
        </a-button>
      </a-form>
      <RouterLink to="/auth/login" class="!flex !text-black !hover:text-[#49ba61] !items-center w-full mt-5 !justify-center gap-2 cursor-pointer">
        <Icon class="ml-2 text-base" name="i-solar-arrow-left-outline" />
        Back to Login
      </RouterLink>
    </div>
    <div class="w-full h-screen">
      <img src="@/assets/images/auth/bg-register.png" class="w-full h-screen object-cover" alt="bg-login">
    </div>
  </div>
</template>
