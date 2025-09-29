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
  title: 'User Management',
})

// Reactive data
const searchQuery = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// Mock users data
const users = ref<User[]>([
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    is_teacher: false,
    is_verified: true,
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'teacher@example.com',
    username: 'teacher1',
    first_name: 'John',
    last_name: 'Doe',
    is_teacher: true,
    is_verified: true,
    role: 'teacher',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    email: 'user@example.com',
    username: 'user1',
    first_name: 'Jane',
    last_name: 'Smith',
    is_teacher: false,
    is_verified: false,
    role: 'user',
    createdAt: '2024-02-01T00:00:00Z',
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

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
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
    title: 'User',
    dataIndex: 'user',
    key: 'user',
    width: 200,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    width: 100,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: 'Joined',
    dataIndex: 'joined',
    key: 'joined',
    width: 120,
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 150,
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
  <div class="admin-users p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <a-typography-title :level="2" class="!mb-2">
        User Management
      </a-typography-title>
      <a-typography-text type="secondary">
        Manage user accounts, roles, and permissions.
      </a-typography-text>
    </div>

    <!-- Filters and Search -->
    <a-card class="mb-6">
      <a-row :gutter="16" align="middle">
        <a-col :span="12">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Search users..."
            enter-button
            size="large"
          />
        </a-col>
        <a-col :span="6">
          <a-select
            v-model:value="roleFilter"
            placeholder="All Roles"
            size="large"
            class="w-full"
            allow-clear
          >
            <a-select-option value="user">
              User
            </a-select-option>
            <a-select-option value="teacher">
              Teacher
            </a-select-option>
            <a-select-option value="admin">
              Admin
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button
            type="primary"
            size="large"
            :loading="loading"
            @click="refreshUsers"
          >
            <template #icon>
              <ReloadOutlined />
            </template>
            Refresh
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Users Table -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="filteredUsers"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} users`,
        }"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- User Column -->
        <template #user="{ record }">
          <a-space>
            <a-avatar :src="record.avatar" />
            <div>
              <div class="font-medium">
                {{ record.first_name }} {{ record.last_name }}
              </div>
              <div class="text-gray-500 text-sm">
                {{ record.email }}
              </div>
            </div>
          </a-space>
        </template>

        <!-- Role Column -->
        <template #role="{ record }">
          <a-tag :color="getRoleTagColor(record.role)">
            {{ record.role || 'user' }}
          </a-tag>
        </template>

        <!-- Status Column -->
        <template #status="{ record }">
          <a-tag :color="getStatusTagColor(record.is_verified)">
            {{ record.is_verified ? 'Verified' : 'Pending' }}
          </a-tag>
        </template>

        <!-- Joined Column -->
        <template #joined="{ record }">
          {{ formatDate(record.createdAt) }}
        </template>

        <!-- Actions Column -->
        <template #actions="{ record }">
          <a-space>
            <a-button
              type="link"
              size="small"
              @click="editUser(record)"
            >
              <template #icon>
                <EditOutlined />
              </template>
              Edit
            </a-button>
            <a-button
              type="link"
              size="small"
              :class="record.is_verified ? 'text-orange-500' : 'text-green-500'"
              @click="toggleUserStatus(record)"
            >
              <template #icon>
                <UserSwitchOutlined />
              </template>
              {{ record.is_verified ? 'Suspend' : 'Activate' }}
            </a-button>
            <a-button
              type="link"
              size="small"
              danger
              @click="deleteUser(record)"
            >
              <template #icon>
                <DeleteOutlined />
              </template>
              Delete
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
