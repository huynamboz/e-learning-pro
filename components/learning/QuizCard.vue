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

// Handle quiz actions
const handleStartQuiz = () => {
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
        class="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        @click="handleStartQuiz">
        <Icon name="tabler:play" class="text-sm" />
        {{ $t('quiz.startQuiz') }}
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
