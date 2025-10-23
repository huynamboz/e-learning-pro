/**
 * Video Protection Middleware (Named - Apply to specific routes)
 *
 * This middleware can be applied to specific pages that need video protection.
 * Use this in page meta: middleware: ['video-protection']
 *
 * Example:
 * ```
 * definePageMeta({
 *   middleware: ['video-protection']
 * })
 * ```
 */

export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return
  }

  // Skip if already on 404 page to avoid infinite loop
  if (to.path === '/404') {
    return
  }

  // Immediate DevTools check
  const isDevToolsOpen = checkDevTools()

  if (isDevToolsOpen) {
    console.warn('⚠️ DevTools detected - Video content is protected')
    return navigateTo('/404', { replace: true })
  }
})

/**
 * Check if DevTools is currently open
 */
function checkDevTools(): boolean {
  // Method 1: Window size check
  const threshold = 160
  const widthDiff = window.outerWidth - window.innerWidth
  const heightDiff = window.outerHeight - window.innerHeight

  if (widthDiff > threshold || heightDiff > threshold) {
    return true
  }

  // Method 2: Performance check
  try {
    const start = performance.now()
    // eslint-disable-next-line no-debugger
    debugger
    const duration = performance.now() - start

    // If debugger statement takes long, DevTools is likely open
    if (duration > 100) {
      return true
    }
  }
  catch {
    // If debugger fails, continue
  }

  return false
}
