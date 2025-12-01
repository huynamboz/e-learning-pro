<script lang="ts" setup>
import type { Device } from '~/composables/api/useDeviceApi'
import { message, Modal } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { getDeviceId } from '~/api/apiClient'
import { useDeviceApi } from '~/composables/api/useDeviceApi'

definePageMeta({
  middleware: ['auth', 'onboarding'],
  layout: 'default',
})

const { t } = useI18n()
const { getDevices, revokeDevice, deleteDevice } = useDeviceApi()

// State
const loading = ref(false)
const devices = ref<Device[]>([])
const currentDeviceId = ref('')

// Get current device ID
onMounted(() => {
  currentDeviceId.value = getDeviceId()
  loadDevices()
})

// Load devices
async function loadDevices() {
  try {
    loading.value = true
    const response = await getDevices()

    // Handle both response formats: array directly or { code, data } object
    if (Array.isArray(response)) {
      devices.value = response
    }
    else if (response?.data && Array.isArray(response.data)) {
      devices.value = response.data
    }
    else {
      devices.value = []
    }
  }
  catch (error: any) {
    console.error('Error loading devices:', error)
    message.error(t('devices.notifications.loadFailed'))
  }
  finally {
    loading.value = false
  }
}

// Check if device is current device
function isCurrentDevice(deviceId: string) {
  return deviceId === currentDeviceId.value
}

// Get device type label
function getDeviceTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    laptop: t('devices.types.laptop'),
    tablet: t('devices.types.tablet'),
    phone: t('devices.types.phone'),
    web: t('devices.types.web'),
  }
  return typeMap[type] || type
}

// Format date
function formatDate(dateString: string) {
  if (!dateString)
    return '-'
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Handle revoke device
async function handleRevoke(device: Device) {
  Modal.confirm({
    title: t('devices.actions.revokeConfirm'),
    content: t('devices.actions.revokeDescription'),
    okText: t('devices.actions.revoke'),
    okType: 'danger',
    cancelText: t('global.cancel'),
    onOk: async () => {
      try {
        await revokeDevice(device.device_id)
        message.success(t('devices.notifications.revokeSuccess'))
        await loadDevices()
      }
      catch (error: any) {
        console.error('Error revoking device:', error)
        message.error(t('devices.notifications.revokeFailed'))
      }
    },
  })
}

// Handle delete device
async function handleDelete(device: Device) {
  Modal.confirm({
    title: t('devices.actions.deleteConfirm'),
    content: t('devices.actions.deleteDescription'),
    okText: t('devices.actions.delete'),
    okType: 'danger',
    cancelText: t('global.cancel'),
    onOk: async () => {
      try {
        await deleteDevice(device.device_id)
        message.success(t('devices.notifications.deleteSuccess'))
        await loadDevices()
      }
      catch (error: any) {
        console.error('Error deleting device:', error)
        message.error(t('devices.notifications.deleteFailed'))
      }
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-shade-1 via-shade-1 to-shade-2 p-4 sm:p-6 lg:p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <Icon name="solar:devices-bold" size="24" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-shade-9">
              {{ t('devices.title') }}
            </h1>
            <p class="text-shade-6">
              {{ t('devices.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-card border rounded-2xl p-6 sm:p-8 shadow-md">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <a-spin size="large" />
        </div>

        <!-- Empty State -->
        <div v-else-if="devices.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Icon name="solar:devices-bold" size="40" class="text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-shade-9 mb-2">
            {{ t('devices.empty.title') }}
          </h3>
          <p class="text-shade-6">
            {{ t('devices.empty.description') }}
          </p>
        </div>

        <!-- Devices Table -->
        <div v-else class="overflow-x-auto">
          <a-table
            :data-source="devices"
            :columns="[
              {
                title: t('devices.table.deviceName'),
                dataIndex: 'device_name',
                key: 'device_name',
              },
              {
                title: t('devices.table.deviceType'),
                dataIndex: 'device_type',
                key: 'device_type',
              },
              {
                title: t('devices.table.ipAddress'),
                dataIndex: 'ip_address_masked',
                key: 'ip_address_masked',
              },
              {
                title: t('devices.table.lastLogin'),
                dataIndex: 'last_login_at',
                key: 'last_login_at',
              },
              {
                title: t('devices.table.status'),
                dataIndex: 'is_active',
                key: 'is_active',
              },
              {
                title: t('devices.table.actions'),
                key: 'actions',
              },
            ]"
            :pagination="false"
            :loading="loading"
            class="w-full"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'device_name'">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 flex items-center justify-center rounded-lg"
                    :class="{
                      'bg-blue-100': record.device_type === 'laptop',
                      'bg-purple-100': record.device_type === 'tablet',
                      'bg-green-100': record.device_type === 'phone',
                      'bg-orange-100': record.device_type === 'web',
                    }"
                  >
                    <Icon
                      :name="{
                        laptop: 'solar:laptop-bold',
                        tablet: 'solar:tablet-bold',
                        phone: 'solar:smartphone-bold',
                        web: 'solar:global-bold',
                      }[record.device_type] || 'solar:devices-bold'"
                      size="20"
                      :class="{
                        'text-blue-600': record.device_type === 'laptop',
                        'text-purple-600': record.device_type === 'tablet',
                        'text-green-600': record.device_type === 'phone',
                        'text-orange-600': record.device_type === 'web',
                      }"
                    />
                  </div>
                  <div>
                    <div class="font-medium text-shade-9">
                      {{ record.device_name }}
                    </div>
                    <div class="text-xs text-shade-6">
                      {{ record.device_id }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'device_type'">
                <span class="text-shade-9">
                  {{ getDeviceTypeLabel(record.device_type) }}
                </span>
              </template>
              <template v-else-if="column.key === 'last_login_at'">
                <span class="text-shade-9">
                  {{ formatDate(record.last_login_at) }}
                </span>
              </template>
              <template v-else-if="column.key === 'is_active'">
                <a-tag :color="record.is_active ? 'green' : 'red'">
                  {{ record.is_active ? t('devices.status.active') : t('devices.status.inactive') }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <div class="flex items-center gap-2">
                  <a-tag v-if="isCurrentDevice(record.device_id)" color="blue">
                    Thiết bị hiện tại
                  </a-tag>
                  <template v-else>
                    <a-button
                      size="small"
                      danger
                      @click="handleRevoke(record)"
                    >
                      {{ t('devices.actions.revoke') }}
                    </a-button>
                    <a-button
                      size="small"
                      danger
                      type="primary"
                      @click="handleDelete(record)"
                    >
                      {{ t('devices.actions.delete') }}
                    </a-button>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-table) {
  background: transparent;
}

:deep(.ant-table-thead > tr > th) {
  background: var(--shade-1);
  border-bottom: 2px solid var(--border);
  font-weight: 600;
  color: var(--shade-9);
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border);
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: var(--shade-1);
}

:deep(.ant-btn) {
  border-radius: 8px;
  font-weight: 500;
}
</style>
