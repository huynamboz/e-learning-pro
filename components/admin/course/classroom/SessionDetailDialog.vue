<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue'
import type { SessionAttendance } from '~/composables/api/useClassroomApi'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Modal, notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import { useFileUpload } from '~/composables/useFileUpload'
import EditClassroomDialog from './EditClassroomDialog.vue'

interface Props {
  open: boolean
  courseId: string
  sessionId: string | null
  classroomId: string | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'studentAdded'): void
  (e: 'studentRemoved'): void
  (e: 'sessionUpdated'): void
  (e: 'classroomDeleted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getCourseSessionDetail,
  quickEnrollStudent,
  removeStudentFromClassroom,
  updateClassroomSession,
  getClassroomStudents,
  getSessionAttendance,
  getSessionVideoUploadUrl,
  createSessionVideo,
  getSessionVideos,
  deleteSessionVideo,
} = useClassroomApi()
const { uploadFileWithProgress } = useFileUpload()

// State
const isLoading = ref(false)
const sessionDetail = ref<any>(null)
const students = ref<any[]>([])
const studentsLoading = ref(false)

// Edit mode state
const isEditMode = ref(false)
const editFormRef = ref()
const editFormState = ref({
  topic: '',
  description: '',
  start_time: null as any,
  end_time: null as any,
  location: '',
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
})
const isSaving = ref(false)

// Meeting info inline edit state
const isEditingMeeting = ref(false)
const meetingEditState = ref({
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
})
const isSavingMeeting = ref(false)

// Edit classroom dialog state
const showEditClassroomDialog = ref(false)

// Add student state
const showAddStudent = ref(false)
const addStudentEmail = ref('')
const addStudentLoading = ref(false)

// Remove student state
const showRemoveStudentDialog = ref(false)
const studentToRemove = ref<number | null>(null)
const deleteOrderOnRemove = ref(false)
const removingStudent = ref(false)

// Video upload state
interface VideoFileItem {
  uid: string
  name: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  percent?: number
  url?: string
  originFileObj?: File
  id?: string // Video ID from API (after upload)
  file_size?: number
  content_type?: string
  duration?: number
}

const videoFileList = ref<VideoFileItem[]>([])
const videosLoading = ref(false)

// Attendance state
const attendance = ref<SessionAttendance[]>([])
const attendanceLoading = ref(false)

// Dialog visibility
const dialogVisible = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

// Watch for dialog open to load data
watch(() => props.open, async (newValue) => {
  if (newValue && props.sessionId && props.courseId) {
    await loadSessionDetail()
    await loadAttendance()
    await loadVideos()
    if (props.classroomId) {
      await loadStudents()
    }
  }
  else {
    // Reset state when dialog closes
    sessionDetail.value = null
    students.value = []
    showAddStudent.value = false
    addStudentEmail.value = ''
    isEditMode.value = false
    videoFileList.value = []
    attendance.value = []
    editFormState.value = {
      topic: '',
      description: '',
      start_time: null,
      end_time: null,
      location: '',
      meeting_link: '',
      meeting_id: '',
      meeting_pass: '',
    }
  }
})

// Load session detail
async function loadSessionDetail() {
  if (!props.sessionId || !props.courseId)
    return

  try {
    isLoading.value = true
    const response = await getCourseSessionDetail(props.courseId, props.sessionId)
    sessionDetail.value = response
    // Initialize meeting edit state
    meetingEditState.value = {
      meeting_link: response?.meeting_link || '',
      meeting_id: response?.meeting_id || '',
      meeting_pass: response?.meeting_pass || '',
    }
  }
  catch (err: any) {
    console.error('Error loading session detail:', err)
    notification.error({
      message: 'Lỗi khi tải thông tin buổi học',
      description: err.message || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    isLoading.value = false
  }
}

// Load students list
async function loadStudents() {
  if (!props.classroomId)
    return

  try {
    studentsLoading.value = true

    // Get classroom students directly
    const response = await getClassroomStudents(props.classroomId)
    students.value = (response.results || [])
  }
  catch (err: any) {
    console.error('Error loading students:', err)
    notification.error({
      message: 'Lỗi khi tải danh sách học sinh',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    studentsLoading.value = false
  }
}

// Format date only
// Format date and time range: "06/01/2026 ⋅1:00 – 1:30"
function formatDateTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime)
    return ''
  const start = dayjs(startTime)
  const end = dayjs(endTime)
  const date = start.format('DD/MM/YYYY')
  const startTimeStr = start.format('H:mm')
  const endTimeStr = end.format('H:mm')
  return `${date} ⋅${startTimeStr} – ${endTimeStr}`
}

// Handle add student
async function handleAddStudent() {
  if (!addStudentEmail.value || !props.classroomId)
    return

  try {
    addStudentLoading.value = true
    await quickEnrollStudent(props.classroomId, {
      email: addStudentEmail.value,
      send_welcome_email: true,
    })

    notification.success({
      message: 'Đã thêm học sinh vào lớp thành công',
      duration: 3,
    })

    // Reset form
    addStudentEmail.value = ''
    showAddStudent.value = false

    // Reload students list
    await loadStudents()
    emit('studentAdded')
  }
  catch (err: any) {
    console.error('Error adding student:', err)
    notification.error({
      message: 'Lỗi khi thêm học sinh',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    addStudentLoading.value = false
  }
}

// Handle remove student - show confirm dialog
function handleRemoveStudent(userId: number) {
  studentToRemove.value = userId
  deleteOrderOnRemove.value = false
  showRemoveStudentDialog.value = true
}

// Confirm remove student
async function confirmRemoveStudent() {
  if (!props.classroomId || !studentToRemove.value)
    return

  try {
    removingStudent.value = true
    await removeStudentFromClassroom(props.classroomId, studentToRemove.value, deleteOrderOnRemove.value)

    const message = deleteOrderOnRemove.value
      ? 'Đã xóa học sinh và đơn hàng khỏi lớp thành công'
      : 'Đã xóa học sinh khỏi lớp thành công'

    notification.success({
      message,
      duration: 3,
    })

    // Close dialog and reset state
    showRemoveStudentDialog.value = false
    studentToRemove.value = null
    deleteOrderOnRemove.value = false

    // Reload students list
    await loadStudents()
    emit('studentRemoved')
  }
  catch (err: any) {
    console.error('Error removing student:', err)
    notification.error({
      message: 'Lỗi khi xóa học sinh',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    removingStudent.value = false
  }
}

// Cancel remove student
function cancelRemoveStudent() {
  showRemoveStudentDialog.value = false
  studentToRemove.value = null
  deleteOrderOnRemove.value = false
}

// Handle edit
function handleEdit() {
  if (!sessionDetail.value)
    return

  // Populate edit form with current session data
  editFormState.value = {
    topic: sessionDetail.value.topic || '',
    description: sessionDetail.value.description || '',
    start_time: sessionDetail.value.start_time ? dayjs(sessionDetail.value.start_time) : null,
    end_time: sessionDetail.value.end_time ? dayjs(sessionDetail.value.end_time) : null,
    location: sessionDetail.value.location || '',
    meeting_link: sessionDetail.value.meeting_link || '',
    meeting_id: sessionDetail.value.meeting_id || '',
    meeting_pass: sessionDetail.value.meeting_pass || '',
  }
  // Initialize meeting edit state
  meetingEditState.value = {
    meeting_link: sessionDetail.value.meeting_link || '',
    meeting_id: sessionDetail.value.meeting_id || '',
    meeting_pass: sessionDetail.value.meeting_pass || '',
  }
  isEditMode.value = true
}

// Handle cancel edit
function handleCancelEdit() {
  isEditMode.value = false
  editFormState.value = {
    topic: '',
    description: '',
    start_time: null,
    end_time: null,
    location: '',
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
  }
}

// Handle save edit
async function handleSaveEdit() {
  if (!props.sessionId || !sessionDetail.value)
    return

  try {
    await editFormRef.value?.validateFields()
    isSaving.value = true

    // Format time for API
    const formatTimeForApi = (time: any): string => {
      if (!time)
        return ''
      if (typeof time === 'string')
        return time
      if (time.toISOString) {
        return time.toISOString()
      }
      if (time.format) {
        return time.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      }
      return ''
    }

    const updatePayload: any = {
      topic: editFormState.value.topic,
      description: editFormState.value.description,
      location: editFormState.value.location,
    }

    if (editFormState.value.start_time) {
      updatePayload.start_time = formatTimeForApi(editFormState.value.start_time)
    }
    if (editFormState.value.end_time) {
      updatePayload.end_time = formatTimeForApi(editFormState.value.end_time)
    }
    if (editFormState.value.meeting_link) {
      updatePayload.meeting_link = editFormState.value.meeting_link
    }
    if (editFormState.value.meeting_id) {
      updatePayload.meeting_id = editFormState.value.meeting_id
    }
    if (editFormState.value.meeting_pass) {
      updatePayload.meeting_pass = editFormState.value.meeting_pass
    }

    await updateClassroomSession(props.sessionId, updatePayload)

    notification.success({
      message: 'Thành công',
      description: 'Đã cập nhật buổi học thành công',
      duration: 3,
    })

    // Reload session detail
    await loadSessionDetail()
    isEditMode.value = false
    emit('sessionUpdated')
  }
  catch (err: any) {
    console.error('Error updating session:', err)
    notification.error({
      message: 'Lỗi khi cập nhật buổi học',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    isSaving.value = false
  }
}

// Handle cancel
function handleCancel() {
  if (isEditMode.value) {
    handleCancelEdit()
  }
  else {
    dialogVisible.value = false
  }
}

// Handle meeting info inline edit
function startEditMeeting() {
  meetingEditState.value = {
    meeting_link: sessionDetail.value?.meeting_link || '',
    meeting_id: sessionDetail.value?.meeting_id || '',
    meeting_pass: sessionDetail.value?.meeting_pass || '',
  }
  isEditingMeeting.value = true
}

function cancelEditMeeting() {
  isEditingMeeting.value = false
  meetingEditState.value = {
    meeting_link: sessionDetail.value?.meeting_link || '',
    meeting_id: sessionDetail.value?.meeting_id || '',
    meeting_pass: sessionDetail.value?.meeting_pass || '',
  }
}

async function saveMeetingInfo() {
  if (!props.sessionId)
    return

  try {
    isSavingMeeting.value = true

    const updatePayload: any = {}
    if (meetingEditState.value.meeting_link) {
      updatePayload.meeting_link = meetingEditState.value.meeting_link
    }
    if (meetingEditState.value.meeting_id) {
      updatePayload.meeting_id = meetingEditState.value.meeting_id
    }
    if (meetingEditState.value.meeting_pass) {
      updatePayload.meeting_pass = meetingEditState.value.meeting_pass
    }

    await updateClassroomSession(props.sessionId, updatePayload)

    notification.success({
      message: 'Thành công',
      description: 'Đã cập nhật thông tin meeting',
      duration: 3,
    })

    await loadSessionDetail()
    isEditingMeeting.value = false
    emit('sessionUpdated')
  }
  catch (error: any) {
    console.error('Error updating meeting info:', error)
    notification.error({
      message: 'Lỗi',
      description: error?.data?.detail || 'Không thể cập nhật thông tin meeting',
      duration: 5,
    })
  }
  finally {
    isSavingMeeting.value = false
  }
}

// Handle edit classroom
function handleEditClassroom() {
  if (sessionDetail.value?.classroom?.id) {
    showEditClassroomDialog.value = true
  }
}

async function handleClassroomUpdated() {
  // Reload session detail to get updated classroom data
  if (props.sessionId && props.courseId) {
    loadSessionDetail().then(() => {
      emit('sessionUpdated')
    })
  }
}

// Video upload functions
function beforeUpload() {
  return false
}

function handleVideoChange(info: UploadChangeParam) {
  // Get only new files that are not already in the list
  const currentUids = videoFileList.value.map(f => f.uid)
  const newFiles = info.fileList
    .filter(file => !currentUids.includes(file.uid))
    .map((file) => {
      return {
        uid: file.uid,
        name: file.name,
        status: 'pending' as const,
        percent: 0,
        originFileObj: file.originFileObj,
      }
    })

  // Add new files to the list
  if (newFiles.length > 0) {
    videoFileList.value = [...videoFileList.value, ...newFiles]
  }
}

// Load attendance from session
async function loadAttendance() {
  if (!props.sessionId)
    return

  try {
    attendanceLoading.value = true
    const response = await getSessionAttendance(props.sessionId)
    attendance.value = response || []
  }
  catch (err: any) {
    console.error('Error loading attendance:', err)
    // Don't show error notification, just log it
  }
  finally {
    attendanceLoading.value = false
  }
}

// Get user display name for attendance
function getAttendanceDisplayName(user: SessionAttendance['user_info']): string {
  if (user.full_name && user.full_name.trim()) {
    return user.full_name
  }
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  if (fullName) {
    return fullName
  }
  return user.username || user.email || 'N/A'
}

// Get status badge for attendance
function getAttendanceStatusBadge(status: string): { class: string, text: string } {
  switch (status) {
    case 'present':
      return {
        class: 'bg-green-100 text-green-800 border-green-200',
        text: 'Có mặt',
      }
    case 'late':
      return {
        class: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Muộn',
      }
    default:
      return {
        class: 'bg-gray-100 text-gray-800 border-gray-200',
        text: status,
      }
  }
}

// Load videos from session
async function loadVideos() {
  if (!props.sessionId || !props.courseId)
    return

  try {
    videosLoading.value = true
    const response = await getSessionVideos(props.courseId, props.sessionId)
    videoFileList.value = (response.results || []).map((video: any) => ({
      uid: video.id,
      name: video.file_name,
      status: 'done' as const,
      percent: 100,
      url: video.file_url,
      id: video.id,
      file_size: video.file_size,
      content_type: video.content_type,
      duration: video.duration,
    }))
  }
  catch (err: any) {
    console.error('Error loading videos:', err)
    // Don't show error notification, just log it
  }
  finally {
    videosLoading.value = false
  }
}

// Upload single video
async function uploadSingleVideo(uid: string) {
  const fileItem = videoFileList.value.find(f => f.uid === uid)
  if (!fileItem || !fileItem.originFileObj)
    return

  if (fileItem.status === 'uploading' || fileItem.status === 'done')
    return

  if (!props.sessionId || !props.courseId) {
    notification.error({
      message: 'Lỗi',
      description: 'Thiếu thông tin session hoặc course',
      duration: 5,
    })
    return
  }

  fileItem.status = 'uploading'
  fileItem.percent = 0

  try {
    const file = fileItem.originFileObj

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    const fileType = file.type || 'video/mp4'

    if (!allowedTypes.includes(fileType)) {
      throw new Error(`Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`)
    }

    // Step 1: Get presigned URL
    console.warn('Requesting presigned URL for video upload:', {
      courseId: props.courseId,
      sessionId: props.sessionId,
      fileName: file.name,
      contentType: fileType,
    })

    const presignedResponse = await getSessionVideoUploadUrl(
      props.courseId,
      props.sessionId,
      {
        file_name: file.name,
        content_type: fileType,
      },
    )

    console.warn('Presigned URL response:', presignedResponse)

    const uploadUrl = presignedResponse?.upload_url
    const publicUrl = presignedResponse?.public_url

    if (!uploadUrl || !publicUrl) {
      console.error('Missing upload URLs in response:', presignedResponse)
      throw new Error('Không nhận được upload URL từ server')
    }

    // Step 2: Upload to S3 with progress tracking
    await uploadFileWithProgress(
      file,
      uploadUrl,
      (percent) => {
        fileItem.percent = percent
      },
    )

    // Step 3: Create video record
    // Note: duration is optional, frontend can try to extract from video metadata if needed
    const videoResponse = await createSessionVideo(
      props.courseId,
      props.sessionId,
      {
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type || 'video/mp4',
        // duration: optional, can be extracted from video metadata if needed
      },
    )

    // Update file item with video data
    fileItem.status = 'done'
    fileItem.percent = 100
    fileItem.url = publicUrl
    fileItem.id = videoResponse.id
    fileItem.file_size = videoResponse.file_size
    fileItem.content_type = videoResponse.content_type
    fileItem.duration = videoResponse.duration || undefined

    notification.success({
      message: 'Upload thành công',
      description: `Đã upload ${fileItem.name} thành công`,
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Upload video failed:', err)
    console.error('Error details:', {
      message: err?.message,
      data: err?.data,
      response: err?.response,
      status: err?.status,
      statusText: err?.statusText,
    })

    fileItem.status = 'error'

    // Extract error message
    let errorMessage = `Không thể upload ${fileItem.name}`
    if (err?.data?.detail) {
      errorMessage = err.data.detail
    }
    else if (err?.data?.message) {
      errorMessage = err.data.message
    }
    else if (err?.data?.errors) {
      const errorFields = Object.keys(err.data.errors)
      const firstError = errorFields[0]
      errorMessage = `${firstError}: ${err.data.errors[firstError][0]}`
    }
    else if (err?.message) {
      errorMessage = err.message
    }
    else if (err?.response?.data?.detail) {
      errorMessage = err.response.data.detail
    }

    notification.error({
      message: 'Lỗi khi upload video',
      description: errorMessage,
      duration: 5,
    })
  }
}

function removeVideo(uid: string) {
  const fileItem = videoFileList.value.find(f => f.uid === uid)
  if (!fileItem)
    return

  // If video is already uploaded, show confirm dialog and delete from server
  if (fileItem.status === 'done' && fileItem.id) {
    Modal.confirm({
      title: 'Xác nhận xóa video',
      content: `Bạn có chắc chắn muốn xóa video "${fileItem.name}"? Video đã được upload sẽ bị xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      async onOk() {
        try {
          if (props.sessionId && props.courseId && fileItem.id) {
            await deleteSessionVideo(props.courseId, props.sessionId, fileItem.id)
          }
          videoFileList.value = videoFileList.value.filter(file => file.uid !== uid)
          notification.success({
            message: 'Đã xóa video',
            description: `Đã xóa ${fileItem.name}`,
            duration: 3,
          })
        }
        catch (err: any) {
          console.error('Error deleting video:', err)
          notification.error({
            message: 'Lỗi khi xóa video',
            description: err?.message || err?.detail || 'Vui lòng thử lại',
            duration: 5,
          })
        }
      },
    })
  }
  else {
    // If not uploaded yet, just remove from list
    videoFileList.value = videoFileList.value.filter(file => file.uid !== uid)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>

<template>
  <a-modal
    v-model:open="dialogVisible" :title="isEditMode ? 'Chỉnh sửa buổi học' : 'Chi tiết buổi học'" width="700px"
    :footer="null" @cancel="handleCancel"
  >
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>

    <div v-else-if="sessionDetail" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-gray-100">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <Icon name="i-heroicons-calendar-days" class="w-5 h-5 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-900">
              {{ sessionDetail.topic || 'Buổi học' }}
            </h3>
          </div>
          <p
            v-if="sessionDetail.start_time && sessionDetail.end_time && !isEditMode"
            class="text-sm text-gray-500 ml-7"
          >
            {{ formatDateTimeRange(sessionDetail.start_time, sessionDetail.end_time) }}
          </p>
        </div>
        <a-button
          v-if="!isEditMode" type="default" size="small" class="!flex !justify-center !items-center gap-1.5"
          @click="handleEdit"
        >
          <Icon name="i-material-symbols-edit-outline" class="text-[14px]" />
          Chỉnh sửa
        </a-button>
      </div>

      <!-- Edit Mode -->
      <div v-if="isEditMode">
        <a-form ref="editFormRef" :model="editFormState" layout="vertical" class="space-y-4">
          <a-form-item label="Tiêu đề" name="topic" :rules="[{ required: false }]">
            <a-input v-model:value="editFormState.topic" placeholder="Nhập tiêu đề buổi học" size="large" />
          </a-form-item>

          <a-form-item label="Mô tả" name="description">
            <a-textarea
              v-model:value="editFormState.description" placeholder="Nhập mô tả buổi học" :rows="3"
              size="large"
            />
          </a-form-item>

          <div class="grid grid-cols-2 gap-4">
            <a-form-item
              label="Thời gian bắt đầu" name="start_time"
              :rules="[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]"
            >
              <a-date-picker
                v-model:value="editFormState.start_time" show-time format="YYYY-MM-DD HH:mm"
                placeholder="Chọn thời gian bắt đầu" size="large" class="w-full"
              />
            </a-form-item>

            <a-form-item
              label="Thời gian kết thúc" name="end_time"
              :rules="[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]"
            >
              <a-date-picker
                v-model:value="editFormState.end_time" show-time format="YYYY-MM-DD HH:mm"
                placeholder="Chọn thời gian kết thúc" size="large" class="w-full"
              />
            </a-form-item>
          </div>

          <a-form-item label="Địa điểm" name="location">
            <a-input v-model:value="editFormState.location" placeholder="Nhập địa điểm" size="large" />
          </a-form-item>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-semibold text-gray-900 mb-4">
              Thông tin meeting
            </h4>
            <div class="space-y-4">
              <a-form-item label="Meeting Link" name="meeting_link">
                <a-input v-model:value="editFormState.meeting_link" placeholder="https://zoom.us/j/..." size="large" />
              </a-form-item>

              <div class="grid grid-cols-2 gap-4">
                <a-form-item label="Meeting ID" name="meeting_id">
                  <a-input v-model:value="editFormState.meeting_id" placeholder="Nhập Meeting ID" size="large" />
                </a-form-item>

                <a-form-item label="Meeting Password" name="meeting_pass">
                  <a-input
                    v-model:value="editFormState.meeting_pass" placeholder="Nhập password" type="password"
                    size="large"
                  />
                </a-form-item>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <a-button size="large" class="!flex !justify-center !items-center" @click="handleCancelEdit">
              Hủy
            </a-button>
            <a-button
              type="primary" size="large" class="!flex !justify-center !items-center" :loading="isSaving"
              @click="handleSaveEdit"
            >
              Lưu thay đổi
            </a-button>
          </div>
        </a-form>
      </div>

      <!-- View Mode -->
      <div v-else>
        <!-- Meeting Info Section - Full Width -->
        <div class="border border-gray-200 rounded-lg p-3 mb-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-video-camera" class="w-4 h-4 text-blue-500" />
              <h4 class="text-sm font-semibold text-gray-900">
                Thông tin meeting
              </h4>
            </div>
            <a-button
              v-if="!isEditingMeeting" type="default" size="small" class="!h-7 !px-2 text-xs"
              @click="startEditMeeting"
            >
              <Icon name="i-material-symbols-edit-outline" class="w-3 h-3" />
              Chỉnh sửa
            </a-button>
          </div>

          <!-- View Mode -->
          <div v-if="!isEditingMeeting" class="space-y-2">
            <!-- Meeting Link -->
            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Icon name="i-heroicons-link" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <span class="text-xs text-gray-500 mr-2">Link:</span>
                <a
                  v-if="sessionDetail.meeting_link" :href="sessionDetail.meeting_link" target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
                >
                  {{ sessionDetail.meeting_link }}
                </a>
                <span v-else class="text-xs text-gray-400 italic">Chưa có</span>
              </div>
            </div>

            <!-- Meeting ID & Password in one row -->
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-2 flex-1 p-2 bg-gray-50 rounded">
                <Icon name="i-heroicons-identification" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <span class="text-xs text-gray-500 mr-2">ID:</span>
                  <span v-if="sessionDetail.meeting_id" class="text-xs font-medium text-gray-900">
                    {{ sessionDetail.meeting_id }}
                  </span>
                  <span v-else class="text-xs text-gray-400 italic">Chưa có</span>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-1 p-2 bg-gray-50 rounded">
                <Icon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <span class="text-xs text-gray-500 mr-2">Pass:</span>
                  <span v-if="sessionDetail.meeting_pass" class="text-xs font-medium text-gray-900 font-mono">
                    {{ sessionDetail.meeting_pass }}
                  </span>
                  <span v-else class="text-xs text-gray-400 italic">Chưa có</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-2">
            <a-input
              v-model:value="meetingEditState.meeting_link" placeholder="Meeting Link" size="small"
              class="!text-xs !h-8"
            >
              <template #prefix>
                <Icon name="i-heroicons-link" class="w-3.5 h-3.5 text-gray-400" />
              </template>
            </a-input>

            <div class="flex items-center gap-2">
              <a-input
                v-model:value="meetingEditState.meeting_id" placeholder="Meeting ID" size="small"
                class="!text-xs !h-8 flex-1"
              >
                <template #prefix>
                  <Icon name="i-heroicons-identification" class="w-3.5 h-3.5 text-gray-400" />
                </template>
              </a-input>

              <a-input
                v-model:value="meetingEditState.meeting_pass" placeholder="Password" size="small"
                class="!text-xs !h-8 flex-1"
              >
                <template #prefix>
                  <Icon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-gray-400" />
                </template>
              </a-input>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <a-button size="small" class="!h-7 !px-3 text-xs" @click="cancelEditMeeting">
                Hủy
              </a-button>
              <a-button
                type="primary" size="small" class="!h-7 !px-3 text-xs" :loading="isSavingMeeting"
                @click="saveMeetingInfo"
              >
                Lưu
              </a-button>
            </div>
          </div>
        </div>

        <!-- Session Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Location -->
          <div v-if="sessionDetail.location" class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Icon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500 mb-1">
                Địa điểm
              </p>
              <p class="text-sm font-medium text-gray-900">
                {{ sessionDetail.location }}
              </p>
            </div>
          </div>
        </div>

        <!-- Classroom and Course Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Classroom Info -->
          <div v-if="sessionDetail.classroom" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <Icon name="i-heroicons-academic-cap" class="w-4 h-4 text-purple-500" />
                <h4 class="text-sm font-semibold text-gray-700">
                  Lớp học
                </h4>
              </div>
              <a-button type="link" size="small" class="!h-auto !p-0 !text-xs" @click="handleEditClassroom">
                Sửa
              </a-button>
            </div>
            <p class="text-sm font-medium text-gray-900 mb-2">
              {{ sessionDetail.classroom.title }}
            </p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span class="flex items-center gap-1">
                <Icon name="i-heroicons-users" class="w-3.5 h-3.5" />
                Tối đa {{ sessionDetail.classroom.student_count }} học viên
              </span>
              <span class="flex items-center gap-1">
                <Icon name="i-heroicons-currency-euro" class="w-3.5 h-3.5" />
                €{{ sessionDetail.classroom.price }}
              </span>
              <span v-if="sessionDetail.classroom.discount_price" class="flex items-center gap-1 text-orange-600">
                <Icon name="i-heroicons-tag" class="w-3.5 h-3.5" />
                KM: €{{ sessionDetail.classroom.discount_price }}
              </span>
            </div>
          </div>

          <!-- Course Info -->
          <div v-if="sessionDetail.course" class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <Icon name="i-heroicons-book-open" class="w-4 h-4 text-green-500" />
              <h4 class="text-sm font-semibold text-gray-700">
                Khóa học
              </h4>
            </div>
            <p class="text-sm font-medium text-gray-900">
              {{ sessionDetail.course.title }}
            </p>
          </div>
        </div>

        <!-- Attendance Section -->
        <div class="pt-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-clipboard-document-check" class="w-4 h-4 text-emerald-500" />
              <h4 class="text-sm font-semibold text-gray-900">
                Danh sách học sinh đã điểm danh
              </h4>
            </div>
            <div v-if="attendance.length > 0" class="flex items-center gap-3 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {{ attendance.filter(a => a.status === 'present').length }} Có mặt
              </span>
              <span class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                {{ attendance.filter(a => a.status === 'late').length }} Muộn
              </span>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="attendanceLoading" class="flex items-center justify-center py-6">
            <a-spin size="small" />
          </div>

          <!-- Empty State -->
          <div v-else-if="attendance.length === 0" class="text-center py-6 text-gray-400">
            <Icon name="i-heroicons-users" class="w-6 h-6 mx-auto mb-1.5" />
            <p class="text-sm">
              Chưa có học sinh nào tham gia
            </p>
          </div>

          <!-- Attendance List -->
          <div v-else class="space-y-1.5">
            <div
              v-for="(record, index) in attendance" :key="record.id || index"
              class="flex items-center justify-between p-2.5 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <div
                  class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200"
                >
                  <Icon name="i-heroicons-user" class="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getAttendanceDisplayName(record.user_info) }}
                  </p>
                  <p v-if="record.user_info.email" class="text-xs text-gray-500 truncate">
                    {{ record.user_info.email }}
                  </p>
                </div>
              </div>
              <span
                class="whitespace-nowrap px-2 py-0.5 rounded text-xs font-medium ml-2"
                :class="getAttendanceStatusBadge(record.status).class"
              >
                {{ getAttendanceStatusBadge(record.status).text }}
              </span>
            </div>
          </div>
        </div>

        <!-- Video Upload Section -->
        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-video-camera" class="w-4 h-4 text-red-500" />
              <h4 class="text-sm font-semibold text-gray-900">
                Video buổi học
              </h4>
            </div>
            <a-upload
              name="videos" :multiple="true" :before-upload="beforeUpload" :show-upload-list="false"
              accept="video/mp4,video/quicktime,video/x-msvideo" @change="handleVideoChange"
            >
              <a-button type="default" size="small" class="!flex !justify-center !items-center gap-1 !h-7">
                <Icon name="i-material-symbols-add-2-rounded" class="text-[14px]" />
                Thêm
              </a-button>
            </a-upload>
          </div>

          <!-- Loading State -->
          <div v-if="videosLoading" class="flex items-center justify-center py-6">
            <a-spin size="small" />
          </div>

          <!-- Video List -->
          <div v-else-if="videoFileList.length > 0" class="space-y-1.5">
            <div
              v-for="file in videoFileList" :key="file.uid"
              class="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Icon name="i-heroicons-play-circle" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ file.name }}
                </p>
                <div class="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <span v-if="file.originFileObj">{{ formatFileSize(file.originFileObj.size) }}</span>
                  <span v-else-if="file.file_size">{{ formatFileSize(file.file_size) }}</span>
                  <span v-if="file.duration" class="text-gray-400">
                    • {{ Math.floor(file.duration / 60) }}:{{ String(file.duration % 60).padStart(2, '0') }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <!-- Upload Button (only show if pending) -->
                <template v-if="file.status === 'pending'">
                  <a-button
                    type="primary" size="small" class="!h-7 !px-2 !text-xs"
                    @click="uploadSingleVideo(file.uid)"
                  >
                    Upload
                  </a-button>
                </template>

                <!-- Progress (if uploading) -->
                <template v-else-if="file.status === 'uploading'">
                  <div class="flex items-center gap-1.5 min-w-[100px]">
                    <a-progress
                      :percent="Number((file.percent || 0).toFixed(1))" :show-info="false" status="active"
                      stroke-color="#16a34a" class="!h-1.5 flex-1"
                    />
                    <span class="text-xs text-gray-500 whitespace-nowrap">
                      {{ (file.percent || 0).toFixed(0) }}%
                    </span>
                  </div>
                </template>

                <!-- Status (if done) -->
                <template v-else-if="file.status === 'done'">
                  <div class="flex items-center gap-1.5">
                    <a
                      v-if="file.url" :href="file.url" target="_blank" rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-700"
                    >
                      <Icon name="i-heroicons-play" class="w-4 h-4" />
                    </a>
                    <Icon name="i-heroicons-check-circle" class="w-4 h-4 text-green-600" />
                  </div>
                </template>

                <!-- Status (if error) -->
                <template v-else-if="file.status === 'error'">
                  <Icon name="i-heroicons-x-circle" class="w-4 h-4 text-red-500" />
                </template>

                <!-- Remove Button -->
                <a-button
                  type="text" size="small" danger class="!h-7 !w-7 !p-0 !flex !justify-center !items-center"
                  @click="removeVideo(file.uid)"
                >
                  <CloseOutlined />
                </a-button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-6 text-gray-400">
            <Icon name="i-heroicons-video-camera-slash" class="w-6 h-6 mx-auto mb-1.5" />
            <p class="text-xs">
              Chưa có video nào
            </p>
          </div>
        </div>

        <!-- Students List -->
        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Icon name="i-heroicons-user-group" class="w-4 h-4 text-indigo-500" />
              <h4 class="text-sm font-semibold text-gray-900">
                Danh sách học sinh
              </h4>
            </div>
            <a-button
              type="default" size="small" class="!flex !justify-center !items-center gap-1 !h-7"
              @click="showAddStudent = !showAddStudent"
            >
              <Icon name="i-material-symbols-add-2-rounded" class="text-[14px]" />
              Thêm
            </a-button>
          </div>

          <!-- Add Student Form -->
          <div v-if="showAddStudent" class="mb-3 p-3 bg-gray-50 rounded-md">
            <div class="flex gap-2">
              <a-input
                v-model:value="addStudentEmail" placeholder="Nhập email học sinh" size="small" class="flex-1"
                @press-enter="handleAddStudent"
              />
              <a-button type="primary" size="small" class="!h-7" :loading="addStudentLoading" @click="handleAddStudent">
                Thêm
              </a-button>
              <a-button size="small" class="!h-7" @click="showAddStudent = false">
                Hủy
              </a-button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="studentsLoading" class="flex items-center justify-center py-6">
            <a-spin size="small" />
          </div>

          <!-- Empty State -->
          <div v-else-if="students.length === 0" class="text-center py-6 text-gray-400">
            <Icon name="i-heroicons-users" class="w-6 h-6 mx-auto mb-1.5" />
            <p class="text-xs">
              Chưa có học sinh nào trong lớp
            </p>
          </div>

          <!-- Students List -->
          <div v-else class="flex flex-wrap gap-2">
            <a-tooltip
              v-for="student in students" :key="student.id"
              :title="student.email_linked || 'Không có email liên kết'" placement="top"
            >
              <div
                class="flex w-fit items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <a-avatar v-if="student.avatar" :size="20" :src="student.avatar" class="flex-shrink-0" />
                <div
                  v-else
                  class="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200"
                >
                  <Icon name="i-heroicons-user" class="w-3 h-3 text-gray-400" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 truncate">
                    {{ student.full_name || student.username }}
                  </span>
                  <span v-if="student.email" class="text-xs text-gray-500 truncate">{{ student.email }}</span>
                </div>
                <button
                  type="button"
                  class="flex cursor-pointer items-center justify-center w-4 h-4 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  @click.stop="handleRemoveStudent(student.id)"
                >
                  <CloseOutlined class="w-3 h-3" />
                </button>
              </div>
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- Remove Student Confirm Dialog -->
  <a-modal
    v-model:open="showRemoveStudentDialog" title="Xác nhận xóa học sinh" width="500px"
    :confirm-loading="removingStudent" @ok="confirmRemoveStudent" @cancel="cancelRemoveStudent"
  >
    <div class="py-2">
      <p class="text-gray-700 mb-4">
        Bạn có chắc chắn muốn xóa học sinh này khỏi lớp không?
      </p>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <a-checkbox v-model:checked="deleteOrderOnRemove" class="w-full">
          <div>
            <div class="font-medium text-yellow-900 mb-1">
              Xóa luôn đơn hàng
            </div>
            <div class="text-sm text-yellow-700">
              Nếu bạn đã thêm nhầm học sinh và muốn xóa luôn đơn hàng để doanh thu không bị nhầm, hãy chọn tùy chọn này.
              <br>
              Mặc định chỉ xóa enrollment, đơn hàng sẽ được đánh dấu là "đã hủy".
            </div>
          </div>
        </a-checkbox>
      </div>
    </div>
  </a-modal>

  <!-- Edit Classroom Dialog -->
  <EditClassroomDialog
    v-model:open="showEditClassroomDialog" :classroom-id="sessionDetail?.classroom?.id || null"
    @success="handleClassroomUpdated"
  />
</template>
