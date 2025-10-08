<script setup lang="ts">
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Order interface
interface Order {
  id: string
  orderNumber: string
  student: {
    name: string
    email: string
    avatar?: string
  }
  course: {
    title: string
    thumbnail?: string
  }
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

// Mock data - Replace with actual API call
const loading = ref(false)
const searchText = ref('')
const selectedStatus = ref<string>('all')
const dateRange = ref<[string, string] | null>(null)

const orders = ref<Order[]>([
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    student: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/avatar.jpg',
    },
    course: {
      title: 'Complete Web Development Bootcamp',
      thumbnail: '/images/course-thumbnail-default.webp',
    },
    amount: 99.99,
    status: 'completed',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T10:35:00',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    student: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    course: {
      title: 'Advanced React & TypeScript',
    },
    amount: 149.99,
    status: 'pending',
    paymentMethod: 'PayPal',
    createdAt: '2024-01-16T14:20:00',
    updatedAt: '2024-01-16T14:20:00',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    student: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
    },
    course: {
      title: 'UI/UX Design Masterclass',
    },
    amount: 79.99,
    status: 'completed',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-17T09:15:00',
    updatedAt: '2024-01-17T09:20:00',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    student: {
      name: 'Sarah Williams',
      email: 'sarah@example.com',
    },
    course: {
      title: 'Python for Data Science',
    },
    amount: 199.99,
    status: 'failed',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-18T11:45:00',
    updatedAt: '2024-01-18T11:45:00',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    student: {
      name: 'Tom Brown',
      email: 'tom@example.com',
    },
    course: {
      title: 'Mobile App Development',
    },
    amount: 129.99,
    status: 'refunded',
    paymentMethod: 'PayPal',
    createdAt: '2024-01-19T16:30:00',
    updatedAt: '2024-01-20T10:00:00',
  },
])

// Status options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

// Filtered orders
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(
      order =>
        order.orderNumber.toLowerCase().includes(search)
        || order.student.name.toLowerCase().includes(search)
        || order.student.email.toLowerCase().includes(search)
        || order.course.title.toLowerCase().includes(search),
    )
  }

  // Filter by status
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    filtered = filtered.filter(order => order.status === selectedStatus.value)
  }

  return filtered
})

// Statistics
const stats = computed(() => {
  const totalOrders = orders.value.length
  const totalRevenue = orders.value
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0)
  const pendingOrders = orders.value.filter(order => order.status === 'pending').length
  const completedOrders = orders.value.filter(order => order.status === 'completed').length

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
  }
})

// Table columns
const columns: TableColumnsType<Order> = [
  {
    title: 'Order',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    width: 140,
  },
  {
    title: 'Student',
    key: 'student',
    width: 250,
  },
  {
    title: 'Course',
    key: 'course',
    width: 300,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: 'Payment',
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    width: 140,
  },
  {
    title: 'Status',
    key: 'status',
    width: 140,
  },
  {
    title: 'Date',
    key: 'date',
    width: 180,
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
]

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status badge class
function getStatusBadgeClass(status: string) {
  const classes = {
    pending: 'bg-orange-50 text-orange-600 border-orange-200',
    completed: 'bg-green-50 text-green-600 border-green-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
    refunded: 'bg-purple-50 text-purple-600 border-purple-200',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-50 text-gray-600 border-gray-200'
}

// Handle actions
function handleViewOrder(order: Order) {
  message.info(`View order: ${order.orderNumber}`)
}

function handleUpdateStatus(order: Order) {
  message.info(`Update status for: ${order.orderNumber}`)
}

function handleRefund(order: Order) {
  message.warning(`Refund order: ${order.orderNumber}`)
}

// Refresh data
function handleRefresh() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('Orders refreshed')
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pt-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Icon name="solar:cart-large-2-bold" size="28" class="text-white" />
            </div>
            Order Management
          </h1>
          <p class="text-gray-600 mt-1">
            Manage and track all student orders
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a-button @click="handleRefresh" class="rounded-lg gap-1 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800">
            <template #icon>
              <Icon name="solar:refresh-bold" size="18" />
            </template>
            Refresh
          </a-button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Orders -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-blue-50 rounded-lg size-12">
            <Icon name="solar:cart-large-2-bold" size="24" class="text-blue-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.totalOrders }}
        </div>
        <div class="text-sm text-gray-600">
          Total Orders
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-green-50 rounded-lg size-12">
            <Icon name="solar:dollar-bold" size="24" class="text-green-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          ${{ stats.totalRevenue.toFixed(2) }}
        </div>
        <div class="text-sm text-gray-600">
          Total Revenue
        </div>
      </div>

      <!-- Pending Orders -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-orange-50 rounded-lg size-12">
            <Icon name="solar:clock-circle-bold" size="24" class="text-orange-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.pendingOrders }}
        </div>
        <div class="text-sm text-gray-600">
          Pending Orders
        </div>
      </div>

      <!-- Completed Orders -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-purple-50 rounded-lg size-12">
            <Icon name="solar:check-circle-bold" size="24" class="text-purple-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.completedOrders }}
        </div>
        <div class="text-sm text-gray-600">
          Completed Orders
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <a-input
          v-model:value="searchText"
          placeholder="Search by order, student, email, course..."
          size="large"
          allow-clear
        >
          <template #prefix>
            <Icon name="solar:magnifer-linear" size="18" class="text-gray-400" />
          </template>
        </a-input>

        <!-- Status Filter -->
        <a-select
          v-model:value="selectedStatus"
          size="large"
          placeholder="Filter by status"
          style="width: 100%"
        >
          <a-select-option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>

        <!-- Date Range -->
        <a-range-picker
          v-model:value="dateRange"
          size="large"
          style="width: 100%"
        />
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="filteredOrders"
        :loading="loading"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `Total ${total} orders`,
        }"
        :scroll="{ x: 1400 }"
        row-key="id"
        class="custom-table"
      >
        <!-- Student Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'student'">
            <div class="flex items-center gap-3">
              <a-avatar :src="record.student.avatar" :size="40">
                {{ record.student.name.charAt(0) }}
              </a-avatar>
              <div>
                <div class="font-semibold text-gray-900">
                  {{ record.student.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ record.student.email }}
                </div>
              </div>
            </div>
          </template>

          <!-- Course Column -->
          <template v-else-if="column.key === 'course'">
            <div class="flex items-center gap-3">
              <img
                :src="record.course.thumbnail || '/images/course-thumbnail-default.webp'"
                :alt="record.course.title"
                class="w-12 h-12 rounded-lg object-cover"
              >
              <div class="font-medium text-gray-900 line-clamp-2">
                {{ record.course.title }}
              </div>
            </div>
          </template>

          <!-- Amount Column -->
          <template v-else-if="column.key === 'amount'">
            <div class="font-bold text-gray-900">
              ${{ record.amount.toFixed(2) }}
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <span
              :class="getStatusBadgeClass(record.status)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border inline-block"
            >
              {{ record.status.toUpperCase() }}
            </span>
          </template>

          <!-- Date Column -->
          <template v-else-if="column.key === 'date'">
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
                  <a-menu-item key="view" @click="handleViewOrder(record)">
                    <Icon name="solar:eye-bold" size="16" class="mr-2" />
                    View Details
                  </a-menu-item>
                  <a-menu-item key="status" @click="handleUpdateStatus(record)">
                    <Icon name="solar:refresh-bold" size="16" class="mr-2" />
                    Update Status
                  </a-menu-item>
                  <a-menu-divider v-if="record.status === 'completed'" />
                  <a-menu-item
                    v-if="record.status === 'completed'"
                    key="refund"
                    danger
                    @click="handleRefund(record)"
                  >
                    <Icon name="solar:wallet-money-bold" size="16" class="mr-2" />
                    Refund Order
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
