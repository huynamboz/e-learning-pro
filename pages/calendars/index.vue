<script setup lang="ts">
import type { CalendarClassroom, CalendarSession } from '~/types/course.type'
import { formatDate, VueCal } from 'vue-cal'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import 'vue-cal/style'

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
const upcomingEvents: Ref<CalendarEvent[]> = ref([])
const isDatePickerOpen: Ref<boolean> = ref(false)

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

// API composable
const { getCalendarData, selfCheckInSession } = useClassroomApi()


// Convert session data to calendar events
function convertSessionToEvent(session: CalendarSession, classroom: CalendarClassroom): CalendarEvent {
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
async function fetchCalendarData() {
  try {
    loading.value = true
    data.value.events = []
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

    // Find events happening today
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000) // Start of tomorrow

    const todayEvents = response.classrooms
      .flatMap((classroom: CalendarClassroom) =>
        classroom.sessions.map((session: CalendarSession) => convertSessionToEvent(session, classroom)),
      )
      .filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start)
        return eventDate >= today && eventDate < tomorrow
      })
      .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start).getTime() - new Date(b.start).getTime())

    upcomingEvents.value = todayEvents
  }
  catch (error) {
    console.error('Error fetching calendar data:', error)
  }
  finally {
    loading.value = false
  }
}

// Watch for view date changes (week changes)
watch(viewDate, async (newViewDate) => {
  // Update selectedDate to the first day of the week when navigating
  if (currentView.value === 'week') {
    const firstDayOfWeek = new Date(newViewDate)
    const dayOfWeek = firstDayOfWeek.getDay()
    const diff = firstDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Monday start
    firstDayOfWeek.setDate(diff)
    selectedDate.value = firstDayOfWeek
  }
  await fetchCalendarData()
})

// Watch for selected date changes
// watch(selectedDate, async () => {
//   await fetchCalendarData()
// })

// Watch for view changes
// watch(currentView, async () => {
//   await fetchCalendarData()
// })

// Handle join class
function startJoinClass(event: CalendarEvent) {
  selectedEventForJoin.value = event
  checkInError.value = null // Reset error when opening dialog
  isJoinClassDialogVisible.value = true
}

// Confirm join class
async function confirmJoinClass() {
  if (!selectedEventForJoin.value?.id || !selectedEventForJoin.value?.classroom_id || !selectedEventForJoin.value?.meeting_link) {
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
  }
  catch (error: any) {
    console.error('Error checking in to session:', error)

    if (error?.data?.attendance?.status === 'present') {
      if (selectedEventForJoin.value?.meeting_link) {
        window.open(selectedEventForJoin.value?.meeting_link, '_blank')
      }
      return
    }
    // Handle check-in availability error
    if (error?.data?.detail) {
      const errorMessage = error.data.detail

      // Check if it's a "check-in not yet available" error
      if (errorMessage.includes('Check-in not yet available')) {
        checkInError.value = 'checkInTooEarly'
      }
      else {
        // Use the backend message as i18n key for other errors
        checkInError.value = errorMessage
      }
    }
    else {
      checkInError.value = 'checkInFailed'
    }

    // Don't open meeting link if check-in fails
  }
  finally {
    isJoiningClass.value = false
  }
}

// Check if event has ended
function isEventEnded(event: CalendarEvent): boolean {
  const now = new Date()
  const eventEndTime = new Date(event.end)
  return eventEndTime < now
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
  <div class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {{ $t('calendar.header.subtitle') }}
          </p>
          <h1 class="mt-1 text-xl font-semibold text-slate-900">
            {{ $t('calendar.header.title') }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <Icon name="i-heroicons-calendar-days" class="h-4 w-4 text-slate-400" />
            <span class="text-xs font-medium text-slate-500">{{ formatDate(new Date(), 'DD/MM/YYYY') }}</span>
          </div>
          <NuxtLink
            to="/learning"
            class="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-600 md:inline-flex"
          >
            <Icon name="i-heroicons-home" class="h-4 w-4" />
            {{ $t('calendar.header.home') }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div class="max-md:flex-col flex items-stretch gap-8">
        <section class="flex w-full md:max-w-[300px] flex-col gap-6 max-md:flex-row">
          <div class="max-md:flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div
              class="border-b border-slate-200 px-6 py-4 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors"
              @click="isDatePickerOpen = !isDatePickerOpen"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-semibold text-slate-900">
                    {{ $t('calendar.datePicker.title') }}
                  </h3>
                  <p class="mt-1 text-sm text-slate-500">
                    {{ $t('calendar.datePicker.description') }}
                  </p>
                </div>
                <Icon
                  :name="isDatePickerOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="h-5 w-5 text-slate-400 transition-transform"
                />
              </div>
            </div>
            <div
              v-show="isDatePickerOpen"
              class="px-4 py-4 transition-all duration-200"
            >
              <VueCal
                v-model:selected-date="selectedDate"
                class="!w-full custom-theme date-picker"
                date-picker
                view="month"
                :view-date="viewDate"
                :views-bar="false"
                style="height: 320px"
                @update:selected-date="viewDate = $event"
              />
            </div>
          </div>

          <div class="max-md:flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 class="text-base font-semibold text-slate-900">
                {{ $t('calendar.upcomingEvents.title') }}
              </h3>
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                {{ upcomingEvents.length > 0 ? $t('calendar.upcomingEvents.hasEvents') : $t('calendar.upcomingEvents.noEvents') }}
              </span>
            </div>
            <div class="px-6 py-5">
              <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-8">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-300" />
                <span class="text-sm font-medium text-slate-400">{{ $t('calendar.loading') }}</span>
              </div>
              <div v-else-if="upcomingEvents.length > 0" class="space-y-3">
                <div
                  v-for="event in upcomingEvents"
                  :key="event.id"
                  class="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-base font-semibold text-slate-900 line-clamp-2">
                        {{ event.title }}
                      </h4>
                      <div class="mt-2 flex flex-col items-start gap-2 text-sm text-slate-600">
                        <div class="flex items-center gap-1.5 max-w-full">
                          <Icon name="i-heroicons-clock" size="16" class="h-4 w-4 text-slate-400" />
                          <span class="font-medium">{{ event.start.split(' ')[1] }} - {{ event.end.split(' ')[1] }}</span>
                        </div>
                        <div class="flex items-center gap-1.5 max-w-full">
                          <Icon name="i-heroicons-academic-cap" size="16" class="h-4 w-4 text-slate-400" />
                          <span class="truncate">{{ event.course_title || $t('calendar.event.noInfo') }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="isEventEnded(event)" class="flex-shrink-0">
                      <span class="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {{ $t('calendar.event.ended') }}
                      </span>
                    </div>
                  </div>
                  <div class="mt-3">
                    <a-button
                      v-if="!isEventEnded(event) && event.meeting_link"
                      type="primary"
                      size="small"
                      class="!h-8 !w-full justify-center !rounded-full !flex !items-center !text-xs !font-semibold"
                      @click="startJoinClass(event)"
                    >
                      <Icon name="i-heroicons-video-camera" size="16" class="h-4 w-4" />
                      <span class="ml-1.5">{{ $t('calendar.joinClass.joinNow') }}</span>
                    </a-button>
                    <div
                      v-else-if="!isEventEnded(event) && !event.meeting_link"
                      class="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
                    >
                      <Icon name="i-heroicons-exclamation-triangle" class="h-3 w-3" />
                      <span>{{ $t('calendar.event.noMeetingLink') }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-col items-center gap-3 py-8 text-center text-slate-400">
                <div class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <Icon name="i-heroicons-calendar-days" class="h-6 w-6" />
                </div>
                <p class="text-sm font-medium">
                  {{ $t('calendar.upcomingEvents.noClassesToday') }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="  h-[calc(100vh-160px)] flex-auto flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold text-slate-900">
                {{ $t('calendar.detailedCalendar.title') }}
              </h3>
            </div>
            <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
              <Icon name="i-heroicons-list-bullet" class="h-5 w-5 text-slate-300" />
              {{ $t('calendar.detailedCalendar.classCount', { count: data.events.length }) }}
            </div>
          </div>
          <div class="p-4 flex-auto flex overflow-hidden">
            <VueCal
              v-model:selected-date="selectedDate"
              v-model:view-date="viewDate"
              v-model:view="currentView"
              :views-bar="false"
              class="custom-theme calendar w-full !h-auto"
              :time-from="7 * 60"
              :time-step="60"
              :time-to="24 * 60"
              :time-cell-height="72"
              :events="data.events"
              :views="['week']"
              time-at-cursor
              @ready="({ view }: any) => view.scrollToCurrentTime()"
            />
          </div>
        </section>
      </div>
    </main>
  </div>

  <a-modal
    v-model:open="isJoinClassDialogVisible"
    :title="null"
    :footer="null"
    width="520px"
    class="join-class-modal"
    @cancel="cancelJoinClass"
  >
    <div class="px-6 py-8 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon name="i-heroicons-video-camera" class="h-6 w-6" />
      </div>
      <h3 class="mt-6 text-2xl font-semibold text-slate-900">
        {{ $t('calendar.modal.title') }}
      </h3>
      <p class="mt-2 text-sm text-slate-500">
        {{ $t('calendar.modal.confirmation') }}
      </p>

      <div v-if="selectedEventForJoin" class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
        <p class="text-base font-semibold text-slate-900">
          {{ selectedEventForJoin.title }}
        </p>
        <dl class="mt-4 space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-3">
            <dt class="flex items-center gap-2 font-medium text-slate-400">
              <Icon name="i-heroicons-clock" class="h-5 w-5 text-slate-300" />
              {{ $t('calendar.event.time') }}
            </dt>
            <dd class="font-semibold text-slate-600">
              {{ selectedEventForJoin.start.split(' ')[1] }} - {{ selectedEventForJoin.end.split(' ')[1] }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="flex items-center gap-2 font-medium text-slate-400">
              <Icon name="i-heroicons-academic-cap" class="h-5 w-5 text-slate-300" />
              {{ $t('calendar.event.course') }}
            </dt>
            <dd class="flex-1 text-right font-medium text-slate-600">
              {{ selectedEventForJoin.course_title }}
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="checkInError" class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
        <div class="flex items-start gap-3">
          <Icon name="i-heroicons-exclamation-triangle" class="mt-0.5 h-5 w-5 text-red-500" />
          <div>
            <p class="text-sm font-semibold text-red-700">
              {{ $t('calendar.error.cannotJoinClass') }}
            </p>
            <p class="mt-1 text-sm text-red-600">
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

      <div class="mt-8 flex justify-center gap-4">
        <a-button
          size="large"
          class="!h-11 !rounded-full !border-slate-200 !bg-white !px-7 !text-sm !font-semibold !text-slate-500 hover:!border-slate-300 hover:!text-slate-600"
          @click="cancelJoinClass"
        >
          {{ $t('calendar.modal.cancel') }}
        </a-button>
        <a-button
          type="primary"
          size="large"
          class="!h-11 gap-2 !rounded-full !flex !items-center !px-8 !text-sm !font-semibold"
          :loading="isJoiningClass"
          :disabled="!!checkInError"
          @click="confirmJoinClass"
        >
          <template #icon>
            <Icon name="i-heroicons-video-camera" size="20" class="h-5 w-5" />
          </template>
          {{ isJoiningClass ? $t('calendar.modal.joining') : $t('calendar.modal.joinNow') }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<style>
/* Global Vue-cal theme customization - must be unscoped */
.vuecal.custom-theme {
  --vuecal-primary-color: #15803d;
  --vuecal-secondary-color: #fafbfc;
  --vuecal-base-color: #0f172a;
  --vuecal-contrast-color: #ffffff;
  --vuecal-time-cell-height: 50px !important;
}

.vuecal__header {
  color: var(--vuecal-base-color) !important;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-bottom: none;
}

.date-picker .vuecal__title-bar {
  color: white !important;
}

.vuecal__event {
  color: var(--vuecal-base-color) !important;
  border-color: rgba(203, 213, 225, 0.25) !important;
}

.vuecal__today-btn {
  color: var(--vuecal-base-color) !important;
}

/* Event styling */
.vuecal--default-theme .vuecal__event {
  background: #fafbfc;
  border: 1px solid rgba(203, 213, 225, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.vuecal--default-theme .vuecal__event:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

/* Calendar view buttons */
.calendar .vuecal__views-bar .vuecal__view-button {
  background: transparent;
  color: #cbd5e1;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.calendar .vuecal__views-bar .vuecal__view-button:hover {
  background: rgba(203, 213, 225, 0.08);
  color: #94a3b8;
  transform: translateY(-1px);
}

.calendar .vuecal__views-bar .vuecal__view-button--active {
  background: #94a3b8;
  color: #fff;
  box-shadow: 0 6px 18px rgba(148, 163, 184, 0.25);
  transform: translateY(-1px);
}

.calendar .vuecal__transition-wrap {
  display: none;
}

/* Date picker styling */
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today:before {
  background: #94a3b8;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.25);
}

.date-picker.vuecal--default-theme.vuecal--light .vuecal__cell--selected:before {
  background: #64748b;
  /* box-shadow: 0 4px 16px rgba(100, 116, 139, 0.3); */
  background-color: color-mix(in srgb, #15803d 10%, transparent) !important;
}

.date-picker.vuecal--default-theme.vuecal--date-picker .vuecal__cell-date {
  font-weight: 500;
  transition: all 0.2s ease;
}

.date-picker .vuecal__cell--selected,
.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today {
  /* color: #ffffff; */
  font-weight: 600;
}

.date-picker .vuecal__cell:hover.vuecal__cell:before {
  background: #64748b;
}

.date-picker .vuecal__cell:hover {
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

/* Calendar navigation */
.calendar .vuecal__title-bar button {
  height: 36px;
  border-radius: 10px;
  color: #ffffff !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.calendar .vuecal__nav--today {
  margin-left: 3px;
  display: none;
}

/* Event content styling */
.vuecal__event {
  position: relative;
  overflow: hidden;
}

.vuecal__event .vuecal__event-title,
.calendar .vuecal__event-time {
  font-size: 14px;
  color: #1e293b;
  font-weight: 700;
}

.vuecal__event .vuecal__event-time {
  margin-top: 4px;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

.vuecal__event::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #94a3b8;
  border-radius: 0 3px 3px 0;
}

/* Month view styling */
.vuecal--default-theme .vuecal__cell {
  border-color: #e2e8f0;
}

/* .vuecal--default-theme .vuecal__cell--today {
  background: #fafbfc;
} */

/* .vuecal--default-theme .vuecal__cell--selected {
  background: #f8fafc;
} */

/* Week and day view styling */
.vuecal--default-theme .vuecal__time-cell {
  border-color: #e2e8f0;
}

.vuecal--default-theme .vuecal__time-cell--now {
  background: #fef9c3;
  border-color: #fbbf24;
}

/* Custom modal styling */
.join-class-modal .ant-modal-content {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 45px -18px rgba(15, 23, 42, 0.35);
  background: #ffffff;
}

.join-class-modal .ant-modal-body {
  padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .vuecal--default-theme .vuecal__event {
    padding: 6px;
    font-size: 12px;
  }

  .vuecal__event .vuecal__event-title {
    font-size: 12px;
  }

  .vuecal__event .vuecal__event-time {
    font-size: 10px;
  }
}
</style>
