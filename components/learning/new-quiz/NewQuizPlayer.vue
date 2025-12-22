<script setup lang="ts">
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'
import type { QuizAttempt, SaveAnswerResponse, SubmitAttemptResponse } from '~/types/new-quiz.type'
import { notification } from 'ant-design-vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
import { useConfetti } from '~/composables/useConfetti'
import NewQuizProgress from './NewQuizProgress.vue'
import NewQuizQuestion from './NewQuizQuestion.vue'
import NewQuizResults from './NewQuizResults.vue'

const props = defineProps<Props>()
const emit = defineEmits<{
  attemptUpdated: [attempt: QuizAttempt]
}>()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

interface Props {
  quiz: NewQuizDetail
  attempt: QuizAttempt
}

const { saveAnswer, submitAttempt } = useNewQuizApi()
const { triggerCorrectAnswer, playWrongSound } = useConfetti()
// State
const currentAttempt = ref<QuizAttempt>(props.attempt)
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, any>>({})
const saving = ref<Record<string, boolean>>({})
const saveErrors = ref<Record<string, string>>({})
const submitting = ref(false)
const showResults = ref(false)
const results = ref<SubmitAttemptResponse | null>(null)
const timeRemaining = ref<number | null>(null)
let timerInterval: NodeJS.Timeout | null = null

// Timer functions
function startTimer() {
  if (timerInterval)
    clearInterval(timerInterval)

  if (timeRemaining.value && timeRemaining.value > 0) {
    timerInterval = setInterval(() => {
      if (timeRemaining.value && timeRemaining.value > 0) {
        timeRemaining.value--
        // Update currentAttempt to keep in sync
        if (currentAttempt.value) {
          currentAttempt.value.time_remaining_seconds = timeRemaining.value
        }
      }
      else {
        stopTimer()
        handleTimeExpired()
      }
    }, 1000)
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Watch for attempt changes (e.g., on resume)
watch(() => props.attempt, (newAttempt) => {
  if (newAttempt) {
    currentAttempt.value = newAttempt
    restoreAnswers()

    // Initialize timer
    if (props.quiz.time_type === 'limit' && newAttempt.time_remaining_seconds) {
      timeRemaining.value = newAttempt.time_remaining_seconds
      startTimer()
    }

    // Optionally restore to last answered question
    if (newAttempt.answers.length > 0) {
      const lastAnsweredQuestionId = newAttempt.answers[newAttempt.answers.length - 1].question
      const lastQuestionIndex = props.quiz.questions?.findIndex(q => q.id === lastAnsweredQuestionId) ?? -1
      if (lastQuestionIndex >= 0) {
        currentQuestionIndex.value = lastQuestionIndex
      }
    }
  }
}, { immediate: true })

// Initialize answers from attempt
onMounted(() => {
  restoreAnswers()
  // Initialize timer if quiz has time limit
  if (props.quiz.time_type === 'limit' && props.attempt.time_remaining_seconds) {
    timeRemaining.value = props.attempt.time_remaining_seconds
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})

function restoreAnswers() {
  currentAttempt.value.answers.forEach((answer) => {
    if (answer.question_type === 'multiple_choice') {
      answers.value[answer.question] = answer.selected_option
    }
    else {
      answers.value[answer.question] = answer.text_answer || ''
    }
  })
}

// Computed
const currentQuestion = computed(() => {
  if (!props.quiz.questions || props.quiz.questions.length === 0)
    return null
  return props.quiz.questions[currentQuestionIndex.value]
})

const progress = computed(() => {
  if (!props.quiz.questions)
    return 0
  const answeredCount = Object.keys(answers.value).filter(key => answers.value[key] !== null && answers.value[key] !== '').length
  return (answeredCount / props.quiz.questions.length) * 100
})

const answeredCount = computed(() => {
  return Object.keys(answers.value).filter(key => answers.value[key] !== null && answers.value[key] !== '').length
})

const allQuestionsAnswered = computed(() => {
  if (!props.quiz.questions)
    return false
  return answeredCount.value >= props.quiz.questions.length
})

const isLastQuestion = computed(() => {
  if (!props.quiz.questions)
    return false
  return currentQuestionIndex.value === props.quiz.questions.length - 1
})

const isFirstQuestion = computed(() => {
  return currentQuestionIndex.value === 0
})

// Check if quiz has essay questions
const hasEssayQuestions = computed(() => {
  if (!props.quiz.questions)
    return false
  return props.quiz.questions.some(q => q.question_type === 'essay')
})

// Watch for all questions answered to auto-submit (only if no essay questions)
watch([answeredCount, allQuestionsAnswered], ([_count, allAnswered]) => {
  // Only auto-submit if there are no essay questions
  if (
    allAnswered
    && !hasEssayQuestions.value
    && !submitting.value
    && !showResults.value
    && currentAttempt.value
    && currentAttempt.value.status === 'in_progress'
  ) {
    // Small delay to ensure UI updates
    setTimeout(() => {
      handleSubmit()
    }, 1000)
  }
})

// Navigation
function nextQuestion() {
  if (!isLastQuestion.value && props.quiz.questions) {
    currentQuestionIndex.value++
  }
}

function previousQuestion() {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

function goToQuestion(index: number) {
  if (props.quiz.questions && index >= 0 && index < props.quiz.questions.length) {
    currentQuestionIndex.value = index
  }
}

// Answer handling
async function handleAnswerSave(questionId: string, answerData: any) {
  if (!currentAttempt.value)
    return

  saving.value[questionId] = true
  delete saveErrors.value[questionId]

  try {
    const response: SaveAnswerResponse = await saveAnswer(currentAttempt.value.id, {
      question_id: questionId,
      ...answerData,
    })

    // Update local answer state
    if (answerData.selected_option_id) {
      answers.value[questionId] = answerData.selected_option_id
    }
    else if (answerData.text_answer !== undefined) {
      answers.value[questionId] = answerData.text_answer
    }

    // Update attempt with new answer
    const answerIndex = currentAttempt.value.answers.findIndex(a => a.question === questionId)
    const previousAnswer = answerIndex >= 0 ? currentAttempt.value.answers[answerIndex] : null
    const currentQuestion = props.quiz.questions?.find(q => q.id === questionId)
    const questionScore = currentQuestion?.score || 0
    const isEssayQuestion = currentQuestion?.question_type === 'essay'

    if (answerIndex >= 0) {
      currentAttempt.value.answers[answerIndex] = response.answer
    }
    else {
      currentAttempt.value.answers.push(response.answer)
    }

    // Helper to convert score to number
    const getNumericScore = (score: number | string | null | undefined): number => {
      if (score === null || score === undefined)
        return 0
      return typeof score === 'string' ? Number.parseFloat(score) || 0 : score
    }

    // Update attempt scores accurately
    const currentTotalScore = getNumericScore(currentAttempt.value.total_score)

    // If this is a new answer
    if (!previousAnswer) {
      if (response.is_correct) {
        currentAttempt.value.total_score = currentTotalScore + questionScore
        currentAttempt.value.correct_answers = (currentAttempt.value.correct_answers || 0) + 1
        // Trigger confetti and sound for correct answer
        triggerCorrectAnswer()
      }
      else {
        // Play wrong sound for incorrect answer (not for essay questions)
        if (!isEssayQuestion) {
          playWrongSound()
        }
      }
    }
    // If answer changed
    else {
      const wasCorrect = previousAnswer.is_correct === true
      const isNowCorrect = response.is_correct === true

      if (wasCorrect && !isNowCorrect) {
        // Changed from correct to incorrect
        currentAttempt.value.total_score = Math.max(0, currentTotalScore - questionScore)
        currentAttempt.value.correct_answers = Math.max(0, (currentAttempt.value.correct_answers || 0) - 1)
        // Play wrong sound (not for essay questions)
        if (!isEssayQuestion) {
          playWrongSound()
        }
      }
      else if (!wasCorrect && isNowCorrect) {
        // Changed from incorrect to correct
        currentAttempt.value.total_score = currentTotalScore + questionScore
        currentAttempt.value.correct_answers = (currentAttempt.value.correct_answers || 0) + 1
        // Trigger confetti and sound for correct answer
        triggerCorrectAnswer()
      }
      // If both correct or both incorrect, no change needed
    }

    emit('attemptUpdated', currentAttempt.value)
  }
  catch (err: any) {
    console.error('Error saving answer:', err)
    saveErrors.value[questionId] = err.message || t('newQuiz.player.saveError')

    // Retry logic (exponential backoff)
    let retries = 0
    const maxRetries = 3
    while (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2 ** retries * 1000))
      try {
        const retryResponse = await saveAnswer(currentAttempt.value.id, {
          question_id: questionId,
          ...answerData,
        })
        delete saveErrors.value[questionId]
        // Update state same as above
        if (answerData.selected_option_id) {
          answers.value[questionId] = answerData.selected_option_id
        }
        else if (answerData.text_answer !== undefined) {
          answers.value[questionId] = answerData.text_answer
        }
        const answerIndex = currentAttempt.value.answers.findIndex(a => a.question === questionId)
        if (answerIndex >= 0) {
          currentAttempt.value.answers[answerIndex] = retryResponse.answer
        }
        else {
          currentAttempt.value.answers.push(retryResponse.answer)
        }
        emit('attemptUpdated', currentAttempt.value)
      }
      catch {
        retries++
      }
    }
  }
  finally {
    saving.value[questionId] = false
  }
}

// Submit quiz
async function handleSubmit() {
  if (!currentAttempt.value || submitting.value)
    return

  submitting.value = true

  try {
    const response: SubmitAttemptResponse = await submitAttempt(currentAttempt.value.id)
    currentAttempt.value = response.attempt
    results.value = response
    showResults.value = true
    emit('attemptUpdated', currentAttempt.value)

    // Navigate to results page - replace current URL
    const quizId = route.params.id as string
    await router.replace({
      path: `/quizz/${quizId}/results`,
      query: { attempt: currentAttempt.value.id },
    })
  }
  catch (err: any) {
    console.error('Error submitting quiz:', err)
    notification.error({
      message: t('newQuiz.player.submitError'),
      description: err.message || t('newQuiz.player.submitErrorDescription'),
      duration: 4,
    })
  }
  finally {
    submitting.value = false
  }
}

// Timer expired handler
function handleTimeExpired() {
  handleSubmit()
}

// Question status helpers
function getQuestionStatus(questionId: string) {
  const savedAnswer = currentAttempt.value.answers.find(a => a.question === questionId)
  if (!savedAnswer)
    return 'unanswered'
  if (savedAnswer.question_type === 'essay')
    return 'pending'
  return savedAnswer.is_correct ? 'correct' : 'incorrect'
}

// Helper to format time (MM:SS)
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-start">
      <!-- Title -->
      <div class="flex-1 pr-4">
        <div class="flex items-center gap-2 justify-between">
          <h1 class="text-2xl font-bold text-green-700 mb-3">
            {{ quiz.title || t('newQuiz.player.loading') }}
          </h1>
          <!-- Timer -->
          <div v-if="quiz.time_type === 'limit' && timeRemaining !== null" class="text-green-700 font-bold text-2xl">
            {{ formatTime(timeRemaining) }}
          </div>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed mb-4">
          {{ quiz.description || t('newQuiz.player.defaultDescription') }}
          <span class="ml-1">🍀</span>
        </p>

        <!-- Progress Bar -->
        <div class="flex items-center gap-3 mb-4">
          <div class="text-sm text-gray-600 font-medium">
            {{ answeredCount }}/{{ quiz.total_questions }} {{ t('newQuiz.player.answered') }}
          </div>
          <div class="flex-1 bg-green-100 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Question List -->
        <NewQuizProgress
          :total-questions="quiz.total_questions"
          :answered-count="answeredCount"
          :progress="progress"
          :questions="quiz.questions"
          :get-question-status="getQuestionStatus"
          :current-question-index="currentQuestionIndex"
          @go-to-question="goToQuestion"
        />

        <!-- Submit Button (only show if quiz has essay questions) -->
        <div v-if="hasEssayQuestions && allQuestionsAnswered && !showResults" class="max-w-6xl mx-auto px-6 py-4">
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-900 mb-1">
                  {{ t('newQuiz.player.allAnswered') }}
                </p>
                <p class="text-xs text-slate-600">
                  {{ t('newQuiz.player.submitWarning') }}
                </p>
              </div>
              <button
                :disabled="submitting"
                class="cursor-pointer px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                @click="handleSubmit"
              >
                <Icon v-if="submitting" name="mdi:loading" class="animate-spin text-base" />
                <Icon v-else name="mdi:send" class="text-base" />
                {{ submitting ? t('newQuiz.player.submitting') : t('newQuiz.player.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto py-8">
      <!-- Results (shown after submit) -->
      <NewQuizResults
        v-if="showResults && results"
        :results="results.results"
        :attempt="currentAttempt"
      />

      <!-- Quiz Content -->
      <div v-else-if="currentQuestion !== null" class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <!-- Question Number Header -->
        <div class="bg-green-100 px-6 py-4">
          <div class="text-lg font-bold text-green-700">
            {{ t('newQuiz.player.question') }} {{ currentQuestionIndex + 1 }}/{{ quiz.total_questions }}
          </div>
        </div>

        <!-- Question Content -->
        <div class="p-6">
          <NewQuizQuestion
            v-if="currentQuestion"
            :question="currentQuestion"
            :question-index="currentQuestionIndex"
            :total-questions="quiz.total_questions"
            :saved-answer="currentAttempt.answers.find(a => a.question === currentQuestion?.id)"
            :saving="saving[currentQuestion.id]"
            :save-error="saveErrors[currentQuestion.id]"
            @answer-saved="handleAnswerSave"
          />

          <!-- Navigation Buttons -->
          <div class="flex justify-end gap-3 mt-8">
            <button
              v-if="!isFirstQuestion"
              class="cursor-pointer !flex items-center gap-1 px-6 py-2 border border-green-500 text-green-700 rounded-full hover:bg-green-50 transition-colors"
              @click="previousQuestion"
            >
              <Icon name="solar:arrow-left-bold" class="text-green-700 text-lg" />
              {{ t('newQuiz.player.previous') }}
            </button>

            <button
              v-if="!isLastQuestion"
              class="cursor-pointer !flex items-center gap-1 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              @click="nextQuestion"
            >
              {{ t('newQuiz.player.next') }}
              <Icon name="solar:arrow-right-bold" class="text-white text-lg" />
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
            <strong>{{ t('newQuiz.player.note') }}</strong> {{ t('newQuiz.player.autoSaveNote') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
