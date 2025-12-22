<script setup lang="ts">
import { notification } from 'ant-design-vue'
import QuizEditor from '~/components/admin/new-quiz/QuizEditor.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { updateQuiz } = useNewQuizApi()

const quizId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref<string | null>(null)

function handleBack() {
  router.back()
}

// Handle quiz update
async function handleUpdateQuiz(quizData: any) {
  try {
    loading.value = true
    error.value = null
    await updateQuiz(quizId.value, quizData)
    notification.success({
      message: t('newQuiz.messages.updateSuccess'),
      duration: 3,
    })
    router.push(`/admin/new-quiz-management`)
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.messages.updateError')
    notification.error({
      message: t('newQuiz.messages.updateError'),
      description: err.message || t('newQuiz.messages.updateError'),
      duration: 4.5,
    })
    console.error('Error updating quiz:', err)
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: () => `${t('newQuiz.editor.editTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.editor.editTitle') },
  ],
})
</script>

<template>
  <div>
    <!-- Error state -->
    <a-alert
      v-if="error"
      type="error"
      :message="$t('newQuiz.messages.updateError')"
      :description="error"
      show-icon
      closable
      class="mb-4"
      @close="error = null"
    />

    <QuizEditor
      mode="edit"
      :quiz-id="quizId"
      :is-updating="loading"
      :is-loading="false"
      @back="handleBack"
      @update-quiz="handleUpdateQuiz"
    />
  </div>
</template>
