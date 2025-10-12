<script setup lang="ts">
import type { QuizApiResponse } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import QuizCard from './QuizCard.vue'

interface Props {
  courseId: string
  chapterId?: string
}

const props = defineProps<Props>()

// API composable
const { getQuizzes } = useQuizApi()

// State
const quizzes = ref<QuizApiResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch quizzes for the course/chapter
const fetchQuizzes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params: any = {
      ordering: '-created_at'
    }
    
    if (props.chapterId) {
      params.chapter = props.chapterId
    }
    
    console.log('params', params)
    const response = await getQuizzes(params)
    quizzes.value = response.results
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch quizzes'
    console.error('Error fetching quizzes:', err)
  } finally {
    loading.value = false
  }
}

// Watch for chapter changes
watch(() => props.chapterId, () => {
  fetchQuizzes()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  fetchQuizzes()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">Loading quizzes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2">
        <Icon name="tabler:alert-circle" class="text-red-500" />
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="quizzes.length === 0" class="text-center py-8">
      <Icon name="mingcute:question-line" class="text-4xl text-gray-400 mx-auto mb-2" />
      <p class="text-gray-500">No quizzes available for this chapter yet.</p>
    </div>

    <!-- Quiz List -->
    <div v-else class="space-y-4">
      <QuizCard
        v-for="quiz in quizzes"
        :key="quiz.id"
        :quiz="quiz"
      />
    </div>
  </div>
</template>
