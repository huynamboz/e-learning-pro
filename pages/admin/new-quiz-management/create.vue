<script setup lang="ts">
import QuizEditor from '~/components/admin/new-quiz/QuizEditor.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const { createQuiz } = useNewQuizApi()

const loading = ref(false)
const error = ref<string | null>(null)

function handleBack() {
  router.back()
}

// Handle quiz creation
async function handleCreateQuiz(quizData: any) {
  try {
    loading.value = true
    error.value = null
    await createQuiz(quizData)
    router.push('/admin/new-quiz-management')
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.messages.createError')
    console.error('Error creating quiz:', err)
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: () => `${t('newQuiz.editor.createTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.editor.createTitle') },
  ],
})
</script>

<template>
  <QuizEditor
    mode="create"
    :is-creating="loading"
    :is-loading="false"
    @back="handleBack"
    @create-quiz="handleCreateQuiz"
  />
</template>
