<script setup lang="ts">
import type { CalendarEvent } from '~/pages/calendars/index.vue'


interface Props {
  visible: boolean
  event: CalendarEvent | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
  (e: 'joinClass', event: CalendarEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Computed for dialog visibility
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value)
    if (!value) {
      emit('close')
    }
  }
})

// Format date and time
function formatDateTime(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle meeting link click
function handleMeetingLinkClick() {
  const meetingLink = props.event?.meeting_link || props.event?.classroom?.sessions?.[0]?.meeting_link
  if (meetingLink) {
    window.open(meetingLink, '_blank')
  }
}

// Check if event is ended
function isEventEnded(): boolean {
  if (!props.event?.end) return false
  const now = new Date()
  const eventEndTime = new Date(props.event.end)
  return eventEndTime < now
}
</script>

<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="event?.title || ''"
    width="500px"
    :footer="null"
    centered
    class="event-detail-modal"
  >
    <div v-if="event" class="space-y-6">
      <!-- Event Header -->
      <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <Icon name="solar:calendar-bold-duotone" size="24" class="text-blue-600" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ event.classroom?.title || event.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ event.classroom?.course?.title || event.course_title || 'Khóa học' }}
          </p>
        </div>
      </div>

      <!-- Date and Time -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <Icon name="solar:calendar-add-bold" size="20" class="text-gray-500" />
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ formatDateTime(event.start) }}
            </p>
            <p class="text-sm text-gray-600">
              {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
            </p>
          </div>
        </div>

        <!-- Session Info -->
        <div v-if="event.classroom?.sessions?.[0]" class="flex items-center gap-3">
          <Icon name="solar:play-circle-bold" size="20" class="text-gray-500" />
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ t('calendar.event.session') }}
            </p>
            <p class="text-sm text-gray-600">
              {{ event.classroom.sessions[0].topic || 'Buổi học' }}
            </p>
          </div>
        </div>

        <!-- Enrollment Count -->
        <div v-if="event.classroom?.enrollment_count" class="flex items-center gap-3">
          <Icon name="solar:user-plus-bold" size="20" class="text-gray-500" />
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ t('calendar.event.enrollmentCount') }}
            </p>
            <p class="text-sm text-gray-600">
              {{ event.classroom.enrollment_count }} {{ t('calendar.event.enrolled') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Meeting Link Section -->
      <div v-if="event.meeting_link || event.classroom?.sessions?.[0]?.meeting_link" class="space-y-3">
        <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div class="flex items-start gap-3">
            <Icon name="solar:danger-triangle-bold" size="20" class="text-yellow-600 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-yellow-800 mb-1">
                {{ t('calendar.event.meetingLinkNote') }}
              </p>
              <p class="text-xs text-yellow-700">
                {{ t('calendar.event.meetingLinkWarning') }}
              </p>
            </div>
          </div>
        </div>

       
        <div
          v-if="!isEventEnded() && (event.meeting_link || event.classroom?.sessions?.[0]?.meeting_link)"
          type="primary"
          size="large"
          class="w-full !h-12 !flex !items-center !justify-center gap-2 !rounded-lg !text-sm !font-semibold"
          @click="handleMeetingLinkClick"
        >
        <p class="text-sm text-green-600 underline cursor-pointer">
            {{ event.meeting_link || event.classroom?.sessions?.[0]?.meeting_link }}
        </p>
          <Icon name="solar:video-camera-bold" size="18" />
        </div>

        <div v-else class="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
          <Icon name="solar:clock-circle-bold" size="18" class="text-gray-500" />
          <span class="text-sm text-gray-600">
            {{ t('calendar.event.ended') }}
          </span>
        </div>
      </div>

      <!-- No Meeting Link -->
      <div v-else-if="!isEventEnded() && !event.meeting_link && !event.classroom?.sessions?.[0]?.meeting_link" class="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Icon name="solar:exclamation-triangle-bold" size="18" class="text-gray-500" />
        <span class="text-sm text-gray-600">
          {{ t('calendar.event.noMeetingLink') }}
        </span>
      </div>

      <!-- join class button -->
      <div v-if="!isEventEnded() && (event.meeting_link || event.classroom?.sessions?.[0]?.meeting_link)" class="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <a-button type="primary" size="large" class="w-full" @click="$emit('joinClass', event)">
          {{ t('calendar.joinClass.joinNow') }}
        </a-button>
      </div>

      <!-- Event Description -->
      <div v-if="event.description" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-900">
          {{ t('calendar.event.description') }}
        </h4>
        <p class="text-sm text-gray-600 leading-relaxed">
          {{ event.description }}
        </p>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.event-detail-modal :deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

.event-detail-modal :deep(.ant-modal-body) {
  padding: 24px;
}

.event-detail-modal :deep(.ant-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 12px 24px;
}
</style>
