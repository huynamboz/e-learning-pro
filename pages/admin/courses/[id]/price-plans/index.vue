<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { ResourcePricePlan, ResourcePricePlanPayload } from '~/types/course.type'
import { message, Modal } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.id as string)
const { getPricePlans, createPricePlan, updatePricePlan, deletePricePlan } = useCourseApi()

// State
const pricePlans = ref<ResourcePricePlan[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingPlan = ref<ResourcePricePlan | null>(null)
const formRef = ref()

// Form state
const formState = ref<{
  duration_months: number
  price_amount: string | number
  price_currency: string
  is_active: boolean
  is_default: boolean
}>({
  duration_months: 1,
  price_amount: '',
  price_currency: 'VND',
  is_active: true,
  is_default: false,
})

// Computed for is_available - backend calculates this, but we use is_active to control it
// When is_active is true, is_available will be true (assuming no date restrictions)

// Table columns
const columns = computed<TableColumnsType>(() => [
  {
    title: t('admin.pricePlans.table.columns.duration'),
    key: 'duration_months',
    dataIndex: 'duration_months',
    width: 120,
  },
  {
    title: t('admin.pricePlans.table.columns.price'),
    key: 'price',
    width: 200,
  },
  {
    title: t('admin.pricePlans.table.columns.status'),
    key: 'status',
    width: 150,
  },
  {
    title: t('admin.pricePlans.table.columns.actions'),
    key: 'actions',
    width: 150,
    fixed: 'right',
  },
])

// Load price plans
async function loadPricePlans() {
  try {
    isLoading.value = true
    const response = await getPricePlans(courseId.value)
    // Handle paginated response with results array
    if (response && typeof response === 'object' && 'results' in response) {
      pricePlans.value = (response as any).results || []
    }
    else if (Array.isArray(response)) {
      pricePlans.value = response
    }
    else {
      pricePlans.value = []
    }
  }
  catch (error: any) {
    console.error('Error loading price plans:', error)
    message.error(error?.data?.message || t('admin.pricePlans.notifications.loadFailed'))
  }
  finally {
    isLoading.value = false
  }
}

// Handle add plan
function handleAddPlan() {
  isEditMode.value = false
  editingPlan.value = null
  resetForm()
  isModalOpen.value = true
}

// Handle edit plan
function handleEditPlan(plan: ResourcePricePlan) {
  isEditMode.value = true
  editingPlan.value = plan
  formState.value = {
    duration_months: plan.duration_months,
    price_amount: plan.price_amount,
    price_currency: plan.price_currency,
    // Use is_available to set is_active (since is_available is computed from is_active)
    is_active: plan.is_available,
    is_default: plan.is_default,
  }
  isModalOpen.value = true
}

// Handle delete plan
async function handleDeletePlan(planId: string) {
  const plan = pricePlans.value.find(p => p.id === planId)
  if (!plan)
    return

  Modal.confirm({
    title: t('admin.pricePlans.deleteConfirm.title'),
    content: t('admin.pricePlans.deleteConfirm.content', {
      duration: plan.duration_months,
      price: formatPrice(plan.price_amount, plan.price_currency),
    }),
    okText: t('admin.pricePlans.deleteConfirm.okText'),
    cancelText: t('admin.pricePlans.deleteConfirm.cancelText'),
    okType: 'danger',
    async onOk() {
      try {
        await deletePricePlan(courseId.value, planId)
        message.success(t('admin.pricePlans.notifications.deleteSuccess'))
        await loadPricePlans()
      }
      catch (error: any) {
        console.error('Error deleting price plan:', error)
        message.error(error?.data?.message || t('admin.pricePlans.notifications.deleteFailed'))
      }
    },
  })
}

// Handle save plan
async function handleSavePlan() {
  try {
    await formRef.value?.validate()

    const payload: ResourcePricePlanPayload = {
      duration_months: formState.value.duration_months,
      price_amount: formState.value.price_amount.toString(),
      price_currency: formState.value.price_currency,
      is_active: formState.value.is_active,
      is_default: formState.value.is_default,
      starts_at: null,
      ends_at: null,
    }

    if (isEditMode.value && editingPlan.value) {
      await updatePricePlan(courseId.value, editingPlan.value.id, payload)
      message.success(t('admin.pricePlans.notifications.updateSuccess'))
    }
    else {
      await createPricePlan(courseId.value, payload)
      message.success(t('admin.pricePlans.notifications.createSuccess'))
    }

    isModalOpen.value = false
    resetForm()
    await loadPricePlans()
  }
  catch (error: any) {
    console.error('Error saving price plan:', error)
    if (error?.errorFields) {
      // Validation errors
      return
    }
    message.error(error?.data?.message || t('admin.pricePlans.notifications.saveFailed'))
  }
}

// Reset form
function resetForm() {
  formState.value = {
    duration_months: 1,
    price_amount: '',
    price_currency: 'VND',
    is_active: true,
    is_default: false,
  }
  formRef.value?.resetFields()
}

// Format price
function formatPrice(amount: string, currency: string): string {
  const numAmount = Number.parseFloat(amount)
  if (currency === 'VND') {
    return `${new Intl.NumberFormat('vi-VN').format(numAmount)} ₫`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numAmount)
}

// Load on mount
onMounted(() => {
  loadPricePlans()
})
</script>

<template>
  <div class="price-plans-management min-h-screen bg-gray-50 p-6 pt-0 max-md:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Icon name="solar:wallet-money-bold" size="28" class="text-white" />
            </div>
            {{ t('admin.pricePlans.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ t('admin.pricePlans.description') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Add Price Plan Button -->
          <a-button
            type="primary"
            class="rounded-lg gap-2 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
            @click="handleAddPlan"
          >
            <Icon name="solar:add-circle-bold" size="18" />
            {{ t('admin.pricePlans.actions.add') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="pricePlans"
        :loading="isLoading"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `${total} ${t('admin.pricePlans.table.totalPlans')}`,
        }"
        row-key="id"
        class="custom-table"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:wallet-money-bold-duotone" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ t('admin.pricePlans.empty.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ t('admin.pricePlans.empty.description') }}
            </p>
            <a-button type="primary" class="rounded-lg" @click="handleAddPlan">
              {{ t('admin.pricePlans.actions.add') }}
            </a-button>
          </div>
        </template>

        <!-- Table Body Cells -->
        <template #bodyCell="{ column, record }">
          <!-- Duration -->
          <template v-if="column.key === 'duration_months'">
            <span class="font-medium text-gray-900">
              {{ record.duration_months }} {{ t('admin.pricePlans.table.months') }}
            </span>
          </template>

          <!-- Price -->
          <template v-if="column.key === 'price'">
            <span class="font-semibold text-[#16A34A]">
              {{ formatPrice(record.price_amount, record.price_currency) }}
            </span>
          </template>

          <!-- Status -->
          <template v-if="column.key === 'status'">
            <a-tag v-if="record.is_available" color="green">
              {{ t('admin.pricePlans.table.available') }}
            </a-tag>
            <a-tag v-else color="red">
              {{ t('admin.pricePlans.table.unavailable') }}
            </a-tag>
          </template>

          <!-- Actions -->
          <template v-if="column.key === 'actions'">
            <a-dropdown :trigger="['click']">
              <a-button type="text" size="small">
                <Icon name="solar:menu-dots-bold" size="20" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit" @click="handleEditPlan(record)">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:pen-bold" size="16" />
                      {{ t('admin.pricePlans.actions.edit') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger @click="handleDeletePlan(record.id)">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                      {{ t('admin.pricePlans.actions.delete') }}
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:open="isModalOpen"
      :title="isEditMode ? t('admin.pricePlans.modal.editTitle') : t('admin.pricePlans.modal.createTitle')"
      :width="600"
      :ok-text="t('admin.pricePlans.modal.save')"
      :cancel-text="t('admin.pricePlans.modal.cancel')"
      @ok="handleSavePlan"
      @cancel="resetForm"
    >
      <a-form
        ref="formRef"
        :model="formState"
        layout="vertical"
      >
        <a-form-item
          :label="t('admin.pricePlans.form.duration')"
          name="duration_months"
          :rules="[{ required: true, message: t('admin.pricePlans.form.durationRequired') }]"
        >
          <a-input-number
            v-model:value="formState.duration_months"
            :min="1"
            :max="36"
            class="w-full"
            :placeholder="t('admin.pricePlans.form.durationPlaceholder')"
          />
        </a-form-item>

        <a-form-item
          :label="t('admin.pricePlans.form.priceAmount')"
          name="price_amount"
          :rules="[{ required: true, message: t('admin.pricePlans.form.priceAmountRequired') }]"
        >
          <a-input-number
            v-model:value="formState.price_amount"
            :min="0"
            :precision="2"
            class="w-full"
            :placeholder="t('admin.pricePlans.form.priceAmountPlaceholder')"
          />
        </a-form-item>

        <a-form-item
          :label="t('admin.pricePlans.form.priceCurrency')"
          name="price_currency"
          :rules="[{ required: true, message: t('admin.pricePlans.form.priceCurrencyRequired') }]"
        >
          <a-select
            v-model:value="formState.price_currency"
            :placeholder="t('admin.pricePlans.form.priceCurrencyPlaceholder')"
          >
            <a-select-option value="VND">
              VND (₫)
            </a-select-option>
            <a-select-option value="USD">
              USD ($)
            </a-select-option>
            <a-select-option value="EUR">
              EUR (€)
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item name="is_active">
          <a-checkbox v-model:checked="formState.is_active">
            {{ t('admin.pricePlans.form.isAvailable') }}
          </a-checkbox>
        </a-form-item>
      </a-form>
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
</style>
