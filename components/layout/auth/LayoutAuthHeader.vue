<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { ref } from 'vue'

const listOfLinks = [
  { name: 'Courses', href: '/' },
  { name: 'Contact', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Pricing', href: '#', hideIcon: true },
]

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Check if user is logged in
const { isLoggedIn } = useAuth()
</script>

<template>
  <header
    class="border-b bg-white dark:bg-gray-900 shadow-[0_0_20px_0_#0F306A0D] dark:border-gray-800 sticky top-0 z-50 left-0"
  >
    <div class="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8">
      <!-- Logo and Mobile Menu Button -->
      <div class="flex items-center justify-between w-full lg:w-auto">
        <div class="flex items-center h-16 lg:h-[76px]">
          <NuxtLink to="/" class="flex-shrink-0">
            <img src="@/assets/images/logo.webp" alt="PHAN THI TAM Logo" class="w-10 h-10 sm:w-12 sm:h-12">
          </NuxtLink>
          <!-- Brand name -->
          <div class="ml-3">
            <div class="text-lg font-bold">
              <span class="text-green-600">PHAN THI</span>
              <span class="text-red-600"> TAM</span>
            </div>
            <div class="text-xs text-green-600 font-medium">
              Học tiếng Ý cùng Phan Tâm
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Toggle mobile menu"
          @click="toggleMobileMenu"
        >
          <Icon
            :name="isMobileMenuOpen ? 'solar:close-square-outline' : 'solar:hamburger-menu-outline'"
            class="text-2xl text-gray-700 dark:text-gray-300"
          />
        </button>
      </div>

      <!-- Desktop Navigation - Different for logged in users -->
      <nav v-if="!isLoggedIn" class="hidden lg:flex items-center space-x-8">
        <NuxtLink
          v-for="value in listOfLinks" :key="value.name" :to="value.href"
          class="flex items-center group !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors"
        >
          {{ value.name }}
          <Icon
            v-if="!value.hideIcon" name="solar:alt-arrow-right-line-duotone"
            class="text-lg text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
          />
        </NuxtLink>
      </nav>

      <!-- Logged in user navigation -->
      <nav v-else class="hidden lg:flex items-center space-x-8">
        <NuxtLink to="/learning" class="!text-gray-600 hover:text-[#16A34A] transition-colors">
          Learning
        </NuxtLink>
        <NuxtLink to="/profile?tab=MY_COURSES" class="!text-gray-600 hover:text-[#16A34A] transition-colors">
          My Courses
        </NuxtLink>
      </nav>

      <!-- Desktop Buttons - Different for logged in users -->
      <div v-if="!isLoggedIn" class="hidden lg:flex items-center space-x-3">
        <NuxtLink to="/">
          <Button size="middle" type="default" class="rounded-xl text-sm lg:text-base">
            Contact directly
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/register">
          <Button size="middle" type="primary" class="rounded-xl text-sm lg:text-base bg-[#16A34A]">
            Sign up for free
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/login">
          <Button size="middle" type="ghost" class="rounded-xl text-sm lg:text-base">
            Sign in
          </Button>
        </NuxtLink>
      </div>

      <!-- Logged in user buttons -->
      <div v-else class="hidden lg:flex items-center space-x-4">
        <NuxtLink to="/learning" class="text-sm !text-gray-600 hover:text-[#16A34A] transition-colors">
          Go to my course
        </NuxtLink>

        <!-- Language selector -->
        <button class="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:globe-bold" class="w-5 h-5 !text-gray-600" />
        </button>

        <!-- User menu -->
        <div class="flex gap-2 py-2  items-center border rounded-full px-3 space-x-2">
          <button class="flex p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors">
            <Icon name="solar:hamburger-menu-outline" class="w-5 h-5 text-gray-600" />
          </button>

          <BaseUserProfilePopup />
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-show="isMobileMenuOpen"
        class="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="px-4 pt-2 pb-4 space-y-1">
          <!-- Mobile Navigation Links - Different for logged in users -->
          <nav v-if="!isLoggedIn" class="space-y-1">
            <NuxtLink
              v-for="value in listOfLinks" :key="value.name" :to="value.href" class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ value.name }}</span>
              <Icon v-if="!value.hideIcon" name="solar:alt-arrow-right-line-duotone" class="text-lg text-gray-400" />
            </NuxtLink>
          </nav>

          <!-- Logged in user mobile navigation -->
          <nav v-else class="space-y-1">
            <NuxtLink
              to="/learning" class="flex items-center py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              Learning
            </NuxtLink>
            <NuxtLink
              to="/profile?tab=MY_COURSES" class="flex items-center py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              My Courses
            </NuxtLink>
            <NuxtLink
              to="/profile" class="flex items-center py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              Profile
            </NuxtLink>
          </nav>

          <!-- Mobile Buttons - Different for logged in users -->
          <div v-if="!isLoggedIn" class="pt-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink to="/" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="default" class="w-full rounded-xl text-base">
                Contact directly
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/register" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="primary" class="w-full rounded-xl text-base bg-[#16A34A]">
                Sign up for free
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/login" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="ghost" class="w-full rounded-xl text-base">
                Sign in
              </Button>
            </NuxtLink>
          </div>

          <!-- Logged in user mobile buttons -->
          <div v-else class="pt-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:globe-bold" class="w-5 h-5 mr-2" />
              Language
            </button>
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:user-bold" class="w-5 h-5 mr-2" />
              Profile
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.ant-btn {
  border-radius: 8px;
  color: #181D26;

}

.ant-btn-primary {
  background-color: #16A34A;
  color: #FFFFFF;
  border: 1px solid #16A34A;
}

.ant-btn-primary:hover {
  background-color: #15803d;
  border-color: #15803d;
}

.ant-btn-default {
  background-color: transparent;
  border: 1px solid #d1d5db;
}

.ant-btn-default:hover {
  border-color: #16A34A;
  color: #16A34A;
}

.ant-btn-ghost {
  background-color: transparent;
  border: 1px solid transparent;
}

.ant-btn-ghost:hover {
  background-color: #f3f4f6;
  color: #16A34A;
}

/* Mobile menu button animations */
.mobile-menu-button {
  transition: transform 0.2s ease;
}

.mobile-menu-button:active {
  transform: scale(0.95);
}
</style>
