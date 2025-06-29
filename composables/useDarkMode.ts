export function useDarkMode() {
  // Use Nuxt's useCookie for better SSR support and state persistence
  const darkModeCookie = useCookie<boolean>('darkMode', {
    default: () => false,
    sameSite: 'lax',
  })

  // Reactive dark mode state
  const isDark = computed({
    get: () => darkModeCookie.value,
    set: (value: boolean) => {
      darkModeCookie.value = value
    },
  })

  // Check if we're in the browser
  const isClient = typeof window !== 'undefined'

  // Update DOM classes
  const updateDarkMode = () => {
    if (!isClient)
      return

    const html = document.documentElement

    if (isDark.value) {
      html.classList.add('dark')
    }
    else {
      html.classList.remove('dark')
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  // Set specific mode
  const setDarkMode = (value: boolean) => {
    isDark.value = value
  }

  // Initialize on client side
  onMounted(() => {
    // If no cookie is set, check system preference
    if (darkModeCookie.value === false && !document.cookie.includes('darkMode=true')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        isDark.value = true
      }
    }

    // Apply the current state to DOM
    updateDarkMode()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      if (!document.cookie.includes('darkMode=')) {
        isDark.value = e.matches
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  })

  // Watch for changes in isDark and update DOM
  watch(isDark, updateDarkMode, { immediate: false })

  return {
    isDark: readonly(isDark),
    toggleDarkMode,
    setDarkMode,
  }
}
