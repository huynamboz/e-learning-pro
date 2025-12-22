<script setup lang="ts">
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'
import type { QuizAttempt, StartAttemptResponse } from '~/types/new-quiz.type'
import NewQuizPlayer from '~/components/learning/new-quiz/NewQuizPlayer.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Làm Quiz',
  meta: [
    {
      name: 'description',
      content: 'Làm bài quiz với auto-save và immediate feedback',
    },
  ],
})

const route = useRoute()
const router = useRouter()
const quizId = route.params.id as string
const attemptIdFromQuery = route.query.attempt as string | undefined

const { getQuiz, startAttempt, getAttempt } = useNewQuizApi()

// State
const quiz = ref<NewQuizDetail | null>(null)
const attempt = ref<QuizAttempt | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Load quiz and start/resume attempt
async function loadQuiz() {
  try {
    loading.value = true
    error.value = null
    const quizData = await getQuiz(quizId)
    quiz.value = quizData
  }
  catch (err: any) {
    error.value = err.message || 'Không thể tải thông tin quiz'
    console.error('Error loading quiz:', err)
  }
  finally {
    loading.value = false
  }
}

async function startOrResumeAttempt() {
  if (!quiz.value)
    return

  try {
    loading.value = true
    error.value = null

    // Check if we should resume an existing attempt
    if (attemptIdFromQuery) {
      try {
        const attemptData = await getAttempt(attemptIdFromQuery)
        attempt.value = attemptData
        // Update URL to include attempt ID if not already there
        if (route.query.attempt !== attemptIdFromQuery) {
          router.replace({
            query: { ...route.query, attempt: attemptIdFromQuery },
          })
        }
        return
      }
      catch (resumeError: any) {
        // If resume fails, start new attempt
        console.warn('Failed to resume attempt, starting new:', resumeError)
      }
    }

    // Start new attempt
    const response: StartAttemptResponse = await startAttempt({ quiz_id: quizId })
    attempt.value = response.attempt

    // Update URL with attempt ID
    router.replace({
      query: { ...route.query, attempt: response.attempt.id },
    })
  }
  catch (err: any) {
    error.value = err.message || 'Không thể bắt đầu quiz'
    console.error('Error starting/resuming attempt:', err)

    // Handle specific errors
    if (err.statusCode === 400) {
      if (err.data?.error?.includes('retake') || err.data?.error?.includes('limit')) {
        error.value = 'Bạn đã vượt quá số lần làm lại cho phép'
      }
      else if (err.data?.error?.includes('published')) {
        error.value = 'Quiz này chưa được xuất bản'
      }
    }
  }
  finally {
    loading.value = false
  }
}

// Handle attempt updates from child components
function handleAttemptUpdate(updatedAttempt: QuizAttempt) {
  attempt.value = updatedAttempt
}

// Prevent accidental navigation during quiz
if (process.client) {
  window.addEventListener('beforeunload', (e) => {
    if (attempt.value && attempt.value.status === 'in_progress') {
      e.preventDefault()
      e.returnValue = 'Bạn có chắc muốn rời khỏi trang? Tiến độ của bạn đã được lưu tự động.'
      return e.returnValue
    }
  })
}

onMounted(async () => {
  await loadQuiz()
  if (quiz.value) {
    await startOrResumeAttempt()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('beforeunload', () => {})
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <!-- Loading State -->
        <div v-if="loading || !quiz || !attempt" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p class="text-gray-600">
              Loading quiz...
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
              <button
                class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                @click="startOrResumeAttempt"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>

        <!-- Quiz Header Content -->
        <div v-else-if="quiz && attempt">
          <NewQuizPlayer
            :quiz="quiz"
            :attempt="attempt"
            @attempt-updated="handleAttemptUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>
