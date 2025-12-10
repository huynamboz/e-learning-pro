import { onBeforeUnmount, onMounted, ref } from 'vue'

// Extend Window interface for Firebug detection
declare global {
  interface Window {
    Firebug?: {
      chrome?: {
        isInitialized?: boolean
      }
    }
  }
}

export function useDevToolsDetection() {
  const isDevToolsOpen = ref(false)
  const isBlocked = ref(false)
  let intervalId: NodeJS.Timeout | null = null
  let element: HTMLElement | null = null

  function checkDevTools() {
    // Method 1: Check window size difference
    // const threshold = 160
    // const widthThreshold = window.outerWidth - window.innerWidth > threshold
    // const heightThreshold = window.outerHeight - window.innerHeight > threshold

    // if (widthThreshold || heightThreshold) {
    //   return true
    // }

    // Method 2: Debugger detection
    const devtools = /./
    devtools.toString = function () {
      isDevToolsOpen.value = true
      return 'devtools'
    }

    return false
  }

  function startDetection() {
    if (typeof window === 'undefined') {
      return
    }

    // Create detection element
    element = document.createElement('div')
    Object.defineProperty(element, 'id', {
      get() {
        isDevToolsOpen.value = true
        return 'devtools-detector'
      },
    })

    // Check every second
    intervalId = setInterval(() => {
      const detected = checkDevTools()
      if (detected && !isDevToolsOpen.value) {
        isDevToolsOpen.value = true
      }
    }, 1000)

    // Firebug detection
    if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
      isDevToolsOpen.value = true
    }

    // Disable right click on video elements
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'VIDEO') {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }, true)

    // Disable keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        e.stopPropagation()
        isDevToolsOpen.value = true
        return false
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Windows/Linux)
      // Cmd+Option+I, Cmd+Option+J, Cmd+Option+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (['I', 'J', 'C'].includes(e.key.toUpperCase())) {
          e.preventDefault()
          e.stopPropagation()
          isDevToolsOpen.value = true
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
    }, true)

    // Monitor console usage
    function consoleMonitor() {
      const div = document.createElement('div')
      Object.defineProperty(div, 'id', {
        get() {
          isDevToolsOpen.value = true
          throw new Error('DevTools detected')
        },
      })
      // Silent detection - won't output to console
      const _ = div.id
    }

    try {
      consoleMonitor()
    }
    catch {
      // DevTools detected
    }
  }

  function stopDetection() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (element) {
      element = null
    }
  }

  onMounted(() => {
    startDetection()
  })

  onBeforeUnmount(() => {
    stopDetection()
  })

  return {
    isDevToolsOpen: readonly(isDevToolsOpen),
    isBlocked: readonly(isBlocked),
    startDetection,
    stopDetection,
  }
}
