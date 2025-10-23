<script setup lang="ts">
import type { QuizAttempt, StudentAnswer } from '~/composables/api/useQuizApi'
import EssayReview from '~/components/learning/quiz/EssayReview.vue'
import MultipleChoiceReview from '~/components/learning/quiz/MultipleChoiceReview.vue'
import TextInputReview from '~/components/learning/quiz/TextInputReview.vue'
import { useQuizApi } from '~/composables/api/useQuizApi'

definePageMeta({
  layout: 'auth',
})

// Route params
const route = useRoute()
const quizId = route.params.id as string
const attemptId = route.query.attempt as string
const courseId = route.query.course as string

// Get courseId and lessonId from localStorage for navigation back
const savedCourseId = ref<string | null>(null)
const savedLessonId = ref<string | null>(null)

// API composable
const { getAttempt, getQuiz } = useQuizApi()

// State
const attempt = ref<QuizAttempt | null>(null)
const quiz = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Check if quiz has essay questions that need manual grading
const hasPendingEssays = computed(() => {
  if (!attempt.value?.answers)
    return false
  return attempt.value.answers.some((answer: StudentAnswer) =>
    (answer.question_type as string) === 'essay' && !answer.essay_score,
  )
})

// Computed
const totalScore = computed(() => {
  if (!attempt.value)
    return 0
  return attempt.value.total_score || 0
})

const maxScore = computed(() => {
  if (!attempt.value)
    return 0
  return attempt.value.max_score || 0
})

const scoreColor = computed(() => {
  if (hasPendingEssays.value)
    return 'text-yellow-600'
  if (maxScore.value === 0)
    return 'text-gray-600'

  const percentage = (totalScore.value / maxScore.value) * 100
  if (percentage >= 80)
    return 'text-green-600'
  if (percentage >= 60)
    return 'text-yellow-600'
  return 'text-red-600'
})

// Get essay answers for review
const essayAnswers = computed(() => {
  if (!attempt.value?.answers)
    return []
  return attempt.value.answers.filter((answer: StudentAnswer) =>
    (answer.question_type as string) === 'essay',
  )
})

// Get multiple choice and text input answers
const objectiveAnswers = computed(() => {
  if (!attempt.value?.answers)
    return []
  return attempt.value.answers.filter((answer: StudentAnswer) =>
    (answer.question_type as string) === 'multiple_choice' || (answer.question_type as string) === 'text_input',
  )
})

// Get question data for an answer
function getQuestionForAnswer(answer: StudentAnswer) {
  if (!quiz.value?.questions)
    return null
  return quiz.value.questions.find((q: any) => q.id === answer.question)
}

// Navigation methods
function navigateToBackToLearning() {
  const targetCourseId = savedCourseId.value || courseId
  const targetLessonId = savedLessonId.value

  if (targetCourseId) {
    const url = targetLessonId
      ? `/learning/${targetCourseId}?lesson=${targetLessonId}`
      : `/learning/${targetCourseId}`
    navigateTo(url)
  }
  else {
    navigateTo('/learning')
  }
}

function navigateToRetakeQuiz() {
  const targetCourseId = savedCourseId.value || courseId
  const targetLessonId = savedLessonId.value

  let url = `/learning/quiz/${quizId}`
  const params = new URLSearchParams()

  if (targetCourseId) {
    params.set('course', targetCourseId)
  }
  if (targetLessonId) {
    params.set('lesson', targetLessonId)
  }

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  navigateTo(url)
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
  // Load saved courseId and lessonId from localStorage
  if (process.client) {
    savedCourseId.value = localStorage.getItem('learning_course_id')
    savedLessonId.value = localStorage.getItem('learning_lesson_id')
  }

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
        <a-button type="default" @click="navigateToBackToLearning">
          Back to Learning
        </a-button>
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
                {{ totalScore }}/{{ maxScore }}
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
          <MultipleChoiceReview
            v-for="answer in attempt.answers.filter(a => a.question_type === 'multiple_choice')"
            :key="`mc-${answer.id}`"
            :answer="answer"
            :question-number="attempt.answers.indexOf(answer) + 1"
            :question="getQuestionForAnswer(answer)"
            :quiz-id="quizId"
          />
          <TextInputReview
            v-for="answer in attempt.answers.filter(a => a.question_type === 'text_input')"
            :key="`ti-${answer.id}`"
            :answer="answer"
            :question-number="attempt.answers.indexOf(answer) + 1"
            :question="getQuestionForAnswer(answer)"
            :quiz-id="quizId"
          />
          <EssayReview
            v-for="answer in essayAnswers"
            :key="`essay-${answer.id}`"
            :answer="answer"
            :question-number="attempt.answers.indexOf(answer) + 1"
            :question="getQuestionForAnswer(answer)"
            :quiz-id="quizId"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 pt-6">
          <a-button type="default" @click="navigateToBackToLearning">
            Go back
          </a-button>
          <a-button type="primary" @click="navigateToRetakeQuiz">
            Retake Quiz
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>
