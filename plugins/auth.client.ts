export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth()

  // Initialize authentication state on client-side
  await initAuth()
})
