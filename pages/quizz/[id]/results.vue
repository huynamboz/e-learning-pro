<script setup lang="ts">
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'
import type { QuizAttempt, SavedAnswer } from '~/types/new-quiz.type'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'auth',
})

// Route params
const route = useRoute()
const router = useRouter()
const quizId = route.params.id as string
const attemptId = route.query.attempt as string

// API composable
const { getAttempt, getQuiz } = useNewQuizApi()

// State
const attempt = ref<QuizAttempt | null>(null)
const quiz = ref<NewQuizDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Check if quiz has essay questions that need manual grading
const hasPendingEssays = computed(() => {
  if (!attempt.value)
    return false
  return attempt.value.has_pending_essays || false
})

// Computed
const totalScore = computed(() => {
  if (!attempt.value)
    return 0
  const score = attempt.value.total_score
  return typeof score === 'string' ? Number.parseFloat(score) || 0 : score || 0
})

const maxScore = computed(() => {
  if (!attempt.value)
    return 0
  const score = attempt.value.max_score
  return typeof score === 'string' ? Number.parseFloat(score) || 0 : score || 0
})

const percentage = computed(() => {
  if (maxScore.value === 0)
    return 0
  return (totalScore.value / maxScore.value) * 100
})

const scoreColor = computed(() => {
  if (hasPendingEssays.value)
    return 'text-yellow-600'
  if (maxScore.value === 0)
    return 'text-gray-600'

  if (percentage.value >= 80)
    return 'text-green-600'
  if (percentage.value >= 60)
    return 'text-yellow-600'
  return 'text-red-600'
})

// Get essay answers for review
const essayAnswers = computed(() => {
  if (!attempt.value?.answers)
    return []
  return attempt.value.answers.filter((answer: SavedAnswer) =>
    answer.question_type === 'essay',
  )
})

// Get multiple choice and text input answers
const objectiveAnswers = computed(() => {
  if (!attempt.value?.answers)
    return []
  return attempt.value.answers.filter((answer: SavedAnswer) =>
    answer.question_type === 'multiple_choice' || answer.question_type === 'text_input',
  )
})

// Get question data for an answer
function getQuestionForAnswer(answer: SavedAnswer) {
  if (!quiz.value?.questions)
    return null
  return quiz.value.questions.find(q => q.id === answer.question)
}

// Navigation methods
function navigateToQuizList() {
  router.push('/quizz')
}

function navigateToRetakeQuiz() {
  router.push(`/quizz/${quizId}`)
}

// Load attempt results
async function loadResults() {
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
      getQuiz(quizId),
    ])

    attempt.value = attemptResponse
    quiz.value = quizResponse
  }
  catch (err: any) {
    error.value = err.message || 'Failed to load results'
    console.error('Error loading results:', err)
  }
  finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
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
        <button
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          @click="navigateToQuizList"
        >
          Back to Quiz List
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4" />
          <p class="text-sm text-gray-500">
            Loading results...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-center gap-3">
          <Icon name="tabler:alert-circle" class="text-red-500 text-xl" />
          <div>
            <h3 class="text-red-800 font-medium">
              Error
            </h3>
            <p class="text-red-700">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Results Content -->
      <div v-else-if="attempt && quiz" class="space-y-6">
        <!-- Congratulations Banner -->
        <div class="bg-green-100 rounded-t-2xl p-6 text-center">
          <div class="text-2xl font-bold text-green-700 mb-2">
            🎉 Congratulations! 🎉
          </div>
          <p class="text-gray-600">
            You've completed the {{ attempt.quiz_title }}
          </p>
        </div>

        <!-- Pending Essay Grading Notice -->
        <div v-if="hasPendingEssays" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div class="flex items-start gap-3">
            <Icon name="tabler:clock" class="text-yellow-600 text-xl mt-0.5" />
            <div>
              <h3 class="text-yellow-800 font-medium mb-1">
                Essay Questions Pending Review
              </h3>
              <p class="text-yellow-700 text-sm">
                Your essay answers are being reviewed by your teacher. Your final score will be updated once grading is complete.
              </p>
            </div>
          </div>
        </div>

        <!-- Score Summary -->
        <div class="bg-white rounded-b-2xl shadow-sm p-6">
          <div :class="objectiveAnswers.length > 0 ? 'grid grid-cols-3 gap-4 text-center' : 'grid grid-cols-2 gap-4 text-center'">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-800">
                {{ attempt.total_questions }}
              </div>
              <div class="text-sm text-gray-600">
                Tổng câu hỏi
              </div>
            </div>
            <div v-if="objectiveAnswers.length > 0" class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-800">
                {{ attempt.correct_answers }}
              </div>
              <div class="text-sm text-gray-600">
                Số câu đúng
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div v-if="hasPendingEssays" class="text-2xl font-bold text-yellow-600">
                Đang chờ chấm
              </div>
              <div v-else class="text-2xl font-bold" :class="scoreColor">
                {{ totalScore.toFixed(1) }}/{{ maxScore.toFixed(1) }}
              </div>
              <div class="text-sm text-gray-600">
                Điểm
              </div>
            </div>
          </div>

          <!-- Essay Questions Info -->
          <div v-if="essayAnswers.length > 0 && hasPendingEssays" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Icon name="tabler:file-text" class="text-purple-500" />
              <span>{{ essayAnswers.length }} essay question{{ essayAnswers.length > 1 ? 's' : '' }} requiring manual grading</span>
            </div>
          </div>
        </div>

        <!-- Question Review -->
        <div class="space-y-4">
          <!-- Multiple Choice Questions -->
          <div
            v-for="(answer, idx) in attempt.answers.filter(a => a.question_type === 'multiple_choice')"
            :key="`mc-${answer.id}`"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- Question Header -->
            <div class="bg-gray-100 px-6 py-4 flex items-center justify-between">
              <div class="text-lg font-bold text-green-700">
                Question {{ idx + 1 }}
              </div>
              <Icon
                :name="answer.is_correct ? 'tabler:check' : 'tabler:x'"
                :class="answer.is_correct ? 'text-green-600' : 'text-red-600'"
                class="text-2xl"
              />
            </div>

            <!-- Question Content -->
            <div class="p-6">
              <!-- Question Prompt -->
              <div class="text-green-800 mb-6 font-medium text-xl">
                {{ answer.question_prompt }}
              </div>

              <!-- Options -->
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="option in getQuestionForAnswer(answer)?.options || []"
                  :key="option.id"
                  class="flex items-center gap-3 p-3 rounded-xl border"
                  :class="{
                    'bg-green-100 border-green-300': option.is_correct,
                    'bg-white border-gray-200': !option.is_correct,
                    '!bg-red-100 border-red-300': answer.selected_option === option.id && !option.is_correct,
                  }"
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0"
                    :class="{
                      'bg-blue-200': option.label === 'A',
                      'bg-orange-200': option.label === 'B',
                      'bg-red-200': option.label === 'C',
                      'bg-yellow-200': option.label === 'D',
                    }"
                  >
                    {{ option.label }}
                  </div>
                  <span class="text-gray-800 flex-1">{{ option.text }}</span>
                  <Icon
                    v-if="option.is_correct"
                    name="tabler:check-circle"
                    class="text-green-600 text-xl shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Text Input Questions -->
          <div
            v-for="answer in attempt.answers.filter(a => a.question_type === 'text_input')"
            :key="`ti-${answer.id}`"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- Question Header -->
            <div class="bg-gray-100 px-6 py-4 flex items-center justify-between">
              <div class="text-lg font-bold text-green-700">
                Question {{ objectiveAnswers.findIndex(a => a.id === answer.id) + 1 }}
              </div>
              <Icon
                :name="answer.is_correct ? 'tabler:check' : 'tabler:x'"
                :class="answer.is_correct ? 'text-green-600' : 'text-red-600'"
                class="text-2xl"
              />
            </div>

            <!-- Question Content -->
            <div class="p-6">
              <!-- Question Prompt -->
              <div class="text-green-800 mb-6 font-medium text-xl">
                {{ answer.question_prompt }}
              </div>

              <!-- User's Answer -->
              <div class="space-y-3">
                <div class="text-sm font-medium text-gray-700">
                  Your answer:
                </div>
                <div
                  class="p-4 rounded-xl border"
                  :class="{
                    'bg-green-100 border-green-300': answer.is_correct,
                    'bg-red-100 border-red-300': !answer.is_correct,
                  }"
                >
                  <span class="text-gray-800">
                    {{ answer.text_answer || 'No answer provided' }}
                  </span>
                </div>

                <!-- Correct Answer (if incorrect) -->
                <div v-if="!answer.is_correct && answer.correct_answer" class="space-y-2">
                  <div class="text-sm font-medium text-gray-700">
                    Correct answer:
                  </div>
                  <div class="p-4 bg-green-100 border border-green-300 rounded-xl">
                    <span class="text-gray-800">
                      {{ answer.correct_answer.text }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Essay Questions -->
          <div
            v-for="answer in essayAnswers"
            :key="`essay-${answer.id}`"
            class="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <!-- Question Header -->
            <div class="bg-green-100 px-6 py-4 flex items-center justify-between">
              <div class="text-lg font-bold text-green-700">
                Question {{ attempt.answers.findIndex(a => a.id === answer.id) + 1 }}
              </div>
              <Icon
                name="tabler:clock"
                class="text-yellow-600 text-xl"
              />
            </div>

            <!-- Question Content -->
            <div class="p-6">
              <!-- Question Prompt -->
              <div class="text-green-800 mb-6 font-medium text-xl">
                {{ answer.question_prompt }}
              </div>

              <!-- User's Answer -->
              <div class="space-y-3">
                <div class="text-sm font-medium text-gray-700">
                  Your answer:
                </div>
                <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span class="text-gray-800 whitespace-pre-wrap">
                    {{ answer.text_answer || 'No answer provided' }}
                  </span>
                </div>

                <!-- Pending Grading Notice -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div class="flex items-center gap-2 text-sm text-yellow-800">
                    <Icon name="tabler:clock" class="text-yellow-600" />
                    <span>This answer is pending teacher review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 pt-6">
          <button
            class="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
            @click="navigateToQuizList"
          >
            Go back
          </button>
          <button
            class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            @click="navigateToRetakeQuiz"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
