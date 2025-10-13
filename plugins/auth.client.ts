export default defineNuxtPlugin(async () => {
  const { initAuth, fetchProfile } = useAuth()

  // Initialize authentication state on client-side
  await initAuth()
  await fetchProfile()
})
