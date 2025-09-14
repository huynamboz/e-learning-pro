export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, isInitializing } = useAuth()

  // Don't redirect if still initializing (loading)
  if (isInitializing.value) {
    return
  }

  // If user is already logged in, redirect to dashboard or home
  if (isLoggedIn.value) {
    return navigateTo('/learning')
  }
})
