<script setup lang="ts">
import type { QuestionComment, QuizQuestion, StudentAnswer } from '~/composables/api/useQuizApi'
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
async function loadComments() {
  if (!props.quizId || !props.question?.id)
    return

  try {
    loadingComments.value = true
    const response = await getQuestionComments(props.quizId, props.question.id)
    comments.value = response.results
  }
  catch (err: any) {
    console.error('Error loading comments:', err)
  }
  finally {
    loadingComments.value = false
  }
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

// Lifecycle
onMounted(() => {
  if (props.quizId && props.question?.id) {
    loadComments()
  }
})

// Get options from question data or use mock data as fallback
const options = computed(() => {
  if (props.question?.options && props.question.options.length > 0) {
    return props.question.options.map((option, index) => ({
      label: option.label,
      text: option.text,
      color: getOptionColor(index),
    }))
  }

  // Fallback to mock data
  return [
    { label: 'A', text: 'Friend', color: 'bg-blue-200' },
    { label: 'B', text: 'Family', color: 'bg-orange-500' },
    { label: 'C', text: 'House', color: 'bg-pink-500' },
    { label: 'D', text: 'Food', color: 'bg-yellow-500' },
  ]
})

// Get color for option based on index
function getOptionColor(index: number) {
  const colors = [
    'bg-blue-200',
    'bg-orange-200',
    'bg-red-200',
    'bg-yellow-200',
  ]
  return colors[index] || 'bg-gray-500'
}

// Check if an option is the correct answer
function isCorrectOption(optionLabel: string) {
  return props.answer.correct_answer?.label === optionLabel
}

function isUserAnswerInCorrect(optionLabel: string) {
  const userAnswerLabel = props.question?.options?.find(o => o.id === props.answer.selected_option)?.label
  return userAnswerLabel !== props.answer.correct_answer?.label && userAnswerLabel === optionLabel
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
    <!-- Question Header -->
    <div class="bg-gray-100 px-6 py-4 flex items-center justify-between">
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

      <!-- Options -->
      <div class="space-y-3">
        <div
          v-for="option in options"
          :key="option.label"
          class="flex items-center gap-3 p-3 rounded-xl border"
          :class="{
            'bg-green-100 border-green-300': isCorrectOption(option.label),
            'bg-white border-gray-200': !isCorrectOption(option.label),
            '!bg-red-100 border-red-300': isUserAnswerInCorrect(option.label),
          }"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm"
            :class="option.color"
          >
            {{ option.label }}
          </div>
          <span class="text-gray-800">{{ option.text }}</span>
        </div>
      </div>

      <!-- Teacher Comments -->
      <div v-if="comments.length > 0" class="mt-6 pt-4 border-t border-gray-200">
        <h5 class="text-sm font-medium text-gray-700 mb-3">
          Nhận xét của giáo viên
        </h5>
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
            <p class="text-sm text-gray-700 whitespace-pre-wrap">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
