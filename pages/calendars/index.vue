<script setup lang="ts">
// @ts-ignore - vue-cal doesn't have type definitions
import { addDays, formatDate, VueCal } from 'vue-cal'
import 'vue-cal/style'
import type { CalendarApiResponse, CalendarClassroom, CalendarSession } from '~/types/course.type'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

interface CalendarEvent {
  start: string
  end: string
  title: string
  class?: string
  content?: string
  background?: boolean
  deletable?: boolean
  resizable?: boolean
  schedule?: number
  id?: string
  description?: string
  meeting_link?: string
  classroom_id?: string
  course_title?: string
}

interface DemoExample {
  events: CalendarEvent[]
}

const ready: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)
const upcomingEvent: Ref<CalendarEvent | null> = ref(null)

// Join class dialog state
const isJoinClassDialogVisible = ref(false)
const selectedEventForJoin = ref<CalendarEvent | null>(null)
const isJoiningClass = ref(false)
const checkInError = ref<string | null>(null)

const data: Ref<DemoExample> = ref({
  editable: false,
  events: [],
})

const selectedDate: Ref<Date> = ref(new Date())
const viewDate: Ref<Date> = ref(new Date())
const currentView: Ref<string> = ref('week')

// Get current route
const route = useRoute()

// API composable
const { getCalendarData, selfCheckInSession } = useClassroomApi()

// Convert session data to calendar events
const convertSessionToEvent = (session: CalendarSession, classroom: CalendarClassroom): CalendarEvent => {
  const startDate = new Date(session.start_time)
  const endDate = new Date(session.end_time)
  
  return {
    id: session.id,
    start: `${formatDate(startDate)} ${startDate.toTimeString().slice(0, 5)}`,
    end: `${formatDate(endDate)} ${endDate.toTimeString().slice(0, 5)}`,
    title: session.topic,
    classroom_id: classroom.id,
    course_title: classroom.course.title,
    meeting_link: session.meeting_link || '',
    resizable: false,
    schedule: 1,
  }
}

// Fetch calendar data
const fetchCalendarData = async () => {
  try {
    loading.value = true
    const response = await getCalendarData({
      view: currentView.value,
      date: formatDate(selectedDate.value),
    })
    // Convert sessions to calendar events
    const events: CalendarEvent[] = []
    response.classrooms.forEach((classroom: CalendarClassroom) => {
      classroom.sessions.forEach((session: CalendarSession) => {
        events.push(convertSessionToEvent(session, classroom))
      })
    })
    
    data.value.events = events
    
    // Find the next upcoming event within 1 day
    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
    
    const upcomingEvents = response.classrooms
      .flatMap((classroom: CalendarClassroom) => 
        classroom.sessions.map((session: CalendarSession) => convertSessionToEvent(session, classroom))
      )
      .filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start)
        return eventDate > now && eventDate <= oneDayFromNow
      })
      .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start).getTime() - new Date(b.start).getTime())
    
      console.log(upcomingEvents)
    if (upcomingEvents.length > 0) {
      upcomingEvent.value = upcomingEvents[0]
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for view date changes (week changes)
watch(viewDate, async () => {
  await fetchCalendarData()
})

// Watch for selected date changes
watch(selectedDate, async () => {
  await fetchCalendarData()
})

// Watch for view changes
watch(currentView, async () => {
  await fetchCalendarData()
})

// Handle join class
function startJoinClass(event: CalendarEvent) {
  selectedEventForJoin.value = event
  checkInError.value = null // Reset error when opening dialog
  isJoinClassDialogVisible.value = true
}

// Confirm join class
async function confirmJoinClass() {
  if (!selectedEventForJoin.value?.id || !selectedEventForJoin.value?.classroom_id) {
    return
  }

  try {
    isJoiningClass.value = true
    checkInError.value = null
    
    // Call self check-in API
    await selfCheckInSession(selectedEventForJoin.value.id, selectedEventForJoin.value.classroom_id)
    
    // Open meeting link in new tab only if check-in succeeds
    if (selectedEventForJoin.value.meeting_link) {
      window.open(selectedEventForJoin.value.meeting_link, '_blank')
    }
    
    // Close dialog and reset state
    isJoinClassDialogVisible.value = false
    selectedEventForJoin.value = null
  } catch (error: any) {
    console.error('Error checking in to session:', error)
    
    // Handle check-in availability error
    if (error?.data?.detail) {
      const errorMessage = error.data.detail
      
      // Check if it's a "check-in not yet available" error
      if (errorMessage.includes('Check-in not yet available')) {
        checkInError.value = 'checkInTooEarly'
      } else {
        // Use the backend message as i18n key for other errors
        checkInError.value = errorMessage
      }
    } else {
      checkInError.value = 'checkInFailed'
    }
    
    // Don't open meeting link if check-in fails
  } finally {
    isJoiningClass.value = false
  }
}

// Cancel join class
function cancelJoinClass() {
  isJoinClassDialogVisible.value = false
  selectedEventForJoin.value = null
  checkInError.value = null
}

onMounted(async () => {
  await fetchCalendarData()
  setTimeout(() => {
    ready.value = true
  }, 400)
})
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-2 h-full max-h-[calc(100vh-100px)] px-4 lg:px-8 pt-2">
    <!-- Date picker and upcoming events - stack on mobile -->
    <div class="flex flex-col gap-2.5 p-4 lg:p-8 border border-[#E2E8F0] shadow-[0px_4px_20px_3px_#0000000A] h-fit justify-center rounded-[12px]">
      <VueCal
        v-model:selected-date="selectedDate"
        class="w-full custom-theme date-picker"
        date-picker
        view="month"
        :view-date="viewDate"
        :views-bar="false"
        style="height: 225px"
        @update:selected-date="viewDate = $event"
      />
      <div class="text-base lg:text-[18px] font-semibold pb-2.5 border-b border-[#E4E4E7]">
        Upcoming event <span class="text-[#DC2626]">({{ upcomingEvent ? '1' : '0' }})</span>
      </div>
      <div v-if="loading" class="text-xs text-gray-500">
        Loading upcoming events...
      </div>
      <div v-else-if="upcomingEvent" class="grid text-xs">
        <b>{{ upcomingEvent.title }}</b>
        <span>At: <b class="text-[#15803D]">{{ upcomingEvent.start.split(' ')[1] }} - {{ upcomingEvent.end.split(' ')[1] }}</b></span>
        <span v-if="upcomingEvent.course_title" class="text-gray-600">{{ upcomingEvent.course_title }}</span>
        <span v-else class="text-gray-500">No course information</span>
        <div v-if="upcomingEvent.meeting_link" class="mt-2">
          <a-button 
            type="primary" 
            size="small" 
            class="!bg-[#548A1D] !text-white !flex items-center justify-center"
            @click="startJoinClass(upcomingEvent)"
          >
            <Icon name="i-heroicons-video-camera" class="w-4 h-4 mr-1" />
            Vào học
          </a-button>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500">
        No upcoming events
      </div>
    </div>

    <!-- Main calendar -->
    <!-- <div v-if="loading" class="flex items-center justify-center h-full min-h-[500px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC2626] mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">Loading calendar events...</p>
      </div>
    </div> -->
    <VueCal
      v-model:selected-date="selectedDate"
      v-model:view-date="viewDate"
      v-model:view="currentView"
      class="w-full !h-full custom-theme calendar min-h-[500px]"
      :time-from="7 * 60"
      :time-step="60"
      :time-to="23 * 60"
      :time-cell-height="72"
      :events="data.events"
      :views="['month', 'week', 'day']"
    />

    <!-- Join Class Confirmation Dialog -->
    <a-modal
      v-model:open="isJoinClassDialogVisible"
      title="Xác nhận vào học"
      :footer="null"
      @cancel="cancelJoinClass"
    >
      <div class="space-y-4">
        <div v-if="selectedEventForJoin" class="text-center">
          <Icon name="i-heroicons-video-camera" class="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ selectedEventForJoin.title }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Bạn có chắc chắn muốn tham gia buổi học này?
          </p>
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-600">Thời gian:</span>
              <span class="font-medium">{{ selectedEventForJoin.start.split(' ')[1] }} - {{ selectedEventForJoin.end.split(' ')[1] }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Khóa học:</span>
              <span class="font-medium">{{ selectedEventForJoin.course_title }}</span>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="checkInError" class="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div class="flex items-start gap-2">
              <Icon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-red-800">{{ $t('calendar.error.cannotJoinClass') }}</p>
                <p class="text-sm text-red-700 mt-1">
                  <template v-if="checkInError === 'checkInTooEarly'">
                    {{ $t('calendar.error.checkInTooEarly') }}
                  </template>
                  <template v-else-if="checkInError === 'checkInFailed'">
                    {{ $t('calendar.error.checkInFailed') }}
                  </template>
                  <template v-else>
                    {{ checkInError }}
                  </template>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dialog Actions -->
      <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
        <a-button @click="cancelJoinClass">
          Hủy
        </a-button>
        <a-button
          type="primary"
          class="!bg-[#548A1D]"
          :loading="isJoiningClass"
          :disabled="!!checkInError"
          @click="confirmJoinClass"
        >
          <Icon v-if="!isJoiningClass" name="i-heroicons-video-camera" class="w-4 h-4 mr-2" />
          {{ isJoiningClass ? 'Đang vào học...' : 'Vào học' }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<style>
/* Global Vue-cal theme customization - must be unscoped */
.vuecal.custom-theme {
  --vuecal-primary-color: #fff;
  --vuecal-secondary-color: #fff;
  --vuecal-base-color: #000;
  --vuecal-contrast-color: #fff;
}
.vuecal__header {
    color: var(--vuecal-base-color) !important;
}

.vuecal__event {
    color: var(--vuecal-base-color) !important;
    border-color: var(--vuecal-primary-color) !important;
}

.vuecal__today-btn {
    color: var(--vuecal-base-color) !important;
}
.vuecal--default-theme .vuecal__event {
  background-color: #0EA5E91A;
  padding: 6px;
  border-radius: 4px;
}
.calendar .vuecal__views-bar .vuecal__view-button {
  background: transparent;
  color: #71717A;
  border-radius: 8px;
}
.calendar .vuecal__views-bar .vuecal__view-button--active {
  background: #DC2626;
  color: #fff;
}
.calendar .vuecal__transition-wrap {
  display: none;
}
.vuecal__header {
  border: 1px solid #E4E4E7;
  border-bottom: none;
}
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today:before {
    background-color: #615bffc2;
}
.date-picker.vuecal--default-theme.vuecal--light .vuecal__cell--selected:before {
    background-color: #605BFF;
}
.date-picker.vuecal--default-theme.vuecal--date-picker .vuecal__cell-date {
  font-weight: 500;
}
.date-picker .vuecal__cell--selected,
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today {
  color: #fff;
}
.date-picker .vuecal__cell:hover.vuecal__cell:before {
  background-color: #605BFF;
}
.date-picker .vuecal__cell:hover {
  color: #fff;
  cursor: pointer;
}
.calendar .vuecal__title-bar button {
  background-color: #F4F4F5;
  height: 28px;
  border-radius: 6px;
}
.calendar .vuecal__nav--today {
  margin-left: 3px;
}

.vuecal__event {
  position: relative;
  overflow: hidden;
}

.vuecal__event .vuecal__event-title, .calendar .vuecal__event-time {
  font-size: 14px;
  color: #0369A1;
}
.vuecal__event .vuecal__event-time {
  font-weight: 600;
  margin-top: 4px;
}
.vuecal__event::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: #0EA5E9;
}
</style>
