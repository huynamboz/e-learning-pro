/**
 * Get location information from API
 */
// async function getLocationInfo(): Promise<{
//   countryCode: string
//   country: string
//   city: string
//   continent: string
//   ip: string
// } | null> {
//   try {
//     const data = await $fetch<{
//       countryCode?: string
//       country?: string
//       city?: string
//       continent?: string
//       ip?: string
//     }>('https://ip.devmock.dev/')
//     return {
//       countryCode: data.countryCode || 'unknown',
//       country: data.country || 'unknown',
//       city: data.city || 'unknown',
//       continent: data.continent || 'unknown',
//       ip: data.ip || 'unknown',
//     }
//   }
//   catch (error) {
//     console.error('Error fetching location:', error)
//     return null
//   }
// }

import FingerprintJS from '@fingerprintjs/fingerprintjs'

/**
 * Generate a device ID using FingerprintJS
 */
async function generateDeviceId(): Promise<string> {
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
  }
  catch (error) {
    console.error('Error generating device ID with FingerprintJS:', error)
    throw error
  }
}

export default defineNuxtPlugin(async () => {
  // Generate and store device ID if not exists
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    let deviceId = localStorage.getItem('device-id')

    if (!deviceId) {
      try {
        deviceId = await generateDeviceId()
        localStorage.setItem('device-id', deviceId)
      }
      catch (error) {
        console.error('Error generating device ID with FingerprintJS:', error)
        // Fallback: generate simple ID based on browser info
        const fingerprint = [
          navigator.userAgent,
          `${screen.width}x${screen.height}`,
          new Date().getTimezoneOffset().toString(),
          navigator.hardwareConcurrency?.toString() || 'unknown',
        ].join('|')

        // Simple hash function for fallback
        let hash = 5381
        for (let i = 0; i < fingerprint.length; i++) {
          hash = ((hash << 5) + hash) + fingerprint.charCodeAt(i)
          hash = hash & hash
        }

        deviceId = Math.abs(hash).toString(16).substring(0, 16).padStart(16, '0')
        localStorage.setItem('device-id', deviceId)
      }
    }
  }

  // Initialize authentication state on client-side
  const { initAuth, fetchProfile, isLoggedIn } = useAuth()

  await initAuth()
  if (isLoggedIn.value) {
    await fetchProfile()
  }
})
