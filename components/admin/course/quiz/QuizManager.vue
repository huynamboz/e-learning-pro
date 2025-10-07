<script setup lang="ts">
import type { CreateQuizPayload, QuizChapter, UpdateQuizPayload } from '~/types/quiz.type'
import QuizEditor from './QuizEditor.vue'
import QuizList from './QuizList.vue'
// State management
const currentView = ref<'list' | 'create' | 'edit'>('list')
const editQuizId = ref<string | undefined>(undefined)
const listQuizzes = ref<QuizChapter[]>([])

const { isCreating, isLoading, isUpdating, getQuizzes, deleteQuiz, createQuiz, updateQuiz } = useQuizManagement()

function switchToCreate() {
  currentView.value = 'create'
  editQuizId.value = undefined
}

function switchToEdit(quizId: string) {
  currentView.value = 'edit'
  editQuizId.value = quizId
}

function handleBack() {
  currentView.value = 'list'
  editQuizId.value = undefined
}
function handleCreateQuiz(quizData: CreateQuizPayload) {
  createQuiz(quizData)
  handleQuizSaved()
}
function handleUpdateQuiz(quizData: UpdateQuizPayload) {
  updateQuiz(quizData)
  handleQuizSaved()
}
function handleQuizSaved() {
  currentView.value = 'list'
  editQuizId.value = undefined
}
function handleDeleteQuiz(quizId: string) {
  deleteQuiz(quizId)
}
onMounted(async () => {
  listQuizzes.value = getQuizzes()
})
</script>

<template>
  <div class="quiz-management">
    <QuizList
      v-if="currentView === 'list'"
      :list-quizzes="listQuizzes"
      @create-quiz="switchToCreate"
      @edit-quiz="switchToEdit"
      @delete-quiz="handleDeleteQuiz"
    />

    <QuizEditor
      v-else-if="currentView === 'create'"
      mode="create"
      :is-creating="isCreating"
      :is-loading="isLoading"
      @back="handleBack"
      @create-quiz="handleCreateQuiz"
    />

    <QuizEditor
      v-else-if="currentView === 'edit'"
      mode="edit"
      :quiz-id="editQuizId"
      :is-loading="isLoading"
      :is-updating="isUpdating"
      @back="handleBack"
      @update-quiz="handleUpdateQuiz"
    />
  </div>
</template>
