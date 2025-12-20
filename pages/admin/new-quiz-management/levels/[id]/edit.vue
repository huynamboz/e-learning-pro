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
const route = useRoute()
const { updateLevel } = useNewQuizApi()

const levelId = computed(() => route.params.id as string)
const loading = ref(false)
const error = ref<string | null>(null)

function handleBack() {
  router.back()
}

// Handle level update
async function handleUpdateLevel(levelData: Partial<NewQuizLevelCreate>) {
  try {
    loading.value = true
    error.value = null
    await updateLevel(levelId.value, levelData)
    notification.success({
      message: t('newQuiz.level.messages.updateSuccess'),
      duration: 3,
    })
    router.push('/admin/new-quiz-management/levels')
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.level.messages.updateError')
    notification.error({
      message: t('newQuiz.level.messages.updateError'),
      description: err.message,
      duration: 4.5,
    })
    console.error('Error updating level:', err)
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: () => `${t('newQuiz.level.editor.editTitle')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.level.editor.editDescription') },
  ],
})
</script>

<template>
  <LevelEditor
    mode="edit"
    :level-id="levelId"
    :is-updating="loading"
    :is-loading="false"
    @back="handleBack"
    @update-level="handleUpdateLevel"
  />
</template>
