// User API service
import type { User } from '~/types/auth.type'
import { useApiClient } from '~/api/apiClient'

export function useUserApi() {
  const apiClient = useApiClient()

  return {
    // Get current user profile
    getProfile: () => apiClient.get<User>('/auth/me/'),

    // Update profile
    updateProfile: (data: Partial<User>) =>
      apiClient.patch<User>('/auth/me/', data),

    // Upload avatar
    uploadAvatar: (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return apiClient.upload('/user/avatar/', formData)
    },

    // Change password
    changePassword: (data: { old_password: string, new_password: string }) =>
      apiClient.post('/user/change-password/', data),

    // Get user settings
    getSettings: () =>
      apiClient.get('/user/settings/'),

    // Update user settings
    updateSettings: (settings: any) =>
      apiClient.patch('/user/settings/', settings),

    // Get user notifications
    getNotifications: (params?: { page?: number, unread_only?: boolean }) => {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      const queryString = queryParams.toString()
      return apiClient.get(`/user/notifications/${queryString ? `?${queryString}` : ''}`)
    },

    // Mark notification as read
    markNotificationRead: (notificationId: number) =>
      apiClient.patch(`/user/notifications/${notificationId}/`, { is_read: true }),

    // Mark all notifications as read
    markAllNotificationsRead: () =>
      apiClient.post('/user/notifications/mark-all-read/'),

    // Delete notification
    deleteNotification: (notificationId: number) =>
      apiClient.delete(`/user/notifications/${notificationId}/`),

    // Get user activity/history
    getActivity: (params?: { page?: number, limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      const queryString = queryParams.toString()
      return apiClient.get(`/user/activity/${queryString ? `?${queryString}` : ''}`)
    },
  }
}
