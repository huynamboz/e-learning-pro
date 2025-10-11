import type { Classroom, ClassroomSchedule } from '~/types/course.type'
// Classroom API service
import { useApiClient } from '~/api/apiClient'

export interface ClassroomPayload {
  course_id: string
  title: string
  student_count: number
  schedules_data: ClassroomSchedule[]
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
  }
}
