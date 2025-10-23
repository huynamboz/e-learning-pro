/**
 * DevTools Protection Middleware
 *
 * This middleware runs on every route change and checks if DevTools is open.
 * If detected, it redirects to 404 page.
 *
 * Note: This is a client-only middleware as DevTools detection only works in browser.
 */

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev) return
  // Only run on client side
  if (import.meta.server) {
    return
  }

  // Protected routes that require DevTools protection
  const protectedRoutes = [
    '/learning', // Learning pages
    '/courses', // Course detail pages (if needed)
  ]

  // Check if current route should be protected
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  if (!isProtectedRoute) {
    return
  }

  // Skip if already on 404 page to avoid infinite loop
  if (to.path === '/404') {
    return
  }

  // Check DevTools using multiple detection methods
  const isDevToolsOpen = detectDevTools()

  if (isDevToolsOpen) {
    console.warn('⚠️ DevTools detected in middleware - Redirecting for security')
    return navigateTo('/404', { replace: true })
  }

  // Start continuous monitoring if on protected route
  if (typeof window !== 'undefined') {
    startDevToolsMonitoring()
  }
})

// DevTools detection function
function detectDevTools(): boolean {
  // Method 1: Check window size difference
  const threshold = 160
  const widthThreshold = window.outerWidth - window.innerWidth > threshold
  const heightThreshold = window.outerHeight - window.innerHeight > threshold

  if (widthThreshold || heightThreshold) {
    return true
  }

  // Method 2: Check if debugger is active
  try {
    const element = document.createElement('div')
    Object.defineProperty(element, 'id', {
      get() {
        return 'devtools-detected'
      },
    })

    // This will be slower if DevTools is open
    const start = performance.now()
    // eslint-disable-next-line no-console
    console.log(element)
    // eslint-disable-next-line no-console
    console.clear()
    const end = performance.now()

    if (end - start > 100) {
      return true
    }
  }
  catch {
    // Detection failed, assume safe
  }

  return false
}

// Global monitoring flag to prevent multiple intervals
let isMonitoringActive = false
let monitoringIntervalId: NodeJS.Timeout | null = null

// Start continuous DevTools monitoring
function startDevToolsMonitoring() {
  // Prevent multiple monitoring instances
  if (isMonitoringActive) {
    return
  }

  isMonitoringActive = true

  // Check every second
  monitoringIntervalId = setInterval(() => {
    const detected = detectDevTools()
    if (detected) {
      console.warn('⚠️ DevTools detected during monitoring - Redirecting')
      stopDevToolsMonitoring()
      navigateTo('/404', { replace: true })
    }
  }, 1000)

  // Keyboard shortcuts detection
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      e.stopPropagation()
      console.warn('⚠️ F12 detected - Redirecting')
      navigateTo('/404', { replace: true })
      return false
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Windows/Linux)
    // Cmd+Option+I, Cmd+Option+J, Cmd+Option+C (Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault()
        e.stopPropagation()
        console.warn('⚠️ DevTools shortcut detected - Redirecting')
        navigateTo('/404', { replace: true })
        return false
      }
    }

    // Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+S (Save)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // Context menu prevention
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'VIDEO' || target.closest('.drm-protected')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // Add event listeners
  document.addEventListener('keydown', handleKeyDown, true)
  document.addEventListener('contextmenu', handleContextMenu, true)

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    stopDevToolsMonitoring()
  })
}

// Stop DevTools monitoring
function stopDevToolsMonitoring() {
  if (monitoringIntervalId) {
    clearInterval(monitoringIntervalId)
    monitoringIntervalId = null
  }
  isMonitoringActive = false
}
