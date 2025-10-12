<script lang="ts" setup>
import QuizEditor from '~/components/admin/course/quiz/QuizEditor.vue'
import { useQuizApi } from '~/composables/api/useQuizApi'

const courseId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref<string | null>(null)

const { createQuiz } = useQuizApi()

const router = useRouter()
const route = useRoute()

const handleBack = () => {
    router.back()
}

// Handle quiz creation
async function handleCreateQuiz(quizData: any) {
  try {
    loading.value = true
    error.value = null
    await createQuiz(quizData)
    router.push(`/admin/courses/${courseId.value}/quiz/all-quiz`)
  } catch (err: any) {
    error.value = err.message || 'Failed to create quiz'
    console.error('Error creating quiz:', err)
  } finally {
    loading.value = false
  }
}

// i18n
const { t } = useI18n()

// SEO
useHead({
  title: () => `${t('quiz.editor.createTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('quiz.editor.createTitle') }
  ]
})
</script>

<template>

<QuizEditor
      mode="create"
      :course-id="courseId"
      :is-creating="loading"
      :is-loading="false"
      @back="handleBack"
      @create-quiz="handleCreateQuiz"
    />
</template>