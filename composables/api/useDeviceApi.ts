// Device API service
import { useApiClient } from '~/api/apiClient'

export interface Device {
  device_id: string
  device_name: string
  device_type: 'laptop' | 'tablet' | 'phone' | 'web'
  user_agent: string
  ip_address_masked: string
  last_login_at: string
  is_active: boolean
  created_at: string
}

export interface DeviceListResponse {
  code: string
  data: Device[]
}

// Support both array and object response formats
export type DeviceListResponseType = Device[] | DeviceListResponse

export interface DeviceRevokeResponse {
  code: string
  message: string
}

export function useDeviceApi() {
  const apiClient = useApiClient()

  return {
    // Get list of devices
    getDevices: () =>
      apiClient.get<DeviceListResponseType>('/devices/'),

    // Revoke device (deactivate)
    revokeDevice: (deviceId: string) =>
      apiClient.post<DeviceRevokeResponse>('/devices/revoke/', {
        device_id: deviceId,
      }),

    // Delete device (permanently)
    deleteDevice: (deviceId: string) =>
      apiClient.post<DeviceRevokeResponse>('/devices/revoke/', {
        device_id: deviceId,
        delete: true,
      }),
  }
}

