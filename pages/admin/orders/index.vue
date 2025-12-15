<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Ref } from 'vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApiClient } from '~/api/apiClient'
import ConfirmReceiveDialog from '~/components/admin/orders/ConfirmReceiveDialog.vue'
import OrderDetailDialog from '~/components/admin/orders/OrderDetailDialog.vue'
import RejectOrderDialog from '~/components/admin/orders/RejectOrderDialog.vue'
import { useOrderApi } from '~/composables/api/useOrderApi'

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
    course_type?: 'course' | 'resource'
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

// State management
const loading = ref(false)
const searchText = ref('')
const selectedStatus = ref<string>('all')
const orders = ref<Order[]>([])
const totalCount = ref(0)
const currentPage: Ref<number> = ref(1)
const pageSize: Ref<number> = ref(10)
const hasNext = ref(false)
const hasPrevious = ref(false)

// Dialog state
const showConfirmDialog = ref(false)
const showRejectDialog = ref(false)
const showDetailDialog = ref(false)
const currentOrder = ref<Order | null>(null)
const isSubmitting = ref(false)
const rejectReason = ref('')

// Load orders from API
async function loadOrders() {
  try {
    loading.value = true
    const apiClient = useApiClient()

    // Calculate offset based on current page and page size
    const offset = (currentPage.value - 1) * pageSize.value

    // Build query parameters
    const params: any = {
      limit: pageSize.value,
      offset,
    }

    // Add status filter if not 'all'
    if (selectedStatus.value && selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    // Add search text if provided
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }

    const response = await apiClient.get('/orders/', { query: params }) as any

    if (response) {
      orders.value = response.results || []
      totalCount.value = response.count || 0
      hasNext.value = !!response.next
      hasPrevious.value = !!response.previous
    }
  }
  catch (error) {
    console.error('Error loading orders:', error)
    message.error(t('admin.orders.error'))
  }
  finally {
    loading.value = false
  }
}

// Load orders on mount
onMounted(() => {
  loadOrders()
})

// Watch for all changes and reload data
watch([searchText, selectedStatus, currentPage, pageSize], () => {
  loadOrders()
})

// Status options
const statusOptions = computed(() => [
  { label: t('admin.orders.filters.statusFilter'), value: 'all' },
  { label: t('admin.orders.table.status.pending'), value: 'pending' },
  { label: t('admin.orders.table.status.complete'), value: 'complete' },
  { label: t('admin.orders.table.status.cancel'), value: 'cancel' },
])

// No need for client-side filtering since we're using server-side filtering

// Pagination configuration
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: totalCount.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} ${t('admin.orders.stats.totalOrders').toLowerCase()}`,
  onChange: (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
  },
  onShowSizeChange: (current: number, size: number) => {
    currentPage.value = 1
    pageSize.value = size
  },
}))

// Statistics - Note: These are calculated from current page data only
// For accurate statistics, you might want to add separate API endpoints
const stats = computed(() => {
  const totalOrders = totalCount.value // Use total count from API
  const totalRevenue = orders.value
    .filter(order => order.status === 'complete')
    .reduce((sum, order) => sum + Number.parseFloat(order.price_amount), 0)
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
    title: t('admin.orders.table.columns.plan'),
    key: 'plan',
    width: 150,
  },
  {
    title: t('admin.orders.table.columns.amount'),
    dataIndex: 'price_amount',
    key: 'price_amount',
    width: 120,
    sorter: (a, b) => Number.parseFloat(a.price_amount) - Number.parseFloat(b.price_amount),
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
  if (!currentOrder.value)
    return

  try {
    isSubmitting.value = true
    const { updateOrder } = useOrderApi()

    await updateOrder(currentOrder.value.id, {
      status: 'complete',
      admin_note: 'Payment confirmed by admin',
    })

    message.success(t('admin.orders.table.actions.confirmReceive'))
    await loadOrders()
    showConfirmDialog.value = false
    currentOrder.value = null
  }
  catch (error) {
    console.error('Error confirming receive:', error)
    message.error('Failed to confirm receive')
  }
  finally {
    isSubmitting.value = false
  }
}

async function rejectOrder(reason: string) {
  if (!currentOrder.value)
    return

  try {
    isSubmitting.value = true
    const { updateOrder } = useOrderApi()

    await updateOrder(currentOrder.value.id, {
      status: 'cancel',
      canceled_reason: reason,
      admin_note: `Order rejected: ${reason}`,
    })

    message.success(t('admin.orders.table.actions.reject'))
    await loadOrders()
    showRejectDialog.value = false
    currentOrder.value = null
  }
  catch (error) {
    console.error('Error rejecting order:', error)
    message.error('Failed to reject order')
  }
  finally {
    isSubmitting.value = false
  }
}

function closeConfirmDialog() {
  showConfirmDialog.value = false
  currentOrder.value = null
}

function closeRejectDialog() {
  showRejectDialog.value = false
  currentOrder.value = null
}

function closeDetailDialog() {
  showDetailDialog.value = false
  currentOrder.value = null
}

// Clear all filters
function clearFilters() {
  searchText.value = ''
  selectedStatus.value = 'all'
  currentPage.value = 1
}

// Refresh data
async function handleRefresh() {
  await loadOrders()
  message.success(t('admin.orders.table.refresh'))
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pt-0 max-md:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2 flex-wrap">
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
          <a-button class="rounded-lg gap-1 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800" @click="handleRefresh">
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
          €{{ Number(stats.totalRevenue).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="orders"
        :loading="loading"
        :pagination="paginationConfig"
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
              {{ $t('admin.orders.table.emptyState.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ $t('admin.orders.table.emptyState.description') }}
            </p>
            <a-button class="rounded-lg" @click="clearFilters">
              {{ $t('admin.orders.table.emptyState.clearFilters') }}
            </a-button>
          </div>
        </template>
        <!-- Student Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'student'">
            <div class="flex items-center gap-3">
              <div>
                <div class="font-semibold text-gray-900">
                  {{ record.student.full_name.charAt(0) }}
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
                  {{ record.course?.title }}
                </div>
                <div class="text-sm text-gray-500">
                  by {{ record.course.teacher_name }}
                </div>
              </div>
            </div>
          </template>

          <!-- Classroom Column -->
          <template v-else-if="column.key === 'classroom'">
            <div v-if="record.classroom">
              <div class="font-medium text-gray-900 line-clamp-1">
                {{ record.classroom?.title }}
              </div>
              <div class="text-sm text-gray-500">
                {{ record.classroom.schedule_summary }}
              </div>
              <div class="text-xs text-gray-400">
                {{ record.classroom.student_count }} students
              </div>
            </div>
            <span v-else class="text-gray-400">---</span>
          </template>

          <!-- Plan Column -->
          <template v-else-if="column.key === 'plan'">
            <div v-if="record.metadata?.duration_months">
              <div class="font-medium text-gray-900">
                {{ record.metadata.duration_months }} {{ $t('admin.orders.table.plan.months') }}
              </div>
            </div>
            <span v-else class="text-gray-400">---</span>
          </template>

          <!-- Amount Column -->
          <template v-else-if="column.key === 'price_amount'">
            <div class="font-bold text-gray-900">
              €{{ Number(record.price_amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
    <ConfirmReceiveDialog
      :visible="showConfirmDialog"
      :order="currentOrder"
      :loading="isSubmitting"
      @close="closeConfirmDialog"
      @confirm="confirmReceive"
    />

    <!-- Reject Order Dialog -->
    <RejectOrderDialog
      :visible="showRejectDialog"
      :order="currentOrder"
      :loading="isSubmitting"
      @close="closeRejectDialog"
      @reject="rejectOrder"
    />

    <!-- Order Detail Dialog -->
    <OrderDetailDialog
      :visible="showDetailDialog"
      :order="currentOrder"
      @close="closeDetailDialog"
    />
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
