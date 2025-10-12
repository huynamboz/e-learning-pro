import type { ListApiResponse } from '~/api/apiClient'
import { computed, ref } from 'vue'
import { useApiClient } from '~/api/apiClient'

export interface User {
  id: number
  email: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string
}

export interface UsersResponse extends ListApiResponse<User> {}

export function useUsersAdminApi() {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const apiClient = useApiClient()

  // Fetch users from API
  const fetchUsers = async (params: {
    limit?: number
    offset?: number
    search?: string
    ordering?: string
  } = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      if (params.limit)
        queryParams.append('limit', params.limit.toString())
      if (params.offset)
        queryParams.append('offset', params.offset.toString())
      if (params.search)
        queryParams.append('search', params.search)
      if (params.ordering)
        queryParams.append('ordering', params.ordering)

      const response = await apiClient.get<UsersResponse>('/users', {
        params: Object.fromEntries(queryParams),
      })

      users.value = response.results
      totalCount.value = response.count

      return response
    }
    catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
      throw err
    }
    finally {
      loading.value = false
    }
  }

  // Fetch latest users (for dashboard)
  const fetchLatestUsers = async (limit: number = 5) => {
    return await fetchUsers({
      limit,
      ordering: '-date_joined',
    })
  }

  // Get user by ID
  const getUserById = (id: number) => {
    return users.value.find(user => user.id === id)
  }

  // Computed properties
  const activeUsers = computed(() => users.value.filter(user => user.is_active))
  const staffUsers = computed(() => users.value.filter(user => user.is_staff))
  const superUsers = computed(() => users.value.filter(user => user.is_superuser))

  return {
    // State
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    totalCount: readonly(totalCount),

    // Actions
    fetchUsers,
    fetchLatestUsers,
    getUserById,

    // Computed
    activeUsers,
    staffUsers,
    superUsers,
  }
}
