export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  // Skip middleware on server side
  if (process.server) return
  
  // If user is not logged in, redirect to login
  if (!user.value) {
    return navigateTo('/auth/login')
  }
  
  // Check if user has completed onboarding
  const hasCompletedOnboarding = user.value?.first_name && user.value?.last_name
  
  // If user is trying to access onboarding page but already completed it
  if (to.path === '/onboarding' && hasCompletedOnboarding) {
    return navigateTo('/learning')
  }
  
  // If user hasn't completed onboarding and is not on onboarding page
  if (!hasCompletedOnboarding && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }
})
