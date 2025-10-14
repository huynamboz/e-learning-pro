<script setup lang="ts">
import type { StudentAnswer, QuizQuestion } from '~/composables/api/useQuizApi'

interface Props {
  answer: StudentAnswer
  questionNumber: number
  question?: QuizQuestion
}

const props = defineProps<Props>()

// Get options from question data or use mock data as fallback
const options = computed(() => {
  if (props.question?.options && props.question.options.length > 0) {
    return props.question.options.map((option, index) => ({
      label: option.label,
      text: option.text,
      color: getOptionColor(index)
    }))
  }
  
  // Fallback to mock data
  return [
    { label: 'A', text: 'Friend', color: 'bg-blue-200' },
    { label: 'B', text: 'Family', color: 'bg-orange-500' },
    { label: 'C', text: 'House', color: 'bg-pink-500' },
    { label: 'D', text: 'Food', color: 'bg-yellow-500' }
  ]
})

// Get color for option based on index
const getOptionColor = (index: number) => {
  const colors = [
  'bg-blue-200',
    'bg-orange-200',
    'bg-red-200',
    'bg-yellow-200',
  ]
  return colors[index] || 'bg-gray-500'
}

// Check if an option is the correct answer
const isCorrectOption = (optionLabel: string) => {
  return props.answer.correct_answer?.label === optionLabel
}

const isUserAnswerInCorrect = (optionLabel: string) => {
  const userAnswerLabel = props.question?.options?.find((o) => o.id === props.answer.selected_option)?.label
  return userAnswerLabel !== props.answer.correct_answer?.label && userAnswerLabel === optionLabel
}
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

      <!-- Options -->
      <div class="space-y-3">
        <div
          v-for="option in options"
          :key="option.label"
          class="flex items-center gap-3 p-3 rounded-xl border"
          :class="{
            'bg-green-100 border-green-300': isCorrectOption(option.label),
            'bg-white border-gray-200': !isCorrectOption(option.label),
            '!bg-red-100 border-red-300': isUserAnswerInCorrect(option.label)
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
    </div>
  </div>
</template>
