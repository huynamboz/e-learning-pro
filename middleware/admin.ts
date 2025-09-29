export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, isInitializing, user } = useAuth()

    if (isInitializing.value) {
      return
    }

    if (!isLoggedIn.value) {
      return navigateTo('/auth/login', { external: true })
    }

  // Check if user has admin role
  if (!user.value || user.value.role !== 'admin') {
    // Redirect to home page or show access denied
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin privileges required',
    })
  }
})
