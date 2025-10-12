<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

interface Props {
  visible: boolean
  session: any
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'deleted'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { deleteClassroomSession } = useClassroomApi()

// Internal loading state
const internalLoading = ref(false)

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Handle delete
async function handleDelete() {
  if (!props.session?.id)
    return

  try {
    internalLoading.value = true

    await deleteClassroomSession(props.session.id)

    // Show success notification
    notification.success({
      message: t('admin.classroom.detail.sessionDeleted'),
      duration: 3,
    })

    // Emit deleted event to parent
    emit('deleted')

    // Close dialog
    isVisible.value = false
  }
  catch (err: any) {
    console.error('Error deleting session:', err)
    notification.error({
      message: t('admin.classroom.detail.sessionDeleteFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    internalLoading.value = false
  }
}

// Handle cancel
function handleCancel() {
  emit('cancel')
  isVisible.value = false
}
</script>

<script lang="ts">
// Format session date and time for display
function formatSessionDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.detail.deleteSession')"
    width="500px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Warning Icon -->
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Icon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
      </div>

      <!-- Confirmation Message -->
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ $t('admin.classroom.detail.confirmDeleteSession') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ $t('admin.classroom.detail.deleteSessionWarning') }}
        </p>

        <!-- Session Info -->
        <div v-if="session" class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="text-sm text-gray-700">
            <div class="font-medium mb-1">
              {{ session.topic }}
            </div>
            <div class="text-gray-500">
              {{ $t('admin.classroom.detail.startTime') }}: {{ formatSessionDateTime(session.start_time) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Actions -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
      <a-button @click="handleCancel">
        {{ $t('admin.classroom.meetingLink.cancel') }}
      </a-button>
      <a-button
        type="primary"
        danger
        :loading="internalLoading"
        @click="handleDelete"
      >
        {{ $t('admin.classroom.detail.deleteSession') }}
      </a-button>
    </div>
  </a-modal>
</template>
