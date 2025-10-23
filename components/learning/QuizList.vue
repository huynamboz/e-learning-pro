<script setup lang="ts">
import type { QuizApiResponse } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import QuizCard from './QuizCard.vue'
import QuizAttemptsDialog from './quiz/QuizAttemptsDialog.vue'

interface Props {
  courseId: string
  lessonId?: string
}

const props = defineProps<Props>()
const { t } = useI18n()

// API composable
const { getQuizzes, getMyAttempts } = useQuizApi()

// State
const quizzes = ref<QuizApiResponse[]>([])
const allAttempts = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showConfirmDialog = ref(false)
const selectedQuiz = ref<QuizApiResponse | null>(null)
const showAttemptsDialog = ref(false)
const selectedQuizForResults = ref<QuizApiResponse | null>(null)

// Fetch quizzes and attempts for the course/chapter
const fetchQuizzes = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Fetch both quizzes and attempts in parallel
    const [quizzesResponse, attemptsResponse] = await Promise.all([
      getQuizzes({ lesson: props.lessonId }),
      getMyAttempts()
    ])
    
    quizzes.value = quizzesResponse.results
    allAttempts.value = attemptsResponse.results || []
  } catch (err: any) {
    error.value = err.message || t('quiz.failedToFetchQuizzes')
    console.error('Error fetching quizzes:', err)
  } finally {
    loading.value = false
  }
}

// Handle quiz start with confirmation
const handleStartQuiz = (quiz: QuizApiResponse) => {
  selectedQuiz.value = quiz
  showConfirmDialog.value = true
}

// Confirm and start quiz
const confirmStartQuiz = () => {
  if (selectedQuiz.value) {
    navigateTo(`/learning/quiz/${selectedQuiz.value.id}?course=${props.courseId}`)
  }
  showConfirmDialog.value = false
  selectedQuiz.value = null
}

// Cancel quiz start
const cancelStartQuiz = () => {
  showConfirmDialog.value = false
  selectedQuiz.value = null
}

// Handle view results
const handleViewResults = (quiz: QuizApiResponse) => {
  selectedQuizForResults.value = quiz
  showAttemptsDialog.value = true
}

// Handle attempt selection
const handleSelectAttempt = (attemptId: string) => {
  if (selectedQuizForResults.value) {
    navigateTo(`/learning/quiz/${selectedQuizForResults.value.id}/results?attempt=${attemptId}&course=${props.courseId}`)
  }
  showAttemptsDialog.value = false
  selectedQuizForResults.value = null
}

// Close attempts dialog
const closeAttemptsDialog = () => {
  showAttemptsDialog.value = false
  selectedQuizForResults.value = null
}

// Get attempts for a specific quiz
const getQuizAttempts = (quizId: string) => {
  return allAttempts.value.filter(attempt => 
    attempt.quiz === quizId && attempt.status === 'completed'
  )
}

// Get attempt count for a specific quiz
const getQuizAttemptCount = (quizId: string) => {
  return getQuizAttempts(quizId).length
}

// Check if quiz has any completed attempts
const hasCompletedAttempts = (quizId: string) => {
  return getQuizAttemptCount(quizId) > 0
}

// Watch for chapter changes
watch(() => props.lessonId, () => {
  if (!props.lessonId) return
  fetchQuizzes()
}, { immediate: true })

</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">{{ $t('quiz.loadingQuizzes') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="tabler:alert-circle" class="text-red-500" />
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="quizzes.length === 0" class="text-center py-8">
      <Icon name="mingcute:question-line" class="text-4xl text-gray-400 mx-auto mb-2" />
      <p class="text-gray-500">{{ $t('quiz.noQuizzesAvailable') }}</p>
    </div>

    <!-- Quiz List -->
    <div v-else class="space-y-4">
      <QuizCard
        v-for="quiz in quizzes"
        :key="quiz.id"
        :quiz="quiz"
        :attempt-count="getQuizAttemptCount(quiz.id)"
        :has-completed-attempts="hasCompletedAttempts(quiz.id)"
        @start-quiz="handleStartQuiz"
        @view-results="handleViewResults"
      />
    </div>

    <!-- Confirmation Dialog -->
    <a-modal
      v-model:open="showConfirmDialog"
      :title="$t('quiz.startQuizConfirm')"
      :footer="null"
      width="400px"
      centered
      @cancel="cancelStartQuiz"
    >
      <div class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="tabler:question-mark" class="text-green-600 text-2xl" />
        </div>
        
        <p class="text-gray-600 mb-6">
          {{ $t('quiz.confirmStartMessage', { title: selectedQuiz?.title }) }}
          <br><br>
          {{ $t('quiz.confirmStartWarning') }}
        </p>
        
        <div class="flex gap-3 justify-center">
          <a-button @click="cancelStartQuiz">
            {{ $t('common.cancel') }}
          </a-button>
          <a-button type="primary" @click="confirmStartQuiz">
            {{ $t('quiz.startQuiz') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Quiz Attempts Dialog -->
    <QuizAttemptsDialog
      :visible="showAttemptsDialog"
      :quiz-id="selectedQuizForResults?.id || ''"
      :quiz-title="selectedQuizForResults?.title"
      :attempts="selectedQuizForResults ? getQuizAttempts(selectedQuizForResults.id) : []"
      @selectAttempt="handleSelectAttempt"
      @close="closeAttemptsDialog"
    />
  </div>
</template>
