<script setup lang="ts">
import type { LoginRequest } from '~/types/auth.type'

definePageMeta({
  layout: 'auth',
})

const formState = reactive<LoginRequest>({
  email: '',
  password: '',
})

function onFinish() {
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
        class="flex items-center justify-center flex-col"
        @finish="onFinish"
      >
        <img src="@/assets/images/logo.png" class="w-[148px] h-[148px] object-cover" alt="logo">
        <h1 class="text-[#0F172A] text-[32px] font-bold">
          Sign in to your account
        </h1>
        <a-form-item
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.email" size="large" placeholder="Email" />
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          class="w-full"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="Enter password" size="large" />
        </a-form-item>

        <router-link class="!text-black hover:text-[#49ba61] w-full text-right mb-2" to="/auth/forgot-password">
          Forgot password
        </router-link>

        <a-button type="primary" class="w-full !h-[40px] flex items-center justify-center" html-type="submit">
          Sign in
          <Icon class="ml-2 -mb-1 text-base" name="i-solar-arrow-right-outline" />
        </a-button>
      </a-form>
      <div class="flex items-center gap-3 my-3">
        <div class="line w-full h-[1px] bg-[#ccc]" />
        <div class="text-xs text-[#94A3B8] font-medium w-[180px]">
          Sign up with
        </div>
        <div class="line w-full h-[1px] bg-[#ccc]" />
      </div>
      <a-button class="text-base font-semibold w-full !h-[40px]">
        <Icon class="mr-2 -mb-1 text-base" name="i-logos-google-icon" />
        Google
      </a-button>
    </div>
    <div class="w-full h-screen">
      <img src="@/assets/images/auth/bg-register.png" class="w-full h-screen object-cover" alt="bg-login">
    </div>
  </div>
</template>
