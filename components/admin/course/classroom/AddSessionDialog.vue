<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

interface Props {
  visible: boolean
  classroomId: string
  defaultLimit?: number
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: any): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  defaultLimit: 0,
  loading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { createClassroomSession } = useClassroomApi()

// Internal loading state
const internalLoading = ref(false)

// Form state
const formState = ref({
  topic: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
  limit: 0,
  status: 'scheduled',
})

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Watch for visible changes to reset form
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    formState.value = {
      topic: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      meeting_link: '',
      meeting_id: '',
      meeting_pass: '',
      limit: props.defaultLimit,
      status: 'scheduled',
    }
  }
})

// Validate form
function validateForm(): boolean {
  // Validate topic
  if (!formState.value.topic.trim()) {
    notification.error({
      message: t('admin.classroom.detail.sessionTopicRequired'),
      duration: 3,
    })
    return false
  }

  // Validate start time
  if (!formState.value.start_time) {
    notification.error({
      message: t('admin.classroom.detail.startTimeRequired'),
      duration: 3,
    })
    return false
  }

  // Validate end time
  if (!formState.value.end_time) {
    notification.error({
      message: t('admin.classroom.detail.endTimeRequired'),
      duration: 3,
    })
    return false
  }

  // Validate time logic
  const startTime = new Date(formState.value.start_time)
  const endTime = new Date(formState.value.end_time)
  const now = new Date()

  // Check if start time is in the past
  if (startTime <= now) {
    notification.error({
      message: t('admin.classroom.detail.startTimeInPast'),
      duration: 3,
    })
    return false
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    notification.error({
      message: t('admin.classroom.detail.endTimeAfterStartTime'),
      duration: 3,
    })
    return false
  }

  // Check if session duration is reasonable (at least 15 minutes)
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  if (durationMinutes < 15) {
    notification.error({
      message: t('admin.classroom.detail.sessionTooShort'),
      duration: 3,
    })
    return false
  }

  // Check if session duration is not too long (max 8 hours)
  if (durationMinutes > 480) {
    notification.error({
      message: t('admin.classroom.detail.sessionTooLong'),
      duration: 3,
    })
    return false
  }

  return true
}

// Handle save
async function handleSave() {
  if (!validateForm()) {
    return
  }

  try {
    internalLoading.value = true

    const formData = {
      classroom: props.classroomId,
      topic: formState.value.topic,
      description: formState.value.description,
      start_time: new Date(formState.value.start_time).toISOString(),
      end_time: new Date(formState.value.end_time).toISOString(),
      location: formState.value.location,
      meeting_link: formState.value.meeting_link,
      meeting_id: formState.value.meeting_id,
      meeting_pass: formState.value.meeting_pass,
      limit: formState.value.limit,
      status: formState.value.status,
    }

    // Make API call to create session
    await createClassroomSession(props.classroomId, formData)

    // Show success notification
    notification.success({
      message: t('admin.classroom.detail.sessionCreated'),
      duration: 3,
    })

    // Emit save event to parent
    emit('save', formData)

    // Close dialog
    isVisible.value = false
  }
  catch (err: any) {
    console.error('Error creating session:', err)
    notification.error({
      message: t('admin.classroom.detail.sessionCreateFailed'),
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

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.detail.addSession')"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Topic -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.sessionTopic') }}
        </label>
        <a-input
          v-model:value="formState.topic"
          :placeholder="$t('admin.classroom.detail.sessionTopicPlaceholder')"
          size="large"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.sessionDescription') }}
        </label>
        <a-textarea
          v-model:value="formState.description"
          :placeholder="$t('admin.classroom.detail.sessionDescriptionPlaceholder')"
          :rows="3"
          size="large"
        />
      </div>

      <!-- Date and Time -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.startTime') }}
          </label>
          <a-input
            v-model:value="formState.start_time"
            type="datetime-local"
            size="large"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.endTime') }}
          </label>
          <a-input
            v-model:value="formState.end_time"
            type="datetime-local"
            size="large"
          />
        </div>
      </div>

      <!-- Location -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.location') }}
        </label>
        <a-input
          v-model:value="formState.location"
          :placeholder="$t('admin.classroom.detail.locationPlaceholder')"
          size="large"
        />
      </div>

      <!-- Meeting Information -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900">
          {{ $t('admin.classroom.detail.meetingInfo') }}
        </h4>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.meetingLink') }}
          </label>
          <a-input
            v-model:value="formState.meeting_link"
            :placeholder="$t('admin.classroom.meetingLink.meetingLinkPlaceholder')"
            size="large"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('admin.classroom.detail.meetingId') }}
            </label>
            <a-input
              v-model:value="formState.meeting_id"
              :placeholder="$t('admin.classroom.detail.meetingIdPlaceholder')"
              size="large"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('admin.classroom.detail.meetingPassword') }}
            </label>
            <a-input
              v-model:value="formState.meeting_pass"
              :placeholder="$t('admin.classroom.detail.meetingPasswordPlaceholder')"
              size="large"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.participantLimit') }}
          </label>
          <a-input-number
            v-model:value="formState.limit"
            :min="1"
            :max="1000"
            size="large"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.status') }}
          </label>
          <a-select
            v-model:value="formState.status"
            size="large"
            class="w-full"
          >
            <a-select-option value="scheduled">
              {{ $t('admin.classroom.detail.scheduled') }}
            </a-select-option>
            <a-select-option value="ongoing">
              {{ $t('admin.classroom.detail.ongoing') }}
            </a-select-option>
            <a-select-option value="completed">
              {{ $t('admin.classroom.detail.completed') }}
            </a-select-option>
            <a-select-option value="cancelled">
              {{ $t('admin.classroom.detail.cancelled') }}
            </a-select-option>
          </a-select>
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
        :loading="internalLoading"
        class="!bg-[#548A1D]"
        @click="handleSave"
      >
        {{ $t('admin.classroom.detail.createSession') }}
      </a-button>
    </div>
  </a-modal>
</template>
