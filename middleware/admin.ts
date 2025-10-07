export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, isInitializing, user } = useAuth()

    if (isInitializing.value) {
      return
    }

    if (!isLoggedIn.value) {
      return navigateTo('/auth/login', { external: true })
    }

  if (!user.value || !user.value.is_teacher) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin privileges required',
    })
  }
})
