import confetti from 'canvas-confetti'

export function useConfetti() {
  function playCorrectSound() {
    // Only run on client side
    if (typeof window === 'undefined')
      return

    try {
      const audio = new Audio('/correct.mp3')
      audio.play().catch((error) => {
        // User may have blocked autoplay, ignore silently
        console.warn('Could not play sound:', error)
      })
    }
    catch (error) {
      console.warn('Could not play sound:', error)
    }
  }

  function playWrongSound() {
    // Only run on client side
    if (typeof window === 'undefined')
      return

    try {
      const audio = new Audio('/wrong.mp3')
      audio.play().catch((error) => {
        // User may have blocked autoplay, ignore silently
        console.warn('Could not play sound:', error)
      })
    }
    catch (error) {
      console.warn('Could not play sound:', error)
    }
  }

  function triggerConfetti() {
    // Only run on client side
    if (typeof window === 'undefined')
      return

    try {
      confetti({
        particleCount: 150,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      })
      confetti({
        particleCount: 150,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      })
    }
    catch {
      // Confetti package not installed yet
      console.warn('Confetti package not available. Please run: pnpm install canvas-confetti')
    }
  }

  function triggerCorrectAnswer() {
    // Play sound and confetti together
    playCorrectSound()
    triggerConfetti()
  }

  return {
    triggerConfetti,
    playCorrectSound,
    playWrongSound,
    triggerCorrectAnswer,
  }
}
