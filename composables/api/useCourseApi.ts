// Course API service
import type {
  Chapter,
  ChapterPayload,
  Course,
  CourseEnrollment,
  CourseFilters,
  CourseListResponse,
  CoursePayload,
  Lesson,
  LessonPayload,
} from '~/types/course.type'

import { useApiClient } from '~/api/apiClient'
import { createApiService } from '~/composables/api/useApiService'

// Use the interface from types instead of defining here

export function useCourseApi() {
  const baseService = createApiService<Course>('/courses/')
  const apiClient = useApiClient()

  return {
    ...baseService,

    // Get courses with filters
    getCourses: (params?: CourseFilters) => {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      const queryString = queryParams.toString()
      return apiClient.get<CourseListResponse>(
        `/courses/${queryString ? `?${queryString}` : ''}`,
      )
    },

    getMyCourses: () =>
      apiClient.get<CourseListResponse>('/courses/mine/'),

    getCourseEnrolled: () =>
      apiClient.get<CourseListResponse>('/courses/enrolled/'),

    createCourse: (courseData: CoursePayload) =>
      apiClient.post<CoursePayload>(`/courses/`, courseData),

    updateCourse: (id: string, courseData: CoursePayload) =>
      apiClient.put<CoursePayload>(`/courses/${id}/`, courseData),

    // Get featured courses
    getDetailCourses: (id: string) =>
      apiClient.get<Course>(`/courses/${id}`),

    getChapters: (id: string) =>
      apiClient.get<Chapter[]>(`/courses/${id}/chapters/`),

    createChapter: (id: string, chapterData: ChapterPayload) =>
      apiClient.post<ChapterPayload>(`/courses/${id}/chapters/`, chapterData),

    updateChapter: (idCourse: string, id: string, payload: ChapterPayload) =>
      apiClient.put<ChapterPayload>(`/courses/${idCourse}/chapters/${id}/`, payload),

    deleteChapter: (id: string) =>
      apiClient.delete<Chapter[]>(`/courses/${id}/chapters/`),

    // Get featured courses
    getFeaturedCourses: () =>
      apiClient.get<Course[]>('/courses/featured/'),

    // Get popular courses
    getPopularCourses: () =>
      apiClient.get<Course[]>('/courses/popular/'),

    // Get courses by category
    getCoursesByCategory: (categoryId: string) =>
      apiClient.get<Course[]>(`/courses/category/${categoryId}/`),

    // Enroll in course
    enroll: (courseId: string) =>
      apiClient.post<CourseEnrollment>(`/courses/${courseId}/enroll/`),

    // Unenroll from course
    unenroll: (courseId: string) =>
      apiClient.delete(`/courses/${courseId}/enroll/`),

    // Get user's enrolled courses
    getEnrolledCourses: () =>
      apiClient.get<CourseEnrollment[]>('/courses/enrolled/'),

    // Get course progress
    getCourseProgress: (courseId: string) =>
      apiClient.get(`/courses/${courseId}/progress/`),

    // Get course lessons
    getLessons: (courseId: string, chapterId: string) =>
      apiClient.get<Lesson[]>(`/courses/${courseId}/chapters/${chapterId}/lessons/`),

    // Post course lessons
    createLesson: (courseId: string, chapterId: string, payload: LessonPayload) =>
      apiClient.post<Lesson>(`/courses/${courseId}/chapters/${chapterId}/lessons/`, payload),

    // Post course lessons
    updateLesson: (courseId: string, chapterId: string, lessonId: string, payload: LessonPayload) =>
      apiClient.put<Lesson>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`, payload),

    // Get lesson detail
    getLesson: (courseId: string, chapterId: string, lessonId: string) =>
      apiClient.get<Lesson>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`),

    // Get lesson detail
    deleteLesson: (courseId: string, chapterId: string, lessonId: string) =>
      apiClient.delete<Lesson>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/`),

    // Mark lesson as completed
    completeLesson: (courseId: string, lessonId: string) =>
      apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete/`),

    // Get course reviews
    getReviews: (courseId: string, params?: { page?: number }) => {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      const queryString = queryParams.toString()
      return apiClient.get(`/courses/${courseId}/reviews/${queryString ? `?${queryString}` : ''}`)
    },

    // Add course review
    addReview: (courseId: string, data: { rating: number, comment?: string }) =>
      apiClient.post(`/courses/${courseId}/reviews/`, data),

    // Update course review
    updateReview: (courseId: string, reviewId: string, data: { rating?: number, comment?: string }) =>
      apiClient.patch(`/courses/${courseId}/reviews/${reviewId}/`, data),

    // Delete course review
    deleteReview: (courseId: string, reviewId: string) =>
      apiClient.delete(`/courses/${courseId}/reviews/${reviewId}/`),

    // Add course to wishlist
    addToWishlist: (courseId: string) =>
      apiClient.post(`/courses/${courseId}/wishlist/`),

    // Remove course from wishlist
    removeFromWishlist: (courseId: string) =>
      apiClient.delete(`/courses/${courseId}/wishlist/`),

    // Get user's wishlist
    getWishlist: () =>
      apiClient.get<Course[]>('/courses/wishlist/'),

    // Get course categories
    getCategories: () =>
      apiClient.get('/courses/categories/'),

    // Search courses
    searchCourses: (query: string, params?: { category?: string, limit?: number }) => {
      const queryParams = new URLSearchParams({ search: query })
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      return apiClient.get<Course[]>(`/courses/search/?${queryParams.toString()}`)
    },

    // Get course recommendations
    getRecommendations: (userId?: string) =>
      apiClient.get<Course[]>(`/courses/recommendations/${userId ? `?user_id=${userId}` : ''}`),
  }
}
