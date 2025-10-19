<script setup lang="ts">
// @ts-ignore - vue-cal doesn't have type definitions
import { addDays, formatDate, VueCal } from 'vue-cal'
import 'vue-cal/style'
import type { ClassroomSession } from '~/composables/api/useClassroomApi'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
// import '@/assets/css/custom.css'

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
}

interface DemoExample {
  events: CalendarEvent[]
}

const ready: Ref<boolean> = ref(false)
const loading: Ref<boolean> = ref(false)
const upcomingEvent: Ref<CalendarEvent | null> = ref(null)

const data: Ref<DemoExample> = ref({
  editable: false,
  events: [],
})

const selectedDate: Ref<Date> = ref(new Date())
const viewDate: Ref<Date> = ref(new Date())

// Get route parameters
const route = useRoute()
const classroomId = route.params.classroomId as string

// API composable
const { getClassroomSessions } = useClassroomApi()

// Helper function to safely extract time from date string
function extractTimeFromDateString(dateString: string | undefined): string {
  if (!dateString || typeof dateString !== 'string') {
    return ''
  }
  const parts = dateString.split(' ')
  return parts.length > 1 ? parts[1] : ''
}

// Convert session data to calendar events
const convertSessionToEvent = (session: ClassroomSession): CalendarEvent => {
  const startDate = new Date(session.start_time)
  const endDate = new Date(session.end_time)
  
  return {
    id: session.id,
    start: `${formatDate(startDate)} ${startDate.toTimeString().slice(0, 5)}`,
    end: `${formatDate(endDate)} ${endDate.toTimeString().slice(0, 5)}`,
    title: session.topic,
    description: session.description,
    meeting_link: session.meeting_link,
    resizable: false,
    schedule: 1,
  }
}

// Fetch classroom sessions
const fetchSessions = async () => {
  if (!classroomId) return
  
  try {
    loading.value = true
    const response = await getClassroomSessions(classroomId)
    
    // Convert sessions to calendar events
    data.value.events = response.results.map(convertSessionToEvent)
    
    // Find the next upcoming event
    const now = new Date()
    const upcomingEvents = response.results
      .filter((session: ClassroomSession) => new Date(session.start_time) > now)
      .sort((a: ClassroomSession, b: ClassroomSession) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    
    if (upcomingEvents.length > 0) {
      upcomingEvent.value = convertSessionToEvent(upcomingEvents[0])
    }
  } catch (error) {
    console.error('Error fetching classroom sessions:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchSessions()
  setTimeout(() => {
    ready.value = true
  }, 400)
})
</script>

<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-2 h-full max-h-[calc(100vh-100px)] pt-2">
    <!-- Date picker and upcoming events - stack on mobile -->
    <div class="flex flex-col gap-2.5 p-4 border border-[#E2E8F0] shadow-[0px_4px_20px_3px_#0000000A] h-fit justify-center rounded-[12px]">
      <VueCal
        v-model:selected-date="selectedDate"
        class="!w-full custom-theme date-picker"
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
        <span>At: <b class="text-[#15803D]">{{ extractTimeFromDateString(upcomingEvent.start) }} - {{ extractTimeFromDateString(upcomingEvent.end) }}</b></span>
        <span v-if="upcomingEvent.meeting_link" class="break-all">Link: {{ upcomingEvent.meeting_link }}</span>
        <span v-else class="text-gray-500">No meeting link provided</span>
      </div>
      <div v-else class="text-xs text-gray-500">
        No upcoming events
      </div>
    </div>

    <!-- Main calendar -->
    <div v-if="loading" class="flex items-center justify-center h-full min-h-[500px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC2626] mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">Loading calendar events...</p>
      </div>
    </div>
    <VueCal
      v-else
      v-model:selected-date="selectedDate"
      v-model:view-date="viewDate"
      class="w-full !h-[80vh] custom-theme calendar min-h-[500px]"
      :time-from="7 * 60"
      :time-step="60"
      :time-to="23 * 60"
      :time-cell-height="72"
      :events="data.events"
      :views="['month', 'week', 'day']"
    />
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
