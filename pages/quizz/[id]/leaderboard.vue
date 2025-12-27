<script setup lang="ts">
import type { LeaderboardEntry, NewQuizDetail } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Bảng xếp hạng',
  meta: [
    {
      name: 'description',
      content: 'Xem bảng xếp hạng của quiz',
    },
  ],
})

// Route params
const route = useRoute()
const router = useRouter()
const quizId = route.params.id as string

// API composable
const { getLeaderboard, getQuiz } = useNewQuizApi()

// State
const quiz = ref<NewQuizDetail | null>(null)
const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Helper functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0)
    return `${mins}p ${secs}s`
  return `${secs}s`
}

function formatScore(score: string | number): string {
  const numScore = typeof score === 'string' ? Number.parseFloat(score) : score
  if (Number.isNaN(numScore))
    return '0.0'
  return numScore.toFixed(1)
}

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

// Load data
async function loadData() {
  try {
    loading.value = true
    error.value = null

    const [quizResponse, leaderboardResponse] = await Promise.all([
      getQuiz(quizId),
      getLeaderboard(quizId),
    ])

    quiz.value = quizResponse
    leaderboard.value = leaderboardResponse.entries
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

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="px-10 py-10">
    <div class="w-full mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900 mb-2">
            Bảng xếp hạng
          </h1>
          <p v-if="quiz" class="text-slate-600">
            {{ quiz.title }}
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
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
            @click="navigateToQuiz"
          >
            Làm quiz
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white border border-slate-200 rounded-2xl p-8">
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700 mx-auto mb-4" />
            <p class="text-sm text-slate-500">
              Đang tải bảng xếp hạng...
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

      <!-- Leaderboard Content -->
      <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <!-- Empty State -->
        <div v-if="leaderboard.length === 0" class="p-12 text-center">
          <Icon name="mdi:trophy-outline" class="text-5xl text-slate-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-slate-900 mb-2">
            Chưa có kết quả
          </h3>
          <p class="text-sm text-slate-500 mb-6">
            Chưa có học sinh nào hoàn thành quiz này.
          </p>
          <button
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
            @click="navigateToQuiz"
          >
            Trở thành người đầu tiên
          </button>
        </div>

        <!-- Leaderboard Table -->
        <div v-else>
          <!-- Table Header -->
          <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-12 gap-4 text-sm font-semibold text-slate-700">
            <div class="col-span-1">
              Hạng
            </div>
            <div class="col-span-3">
              Học sinh
            </div>
            <div class="col-span-2 text-center">
              Điểm
            </div>
            <div class="col-span-2 text-center">
              Câu đúng
            </div>
            <div class="col-span-2 text-center">
              Thời gian
            </div>
            <div class="col-span-1 text-right">
              Hoàn thành
            </div>
            <div class="col-span-1 text-center">
              Thao tác
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-slate-100">
            <div
              v-for="entry in leaderboard"
              :key="entry.student_id"
              class="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors"
              :class="{
                'bg-emerald-50': entry.rank <= 3,
              }"
            >
              <!-- Rank -->
              <div class="col-span-1">
                <div
                  class="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm"
                  :class="{
                    'bg-emerald-600 text-white': entry.rank === 1,
                    'bg-emerald-500 text-white': entry.rank === 2,
                    'bg-emerald-400 text-white': entry.rank === 3,
                    'bg-slate-200 text-slate-700': entry.rank > 3,
                  }"
                >
                  <Icon
                    v-if="entry.rank === 1"
                    name="mdi:trophy"
                    class="text-lg"
                  />
                  <span v-else>{{ entry.rank }}</span>
                </div>
              </div>

              <!-- Student Name -->
              <div class="col-span-3">
                <p class="font-semibold text-slate-900">
                  {{ entry.student_name }}
                </p>
                <p v-if="entry.student_email" class="text-xs text-slate-500">
                  {{ entry.student_email }}
                </p>
              </div>

              <!-- Score -->
              <div class="col-span-2 text-center">
                <p class="font-bold text-slate-900 text-lg">
                  {{ formatScore(entry.score) }}
                </p>
              </div>

              <!-- Correct Answers -->
              <div class="col-span-2 text-center">
                <p class="text-slate-700 font-medium">
                  {{ entry.correct_answers }}
                </p>
              </div>

              <!-- Time Spent -->
              <div class="col-span-2 text-center">
                <p class="text-slate-600 text-sm">
                  {{ formatTime(entry.time_spent_seconds) }}
                </p>
              </div>

              <!-- Completed At -->
              <div class="col-span-1 text-right">
                <p class="text-xs text-slate-500">
                  {{ formatDate(entry.completed_at) }}
                </p>
              </div>

              <!-- Action -->
              <div class="col-span-1 text-center">
                <NuxtLink
                  :to="`/quizz/${quizId}/attempts?student_id=${entry.student_id}`"
                  class="inline-flex whitespace-nowrap items-center justify-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-xs font-medium"
                >
                  <Icon name="mdi:eye" class="text-sm mr-1" />
                  Xem kết quả
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
