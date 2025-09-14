import type { LoginRequest, LoginResponse } from '~/types/auth.type'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userName: string
  // Thêm các field khác tùy theo API response
}

export function useAuth() {
  const user = useState<User | null>('auth.user', () => null)
  const token = useCookie<string | null>('auth.token', {
    default: () => null,
    httpOnly: false,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Loading states
  const isInitializing = useState<boolean>('auth.isInitializing', () => true)
  const isFetchingUser = useState<boolean>('auth.isFetchingUser', () => false)

  // User is logged in if has token (and not currently fetching for the first time)
  const isLoggedIn = computed(() => {
    return !!token.value && (!isInitializing.value || !!user.value)
  })

  // Show loading when initializing or fetching user
  const isLoading = computed(() => isInitializing.value || isFetchingUser.value)

  // Base API URL - sử dụng local API fake hoặc external API
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || '/api' // Sử dụng local API fake

  // Fetch user profile
  async function fetchUser(): Promise<void> {
    if (!token.value) {
      isInitializing.value = false
      return
    }

    isFetchingUser.value = true

    try {
      const userData = await $fetch<User>('/user/me', {
        baseURL,
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      user.value = userData
    }
    catch (error) {
      console.error('Fetch user error:', error)
      // If token is invalid, clear it
      await logout()
    }
    finally {
      isFetchingUser.value = false
      isInitializing.value = false
    }
  }

  // Logout function
  async function logout(): Promise<void> {
    token.value = null
    user.value = null
    isInitializing.value = false
    isFetchingUser.value = false

    // Redirect to login page
    await navigateTo('/auth/login')
  }

  // Login function
  async function login(credentials: LoginRequest): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await $fetch<LoginResponse>('/auth/login', {
        baseURL,
        method: 'POST',
        body: credentials,
      })

      if (response?.data?.id_token) {
        token.value = response.data.id_token

        // Fetch user profile after login
        await fetchUser()

        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    }
    catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.data?.message || error.message || 'Login failed',
      }
    }
  }

  // Register function
  async function register(userData: any): Promise<{ success: boolean, error?: string }> {
    try {
      await $fetch('/auth/register', {
        baseURL,
        method: 'POST',
        body: userData,
      })

      return { success: true }
    }
    catch (error: any) {
      console.error('Register error:', error)
      return {
        success: false,
        error: error.data?.message || error.message || 'Registration failed',
      }
    }
  }

  // Refresh token if needed (optional)
  async function refreshToken(): Promise<boolean> {
    if (!token.value)
      return false

    try {
      const response = await $fetch<LoginResponse>('/auth/refresh', {
        baseURL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      if (response?.data?.id_token) {
        token.value = response.data.id_token
        return true
      }

      return false
    }
    catch (error) {
      console.error('Refresh token error:', error)
      await logout()
      return false
    }
  }

  // Initialize auth state on app start
  async function initAuth(): Promise<void> {
    if (token.value && !user.value) {
      await fetchUser()
    }
    else {
      isInitializing.value = false
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    isLoading,
    isInitializing: readonly(isInitializing),
    isFetchingUser: readonly(isFetchingUser),
    login,
    register,
    logout,
    fetchUser,
    refreshToken,
    initAuth,
  }
}
