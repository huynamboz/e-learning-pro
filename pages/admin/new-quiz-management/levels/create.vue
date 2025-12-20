<script setup lang="ts">
import { notification } from 'ant-design-vue'
import LevelEditor from '~/components/admin/new-quiz/LevelEditor.vue'
import type { NewQuizLevelCreate } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const { createLevel } = useNewQuizApi()

const loading = ref(false)
const error = ref<string | null>(null)

function handleBack() {
  router.back()
}

// Handle level creation
async function handleCreateLevel(levelData: NewQuizLevelCreate) {
  try {
    loading.value = true
    error.value = null
    await createLevel(levelData)
    notification.success({
      message: t('newQuiz.level.messages.createSuccess'),
      duration: 3,
    })
    router.push('/admin/new-quiz-management/levels')
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.level.messages.createError')
    notification.error({
      message: t('newQuiz.level.messages.createError'),
      description: err.message,
      duration: 4.5,
    })
    console.error('Error creating level:', err)
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: () => `${t('newQuiz.level.editor.createTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.level.editor.createDescription') },
  ],
})
</script>

<template>
  <LevelEditor
    mode="create"
    :is-creating="loading"
    :is-loading="false"
    @back="handleBack"
    @create-level="handleCreateLevel"
  />
</template>
