<script setup lang="ts">
import type { QuizChapter } from '~/types/quiz.type'

interface Emits {
  (e: 'createQuiz'): void
  (e: 'editQuiz', quizId: string): void
  (e: 'deleteQuiz', quizId: string): void
}
interface QuizProps {
  listQuizzes: QuizChapter[]
}
const { listQuizzes } = defineProps<QuizProps>()
const emit = defineEmits<Emits>()
function handleEditQuiz(quizId: string) {
  emit('editQuiz', quizId)
}

function handleCreateQuiz() {
  emit('createQuiz')
}

function handleDeleteQuiz(quizId: string) {
  emit('deleteQuiz', quizId)
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex justify-end">
      <button
        class="flex items-center gap-2 px-3 py-2 border bg-green-700 rounded-lg  transition cursor-pointer"
        @click="handleCreateQuiz"
      >
        <Icon name="ic:round-add" class="text-xl text-white" />
        <span class="text-white">Add a quiz</span>
      </button>
    </div>
    <div
      v-for="chapter in listQuizzes"
      :key="chapter.id"
      class="flex flex-col gap-2 w-full"
    >
      <!-- Chapter Title -->
      <h3 class="text-lg font-semibold text-slate-900">
        {{ chapter.chapter_title }}
      </h3>

      <!-- Quiz Cards -->
      <div class="flex flex-col gap-4">
        <div
          v-for="(quiz, index) in chapter.quizzes"
          :key="quiz.id"
          class="flex items-center justify-between p-4 rounded-2xl bg-white shadow-md border"
        >
          <!-- Quiz Content -->
          <div class="flex items-center gap-3">
            <!-- Icon -->
            <div class="w-6 h-6 flex items-center justify-center text-gray-700">
              <Icon name="mingcute:question-line" class="text-xl" />
            </div>

            <!-- Info -->
            <div class="flex flex-col">
              <h4 class="text-base font-semibold text-gray-900 truncate max-w-xs">
                {{ index + 1 }}. {{ quiz.title }}
              </h4>
              <p class="text-sm text-gray-600 !m-0">
                Questions: {{ quiz.number_of_questions }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <button
              class="flex items-center gap-2 px-3 py-2 bg-green-700 text-sm font-medium rounded-lg border border-green-700 hover:bg-green-800 transition cursor-pointer"
              @click="handleEditQuiz(quiz.id)"
            >
              <span class="text-white">
                Edit
              </span>
              <Icon name="fluent:edit-16-regular" class="text-xl text-white" />
            </button>

            <a-popconfirm title="Are you sure you want to delete this quiz?" @confirm="handleDeleteQuiz(quiz.id)">
              <button
                class="text-red-500 border gap-2 px-3 py-2 text-sm font-medium rounded-lg border-red-500 hover:text-red-600 transition cursor-pointer"
              >
                <span class="text-red-500">
                  Delete
                </span>
              </button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
