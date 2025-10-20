export default defineNuxtPlugin(async () => {
  const { initAuth, fetchProfile, isLoggedIn } = useAuth()

  // Initialize authentication state on client-side
  await initAuth()
  if (isLoggedIn.value) {
    await fetchProfile()
  }
})
