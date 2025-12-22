<script setup lang="ts">
import type { NewQuizQuestion } from '~/composables/api/useNewQuizApi'
import type { SavedAnswer } from '~/types/new-quiz.type'
import NewQuizAnswerInput from './NewQuizAnswerInput.vue'

interface Props {
  question: NewQuizQuestion
  questionIndex: number
  totalQuestions: number
  savedAnswer?: SavedAnswer
  saving?: boolean
  saveError?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answerSaved: [questionId: string, answerData: any]
}>()

const { t } = useI18n()

function handleAnswerSave(answerData: any) {
  emit('answerSaved', props.question.id, answerData)
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Left Side - Question -->
    <div>
      <div class="text-green-800 mb-6 font-medium text-xl">
        {{ question.prompt }}
      </div>
      <p class="text-sm text-gray-500">
        {{
          question.question_type === 'multiple_choice'
            ? t('newQuiz.player.questionInstructions.selectOneAnswer')
            : question.question_type === 'text_input'
              ? t('newQuiz.player.questionInstructions.typeAnswerBelow')
              : t('newQuiz.player.questionInstructions.typeEssayAnswerBelow')
        }}
      </p>
      <!-- Question Media (if any) -->
      <div v-if="question.media" class="mt-4 rounded-xl overflow-hidden border border-gray-200">
        <img :src="question.media" :alt="question.prompt" class="w-full h-auto">
      </div>
    </div>

    <!-- Right Side - Options/Answer -->
    <div>
      <NewQuizAnswerInput
        :question="question"
        :saved-answer="savedAnswer"
        :saving="saving"
        :save-error="saveError"
        @answer-saved="handleAnswerSave"
      />

      <!-- Save Error Display -->
      <div v-if="saveError" class="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
        <Icon name="tabler:alert-circle" class="text-red-500 text-xl shrink-0" />
        <div class="flex-1">
          <h3 class="text-red-800 font-medium">
            {{ t('newQuiz.player.questionInstructions.errorSavingAnswer') }}
          </h3>
          <p class="text-red-700 text-sm">
            {{ saveError }}
          </p>
          <button
            class="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            @click="handleAnswerSave(savedAnswer ? { selected_option_id: savedAnswer.selected_option, text_answer: savedAnswer.text_answer } : {})"
          >
            {{ t('newQuiz.player.questionInstructions.tryAgain') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
