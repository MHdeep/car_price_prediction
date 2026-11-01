import type { ApiResponse, CarFilters, CarFormData, PredictionResponse } from '~/types'

/**
 * API Composable - Centralized API calls with error handling
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  // Generic fetch wrapper with error handling
  async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${baseURL}${endpoint}`

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await $fetch.raw<ApiResponse<T>>(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = response._data as ApiResponse<T> | undefined
        return {
          success: false,
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: errorData?.errors,
        }
      }

      return {
        success: true,
        data: response._data as T,
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
        }
      }
      return {
        success: false,
        message: 'خطای ناشناخته رخ داد',
      }
    }
  }

  // GET request
  async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async function post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  // Car-specific API calls
  async function getCarFilters(): Promise<ApiResponse<CarFilters>> {
    return get<CarFilters>('/api/car-filters/')
  }

  async function predictPrice(data: CarFormData): Promise<ApiResponse<PredictionResponse>> {
    return post<PredictionResponse>('/api/predict/', data)
  }

  // Auth API calls
  async function login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: { id: number; name: string; email: string } }>> {
    return post('/api/login/', credentials)
  }

  async function register(data: { name: string; email: string; password: string }): Promise<ApiResponse<{ user: { id: number; name: string; email: string } }>> {
    return post('/api/singup/', data)
  }

  async function getMe(): Promise<ApiResponse<{ id: number; name: string; email: string }>> {
    return get('/api/get-me/')
  }

  async function logout(): Promise<ApiResponse<void>> {
    return post('/api/logout/', {})
  }

  return {
    get,
    post,
    getCarFilters,
    predictPrice,
    login,
    register,
    getMe,
    logout,
  }
}