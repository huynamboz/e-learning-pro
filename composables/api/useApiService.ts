// Base API service utilities và higher-order functions
import { useApiClient } from '~/api/apiClient'

// Generic CRUD service creator
export function createApiService<T>(baseUrl: string) {
  const apiClient = useApiClient()

  return {
    // Get all items
    getAll: () => apiClient.get<T[]>(baseUrl),

    // Get item by ID
    getById: (id: string | number) => apiClient.get<T>(`${baseUrl}${id}/`),

    // Create new item
    create: (data: Partial<T>) => apiClient.post<T>(baseUrl, data),

    // Update item
    update: (id: string | number, data: Partial<T>) =>
      apiClient.put<T>(`${baseUrl}${id}/`, data),

    // Partial update
    patch: (id: string | number, data: Partial<T>) =>
      apiClient.patch<T>(`${baseUrl}${id}/`, data),

    // Delete item (soft delete - returns 204 No Content)
    delete: (id: string | number) => apiClient.delete<void>(`${baseUrl}${id}/`),
  }
}