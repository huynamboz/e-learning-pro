import type { LoginRequest, LoginResponse, User } from '~/types/auth.type'
import { useApiClient } from '~/api/apiClient'

import { useAuthApi } from '~/composables/api/useAuthApi'


const authApi = useAuthApi()

export function useAuth() {
  const user = useState<User | null>('auth.user', () => null)
  const profile = useState<User | null>('auth.profile', () => null)
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
  const isFetchingProfile = useState<boolean>('auth.isFetchingProfile', () => false)

  // // Get API client instance
  const apiClient = useApiClient()

  // // User is logged in if has token (and not currently fetching for the first time)
  const isLoggedIn = computed(() => {
    return !!token.value && (!isInitializing.value || !!user.value)
  })

  // // Show loading when initializing or fetching user
  const isLoading = computed(() => isInitializing.value || isFetchingUser.value)

  // Role-based computed properties
  const userRole = computed(() => !user.value?.is_teacher)
  const isTeacher = computed(() => user.value?.is_teacher)

  // No need to sync token with API client anymore
  // API client now uses useCookie directly

  // // Fetch user profile
  async function fetchUser(): Promise<void> {
    if (!token.value) {
      isInitializing.value = false
      return
    }

    isFetchingUser.value = true

    try {
      // API client will automatically handle 401 errors and logout
      const userData = await apiClient.get<User>('/auth/me/')
      user.value = userData
    }
    catch (error) {
      console.error('Fetch user error:', error)
      // API client already handled logout for 401 errors
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
    profile.value = null
    isInitializing.value = false
    isFetchingUser.value = false

    // Redirect to login page
    await navigateTo('/auth/login')
  }

  // Login function
  async function login(credentials: LoginRequest): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login/', credentials)

      if (response?.access && response?.user) {
        token.value = response.access
        user.value = response.user

        if (user.value?.is_teacher) {
          await navigateTo('/admin')
        }
        else {
          await navigateTo('/learning')
        }

        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    }
    catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Login failed',
      }
    }
  }

  // Register function
  async function register(userData: any): Promise<{ success: boolean, error?: string }> {
    try {
      await apiClient.post('/auth/register/', userData)
      return { success: true }
    }
    catch (error: any) {
      console.error('Register error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Registration failed',
      }
    }
  }

  // reset password function
  async function resetPassword(email: string): Promise<{ success: boolean, error?: string, token?: string }> {
    try {
      const response = await apiClient.post('/auth/password/reset/', { email })
      return {
        success: true,
        token: response?.token || null,
      }
    }
    catch (error: any) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Reset password failed',
      }
    }
  }

  // Confirm function
  async function confirmPassword(userData: any): Promise<{ success: boolean, error?: string }> {
    try {
      await apiClient.post('/auth/password/reset/confirm/', userData)
      return { success: true }
    }
    catch (error: any) {
      console.error('Confirm password error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Confirm password failed',
      }
    }
  }

  // Refresh token if needed (optional)
  async function refreshToken(): Promise<boolean> {
    if (!token.value)
      return false

    try {
      // Use the API client's refresh method which handles 401 automatically
      const result = await apiClient.refreshToken()

      if (result?.access) {
        token.value = result.access
        return true
      }

      return false
    }
    catch (error) {
      console.error('Refresh token error:', error)
      // API client already handled logout for 401 errors
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

  // Fetch user profile
  async function fetchProfile(): Promise<void> {
    isFetchingProfile.value = true

    try {
      const response = await authApi.getProfile()
      profile.value = response
    }
    catch (error) {
      console.error('Fetch user error:', error)
    }
    finally {
      isFetchingProfile.value = false
      isInitializing.value = false
    }
  }

  async function updateProfile(payload: any): Promise<{ success: boolean, error?: string }> {
    isFetchingProfile.value = true

    try {
      await authApi.updateProfile(payload)
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to create chapter',
      }
    }
    finally {
      isFetchingProfile.value = false
      isInitializing.value = false
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isInitializing: readonly(isInitializing),
    isFetchingUser: readonly(isFetchingUser),
    isLoggedIn,
    isLoading,
    userRole,
    isTeacher,
    profile,
    login,
    register,
    logout,
    fetchUser,
    refreshToken,
    initAuth,
    resetPassword,
    confirmPassword,
    fetchProfile,
    updateProfile,
  }
}
