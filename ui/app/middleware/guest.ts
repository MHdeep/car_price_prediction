// Guest middleware - redirects authenticated users away from login/signup
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // If already checked and not authenticated, allow
  if (!auth.isAuthenticated.value) {
    return
  }

  // Try to restore auth from cookie/session
  await auth.checkAuth()

  if (auth.isAuthenticated.value) {
    // Redirect to home or intended destination
    const redirect = to.query.redirect as string || '/'
    return navigateTo(redirect)
  }
})