<script setup lang="ts">
import type { RegisterRequest } from '~/types/auth.type'

const formState = reactive<RegisterRequest>({
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
  confirmPassword: '',
  password: '',
})
function onFinish() {

}
</script>

<template>
  <div class="flex items-center justify-between gap-12">
    <div class="w-full h-screen">
      <img src="@/assets/images/auth/bg-login.png" class="w-full h-screen object-cover" alt="bg-login">
    </div>
    <div class="w-full mr-12">
      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        @finish="onFinish"
      >
        <h1 class="text-[#0F172A] text-[32px] font-bold">
          Create Your Account
        </h1>
        <div class="flex items-center gap-3 w-full">
          <a-form-item
            class="w-full"
            label="Full Name"
            name="firstName"
            :rules="[{ required: true, message: 'Please input your first name!' }]"
          >
            <a-input v-model:value="formState.firstName" size="large" placeholder="First name" />
          </a-form-item>
          <a-form-item
            label=" "
            class="w-full"
            name="lastName"
            :rules="[{ message: 'Please input your last name!' }]"
          >
            <a-input v-model:value="formState.lastName" size="large" placeholder="Last name" />
          </a-form-item>
        </div>
        <a-form-item
          label="Username"
          name="userName"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="formState.userName" size="large" placeholder="Username" />
        </a-form-item>

        <a-form-item
          label="Email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }]"
        >
          <a-input v-model:value="formState.email" size="large" placeholder="Email" />
        </a-form-item>

        <div class="flex items-center gap-3 w-full">
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
          Create Account
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
  </div>
</template>
