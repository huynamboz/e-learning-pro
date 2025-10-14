<script setup lang="ts">
import type { QuizApiResponse, QuizAttempt, QuizQuestion, QuizOption } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import QuizCompletionDialog from '~/components/learning/quiz/QuizCompletionDialog.vue'

definePageMeta({
  layout: 'auth',
})
// Route params
const route = useRoute()
const quizId = route.params.id as string
const courseId = route.query.course as string

// API composable
const { getQuiz, startQuizAttempt, submitQuizAnswers } = useQuizApi()

// State
const quiz = ref<QuizApiResponse | null>(null)
const attempt = ref<QuizAttempt | null>(null)
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, string>>({})
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const timeRemaining = ref<number | null>(null)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const showCompletionDialog = ref(false)

// LocalStorage keys
const STORAGE_KEY = `quiz_${quizId}`
const ANSWERS_KEY = `quiz_answers_${quizId}`

// Computed
const currentQuestion = computed(() => {
  if (!quiz.value) return null
  return quiz.value.questions[currentQuestionIndex.value]
})

const progress = computed(() => {
  if (!quiz.value) return 0
  const answeredCount = Object.keys(answers.value).length
  return (answeredCount / quiz.value.total_questions) * 100
})

const answeredCount = computed(() => {
  return Object.keys(answers.value).length
})

const isLastQuestion = computed(() => {
  if (!quiz.value) return false
  return currentQuestionIndex.value === quiz.value.total_questions - 1
})

const isFirstQuestion = computed(() => {
  return currentQuestionIndex.value === 0
})

const canSubmit = computed(() => {
  if (!quiz.value) return false
  return quiz.value.questions.every(q => answers.value[q.id])
})

// Timer functions
const startTimer = () => {
  if (timeRemaining.value && timeRemaining.value > 0) {
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value && timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        handleTimeExpired()
      }
    }, 1000)
  }
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Quiz functions
const loadQuiz = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getQuiz(quizId)
    quiz.value = response
  } catch (err: any) {
    error.value = err.message || 'Failed to load quiz'
    console.error('Error loading quiz:', err)
  } finally {
    loading.value = false
  }
}

const startQuiz = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await startQuizAttempt({ quiz_id: quizId })
    attempt.value = response.attempt
    timeRemaining.value = response.attempt.time_remaining_seconds
    startTimer()
  } catch (err: any) {
    error.value = err.message || 'Failed to start quiz'
    console.error('Error starting quiz:', err)
  } finally {
    loading.value = false
  }
}

const handleTimeExpired = () => {
  stopTimer()
  submitQuiz()
}

const selectAnswer = (questionId: string, optionId: string) => {
  answers.value[questionId] = optionId
  saveToLocalStorage()
}

const setTextAnswer = (questionId: string, text: string) => {
  answers.value[questionId] = text
  saveToLocalStorage()
}

// LocalStorage functions
const saveToLocalStorage = () => {
  if (process.client) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentQuestionIndex: currentQuestionIndex.value,
      answers: answers.value
    }))
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers.value))
  }
}

const loadFromLocalStorage = () => {
  if (process.client) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const savedAnswers = localStorage.getItem(ANSWERS_KEY)
      
      if (saved) {
        const data = JSON.parse(saved)
        currentQuestionIndex.value = data.currentQuestionIndex || 0
      }
      
      if (savedAnswers) {
        answers.value = JSON.parse(savedAnswers)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }
}

const clearLocalStorage = () => {
  if (process.client) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ANSWERS_KEY)
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
    saveToLocalStorage()
  }
}

const previousQuestion = () => {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
    saveToLocalStorage()
  }
}

const submitQuiz = async () => {
  if (!attempt.value || !quiz.value) return

  try {
    submitting.value = true
    error.value = null

    const submitData = {
      answers: quiz.value.questions.map(question => {
        const answer = answers.value[question.id]
        if (question.question_type === 'multiple_choice') {
          return {
            question_id: question.id,
            selected_option_id: answer
          }
        } else {
          return {
            question_id: question.id,
            text_answer: answer || ''
          }
        }
      })
    }

    const response = await submitQuizAnswers(attempt.value.id, submitData)
    attempt.value = response.attempt
    stopTimer()
    
    // Clear localStorage after successful submission
    clearLocalStorage()
    
    // Show completion dialog
    showCompletionDialog.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to submit quiz'
    console.error('Error submitting quiz:', err)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadQuiz()
  if (quiz.value) {
    await startQuiz()
    // Load saved progress after starting quiz
    loadFromLocalStorage()
  }
})

onUnmounted(() => {
  stopTimer()
})

// Dialog event handlers
const handleViewAnswers = () => {
  showCompletionDialog.value = false
  navigateTo(`/learning/quiz/${quizId}/results?attempt=${attempt.value?.id}`)
}

const handleGoHome = () => {
  showCompletionDialog.value = false
  // Navigate back to the specific course being viewed
  if (courseId) {
    navigateTo(`/learning/${courseId}`)
  } else {
    navigateTo('/learning')
  }
}

const handleCloseDialog = () => {
  showCompletionDialog.value = false
}

// Prevent page refresh during quiz
if (process.client) {
  window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    if (attempt.value?.status === 'in_progress') {
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave? Your progress will be lost.'
    }
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <div class="flex justify-between items-start">
          <!-- Title -->
          <div class="flex-1 pr-4">
            <h1 class="text-2xl font-bold text-green-700 mb-3">
              {{ quiz?.title || 'Loading...' }}
            </h1>
            <p class="text-gray-700 text-sm leading-relaxed mb-4">
              {{ quiz?.description }}
              <span class="ml-1">🍀</span>
            </p>
            
            <!-- Progress Bar -->
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-600 font-medium">
                {{ answeredCount }}/{{ quiz?.total_questions }} answered
              </div>
              <div class="flex-1 bg-green-100 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Timer -->
          <div v-if="timeRemaining !== null" class="text-green-700 font-bold text-2xl">
            {{ formatTime(timeRemaining) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading quiz...</p>
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

      <!-- Quiz Content -->
      <div v-else-if="quiz && currentQuestion" class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <!-- Question Number Header -->
        <div class="bg-green-100 px-6 py-4">
          <div class="text-lg font-bold text-green-700">
            Question {{ currentQuestionIndex + 1 }}/{{ quiz.total_questions }}
          </div>
        </div>

        <!-- Question Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Side - Question -->
            <div>
              <div class="text-green-800 mb-6 font-medium text-xl">
                {{ currentQuestion.prompt }}
              </div>
              <p class="text-sm text-gray-500">
                {{ currentQuestion.question_type === 'multiple_choice' ? 'Select one answer.' : 'Type your answer below.' }}
              </p>
            </div>

            <!-- Right Side - Options/Answer -->
            <div>
              <!-- Multiple Choice Options -->
              <div v-if="currentQuestion.question_type === 'multiple_choice'" class="space-y-3">
                <div
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200"
                  :class="{
                    'bg-green-100 border-green-300': answers[currentQuestion.id] === option.id,
                    'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50': answers[currentQuestion.id] !== option.id
                  }"
                  @click="selectAnswer(currentQuestion.id, option.id)"
                >
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm"
                    :class="{
                      'bg-blue-200': option.label === 'A',
                      'bg-orange-200': option.label === 'B', 
                      'bg-red-200': option.label === 'C',
                      'bg-yellow-200': option.label === 'D'
                    }"
                  >
                    {{ option.label }}
                  </div>
                  <span class="text-gray-800">{{ option.text }}</span>
                </div>
              </div>

              <!-- Text Input -->
              <div v-else>
                <textarea
                  :value="answers[currentQuestion.id] || ''"
                  @input="setTextAnswer(currentQuestion.id, ($event.target as HTMLTextAreaElement).value)"
                  placeholder="Type your answer here..."
                  class="w-full p-4 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
                  rows="6"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-end gap-3 mt-8">
            <button
              v-if="!isFirstQuestion"
              @click="previousQuestion"
              class="px-6 py-2 border border-green-500 text-green-700 rounded-full hover:bg-green-50 transition-colors"
            >
              Previous
            </button>
            
            <button
              v-if="!isLastQuestion"
              @click="nextQuestion"
              class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Next
            </button>
            
            <button
              v-if="isLastQuestion"
              @click="submitQuiz"
              :disabled="!canSubmit || submitting"
              class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting">Submitting...</span>
              <span v-else>Submit Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Warning Note -->
    <div class="max-w-6xl mx-auto px-6 pb-8">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <Icon name="tabler:alert-triangle" class="text-yellow-600 text-lg" />
          <p class="text-yellow-800 text-sm">
            <strong>Note:</strong> If you change browsers or clear your browser data, your selected answers will be lost.
          </p>
        </div>
      </div>
    </div>

    <!-- Completion Dialog -->
    <QuizCompletionDialog
      :visible="showCompletionDialog"
      :quiz-title="quiz?.title"
      @view-answers="handleViewAnswers"
      @go-home="handleGoHome"
      @close="handleCloseDialog"
    />
  </div>
</template>
