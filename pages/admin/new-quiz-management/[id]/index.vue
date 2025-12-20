<script setup lang="ts">
import QuizDetail from '~/components/admin/new-quiz/QuizDetail.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
import type { NewQuizDetail } from '~/composables/api/useNewQuizApi'
import { Modal, notification } from 'ant-design-vue'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getQuiz, deleteQuiz, publishQuiz, unpublishQuiz } = useNewQuizApi()

const quizId = computed(() => route.params.id as string)
const quiz = ref<NewQuizDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Load quiz data
async function loadQuiz() {
  try {
    loading.value = true
    error.value = null
    const data = await getQuiz(quizId.value)
    quiz.value = data
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.messages.loadQuizError')
    console.error('Error loading quiz:', err)
  }
  finally {
    loading.value = false
  }
}

// Handle edit
function handleEdit() {
  router.push(`/admin/new-quiz-management/${quizId.value}/edit`)
}

// Handle delete
function handleDelete() {
  Modal.confirm({
    title: t('newQuiz.management.deleteConfirm.title'),
    content: t('newQuiz.management.deleteConfirm.message'),
    okText: t('newQuiz.management.deleteConfirm.confirm'),
    okType: 'danger',
    cancelText: t('newQuiz.management.deleteConfirm.cancel'),
    onOk: async () => {
      try {
        await deleteQuiz(quizId.value)
        notification.success({
          message: t('newQuiz.messages.deleteSuccess', { title: quiz.value?.title }),
          duration: 3,
        })
        router.push('/admin/new-quiz-management')
      }
      catch (err: any) {
        notification.error({
          message: t('newQuiz.messages.deleteError'),
          description: err.message,
          duration: 4.5,
        })
      }
    },
  })
}

// Handle publish
async function handlePublish() {
  if (!quiz.value) return

  if (quiz.value.total_questions === 0) {
    notification.error({
      message: t('newQuiz.messages.publishNoQuestionsError'),
      duration: 4,
    })
    return
  }

  try {
    await publishQuiz(quizId.value)
    notification.success({
      message: t('newQuiz.messages.publishSuccess'),
      duration: 3,
    })
    await loadQuiz()
  }
  catch (err: any) {
    notification.error({
      message: t('newQuiz.messages.publishError'),
      description: err.message,
      duration: 4.5,
    })
  }
}

// Handle unpublish
async function handleUnpublish() {
  try {
    await unpublishQuiz(quizId.value)
    notification.success({
      message: t('newQuiz.messages.unpublishSuccess'),
      duration: 3,
    })
    await loadQuiz()
  }
  catch (err: any) {
    notification.error({
      message: t('newQuiz.messages.publishError'),
      description: err.message,
      duration: 4.5,
    })
  }
}

onMounted(() => {
  loadQuiz()
})

// SEO
useHead({
  title: () => quiz.value ? `${quiz.value.title} - ${t('newQuiz.management.title')}` : t('newQuiz.management.title'),
  meta: [
    { name: 'description', content: () => quiz.value?.description || '' },
  ],
})
</script>

<template>
  <div class="p-4 sm:p-6 max-md:px-0">
    <!-- Header with actions -->
    <div class="mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <a-button type="default" @click="router.back()">
          <template #icon>
            <Icon name="solar:arrow-left-bold" />
          </template>
          {{ $t('newQuiz.editor.backToList') }}
        </a-button>
        <div class="flex gap-2">
          <a-button
            v-if="quiz && !quiz.is_published"
            type="primary"
            @click="handlePublish"
          >
            <template #icon>
              <Icon name="solar:check-circle-bold" />
            </template>
            {{ $t('newQuiz.management.publish') }}
          </a-button>
          <a-button
            v-if="quiz && quiz.is_published"
            @click="handleUnpublish"
          >
            <template #icon>
              <Icon name="solar:close-circle-bold" />
            </template>
            {{ $t('newQuiz.management.unpublish') }}
          </a-button>
          <a-button @click="handleEdit">
            <template #icon>
              <Icon name="solar:pen-bold" />
            </template>
            {{ $t('newQuiz.management.edit') }}
          </a-button>
          <a-button
            type="primary"
            danger
            @click="handleDelete"
          >
            <template #icon>
              <Icon name="solar:trash-bin-trash-bold" />
            </template>
            {{ $t('newQuiz.management.delete') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <a-alert
      v-if="error"
      type="error"
      :message="$t('newQuiz.messages.loadQuizError')"
      :description="error"
      show-icon
      closable
      class="mb-4"
      @close="error = null"
    />

    <!-- Quiz detail -->
    <QuizDetail
      v-if="quiz"
      :quiz="quiz"
      :loading="loading"
    />
  </div>
</template>
