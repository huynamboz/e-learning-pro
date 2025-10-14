<script setup lang="ts">
interface Props {
  visible: boolean
  quizTitle?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'view-answers'): void
  (e: 'go-home'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleViewAnswers = () => {
  emit('view-answers')
}

const handleGoHome = () => {
  emit('go-home')
}

// Computed property for modal visibility
const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  }
})

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <a-modal
    v-model:open="modalVisible"
    :footer="null"
    width="400px"
    centered
    @cancel="handleClose"
    :mask-style="{ background: 'linear-gradient(to top, #EBFFDF, white)' }"
  >
    <!-- Confetti Background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
      <div class="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="absolute top-12 left-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
      <div class="absolute top-6 right-12 w-3 h-3 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.6s"></div>
      <div class="absolute top-16 left-8 w-2 h-2 bg-red-400 rounded-full animate-bounce" style="animation-delay: 0.8s"></div>
    </div>

    <!-- Content -->
    <div class="text-center relative z-10">
      <!-- Icon -->
      <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-200">
        <div class="text-4xl">🎉</div>
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold text-green-700 mb-4">
        Congratulations!
      </h2>

      <!-- Message -->
      <p class="text-gray-600 mb-8 leading-relaxed">
        You've successfully completed the quiz! Check your score and review the answers.
      </p>

      <!-- Buttons -->
      <div class="flex gap-3">
        <a-button
          @click="handleGoHome"
          class="flex-1"
          size="large"
        >
          Go back home
        </a-button>
        <a-button
          @click="handleViewAnswers"
          type="primary"
          class="flex-1"
          size="large"
        >
          View answers
        </a-button>
      </div>
    </div>
  </a-modal>
</template>
