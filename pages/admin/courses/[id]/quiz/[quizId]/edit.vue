<script lang="ts" setup>
import QuizEditor from '~/components/admin/course/quiz/QuizEditor.vue'
import { useQuizApi } from '~/composables/api/useQuizApi'

const route = useRoute()
const courseId = route.params.id as string
const quizId = route.params.quizId as string
const router = useRouter()

const handleBack = () => {
    router.back()
}

const loading = ref(false)
const error = ref<string | null>(null)

const { updateQuiz } = useQuizApi()

// Handle quiz update
async function handleUpdateQuiz(quizData: any) {
  try {
    loading.value = true
    error.value = null
    await updateQuiz(quizData.id, quizData)
    router.push(`/admin/courses/${courseId}/quiz/all-quiz`)
  } catch (err: any) {
    error.value = err.message || 'Failed to update quiz'
    console.error('Error updating quiz:', err)
  } finally {
    loading.value = false
  }
}

// i18n
const { t } = useI18n()

// SEO
useHead({
  title: () => `${t('quiz.editor.editTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('quiz.editor.editTitle') }
  ]
})
</script>

<template>
    <QuizEditor
      mode="edit"
      :course-id="courseId"
      :quiz-id="quizId"
      :is-loading="false"
      :is-updating="false"
      @back="handleBack"
      @update-quiz="handleUpdateQuiz"
    />
</template>