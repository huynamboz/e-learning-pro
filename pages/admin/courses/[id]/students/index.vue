<script setup lang="ts">
import type { User } from '~/types/auth.type'
import { message } from 'ant-design-vue'

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
  title: 'Course Students',
})

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// Extended interface for course students
interface CourseStudent extends User {
  enrollment: {
    id: string
    enrolled_at: string
    progress: number
    last_accessed: string
    classroom: {
      id: string
      title: string
      schedule_summary: string
    }
  }
}

// Mock course students data
const students = ref<CourseStudent[]>([
  {
    id: 1,
    email: 'student1@elearning.com',
    username: 'student_nguyen',
    first_name: 'Nguyễn',
    last_name: 'Văn A',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-02-10T00:00:00Z',
    enrollment: {
      id: '1',
      enrolled_at: '2024-02-12T00:00:00Z',
      progress: 75,
      last_accessed: '2024-03-15T10:30:00Z',
      classroom: {
        id: '1',
        title: 'Lớp A1 - Sáng thứ 2,4,6',
        schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
      }
    }
  },
  {
    id: 2,
    email: 'student2@elearning.com',
    username: 'student_tran',
    first_name: 'Trần',
    last_name: 'Thị B',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-02-15T00:00:00Z',
    enrollment: {
      id: '2',
      enrolled_at: '2024-02-16T00:00:00Z',
      progress: 45,
      last_accessed: '2024-03-14T14:20:00Z',
      classroom: {
        id: '1',
        title: 'Lớp A1 - Sáng thứ 2,4,6',
        schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
      }
    }
  },
  {
    id: 5,
    email: 'student5@elearning.com',
    username: 'student_hoang',
    first_name: 'Hoàng',
    last_name: 'Văn E',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-03-01T00:00:00Z',
    enrollment: {
      id: '3',
      enrolled_at: '2024-03-02T00:00:00Z',
      progress: 90,
      last_accessed: '2024-03-15T16:45:00Z',
      classroom: {
        id: '1',
        title: 'Lớp A1 - Sáng thứ 2,4,6',
        schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
      }
    }
  },
  {
    id: 6,
    email: 'student6@elearning.com',
    username: 'student_vo',
    first_name: 'Võ',
    last_name: 'Thị F',
    is_teacher: false,
    is_verified: false,
    role: 'user',
    createdAt: '2024-03-05T00:00:00Z',
    enrollment: {
      id: '4',
      enrolled_at: '2024-03-06T00:00:00Z',
      progress: 20,
      last_accessed: '2024-03-10T09:15:00Z',
      classroom: {
        id: '1',
        title: 'Lớp A1 - Sáng thứ 2,4,6',
        schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
      }
    }
  },
])

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

// Update total when filtered students change
watch(filteredStudents, (newFiltered) => {
  total.value = newFiltered.length
}, { immediate: true })

// Table columns
const columns = [
  {
    title: 'Student',
    key: 'student',
    width: 300,
  },
  {
    title: 'Classroom',
    key: 'classroom',
    width: 200,
  },
  {
    title: 'Progress',
    key: 'progress',
    width: 150,
  },
  {
    title: 'Last Accessed',
    key: 'last_accessed',
    width: 180,
  },
  {
    title: 'Enrolled',
    key: 'enrolled',
    width: 140,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
]

// Methods
function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-blue-500'
  if (progress >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEnrolledDate(dateString: string) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function refreshStudents() {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    message.success('Students refreshed successfully')
  }, 1000)
}

function viewStudentProgress(student: CourseStudent) {
  message.info(`View progress for ${student.first_name} ${student.last_name}`)
}

function removeStudent(student: CourseStudent) {
  message.info(`Remove ${student.first_name} ${student.last_name} from course`)
}

function handleTableChange(pagination: any) {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 px-0 pt-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Icon name="solar:users-group-rounded-bold-duotone" size="28" class="text-white" />
            </div>
            Course Students
          </h1>
          <p class="text-gray-600 mt-1">
            Manage students enrolled in this course
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a-button @click="refreshStudents" class="rounded-lg gap-1 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800">
            <template #icon>
              <Icon name="solar:refresh-bold" size="18" />
            </template>
            Refresh
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
          {{ students.length }}
        </div>
        <div class="text-sm text-gray-600">
          Total Students
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
          {{ students.filter(s => s.is_verified).length }}
        </div>
        <div class="text-sm text-gray-600">
          Active Students
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
          {{ Math.round(students.reduce((sum, s) => sum + s.enrollment.progress, 0) / students.length) }}%
        </div>
        <div class="text-sm text-gray-600">
          Avg Progress
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
          {{ students.filter(s => new Date(s.enrollment.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length }}
        </div>
        <div class="text-sm text-gray-600">
          Active This Week
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
              placeholder="Search students by name, email, or username..."
              size="large"
              allow-clear
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="filteredStudents"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total: number) => `Total Students: ${total}`,
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
              No students found
            </h3>
            <p class="text-gray-500 mb-4">
              Try adjusting your search criteria
            </p>
            <a-button @click="searchQuery = ''" class="rounded-lg">
              Clear Search
            </a-button>
          </div>
        </template>

        <!-- Table Body Cells -->
        <template #bodyCell="{ column, record }">
          <!-- Student Column -->
          <template v-if="column.key === 'student'">
            <div class="flex items-center gap-3">
              <a-avatar 
                :src="record.avatar" 
                :size="48"
                class="!bg-gradient-to-br !from-blue-500 !to-purple-600 !text-white !font-bold"
              >
                {{ record.first_name.charAt(0) }}{{ record.last_name.charAt(0) }}
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
                  {{ record.enrollment.classroom.title }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ record.enrollment.classroom.schedule_summary }}
                </div>
              </div>
            </div>
          </template>

          <!-- Progress Column -->
          <template v-else-if="column.key === 'progress'">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-gray-900">{{ record.enrollment.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressColor(record.enrollment.progress)"
                    :style="{ width: `${record.enrollment.progress}%` }"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Last Accessed Column -->
          <template v-else-if="column.key === 'last_accessed'">
            <div class="text-sm">
              <div class="text-gray-900">
                {{ formatDate(record.enrollment.last_accessed) }}
              </div>
            </div>
          </template>

          <!-- Enrolled Column -->
          <template v-else-if="column.key === 'enrolled'">
            <div class="text-sm">
              <div class="text-gray-900">
                {{ formatEnrolledDate(record.enrollment.enrolled_at) }}
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
                      View Progress
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
                      Remove from Course
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