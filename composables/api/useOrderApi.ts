import { useApiClient } from '~/api/apiClient'
import { createApiService } from '~/composables/api/useApiService'

export interface OrderPayload {
  course_id: string
  classroom_id?: string // Optional - required for course type, not for resource type
  price_plan_id?: string // Optional - required for resource type, not for course type
  price_amount?: string // Optional - API will automatically use classroom.effective_price or plan price if not provided
  price_currency: string
  payment_method: string
  payment_reference: string
  notes: string
  metadata: Record<string, any>
}

export interface OrderUpdatePayload {
  status: 'pending' | 'complete' | 'cancel'
  admin_note?: string
  canceled_reason?: string
  payment_reference?: string
  payment_method?: string
  price_amount?: string
}

export interface Order {
  id: string
  course_id: string
  classroom_id: string
  user_id: string
  price_amount: string
  price_currency: string
  payment_method: string
  payment_reference: string
  status: string
  notes: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export function useOrderApi() {
  const apiClient = useApiClient()
  const baseService = createApiService<Order>('/orders/')

  return {
    ...baseService,
    createOrder: (orderData: OrderPayload) =>
      apiClient.post<Order>('/orders/', orderData),
    getOrdersByUser: (userId: string) =>
      apiClient.get<Order[]>(`/orders/user/${userId}/`),
    updateOrder: (orderId: string, updateData: OrderUpdatePayload) =>
      apiClient.patch<Order>(`/orders/${orderId}/`, updateData),
  }
}
