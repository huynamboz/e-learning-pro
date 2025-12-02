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

/**
 * Convert ArrayBuffer or Uint8Array to hex string
 */
function bytesToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generate a device ID for this browser/device
 */
async function generateDeviceId(): Promise<string> {
  // Get location information
  // const location = await getLocationInfo()

  // Create a device fingerprint based on available browser information
  const fingerprint = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || 'unknown',
    // location ? `${location.countryCode}|${location.country}|${location.city}|${location.continent}|${location.ip}` : 'location-unknown',
  ].join('|')

  // Hash the fingerprint to create a consistent device ID
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const fingerprintHash = bytesToHex(hashBuffer)

  return fingerprintHash.substring(0, 16) // Use first 16 chars
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
        console.error('Error generating device ID:', error)
        // Fallback: generate simple ID
        const fingerprint = [
          navigator.userAgent,
          `${screen.width}x${screen.height}`,
          new Date().getTimezoneOffset().toString(),
          navigator.hardwareConcurrency?.toString() || 'unknown',
        ].join('|')

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
