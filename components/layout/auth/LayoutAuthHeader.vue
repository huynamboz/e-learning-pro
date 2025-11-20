<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { useCartStore } from '~/stores/cart.store'

const listOfLinks = computed(() => [
  { name: 'Giới thiệu', href: '#instructor' },
  { name: 'Quiz', href: '/#quiz' },
  { name: 'Video', href: '/#video' },
  { name: 'Tài nguyên', href: '/#resources' },
])

const isMobileMenuOpen = ref(false)
const isCourseMenuOpen = ref(false)

// Course menu structure - simplified to 3 level pages
const courseMenuItems = [
  { key: 'basic', label: 'Khoá cơ bản', href: '/basic-level' },
  { key: 'intermediate', label: 'Trung cấp', href: '/middle-level' },
  { key: 'advanced', label: 'Nâng cao', href: '/high-level' },
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Check if user is logged in
const { isLoggedIn } = useAuth()

// Cart store
const cartStore = useCartStore()

// Load cart on mount
onMounted(() => {
  cartStore.loadCart()
})
</script>

<template>
  <header
    class="border-b bg-white shadow-[0_0_20px_0_#0F306A0D] sticky top-0 z-50 left-0"
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
              {{ $t('layoutAuthHeader.brand.tagline') }}
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" :aria-label="$t('layoutAuthHeader.mobile.toggleMenu')"
          @click="toggleMobileMenu"
        >
          <Icon
            :name="isMobileMenuOpen ? 'solar:close-square-outline' : 'solar:hamburger-menu-outline'"
            size="24"
            class="text-gray-700 dark:text-gray-300"
          />
        </button>
      </div>

      <!-- Desktop Navigation - Different for logged in users -->
      <nav class="hidden lg:flex items-center space-x-8">
        <!-- Course Dropdown Menu -->
        <div
          class="relative group"
          @mouseenter="isCourseMenuOpen = true"
          @mouseleave="isCourseMenuOpen = false"
        >
          <div class="flex items-center group cursor-pointer !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors">
            <span>Khoá học</span>
            <Icon
              name="solar:alt-arrow-down-line-duotone"
              size="18"
              class="text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
              :class="{ 'rotate-180': isCourseMenuOpen }"
            />
          </div>
          <!-- Dropdown Menu -->
          <div
            class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
          >
            <div class="py-2">
              <NuxtLink
                v-for="item in courseMenuItems"
                :key="item.key"
                :to="item.href"
                class="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#16A34A] transition-colors"
              >
                <span>{{ item.label }}</span>
                <Icon
                  name="solar:alt-arrow-right-line-duotone"
                  size="16"
                  class="text-gray-400"
                />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Other Links -->
        <NuxtLink
          v-for="value in listOfLinks" :key="value.name" :to="value.href"
          class="flex items-center group !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors"
        >
          {{ value.name }}
          <Icon
            name="solar:alt-arrow-right-line-duotone"
            size="18"
            class="text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
          />
        </NuxtLink>
      </nav>

      <!-- Desktop Buttons - Different for logged in users -->
      <div v-if="!isLoggedIn" class="hidden lg:flex items-center space-x-2">
        <!-- Shopping Cart for non-logged in users -->
        <NuxtLink to="/checkout" class="relative size-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:bag-heart-bold" class="!text-gray-600" size="26" />
          <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>

        <NuxtLink to="/auth/register">
          <Button size="middle" type="primary" class="rounded-xl text-sm lg:text-base bg-[#16A34A]">
            {{ $t('layoutAuthHeader.buttons.signUpForFree') }}
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/login">
          <Button size="middle" type="ghost" class="rounded-xl text-sm lg:text-base">
            {{ $t('layoutAuthHeader.buttons.signIn') }}
          </Button>
        </NuxtLink>
      </div>

      <!-- Logged in user buttons -->
      <div v-else class="hidden lg:flex items-center space-x-2">
        <!-- Shopping Cart -->
        <NuxtLink to="/checkout" class="relative size-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:bag-heart-bold" class="!text-gray-600" size="26" />
          <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>

        <!-- Language selector -->
        <button class="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:globe-bold" size="20" class="!text-gray-600" />
        </button>

        <!-- User menu -->
        <div class="flex gap-2 py-2  items-center border rounded-full px-3 space-x-2">
          <button class="flex p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors">
            <Icon name="solar:hamburger-menu-outline" size="20" class="text-gray-600" />
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
        class="lg:hidden bg-white border-t border-gray-200"
      >
        <div class="px-4 pt-2 pb-4 space-y-1">
          <!-- Mobile Navigation Links - Different for logged in users -->
          <nav v-if="!isLoggedIn" class="space-y-1">
            <!-- Course Menu (Mobile) -->
            <div class="space-y-1">
              <button
                class="w-full flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                @click="isCourseMenuOpen = !isCourseMenuOpen"
              >
                <span>Khoá học</span>
                <Icon
                  name="solar:alt-arrow-down-line-duotone"
                  size="18"
                  class="text-gray-400 transition-transform"
                  :class="{ 'rotate-180': isCourseMenuOpen }"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 transform -translate-y-2"
                enter-to-class="opacity-100 transform translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 transform translate-y-0"
                leave-to-class="opacity-0 transform -translate-y-2"
              >
                <div v-show="isCourseMenuOpen" class="pl-4 space-y-1">
                  <NuxtLink
                    v-for="item in courseMenuItems"
                    :key="item.key"
                    :to="item.href"
                    class="flex items-center justify-between py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                    @click="isMobileMenuOpen = false"
                  >
                    <span>{{ item.label }}</span>
                    <Icon name="solar:alt-arrow-right-line-duotone" size="16" class="text-gray-400" />
                  </NuxtLink>
                </div>
              </Transition>
            </div>

            <!-- Other Links -->
            <NuxtLink
              v-for="value in listOfLinks" :key="value.name" :to="value.href" class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ value.name }}</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>
          </nav>

          <!-- Logged in user mobile navigation (match desktop) -->
          <nav v-else class="space-y-1">
            <!-- Course Menu Links (Mobile) -->
            <NuxtLink
              v-for="item in courseMenuItems"
              :key="item.key"
              :to="item.href"
              class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ item.label }}</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>

            <!-- Other Links -->
            <NuxtLink
              v-for="value in listOfLinks" :key="value.name" :to="value.href"
              class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ value.name }}</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>
          </nav>

          <!-- Mobile Buttons - Different for logged in users -->
          <div v-if="!isLoggedIn" class="pt-4 space-y-3 border-t border-gray-200">
            <!-- Shopping Cart for non-logged in users -->
            <NuxtLink
              to="/checkout" class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors relative"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:bag-heart-bold" size="30" class=" mr-2" />
              Giỏ hàng
              <span v-if="cartStore.totalItems > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>

            <NuxtLink to="/auth/register" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="primary" class="w-full rounded-xl text-base bg-[#16A34A]">
                {{ $t('layoutAuthHeader.buttons.signUpForFree') }}
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/login" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="ghost" class="w-full rounded-xl text-base">
                {{ $t('layoutAuthHeader.buttons.signIn') }}
              </Button>
            </NuxtLink>
          </div>

          <!-- Logged in user mobile buttons -->
          <div v-else class="pt-4 space-y-3 border-t border-gray-200">
            <NuxtLink
              to="/checkout" class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors relative"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:bag-heart-bold" size="30" class=" mr-2" />
              Giỏ hàng
              <span v-if="cartStore.totalItems > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:globe-bold" size="20" class="mr-2" />
              {{ $t('layoutAuthHeader.buttons.language') }}
            </button>
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:user-bold" size="20" class="mr-2" />
              {{ $t('layoutAuthHeader.navigation.profile') }}
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
