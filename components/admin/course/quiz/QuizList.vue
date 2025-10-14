<script setup lang="ts">
import type { QuizApiResponse } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import { useCourse } from '~/composables/useCourse'
import { notification } from 'ant-design-vue'

interface Emits {
  (e: 'createQuiz'): void
  (e: 'editQuiz', quizId: string): void
}

interface QuizProps {
  courseId?: string
  lessonId?: string
  showHeader?: boolean
}

const props = withDefaults(defineProps<QuizProps>(), {
  showHeader: true
})
const emit = defineEmits<Emits>()

// i18n
const { t } = useI18n()

// API composable
const { getQuizzes, deleteQuiz, patchQuiz } = useQuizApi()
const { chapters } = useCourse()

// State
const quizzes = ref<QuizApiResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Delete confirmation modal state
const deleteModalVisible = ref(false)
const quizToDelete = ref<QuizApiResponse | null>(null)

// Quiz statistics
const quizStats = computed(() => {
  const total = quizzes.value.length
  const published = quizzes.value.filter(q => q.is_published).length
  const draft = quizzes.value.filter(q => !q.is_published).length

  return { total, published, draft }
})

// Group quizzes by chapter
const quizzesByChapter = computed(() => {
  const grouped: Record<string, { chapter_title: string; quizzes: QuizApiResponse[] }> = {}

  quizzes.value.forEach(quiz => {
    // Find chapter by lesson ID
    const chapter = chapters.value.find(ch => 
      ch.lessons?.some((lesson: any) => lesson.id === quiz.lesson)
    )
    
    if (chapter) {
      if (!grouped[chapter.id]) {
        grouped[chapter.id] = {
          chapter_title: chapter.title,
          quizzes: []
        }
      }
      grouped[chapter.id].quizzes.push(quiz)
    }
  })

  return Object.values(grouped)
})

// Fetch quizzes
const fetchQuizzes = async () => {
  try {
    loading.value = true
    error.value = null

    const params: any = {
      ordering: '-created_at'
    }

    if (props.lessonId) {
      params.lesson = props.lessonId
    }

    const response = await getQuizzes(params)
    quizzes.value = response.results
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch quizzes'
    console.error('Error fetching quizzes:', err)
  } finally {
    loading.value = false
  }
}

// Handle quiz actions
const handleEditQuiz = (quizId: string) => {
  emit('editQuiz', quizId)
}

const handleCreateQuiz = () => {
  emit('createQuiz')
}

// Show delete confirmation modal
const showDeleteModal = (quiz: QuizApiResponse) => {
  quizToDelete.value = quiz
  deleteModalVisible.value = true
}

// Hide delete confirmation modal
const hideDeleteModal = () => {
  deleteModalVisible.value = false
  quizToDelete.value = null
}

// Confirm delete quiz
const confirmDeleteQuiz = async () => {
  if (!quizToDelete.value) return

  try {
    await deleteQuiz(quizToDelete.value.id)
    // Remove from local state
    quizzes.value = quizzes.value.filter(quiz => quiz.id !== quizToDelete.value!.id)

    notification.success({
      message: 'Success',
      description: t('quiz.messages.deleteSuccess', { title: quizToDelete.value.title }),
      duration: 3,
    })

    hideDeleteModal()
  } catch (err: any) {
    notification.error({
      message: 'Error',
      description: err.message || t('quiz.messages.deleteError'),
      duration: 4.5,
    })
    console.error('Error deleting quiz:', err)
  }
}

const handleTogglePublished = async (quizId: string, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus
    await patchQuiz(quizId, { is_published: newStatus })

    // Update local state
    const quiz = quizzes.value.find(q => q.id === quizId)
    if (quiz) {
      quiz.is_published = newStatus
    }

    notification.success({
      message: 'Success',
      description: newStatus ? t('quiz.messages.publishSuccess') : t('quiz.messages.unpublishSuccess'),
      duration: 3,
    })
  } catch (err: any) {
    notification.error({
      message: 'Error',
      description: err.message || t('quiz.messages.publishError'),
      duration: 4.5,
    })
    console.error('Error updating quiz status:', err)
  }
}

// Format time display
const formatTimeDisplay = (quiz: QuizApiResponse): string => {
  return quiz.time_limit_display || 'No time limit'
}

// Expose stats for parent component
defineExpose({
  quizStats
})

// Lifecycle
onMounted(() => {
  fetchQuizzes()
})
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Header Section (only show if showHeader is true) -->
    <div v-if="showHeader" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Title and Description -->
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon name="mingcute:question-line" class="text-2xl text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ $t('quiz.management.title') }}</h1>
            <p class="text-sm text-gray-600">
              {{ $t('quiz.management.description') }}
            </p>
          </div>
        </div>

        <!-- Stats and Actions -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Quiz Stats -->
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Icon name="tabler:question-mark" class="text-blue-600" />
              <span class="font-medium text-blue-900">{{ quizStats.total }} {{ $t('quiz.management.totalQuizzes')
                }}</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <Icon name="tabler:eye" class="text-green-600" />
              <span class="font-medium text-green-900">
                {{ quizStats.published }} {{ $t('quiz.management.published') }}
              </span>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
              <Icon name="tabler:eye-off" class="text-orange-600" />
              <span class="font-medium text-orange-900">
                {{ quizStats.draft }} {{ $t('quiz.management.draft') }}
              </span>
            </div>
          </div>

          <!-- Add Quiz Button -->
          <a-button type="primary" size="large"
            class="!flex items-center gap-2 py-1 bg-gradient-to-r from-green-600 to-green-700 border-green-600 hover:from-green-700 hover:to-green-800 hover:border-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            @click="handleCreateQuiz">
            <Icon name="ic:round-add" class="text-xl" />
            <span>{{ $t('quiz.management.createNewQuiz') }}</span>
          </a-button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">{{ $t('quiz.management.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="tabler:alert-circle" class="text-red-500" />
        <p class="text-red-700">{{ error }}</p>
      </div>
      <a-button type="link" size="small" class="mt-2 text-red-600 hover:text-red-800 p-0 h-auto" @click="fetchQuizzes">
        {{ $t('quiz.management.tryAgain') }}
      </a-button>
    </div>

    <!-- Empty State -->
    <div v-else-if="quizzes.length === 0" class="text-center py-8">
      <Icon name="mingcute:question-line" class="text-4xl text-gray-400 mx-auto mb-2" />
      <p class="text-gray-500">{{ $t('quiz.management.noQuizzes') }}</p>
      <a-button type="link" size="small" class="mt-2 text-green-600 hover:text-green-800 p-0 h-auto"
        @click="handleCreateQuiz">
        {{ $t('quiz.management.createFirstQuiz') }}
      </a-button>
    </div>

    <!-- Quiz List -->
    <div v-else class="flex flex-col gap-6">
      <div v-for="chapter in quizzesByChapter" :key="chapter.chapter_title" class="flex flex-col gap-4">
        <!-- Quiz Cards -->
        <div class="flex flex-col gap-3">
          <div v-for="(quiz, index) in chapter.quizzes" :key="quiz.id"
            class="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition">
            <!-- Quiz Content -->
            <div class="flex items-center gap-4">
              <!-- Icon -->
              <div class="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                <Icon name="mingcute:question-line" class="text-xl text-blue-600" />
              </div>

              <!-- Info -->
              <div class="flex flex-col">
                <h4 class="text-base font-semibold text-gray-900">
                  {{ quiz.title }}
                </h4>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>{{ quiz.total_questions }} questions</span>
                  <span>•</span>
                  <span>{{ formatTimeDisplay(quiz) }}</span>
                  <span v-if="quiz.is_published" class="flex items-center gap-1 text-green-600">
                    <Icon name="tabler:eye" class="text-xs" />
                    Published
                  </span>
                  <span v-else class="flex items-center gap-1 text-orange-600">
                    <Icon name="tabler:eye-off" class="text-xs" />
                    Draft
                  </span>
                </div>
                <p v-if="quiz.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
                  {{ quiz.description }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <!-- Status Dropdown -->
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key }: { key: string }) => handleTogglePublished(quiz.id, quiz.is_published)">
                    <a-menu-item key="toggle">
                      <div class="flex items-center gap-2">
                        <Icon :name="quiz.is_published ? 'tabler:eye-off' : 'tabler:eye'" class="text-sm" />
                        <span>{{ quiz.is_published ? $t('quiz.management.unpublish') : $t('quiz.management.publish')
                          }}</span>
                      </div>
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button size="small" class="!flex items-center gap-2 !h-8 border-gray-300 text-sm font-medium"
                  :class="quiz.is_published ? 'text-green-600 border-green-300 hover:bg-green-50' : 'text-orange-600 border-orange-300 hover:bg-orange-50'">
                  <Icon :name="quiz.is_published ? 'tabler:eye' : 'tabler:eye-off'" class="text-sm" />
                  {{ quiz.is_published ? $t('quiz.management.published') : $t('quiz.management.draft') }}
                  <Icon name="tabler:chevron-down" class="text-xs" />
                </a-button>
              </a-dropdown>

              <a-button type="primary" size="small"
                class="!flex items-center gap-2 !h-8 bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                @click="handleEditQuiz(quiz.id)">
                <Icon name="fluent:edit-16-regular" class="text-sm" />
                {{ $t('quiz.management.edit') }}
              </a-button>

              <a-button size="small" class="!flex items-center gap-2 !h-8 text-red-600 border-red-300 hover:bg-red-50"
                @click="showDeleteModal(quiz)">
                <Icon name="tabler:trash" class="text-sm" />
                {{ $t('quiz.management.delete') }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <a-modal v-model:open="deleteModalVisible" :title="$t('quiz.management.deleteConfirm.title')" :width="480" centered
      @cancel="hideDeleteModal">
      <template #footer>
        <div class="flex justify-end gap-3">
          <a-button @click="hideDeleteModal">
            {{ $t('quiz.management.deleteConfirm.cancel') }}
          </a-button>
          <a-button type="primary" danger @click="confirmDeleteQuiz" :loading="loading">
            {{ $t('quiz.management.deleteConfirm.confirm') }}
          </a-button>
        </div>
      </template>

      <div class="py-4">
        <div class="flex items-start gap-4">
          <!-- Warning Icon -->
          <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="tabler:alert-triangle" class="text-xl text-red-600" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ $t('quiz.management.deleteConfirm.message') }}
            </h3>

            <div v-if="quizToDelete" class="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 class="font-medium text-gray-900 mb-2">{{ quizToDelete.title }}</h4>
              <div class="text-sm text-gray-600 space-y-1">
                <p><span class="font-medium">Questions:</span> {{ quizToDelete.total_questions }}</p>
                <p><span class="font-medium">Status:</span>
                  <span :class="quizToDelete.is_published ? 'text-green-600' : 'text-orange-600'">
                    {{ quizToDelete.is_published ? $t('quiz.management.published') : $t('quiz.management.draft') }}
                  </span>
                </p>
                <p v-if="quizToDelete.description" class="text-gray-500 mt-2">
                  {{ quizToDelete.description }}
                </p>
              </div>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-sm text-red-700">
                <Icon name="tabler:info-circle" class="inline mr-1" />
                <strong>Warning:</strong> {{ $t('quiz.management.deleteConfirm.warning') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
