<script setup lang="ts">
import type { QuizApiResponse } from '~/composables/api/useQuizApi'

interface Props {
  quiz: QuizApiResponse
  attemptCount?: number
  hasCompletedAttempts?: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()

// Define emits
const emit = defineEmits<{
  'start-quiz': [quiz: QuizApiResponse]
  'view-results': [quiz: QuizApiResponse]
}>()

// Format time display
const formatTimeDisplay = (quiz: QuizApiResponse): string => {
  if (quiz.time_type === 'no-limit' || !quiz.time_value || !quiz.time_unit) {
    return t('quiz.freeTime')
  }
  
  const timeValue = quiz.time_value
  const timeUnit = quiz.time_unit
  
  return t('quiz.timeLimit', { 
    timeValue: timeValue, 
    timeUnit: t(`quiz.${timeUnit}`) 
  })
}

// Check if user can retake the quiz
const canRetake = computed(() => {
  if (!props.quiz.retake_limit) {
    return true // No limit, can always retake
  }
  
  if (!props.attemptCount) {
    return true // No attempts yet, can start
  }
  
  return props.attemptCount < props.quiz.retake_limit
})

// Get retake status text
const retakeStatusText = computed(() => {
  if (!props.quiz.retake_limit) {
    return 'Không giới hạn'
  }
  
  if (!props.attemptCount) {
    return `${props.quiz.retake_limit} lần`
  }
  
  const remaining = props.quiz.retake_limit - props.attemptCount
  if (remaining <= 0) {
    return 'Đã hết lượt'
  }
  
  return `Còn ${remaining} lần`
})

// Handle quiz actions
const handleStartQuiz = () => {
  if (!canRetake.value) {
    // Show error message
    return
  }
  emit('start-quiz', props.quiz)
}

const handleViewResults = () => {
  emit('view-results', props.quiz)
}
</script>

<template>
  <div
    class="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-100 hover:border-blue-200">
    <!-- Header with Title and Status -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1 pr-4">
        <h3 class="text-xl font-bold text-gray-900 leading-tight">
          {{ quiz.title }}
        </h3>
      </div>

      <!-- Time, Questions, and Attempts -->
      <div class="flex items-center gap-3 text-gray-700 text-sm font-medium">
        <div class="flex items-center gap-1">
          <Icon name="tabler:question-mark" class="text-base" />
          <span>{{ quiz.total_questions }} {{ $t('quiz.questions') }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="tabler:clock" class="text-base" />
          <span>{{ formatTimeDisplay(quiz) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="tabler:refresh" class="text-base" />
          <span :class="!canRetake ? 'text-red-600' : 'text-gray-700'">{{ retakeStatusText }}</span>
        </div>
        <div v-if="attemptCount && attemptCount > 0" class="flex items-center gap-1">
          <Icon name="tabler:chart-bar" class="text-base" />
          <span>{{ attemptCount }} {{ $t('quiz.attempts') }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p class="text-gray-700 text-sm mb-6 leading-relaxed">
      {{ quiz.description }}
    </p>


    <!-- Action Buttons -->
    <div class="flex gap-3 justify-end">
      <button
        :disabled="!canRetake"
        :class="[
          'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm flex items-center gap-2',
          canRetake 
            ? 'cursor-pointer bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-md' 
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        ]"
        @click="handleStartQuiz">
        <Icon name="tabler:play" class="text-sm" />
        {{ canRetake ? $t('quiz.startQuiz') : 'Đã hết lượt' }}
      </button>
      <button v-if="hasCompletedAttempts"
        class="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        @click="handleViewResults">
        <Icon name="tabler:chart-bar" class="text-sm" />
        {{ $t('quiz.viewResults') }}
      </button>
    </div>
  </div>
</template>
