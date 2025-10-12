<script setup lang="ts">
import type { QuizApiResponse } from '~/composables/api/useQuizApi'

interface Props {
  quiz: QuizApiResponse
}

const props = defineProps<Props>()

// Format time display
const formatTimeDisplay = (quiz: QuizApiResponse): string => {
  return quiz.time_limit_display || 'Free time'
}

// Handle quiz actions
const handleStartQuiz = () => {
  // Navigate to quiz taking page
  navigateTo(`/learning/quiz/${props.quiz.id}`)
}

const handleViewResults = () => {
  // Navigate to quiz results page
  navigateTo(`/learning/quiz/${props.quiz.id}/results`)
}
</script>

<template>
  <div class="bg-pink-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header with Title and Time -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-bold text-gray-900 flex-1 pr-4 leading-tight">
        {{ quiz.title }}
      </h3>
      <div class="flex items-center gap-1 text-gray-700 text-sm font-medium">
        <span>{{ formatTimeDisplay(quiz) }}</span>
        <Icon name="tabler:clock" class="text-base" />
      </div>
    </div>

    <!-- Description -->
    <p class="text-gray-700 text-sm mb-6 leading-relaxed">
      {{ quiz.description }}
      <span class="ml-1">🍀</span>
    </p>

    <!-- Action Buttons -->
    <div class="flex gap-2 justify-end">
      <button
        class="px-4 py-2 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
        @click="handleStartQuiz"
      >
        Let's go
      </button>
      <button
        class="px-4 py-2 bg-blue-700 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
        @click="handleViewResults"
      >
        See Result
      </button>
    </div>
  </div>
</template>
