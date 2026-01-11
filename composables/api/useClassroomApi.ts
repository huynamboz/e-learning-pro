import type { ListApiResponse } from '~/api/apiClient'
import type { CalendarApiResponse, Classroom, ClassroomDetail, ClassroomSchedule } from '~/types/course.type'
import { useApiClient } from '~/api/apiClient'

export interface ClassroomPayload {
  course_id: string
  title: string
  student_count: number
  schedules_data: ClassroomSchedule[]
  meeting_link?: string
  // Pricing fields (independent from course)
  price?: string
  discount_price?: string | null
  is_free?: boolean
}

export interface ClassroomSession {
  id: string
  classroom: string
  topic: string
  description: string
  start_time: string
  end_time: string
  location: string
  meeting_link: string
  meeting_id: string
  meeting_pass: string
  limit: number
  status: string
  classroom_title: string
  course_title: string
  attendance_count: number
  present_count: number
  created_at: string
  updated_at: string
}

export interface ClassroomSessionsResponse extends ListApiResponse<ClassroomSession> {}

export interface SessionAttendanceUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export interface SessionAttendance {
  id: string
  session: string
  user: number
  user_info: SessionAttendanceUser
  status: 'present' | 'late'
  note: string
  checked_at: string
  session_topic: string
  created_at: string
  updated_at: string
}

export function useClassroomApi() {
  const apiClient = useApiClient()

  return {
    // Get all classrooms
    getClassrooms: () =>
      apiClient.get<ListApiResponse<Classroom>>('/classrooms/'),

    // Get classrooms by course
    getClassroomsByCourse: (courseId: string) =>
      apiClient.get<Classroom[]>(`/classrooms/course/${courseId}/`),

    // Create classroom
    createClassroom: (classroomData: ClassroomPayload) =>
      apiClient.post<Classroom>('/classrooms/', classroomData),

    // Update classroom
    updateClassroom: (id: string, classroomData: Partial<ClassroomPayload>) =>
      apiClient.put<Classroom>(`/classrooms/${id}/`, classroomData),

    // Patch classroom (for partial updates)
    patchClassroom: (id: string, classroomData: Partial<ClassroomPayload>) =>
      apiClient.patch<Classroom>(`/classrooms/${id}/`, classroomData),

    // Delete classroom
    deleteClassroom: (id: string) =>
      apiClient.delete(`/classrooms/${id}/`),

    // Get classroom detail
    getClassroom: (id: string) =>
      apiClient.get<Classroom>(`/classrooms/${id}/`),

    // Get classroom detail by classroom ID
    getClassroomDetail: (classroomId: string) =>
      apiClient.get<ClassroomDetail>(`/classrooms/${classroomId}/`),

    // Get classroom sessions
    getClassroomSessions: (classroomId: string) =>
      apiClient.get<ClassroomSessionsResponse>(`/classrooms/${classroomId}/sessions/`),

    // Create classroom session
    createClassroomSession: (classroomId: string, sessionData: Partial<ClassroomSession>) =>
      apiClient.post<ClassroomSession>(`/classrooms/${classroomId}/sessions/`, sessionData),

    // Create bulk sessions for classroom
    createBulkSessions: (classroomId: string, payload: {
      schedules_data: Array<{
        day_of_week: string
        start_time: string
        end_time: string
        repeat_start_date?: string
        repeat_end_date?: string
      }>
      meeting_link?: string
      meeting_id?: string
      meeting_pass?: string
    }) =>
      apiClient.post<any>(`/classrooms/${classroomId}/sessions/bulk/`, payload),

    // Update classroom session
    updateClassroomSession: (sessionId: string, sessionData: Partial<ClassroomSession>) =>
      apiClient.patch<ClassroomSession>(`/classrooms/sessions/${sessionId}/`, sessionData),

    // Delete classroom session
    deleteClassroomSession: (sessionId: string) =>
      apiClient.delete(`/classrooms/sessions/${sessionId}/`),

    // Get session attendance
    getSessionAttendance: (sessionId: string) =>
      apiClient.get<SessionAttendance[]>(`/classrooms/sessions/${sessionId}/attendances/`),

    // Get calendar data
    getCalendarData: (params?: { view?: string; date?: string }) =>
      apiClient.get<CalendarApiResponse>('/classrooms/calendar/', { params }),

    // Get course sessions (all sessions of all classrooms in a course)
    getCourseSessions: (courseId: string, params?: {
      classroom_id?: string
      start_date?: string
      end_date?: string
      page?: number
      page_size?: number
    }) =>
      apiClient.get<ClassroomSessionsResponse>(`/courses/${courseId}/sessions/`, { params }),

    // Get course session detail
    getCourseSessionDetail: (courseId: string, sessionId: string) =>
      apiClient.get<any>(`/courses/${courseId}/sessions/${sessionId}/`),

    // Get classroom students
    getClassroomStudents: (classroomId: string, params?: {
      page?: number
      page_size?: number
    }) =>
      apiClient.get<any>(`/classrooms/${classroomId}/students/`, { params }),

    // Quick enroll student to classroom
    quickEnrollStudent: (classroomId: string, data: { email: string; send_welcome_email?: boolean }) =>
      apiClient.post<any>(`/classrooms/${classroomId}/quick-enroll/`, data),

    // Remove student from classroom
    removeStudentFromClassroom: (classroomId: string, userId: number) =>
      apiClient.delete(`/classrooms/${classroomId}/students/${userId}/`),

    // Self check-in for session
    selfCheckInSession: (sessionId: string, classroomId: string) =>
      apiClient.post(`/classrooms/sessions/${sessionId}/self_checkin/`, { classroom: classroomId }),

    // Get presigned URL for session material upload
    getSessionMaterialUploadUrl: (
      courseId: string,
      sessionId: string,
      payload: { file_name: string; content_type: string },
    ) =>
      apiClient.post<{
        upload_url: string
        key: string
        public_url: string
        expires_in: number
        file_name: string
      }>(`/courses/${courseId}/sessions/${sessionId}/upload-material-url/`, payload),

    // Create session material
    createSessionMaterial: (
      courseId: string,
      sessionId: string,
      payload: {
        title: string
        description?: string
        file_url: string
        file_name: string
        file_size: number
        file_type: string
      },
    ) =>
      apiClient.post<any>(`/courses/${courseId}/sessions/${sessionId}/materials/`, payload),

    // List session materials
    getSessionMaterials: (courseId: string, sessionId: string, params?: { page?: number; page_size?: number }) =>
      apiClient.get<{
        count: number
        next: string | null
        previous: string | null
        results: Array<{
          id: string
          session: string
          title: string
          description: string
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          uploaded_by: number
          uploaded_by_info?: {
            id: number
            username: string
            first_name: string
            last_name: string
          }
          created_at: string
          updated_at: string
        }>
      }>(`/courses/${courseId}/sessions/${sessionId}/materials/`, { params }),

    // Update session material
    updateSessionMaterial: (
      courseId: string,
      sessionId: string,
      materialId: string,
      payload: { title?: string; description?: string },
    ) =>
      apiClient.patch<any>(`/courses/${courseId}/sessions/${sessionId}/materials/${materialId}/`, payload),

    // Delete session material
    deleteSessionMaterial: (courseId: string, sessionId: string, materialId: string) =>
      apiClient.delete(`/courses/${courseId}/sessions/${sessionId}/materials/${materialId}/`),
  }
}
