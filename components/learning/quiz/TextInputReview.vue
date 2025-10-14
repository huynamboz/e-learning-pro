<script setup lang="ts">
import type { StudentAnswer } from '~/composables/api/useQuizApi'

interface Props {
  answer: StudentAnswer
  questionNumber: number
}

defineProps<Props>()
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
            {{ answer.text_answer || 'No answer provided' }}
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
      </div>
    </div>
  </div>
</template>
