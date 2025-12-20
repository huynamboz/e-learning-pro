<script setup lang="ts">
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'

interface Props {
  quiz: NewQuizDetail
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

const questionTypes = {
  multiple_choice: t('newQuiz.editor.addMultipleChoice'),
  text_input: t('newQuiz.editor.addTextInput'),
  essay: t('newQuiz.editor.addEssay'),
}
</script>

<template>
  <div class="quiz-detail bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Loading state with skeleton -->
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-3/4" />
      <div class="h-4 bg-gray-200 rounded w-full" />
      <div class="h-4 bg-gray-200 rounded w-2/3" />
      <div class="grid grid-cols-4 gap-4 mt-6">
        <div v-for="i in 4" :key="i" class="h-16 bg-gray-200 rounded" />
      </div>
    </div>

    <!-- Quiz details -->
    <div v-else>
      <!-- Header -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ quiz.title }}
            </h2>
            <p v-if="quiz.description" class="text-gray-600 mb-3">
              {{ quiz.description }}
            </p>
          </div>
          <a-tag
            :color="quiz.is_published ? 'green' : 'orange'"
            class="text-base px-3 py-1"
          >
            {{ quiz.is_published ? $t('newQuiz.management.published') : $t('newQuiz.management.draft') }}
          </a-tag>
        </div>

        <!-- Metadata -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500">{{ $t('newQuiz.level.title') }}:</span>
            <span class="font-semibold ml-2">{{ quiz.level_code }} - {{ quiz.level_name }}</span>
          </div>
          <div>
            <span class="text-gray-500">{{ $t('quiz.questions') }}:</span>
            <span class="font-semibold ml-2">{{ quiz.total_questions }}</span>
          </div>
          <div>
            <span class="text-gray-500">{{ $t('newQuiz.editor.timeLimit') }}:</span>
            <span class="font-semibold ml-2">
              {{ quiz.time_type === 'limit' ? quiz.time_limit_display : $t('quiz.freeTime') }}
            </span>
          </div>
          <div>
            <span class="text-gray-500">{{ $t('newQuiz.editor.retakeLimit') }}:</span>
            <span class="font-semibold ml-2">{{ quiz.retake_limit }}</span>
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div v-if="quiz.questions && quiz.questions.length > 0">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          {{ $t('newQuiz.editor.questions') }} ({{ quiz.questions.length }})
        </h3>
        <div class="space-y-4">
          <div
            v-for="(question, index) in quiz.questions"
            :key="question.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-700">Q{{ index + 1 }}:</span>
                <a-tag color="blue">
                  {{ questionTypes[question.question_type] }}
                </a-tag>
                <span class="text-sm text-gray-500">
                  ({{ question.score }} {{ question.score === 1 ? 'point' : 'points' }})
                </span>
              </div>
            </div>
            <p class="text-gray-800 mb-2">{{ question.prompt }}</p>
            <div v-if="question.explanation" class="text-sm text-gray-600 italic mt-2">
              <span class="font-semibold">Giải thích:</span> {{ question.explanation }}
            </div>

            <!-- Multiple choice options -->
            <div v-if="question.question_type === 'multiple_choice' && question.options" class="mt-3">
              <div class="space-y-2">
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  class="flex items-center gap-2 p-2 rounded"
                  :class="option.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'"
                >
                  <span class="font-semibold">{{ option.label }}:</span>
                  <span>{{ option.text }}</span>
                  <a-tag v-if="option.is_correct" color="green" size="small">
                    Đáp án đúng
                  </a-tag>
                </div>
              </div>
            </div>

            <!-- Text input sample answer -->
            <div v-if="question.question_type === 'text_input' && question.sample_answer" class="mt-3">
              <div class="bg-blue-50 border border-blue-200 rounded p-3">
                <span class="text-sm font-semibold text-blue-800">Đáp án mẫu:</span>
                <p class="text-blue-900 mt-1">{{ question.sample_answer.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No questions -->
      <div v-else class="text-center py-8 text-gray-500">
        <Icon name="solar:question-circle-bold-duotone" class="text-4xl mb-2 mx-auto" />
        <p>{{ $t('newQuiz.editor.noQuestions') }}</p>
      </div>
    </div>
  </div>
</template>
