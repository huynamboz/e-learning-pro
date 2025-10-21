export default defineNuxtRouteMiddleware((_to, _from) => {
  const { isLoggedIn, isInitializing } = useAuth()

  // Don't redirect if still initializing (loading)
  if (isInitializing.value) {
    return
  }

  // If user is not logged in, redirect to login page
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login', { external: true })
  }
})
