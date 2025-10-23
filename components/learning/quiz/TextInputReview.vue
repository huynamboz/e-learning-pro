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
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
    <!-- Question Header -->
    <div class="bg-green-100 px-6 py-4 flex items-center justify-between">
      <div class="text-lg font-bold text-green-700">
        Question {{ questionNumber }}
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
        <div class="text-sm font-medium text-gray-700">Your answer:</div>
        <div 
          class="p-4 rounded-xl border"
          :class="{
            'bg-green-100 border-green-300': answer.is_correct,
            'bg-red-100 border-red-300': !answer.is_correct
          }"
        >
          <span class="text-gray-800">
            {{ answer.answer_text || 'No answer provided' }}
          </span>
        </div>

        <!-- Correct Answer (if incorrect) -->
        <div v-if="!answer.is_correct && answer.correct_answer" class="space-y-2">
          <div class="text-sm font-medium text-gray-700">Correct answer:</div>
          <div class="p-4 bg-green-100 border border-green-300 rounded-xl">
            <span class="text-gray-800">
              {{ answer.correct_answer.text }}
            </span>
          </div>
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
  </div>
</template>
