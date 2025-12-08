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

    // Self check-in for session
    selfCheckInSession: (sessionId: string, classroomId: string) =>
      apiClient.post(`/classrooms/sessions/${sessionId}/self_checkin/`, { classroom: classroomId }),
  }
}
