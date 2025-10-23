<script setup lang="ts">
import type { EssayGrading } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import type { Classroom } from '~/types/course.type'

definePageMeta({
  layout: 'admin',
})

// Route params
const route = useRoute()
const selectedClassroomId = route.query.classroom as string

// API composables
const { getEssayGradingsNeedingGrading } = useQuizApi()
const { getClassrooms } = useClassroomApi()

// State
const essayGradings = ref<EssayGrading[]>([])
const classrooms = ref<Classroom[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filters
const selectedClassroom = ref<string>(selectedClassroomId || '')
const searchQuery = ref('')

// Computed
const filteredEssays = computed(() => {
  let filtered = essayGradings.value

  if (selectedClassroom.value) {
    // Filter by classroom if needed
    // Note: This would need to be handled by API call with classroom_id parameter
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(essay => 
      essay.student_name.toLowerCase().includes(query) ||
      essay.quiz_title.toLowerCase().includes(query) ||
      essay.question_prompt.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const loadEssayGradings = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await getEssayGradingsNeedingGrading(selectedClassroom.value || undefined)
    essayGradings.value = response.results
  } catch (err: any) {
    error.value = err.message || 'Failed to load essay gradings'
    console.error('Error loading essay gradings:', err)
  } finally {
    loading.value = false
  }
}

const loadClassrooms = async () => {
  try {
    const response = await getClassrooms()
    classrooms.value = response.results || []
  } catch (err: any) {
    console.error('Error loading classrooms:', err)
  }
}

const handleClassroomChange = () => {
  loadEssayGradings()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text?.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadClassrooms(),
    loadEssayGradings()
  ])
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4 mb-4">
        <a-button type="text" @click="navigateTo('/admin/quiz-management')">
          <template #icon>
            <Icon name="tabler:arrow-left" />
          </template>
          Quay lại
        </a-button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Chấm bài tự luận</h1>
          <p class="text-gray-600">Chấm điểm và phản hồi cho các bài tự luận của học sinh</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <Icon name="tabler:file-text" class="text-yellow-600 text-xl" />
          <div>
            <h3 class="text-yellow-800 font-medium">Bài cần chấm</h3>
            <p class="text-yellow-700 text-sm">{{ filteredEssays.length }} bài tự luận đang chờ chấm điểm</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Lớp học</label>
          <a-select
            v-model:value="selectedClassroom"
            placeholder="Chọn lớp học"
            class="w-full"
            @change="handleClassroomChange"
          >
            <a-select-option value="">Tất cả lớp học</a-select-option>
            <a-select-option
              v-for="classroom in classrooms"
              :key="classroom.id"
              :value="classroom.id"
            >
              {{ classroom.title }}
            </a-select-option>
          </a-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <a-input
            v-model:value="searchQuery"
            placeholder="Tìm theo tên học sinh, quiz, hoặc câu hỏi..."
            class="w-full"
          >
            <template #prefix>
              <Icon name="tabler:search" class="text-gray-400" />
            </template>
          </a-input>
        </div>

        <div class="flex items-end">
          <a-button type="primary" @click="loadEssayGradings" :loading="loading">
            Làm mới
          </a-button>
        </div>
      </div>
    </div>

    <!-- Essay Gradings List -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Danh sách bài cần chấm ({{ filteredEssays.length }})
          </h3>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6">
        <div class="text-center py-8">
          <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
          <p class="text-red-600">{{ error }}</p>
          <a-button type="primary" @click="loadEssayGradings" class="mt-4">
            Thử lại
          </a-button>
        </div>
      </div>

      <!-- Essays List -->
      <div v-else-if="filteredEssays.length > 0" class="divide-y divide-gray-200">
        <div
          v-for="essay in filteredEssays"
          :key="essay.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h4 class="text-lg font-medium text-gray-900">{{ essay.quiz_title }}</h4>
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Cần chấm
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-600 mb-1">
                    <span class="font-medium">Học sinh:</span> {{ essay.student_name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Điểm tối đa:</span> {{ essay.max_score }} điểm
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Ngày nộp:</span> {{ formatDate(essay.created_at) }}
                  </p>
                </div>
              </div>

              <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</h5>
                <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {{ essay.question_prompt }}
                </p>
              </div>

              <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-700 mb-2">Câu trả lời của học sinh:</h5>
                <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p class="text-sm text-gray-900 whitespace-pre-wrap">
                    {{ essay.student_answer_text || essay.answer_text }}
                  </p>
                </div>
              </div>
            </div>

            <div class="ml-6 flex flex-col gap-2">
              <NuxtLink :to="`/admin/quiz-management/essay-grading-teacher/${essay.id}`"> 
                <a-button type="primary" class="w-full">
                <template #icon>
                  <Icon name="tabler:edit" />
                </template>
                Chấm điểm
              </a-button> 
            </NuxtLink>

              <!-- <a-button type="default" size="small" class="w-full">
                Xem chi tiết
              </a-button> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-6">
        <div class="text-center py-8">
          <Icon name="tabler:file-text" class="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Không có bài cần chấm</h3>
          <p class="text-gray-500">Tất cả bài tự luận đã được chấm điểm hoặc chưa có bài nào được nộp.</p>
        </div>
      </div>
    </div>
  </div>
</template>
