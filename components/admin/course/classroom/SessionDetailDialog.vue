<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Modal, notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import { useFileUpload } from '~/composables/useFileUpload'

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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getCourseSessionDetail,
  quickEnrollStudent,
  removeStudentFromClassroom,
  updateClassroomSession,
  getClassroomStudents,
  getSessionVideoUploadUrl,
  createSessionVideo,
  getSessionVideos,
  deleteSessionVideo,
  getSessionMaterialUploadUrl,
  createSessionMaterial,
  getSessionMaterials,
  deleteSessionMaterial,
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

// Add student state
const showAddStudent = ref(false)
const addStudentEmail = ref('')
const addStudentLoading = ref(false)

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

// Material upload state
interface MaterialFileItem {
  uid: string
  name: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  percent?: number
  url?: string
  originFileObj?: File
  id?: string // Material ID from API (after upload)
  title?: string
  description?: string
  file_type?: string
  file_size?: number
}

const materialFileList = ref<MaterialFileItem[]>([])
const materialsLoading = ref(false)

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
    await loadVideos()
    await loadMaterials()
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
    materialFileList.value = []
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
function formatDate(dateTimeString: string): string {
  if (!dateTimeString)
    return ''
  return dayjs(dateTimeString).format('DD/MM/YYYY')
}

// Format time only
function formatTime(dateTimeString: string): string {
  if (!dateTimeString)
    return ''
  return dayjs(dateTimeString).format('HH:mm')
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

// Handle remove student
async function handleRemoveStudent(userId: number) {
  if (!props.classroomId)
    return

  try {
    await removeStudentFromClassroom(props.classroomId, userId)

    notification.success({
      message: 'Đã xóa học sinh khỏi lớp thành công',
      duration: 3,
    })

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

// Load materials from session
async function loadMaterials() {
  if (!props.sessionId || !props.courseId)
    return

  try {
    materialsLoading.value = true
    const response = await getSessionMaterials(props.courseId, props.sessionId)
    materialFileList.value = (response.results || []).map((material: any) => ({
      uid: material.id,
      name: material.file_name,
      status: 'done' as const,
      percent: 100,
      url: material.file_url,
      id: material.id,
      title: material.title,
      description: material.description,
      file_type: material.file_type,
      file_size: material.file_size,
    }))
  }
  catch (err: any) {
    console.error('Error loading materials:', err)
    // Don't show error notification, just log it
  }
  finally {
    materialsLoading.value = false
  }
}

// Material upload functions
function beforeMaterialUpload(file: File): boolean {
  // Reject video files (videos should use video upload)
  if (file.type.startsWith('video/')) {
    notification.error({
      message: 'Lỗi',
      description: 'Vui lòng sử dụng chức năng upload video cho file video',
      duration: 5,
    })
    return false
  }

  // Check file size (max 100MB)
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    notification.error({
      message: 'File quá lớn',
      description: 'Kích thước file không được vượt quá 100MB',
      duration: 5,
    })
    return false
  }

  return false // Prevent auto upload
}

function handleMaterialChange(info: UploadChangeParam) {
  // Get only new files that are not already in the list
  const currentUids = materialFileList.value.map(f => f.uid)
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
    materialFileList.value = [...materialFileList.value, ...newFiles]
  }
}

// Get file type from file
function getFileTypeFromFile(file: File): string {
  const mimeType = file.type.toLowerCase()
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  // PDF
  if (mimeType === 'application/pdf' || fileExtension === 'pdf')
    return 'pdf'

  // Word Documents
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === 'docx')
    return 'docx'
  if (mimeType === 'application/msword' || fileExtension === 'doc')
    return 'doc'

  // PowerPoint
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileExtension === 'pptx')
    return 'pptx'
  if (mimeType === 'application/vnd.ms-powerpoint' || fileExtension === 'ppt')
    return 'ppt'

  // ZIP
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed' || fileExtension === 'zip' || fileExtension === 'rar')
    return 'zip'

  // Images
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileExtension || ''))
    return 'image'

  // Audio
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg'].includes(fileExtension || ''))
    return 'audio'

  // Other
  return 'other'
}

// Upload single material
async function uploadSingleMaterial(uid: string) {
  const fileItem = materialFileList.value.find(f => f.uid === uid)
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

    // Step 1: Get presigned URL
    const presignedResponse = await getSessionMaterialUploadUrl(
      props.courseId,
      props.sessionId,
      {
        file_name: file.name,
        content_type: file.type || 'application/octet-stream',
      },
    )

    const uploadUrl = presignedResponse?.upload_url
    const publicUrl = presignedResponse?.public_url

    if (!uploadUrl || !publicUrl) {
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

    // Step 3: Create material record
    const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    const materialResponse = await createSessionMaterial(
      props.courseId,
      props.sessionId,
      {
        title: fileName,
        description: '',
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: getFileTypeFromFile(file),
      },
    )

    // Update file item with material data
    fileItem.status = 'done'
    fileItem.percent = 100
    fileItem.url = publicUrl
    fileItem.id = materialResponse.id
    fileItem.title = materialResponse.title
    fileItem.description = materialResponse.description
    fileItem.file_type = materialResponse.file_type
    fileItem.file_size = materialResponse.file_size

    notification.success({
      message: 'Upload thành công',
      description: `Đã upload ${fileItem.name} thành công`,
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Upload material failed:', err)
    fileItem.status = 'error'
    notification.error({
      message: 'Lỗi khi upload tài liệu',
      description: err?.data?.message || err?.message || `Không thể upload ${fileItem.name}`,
      duration: 5,
    })
  }
}

function removeMaterial(uid: string) {
  const fileItem = materialFileList.value.find(f => f.uid === uid)
  if (!fileItem)
    return

  // If material is already uploaded, show confirm dialog and delete from server
  if (fileItem.status === 'done' && fileItem.id) {
    Modal.confirm({
      title: 'Xác nhận xóa tài liệu',
      content: `Bạn có chắc chắn muốn xóa tài liệu "${fileItem.name}"? Tài liệu đã được upload sẽ bị xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      async onOk() {
        try {
          if (props.sessionId && props.courseId && fileItem.id) {
            await deleteSessionMaterial(props.courseId, props.sessionId, fileItem.id)
          }
          materialFileList.value = materialFileList.value.filter(file => file.uid !== uid)
          notification.success({
            message: 'Đã xóa tài liệu',
            description: `Đã xóa ${fileItem.name}`,
            duration: 3,
          })
        }
        catch (err: any) {
          console.error('Error deleting material:', err)
          notification.error({
            message: 'Lỗi khi xóa tài liệu',
            description: err?.message || err?.detail || 'Vui lòng thử lại',
            duration: 5,
          })
        }
      },
    })
  }
  else {
    // If not uploaded yet, just remove from list
    materialFileList.value = materialFileList.value.filter(file => file.uid !== uid)
  }
}

// Get file icon based on file type
function getFileIcon(fileType?: string): string {
  if (!fileType)
    return 'solar:file-bold-duotone'
  const iconMap: Record<string, string> = {
    pdf: 'solar:file-text-bold-duotone',
    doc: 'solar:file-word-bold-duotone',
    docx: 'solar:file-word-bold-duotone',
    ppt: 'solar:file-presentation-bold-duotone',
    pptx: 'solar:file-presentation-bold-duotone',
    zip: 'solar:file-archive-bold-duotone',
    image: 'solar:file-image-bold-duotone',
    audio: 'solar:file-music-bold-duotone',
  }
  return iconMap[fileType] || 'solar:file-bold-duotone'
}
</script>

<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="isEditMode ? 'Chỉnh sửa buổi học' : 'Chi tiết buổi học'"
    width="900px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>

    <div v-else-if="sessionDetail" class="space-y-6">
      <!-- Header with Edit Button -->
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ sessionDetail.topic || 'Buổi học' }}
          </h3>
          <p v-if="sessionDetail.description && !isEditMode" class="text-gray-600 text-sm">
            {{ sessionDetail.description }}
          </p>
        </div>
        <a-button
          v-if="!isEditMode"
          type="primary"
          size="small"
          class="!flex !justify-center !items-center"
          @click="handleEdit"
        >
          <Icon name="i-material-symbols-edit-outline" class="text-[16px]" />
          Chỉnh sửa buổi học
        </a-button>
      </div>

      <!-- Edit Mode -->
      <div v-if="isEditMode">
        <a-form
          ref="editFormRef"
          :model="editFormState"
          layout="vertical"
          class="space-y-4"
        >
          <a-form-item
            label="Tiêu đề"
            name="topic"
            :rules="[{ required: false }]"
          >
            <a-input
              v-model:value="editFormState.topic"
              placeholder="Nhập tiêu đề buổi học"
              size="large"
            />
          </a-form-item>

          <a-form-item
            label="Mô tả"
            name="description"
          >
            <a-textarea
              v-model:value="editFormState.description"
              placeholder="Nhập mô tả buổi học"
              :rows="3"
              size="large"
            />
          </a-form-item>

          <div class="grid grid-cols-2 gap-4">
            <a-form-item
              label="Thời gian bắt đầu"
              name="start_time"
              :rules="[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]"
            >
              <a-date-picker
                v-model:value="editFormState.start_time"
                show-time
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn thời gian bắt đầu"
                size="large"
                class="w-full"
              />
            </a-form-item>

            <a-form-item
              label="Thời gian kết thúc"
              name="end_time"
              :rules="[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]"
            >
              <a-date-picker
                v-model:value="editFormState.end_time"
                show-time
                format="YYYY-MM-DD HH:mm"
                placeholder="Chọn thời gian kết thúc"
                size="large"
                class="w-full"
              />
            </a-form-item>
          </div>

          <a-form-item
            label="Địa điểm"
            name="location"
          >
            <a-input
              v-model:value="editFormState.location"
              placeholder="Nhập địa điểm"
              size="large"
            />
          </a-form-item>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-semibold text-gray-900 mb-4">
              Thông tin meeting
            </h4>
            <div class="space-y-4">
              <a-form-item
                label="Meeting Link"
                name="meeting_link"
              >
                <a-input
                  v-model:value="editFormState.meeting_link"
                  placeholder="https://zoom.us/j/..."
                  size="large"
                />
              </a-form-item>

              <div class="grid grid-cols-2 gap-4">
                <a-form-item
                  label="Meeting ID"
                  name="meeting_id"
                >
                  <a-input
                    v-model:value="editFormState.meeting_id"
                    placeholder="Nhập Meeting ID"
                    size="large"
                  />
                </a-form-item>

                <a-form-item
                  label="Meeting Password"
                  name="meeting_pass"
                >
                  <a-input
                    v-model:value="editFormState.meeting_pass"
                    placeholder="Nhập password"
                    type="password"
                    size="large"
                  />
                </a-form-item>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <a-button
              size="large"
              class="!flex !justify-center !items-center"
              @click="handleCancelEdit"
            >
              Hủy
            </a-button>
            <a-button
              type="primary"
              size="large"
              class="!flex !justify-center !items-center"
              :loading="isSaving"
              @click="handleSaveEdit"
            >
              Lưu thay đổi
            </a-button>
          </div>
        </a-form>
      </div>

      <!-- View Mode -->
      <div v-else>
        <!-- Session Details -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Ngày</label>
            <p class="text-gray-900 mt-1">
              {{ formatDate(sessionDetail.start_time) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Thời gian</label>
            <p class="text-gray-900 mt-1">
              <span v-if="sessionDetail.start_time && sessionDetail.end_time">
                Từ {{ formatTime(sessionDetail.start_time) }} đến {{ formatTime(sessionDetail.end_time) }}
              </span>
              <span v-else-if="sessionDetail.start_time">
                {{ formatTime(sessionDetail.start_time) }}
              </span>
            </p>
          </div>
          <div v-if="sessionDetail.location">
            <label class="text-sm font-medium text-gray-500">Địa điểm</label>
            <p class="text-gray-900 mt-1">
              {{ sessionDetail.location }}
            </p>
          </div>
          <div v-if="sessionDetail.meeting_link">
            <label class="text-sm font-medium text-gray-500">Meeting Link</label>
            <a
              :href="sessionDetail.meeting_link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline mt-1 block"
            >
              {{ sessionDetail.meeting_link }}
            </a>
          </div>
          <div v-if="sessionDetail.meeting_id">
            <label class="text-sm font-medium text-gray-500">Meeting ID</label>
            <p class="text-gray-900 mt-1">
              {{ sessionDetail.meeting_id }}
            </p>
          </div>
        </div>

        <!-- Classroom and Course Info -->
        <div class="grid grid-cols-2 gap-4 border-t border-gray-200 my-4 pt-4">
          <!-- Classroom Info -->
          <div v-if="sessionDetail.classroom" class="space-y-2">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">
              Lớp học
            </h4>
            <p class="text-sm text-gray-900">
              {{ sessionDetail.classroom.title }}
            </p>
            <div class="flex items-center gap-4 text-xs text-gray-600">
              <span>Tối đa {{ sessionDetail.classroom.student_count }} học viên</span>
              <span>•</span>
              <span>€{{ sessionDetail.classroom.price }}</span>
              <span
                v-if="sessionDetail.classroom.discount_price"
                class="text-orange-600"
              >
                (KM: €{{ sessionDetail.classroom.discount_price }})
              </span>
            </div>
          </div>

          <!-- Course Info -->
          <div v-if="sessionDetail.course" class="space-y-2">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">
              Khóa học
            </h4>
            <p class="text-sm text-gray-900">
              {{ sessionDetail.course.title }}
            </p>
          </div>
        </div>

        <!-- Video Upload Section -->
        <div class="border-t border-gray-200 py-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-gray-900">
              Video buổi học
            </h4>
            <a-upload
              name="videos"
              :multiple="true"
              :before-upload="beforeUpload"
              :show-upload-list="false"
              accept="video/mp4,video/quicktime,video/x-msvideo"
              @change="handleVideoChange"
            >
              <a-button
                type="primary"
                size="small"
                class="!flex !justify-center !items-center"
              >
                <Icon name="i-material-symbols-add-2-rounded" class="text-[16px]" />
                Thêm video
              </a-button>
            </a-upload>
          </div>

          <!-- Loading State -->
          <div v-if="videosLoading" class="flex items-center justify-center py-4">
            <a-spin />
          </div>

          <!-- Video List -->
          <div v-else-if="videoFileList.length > 0" class="space-y-3">
            <div
              v-for="file in videoFileList"
              :key="file.uid"
              class="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <Icon name="solar:play-circle-bold-duotone" class="text-2xl text-blue-600 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">
                      {{ file.name }}
                    </p>
                    <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span v-if="file.originFileObj">{{ formatFileSize(file.originFileObj.size) }}</span>
                      <span v-else-if="file.file_size">{{ formatFileSize(file.file_size) }}</span>
                      <span v-if="file.duration" class="text-gray-400">
                        • {{ Math.floor(file.duration / 60) }}:{{ String(file.duration % 60).padStart(2, '0') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- Upload Button (only show if pending) -->
                  <template v-if="file.status === 'pending'">
                    <a-button
                      type="primary"
                      size="small"
                      class="!flex !justify-center !items-center"
                      @click="uploadSingleVideo(file.uid)"
                    >
                      Upload video này
                    </a-button>
                  </template>

                  <!-- Progress (if uploading) -->
                  <template v-else-if="file.status === 'uploading'">
                    <div class="flex items-center gap-2 min-w-[120px]">
                      <a-progress
                        :percent="Number((file.percent || 0).toFixed(1))"
                        :show-info="false"
                        status="active"
                        stroke-color="#16a34a"
                        class="!h-2 flex-1"
                      />
                      <span class="text-xs text-gray-600 whitespace-nowrap">
                        {{ (file.percent || 0).toFixed(1) }}%
                      </span>
                    </div>
                  </template>

                  <!-- Status (if done) -->
                  <template v-else-if="file.status === 'done'">
                    <div class="flex items-center gap-2">
                      <a
                        v-if="file.url"
                        :href="file.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <Icon name="solar:play-circle-bold-duotone" class="text-lg" />
                      </a>
                      <Icon name="solar:check-circle-bold" class="text-green-600 text-lg" />
                      <span class="text-xs text-green-600">Hoàn thành</span>
                    </div>
                  </template>

                  <!-- Status (if error) -->
                  <template v-else-if="file.status === 'error'">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:close-circle-bold" class="text-red-600 text-lg" />
                      <span class="text-xs text-red-600">Lỗi</span>
                    </div>
                  </template>

                  <!-- Remove Button -->
                  <a-button
                    type="text"
                    size="small"
                    danger
                    class="!h-8 !w-8 !p-0 !flex !justify-center !items-center"
                    @click="removeVideo(file.uid)"
                  >
                    <CloseOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-4 text-gray-500 text-sm">
            Chưa có video nào
          </div>
        </div>

        <!-- Materials Upload Section -->
        <div class="border-t border-gray-200 py-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-gray-900">
              Tài liệu buổi học
            </h4>
            <a-upload
              name="materials"
              :multiple="true"
              :before-upload="beforeMaterialUpload"
              :show-upload-list="false"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.m4a"
              @change="handleMaterialChange"
            >
              <a-button
                type="primary"
                size="small"
                class="!flex !justify-center !items-center"
              >
                <Icon name="i-material-symbols-add-2-rounded" class="text-[16px]" />
                Thêm tài liệu
              </a-button>
            </a-upload>
          </div>

          <!-- Loading State -->
          <div v-if="materialsLoading" class="flex items-center justify-center py-4">
            <a-spin />
          </div>

          <!-- Materials List -->
          <div v-else-if="materialFileList.length > 0" class="space-y-3">
            <div
              v-for="file in materialFileList"
              :key="file.uid"
              class="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <Icon :name="getFileIcon(file.file_type)" class="text-2xl text-blue-600 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">
                      {{ file.title || file.name }}
                    </p>
                    <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span v-if="file.originFileObj">{{ formatFileSize(file.originFileObj.size) }}</span>
                      <span v-else-if="file.file_size">{{ formatFileSize(file.file_size) }}</span>
                      <span v-if="file.file_type" class="uppercase">{{ file.file_type }}</span>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- Upload Button (only show if pending) -->
                  <template v-if="file.status === 'pending'">
                    <a-button
                      type="primary"
                      size="small"
                      class="!flex !justify-center !items-center"
                      @click="uploadSingleMaterial(file.uid)"
                    >
                      Upload tài liệu này
                    </a-button>
                  </template>

                  <!-- Progress (if uploading) -->
                  <template v-else-if="file.status === 'uploading'">
                    <div class="flex items-center gap-2 min-w-[120px]">
                      <a-progress
                        :percent="Number((file.percent || 0).toFixed(1))"
                        :show-info="false"
                        status="active"
                        stroke-color="#16a34a"
                        class="!h-2 flex-1"
                      />
                      <span class="text-xs text-gray-600 whitespace-nowrap">
                        {{ (file.percent || 0).toFixed(1) }}%
                      </span>
                    </div>
                  </template>

                  <!-- Status (if done) -->
                  <template v-else-if="file.status === 'done'">
                    <div class="flex items-center gap-2">
                      <a
                        v-if="file.url"
                        :href="file.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <Icon name="solar:download-bold-duotone" class="text-lg" />
                      </a>
                      <Icon name="solar:check-circle-bold" class="text-green-600 text-lg" />
                      <span class="text-xs text-green-600">Hoàn thành</span>
                    </div>
                  </template>

                  <!-- Status (if error) -->
                  <template v-else-if="file.status === 'error'">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:close-circle-bold" class="text-red-600 text-lg" />
                      <span class="text-xs text-red-600">Lỗi</span>
                    </div>
                  </template>

                  <!-- Remove Button -->
                  <a-button
                    type="text"
                    size="small"
                    danger
                    class="!h-8 !w-8 !p-0 !flex !justify-center !items-center"
                    @click="removeMaterial(file.uid)"
                  >
                    <CloseOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-4 text-gray-500 text-sm">
            Chưa có tài liệu nào
          </div>
        </div>

        <!-- Students List -->
        <div class="border-t border-gray-200 py-4">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-gray-900">
              Danh sách học sinh
            </h4>
            <a-button
              type="primary"
              size="small"
              class="!flex !justify-center !items-center"
              @click="showAddStudent = !showAddStudent"
            >
              <Icon name="i-material-symbols-add-2-rounded" class="text-[16px]" />
              Thêm học sinh
            </a-button>
          </div>

          <!-- Add Student Form -->
          <div v-if="showAddStudent" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex gap-2">
              <a-input
                v-model:value="addStudentEmail"
                placeholder="Nhập email học sinh"
                size="large"
                class="flex-1"
                @press-enter="handleAddStudent"
              />
              <a-button
                type="primary"
                size="large"
                class="!flex !justify-center !items-center"
                :loading="addStudentLoading"
                @click="handleAddStudent"
              >
                Thêm học sinh này
              </a-button>
              <a-button
                size="large"
                class="!flex !justify-center !items-center"
                @click="showAddStudent = false"
              >
                Hủy
              </a-button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="studentsLoading" class="flex items-center justify-center py-4">
            <a-spin />
          </div>

          <!-- Empty State -->
          <div v-else-if="students.length === 0" class="text-center py-8">
            <Icon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">
              Chưa có học sinh nào trong lớp
            </p>
          </div>

          <!-- Students List -->
          <div v-else class="space-y-2">
            <div
              v-for="student in students"
              :key="student.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="i-heroicons-user" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ student.full_name || `${student.first_name} ${student.last_name}` }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ student.email }}
                  </p>
                </div>
              </div>
              <a-button
                type="text"
                danger
                size="small"
                class="!flex !justify-center !items-center"
                @click="handleRemoveStudent(student.id)"
              >
                <Icon name="i-material-symbols-delete-outline" class="text-[16px]" />
                Xóa
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
