<script setup lang="ts">
import type { Order } from '~/pages/admin/orders/index.vue'

interface Props {
  visible: boolean
  order: Order | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'reject', reason: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const rejectReason = ref('')

const modalVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  }
})

const handleReject = () => {
  if (!rejectReason.value.trim()) {
    return
  }
  emit('reject', rejectReason.value.trim())
}

const handleClose = () => {
  rejectReason.value = ''
  emit('close')
}

// Reset reason when dialog opens
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    rejectReason.value = ''
  }
})
</script>

<template>
  <a-modal
    v-model:open="modalVisible"
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
        <div v-if="order" class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
          <div class="text-sm text-gray-600 mb-2">Order Details:</div>
          <div class="font-medium text-gray-900">{{ order.invoice_code }}</div>
          <div class="text-sm text-gray-600">{{ order.student.full_name }}</div>
          <div class="text-sm text-gray-600">{{ order.course.title }}</div>
          <div class="text-sm font-medium text-red-600">€{{ Number(order.price_amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
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
          :maxlength="500"
          show-count
          class="w-full"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 justify-end">
        <a-button @click="handleClose" :disabled="loading">
          {{ $t('admin.orders.table.confirmDialog.reject.cancel') }}
        </a-button>
        <a-button 
          type="primary" 
          danger
          @click="handleReject" 
          :loading="loading"
          :disabled="!rejectReason.trim()"
        >
          {{ $t('admin.orders.table.confirmDialog.reject.confirm') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>
