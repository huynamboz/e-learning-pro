import type { Classroom, ClassroomSchedule } from '~/types/course.type'
// Classroom API service
import { useApiClient } from '~/api/apiClient'

export interface ClassroomPayload {
  course_id: string
  title: string
  student_count: number
  schedules_data: ClassroomSchedule[]
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

export interface ClassroomSessionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: ClassroomSession[]
}

export function useClassroomApi() {
  const apiClient = useApiClient()

  return {
    // Get all classrooms
    getClassrooms: () =>
      apiClient.get<Classroom[]>('/classrooms/'),

    // Get classrooms by course
    getClassroomsByCourse: (courseId: string) =>
      apiClient.get<Classroom[]>(`/classrooms/course/${courseId}/`),

    // Create classroom
    createClassroom: (classroomData: ClassroomPayload) =>
      apiClient.post<Classroom>('/classrooms/', classroomData),

    // Update classroom
    updateClassroom: (id: string, classroomData: Partial<ClassroomPayload>) =>
      apiClient.put<Classroom>(`/classrooms/${id}/`, classroomData),

    // Delete classroom
    deleteClassroom: (id: string) =>
      apiClient.delete(`/classrooms/${id}/`),

    // Get classroom detail
    getClassroom: (id: string) =>
      apiClient.get<Classroom>(`/classrooms/${id}/`),

    // Get classroom sessions
    getClassroomSessions: (classroomId: string) =>
      apiClient.get<ClassroomSessionsResponse>(`/classrooms/${classroomId}/sessions/`),
  }
}
