<script setup lang="ts">
import type { QuizAttempt, QuizResults } from '~/types/new-quiz.type'

interface Props {
  results: QuizResults
  attempt: QuizAttempt
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()

function goToQuizList() {
  router.push('/quizz')
}

function viewDetails() {
  // Navigate to detailed results page if exists
  router.push(`/quizz/${route.params.id}/results?attempt=${props.attempt.id}`)
}

// Helper to format score (handles both string and number)
function formatScore(score: number | string | null | undefined): string {
  if (score === null || score === undefined)
    return '0'
  const numScore = typeof score === 'string' ? Number.parseFloat(score) : score
  if (Number.isNaN(numScore))
    return '0'
  return numScore.toFixed(1)
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-2xl p-8">
    <div class="text-center space-y-6">
      <!-- Success Icon -->
      <div class="flex justify-center">
        <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <Icon name="mdi:check-circle" class="text-5xl text-emerald-600" />
        </div>
      </div>

      <!-- Results Summary -->
      <div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">
          Hoàn thành bài quiz!
        </h2>
        <p class="text-slate-600">
          {{ attempt.quiz_title }}
        </p>
      </div>

      <!-- Score Display -->
      <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border-2 border-emerald-200">
        <div class="text-5xl font-bold text-emerald-700 mb-2">
          {{ formatScore(results.total_score) }} / {{ formatScore(results.max_score) }}
        </div>
        <div class="mt-4 text-sm text-emerald-700">
          {{ results.correct_answers }} / {{ results.total_questions }} câu đúng
        </div>
      </div>

      <!-- Pending Essays Notice -->
      <div
        v-if="results.has_pending_essays"
        class="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
      >
        <div class="flex items-start gap-3">
          <Icon name="mdi:information" class="text-yellow-600 shrink-0 mt-0.5" />
          <div class="text-left">
            <p class="text-sm font-medium text-yellow-900">
              Có câu hỏi tự luận đang chờ chấm điểm
            </p>
            <p class="text-xs text-yellow-700 mt-1">
              Điểm số hiện tại chỉ tính các câu đã được tự động chấm. Điểm cuối cùng sẽ được cập nhật sau khi giáo viên chấm xong các câu tự luận.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button
          class="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
          @click="viewDetails"
        >
          Xem chi tiết
        </button>
        <button
          class="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          @click="goToQuizList"
        >
          Về danh sách quiz
        </button>
      </div>
    </div>
  </div>
</template>

