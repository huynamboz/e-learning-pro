<script setup lang="ts">
import { Button } from 'ant-design-vue'

const listOfLinks = [
  { name: 'Courses', href: '/courses' },
  { name: 'Contact', href: '/contact' },
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing', hideIcon: true },
]
</script>

<template>
  <header class="bg-white dark:bg-gray-900 shadow-[0_0_20px_0_#0F306A0D] dark:border-gray-800 sticky top-0 z-50 left-0">
    <div class="w-full flex justify-between px-5 items-center">
      <div class="flex justify-between items-center h-[76px] px-8 gap-[120px]">
        <img
          src="@/assets/images/logo.webp"
          alt="ELearnPro Logo"
          width="48"
          height="48"
        >

        <nav class="hidden md:flex items-center space-x-5">
          <NuxtLink
            v-for="value in listOfLinks"
            :key="value.name"
            :to="value.href"
            class="flex items-center group text-[#181D26] hover:text-[#16A34A]"
          >
            {{ value.name }}
            <Icon
              v-if="!value.hideIcon"
              name="solar:alt-arrow-right-line-duotone" class="text-lg text-gray-600 ml-1.5 group-hover:text-[#16A34A]"
            />
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center space-x-2">
        <NuxtLink to="/">
          <Button size="middle" type="default" class="rounded-xl text-base">
            Contact directly
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/register">
          <Button size="middle" type="primary" class="rounded-xl text-base bg-[#16A34A]">
            Sign up for free
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/login">
          <Button size="middle" type="ghost" class="rounded-xl text-base">
            Sign in
          </Button>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.ant-btn {
    border-radius: 8px;
    color: #181D26;
    padding: 2px 10px;
}
.ant-btn-primary {
    background-color: #16A34A;
    color: #FFFFFF;
}
</style>
