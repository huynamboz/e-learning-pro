<script lang="ts" setup>
import type { ClassroomDetail, CourseStudent } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import AddSessionDialog from '~/components/admin/course/classroom/AddSessionDialog.vue'
import DeleteSessionDialog from '~/components/admin/course/classroom/DeleteSessionDialog.vue'
import EditClassroomDialog from '~/components/admin/course/classroom/EditClassroomDialog.vue'
import EditSessionDialog from '~/components/admin/course/classroom/EditSessionDialog.vue'
import StudentListDialog from '~/components/admin/course/classroom/StudentListDialog.vue'
import { useClassroomApi, type ClassroomSession } from '~/composables/api/useClassroomApi'
import { useCourseApi } from '~/composables/api/useCourseApi'

const { t } = useI18n()
const route = useRoute()
const classroomId = computed(() => route.params.classroomId as string)
const { getClassroomDetail, patchClassroom, updateClassroomSession, getClassroomSessions } = useClassroomApi()
const { getCourseStudents } = useCourseApi()

// State
const classroom = ref<ClassroomDetail | null>(null)
const sessions = ref<ClassroomSession[]>([])
const students = ref<CourseStudent[]>([])
const isLoading = ref(false)
const sessionsLoading = ref(false)
const studentsLoading = ref(false)
const error = ref<string | null>(null)

// Meeting link edit state
const isEditingMeetingLink = ref(false)
const meetingLinkForm = ref({
  meeting_link: '',
})
const meetingLinkLoading = ref(false)

// Session edit state
const isEditSessionDialogVisible = ref(false)
const editingSession = ref<any>(null)
const sessionFormLoading = ref(false)

// Classroom edit state
const isEditClassroomDialogVisible = ref(false)
const classroomEditLoading = ref(false)

// Add session state
const isAddSessionDialogVisible = ref(false)
const addSessionLoading = ref(false)

// Delete session state
const isDeleteSessionDialogVisible = ref(false)
const deletingSession = ref<any>(null)

// Student list state
const isStudentListDialogVisible = ref(false)

// Load classroom detail
async function loadClassroomDetail() {
  try {
    isLoading.value = true
    error.value = null
    const response = await getClassroomDetail(classroomId.value)
    classroom.value = response
  }
  catch (err: any) {
    console.error('Error loading classroom detail:', err)
    error.value = err.message || t('admin.classroom.notifications.loadFailed')
  }
  finally {
    isLoading.value = false
  }
}

// Load classroom sessions
async function loadClassroomSessions() {
  try {
    sessionsLoading.value = true
    const response = await getClassroomSessions(classroomId.value)
    sessions.value = response.results || []
  }
  catch (err: any) {
    console.error('Error loading classroom sessions:', err)
    notification.error({
      message: t('admin.classroom.detail.sessionsLoadFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    sessionsLoading.value = false
  }
}

// Load and filter students
async function loadClassroomStudents() {
  if (!classroom.value?.course?.id) return
  
  try {
    studentsLoading.value = true
    
    // Get all course students
    const response = await getCourseStudents(classroom.value.course.id)
    const allStudents = (response as any).results || []
    
    // Filter students by classroom enrollment
    const classroomStudents = allStudents.filter((student: any) => {
      // Check if student has enrollment with classroom_id matching current classroom
      if (student.enrollment && student.enrollment.classroom_id === classroomId.value) {
        return true
      }
      return false
    })
    
    students.value = classroomStudents
  }
  catch (err: any) {
    console.error('Error loading classroom students:', err)
    notification.error({
      message: t('admin.classroom.detail.studentsLoadFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    studentsLoading.value = false
  }
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time for display
function _formatTime(timeString: string): string {
  return timeString.substring(0, 5) // Remove seconds
}

// Format session date and time
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

// Get status badge class and text based on date
function getSessionStatus(session: any): { class: string, text: string } {
  const now = new Date()
  const startTime = new Date(session.start_time)
  const endTime = new Date(session.end_time)

  // Calculate time difference in hours
  const timeDiffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (now >= startTime && now <= endTime) {
    return {
      class: 'bg-green-100 text-green-800',
      text: 'Đang diễn ra',
    }
  }
  else if (now > endTime) {
    return {
      class: 'bg-gray-100 text-gray-800',
      text: 'Đã diễn ra',
    }
  }
  else if (timeDiffHours <= 24 && timeDiffHours > 0) {
    return {
      class: 'bg-orange-100 text-orange-800',
      text: 'Sắp diễn ra',
    }
  }
  else {
    return {
      class: 'bg-blue-100 text-blue-800',
      text: 'Chưa diễn ra',
    }
  }
}

// Start editing meeting link
function startEditMeetingLink() {
  meetingLinkForm.value.meeting_link = classroom.value?.meeting_link || ''
  isEditingMeetingLink.value = true
}

// Cancel editing meeting link
function cancelEditMeetingLink() {
  isEditingMeetingLink.value = false
  meetingLinkForm.value.meeting_link = ''
}

// Save meeting link
async function saveMeetingLink() {
  try {
    meetingLinkLoading.value = true

    await patchClassroom(classroomId.value, {
      meeting_link: meetingLinkForm.value.meeting_link,
    })

    // Update local data
    if (classroom.value) {
      classroom.value.meeting_link = meetingLinkForm.value.meeting_link
    }

    isEditingMeetingLink.value = false

    // Show success notification
    notification.success({
      message: t('admin.classroom.detail.meetingLinkUpdated'),
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Error updating meeting link:', err)
    notification.error({
      message: t('admin.classroom.detail.meetingLinkUpdateFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    meetingLinkLoading.value = false
  }
}

// Copy meeting link to clipboard
async function copyMeetingLink() {
  if (classroom.value?.meeting_link) {
    try {
      await navigator.clipboard.writeText(classroom.value.meeting_link)
      notification.success({
        message: t('admin.classroom.detail.meetingLinkCopied'),
        duration: 3,
      })
    }
    catch (err) {
      console.error('Failed to copy meeting link:', err)
      notification.error({
        message: t('admin.classroom.detail.meetingLinkCopyFailed'),
        duration: 5,
      })
    }
  }
}

// Start editing session
function startEditSession(session: any) {
  editingSession.value = session
  isEditSessionDialogVisible.value = true
}

// Cancel editing session
function cancelEditSession() {
  isEditSessionDialogVisible.value = false
  editingSession.value = null
}

// Save session changes
async function saveSession(formData: any) {
  try {
    sessionFormLoading.value = true

    await updateClassroomSession(editingSession.value.id, formData)

    // Refresh sessions list
    await loadClassroomSessions()

    cancelEditSession()

    // Show success notification
    notification.success({
      message: t('admin.classroom.detail.sessionUpdated'),
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Error updating session:', err)
    notification.error({
      message: t('admin.classroom.detail.sessionUpdateFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    sessionFormLoading.value = false
  }
}

// Start editing classroom
function startEditClassroom() {
  isEditClassroomDialogVisible.value = true
}

// Cancel editing classroom
function cancelEditClassroom() {
  isEditClassroomDialogVisible.value = false
}

// Save classroom changes
async function saveClassroom(formData: any) {
  try {
    classroomEditLoading.value = true

    await patchClassroom(classroomId.value, formData)

    // Update local data
    if (classroom.value) {
      classroom.value = {
        ...classroom.value,
        ...formData,
      }
    }

    cancelEditClassroom()

    // Show success notification
    notification.success({
      message: t('admin.classroom.detail.classroomUpdated'),
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Error updating classroom:', err)
    notification.error({
      message: t('admin.classroom.detail.classroomUpdateFailed'),
      description: err.message,
      duration: 5,
    })
  }
  finally {
    classroomEditLoading.value = false
  }
}

// Start adding session
function startAddSession() {
  isAddSessionDialogVisible.value = true
}

// Cancel adding session
function cancelAddSession() {
  isAddSessionDialogVisible.value = false
}

// Save new session
async function saveNewSession(_formData: any) {
  // Refresh the sessions list after successful creation
  await loadClassroomSessions()
  cancelAddSession()
}

// Start deleting session
function startDeleteSession(session: any) {
  deletingSession.value = session
  isDeleteSessionDialogVisible.value = true
}

// Cancel deleting session
function cancelDeleteSession() {
  isDeleteSessionDialogVisible.value = false
  deletingSession.value = null
}

// Handle session deleted
async function handleSessionDeleted() {
  // Refresh the sessions list after successful deletion
  await loadClassroomSessions()
  cancelDeleteSession()
}

// Start viewing students
function startViewStudents() {
  isStudentListDialogVisible.value = true
}

// Cancel viewing students
function cancelViewStudents() {
  isStudentListDialogVisible.value = false
}

// Stats cards data
const statsCards = computed(() => [
  {
    icon: 'i-heroicons-users',
    iconClass: 'w-6 h-6 text-blue-600',
    bgClass: 'bg-blue-100',
    label: 'admin.classroom.detail.totalStudents',
    value: classroom.value?.student_count || 0,
  },
  {
    icon: 'solar:user-check-outline',
    iconClass: 'w-6 h-6 text-green-600',
    bgClass: 'bg-green-100',
    label: 'admin.classroom.detail.enrolledStudents',
    value: students.value.length,
  },
  {
    icon: 'i-heroicons-calendar-days',
    iconClass: 'w-6 h-6 text-purple-600',
    bgClass: 'bg-purple-100',
    label: 'admin.classroom.detail.totalSessions',
    value: classroom.value?.session_count || 0,
  },
  {
    icon: 'i-heroicons-clock',
    iconClass: 'w-6 h-6 text-orange-600',
    bgClass: 'bg-orange-100',
    label: 'admin.classroom.detail.schedule',
    value: classroom.value?.schedule_summary || '',
    isText: true,
  },
])

// Load data on mount
onMounted(async () => {
  await loadClassroomDetail()
  await loadClassroomSessions()
  await loadClassroomStudents()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 px-0">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 mb-4">
        {{ error }}
      </p>
      <a-button @click="loadClassroomDetail">
        {{ $t('common.tryAgain') }}
      </a-button>
    </div>

    <!-- Classroom Detail -->
    <div v-else-if="classroom" class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              {{ classroom.title }}
            </h1>
            <p class="text-gray-600 mb-4">
              {{ $t('admin.classroom.detail.course') }}: {{ classroom.course.title }}
            </p>
            <div class="space-y-2 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <Icon name="i-heroicons-users" class="w-4 h-4" />
                <span>{{ classroom.student_count }} {{ $t('admin.classroom.detail.maxStudents') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="i-heroicons-calendar-days" class="w-4 h-4" />
                <span>{{ formatDate(classroom.start_date) }} - {{ formatDate(classroom.end_date) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="i-heroicons-user-group" class="w-4 h-4" />
                <span>{{ students.length }} {{ $t('admin.classroom.detail.enrolled') }}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 lg:flex-shrink-0">
            <a-button class="!flex items-center" @click="startViewStudents">
              <Icon name="i-heroicons-users" class="w-4 h-4 mr-2" />
              {{ $t('admin.classroom.detail.viewStudents') }}
            </a-button>
            <a-button type="primary" class="!bg-[#548A1D] !flex items-center" @click="startEditClassroom">
              <Icon name="i-heroicons-pencil" class="w-4 h-4 mr-2" />
              {{ $t('admin.classroom.detail.editClassroom') }}
            </a-button>
            <NuxtLink :to="`/admin/courses/${classroom.course.id}/classrooms/all-classrooms`">
              <a-button class="!flex items-center">
                <Icon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
                {{ $t('admin.classroom.detail.backToList') }}
              </a-button>
            </NuxtLink>
          </div>
        </div>
      </div>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          v-for="card in statsCards"
          :key="card.label"
          class="bg-white rounded-lg shadow-sm border p-4"
        >
          <div class="flex items-center">
            <div class="size-10 min-w-10 flex items-center justify-center rounded-lg" :class="card.bgClass">
              <Icon :name="card.icon" :class="card.iconClass" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                {{ $t(card.label) }}
              </p>
              <p :class="card.isText ? 'text-sm font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'">
                {{ card.value }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Meeting Link -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ $t('admin.classroom.detail.meetingLink') }}
          </h2>
          <a-button v-if="!isEditingMeetingLink" size="small" type="text" @click="startEditMeetingLink">
            <Icon name="i-heroicons-pencil" class="w-4 h-4 mr-2" />
            {{ $t('admin.classroom.meetingLink.editMeetingLink') }}
          </a-button>
        </div>

        <!-- Display Mode -->
        <div v-if="!isEditingMeetingLink" class="space-y-3">
          <div v-if="classroom?.meeting_link" class="flex items-center gap-3">
            <Icon name="i-heroicons-link" class="w-5 h-5 text-gray-500" />
            <a
              :href="classroom.meeting_link"
              target="_blank"
              class="text-blue-600 hover:text-blue-800 underline flex-1"
            >
              {{ classroom.meeting_link }}
            </a>
            <a-button size="small" type="text" @click="copyMeetingLink">
              <Icon name="i-heroicons-clipboard" class="w-4 h-4" />
            </a-button>
          </div>
          <div v-else class="text-gray-500 italic">
            {{ $t('admin.classroom.meetingLink.noMeetingLink') }}
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-3">
          <a-input
            v-model:value="meetingLinkForm.meeting_link"
            :placeholder="$t('admin.classroom.meetingLink.meetingLinkPlaceholder')"
            size="large"
            class="w-full"
          />
          <div class="flex flex-col sm:flex-row gap-2 mt-4">
            <a-button
              type="primary"
              size="small"
              :loading="meetingLinkLoading"
              @click="saveMeetingLink"
            >
              {{ $t('admin.classroom.meetingLink.saveMeetingLink') }}
            </a-button>
            <a-button size="small" @click="cancelEditMeetingLink">
              {{ $t('admin.classroom.meetingLink.cancel') }}
            </a-button>
          </div>
        </div>
      </div>

      <!-- Upcoming Sessions -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ $t('admin.classroom.detail.upcomingSessions') }}
          </h2>
          <a-button type="primary" size="small" class="!flex items-center !bg-[#548A1D]" @click="startAddSession">
            <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
            {{ $t('admin.classroom.detail.addSession') }}
          </a-button>
        </div>

        <div v-if="sessionsLoading" class="text-center py-8">
          <a-spin size="large" />
        </div>

        <div v-else-if="sessions.length === 0" class="text-center py-8">
          <Icon name="i-heroicons-calendar-days" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">
            {{ $t('admin.classroom.detail.noSessions') }}
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 mb-1">
                  {{ session.topic }}
                </h3>
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-calendar-days" class="w-4 h-4" />
                    <span>{{ formatSessionDateTime(session.start_time) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-users" class="w-4 h-4" />
                    <span>{{ session.attendance_count }}/{{ classroom?.student_count }} {{
                      $t('admin.classroom.detail.attended') }}</span>
                  </div>
                  <div v-if="session.meeting_link" class="flex items-center gap-2">
                    <Icon name="i-heroicons-link" class="w-4 h-4" />
                    <a
                      :href="session.meeting_link"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-800 underline"
                    >
                      {{ $t('admin.classroom.detail.joinMeeting') }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getSessionStatus(session).class"
                >
                  {{ getSessionStatus(session).text }}
                </span>
                <div class="flex gap-1">
                  <a-button size="small" type="text" @click="startEditSession(session)">
                    <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                  </a-button>
                  <a-button size="small" type="text" @click="startDeleteSession(session)">
                    <Icon name="i-heroicons-trash" class="w-4 h-4 text-red-500" />
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Classroom Dialog -->
    <EditClassroomDialog
      v-model:visible="isEditClassroomDialogVisible"
      :classroom="classroom"
      :loading="classroomEditLoading"
      @save="saveClassroom"
      @cancel="cancelEditClassroom"
    />

    <!-- Add Session Dialog -->
    <AddSessionDialog
      v-model:visible="isAddSessionDialogVisible"
      :classroom-id="classroomId"
      :default-limit="classroom?.student_count || 0"
      :loading="addSessionLoading"
      @save="saveNewSession"
      @cancel="cancelAddSession"
    />

    <!-- Edit Session Dialog -->
    <EditSessionDialog
      v-model:visible="isEditSessionDialogVisible"
      :session="editingSession"
      :loading="sessionFormLoading"
      @save="saveSession"
      @cancel="cancelEditSession"
    />

    <!-- Delete Session Dialog -->
    <DeleteSessionDialog
      v-model:visible="isDeleteSessionDialogVisible"
      :session="deletingSession"
      @deleted="handleSessionDeleted"
      @cancel="cancelDeleteSession"
    />

    <!-- Student List Dialog -->
    <StudentListDialog
      v-model:visible="isStudentListDialogVisible"
      :students="students"
      :classroom-title="classroom?.title"
      :loading="studentsLoading"
      @cancel="cancelViewStudents"
    />
  </div>
</template>
