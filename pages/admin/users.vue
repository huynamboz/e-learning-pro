<script setup lang="ts">
import type { User } from '~/types/auth.type'
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

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// Extended User interface for students with course/classroom info
interface StudentWithCourses extends User {
  enrolled_courses: {
    course: {
      id: string
      title: string
      teacher_name: string
    }
    classroom: {
      id: string
      title: string
      schedule_summary: string
    }
    enrolled_at: string
  }[]
}

// Mock students data with course/classroom enrollment
const users = ref<StudentWithCourses[]>([
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

// Update total when filtered users change
watch(filteredUsers, (newFiltered) => {
  total.value = newFiltered.length
}, { immediate: true })

// Table columns
const columns = [
  {
    title: 'Student',
    key: 'user',
    width: 300,
  },
  {
    title: 'Enrolled Courses',
    key: 'courses',
    width: 400,
  },
  {
    title: 'Status',
    key: 'status',
    width: 140,
  },
  {
    title: 'Joined',
    key: 'joined',
    width: 180,
  },
  {
    title: 'Actions',
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
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    message.success('Users refreshed successfully')
  }, 1000)
}

function editUser(user: User) {
  message.info(`Edit user: ${user.first_name} ${user.last_name}`)
}

function toggleUserStatus(user: User) {
  const action = user.is_verified ? 'suspend' : 'activate'
  Modal.confirm({
    title: `Are you sure you want to ${action} this user?`,
    content: `This will ${action} ${user.first_name} ${user.last_name}`,
    onOk() {
      user.is_verified = !user.is_verified
      message.success(`User ${action}d successfully`)
    },
  })
}

function deleteUser(user: User) {
  Modal.confirm({
    title: 'Are you sure you want to delete this user?',
    content: `This will permanently delete ${user.first_name} ${user.last_name}`,
    okType: 'danger',
    onOk() {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
        message.success('User deleted successfully')
      }
    },
  })
}

function handleTableChange(pagination: any) {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
}
</script>

<template>
  <div class="admin-users p-6 bg-gray-50 min-h-screen">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <Icon name="solar:users-group-rounded-bold-duotone" size="24" class="text-blue-600" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900 !m-0">
            Student Management
          </h1>
          <p class="text-gray-600 mt-1">
            Manage student accounts and track their learning progress
          </p>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Students</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:users-group-rounded-bold-duotone" size="20" class="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Active Students</p>
              <p class="text-2xl font-bold text-green-600">{{ users.filter(u => u.is_verified).length }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:check-circle-bold-duotone" size="20" class="text-green-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Pending Verification</p>
              <p class="text-2xl font-bold text-orange-600">{{ users.filter(u => !u.is_verified).length }}</p>
            </div>
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon name="solar:clock-circle-bold-duotone" size="20" class="text-orange-600" />
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
              placeholder="Search students by name, email, or username..."
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
            Refresh
          </a-button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">All Students</h3>
            <p class="text-sm text-gray-600 mt-1">
              Showing {{ filteredUsers.length }} of {{ users.length }} students
            </p>
          </div>
          <div class="flex items-center gap-2">
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
          </div>
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
          showTotal: (total: number) => `Total Students: ${total}`,
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
          <!-- User Column -->
          <template v-if="column.key === 'user'">
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

          <!-- Courses Column -->
          <template v-else-if="column.key === 'courses'">
            <div class="space-y-2">
              <div v-if="record.enrolled_courses.length === 0" class="text-gray-400 text-sm italic">
                No courses enrolled
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="enrollment in record.enrolled_courses.slice(0, 2)" 
                  :key="enrollment.course.id"
                  class="flex items-start gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="solar:play-circle-bold" size="16" class="text-blue-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 text-sm line-clamp-1">
                      {{ enrollment.course.title }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ enrollment.classroom.title }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ enrollment.classroom.schedule_summary }}
                    </div>
                  </div>
                </div>
                <div v-if="record.enrolled_courses.length > 2" class="text-xs text-blue-600 font-medium">
                  +{{ record.enrolled_courses.length - 2 }} more courses
                </div>
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <span
              :class="getStatusBadgeClass(record.is_verified)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border inline-block"
            >
              {{ record.is_verified ? 'Verified' : 'Pending' }}
            </span>
          </template>

          <!-- Joined Column -->
          <template v-else-if="column.key === 'joined'">
            <div class="text-sm">
              <div class="text-gray-900">
                {{ formatDate(record.createdAt) }}
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
                      Edit User
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item
                    key="toggle"
                    @click="toggleUserStatus(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon 
                        :name="record.is_verified ? 'solar:pause-circle-bold' : 'solar:play-circle-bold'" 
                        size="16" 
                      />
                      {{ record.is_verified ? 'Suspend' : 'Activate' }}
                    </div>
                  </a-menu-item>
                  <a-menu-item
                    key="delete"
                    danger
                    @click="deleteUser(record)"
                  >
                    <div class="flex items-center w-full gap-2">
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                      Delete User
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
