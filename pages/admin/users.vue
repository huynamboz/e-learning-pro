<script setup lang="ts">
import type { User } from '~/types/auth.type'
import type { StudentWithStats } from '~/types/course.type'
import { useCourseApi } from '~/composables/api/useCourseApi'
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

// Set page title
useHead({
  title: 'Student Management',
})

// i18n
const { t } = useI18n()

// Use course API
const courseApi = useCourseApi()

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Students data from API
const users = ref<StudentWithStats[]>([])

// Load all students
const loadStudents = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await courseApi.getAllStudents()
    users.value = response.results
    total.value = response.count
  } catch (err: any) {
    console.error('Error loading students:', err)
    error.value = err.message || 'Failed to load students'
    message.error('Failed to load students')
  } finally {
    loading.value = false
  }
}

// Mock data for demonstration (keeping for reference)
const mockUsers = ref([
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
    enrolled_courses: [
      {
        course: {
          id: '1',
          title: 'Italian for Beginners',
          teacher_name: 'Maria Rossi'
        },
        classroom: {
          id: '1',
          title: 'Lớp A1 - Sáng thứ 2,4,6',
          schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
        },
        enrolled_at: '2024-02-12T00:00:00Z'
      },
      {
        course: {
          id: '2',
          title: 'Advanced Italian Grammar',
          teacher_name: 'Giuseppe Verdi'
        },
        classroom: {
          id: '2',
          title: 'Lớp B2 - Chiều thứ 3,5',
          schedule_summary: 'Tue, Thu 14:00-16:00'
        },
        enrolled_at: '2024-03-01T00:00:00Z'
      }
    ]
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
    enrolled_courses: [
      {
        course: {
          id: '1',
          title: 'Italian for Beginners',
          teacher_name: 'Maria Rossi'
        },
        classroom: {
          id: '1',
          title: 'Lớp A1 - Sáng thứ 2,4,6',
          schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
        },
        enrolled_at: '2024-02-16T00:00:00Z'
      }
    ]
  },
  {
    id: 3,
    email: 'student3@elearning.com',
    username: 'student_le',
    first_name: 'Lê',
    last_name: 'Văn C',
    is_teacher: false,
    is_verified: false,
    role: 'user',
    createdAt: '2024-02-20T00:00:00Z',
    enrolled_courses: []
  },
  {
    id: 4,
    email: 'student4@elearning.com',
    username: 'student_pham',
    first_name: 'Phạm',
    last_name: 'Thị D',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-02-25T00:00:00Z',
    enrolled_courses: [
      {
        course: {
          id: '3',
          title: 'Italian Conversation Practice',
          teacher_name: 'Anna Bianchi'
        },
        classroom: {
          id: '3',
          title: 'Lớp C1 - Tối thứ 2,4',
          schedule_summary: 'Mon, Wed 19:00-21:00'
        },
        enrolled_at: '2024-02-28T00:00:00Z'
      }
    ]
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
    enrolled_courses: [
      {
        course: {
          id: '1',
          title: 'Italian for Beginners',
          teacher_name: 'Maria Rossi'
        },
        classroom: {
          id: '1',
          title: 'Lớp A1 - Sáng thứ 2,4,6',
          schedule_summary: 'Mon, Wed, Fri 9:00-11:00'
        },
        enrolled_at: '2024-03-02T00:00:00Z'
      },
      {
        course: {
          id: '2',
          title: 'Advanced Italian Grammar',
          teacher_name: 'Giuseppe Verdi'
        },
        classroom: {
          id: '2',
          title: 'Lớp B2 - Chiều thứ 3,5',
          schedule_summary: 'Tue, Thu 14:00-16:00'
        },
        enrolled_at: '2024-03-05T00:00:00Z'
      },
      {
        course: {
          id: '3',
          title: 'Italian Conversation Practice',
          teacher_name: 'Anna Bianchi'
        },
        classroom: {
          id: '3',
          title: 'Lớp C1 - Tối thứ 2,4',
          schedule_summary: 'Mon, Wed 19:00-21:00'
        },
        enrolled_at: '2024-03-08T00:00:00Z'
      }
    ]
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
    enrolled_courses: [
      {
        course: {
          id: '2',
          title: 'Advanced Italian Grammar',
          teacher_name: 'Giuseppe Verdi'
        },
        classroom: {
          id: '2',
          title: 'Lớp B2 - Chiều thứ 3,5',
          schedule_summary: 'Tue, Thu 14:00-16:00'
        },
        enrolled_at: '2024-03-06T00:00:00Z'
      }
    ]
  },
  {
    id: 7,
    email: 'student7@elearning.com',
    username: 'student_dang',
    first_name: 'Đặng',
    last_name: 'Văn G',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-03-10T00:00:00Z',
    enrolled_courses: [
      {
        course: {
          id: '3',
          title: 'Italian Conversation Practice',
          teacher_name: 'Anna Bianchi'
        },
        classroom: {
          id: '3',
          title: 'Lớp C1 - Tối thứ 2,4',
          schedule_summary: 'Mon, Wed 19:00-21:00'
        },
        enrolled_at: '2024-03-12T00:00:00Z'
      }
    ]
  },
  {
    id: 8,
    email: 'student8@elearning.com',
    username: 'student_bui',
    first_name: 'Bùi',
    last_name: 'Thị H',
    is_teacher: false,
    is_verified: true,
    role: 'user',
    createdAt: '2024-03-15T00:00:00Z',
    enrolled_courses: []
  },
])

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.first_name.toLowerCase().includes(query)
      || user.last_name.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.username.toLowerCase().includes(query),
    )
  }

  return filtered
})

// Statistics computed properties
const totalStudents = computed(() => users.value.length)
const activeStudents = computed(() => users.value.reduce((sum, u) => sum + u.stats.active_courses, 0))
const completedStudents = computed(() => users.value.reduce((sum, u) => sum + u.stats.completed_courses, 0))

// Table columns
const columns = [
  {
    title: t('admin.users.table.student'),
    key: 'user',
    width: 300,
  },
  {
    title: t('admin.users.table.enrolledCourses'),
    key: 'courses',
    width: 400,
  },
  {
    title: t('admin.users.table.status'),
    key: 'status',
    width: 140,
  },
  {
    title: t('admin.users.table.joined'),
    key: 'joined',
    width: 180,
  },
  {
    title: t('admin.users.table.actions'),
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
]

// Methods
function getRoleTagColor(role: string | undefined) {
  switch (role) {
    case 'admin':
      return 'red'
    case 'teacher':
      return 'blue'
    case 'user':
    default:
      return 'default'
  }
}

function getStatusTagColor(isVerified: boolean) {
  return isVerified ? 'green' : 'orange'
}

function getRoleBadgeClass(role: string | undefined) {
  const classes = {
    admin: 'bg-red-50 text-red-600 border-red-200',
    teacher: 'bg-blue-50 text-blue-600 border-blue-200',
    user: 'bg-purple-50 text-purple-600 border-purple-200',
  }
  return classes[role as keyof typeof classes] || 'bg-gray-50 text-gray-600 border-gray-200'
}

function getStatusBadgeClass(isVerified: boolean) {
  return isVerified 
    ? 'bg-green-50 text-green-600 border-green-200'
    : 'bg-orange-50 text-orange-600 border-orange-200'
}

function formatDate(dateString: string | undefined) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

function refreshUsers() {
  loadStudents()
  message.success(t('admin.users.messages.refreshSuccess'))
}

function editUser(user: StudentWithStats) {
  message.info(t('admin.users.messages.editUser', { name: user.full_name }))
}

function toggleUserStatus(user: StudentWithStats) {
  const action = user.stats.active_courses > 0 ? 'suspend' : 'activate'
  Modal.confirm({
    title: t(`admin.users.messages.confirm${action.charAt(0).toUpperCase() + action.slice(1)}.title`),
    content: t(`admin.users.messages.confirm${action.charAt(0).toUpperCase() + action.slice(1)}.content`, { name: user.full_name }),
    onOk() {
      // Note: This would need API call to actually update status
      message.success(t(`admin.users.messages.${action}Success`))
    },
  })
}

function deleteUser(user: StudentWithStats) {
  Modal.confirm({
    title: t('admin.users.messages.confirmDelete.title'),
    content: t('admin.users.messages.confirmDelete.content', { name: user.full_name }),
    okType: 'danger',
    onOk() {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
        message.success(t('admin.users.messages.deleteSuccess'))
      }
    },
  })
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
  <div class="admin-users p-6 bg-gray-50 min-h-screen max-md:px-0">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <Icon name="solar:users-group-rounded-bold-duotone" size="24" class="text-blue-600" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 !m-0">
            {{ t('admin.users.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ t('admin.users.subtitle') }}
          </p>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ t('admin.users.stats.totalStudents') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalStudents }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:users-group-rounded-bold-duotone" size="20" class="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ t('admin.users.stats.activeStudents') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ activeStudents }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:check-circle-bold-duotone" size="20" class="text-green-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ t('admin.users.stats.completedStudents') }}</p>
              <p class="text-2xl font-bold text-blue-600">{{ completedStudents }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:shield-check-bold-duotone" size="20" class="text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4 items-center">
        <div class="flex-1 w-full">
          <div class="relative">
            <Icon name="solar:magnifer-linear" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
            <a-input
              v-model:value="searchQuery"
              :placeholder="t('admin.users.search.placeholder')"
              size="large"
              class="!pl-10 !h-12 !rounded-lg"
            />
          </div>
        </div>
        
        <div class="w-full lg:w-auto">
          <a-button
            type="primary"
            size="large"
            :loading="loading"
            class="!h-12 !px-6 !rounded-lg !flex !items-center !gap-2"
            @click="refreshUsers"
          >
            <template #icon>
              <Icon name="solar:refresh-bold-duotone" size="18" />
            </template>
            {{ t('admin.users.actions.refresh') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-white rounded-xl border border-red-200 shadow-sm p-6 mb-6">
      <div class="text-center">
        <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ t('admin.users.error.title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ error }}
        </p>
        <a-button type="primary" @click="loadStudents">
          {{ t('admin.users.error.tryAgain') }}
        </a-button>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ t('admin.users.table.title') }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ t('admin.users.table.showing', { current: filteredUsers.length, total: totalStudents }) }}
            </p>
          </div>
          <!-- Add Student button hidden -->
          <!-- <div class="flex items-center gap-2">
            <a-button
              type="primary"
              size="large"
              class="!h-10 !px-4 !rounded-lg !flex !items-center !gap-2"
            >
              <template #icon>
                <Icon name="solar:user-plus-bold-duotone" size="16" />
              </template>
              Add Student
            </a-button>
          </div> -->
        </div>
      </div>
      
      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total: number) => t('admin.users.table.totalStudents', { total }),
        }"
        :scroll="{ x: 1400 }"
        row-key="id"
        class="custom-table"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:users-group-rounded-bold-duotone" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ t('admin.users.empty.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ t('admin.users.empty.subtitle') }}
            </p>
            <a-button @click="searchQuery = ''" class="rounded-lg">
              {{ t('admin.users.empty.clearSearch') }}
            </a-button>
          </div>
        </template>

        <!-- Table Body Cells -->
        <template #bodyCell="{ column, record }">
          <!-- User Column -->
          <template v-if="column.key === 'user'">
            <div class="flex items-center gap-3">
              <a-avatar 
                :size="48"
                class="!bg-gradient-to-br  !text-white !font-bold"
              >
                {{ record.full_name.charAt(0) }}
              </a-avatar>
              <div>
                <div class="font-semibold text-gray-900">
                  {{ record.full_name }}
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

          <!-- Courses Column -->
          <template v-else-if="column.key === 'courses'">
            <div class="space-y-2">
              <div class="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="solar:play-circle-bold" size="16" class="text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 text-sm line-clamp-1">
                    {{ t('admin.users.courses.count', { count: record.stats.total_courses }) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ t('admin.users.courses.active') }}: {{ record.stats.active_courses }} | {{ t('admin.users.courses.completed') }}: {{ record.stats.completed_courses }}
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ t('admin.users.courses.avgProgress') }}: {{ Math.round(record.stats.average_completion) }}%
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <div class="space-y-1">
              <span
                :class="record.stats.active_courses > 0 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'"
                class="px-2 py-1 rounded-full text-xs font-semibold border inline-block"
              >
                {{ record.stats.active_courses > 0 ? t('admin.users.status.active') : t('admin.users.status.inactive') }}
              </span>
              <div class="text-xs">
                <span 
                  :class="record.stats.completed_courses > 0 ? 'text-green-600' : 'text-blue-600'"
                  class="font-medium"
                >
                  {{ record.stats.completed_courses > 0 ? t('admin.users.status.hasCompleted') : t('admin.users.status.inProgress') }}
                </span>
              </div>
            </div>
          </template>

          <!-- Joined Column -->
          <template v-else-if="column.key === 'joined'">
            <div class="text-sm">
              <div class="text-gray-900">
                {{ t('admin.users.joined.studentId') }}: {{ record.id }}
              </div>
              <div class="text-xs text-gray-500">
                @{{ record.username }}
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
                    key="edit"
                    @click="editUser(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:pen-bold" size="16" />
                      {{ t('admin.users.actions.editUser') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item
                    key="toggle"
                    @click="toggleUserStatus(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon 
                        :name="record.stats.active_courses > 0 ? 'solar:pause-circle-bold' : 'solar:play-circle-bold'" 
                        size="16" 
                      />
                      {{ record.stats.active_courses > 0 ? t('admin.users.actions.suspend') : t('admin.users.actions.activate') }}
                    </div>
                  </a-menu-item>
                  <a-menu-item
                    key="delete"
                    danger
                    @click="deleteUser(record)"
                  >
                    <div class="flex items-center w-full gap-2">
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                      {{ t('admin.users.actions.deleteUser') }}
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

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
