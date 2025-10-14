<script setup lang="ts">
import type { Order } from '~/pages/admin/orders/index.vue'

interface Props {
  visible: boolean
  order: Order | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  }
})

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

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <a-modal
    v-model:open="modalVisible"
    :title="$t('admin.orders.detailDialog.title')"
    :footer="null"
    centered
    width="700px"
  >
    <div v-if="order" class="py-4 max-h-[80vh] overflow-y-auto">
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
              <span class="font-mono text-sm text-gray-900">{{ order.invoice_code }}</span>
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
                  {{ order.student.full_name.charAt(0) }}
                </a-avatar>
                <div>
                  <div class="font-medium text-gray-900">{{ order.student.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.student.email }}</div>
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
                  <div class="font-medium text-gray-900">{{ order.course.title }}</div>
                  <div class="text-sm text-gray-500">by {{ order.course.teacher_name }}</div>
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
              <div class="font-medium text-gray-900">{{ order.classroom.title }}</div>
              <div class="text-sm text-gray-500">{{ order.classroom.schedule_summary }}</div>
              <div class="text-sm text-gray-500">{{ order.classroom.student_count }} students</div>
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
              <span class="text-2xl font-bold text-green-600">${{ parseFloat(order.price_amount).toFixed(2) }}</span>
              <span class="text-sm text-gray-500 ml-2">{{ order.price_currency }}</span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.status') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <span :class="getStatusBadgeClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium border">
                {{ order.status_display }}
              </span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.paymentMethod') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <span class="text-sm text-gray-900">{{ order.payment_method }}</span>
            </div>
          </div>

          <!-- Payment Reference -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.paymentReference') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <span class="font-mono text-sm text-gray-900">{{ order.payment_reference }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Fields -->
      <div class="mt-6 space-y-4">
        <!-- Notes -->
        <div v-if="order.notes" class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">
            {{ $t('admin.orders.detailDialog.notes') }}
          </label>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-900">{{ order.notes }}</p>
          </div>
        </div>

        <!-- Admin Note -->
        <div v-if="order.admin_note" class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">
            {{ $t('admin.orders.detailDialog.adminNote') }}
          </label>
          <div class="p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-900">{{ order.admin_note }}</p>
          </div>
        </div>

        <!-- Canceled Reason -->
        <div v-if="order.canceled_reason" class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">
            {{ $t('admin.orders.detailDialog.canceledReason') }}
          </label>
          <div class="p-3 bg-red-50 rounded-lg border border-red-200">
            <p class="text-sm text-red-800">{{ order.canceled_reason }}</p>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.createdAt') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <span class="text-sm text-gray-900">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">
              {{ $t('admin.orders.detailDialog.updatedAt') }}
            </label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <span class="text-sm text-gray-900">{{ formatDate(order.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <a-button @click="handleClose" type="primary">
          {{ $t('admin.orders.detailDialog.close') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>
