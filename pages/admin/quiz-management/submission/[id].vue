<script setup lang="ts">
import type { QuestionComment, QuizAttempt, StudentAnswer } from '~/composables/api/useQuizApi'
import QuestionCommentComponent from '~/components/admin/quiz/QuestionComment.vue'
import { useQuizApi } from '~/composables/api/useQuizApi'

definePageMeta({
  layout: 'admin',
})

// Route params
const route = useRoute()
const attemptId = route.params.id as string

// API composable
const { getAttempt, getQuiz, getQuestionComments } = useQuizApi()

// State
const attempt = ref<QuizAttempt | null>(null)
const quiz = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Comments state
const questionComments = ref<Record<string, QuestionComment[]>>({})
const loadingComments = ref<Record<string, boolean>>({})

const scoreColor = computed(() => {
  if (!attempt.value)
    return 'text-gray-600'
  const percentage = (attempt.value.total_score / attempt.value.max_score) * 100
  if (percentage >= 80)
    return 'text-green-600'
  if (percentage >= 60)
    return 'text-yellow-600'
  return 'text-red-600'
})

// Methods
async function loadSubmission() {
  try {
    loading.value = true
    error.value = null

    // const [attemptResponse, quizResponse] = await Promise.all([
    //   getAttempt(attemptId),
    //   getQuiz(attempt.value?.quiz || '')
    // ])
    const attemptResponse = await getAttempt(attemptId)
    const quizResponse = await getQuiz(attemptResponse?.quiz || '')

    attempt.value = attemptResponse
    quiz.value = quizResponse
  }
  catch (err: any) {
    error.value = err.message || 'Failed to load submission'
    console.error('Error loading submission:', err)
  }
  finally {
    loading.value = false
  }
}

async function loadQuestionComments(questionId: string) {
  if (!quiz.value?.id)
    return

  try {
    loadingComments.value[questionId] = true
    const response = await getQuestionComments(quiz.value.id, questionId)
    questionComments.value[questionId] = response.results
  }
  catch (err: any) {
    console.error('Error loading comments for question:', questionId, err)
  }
  finally {
    loadingComments.value[questionId] = false
  }
}

function handleCommentRefresh(questionId: string) {
  loadQuestionComments(questionId)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
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

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'in_progress':
      return 'text-blue-600 bg-blue-100'
    case 'expired':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'Hoàn thành'
    case 'in_progress':
      return 'Đang làm'
    case 'expired':
      return 'Hết hạn'
    default:
      return status
  }
}

// Lifecycle
onMounted(() => {
  loadSubmission()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <a-button type="text" @click="navigateTo('/admin/quiz-management')">
          <template #icon>
            <Icon name="tabler:arrow-left" />
          </template>
          Quay lại
        </a-button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Chi tiết bài làm
          </h1>
          <p class="text-gray-600">
            Xem chi tiết bài làm của học sinh
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-600">
          Đang tải thông tin bài làm...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center gap-3">
        <Icon name="tabler:alert-circle" class="text-red-500 text-xl" />
        <div>
          <h3 class="text-red-800 font-medium">
            Lỗi
          </h3>
          <p class="text-red-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Submission Content -->
    <div v-else-if="attempt" class="space-y-6">
      <!-- Student Info & Score Summary -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Student Info -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Thông tin học sinh
            </h3>
            <div class="space-y-2">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Tên:</span> {{ attempt.student_name }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Quiz:</span> {{ attempt.quiz_title }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Trạng thái:</span>
                <span
                  :class="getStatusColor(attempt.status)"
                  class="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(attempt.status) }}
                </span>
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-medium">Bắt đầu:</span> {{ formatDate(attempt.started_at) }}
              </p>
              <p v-if="attempt.completed_at" class="text-sm text-gray-600">
                <span class="font-medium">Hoàn thành:</span> {{ formatDate(attempt.completed_at) }}
              </p>
            </div>
          </div>

          <!-- Score Summary -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Kết quả
            </h3>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-gray-800">
                  {{ attempt.total_questions }}
                </div>
                <div class="text-sm text-gray-600">
                  Tổng câu
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-2xl font-bold text-gray-800">
                  {{ attempt.correct_answers }}
                </div>
                <div class="text-sm text-gray-600">
                  Đúng
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-2xl font-bold" :class="scoreColor">
                  {{ attempt.total_score }}/{{ attempt.max_score }}
                </div>
                <div class="text-sm text-gray-600">
                  Điểm
                </div>
              </div>
            </div>
            <div class="mt-4 text-sm text-gray-600">
              <p><span class="font-medium">Thời gian làm bài:</span> {{ formatTime(attempt.time_spent_seconds) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions & Answers -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Câu hỏi và câu trả lời
        </h3>

        <div
          v-for="(answer, index) in attempt.answers"
          :key="answer.id"
          class="bg-white rounded-lg shadow-sm border p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Câu {{ index + 1 }}
                </span>
                <span class="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                  {{ answer.question_type === 'multiple_choice' ? 'Trắc nghiệm'
                    : answer.question_type === 'text_input' ? 'Điền từ' : 'Tự luận' }}
                </span>
                <span
                  v-if="answer.question_type !== 'essay'"
                  :class="answer.is_correct ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                  class="text-sm font-medium px-3 py-1 rounded-full"
                >
                  {{ answer.is_correct ? 'Đúng' : 'Sai' }}
                </span>
                <span
                  v-else
                  :class="answer.essay_grading_status === 'graded' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'"
                  class="text-sm font-medium px-3 py-1 rounded-full"
                >
                  {{ answer.essay_grading_status === 'graded' ? 'Đã chấm' : 'Chờ chấm' }}
                </span>
              </div>

              <h4 class="text-lg font-medium text-gray-900 mb-3">
                {{ answer.question_prompt }}
              </h4>
            </div>
          </div>

          <!-- Student Answer -->
          <div class="mb-4">
            <h5 class="text-sm font-medium text-gray-700 mb-2">
              Câu trả lời của học sinh:
            </h5>
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p v-if="answer.question_type === 'multiple_choice'" class="text-gray-900">
                <span class="font-medium">{{ answer.selected_option_text }}</span>
              </p>
              <p v-else class="text-gray-900 whitespace-pre-wrap">
                {{ answer.text_answer || answer.answer_text }}
              </p>
            </div>
          </div>

          <!-- Correct Answer (if available) -->
          <div v-if="answer.correct_answer" class="mb-4">
            <h5 class="text-sm font-medium text-gray-700 mb-2">
              Đáp án đúng:
            </h5>
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p v-if="answer.question_type === 'multiple_choice'" class="text-gray-900">
                <span class="font-medium">{{ answer.correct_answer.text }}</span>
              </p>
              <p v-else class="text-gray-900 whitespace-pre-wrap">
                {{ answer.correct_answer.text }}
              </p>
            </div>
          </div>

          <!-- Comments Section -->
          <QuestionCommentComponent
            :quiz-id="quiz?.id || ''"
            :question-id="answer.question"
            :answer-id="answer.id"
            :question-prompt="answer.question_prompt"
            :student-answer="answer.answer_text || answer.answer_text || answer.selected_option_text || ''"
            :student-name="attempt.student_name"
            :comments="questionComments[answer.question] || []"
            :loading="loadingComments[answer.question] || false"
            @refresh="handleCommentRefresh(answer.question)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
