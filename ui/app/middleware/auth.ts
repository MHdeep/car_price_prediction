// Auth middleware - protects routes that require authentication
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // If already checked and authenticated, allow
  if (auth.isAuthenticated.value) {
    return
  }

  // Try to restore auth from cookie/session
  await auth.checkAuth()

  if (!auth.isAuthenticated.value) {
    // Redirect to login with return URL
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})