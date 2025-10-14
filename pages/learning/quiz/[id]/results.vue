<script setup lang="ts">
import type { QuizAttempt, StudentAnswer } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import MultipleChoiceReview from '~/components/learning/quiz/MultipleChoiceReview.vue'
import TextInputReview from '~/components/learning/quiz/TextInputReview.vue'

definePageMeta({
  layout: 'auth',
})

// Route params
const route = useRoute()
const quizId = route.params.id as string
const attemptId = route.query.attempt as string
const courseId = route.query.course as string

console.log('Route params:', route.params)
console.log('Route query:', route.query)

// API composable
const { getAttempt, getQuiz } = useQuizApi()

// State
const attempt = ref<QuizAttempt | null>(null)
const quiz = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const scorePercentage = computed(() => {
  if (!attempt.value) return 0
  return Math.round((attempt.value.correct_answers / attempt.value.total_questions) * 100)
})

const scoreColor = computed(() => {
  const percentage = scorePercentage.value
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
})

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Get question data for an answer
const getQuestionForAnswer = (answer: StudentAnswer) => {
  if (!quiz.value?.questions) return null
  return quiz.value.questions.find((q: any) => q.id === answer.question)
}

// Load attempt results
const loadResults = async () => {
  if (!attemptId) {
    error.value = 'No attempt ID provided'
    return
  }

  try {
    loading.value = true
    error.value = null
    
    // Load both attempt and quiz data
    const [attemptResponse, quizResponse] = await Promise.all([
      getAttempt(attemptId),
      getQuiz(quizId)
    ])
    
    console.log('attempt response', attemptResponse)
    console.log('quiz response', quizResponse)
    
    attempt.value = attemptResponse
    quiz.value = quizResponse
  } catch (err: any) {
    error.value = err.message || 'Failed to load results'
    console.error('Error loading results:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('Results page mounted with attemptId:', attemptId)
  loadResults()
})
</script>

<template>
  <div class="px-10 py-10">
    <div class="w-full max-w-[750px] mx-auto">
      <!-- Header -->
      <div class="flex justify-between mb-6">
        <h3 class="text-2xl font-semibold text-green-700">
          Quiz Results
        </h3>
        <a-button type="default" @click="navigateTo(courseId ? `/learning/${courseId}` : '/learning')">
          Back to Learning
        </a-button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p class="text-sm text-gray-500">Loading results...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center gap-3">
          <Icon name="tabler:alert-circle" class="text-red-500 text-xl" />
          <div>
            <h3 class="text-red-800 font-medium">Error</h3>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Results Content -->
      <div v-else-if="attempt" class="space-y-6">
        <!-- Congratulations Banner -->
        <div class="bg-green-100 rounded-t-2xl p-6 text-center">
          <div class="text-2xl font-bold text-green-700 mb-2">
            🎉 Congratulations! 🎉
          </div>
          <p class="text-gray-600">
            You've completed the {{ attempt.quiz_title }}
          </p>
        </div>

        <!-- Score Summary -->
        <div class="bg-white rounded-b-2xl shadow-sm p-6">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-800">{{ attempt.total_questions }}</div>
              <div class="text-sm text-gray-600">Tổng câu hỏi</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-800">{{ attempt.correct_answers }}</div>
              <div class="text-sm text-gray-600">Số câu đúng</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold" :class="scoreColor">{{ scorePercentage }}%</div>
              <div class="text-sm text-gray-600">Điểm</div>
            </div>
          </div>
        </div>

        <!-- Question Review -->
        <div class="space-y-4">
          <MultipleChoiceReview
            v-for="(answer, index) in attempt.answers.filter(a => a.question_type === 'multiple_choice')"
            :key="`mc-${answer.id}`"
            :answer="answer"
            :question-number="attempt.answers.indexOf(answer) + 1"
            :question="getQuestionForAnswer(answer)"
          />
          <TextInputReview
            v-for="(answer, index) in attempt.answers.filter(a => a.question_type === 'text_input')"
            :key="`ti-${answer.id}`"
            :answer="answer"
            :question-number="attempt.answers.indexOf(answer) + 1"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 pt-6">
          <a-button type="default" @click="navigateTo(courseId ? `/learning/${courseId}` : '/learning')">
            Go back
          </a-button>
          <a-button type="primary" @click="navigateTo(`/learning/quiz/${quizId}${courseId ? `?course=${courseId}` : ''}`)">
            Retake Quiz
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>
