<script setup lang="ts">
import type { NewQuizQuestion } from '~/composables/api/useNewQuizApi'

interface Props {
  totalQuestions: number
  answeredCount: number
  progress: number
  questions?: NewQuizQuestion[]
  getQuestionStatus?: (questionId: string) => 'unanswered' | 'correct' | 'incorrect' | 'pending'
  currentQuestionIndex?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'go-to-question': [index: number]
}>()

function getStatusClass(status: string) {
  switch (status) {
    case 'correct':
      return 'bg-green-500 border-green-600 text-white'
    case 'incorrect':
      return 'bg-red-500 border-red-600 text-white'
    case 'pending':
      return 'bg-yellow-500 border-yellow-600 text-white'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-700'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'correct':
      return 'mdi:check-circle'
    case 'incorrect':
      return 'mdi:close-circle'
    case 'pending':
      return 'mdi:clock-outline'
    default:
      return null
  }
}
</script>

<template>
  <div>
    <!-- Question List -->
    <div v-if="questions && questions.length > 0" class="mt-3">
      <div class="text-xs font-medium text-gray-600 mb-2">
        Danh sách câu hỏi:
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="(question, index) in questions"
          :key="question.id"
          class="w-8 h-8 rounded border-2 transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
          :class="[
            currentQuestionIndex === index ? 'border-green-500 ring-2 ring-green-200' : 'border',
            getQuestionStatus ? getStatusClass(getQuestionStatus(question.id)) : 'bg-gray-100 border-gray-300 text-gray-700',
          ]"
          @click="emit('go-to-question', index)"
        >
          <Icon
            v-if="getQuestionStatus && getStatusIcon(getQuestionStatus(question.id))"
            :name="getStatusIcon(getQuestionStatus(question.id))!"
            class="text-xs"
          />
          <span
            v-else
            class="text-[10px] font-semibold leading-none"
          >
            {{ index + 1 }}
          </span>
        </button>
      </div>
      <div class="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-600">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
          <span>Chưa trả lời</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-green-500 border border-green-600" />
          <span>Đúng</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-red-500 border border-red-600" />
          <span>Sai</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded bg-yellow-500 border border-yellow-600" />
          <span>Đang chờ chấm</span>
        </div>
      </div>
    </div>
  </div>
</template>

