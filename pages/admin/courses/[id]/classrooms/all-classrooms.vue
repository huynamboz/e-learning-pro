// Classrooms list
<script lang="ts" setup>
import type { ClassroomSession } from '~/composables/api/useClassroomApi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { VueCal } from 'vue-cal'
import CreateClassroomDialog from '~/components/admin/course/classroom/CreateClassroomDialog.vue'
import CreateSessionsDialog from '~/components/admin/course/classroom/CreateSessionsDialog.vue'
import { useCourseApi } from '~/composables/api'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
// import { createClassroom } from useClassroomApi() // TODO: Uncomment when backend is ready
import 'vue-cal/style'

// Enable UTC plugin for dayjs
dayjs.extend(utc)

const { t } = useI18n()

const route = useRoute()
const courseId = computed(() => route.params.id as string)
const { getDetailCourses } = useCourseApi()
const { getClassroomSessions } = useClassroomApi()
// const { createClassroom } = useClassroomApi() // TODO: Uncomment when backend is ready

// State
const sessionsData = ref<ClassroomSession[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const courseDetail = ref<any>(null)

const open = ref<boolean>(false)
const openSessionsDialog = ref<boolean>(false)

// Calendar state
interface CalendarEvent {
  start: string
  end: string
  title: string
  id?: string
  class?: string
  sessionId?: string
  classroomId?: string
  description?: string
  meeting_link?: string
}

const calendarEvents = ref<CalendarEvent[]>([])
// Set initial date to 5/1/2026 (Monday of that week)
const initialDate = new Date(2026, 0, 5) // January 5, 2026
const selectedDate = ref(new Date(initialDate))
const viewDate = ref(new Date(initialDate))
const currentView = ref('week')

// VueCal template ref
const vueCalRef = ref<any>(null)

function AddNewClassroom() {
  open.value = true
}

function AddNewSessions() {
  openSessionsDialog.value = true
}

// Mock sessions data (for testing when no data from backend)
// Date range: 5/1/2026 to 11/1/2026
// Lớp 1 thành viên: Thứ 2 (5/1), Thứ 4 (7/1) - 18:00-20:00
// Lớp 3 thành viên: Thứ 5 (8/1), Thứ 7 (10/1) - 13:00-16:00
const mockSessionsData: ClassroomSession[] = [
  // Lớp 1 thành viên - Thứ 2 (5/1/2026)
  {
    id: 'mock-session-1-1',
    classroom: 'mock-classroom-1',
    topic: 'Lớp 1 thành viên - Buổi 1',
    description: 'Buổi học 1 của Lớp 1 thành viên',
    start_time: '2026-01-05T18:00:00.000Z',
    end_time: '2026-01-05T20:00:00.000Z',
    location: '',
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
    limit: 10,
    status: 'scheduled',
    classroom_title: 'Lớp 1 thành viên',
    course_title: 'Mock Course',
    attendance_count: 0,
    present_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  // Lớp 1 thành viên - Thứ 4 (7/1/2026)
  {
    id: 'mock-session-1-2',
    classroom: 'mock-classroom-1',
    topic: 'Lớp 1 thành viên - Buổi 2',
    description: 'Buổi học 2 của Lớp 1 thành viên',
    start_time: '2026-01-07T18:00:00.000Z',
    end_time: '2026-01-07T20:00:00.000Z',
    location: '',
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
    limit: 10,
    status: 'scheduled',
    classroom_title: 'Lớp 1 thành viên',
    course_title: 'Mock Course',
    attendance_count: 0,
    present_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  // Lớp 3 thành viên - Thứ 5 (8/1/2026)
  {
    id: 'mock-session-2-1',
    classroom: 'mock-classroom-2',
    topic: 'Lớp 3 thành viên - Buổi 1',
    description: 'Buổi học 1 của Lớp 3 thành viên',
    start_time: '2026-01-08T13:00:00.000Z',
    end_time: '2026-01-08T16:00:00.000Z',
    location: '',
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
    limit: 10,
    status: 'scheduled',
    classroom_title: 'Lớp 3 thành viên',
    course_title: 'Mock Course',
    attendance_count: 0,
    present_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  // Lớp 3 thành viên - Thứ 7 (10/1/2026)
  {
    id: 'mock-session-2-2',
    classroom: 'mock-classroom-2',
    topic: 'Lớp 3 thành viên - Buổi 2',
    description: 'Buổi học 2 của Lớp 3 thành viên',
    start_time: '2026-01-10T13:00:00.000Z',
    end_time: '2026-01-10T16:00:00.000Z',
    location: '',
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
    limit: 10,
    status: 'scheduled',
    classroom_title: 'Lớp 3 thành viên',
    course_title: 'Mock Course',
    attendance_count: 0,
    present_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
]

// Generate calendar events from sessions
function generateCalendarEventsFromSessions(sessions: ClassroomSession[]): CalendarEvent[] {
  const events: CalendarEvent[] = []

  sessions.forEach((session) => {
    // Parse UTC date strings and format them correctly
    // Backend returns: 2026-01-05T18:00:00.000Z
    // We need to format as: YYYY-MM-DD HH:mm for vue-cal
    const startDate = dayjs.utc(session.start_time)
    const endDate = dayjs.utc(session.end_time)

    events.push({
      id: session.id,
      start: startDate.format('YYYY-MM-DD HH:mm'),
      end: endDate.format('YYYY-MM-DD HH:mm'),
      title: session.topic || session.classroom_title,
      sessionId: session.id,
      classroomId: session.classroom,
      description: session.description,
      meeting_link: session.meeting_link,
    })
  })

  return events
}

// Load all sessions from all classrooms in the course
async function loadAllSessions() {
  try {
    isLoading.value = true
    error.value = null

    // First, get course detail to get classrooms
    const response = await getDetailCourses(courseId.value)
    courseDetail.value = response

    const classrooms = (response as any).classrooms || []

    if (classrooms.length > 0) {
      // Load sessions from all classrooms
      const allSessions: ClassroomSession[] = []
      for (const classroom of classrooms) {
        try {
          const sessionsResponse = await getClassroomSessions(classroom.id)
          if (sessionsResponse.results && sessionsResponse.results.length > 0) {
            allSessions.push(...sessionsResponse.results)
          }
        }
        catch (err: any) {
          // Continue loading other classrooms even if one fails
          console.error(`Error loading sessions for classroom ${classroom.id}:`, err)
        }
      }

      if (allSessions.length > 0) {
        sessionsData.value = allSessions
        calendarEvents.value = generateCalendarEventsFromSessions(allSessions)
      }
      else {
        // No sessions found, use mock data
        sessionsData.value = mockSessionsData
        calendarEvents.value = generateCalendarEventsFromSessions(sessionsData.value)
      }
    }
    else {
      // No classrooms found, use mock data
      sessionsData.value = mockSessionsData
      calendarEvents.value = generateCalendarEventsFromSessions(sessionsData.value)
    }
  }
  catch (err: any) {
    console.error('Error loading sessions:', err)
    // Use mock data on error for testing
    sessionsData.value = mockSessionsData
    calendarEvents.value = generateCalendarEventsFromSessions(sessionsData.value)
    error.value = null // Don't show error, use mock data instead
  }
  finally {
    isLoading.value = false
  }
}

// Handle classroom creation success
async function handleClassroomCreated() {
  // Reload sessions to get updated data
  await loadAllSessions()
}

// Watch for view date changes
watch(viewDate, (newViewDate) => {
  if (currentView.value === 'week') {
    const firstDayOfWeek = new Date(newViewDate)
    const dayOfWeek = firstDayOfWeek.getDay()
    const diff = firstDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    firstDayOfWeek.setDate(diff)
    selectedDate.value = firstDayOfWeek
  }
})

// Handle event click
function handleEventClick(event: any) {
  const calendarEvent = event.event as CalendarEvent
  if (calendarEvent.sessionId) {
    const session = sessionsData.value.find(s => s.id === calendarEvent.sessionId)
    if (session) {
      // Navigate to classroom detail page
      navigateTo(`/admin/courses/${courseId.value}/classrooms/${session.classroom}`)
    }
  }
}

// Handle previous button click
function handlePreviousClick() {
  if (vueCalRef.value?.view) {
    vueCalRef.value.view.previous()

    // Wait for view to update, then log week range from vueCalRef
    nextTick(() => {
      const view = vueCalRef.value?.view
      if (view && view.cellDates && view.cellDates.length > 0) {
        const firstCell = view.cellDates[0]
        const lastCell = view.cellDates[view.cellDates.length - 1]
        console.warn('Previous week:', {
          start: firstCell.startFormatted,
          end: lastCell.startFormatted,
        })
      }
    })
  }
}

// Handle next button click
function handleNextClick() {
  if (vueCalRef.value?.view) {
    vueCalRef.value.view.next()

    // Wait for view to update, then log week range from vueCalRef
    nextTick(() => {
      const view = vueCalRef.value?.view
      if (view && view.cellDates && view.cellDates.length > 0) {
        const firstCell = view.cellDates[0]
        const lastCell = view.cellDates[view.cellDates.length - 1]
        console.warn('Next week:', {
          start: firstCell.startFormatted,
          end: lastCell.startFormatted,
        })
      }
    })
  }
}

// Load sessions on mount
onMounted(() => {
  loadAllSessions()
})
</script>

<template>
  <div class="classroom">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 mb-4">
        {{ error }}
      </p>
      <a-button @click="loadAllSessions">
        {{ t('common.tryAgain') }}
      </a-button>
    </div>

    <!-- Calendar View -->
    <div v-else class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-2xl flex items-center gap-3">
            <Icon name="solar:calendar-bold" size="28" class="text-green-600" />
            Lịch học các lớp
          </h2>
          <a-button
            type="primary"
            class="!px-6 !h-10 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-1 !bg-[#548A1D]"
            @click="AddNewClassroom"
          >
            {{ t('admin.classroom.addNewClassroom') }}
            <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
          </a-button>
          <a-button
            type="default"
            class="!px-6 !h-10 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-1 !border-[#548A1D] !text-[#548A1D] hover:!bg-[#548A1D] hover:!text-white"
            @click="AddNewSessions"
          >
            Thêm buổi học cho lớp
            <Icon name="i-material-symbols-add-2-rounded" class="text-[16px]" />
          </a-button>
        </div>
        <div
          class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500"
        >
          <Icon name="i-heroicons-list-bullet" class="h-5 w-5 text-gray-300" />
          {{ calendarEvents.length }} buổi học
        </div>
      </div>

      <div class="flex flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <VueCal
          ref="vueCalRef" v-model:selected-date="selectedDate" v-model:view-date="viewDate"
          v-model:view="currentView" :views-bar="false" class="custom-theme calendar w-full !h-auto" :time-from="7 * 60"
          :time-step="60" :time-to="24 * 60" :time-cell-height="72" :events="calendarEvents" :views="['week']"
          time-at-cursor @ready="({ view }: any) => view.scrollToCurrentTime()" @event-click="handleEventClick"
        >
          <template #previous-button>
            <button
              class="!text-gray-500 cursor-pointer hover:!text-gray-700 transition-colors"
              @click.stop.prevent="handlePreviousClick"
            >
              <Icon name="i-heroicons-chevron-left" class="text-[26px]" />
            </button>
          </template>

          <template #next-button>
            <button
              class="!text-gray-500 cursor-pointer hover:!text-gray-700 transition-colors"
              @click.stop.prevent="handleNextClick"
            >
              <Icon name="i-heroicons-chevron-right" class="text-[26px]" />
            </button>
          </template>
        </VueCal>
      </div>
    </div>

    <CreateClassroomDialog
      v-model:open="open"
      :course-id="courseId"
      @success="handleClassroomCreated"
    />

    <CreateSessionsDialog
      v-model:open="openSessionsDialog"
      :course-id="courseId"
      :classrooms="(courseDetail?.classrooms || []) as Array<{ id: string; title: string }>"
      @success="handleClassroomCreated"
    />
  </div>
</template>

<style scoped>
/* Vue-cal theme customization */
:deep(.vuecal.custom-theme) {
  --vuecal-primary-color: #fff;
  --vuecal-secondary-color: #fafbfc;
  --vuecal-base-color: #0f172a;
  --vuecal-contrast-color: #ffffff;
  --vuecal-time-cell-height: 50px !important;
}

:deep(.vuecal__header) {
  color: var(--vuecal-base-color) !important;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-bottom: none;
}

:deep(.vuecal__event) {
  color: var(--vuecal-base-color) !important;
  border-color: rgba(203, 213, 225, 0.25) !important;
}

:deep(.vuecal__today-btn) {
  color: var(--vuecal-base-color) !important;
}

/* Event styling */
:deep(.vuecal--default-theme .vuecal__event) {
  color: #ffffff;
  background: #268100;
  border: 1px solid rgba(203, 213, 225, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.vuecal--default-theme .vuecal__event:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

/* Calendar navigation */
:deep(.calendar .vuecal__title-bar button) {
  height: 36px;
  border-radius: 10px;
  /* color: #ffffff !important; */
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.calendar .vuecal__nav--today) {
  margin-left: 3px;
  display: none;
}

/* Event content styling */
:deep(.vuecal__event) {
  position: relative;
  overflow: hidden;
}

:deep(.vuecal__event .vuecal__event-title),
:deep(.calendar .vuecal__event-time) {
  font-size: 14px;
  color: #ffffff;
  font-weight: 700;
}

:deep(.vuecal__event .vuecal__event-time) {
  margin-top: 4px;
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
}

:deep(.vuecal__event::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #20683b;
  border-radius: 0 3px 3px 0;
}

/* Week and day view styling */
:deep(.vuecal--default-theme .vuecal__time-cell) {
  border-color: #e2e8f0;
}

:deep(.vuecal--default-theme .vuecal__time-cell--now) {
  background: #fef9c3;
  border-color: #fbbf24;
}

:deep(.vuecal__weekday.vuecal__weekday--today .vuecal__weekday-date) {
  background: #15803d;
  color: #fff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.vuecal--default-theme .vuecal__event) {
    padding: 6px;
    font-size: 12px;
  }

  :deep(.vuecal__event .vuecal__event-title) {
    font-size: 12px;
  }

  :deep(.vuecal__event .vuecal__event-time) {
    font-size: 10px;
  }
}
</style>
