<script setup lang="ts">
import type { EssayGrading, RecentSubmission } from '~/composables/api/useQuizApi'
import type { Classroom } from '~/types/course.type'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import { useQuizApi } from '~/composables/api/useQuizApi'

definePageMeta({
  layout: 'admin',
})

// API composables
const { getRecentSubmissions, getEssayGradingsNeedingGrading } = useQuizApi()
const { getClassrooms } = useClassroomApi()

// State
const recentSubmissions = ref<RecentSubmission[]>([])
const pendingEssays = ref<EssayGrading[]>([])
const needsGradingSubmissions = ref<EssayGrading[]>([])
const classrooms = ref<Classroom[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filters
const selectedClassroom = ref<string>('')
const showNeedsGrading = ref(false)

// Computed
const filteredSubmissions = computed(() => {
  return needsGradingSubmissions.value
})

const pendingEssaysCount = computed(() => pendingEssays.value.length)

// Methods
async function loadRecentSubmissions() {
  try {
    loading.value = true
    error.value = null

    const params: any = {}
    if (selectedClassroom.value) {
      params.classroom_id = selectedClassroom.value
    }
    if (showNeedsGrading.value) {
      params.needs_grading = true
    }

    const response = await getRecentSubmissions(params)
    recentSubmissions.value = response.results
  }
  catch (err: any) {
    error.value = err.message || 'Failed to load recent submissions'
    console.error('Error loading recent submissions:', err)
  }
  finally {
    loading.value = false
  }
}

async function loadPendingEssays() {
  try {
    const response = await getEssayGradingsNeedingGrading(selectedClassroom.value || undefined)
    pendingEssays.value = response.results
  }
  catch (err: any) {
    console.error('Error loading pending essays:', err)
  }
}

async function loadNeedsGradingSubmissions() {
  try {
    const response = await getEssayGradingsNeedingGrading(selectedClassroom.value || undefined)
    needsGradingSubmissions.value = response.results
  }
  catch (err: any) {
    console.error('Error loading needs grading submissions:', err)
  }
}

async function loadClassrooms() {
  try {
    const response = await getClassrooms()
    classrooms.value = response.results || []
  }
  catch (err: any) {
    console.error('Error loading classrooms:', err)
  }
}

function handleClassroomChange() {
  loadRecentSubmissions()
  loadPendingEssays()
  loadNeedsGradingSubmissions()
}

function handleNeedsGradingToggle() {
  loadRecentSubmissions()
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string) {
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

function getStatusText(status: string) {
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
    loadRecentSubmissions(),
    loadPendingEssays(),
    loadNeedsGradingSubmissions(),
  ])
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Quản lý Quiz
      </h1>
      <p class="text-gray-600">
        Theo dõi và chấm điểm các bài làm của học sinh
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <Icon name="tabler:clipboard-list" class="text-blue-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              Tổng bài làm
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ recentSubmissions.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-100 rounded-lg">
            <Icon name="tabler:file-text" class="text-yellow-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              Bài cần chấm
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ pendingEssaysCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <Icon name="tabler:check-circle" class="text-green-600 text-xl" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              Đã hoàn thành
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ recentSubmissions.filter(s => s.status === 'completed').length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Bộ lọc
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Lớp học</label>
          <a-select
            v-model:value="selectedClassroom"
            placeholder="Chọn lớp học"
            class="w-full"
            @change="handleClassroomChange"
          >
            <a-select-option value="">
              Tất cả lớp học
            </a-select-option>
            <a-select-option
              v-for="classroom in classrooms"
              :key="classroom.id"
              :value="classroom.id"
            >
              {{ classroom.title }}
            </a-select-option>
          </a-select>
        </div>

        <div class="flex items-end">
          <a-checkbox v-model:checked="showNeedsGrading" @change="handleNeedsGradingToggle">
            Chỉ hiện bài cần chấm
          </a-checkbox>
        </div>

        <div class="flex items-end">
          <a-button type="primary" :loading="loading" @click="loadRecentSubmissions">
            Làm mới
          </a-button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Thao tác nhanh
      </h3>
      <div class="flex gap-4">
        <NuxtLink :to="`/admin/quiz-management/essay-grading${selectedClassroom ? `?classroom=${selectedClassroom}` : ''}`">
          <a-button
            type="primary"
            :disabled="pendingEssaysCount === 0"
          >
            <template #icon>
              <Icon name="tabler:file-text" />
            </template>
            Chấm bài tự luận ({{ pendingEssaysCount }})
          </a-button>
        </NuxtLink>

        <NuxtLink :to="`/admin/quiz-management/submissions${selectedClassroom ? `?classroom=${selectedClassroom}` : ''}`">
          <a-button type="default">
            <template #icon>
              <Icon name="tabler:clipboard-list" />
            </template>
            Xem tất cả bài làm
          </a-button>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Bài làm cần chấm
          </h3>
          <NuxtLink :to="`/admin/quiz-management/submissions${selectedClassroom ? `?classroom=${selectedClassroom}` : ''}`">
            <a-button type="link">
              Xem tất cả
            </a-button>
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span class="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6">
        <div class="text-center py-8">
          <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
          <p class="text-red-600">
            {{ error }}
          </p>
          <a-button type="primary" class="mt-4" @click="loadRecentSubmissions">
            Thử lại
          </a-button>
        </div>
      </div>

      <!-- Submissions List -->
      <div v-else-if="filteredSubmissions.length > 0" class="divide-y divide-gray-200">
        <div
          v-for="submission in filteredSubmissions.slice(0, 10)"
          :key="submission.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="text-lg font-medium text-gray-900">
                  {{ submission.quiz_title }}
                </h4>
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Cần chấm
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">
                Học sinh: <span class="font-medium">{{ submission.student_name }}</span>
              </p>
              <p class="text-sm text-gray-500 mb-2">
                Câu hỏi: {{ submission.question_prompt }}
              </p>
              <p class="text-sm text-gray-500">
                Tạo: {{ formatDate(submission.created_at) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold text-gray-900">
                0/{{ submission.max_score }}
              </span>
              <NuxtLink :to="`/admin/quiz-management/essay-grading-teacher/${submission.id}`">
                <a-button type="primary" size="small">
                  Chấm bài
                </a-button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-6">
        <div class="text-center py-8">
          <Icon name="tabler:file-text" class="text-gray-400 text-4xl mx-auto mb-4" />
          <p class="text-gray-500">
            Không có bài làm nào cần chấm
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
