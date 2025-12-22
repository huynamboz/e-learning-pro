<script setup lang="ts">
import type { NewQuiz } from '~/composables/api/useNewQuizApi'
import { Modal, notification } from 'ant-design-vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

interface Props {
  quizzes: NewQuiz[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
const router = useRouter()
const { deleteQuiz, publishQuiz, unpublishQuiz } = useNewQuizApi()

// Track loading state for each quiz toggle
const togglingQuizId = ref<string | null>(null)

// Group quizzes by level
const quizzesByLevel = computed(() => {
  const grouped: Record<string, { level: { code: string, name: string }, quizzes: NewQuiz[] }> = {}

  props.quizzes.forEach((quiz) => {
    const levelKey = quiz.level
    if (!grouped[levelKey]) {
      grouped[levelKey] = {
        level: {
          code: quiz.level_code,
          name: quiz.level_name,
        },
        quizzes: [],
      }
    }
    grouped[levelKey].quizzes.push(quiz)
  })

  // Sort by level order (assuming level_code can be used for sorting)
  return Object.values(grouped).sort((a, b) => {
    return a.level.code.localeCompare(b.level.code)
  })
})

function handleViewQuiz(quizId: string) {
  router.push(`/admin/new-quiz-management/${quizId}`)
}

function handleEditQuiz(quizId: string) {
  router.push(`/admin/new-quiz-management/${quizId}/edit`)
}

async function handleDeleteQuiz(quizId: string, quizTitle: string) {
  Modal.confirm({
    title: t('newQuiz.management.deleteConfirm.title'),
    content: t('newQuiz.management.deleteConfirm.message'),
    okText: t('newQuiz.management.deleteConfirm.confirm'),
    okType: 'danger',
    cancelText: t('newQuiz.management.deleteConfirm.cancel'),
    onOk: async () => {
      try {
        await deleteQuiz(quizId)
        notification.success({
          message: t('newQuiz.messages.deleteSuccess', { title: quizTitle }),
          duration: 3,
        })
        emit('refresh')
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

async function handleTogglePublish(quizId: string, newStatus: boolean) {
  togglingQuizId.value = quizId
  try {
    if (newStatus) {
      // Toggle to published
      await publishQuiz(quizId)
      notification.success({
        message: t('newQuiz.messages.publishSuccess'),
        duration: 3,
      })
    }
    else {
      // Toggle to unpublished
      await unpublishQuiz(quizId)
      notification.success({
        message: t('newQuiz.messages.unpublishSuccess'),
        duration: 3,
      })
    }
    emit('refresh')
  }
  catch (err: any) {
    if (err.message?.includes('question') || err.statusCode === 400) {
      notification.error({
        message: t('newQuiz.messages.publishNoQuestionsError'),
        duration: 4,
      })
    }
    else {
      notification.error({
        message: t('newQuiz.messages.publishError'),
        description: err.message,
        duration: 4.5,
      })
    }
    // Emit refresh to revert the toggle state
    emit('refresh')
  }
  finally {
    togglingQuizId.value = null
  }
}
</script>

<template>
  <div class="quiz-list">
    <!-- Loading state with skeleton -->
    <div v-if="loading" class="space-y-6">
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse"
      >
        <div class="mb-4 pb-2 border-b border-gray-200">
          <div class="h-6 bg-gray-200 rounded w-32 mb-2" />
          <div class="h-4 bg-gray-200 rounded w-24" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="j in 3"
            :key="j"
            class="bg-gray-100 rounded-lg p-4 h-48"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="quizzes.length === 0" class="text-center py-12">
      <Icon name="solar:clipboard-list-bold-duotone" class="text-6xl text-gray-300 mb-4 mx-auto" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">
        {{ $t('newQuiz.management.noQuizzes') }}
      </h3>
      <p class="text-gray-500 mb-4">
        {{ $t('newQuiz.management.createFirstQuiz') }}
      </p>
    </div>

    <!-- Quiz list grouped by level -->
    <div v-else class="space-y-6">
      <div
        v-for="group in quizzesByLevel"
        :key="group.level.code"
        class="level-group"
      >
        <!-- Level header -->
        <div class="mb-4 pb-2 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ group.level.code }} - {{ group.level.name }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ group.quizzes.length }} {{ group.quizzes.length === 1 ? $t('newQuiz.management.totalQuizzes') : $t('newQuiz.management.totalQuizzes') }}
          </p>
        </div>

        <!-- Quizzes in this level -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="quiz in group.quizzes"
            :key="quiz.id"
            class="quiz-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="text-base font-semibold text-gray-900 line-clamp-2">
                {{ quiz.title }}
              </h4>
              <a-tag
                :color="quiz.is_published ? 'green' : 'orange'"
                class="ml-2 flex-shrink-0"
              >
                {{ quiz.is_published ? $t('newQuiz.management.published') : $t('newQuiz.management.draft') }}
              </a-tag>
            </div>

            <p
              v-if="quiz.description"
              class="text-sm text-gray-600 line-clamp-2 mb-3"
            >
              {{ quiz.description }}
            </p>

            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>
                {{ quiz.total_questions }} {{ $t('quiz.questions') }}
              </span>
              <span v-if="quiz.time_type === 'limit'">
                {{ quiz.time_limit_display }}
              </span>
              <span v-else>
                {{ $t('quiz.freeTime') }}
              </span>
            </div>

            <div class="mt-3 flex flex-col gap-2">
              <div class="flex flex-wrap gap-2">
                <a-button
                  size="small"
                  @click.stop="handleViewQuiz(quiz.id)"
                >
                  {{ $t('newQuiz.management.view') }}
                </a-button>
                <a-button
                  size="small"
                  @click.stop="handleEditQuiz(quiz.id)"
                >
                  {{ $t('newQuiz.management.edit') }}
                </a-button>
                <a-button
                  size="small"
                  type="primary"
                  danger
                  @click.stop="handleDeleteQuiz(quiz.id, quiz.title)"
                >
                  {{ $t('newQuiz.management.delete') }}
                </a-button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-600">
                  {{ quiz.is_published ? $t('newQuiz.management.published') : $t('newQuiz.management.draft') }}
                </span>
                <a-switch
                  :checked="quiz.is_published"
                  :loading="togglingQuizId === quiz.id"
                  :disabled="togglingQuizId === quiz.id"
                  @change="(checked: boolean) => handleTogglePublish(quiz.id, checked)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-list {
  min-height: 200px;
}

.level-group {
  margin-bottom: 2rem;
}

.quiz-card {
  transition: all 0.2s ease;
}

.quiz-card:hover {
  border-color: #15803d;
}
</style>
