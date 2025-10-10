// Auth API service
import { useApiClient } from '~/api/apiClient'

export function useAuthApi() {
  const apiClient = useApiClient()

  return {
    // Login
    login: (credentials: { email: string, password: string }) =>
      apiClient.post('/auth/login/', credentials),

    // Register
    register: (userData: any) =>
      apiClient.post('/auth/register/', userData),

    // Refresh token
    refreshToken: () =>
      apiClient.post('/auth/refresh/'),

    // Logout
    logout: () =>
      apiClient.post('/auth/logout/'),

    // Forgot password
    forgotPassword: (email: string) =>
      apiClient.post('/auth/forgot-password/', { email }),

    // Reset password
    resetPassword: (token: string, password: string) =>
      apiClient.post('/auth/reset-password/', { token, password }),

    // Verify email
    verifyEmail: (token: string) =>
      apiClient.post('/auth/verify-email/', { token }),

    // Resend verification email
    resendVerification: (email: string) =>
      apiClient.post('/auth/resend-verification/', { email }),

    // Get profile
    getProfile: () =>
      apiClient.get('/profile/'),

    // udpate profile
    updateProfile: (payload: any) =>
      apiClient.patch('/profile/', payload),
  }
}
