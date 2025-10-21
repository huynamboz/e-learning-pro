// Function to check if user has completed onboarding
function checkOnboardingCompletion(user: any): boolean {
  if (!user)
    return false

  // Required fields for onboarding completion
  const requiredFields = [
    'first_name',
    'last_name',
    'gender',
    'date_of_birth',
    'phone_number',
    'contact_address',
    'headline',
  ]

  // Check if all required fields are present and not empty
  return requiredFields.every((field) => {
    const value = user[field]
    return value !== null && value !== undefined && value !== ''
  })
}

export default defineNuxtRouteMiddleware((to, _from) => {
  const { isLoggedIn, isInitializing, profile } = useAuth()

  // Don't redirect if still initializing (loading)
  if (isInitializing.value) {
    return
  }

  // If user is not logged in, redirect to login page
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login', { external: true })
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = checkOnboardingCompletion(profile.value)

  // If user is trying to access onboarding page but already completed it
  if (to.path === '/onboarding' && hasCompletedOnboarding) {
    return navigateTo('/learning')
  }

  // If user hasn't completed onboarding and is not on onboarding page
  if (!hasCompletedOnboarding && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }
})
