<script setup lang="ts">
import type { RecentSubmission } from '~/composables/api/useQuizApi'
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
const { getRecentSubmissions, getSubmissionsByClassroom } = useQuizApi()
const { getClassrooms } = useClassroomApi()

// State
const submissions = ref<RecentSubmission[]>([])
const classrooms = ref<Classroom[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filters
const selectedClassroom = ref<string>(selectedClassroomId || '')
const statusFilter = ref<string>('')
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// Computed
const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  // Only show submissions that are completed and don't have pending essays
  filtered = filtered.filter(submission => 
    submission.status === 'completed' && !submission.has_pending_essays
  )

  if (statusFilter.value) {
    filtered = filtered.filter(submission => submission.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(submission => 
      submission.student_name.toLowerCase().includes(query) ||
      submission.quiz_title.toLowerCase().includes(query)
    )
  }

  return filtered
})

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đang làm', value: 'in_progress' },
  { label: 'Hết hạn', value: 'expired' }
]

// Methods
const loadSubmissions = async () => {
  try {
    loading.value = true
    error.value = null

    let response
    if (selectedClassroom.value) {
      response = await getSubmissionsByClassroom(selectedClassroom.value)
    } else {
      response = await getRecentSubmissions()
    }
    
    submissions.value = response.results
    total.value = response.count
  } catch (err: any) {
    error.value = err.message || 'Failed to load submissions'
    console.error('Error loading submissions:', err)
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
  currentPage.value = 1
  loadSubmissions()
}

const handleStatusChange = () => {
  currentPage.value = 1
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'in_progress':
      return 'text-blue-600 bg-blue-100'
    case 'expired':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành'
    case 'in_progress':
      return 'Đang làm'
    case 'expired':
      return 'Hết hạn'
    default:
      return status
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadClassrooms(),
    loadSubmissions()
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
          <h1 class="text-2xl font-bold text-gray-900">Danh sách bài làm</h1>
          <p class="text-gray-600">Xem tất cả bài làm của học sinh</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
          <a-select
            v-model:value="statusFilter"
            placeholder="Chọn trạng thái"
            class="w-full"
            @change="handleStatusChange"
          >
            <a-select-option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <a-input
            v-model:value="searchQuery"
            placeholder="Tìm theo tên học sinh hoặc quiz..."
            class="w-full"
          >
            <template #prefix>
              <Icon name="tabler:search" class="text-gray-400" />
            </template>
          </a-input>
        </div>

        <div class="flex items-end">
          <a-button type="primary" @click="loadSubmissions" :loading="loading">
            Làm mới
          </a-button>
        </div>
      </div>
    </div>

    <!-- Submissions List -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Danh sách bài làm ({{ filteredSubmissions.length }})
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
          <a-button type="primary" @click="loadSubmissions" class="mt-4">
            Thử lại
          </a-button>
        </div>
      </div>

      <!-- Submissions List -->
      <div v-else-if="filteredSubmissions.length > 0" class="divide-y divide-gray-200">
        <div
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="text-lg font-medium text-gray-900">{{ submission.quiz_title }}</h4>
                <span
                  :class="getStatusColor(submission.status)"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(submission.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">
                Học sinh: <span class="font-medium">{{ submission.student_name }}</span>
              </p>
              <p class="text-sm text-gray-500">
                Bắt đầu: {{ formatDate(submission.started_at) }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-lg font-semibold text-gray-900">{{ submission.total_score }}/{{ submission.max_score }}</div>
                <div class="text-sm text-gray-500">Điểm số</div>
              </div>
              <div class="flex gap-2">
                <NuxtLink :to="`/admin/quiz-management/submission/${submission.id}`">
                  <a-button type="link" size="small">
                    Xem chi tiết
                  </a-button>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-6">
        <div class="text-center py-8">
          <Icon name="tabler:clipboard-list" class="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Không có bài làm nào</h3>
          <p class="text-gray-500">Chưa có bài làm nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      </div>
    </div>
  </div>
</template>
