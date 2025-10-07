<script setup lang="ts">
import type { User } from '~/types/auth.type'
import {
  DeleteOutlined,
  EditOutlined,
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


// Table columns
const columns = [
    {
    title: 'Id student',
    dataIndex: 'id',
    key: 'id',
    width: 200,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: 'Check-in Time',
    dataIndex: 'time',
    key: 'time',
    width: 200,
  },
  {
    title: 'Classroom',
    dataIndex: 'classroom',
    key: 'classroom',
    width: 200,
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 150,
  },
]

function formatDate(dateString: string | undefined) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString()
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
    <div class="admin-users">
      <a-card>
        <a-table
          :columns="columns"
          :data-source="users"
          :loading="loading"
          :pagination="{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t: number, r: [number, number]) => `${r[0]}-${r[1]} of ${t} users`,
          }"
          row-key="id"
          @change="handleTableChange"
        >
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
                <a-space>
              <a-avatar style="background-color:#87d068">
                {{ record.first_name.charAt(0) }}
              </a-avatar>
              <span>{{ record.first_name }} {{ record.last_name }}</span>
            </a-space>
            </template>
            <template v-if="column.key === 'email'">
                {{ record?.email }}
            </template>
            <template v-if="column.key === 'time'">
            <p>
            {{ formatDate(record?.createdAt) }}
            </p>
            </template>
            <template v-if="column.key === 'classroom'">
                {{ record?.classroom }}
            </template>
            <template v-if="column.key === 'actions'">
                <a-space>
              <a-button type="link" size="small" @click="editUser(record)" class="!flex !items-center">
                <template #icon><EditOutlined /></template>
                Edit
              </a-button>
              <a-button
                type="link"
                size="small"
                :class="record.is_verified ? 'text-orange-500' : 'text-green-500'"
                class="!flex !items-center"
                @click="toggleUserStatus(record)"
              >
                <template #icon><UserSwitchOutlined /></template>
                {{ record.is_verified ? 'Suspend' : 'Activate' }}
              </a-button>
              <a-button type="link" size="small" danger @click="deleteUser(record)" class="!flex !items-center">
                <template #icon><DeleteOutlined /></template>
                Delete
              </a-button>
            </a-space>
            </template>
      </template>
        </a-table>
      </a-card>
    </div>
  </template>
