export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, isInitializing, user } = useAuth()

  // Don't redirect if still initializing (loading)
  if (isInitializing.value) {
    return
  }

  // If user is already logged in, redirect to dashboard or home
  if (isLoggedIn.value) {
    if (user.value && user.value?.role === 'admin') {
      return navigateTo('/admin')
    }
    return navigateTo('/learning')
  }
})
