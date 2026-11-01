import type { User } from '~/types'
import { useApi } from '~/composables/useApi'

/**
 * Auth Composable - Authentication state management
 */
export const useAuth = () => {
  const api = useApi()
  const router = useRouter()

  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const _checked = ref(false)

  // Check authentication status (call on app init)
  async function checkAuth(): Promise<boolean> {
    if (_checked.value && isAuthenticated.value) {
      return true
    }

    isLoading.value = true
    try {
      const response = await api.getMe()
      if (response.success && response.data) {
        user.value = response.data as User
        isAuthenticated.value = true
      } else {
        user.value = null
        isAuthenticated.value = false
      }
    } catch {
      user.value = null
      isAuthenticated.value = false
    } finally {
      isLoading.value = false
      _checked.value = true
    }

    return isAuthenticated.value
  }

  // Login
  async function login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    try {
      const response = await api.login({ email, password })
      if (response.success && response.data) {
        user.value = response.data.user
        isAuthenticated.value = true
        return { success: true }
      }
      return { success: false, message: response.message || 'ورود ناموفق بود' }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'خطای ناشناخته' }
    } finally {
      isLoading.value = false
    }
  }

  // Register
  async function register(name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> {
    isLoading.value = true
    try {
      const response = await api.register({ name, email, password })
      if (response.success && response.data) {
        user.value = response.data.user
        isAuthenticated.value = true
        return { success: true }
      }
      return { success: false, message: response.message || 'ثبت نام ناموفق بود' }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'خطای ناشناخته' }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  async function logout(): Promise<void> {
    isLoading.value = true
    try {
      await api.logout()
    } finally {
      user.value = null
      isAuthenticated.value = false
      _checked.value = false
      isLoading.value = false
      await router.push('/login')
    }
  }

  // Initialize auth on client side
  if (import.meta.client) {
    checkAuth()
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    checkAuth,
    login,
    register,
    logout,
  }
}