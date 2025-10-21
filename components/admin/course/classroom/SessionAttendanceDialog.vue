<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi, type SessionAttendance } from '~/composables/api/useClassroomApi'

interface Props {
  visible: boolean
  sessionId: string
  sessionTopic?: string
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  sessionTopic: '',
  loading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getSessionAttendance } = useClassroomApi()

// State
const attendance = ref<SessionAttendance[]>([])
const internalLoading = ref(false)
const error = ref<string | null>(null)

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Load attendance when dialog opens
watch(() => props.visible, async (newVisible) => {
  if (newVisible && props.sessionId) {
    await loadAttendance()
  }
})

// Load attendance data
async function loadAttendance() {
  try {
    internalLoading.value = true
    error.value = null
    
    const response = await getSessionAttendance(props.sessionId)
    attendance.value = response || []
  }
  catch (err: any) {
    console.error('Error loading session attendance:', err)
    error.value = err.message || t('admin.classroom.detail.attendanceLoadFailed')
    notification.error({
      message: t('admin.classroom.detail.attendanceLoadFailed'),
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

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get status badge class and text
function getStatusBadge(status: string): { class: string, text: string } {
  switch (status) {
    case 'present':
      return {
        class: 'bg-green-100 text-green-800',
        text: t('admin.classroom.detail.present'),
      }
    case 'late':
      return {
        class: 'bg-orange-100 text-orange-800',
        text: t('admin.classroom.detail.late'),
      }
    default:
      return {
        class: 'bg-gray-100 text-gray-800',
        text: status,
      }
  }
}

// Get display name for user
function getUserDisplayName(user: SessionAttendance['user_info']): string {
  if (user.full_name && user.full_name.trim()) {
    return user.full_name
  }
  
  const fullName = `${user.last_name || ''} ${user.first_name || ''}`.trim()
  if (fullName) {
    return fullName
  }
  
  return user.username || user.email || 'N/A'
}
</script>

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.detail.sessionAttendance')"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Session Info -->
      <div v-if="sessionTopic" class="bg-blue-50 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-calendar-days" class="w-5 h-5 text-blue-600" />
          <span class="font-medium text-blue-900">{{ sessionTopic }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="internalLoading" class="flex items-center justify-center py-8">
        <a-spin size="large" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <Icon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p class="text-red-500 mb-4">{{ error }}</p>
        <a-button @click="loadAttendance">
          {{ $t('common.tryAgain') }}
        </a-button>
      </div>

      <!-- Empty State -->
      <div v-else-if="attendance.length === 0" class="text-center py-8">
        <Icon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 mb-4">
          {{ $t('admin.classroom.detail.noAttendance') }}
        </p>
      </div>

      <!-- Attendance List -->
      <div v-else class="space-y-3" v-if="attendance?.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('admin.classroom.detail.totalAttendance') }}: {{ attendance.length }}
          </h3>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-100 rounded-full"></div>
              <span>{{ attendance.filter(a => a.status === 'present').length }} {{ $t('admin.classroom.detail.present') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-orange-100 rounded-full"></div>
              <span>{{ attendance.filter(a => a.status === 'late').length }} {{ $t('admin.classroom.detail.late') }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-3">
          <div
            v-for="(record, index) in attendance"
            :key="record.id || index"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="i-heroicons-user" class="w-6 h-6 text-blue-600" />
                </div>

                <!-- User Info -->
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 mb-1">
                    {{ getUserDisplayName(record.user_info) }}
                  </h4>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div v-if="record.user_info.email" class="flex items-center gap-2">
                      <Icon name="i-heroicons-envelope" class="w-4 h-4" />
                      <span>{{ record.user_info.email }}</span>
                    </div>
                    <div v-if="record.user_info.username" class="flex items-center gap-2">
                      <Icon name="i-heroicons-user" class="w-4 h-4" />
                      <span>{{ record.user_info.username }}</span>
                    </div>
                    <div v-if="record.checked_at" class="flex items-center gap-2">
                      <Icon name="i-heroicons-clock" class="w-4 h-4" />
                      <span>{{ $t('admin.classroom.detail.checkedAt') }}: {{ formatDate(record.checked_at) }}</span>
                    </div>
                  </div>
                  <div v-if="record.note" class="mt-2 text-sm text-gray-500 italic">
                    {{ record.note }}
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <span
                  class="whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusBadge(record.status).class"
                >
                  {{ getStatusBadge(record.status).text }}
                </span>
              </div>
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
    </div>
  </a-modal>
</template>
