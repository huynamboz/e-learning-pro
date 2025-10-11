<script setup lang="ts">
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { computed, ref, onMounted } from 'vue'
import { useOrderApi } from '~/composables/api/useOrderApi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Order interface based on API response
interface Order {
  id: string
  invoice_code: string
  student: {
    id: number
    email: string
    first_name: string
    last_name: string
    full_name: string
  }
  course: {
    id: string
    title: string
    slug: string
    effective_price: string
    teacher_name: string
  }
  classroom: {
    id: string
    title: string
    student_count: number
    schedule_summary: string
    course_id: string
    course_title: string
  }
  price_amount: string
  price_currency: string
  payment_method: string
  payment_reference: string
  status: 'pending' | 'complete' | 'cancel'
  status_display: string
  notes: string
  admin_note: string
  canceled_reason: string
  approved_by: string | null
  approved_at: string | null
  canceled_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface OrdersResponse {
  count: number
  next: string | null
  previous: string | null
  results: Order[]
}

// State management
const loading = ref(false)
const searchText = ref('')
const selectedStatus = ref<string>('all')
const dateRange = ref<[string, string] | null>(null)
const orders = ref<Order[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Dialog state
const showConfirmDialog = ref(false)
const showRejectDialog = ref(false)
const showDetailDialog = ref(false)
const currentOrder = ref<Order | null>(null)
const rejectReason = ref('')
const isSubmitting = ref(false)

// Load orders from API
async function loadOrders() {
  try {
    loading.value = true
    const { getAll } = useOrderApi()
    const response = await getAll() as any
    
    if (response) {
      orders.value = response.results || response || []
      totalCount.value = response.count || response.length || 0
    }
  } catch (error) {
    console.error('Error loading orders:', error)
    message.error(t('admin.orders.error'))
  } finally {
    loading.value = false
  }
}

// Load orders on mount
onMounted(() => {
  loadOrders()
})

// Status options
const statusOptions = computed(() => [
  { label: t('admin.orders.filters.statusFilter'), value: 'all' },
  { label: t('admin.orders.table.status.pending'), value: 'pending' },
  { label: t('admin.orders.table.status.complete'), value: 'complete' },
  { label: t('admin.orders.table.status.cancel'), value: 'cancel' },
])

// Filtered orders
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(
      order =>
        order.invoice_code.toLowerCase().includes(search)
        || order.student.full_name.toLowerCase().includes(search)
        || order.student.email.toLowerCase().includes(search)
        || order.course.title.toLowerCase().includes(search)
        || order.classroom.title.toLowerCase().includes(search),
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
    .filter(order => order.status === 'complete')
    .reduce((sum, order) => sum + parseFloat(order.price_amount), 0)
  const pendingOrders = orders.value.filter(order => order.status === 'pending').length
  const completedOrders = orders.value.filter(order => order.status === 'complete').length

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
  }
})

// Table columns
const columns = computed((): TableColumnsType<Order> => [
  {
    title: t('admin.orders.table.columns.invoice'),
    dataIndex: 'invoice_code',
    key: 'invoice_code',
    width: 140,
  },
  {
    title: t('admin.orders.table.columns.student'),
    key: 'student',
    width: 250,
  },
  {
    title: t('admin.orders.table.columns.course'),
    key: 'course',
    width: 250,
  },
  {
    title: t('admin.orders.table.columns.classroom'),
    key: 'classroom',
    width: 200,
  },
  {
    title: t('admin.orders.table.columns.amount'),
    dataIndex: 'price_amount',
    key: 'price_amount',
    width: 120,
    sorter: (a, b) => parseFloat(a.price_amount) - parseFloat(b.price_amount),
  },
  {
    title: t('admin.orders.table.columns.status'),
    key: 'status',
    width: 140,
  },
  {
    title: t('admin.orders.table.columns.date'),
    key: 'date',
    width: 180,
    sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  },
  {
    title: t('admin.orders.table.columns.actions'),
    key: 'actions',
    width: 100,
    fixed: 'right',
  },
])

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
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
    complete: 'bg-green-50 text-green-600 border-green-200',
    cancel: 'bg-red-50 text-red-600 border-red-200',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-50 text-gray-600 border-gray-200'
}

// Handle actions
function handleViewOrder(order: Order) {
  currentOrder.value = order
  showDetailDialog.value = true
}

function handleRejectOrder(order: Order) {
  currentOrder.value = order
  rejectReason.value = ''
  showRejectDialog.value = true
}

function handleConfirmReceive(order: Order) {
  currentOrder.value = order
  showConfirmDialog.value = true
}

// Dialog actions
async function confirmReceive() {
  if (!currentOrder.value) return
  
  try {
    isSubmitting.value = true
    const { updateOrder } = useOrderApi()
    
    await updateOrder(currentOrder.value.id, {
      status: 'complete',
      admin_note: 'Payment confirmed by admin'
    })
    
    message.success(t('admin.orders.table.actions.confirmReceive'))
    await loadOrders()
    showConfirmDialog.value = false
    currentOrder.value = null
  } catch (error) {
    console.error('Error confirming receive:', error)
    message.error('Failed to confirm receive')
  } finally {
    isSubmitting.value = false
  }
}

async function rejectOrder() {
  if (!currentOrder.value || !rejectReason.value.trim()) {
    message.warning('Please provide a reason for rejection')
    return
  }
  
  try {
    isSubmitting.value = true
    const { updateOrder } = useOrderApi()
    
    await updateOrder(currentOrder.value.id, {
      status: 'cancel',
      canceled_reason: rejectReason.value.trim(),
      admin_note: `Order rejected: ${rejectReason.value.trim()}`
    })
    
    message.success(t('admin.orders.table.actions.reject'))
    await loadOrders()
    showRejectDialog.value = false
    currentOrder.value = null
    rejectReason.value = ''
  } catch (error) {
    console.error('Error rejecting order:', error)
    message.error('Failed to reject order')
  } finally {
    isSubmitting.value = false
  }
}

function cancelConfirm() {
  showConfirmDialog.value = false
  currentOrder.value = null
}

function cancelReject() {
  showRejectDialog.value = false
  currentOrder.value = null
  rejectReason.value = ''
}

function closeDetailDialog() {
  showDetailDialog.value = false
  currentOrder.value = null
}

// Refresh data
async function handleRefresh() {
  await loadOrders()
  message.success(t('admin.orders.table.refresh'))
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
            {{ $t('admin.orders.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ $t('admin.orders.description') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a-button @click="handleRefresh" class="rounded-lg gap-1 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800">
            <template #icon>
              <Icon name="solar:refresh-bold" size="18" />
            </template>
            {{ $t('admin.orders.table.refresh') }}
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
          {{ $t('admin.orders.stats.totalOrders') }}
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
          {{ $t('admin.orders.stats.totalRevenue') }}
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
          {{ $t('admin.orders.stats.pendingOrders') }}
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
          {{ $t('admin.orders.stats.completedOrders') }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <a-input
          v-model:value="searchText"
          :placeholder="$t('admin.orders.filters.searchPlaceholder')"
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
          :placeholder="$t('admin.orders.filters.statusFilter')"
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
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          showSizeChanger: true,
          showTotal: (total: number) => `${$t('admin.orders.stats.totalOrders')}: ${total}`,
        }"
        :scroll="{ x: 1200 }"
        row-key="id"
        class="custom-table"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:cart-large-2-bold" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ $t('admin.orders.emptyState.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ $t('admin.orders.emptyState.description') }}
            </p>
            <a-button @click="searchText = ''; selectedStatus = 'all'; dateRange = null" class="rounded-lg">
              {{ $t('admin.orders.emptyState.clearFilters') }}
            </a-button>
          </div>
        </template>
        <!-- Student Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'student'">
            <div class="flex items-center gap-3">
              <div>
                <div class="font-semibold text-gray-900">
                  {{ record.student.full_name }}
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
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon name="solar:play-circle-bold" class="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <div class="font-medium text-gray-900 line-clamp-1">
                  {{ record.course.title }}
                </div>
                <div class="text-sm text-gray-500">
                  by {{ record.course.teacher_name }}
                </div>
              </div>
            </div>
          </template>

          <!-- Classroom Column -->
          <template v-else-if="column.key === 'classroom'">
            <div>
              <div class="font-medium text-gray-900 line-clamp-1">
                {{ record.classroom.title }}
              </div>
              <div class="text-sm text-gray-500">
                {{ record.classroom.schedule_summary }}
              </div>
              <div class="text-xs text-gray-400">
                {{ record.classroom.student_count }} students
              </div>
            </div>
          </template>

          <!-- Amount Column -->
          <template v-else-if="column.key === 'price_amount'">
            <div class="font-bold text-gray-900">
              ${{ parseFloat(record.price_amount).toFixed(2) }}
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <span
              :class="getStatusBadgeClass(record.status)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border inline-block"
            >
              {{ record.status_display }}
            </span>
          </template>

          <!-- Date Column -->
          <template v-else-if="column.key === 'date'">
            <div class="text-sm">
              <div class="text-gray-900">
                {{ formatDate(record.created_at) }}
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
                    key="view"
                    @click="handleViewOrder(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:eye-bold" size="16" />
                      {{ $t('admin.orders.table.actions.viewDetails') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item
                    v-if="record.status === 'pending'"
                    key="confirm"
                    @click="handleConfirmReceive(record)"
                  >
                    <div class="flex items-center gap-2">
                      <Icon name="solar:check-circle-bold" size="16" />
                      {{ $t('admin.orders.table.actions.confirmReceive') }}
                    </div>
                  </a-menu-item>
                  <a-menu-item
                    v-if="record.status === 'pending'"
                    key="reject"
                    danger
                    @click="handleRejectOrder(record)"
                  >
                    <div class="flex items-center w-full gap-2">
                      <Icon name="solar:close-circle-bold" size="16" />
                      {{ $t('admin.orders.table.actions.reject') }}
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Confirm Receive Dialog -->
    <a-modal
      v-model:open="showConfirmDialog"
      :title="$t('admin.orders.table.confirmDialog.confirmReceive.title')"
      :footer="null"
      centered
      width="500px"
    >
      <div class="py-4">
        <!-- Icon -->
        <div class="text-center mb-6">
          <div class="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="solar:check-circle-bold" size="32" class="text-green-600" />
          </div>
          
          <!-- Message -->
          <p class="text-gray-600 text-base leading-relaxed">
            {{ $t('admin.orders.table.confirmDialog.confirmReceive.message') }}
          </p>
          
          <!-- Order Info -->
          <div v-if="currentOrder" class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <div class="text-sm text-gray-600 mb-2">Order Details:</div>
            <div class="font-medium text-gray-900">{{ currentOrder.invoice_code }}</div>
            <div class="text-sm text-gray-600">{{ currentOrder.student.full_name }}</div>
            <div class="text-sm text-gray-600">{{ currentOrder.course.title }}</div>
            <div class="text-sm font-medium text-green-600">${{ parseFloat(currentOrder.price_amount).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 justify-end">
          <a-button @click="cancelConfirm" :disabled="isSubmitting">
            {{ $t('admin.orders.table.confirmDialog.confirmReceive.cancel') }}
          </a-button>
          <a-button 
            type="primary" 
            @click="confirmReceive" 
            :loading="isSubmitting"
            class="bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
          >
            {{ $t('admin.orders.table.confirmDialog.confirmReceive.confirm') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Reject Order Dialog -->
    <a-modal
      v-model:open="showRejectDialog"
      :title="$t('admin.orders.table.confirmDialog.reject.title')"
      :footer="null"
      centered
      width="500px"
    >
      <div class="py-4">
        <!-- Icon -->
        <div class="text-center mb-6">
          <div class="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="solar:close-circle-bold" size="32" class="text-red-600" />
          </div>
          
          <!-- Message -->
          <p class="text-gray-600 text-base leading-relaxed">
            {{ $t('admin.orders.table.confirmDialog.reject.message') }}
          </p>
          
          <!-- Order Info -->
          <div v-if="currentOrder" class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <div class="text-sm text-gray-600 mb-2">Order Details:</div>
            <div class="font-medium text-gray-900">{{ currentOrder.invoice_code }}</div>
            <div class="text-sm text-gray-600">{{ currentOrder.student.full_name }}</div>
            <div class="text-sm text-gray-600">{{ currentOrder.course.title }}</div>
            <div class="text-sm font-medium text-red-600">${{ parseFloat(currentOrder.price_amount).toFixed(2) }}</div>
          </div>
        </div>

        <!-- Reason Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.orders.table.confirmDialog.reject.reason') }}
          </label>
          <a-textarea
            v-model:value="rejectReason"
            :placeholder="$t('admin.orders.table.confirmDialog.reject.reasonPlaceholder')"
            :rows="4"
            class="w-full"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 justify-end">
          <a-button @click="cancelReject" :disabled="isSubmitting">
            {{ $t('admin.orders.table.confirmDialog.reject.cancel') }}
          </a-button>
          <a-button 
            type="primary" 
            danger
            @click="rejectOrder" 
            :loading="isSubmitting"
            :disabled="!rejectReason.trim()"
          >
            {{ $t('admin.orders.table.confirmDialog.reject.confirm') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Order Detail Dialog -->
    <a-modal
      v-model:open="showDetailDialog"
      :title="$t('admin.orders.detailDialog.title')"
      :footer="null"
      centered
      width="700px"
    >
      <div v-if="currentOrder" class="py-4 max-h-[80vh] overflow-y-auto">
        <!-- Order Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Invoice Code -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.invoice') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="font-mono text-sm text-gray-900">{{ currentOrder.invoice_code }}</span>
              </div>
            </div>

            <!-- Student Info -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.student') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <a-avatar :size="40">
                    {{ currentOrder.student.full_name.charAt(0) }}
                  </a-avatar>
                  <div>
                    <div class="font-medium text-gray-900">{{ currentOrder.student.full_name }}</div>
                    <div class="text-sm text-gray-500">{{ currentOrder.student.email }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Course Info -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.course') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="solar:play-circle-bold" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ currentOrder.course.title }}</div>
                    <div class="text-sm text-gray-500">by {{ currentOrder.course.teacher_name }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Classroom Info -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.classroom') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="font-medium text-gray-900">{{ currentOrder.classroom.title }}</div>
                <div class="text-sm text-gray-500">{{ currentOrder.classroom.schedule_summary }}</div>
                <div class="text-sm text-gray-500">{{ currentOrder.classroom.student_count }} students</div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Amount -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.amount') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl font-bold text-green-600">${{ parseFloat(currentOrder.price_amount).toFixed(2) }}</span>
                <span class="text-sm text-gray-500 ml-2">{{ currentOrder.price_currency }}</span>
              </div>
            </div>

            <!-- Status -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.status') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span :class="getStatusBadgeClass(currentOrder.status)" class="px-3 py-1 rounded-full text-sm font-medium border">
                  {{ currentOrder.status_display }}
                </span>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.paymentMethod') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-900">{{ currentOrder.payment_method }}</span>
              </div>
            </div>

            <!-- Payment Reference -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.paymentReference') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="font-mono text-sm text-gray-900">{{ currentOrder.payment_reference }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Width Fields -->
        <div class="mt-6 space-y-4">
          <!-- Notes -->
          <div v-if="currentOrder.notes" class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.notes') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-900">{{ currentOrder.notes }}</p>
            </div>
          </div>

          <!-- Admin Note -->
          <div v-if="currentOrder.admin_note" class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.adminNote') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-900">{{ currentOrder.admin_note }}</p>
            </div>
          </div>

          <!-- Canceled Reason -->
          <div v-if="currentOrder.canceled_reason" class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.canceledReason') }}
            </label>
            <div class="p-3 bg-red-50 rounded-lg border border-red-200">
              <p class="text-sm text-red-800">{{ currentOrder.canceled_reason }}</p>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.createdAt') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-900">{{ formatDate(currentOrder.created_at) }}</span>
              </div>
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">
                {{ $t('admin.orders.detailDialog.updatedAt') }}
              </label>
              <div class="p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-900">{{ formatDate(currentOrder.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <a-button @click="closeDetailDialog" type="primary">
            {{ $t('admin.orders.detailDialog.close') }}
          </a-button>
        </div>
      </div>
    </a-modal>
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
