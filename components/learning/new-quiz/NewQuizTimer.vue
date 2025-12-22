<script setup lang="ts">
interface Props {
  timeRemaining: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  expired: []
}>()

const timeRemaining = ref(props.timeRemaining)
let timerInterval: NodeJS.Timeout | null = null

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function startTimer() {
  if (timerInterval)
    clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    }
    else {
      stopTimer()
      emit('expired')
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Update when prop changes (e.g., on resume)
watch(() => props.timeRemaining, (newTime) => {
  timeRemaining.value = newTime
  if (newTime > 0) {
    startTimer()
  }
}, { immediate: true })

onMounted(() => {
  if (timeRemaining.value > 0) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})

const isLowTime = computed(() => {
  return timeRemaining.value <= 300 // Less than 5 minutes
})

const isCriticalTime = computed(() => {
  return timeRemaining.value <= 60 // Less than 1 minute
})
</script>

<template>
  <div
    class="px-4 py-2 rounded-xl border-2 font-mono text-lg font-semibold transition-colors"
    :class="[
      isCriticalTime
        ? 'bg-red-50 border-red-500 text-red-700 animate-pulse'
        : isLowTime
          ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
          : 'bg-emerald-50 border-emerald-500 text-emerald-700',
    ]"
  >
    <div class="flex items-center gap-2">
      <Icon name="mdi:timer-outline" class="text-xl" />
      <span>{{ formatTime(timeRemaining) }}</span>
    </div>
  </div>
</template>

