<script setup lang="ts">
interface Props {
  visible: boolean
  quizId: string
  quizTitle?: string
  attempts?: any[]
}

interface Emits {
  (e: 'close'): void
  (e: 'selectAttempt', attemptId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const completedAttempts = computed(() => {
  return props.attempts || []
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Check if attempt has pending essays
function hasPendingEssays(attempt: any) {
  if (!attempt.answers)
    return false
  return attempt.answers.some((answer: any) =>
    (answer.question_type as string) === 'essay' && !answer.essay_score,
  )
}

// Get score color based on actual score
function getScoreColorByPoints(totalScore: number, maxScore: number, isPending: boolean) {
  if (isPending)
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  if (maxScore === 0)
    return 'bg-gradient-to-r from-gray-500 to-gray-600'

  const percentage = (totalScore / maxScore) * 100
  if (percentage >= 80)
    return 'bg-gradient-to-r from-green-500 to-green-600'
  if (percentage >= 60)
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
  return 'bg-gradient-to-r from-red-500 to-red-600'
}

// No need to load attempts since they're passed as props

// Computed property for modal visibility
const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})

// Event handlers
function handleSelectAttempt(attemptId: string) {
  emit('selectAttempt', attemptId)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <a-modal
    v-model:open="modalVisible"
    :footer="null"
    width="70vw"
    class="quiz-attempts-modal"
    @cancel="handleClose"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Icon name="tabler:clipboard-list" class="text-green-600 text-xl" />
        </div>
        <div>
          <div class="text-xl font-bold text-green-700">
            Quiz Attempts
          </div>
          <div class="text-sm text-gray-600 font-normal">
            {{ quizTitle }}
          </div>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <a-spin size="large" />
        <p class="text-sm text-gray-500 mt-4">
          Loading attempts...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <a-alert
      v-else-if="error"
      type="error"
      :message="error"
      show-icon
      class="mb-4"
    />

    <!-- Empty State -->
    <a-empty
      v-else-if="completedAttempts.length === 0"
      description="No completed attempts found"
    >
      <template #image>
        <Icon name="tabler:clipboard-list" class="text-4xl text-gray-400" />
      </template>
      <p class="text-sm text-gray-400">
        Complete the quiz to see your results here.
      </p>
    </a-empty>

    <!-- Attempts List -->
    <div v-else class="px-4 max-h-[60vh] pt-10 overflow-y-auto">
      <div class="space-y-4">
        <div
          v-for="(attempt, index) in completedAttempts"
          :key="attempt.id"
          class="group relative bg-gradient-to-r from-white to-green-50 border border-gray-200 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
          @click="handleSelectAttempt(attempt.id)"
        >
          <!-- Attempt Number Badge -->
          <div class="absolute -top-2 -left-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
            {{ index + 1 }}
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="tabler:trophy" class="text-green-600 text-xl" />
              </div>
              <div>
                <div class="font-semibold text-gray-800 text-lg">
                  Attempt {{ index + 1 }}
                </div>
                <div class="text-sm text-gray-500 flex items-center gap-1">
                  <Icon name="tabler:calendar" class="text-xs" />
                  {{ formatDate(attempt.completed_at!) }}
                </div>
              </div>
            </div>

            <!-- Score Badge -->
            <div
              class="px-2 py-1 rounded-full text-white font-medium text-xs shadow-sm"
              :class="getScoreColorByPoints(attempt.total_score, attempt.max_score, hasPendingEssays(attempt))"
            >
              <span v-if="hasPendingEssays(attempt)">Đang chờ chấm</span>
              <span v-else>{{ attempt.total_score }}/{{ attempt.max_score }}</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Correct Answers -->
            <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="tabler:check" class="text-blue-600" />
              </div>
              <div class="text-xs text-gray-500 mb-1">
                Correct
              </div>
              <div class="font-bold text-gray-800">
                {{ attempt.correct_answers }}/{{ attempt.total_questions }}
              </div>
            </div>

            <!-- Time Spent -->
            <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="tabler:clock" class="text-purple-600" />
              </div>
              <div class="text-xs text-gray-500 mb-1">
                Time
              </div>
              <div class="font-bold text-gray-800">
                {{ formatTime(attempt.time_spent_seconds) }}
              </div>
            </div>

            <!-- Points -->
            <div class="text-center p-3 bg-white rounded-xl border border-gray-100">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon name="tabler:star" class="text-orange-600" />
              </div>
              <div class="text-xs text-gray-500 mb-1">
                Score
              </div>
              <div class="font-bold text-gray-800">
                {{ attempt.total_score }}/{{ attempt.max_score }}
              </div>
            </div>
          </div>

          <!-- Hover Arrow -->
          <div class="absolute top-1/2 -right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg">
              <Icon name="tabler:arrow-right" class="text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.quiz-attempts-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.quiz-attempts-modal :deep(.ant-modal-header) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-bottom: 1px solid #bbf7d0;
  padding: 20px 24px;
}

.quiz-attempts-modal :deep(.ant-modal-body) {
  padding: 24px;
  background: #fafafa;
}

.quiz-attempts-modal :deep(.ant-modal-close) {
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.quiz-attempts-modal :deep(.ant-modal-close:hover) {
  background: rgba(255, 255, 255, 1);
}
</style>
