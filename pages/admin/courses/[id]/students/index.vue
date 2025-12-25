<script setup lang="ts">
import type { User } from '~/types/auth.type'
import type { CourseStudent } from '~/types/course.type'
import { message } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

const { t } = useI18n()

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

// Get course ID from route
const route = useRoute()
const courseId = route.params.id as string

// Set page title
useHead({
  title: t('admin.students.title'),
})

// Use course API
const courseApi = useCourseApi()

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Course students data
const students = ref<CourseStudent[]>([])

// Load course students
async function loadStudents() {
  try {
    loading.value = true
    error.value = null
    const response = await courseApi.getCourseStudents(courseId)
    students.value = response.results
    total.value = response.count
  }
  catch (err: any) {
    console.error('Error loading course students:', err)
    error.value = err.message || 'Failed to load students'
    message.error('Failed to load students')
  }
  finally {
    loading.value = false
  }
}

// Computed properties
const filteredStudents = computed(() => {
  let filtered = students.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student =>
      student.first_name.toLowerCase().includes(query)
      || student.last_name.toLowerCase().includes(query)
      || student.email.toLowerCase().includes(query)
      || student.username.toLowerCase().includes(query),
    )
  }

  return filtered
})

// Statistics computed properties
const totalStudents = computed(() => students.value.length)
const activeStudents = computed(() => students.value.filter(s => s.enrollment.is_active).length)
const averageProgress = computed(() => {
  if (students.value.length === 0)
    return 0
  const totalProgress = students.value.reduce((sum, s) => sum + s.enrollment.completion_percentage, 0)
  return Math.round(totalProgress / students.value.length)
})
const recentActivity = computed(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return students.value.filter(s => new Date(s.enrollment.enrolled_at) > oneWeekAgo).length
})

// Table columns
const columns = [
  {
    title: t('admin.students.table.columns.student'),
    key: 'student',
    width: 300,
  },
  {
    title: t('admin.students.table.columns.classroom'),
    key: 'classroom',
    width: 200,
  },
  {
    title: t('admin.students.table.columns.progress'),
    key: 'progress',
    width: 150,
  },
  {
    title: t('admin.students.table.columns.enrolled'),
    key: 'enrolled',
    width: 140,
  },
  {
    title: t('admin.students.table.columns.actions'),
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
]

// Methods
function getProgressColor(progress: number) {
  if (progress >= 80)
    return 'bg-green-500'
  if (progress >= 50)
    return 'bg-blue-500'
  if (progress >= 25)
    return 'bg-yellow-500'
  return 'bg-red-500'
}

function getStatusBadge(status: string, isActive: boolean) {
  if (!isActive) {
    return {
      text: t('admin.students.table.status.disabled'),
      class: 'bg-red-100 text-red-800 border-red-200',
    }
  }

  switch (status.toLowerCase()) {
    case 'completed':
      return {
        text: t('admin.students.table.status.completed'),
        class: 'bg-green-100 text-green-800 border-green-200',
      }
    case 'in_progress':
      return {
        text: t('admin.students.table.status.active'),
        class: 'bg-blue-100 text-blue-800 border-blue-200',
      }
    case 'not_started':
      return {
        text: t('admin.students.table.status.enrolled'),
        class: 'bg-gray-100 text-gray-800 border-gray-200',
      }
    default:
      return {
        text: t('admin.students.table.status.active'),
        class: 'bg-blue-100 text-blue-800 border-blue-200',
      }
  }
}

function formatDate(dateString: string) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEnrolledDate(dateString: string) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function refreshStudents() {
  loadStudents()
  message.success(t('admin.students.messages.refreshSuccess'))
}

function viewStudentProgress(student: CourseStudent) {
  message.info(t('admin.students.messages.viewProgressMessage', { name: student.full_name }))
  // TODO: Navigate to student progress page
  // navigateTo(`/admin/courses/${courseId}/students/${student.id}/progress`)
}

function removeStudent(student: CourseStudent) {
  message.info(t('admin.students.messages.removeStudentMessage', { name: student.full_name }))
  // TODO: Implement remove student functionality
  // This would require a new API endpoint
}

async function disableStudent(student: CourseStudent) {
  try {
    await courseApi.disableStudent(courseId, student.id.toString())
    message.success(t('admin.students.messages.disableStudentSuccess', { name: student.full_name }))
    // Refresh the students list to update the status
    await loadStudents()
  }
  catch (err: any) {
    console.error('Error disabling student:', err)
    message.error(t('admin.students.messages.disableStudentError'))
  }
}

async function enableStudent(student: CourseStudent) {
  try {
    await courseApi.enableStudent(courseId, student.id.toString())
    message.success(t('admin.students.messages.enableStudentSuccess', { name: student.full_name }))
    // Refresh the students list to update the status
    await loadStudents()
  }
  catch (err: any) {
    console.error('Error enabling student:', err)
    message.error(t('admin.students.messages.enableStudentError'))
  }
}

function handleTableChange(pagination: any) {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
}

// Load data on mount
onMounted(() => {
  loadStudents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 px-0 pt-0 max-md:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Icon name="solar:users-group-rounded-bold-duotone" size="28" class="text-white" />
            </div>
            {{ t('admin.students.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ t('admin.students.description') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a-button class="rounded-lg gap-1 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800" @click="refreshStudents">
            <template #icon>
              <Icon name="solar:refresh-bold" size="18" />
            </template>
            {{ t('admin.students.actions.refresh') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Total Students -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-blue-50 rounded-lg size-12">
            <Icon name="solar:users-group-rounded-bold-duotone" size="24" class="text-blue-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ totalStudents }}
        </div>
        <div class="text-sm text-gray-600">
          {{ t('admin.students.stats.totalStudents') }}
        </div>
      </div>

      <!-- Active Students -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-green-50 rounded-lg size-12">
            <Icon name="solar:check-circle-bold-duotone" size="24" class="text-green-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ activeStudents }}
        </div>
        <div class="text-sm text-gray-600">
          {{ t('admin.students.stats.activeStudents') }}
        </div>
      </div>

      <!-- Average Progress -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-purple-50 rounded-lg size-12">
            <Icon name="solar:chart-bold-duotone" size="24" class="text-purple-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ averageProgress }}%
        </div>
        <div class="text-sm text-gray-600">
          {{ t('admin.students.stats.averageProgress') }}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-orange-50 rounded-lg size-12">
            <Icon name="solar:clock-circle-bold-duotone" size="24" class="text-orange-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ recentActivity }}
        </div>
        <div class="text-sm text-gray-600">
          {{ t('admin.students.stats.recentEnrollments') }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
      <div class="flex flex-col lg:flex-row gap-4 items-center">
        <div class="flex-1 w-full">
          <div class="relative">
            <Icon name="solar:magnifer-linear" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="18" />
            <a-input
              v-model:value="searchQuery"
              :placeholder="t('admin.students.filters.searchPlaceholder')"
              size="large"
              allow-clear
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-white rounded-xl border border-red-200 shadow-sm p-6 mb-6">
      <div class="text-center">
        <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ t('admin.students.error.title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ error }}
        </p>
        <a-button type="primary" @click="loadStudents">
          {{ t('admin.students.error.tryAgain') }}
        </a-button>
      </div>
    </div>

    <!-- Students Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="filteredStudents"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total: number) => t('admin.students.table.totalStudents', { total }),
        }"
        :scroll="{ x: 1200 }"
        row-key="id"
        class="custom-table"
        @change="handleTableChange"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:users-group-rounded-bold-duotone" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ t('admin.students.table.emptyState.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ t('admin.students.table.emptyState.description') }}
            </p>
            <a-button class="rounded-lg" @click="searchQuery = ''">
              {{ t('admin.students.table.emptyState.clearSearch') }}
            </a-button>
          </div>
        </template>

        <!-- Table Body Cells -->
        <template #bodyCell="{ column, record }">
          <!-- Student Column -->
          <template v-if="column.key === 'student'">
            <div class="flex items-center gap-3">
              <a-avatar
                :size="48"
                class="!font-bold"
              >
                {{ record.full_name.charAt(0) }}
              </a-avatar>
              <div>
                <div class="font-semibold text-gray-900">
                  {{ record.first_name }} {{ record.last_name }}
                </div>
                <div class="text-gray-500 text-sm">
                  {{ record.email }}
                </div>
                <div class="text-gray-400 text-xs">
                  @{{ record.username }}
                </div>
              </div>
            </div>
          </template>

          <!-- Classroom Column -->
          <template v-else-if="column.key === 'classroom'">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="solar:home-bold" size="16" class="text-blue-600" />
              </div>
              <div>
                <div class="font-medium text-gray-900 text-sm">
                  {{ record.enrollment.classroom_title }}
                </div>
              </div>
            </div>
          </template>

          <!-- Progress Column -->
          <template v-else-if="column.key === 'progress'">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-gray-900">{{ Math.round(record.enrollment.completion_percentage) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressColor(record.enrollment.completion_percentage)"
                    :style="{ width: `${record.enrollment.completion_percentage}%` }"
                  />
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ record.enrollment.progress_status }}
                </div>
              </div>
            </div>
          </template>

          <!-- Enrolled Column -->
          <template v-else-if="column.key === 'enrolled'">
            <div class="text-sm">
              <div class="text-gray-900 mb-2">
                {{ formatEnrolledDate(record.enrollment.enrolled_at) }}
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="getStatusBadge(record.enrollment.progress_status, record.enrollment.is_active).class"
                >
                  {{ getStatusBadge(record.enrollment.progress_status, record.enrollment.is_active).text }}
                </span>
              </div>
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <a-dropdown :trigger="['click']">
              <a-button type="text" size="small">
                <Icon name="solar:menu-dots-bold" size="20" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item
                    key="progress"
                    @click="viewStudentProgress(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:chart-bold" size="16" />
                      {{ t('admin.students.actions.viewProgress') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item
                    v-if="record.enrollment.is_active"
                    key="disable"
                    @click="disableStudent(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:user-blocked-bold" size="16" />
                      {{ t('admin.students.actions.disableStudent') }}
                    </div>
                  </a-menu-item>
                  <a-menu-item
                    v-else
                    key="enable"
                    @click="enableStudent(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:user-check-bold" size="16" />
                      {{ t('admin.students.actions.enableStudent') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item
                    key="remove"
                    danger
                    @click="removeStudent(record)"
                  >
                    <div class="flex items-center w-full gap-2">
                      <Icon name="solar:user-minus-bold" size="16" />
                      {{ t('admin.students.actions.removeFromCourse') }}
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
/* Custom table styles */
:deep(.custom-table) {
  .ant-pagination {
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
}
</style>
