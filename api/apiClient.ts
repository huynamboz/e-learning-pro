import type { FetchOptions } from 'ofetch'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface SafeFetchOptions extends Omit<FetchOptions, 'method'> {
  method?: HttpMethod
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  statusCode: number
  statusMessage: string
  data?: any
}

// Token management using useCookie directly
function getTokenFromCookie(): string | null {
  const tokenCookie = useCookie('auth.token')
  return tokenCookie.value || null
}

function setTokenToCookie(newToken: string | null): void {
  const tokenCookie = useCookie('auth.token')
  tokenCookie.value = newToken
}

// Handle logout when 401 occurs
async function handleUnauthorized() {
  // Clear auth cookie
  const tokenCookie = useCookie('auth.token')
  tokenCookie.value = null

  // Clear user state
  const user = useState('auth.user')
  user.value = null

  // Clear auth states
  const isInitializing = useState('auth.isInitializing')
  const isFetchingUser = useState('auth.isFetchingUser')
  isInitializing.value = false
  isFetchingUser.value = false

  // Redirect to login page
  await navigateTo('/auth/login')
}

// Get base URL
function getBaseURL() {
  const config = useRuntimeConfig()
  return config.public.apiBase
}

// Generate or get device ID
function getDeviceId(): string {
  if (import.meta.client) {
    let deviceId = localStorage.getItem('device-id')
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device-id', deviceId)
    }
    return deviceId
  }
  return `server-${Date.now()}`
}

// Create request headers
function createHeaders(token: string | null, customHeaders: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    'X-Device-ID': getDeviceId(),
    ...customHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Create base request function
async function createRequest<T>(
  url: string,
  options: SafeFetchOptions = {},
  token: string | null = null,
): Promise<T> {
  const headers = createHeaders(token, options.headers as Record<string, string>)

  const result = await $fetch(url, {
    baseURL: getBaseURL(),
    ...options,
    headers,
    onResponseError: async ({ response }: any) => {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.warn('API: Unauthorized access detected, logging out...')
        await handleUnauthorized()
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized - redirecting to login',
        })
      }

      // Handle other errors
      const error: ApiError = {
        statusCode: response.status,
        statusMessage: response.statusText || 'Request failed',
        data: response._data,
      }

      throw error
    },
    onRequestError: ({ error }: any) => {
      console.error('API Request Error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Network error occurred',
      })
    },
  } as any)

  return result as T
}

// HTTP methods as pure functions
function get<T = any>(url: string, options?: FetchOptions, token?: string | null): Promise<T> {
  return createRequest<T>(url, { ...options, method: 'GET' as HttpMethod }, token)
}

function post<T = any>(url: string, body?: any, options?: FetchOptions, token?: string | null): Promise<T> {
  return createRequest<T>(url, { ...options, method: 'POST' as HttpMethod, body }, token)
}

function put<T = any>(url: string, body?: any, options?: FetchOptions, token?: string | null): Promise<T> {
  return createRequest<T>(url, { ...options, method: 'PUT' as HttpMethod, body }, token)
}

function patch<T = any>(url: string, body?: any, options?: FetchOptions, token?: string | null): Promise<T> {
  return createRequest<T>(url, { ...options, method: 'PATCH' as HttpMethod, body }, token)
}

function del<T = any>(url: string, options?: FetchOptions, token?: string | null): Promise<T> {
  return createRequest<T>(url, { ...options, method: 'DELETE' as HttpMethod }, token)
}

// Upload function
async function upload<T = any>(
  url: string,
  formData: FormData,
  options?: FetchOptions,
  token?: string | null,
): Promise<T> {
  const headers = { ...options?.headers } as Record<string, string>

  // Remove Content-Type to let browser set it with boundary
  delete headers['Content-Type']

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const result = await $fetch(url, {
    baseURL: getBaseURL(),
    method: 'POST',
    body: formData,
    ...options,
    headers,
    onResponseError: async ({ response }: any) => {
      if (response.status === 401) {
        console.warn('API: Unauthorized access detected during upload, logging out...')
        await handleUnauthorized()
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized - redirecting to login',
        })
      }

      const error: ApiError = {
        statusCode: response.status,
        statusMessage: response.statusText || 'Upload failed',
        data: response._data,
      }

      throw error
    },
  } as any)

  return result as T
}

// Token refresh function
async function refreshToken(currentToken: string): Promise<{ access: string } | null> {
  try {
    const response = await post<{ access: string }>('/auth/refresh/', {}, {}, currentToken)

    if (response.access) {
      // Update cookie using helper function
      setTokenToCookie(response.access)
      return response
    }

    return null
  }
  catch (error) {
    console.error('Token refresh failed:', error)
    await handleUnauthorized()
    return null
  }
}

// Main API client composable
export function useApiClient() {
  // Create API methods with current token from cookie
  const apiGet = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
    get<T>(url, options, getTokenFromCookie())

  const apiPost = <T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> =>
    post<T>(url, body, options, getTokenFromCookie())

  const apiPut = <T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> =>
    put<T>(url, body, options, getTokenFromCookie())

  const apiPatch = <T = any>(url: string, body?: any, options?: FetchOptions): Promise<T> =>
    patch<T>(url, body, options, getTokenFromCookie())

  const apiDelete = <T = any>(url: string, options?: FetchOptions): Promise<T> =>
    del<T>(url, options, getTokenFromCookie())

  const apiUpload = <T = any>(url: string, formData: FormData, options?: FetchOptions): Promise<T> =>
    upload<T>(url, formData, options, getTokenFromCookie())

  const apiRefreshToken = async (): Promise<{ access: string } | null> => {
    const currentToken = getTokenFromCookie()
    if (!currentToken)
      return null

    const result = await refreshToken(currentToken)
    if (result?.access) {
      setTokenToCookie(result.access)
    }
    return result
  }

  return {
    // Token management
    setToken: setTokenToCookie,
    getToken: getTokenFromCookie,

    // HTTP methods
    get: apiGet,
    post: apiPost,
    put: apiPut,
    patch: apiPatch,
    delete: apiDelete,
    upload: apiUpload,

    // Token utilities
    refreshToken: apiRefreshToken,
  }
}

// Export pure functions for direct use
export {
  del as delete,
  get,
  handleUnauthorized,
  patch,
  post,
  put,
  refreshToken,
  upload,
}

// Export types
export type { FetchOptions }
