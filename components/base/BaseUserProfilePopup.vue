<script setup lang="ts">
import { notification } from 'ant-design-vue'

const { logout, user, profile, login } = useAuth()
const { t } = useI18n()

// Saved accounts from cookie
const savedAccountsCookie = useCookie<Array<{ email: string, password: string }>>('saved_accounts', {
  default: () => [],
  maxAge: 60 * 60 * 24 * 365, // 1 year
  secure: true,
  sameSite: 'strict',
})

// Modal state for account switching
const showAccountModal = ref(false)
const switchingAccount = ref(false)

// Login form
const loginForm = ref({
  email: '',
  password: '',
})
const loginFormError = ref('')

interface ProfileOption {
  title: string
  options: {
    icon: string
    name: string
    link?: string
    action?: string
  }[]
}

// Computed profile options based on user type
const profileOptions = computed(() => {
  const baseOptions: ProfileOption[] = [
    {
      title: t('profile.profile'),
      options: [
        // trang học
        { icon: 'solar-book-linear', name: t('profile.learning'), link: '/learning' },
        { icon: 'solar-user-linear', name: t('profile.profile'), link: '/profile?tab=PROFILE' },
        { icon: 'solar-book-bookmark-linear', name: t('profile.myCourses'), link: '/my-course' },
      ],
    },
  ]

  // Add Dashboard option for teachers at the beginning of Profile section
  if (user.value?.is_teacher) {
    baseOptions[0].options.unshift({
      icon: 'solar-chart-square-linear',
      name: t('profile.dashboard'),
      link: '/admin',
    })
  }

  // Add Actions section
  const actionsOptions: any[] = []

  // Always show switch account option
  actionsOptions.push({
    icon: 'solar-user-plus-linear',
    name: t('profile.switchAccount') || 'Đăng nhập tài khoản học',
    action: 'switchAccount',
  })

  actionsOptions.push({
    icon: 'solar-logout-linear',
    name: t('profile.logout'),
    action: 'logout',
  })

  baseOptions.push({
    title: t('profile.actions'),
    options: actionsOptions,
  })

  return baseOptions
})

async function handleItemClick(item: any) {
  if (item.action === 'logout') {
    await logout()
  }
  else if (item.action === 'switchAccount') {
    showAccountModal.value = true
    // Reset form when opening modal
    loginForm.value = { email: '', password: '' }
    loginFormError.value = ''
  }
  else if (item.link) {
    await navigateTo(item.link)
  }
}

// Switch to selected account
async function switchToAccount(account: { email: string, password: string }) {
  switchingAccount.value = true
  try {
    const result = await login({
      email: account.email,
      password: account.password,
    })

    if (result.success) {
      notification.success({
        message: t('profile.switchAccountSuccess') || 'Đăng nhập thành công',
      })
      showAccountModal.value = false
      // Reset form
      loginForm.value = { email: '', password: '' }
      loginFormError.value = ''
    }
    else {
      notification.error({
        message: result.error || t('profile.switchAccountFailed') || 'Đăng nhập thất bại',
      })
    }
  }
  catch (error: any) {
    console.error('Switch account error:', error)
    notification.error({
      message: t('profile.switchAccountFailed') || 'Đăng nhập thất bại',
    })
  }
  finally {
    switchingAccount.value = false
  }
}

// Get available accounts (exclude current account)
const availableAccounts = computed(() => {
  const currentEmail = (user.value?.email || profile.value?.email || '').toLowerCase().trim()
  const currentUsername = (user.value?.username || profile.value?.username || '').toLowerCase().trim()
  if (!currentEmail) {
    return savedAccountsCookie.value
  }
  return savedAccountsCookie.value.filter(
    account =>
      account.email.toLowerCase().trim() !== currentEmail
      && account?.username?.toLowerCase().trim() !== currentUsername
      && account?.email?.toLowerCase().trim() !== currentUsername
      && account?.username?.toLowerCase().trim() !== currentEmail,
  )
})

// Delete account from saved accounts
function deleteAccount(accountEmail: string, event: Event) {
  event.stopPropagation() // Prevent triggering switchToAccount
  const accountIndex = savedAccountsCookie.value.findIndex(
    account => account.email.toLowerCase().trim() === accountEmail.toLowerCase().trim(),
  )
  if (accountIndex >= 0) {
    savedAccountsCookie.value.splice(accountIndex, 1)
    notification.success({
      message: t('profile.accountDeleted') || 'Đã xóa tài khoản',
    })
  }
}

// Handle login form submission
async function handleLoginForm() {
  if (!loginForm.value.email || !loginForm.value.password) {
    loginFormError.value = t('profile.loginFormRequired') || 'Vui lòng nhập email và mật khẩu'
    return
  }

  loginFormError.value = ''
  switchingAccount.value = true

  try {
    const result = await login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    })

    if (result.success) {
      // Save account to cookie
      const existingAccountIndex = savedAccountsCookie.value.findIndex(
        account => account.email === loginForm.value.email,
      )

      if (existingAccountIndex >= 0) {
        // Update existing account
        savedAccountsCookie.value[existingAccountIndex] = {
          email: loginForm.value.email,
          password: loginForm.value.password,
        }
      }
      else {
        // Add new account
        savedAccountsCookie.value.push({
          email: loginForm.value.email,
          password: loginForm.value.password,
        })
      }

      notification.success({
        message: t('profile.switchAccountSuccess') || 'Đăng nhập thành công',
      })
      showAccountModal.value = false
      // Reset form
      loginForm.value = { email: '', password: '' }
      loginFormError.value = ''
    }
    else {
      loginFormError.value = result.error || t('profile.switchAccountFailed') || 'Đăng nhập thất bại'
    }
  }
  catch (error: any) {
    console.error('Login form error:', error)
    loginFormError.value = t('profile.switchAccountFailed') || 'Đăng nhập thất bại'
  }
  finally {
    switchingAccount.value = false
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <BaseAvatar :src="profile?.avatar || ''" size="40px" />
    </PopoverTrigger>
    <PopoverContent class="w-fit border-0 p-3 shadow-none bg-transparent">
      <div class="h-fit border-[1px] bg-shade-1 shadow-none w-[221px] p-0 rounded-[20px]" style="box-shadow: var(--popover-box-shadow);">
        <!-- User Info Section -->
        <div class="p-4 border-b border-shade-3">
          <div class="flex items-center gap-3">
            <a-avatar
              :size="40"
              :src="profile?.avatar"
              class="border-4 border-white shadow-sm"
            >
              {{ profile?.first_name?.charAt(0) }}
            </a-avatar>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-shade-9 truncate">
                {{ profile?.first_name && profile?.last_name ? `${profile.last_name} ${profile.first_name}` : 'User' }}
              </h3>
              <p class="text-xs text-shade-6 truncate">
                {{ profile?.email || '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Options -->
        <div
          v-for="(option, index) in profileOptions" :key="index" :class="{
            'border-b border-shade-3': index < profileOptions.length - 1,
          }"
        >
          <ul class="p-2 pb-2">
            <li
              v-for="(item, itemIndex) in option.options"
              :key="itemIndex"
              class="hover:bg-shade-3 font-medium rounded-[12px] cursor-pointer flex items-center gap-3 p-2"
              @click="handleItemClick(item)"
            >
              <div class="flex items-center justify-center size-6">
                <Icon :name="item.icon" class="text-[20px] text-shade-9" />
              </div>
              <span class="text-sm text-shade-9 hover:text-primary transition-colors">
                {{ item.name }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Account Switching Modal -->
  <a-modal
    v-model:open="showAccountModal"
    :title="t('profile.switchAccount') || 'Đăng nhập tài khoản học'"
    :footer="null"
    width="400px"
    centered
  >
    <!-- Saved Accounts List (if available) -->
    <div v-if="availableAccounts.length > 0" class="mb-6">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">
        {{ t('profile.savedAccounts') || 'Tài khoản đã lưu' }}
      </h4>
      <div class="space-y-2">
        <div
          v-for="(account, index) in availableAccounts"
          :key="index"
          class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div
            class="flex items-center gap-3 flex-1 cursor-pointer"
            @click="switchToAccount(account)"
          >
            <div class="size-10 flex items-center justify-center bg-blue-100 rounded-full">
              <Icon name="solar:user-bold" class="text-blue-600 text-lg" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ account.email }}
              </p>
              <p class="text-xs text-gray-500">
                {{ t('profile.clickToLogin') || 'Nhấn để đăng nhập' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              @click="deleteAccount(account.email, $event)"
            >
              <Icon name="solar:trash-bin-trash-bold" size="18" />
            </button>
            <Icon name="solar:arrow-right-linear" class="text-gray-400 cursor-pointer" @click="switchToAccount(account)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Divider if has saved accounts -->
    <div v-if="availableAccounts.length > 0" class="mb-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500 font-medium">
            {{ t('profile.or') || 'Hoặc' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Login Form (always shown) -->
    <div class="space-y-4">
      <h4 v-if="availableAccounts.length > 0" class="text-sm font-semibold text-gray-700 mb-3">
        {{ t('profile.loginNewAccount') || 'Đăng nhập tài khoản mới' }}
      </h4>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('auth.login.form.emailOrUsername') || 'Email hoặc username' }}
        </label>
        <a-input
          v-model:value="loginForm.email"
          size="large"
          :placeholder="t('auth.login.form.emailOrUsernamePlaceholder') || 'Email hoặc username'"
          class="w-full"
          :disabled="switchingAccount"
        >
          <template #prefix>
            <Icon name="solar:letter-bold" size="20" class="text-gray-400" />
          </template>
        </a-input>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('auth.login.form.password') || 'Mật khẩu' }}
        </label>
        <a-input-password
          v-model:value="loginForm.password"
          size="large"
          :placeholder="t('auth.login.form.passwordPlaceholder') || 'Nhập mật khẩu'"
          class="w-full"
          :disabled="switchingAccount"
        >
          <template #prefix>
            <Icon name="solar:lock-password-bold" size="20" class="text-gray-400" />
          </template>
        </a-input-password>
      </div>
      <p v-if="loginFormError" class="text-xs text-red-500">
        {{ loginFormError }}
      </p>
      <a-button
        type="primary"
        size="large"
        block
        :loading="switchingAccount"
        :disabled="switchingAccount"
        class="!h-12"
        @click="handleLoginForm"
      >
        {{ t('auth.login.form.submitButton') || 'Đăng nhập' }}
      </a-button>
    </div>

    <div v-if="switchingAccount && availableAccounts.length > 0" class="mt-4 text-center">
      <a-spin />
      <p class="text-sm text-gray-600 mt-2">
        {{ t('profile.switching') || 'Đang đăng nhập...' }}
      </p>
    </div>
  </a-modal>
</template>
