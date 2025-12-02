<script setup lang="ts">
import type { Order } from '~/pages/admin/orders/index.vue'

interface Props {
  visible: boolean
  order: Order | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
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

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <a-modal
    v-model:open="modalVisible"
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
        <div v-if="order" class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
          <div class="text-sm text-gray-600 mb-2">Order Details:</div>
          <div class="font-medium text-gray-900">{{ order.invoice_code }}</div>
          <div class="text-sm text-gray-600">{{ order.student.full_name }}</div>
          <div class="text-sm text-gray-600">{{ order.course.title }}</div>
          <div class="text-sm font-medium text-green-600">€{{ Number(order.price_amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 justify-end">
        <a-button @click="handleClose" :disabled="loading">
          {{ $t('admin.orders.table.confirmDialog.confirmReceive.cancel') }}
        </a-button>
        <a-button 
          type="primary" 
          @click="handleConfirm" 
          :loading="loading"
          class="bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
        >
          {{ $t('admin.orders.table.confirmDialog.confirmReceive.confirm') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>
