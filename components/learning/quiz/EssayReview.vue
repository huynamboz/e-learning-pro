<script setup lang="ts">
import type { StudentAnswer, QuizQuestion, QuestionComment } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'

interface Props {
  answer: StudentAnswer
  questionNumber: number
  question?: QuizQuestion
  quizId?: string
}

const props = defineProps<Props>()

// API composable
const { getQuestionComments } = useQuizApi()

// State
const comments = ref<QuestionComment[]>([])
const loadingComments = ref(false)

// Methods
const loadComments = async () => {
  if (!props.quizId || !props.question?.id) return

  try {
    loadingComments.value = true
    const response = await getQuestionComments(props.quizId, props.question.id)
    comments.value = response.results
  } catch (err: any) {
    console.error('Error loading comments:', err)
  } finally {
    loadingComments.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  if (props.quizId && props.question?.id) {
    loadComments()
  }
})

// Check if essay has been graded
const isGraded = computed(() => {
  return props.answer.essay_grading_status === 'graded'
})

// Get grading status text
const gradingStatus = computed(() => {
  switch (props.answer.essay_grading_status) {
    case 'pending':
      return 'Đang chờ chấm'
    case 'graded':
      return 'Đã chấm'
    default:
      return 'Chưa xác định'
  }
})

// Get score display
const scoreDisplay = computed(() => {
  if (!isGraded.value) {
    return 'Chưa chấm'
  }
  return props.answer.essay_score ? `${props.answer.essay_score} điểm` : 'Đã chấm'
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <!-- Question Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Question {{ questionNumber }}
          </span>
          <span class="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Essay Question
          </span>
          <span 
            :class="isGraded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            class="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {{ gradingStatus }}
          </span>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">
          {{ question?.prompt || 'Essay Question' }}
        </h3>
      </div>
    </div>

    <!-- Student's Answer -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Câu trả lời của bạn:</h4>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p class="text-gray-800 whitespace-pre-wrap">{{ answer.text_answer || 'Chưa có câu trả lời' }}</p>
      </div>
    </div>

    <!-- Grading Status -->
    <div v-if="!isGraded" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="tabler:clock" class="text-yellow-600" />
        <div>
          <h4 class="text-yellow-800 font-medium text-sm">Đang chờ chấm điểm</h4>
          <p class="text-yellow-700 text-sm">Giáo viên đang xem xét bài làm của bạn. Bạn sẽ nhận được điểm và nhận xét khi hoàn thành chấm bài.</p>
        </div>
      </div>
    </div>

    <!-- Graded Results (when available) -->
    <div v-else class="space-y-4">
      <!-- Score -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <Icon name="solar:check-circle-bold-duotone" class="text-green-600" />
          <h4 class="text-green-800 font-medium text-sm">Đã chấm điểm</h4>
        </div>
        <p class="text-green-700 text-sm mt-1">Bài làm của bạn đã được chấm điểm: <span class="font-semibold">{{ scoreDisplay }}</span></p>
      </div>

      <!-- Teacher Feedback (if available) -->
      <div v-if="answer.essay_feedback" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-blue-800 font-medium text-sm mb-2">Nhận xét của giáo viên:</h4>
        <p class="text-blue-700 text-sm whitespace-pre-wrap">{{ answer.essay_feedback }}</p>
      </div>

      <!-- Corrected Answer (if available) -->
      <div v-if="answer.essay_corrected_answer" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 class="text-gray-800 font-medium text-sm mb-2">Phiên bản đã sửa:</h4>
        <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ answer.essay_corrected_answer }}</p>
      </div>

      <!-- Teacher Comments -->
      <div v-if="comments.length > 0" class="mt-6 pt-4 border-t border-gray-200">
        <h5 class="text-sm font-medium text-gray-700 mb-3">Nhận xét của giáo viên</h5>
        <div class="space-y-3">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-blue-50 border border-blue-200 p-3 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ comment.author_name }}</span>
                <span class="text-xs text-blue-600 font-medium">Giáo viên</span>
              </div>
              <span class="text-xs text-gray-500">
                {{ formatDate(comment.created_at) }}
              </span>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
