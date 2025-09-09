<script setup lang="ts">
import type { LoginRequest } from '~/types/auth.type'

const formState = reactive<any>({
  email: '',
})

const isReset = ref<boolean>(false)

function onFinish() {
  if (!isReset.value) {
    isReset.value = true
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
          {{ !isReset ? 'Forgot password' : 'Reset password' }}
        </h1>
        <a-form-item
          v-if="!isReset"
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.email" size="large" placeholder="Email" />
        </a-form-item>

        <div v-else class="w-full">
          <a-form-item
            label="Password"
            name="password"
            class="w-full"
            :rules="[{ required: true, message: 'Please input your password!' }]"
          >
            <a-input-password v-model:value="formState.password" placeholder="Enter password" size="large" />
          </a-form-item>
          <a-form-item
            label="Confirm password"
            name="confirmPassword"
            class="w-full"
            :rules="[{ required: true, message: 'Please input confirm password!' }]"
          >
            <a-input-password v-model:value="formState.password" placeholder="Enter confirm password" size="large" />
          </a-form-item>
        </div>

        <a-button type="primary" class="w-full !h-[40px] flex items-center justify-center" html-type="submit">
          Reset password
          <Icon class="ml-2 -mb-1 text-base" name="i-solar-arrow-right-outline" />
        </a-button>
      </a-form>
      <RouterLink to="/auth/login" class="flex !text-black !hover:text-[#49ba61] items-center w-full mt-5 justify-center gap-2 cursor-pointer">
        <Icon class="ml-2 text-base" name="i-solar-arrow-left-outline" />
        Back to login
      </RouterLink>
    </div>
    <div class="w-full h-screen">
      <img src="@/assets/images/auth/bg-register.png" class="w-full h-screen object-cover" alt="bg-login">
    </div>
  </div>
</template>
