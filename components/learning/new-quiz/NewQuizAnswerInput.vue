<script setup lang="ts">
import type { NewQuizQuestion } from '~/composables/api/useNewQuizApi'
import type { SavedAnswer } from '~/types/new-quiz.type'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  question: NewQuizQuestion
  savedAnswer?: SavedAnswer
  saving?: boolean
  saveError?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'answerSaved': [answerData: any]
}>()

// Local state for answer input
const selectedOption = ref<string | null>(props.savedAnswer?.selected_option || null)
const textAnswer = ref<string>(props.savedAnswer?.text_answer || '')

// Track previous question ID to detect question changes
const previousQuestionId = ref<string | null>(null)

// Initialize from saved answer and reset when question changes
watch(() => [props.savedAnswer, props.question.id] as const, ([newAnswer, questionId]) => {
  const currentQuestionId = questionId
  const prevQuestionId = previousQuestionId.value
  const savedAnswer = newAnswer as SavedAnswer | undefined

  // Reset when question changes
  if (prevQuestionId !== null && currentQuestionId !== prevQuestionId) {
    if (savedAnswer) {
      selectedOption.value = savedAnswer.selected_option || null
      textAnswer.value = savedAnswer.text_answer || ''
    }
    else {
      selectedOption.value = null
      textAnswer.value = ''
    }
    previousQuestionId.value = currentQuestionId
    return
  }

  // Update when saved answer changes for same question
  if (savedAnswer) {
    if (savedAnswer.selected_option !== undefined) {
      selectedOption.value = savedAnswer.selected_option || null
    }
    if (savedAnswer.text_answer !== undefined) {
      textAnswer.value = savedAnswer.text_answer || ''
    }
  }
  else {
    // Reset when no saved answer
    selectedOption.value = null
    textAnswer.value = ''
  }

  // Update previous question ID
  previousQuestionId.value = currentQuestionId
}, { immediate: true })

// Computed for feedback display
const showFeedback = computed(() => {
  return props.savedAnswer && props.savedAnswer.question_type !== 'essay'
})

const isCorrect = computed(() => {
  return props.savedAnswer?.is_correct === true
})

const correctAnswer = computed(() => {
  return props.savedAnswer?.correct_answer
})

// Disable answer selection after feedback is shown (for MCQ only)
const isAnswerLocked = computed(() => {
  // Lock MCQ answers after feedback is shown
  if (props.question.question_type === 'multiple_choice' && showFeedback.value) {
    return true
  }
  // For text-input and essay, allow editing until submit
  return false
})

// Handle MCQ selection
function handleMCQSelect(optionId: string) {
  // Prevent selection if answer is locked (already has feedback)
  if (isAnswerLocked.value)
    return

  selectedOption.value = optionId
  emit('answerSaved', {
    selected_option_id: optionId,
  })
}

// Handle text input (manual submit for text_input)
function handleTextInput(text: string) {
  textAnswer.value = text
}

function handleTextSubmit() {
  if (textAnswer.value.trim()) {
    emit('answerSaved', {
      text_answer: textAnswer.value.trim(),
    })
  }
}

// Handle essay input (with debounce)
const debouncedSaveEssay = useDebounceFn((text: string) => {
  emit('answerSaved', {
    text_answer: text,
  })
}, 500)

function handleEssayInput(text: string) {
  textAnswer.value = text
  debouncedSaveEssay(text)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Multiple Choice -->
    <div v-if="question.question_type === 'multiple_choice' && question.options" class="space-y-3">
      <div
        v-for="option in question.options"
        :key="option.id"
        class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200"
        :class="{
          'bg-green-100 border-green-300': selectedOption === option.id && !showFeedback,
          'bg-green-50 border-green-400': selectedOption === option.id && showFeedback && isCorrect,
          'bg-red-50 border-red-300': selectedOption === option.id && showFeedback && !isCorrect,
          'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50': selectedOption !== option.id && !showFeedback,
          'bg-emerald-50 border-emerald-300': showFeedback && correctAnswer && option.text === correctAnswer.text && selectedOption !== option.id,
          'opacity-50 cursor-not-allowed': saving || isAnswerLocked,
        }"
        @click="handleMCQSelect(option.id)"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm"
          :class="{
            'bg-blue-200': option.label === 'A',
            'bg-orange-200': option.label === 'B',
            'bg-red-200': option.label === 'C',
            'bg-yellow-200': option.label === 'D',
          }"
        >
          {{ option.label }}
        </div>
        <span class="text-gray-800 flex-1">{{ option.text }}</span>
        <!-- Feedback Icons -->
        <div v-if="showFeedback" class="flex-shrink-0">
          <Icon
            v-if="selectedOption === option.id && isCorrect"
            name="mdi:check-circle"
            class="text-green-600 text-xl"
          />
          <Icon
            v-else-if="selectedOption === option.id && !isCorrect"
            name="mdi:close-circle"
            class="text-red-600 text-xl"
          />
          <Icon
            v-else-if="correctAnswer && option.text === correctAnswer.text"
            name="mdi:check-circle-outline"
            class="text-green-600 text-xl"
          />
        </div>
      </div>

      <!-- Lock Notice -->
      <div
        v-if="isAnswerLocked"
        class="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg"
      >
        <div class="flex items-center gap-2 text-xs text-slate-600">
          <Icon name="mdi:lock" class="text-slate-500" />
          <span>Đáp án đã được khóa sau khi có kết quả</span>
        </div>
      </div>

      <!-- Correct Answer Display (if wrong) -->
      <div
        v-if="showFeedback && !isCorrect && correctAnswer"
        class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <div class="flex items-start gap-2">
          <Icon name="mdi:information" class="text-emerald-600 shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-medium text-emerald-900">
              Đáp án đúng:
            </p>
            <p class="text-sm text-emerald-700 mt-1">
              {{ correctAnswer.label ? `${correctAnswer.label}. ${correctAnswer.text}` : correctAnswer.text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Input -->
    <div v-else-if="question.question_type === 'text_input'" class="space-y-3">
      <div class="flex gap-3">
        <input
          :value="textAnswer"
          :disabled="saving || showFeedback"
          type="text"
          class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
          :class="[
            showFeedback && isCorrect
              ? 'border-green-500 bg-green-50'
              : showFeedback && !isCorrect
                ? 'border-red-500 bg-red-50'
                : '',
            saving || showFeedback ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          placeholder="Nhập câu trả lời..."
          @input="handleTextInput(($event.target as HTMLInputElement).value)"
          @keyup.enter="handleTextSubmit"
        >
        <button
          :disabled="!textAnswer.trim() || saving || showFeedback"
          class="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          @click="handleTextSubmit"
        >
          <Icon v-if="saving" name="mdi:loading" class="animate-spin text-base" />
          <Icon v-else name="mdi:send" class="text-base" />
          {{ saving ? 'Đang lưu...' : 'Trả lời' }}
        </button>
      </div>
      <div
        v-if="showFeedback"
        class="flex items-center gap-2"
      >
        <Icon
          :name="isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'"
          :class="isCorrect ? 'text-emerald-600' : 'text-red-600'"
        />
        <span :class="isCorrect ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'">
          {{ isCorrect ? 'Đúng!' : 'Sai' }}
        </span>
        <span v-if="!isCorrect && correctAnswer" class="text-sm text-slate-600">
          - Đáp án đúng: {{ correctAnswer.text }}
        </span>
      </div>
    </div>

    <!-- Essay -->
    <div v-else-if="question.question_type === 'essay'" class="space-y-3">
      <textarea
        :value="textAnswer"
        :disabled="saving"
        rows="6"
        class="w-full p-4 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none transition-all"
        :class="saving ? 'opacity-50 cursor-wait' : ''"
        placeholder="Type your answer here..."
        @input="handleEssayInput(($event.target as HTMLTextAreaElement).value)"
      />
      <div v-if="saving" class="text-xs text-slate-500 flex items-center gap-2">
        <Icon name="mdi:loading" class="animate-spin" />
        Đang lưu...
      </div>
      <p class="text-xs text-slate-500">
        Câu hỏi tự luận sẽ được giáo viên chấm điểm sau khi bạn nộp bài.
      </p>
    </div>
  </div>
</template>
