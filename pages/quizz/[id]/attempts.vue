<script setup lang="ts">
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'
import type { QuizAttempt } from '~/types/new-quiz.type'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Kết quả làm bài',
  meta: [
    {
      name: 'description',
      content: 'Xem lịch sử làm bài quiz của bạn',
    },
  ],
})

// Route params
const route = useRoute()
const router = useRouter()
const quizId = route.params.id as string
const studentIdFromQuery = route.query.student_id as string | undefined

// API composable
const { getQuizAttempts, getQuiz } = useNewQuizApi()

// State
const quiz = ref<NewQuizDetail | null>(null)
const attempts = ref<QuizAttempt[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const viewingOtherStudent = computed(() => !!studentIdFromQuery)

// Helper functions
function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }
  catch {
    return dateString
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0)
    return `${mins}p ${secs}s`
  return `${secs}s`
}

function formatScore(score: string | number | null | undefined): string {
  if (score === null || score === undefined)
    return '-'
  const numScore = typeof score === 'string' ? Number.parseFloat(score) : score
  if (Number.isNaN(numScore))
    return '-'
  return numScore.toFixed(1)
}

function getStatusBadge(status: string) {
  if (status === 'completed')
    return { label: 'Hoàn thành', class: 'bg-green-100 text-green-700' }
  if (status === 'in_progress')
    return { label: 'Đang làm', class: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Chưa hoàn thành', class: 'bg-gray-100 text-gray-700' }
}

// Load data
async function loadData() {
  try {
    loading.value = true
    error.value = null

    const [quizResponse, attemptsResponse] = await Promise.all([
      getQuiz(quizId),
      getQuizAttempts(quizId, studentIdFromQuery),
    ])

    quiz.value = quizResponse
    attempts.value = attemptsResponse.results.sort((a, b) => {
      const dateA = new Date(a.completed_at || a.started_at).getTime()
      const dateB = new Date(b.completed_at || b.started_at).getTime()
      return dateB - dateA // Most recent first
    })
  }
  catch (err: any) {
    error.value = err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
    console.error('Error loading data:', err)
  }
  finally {
    loading.value = false
  }
}

// Navigation
function navigateToQuizList() {
  router.push('/quizz')
}

function navigateToQuiz() {
  router.push(`/quizz/${quizId}`)
}

function viewResults(attemptId: string) {
  router.push(`/quizz/${quizId}/results?attempt=${attemptId}`)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="px-10 py-10">
    <div class="w-full max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 mb-2">
            {{ viewingOtherStudent ? 'Kết quả làm bài của học sinh' : 'Kết quả làm bài' }}
          </h1>
          <p v-if="quiz" class="text-slate-600">
            {{ quiz.title }}
          </p>
          <p v-if="viewingOtherStudent && attempts.length > 0" class="text-sm text-slate-500 mt-1">
            Học sinh: {{ attempts[0].student_name }}
          </p>
        </div>
        <div class="flex gap-3">
          <button
            class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            @click="navigateToQuizList"
          >
            Về danh sách
          </button>
          <button
            v-if="quiz"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
            @click="navigateToQuiz"
          >
            Làm lại
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white border border-slate-200 rounded-2xl p-8">
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto mb-4" />
            <p class="text-sm text-slate-500">
              Đang tải...
            </p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div class="flex items-center gap-3">
          <Icon name="mdi:alert-circle" class="text-red-500 text-xl" />
          <div>
            <h3 class="text-red-800 font-medium">
              Có lỗi xảy ra
            </h3>
            <p class="text-red-700 text-sm">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Attempts List -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="attempts.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Icon name="mdi:clipboard-text-off-outline" class="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-slate-900 mb-2">
            Chưa có kết quả
          </h3>
          <p class="text-sm text-slate-500 mb-6">
            Bạn chưa làm bài quiz này.
          </p>
          <button
            v-if="quiz"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
            @click="navigateToQuiz"
          >
            Bắt đầu làm bài
          </button>
        </div>

        <!-- Attempts List -->
        <div v-else class="space-y-4">
          <div
            v-for="attempt in attempts"
            :key="attempt.id"
            class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <!-- Attempt Info -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusBadge(attempt.status).class"
                  >
                    {{ getStatusBadge(attempt.status).label }}
                  </span>
                  <span class="text-xs text-slate-500">
                    Bắt đầu: {{ formatDate(attempt.started_at) }}
                  </span>
                  <span v-if="attempt.completed_at" class="text-xs text-slate-500">
                    · Hoàn thành: {{ formatDate(attempt.completed_at) }}
                  </span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 mb-1">
                      Điểm số
                    </p>
                    <p class="text-lg font-bold text-slate-900">
                      {{ formatScore(attempt.total_score) }} / {{ formatScore(attempt.max_score) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 mb-1">
                      Câu đúng
                    </p>
                    <p class="text-lg font-bold text-slate-900">
                      {{ attempt.correct_answers }} / {{ attempt.total_questions }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 mb-1">
                      Thời gian
                    </p>
                    <p class="text-lg font-bold text-slate-900">
                      {{ formatTime(attempt.time_spent_seconds || 0) }}
                    </p>
                  </div>
                  <div v-if="attempt.has_pending_essays">
                    <p class="text-xs text-yellow-600 mb-1">
                      ⏳ Đang chờ chấm
                    </p>
                    <p class="text-sm text-yellow-700">
                      Có câu tự luận
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="flex-shrink-0">
                <button
                  v-if="attempt.status === 'completed' || attempt.status === 'expired'"
                  class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium flex items-center gap-2"
                  @click="viewResults(attempt.id)"
                >
                  <Icon name="mdi:eye" class="text-base" />
                  Xem kết quả
                </button>
                <button
                  v-if="attempt.status === 'in_progress'"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium flex items-center gap-2"
                  @click="navigateToQuiz"
                >
                  <Icon name="mdi:play" class="text-base" />
                  Tiếp tục làm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

