<script setup lang="ts">
const { isAdmin } = useAdmin()
const { isCollapsed, menu, menuAdmin } = useSidebar()

// Language settings
const languageCookie = useCookie('locale', {
  default: () => 'vi',
  maxAge: 60 * 60 * 24 * 365, // 1 year
})

const availableLanguages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

const currentLanguage = computed(() => {
  return availableLanguages.find(lang => lang.code === languageCookie.value) || availableLanguages[0]
})

const showLanguageDropdown = ref(false)

function switchLanguage(languageCode: string) {
  languageCookie.value = languageCode
  const { $i18n } = useNuxtApp()
  $i18n.locale.value = languageCode
  showLanguageDropdown.value = false
}

const navbar = ref<HTMLElement | null>(null)
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Initialize language from cookie
  const { $i18n } = useNuxtApp()
  $i18n.locale.value = languageCookie.value
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
const pageTitle = computed(() => {
  if (isAdmin.value) {
    return menuAdmin.value.find(item => item.link && useRoute().path.startsWith(item.link))?.name || ''
  }
  return menu.value.find(item => item.link && useRoute().path.startsWith(item.link))?.name || ''
})

function handleScroll(): void {
  if (!navbar.value)
    return
  const navbarOffsetBottomWithPadding = navbar.value.offsetHeight + 20
  if (!navbar.value)
    return
  const scrollY = window.scrollY
  if (scrollY > navbarOffsetBottomWithPadding) {
    navbar.value.classList.add(
      'bg-white/70',
      'border-b-[1px]',
      'backdrop-blur',
    )
  }
  else {
    navbar.value.classList.remove(
      'bg-white/70',
      'border-b-[1px]',
      'backdrop-blur',
    )
  }
}
</script>

<template>
  <div
    ref="navbar"
    class="fixed top-0 flex left-0 w-full border-b border-shade-4 bg-shade-1 z-40 h-[80px] transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]'"
  >
    <div class="flex-1 w-full h-full flex items-center justify-between px-5">
      <div class="flex items-center gap-2 text-sm text-[#00000066]">
        <span>Dashboard</span>
        <span>/</span>
        <span class="text-black">{{ pageTitle }}</span>
      </div>
      <div class="flex items-center gap-5">
        <!-- Language Switcher -->
        <a-dropdown
          :trigger="['click']"
          placement="bottomRight"
          @open-change="(visible: boolean) => showLanguageDropdown = visible"
        >
          <a-button
            class="flex items-center"
          >
            <template #icon>
              <span class="">{{ currentLanguage.flag }}</span>
            </template>
            <span class="ml-1 text-sm font-medium text-gray-700">{{ currentLanguage.code.toUpperCase() }}</span>
            <template #icon-suffix>
              <Icon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-500" />
            </template>
          </a-button>

          <template #overlay>
            <a-menu class="w-48">
              <a-menu-item
                v-for="language in availableLanguages"
                :key="language.code"
                class="flex items-center gap-3 px-4 py-2"
                :class="language.code === currentLanguage.code ? 'bg-blue-50' : ''"
                @click="switchLanguage(language.code)"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">{{ language.flag }}</span>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ language.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ language.code.toUpperCase() }}
                    </div>
                  </div>
                  <Icon
                    v-if="language.code === currentLanguage.code"
                    name="i-heroicons-check"
                    class="w-4 h-4 text-blue-600"
                  />
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <BaseUserProfilePopup />
      </div>
    </div>
  </div>
</template>
