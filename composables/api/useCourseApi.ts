// Course API service
import type { User } from '~/types/auth.type'
import { useApiClient } from '~/api/apiClient'
import { createApiService } from '~/composables/api/useApiService'
import type { ICourse, ICategory, ITeacher, IChapter, ILesson } from '~/types/course.type'

// Course enrollment interface
export interface CourseEnrollment {
  id: number
  course: ICourse
  user: User
  enrolled_at: string
  progress: number
  completed_at?: string
  certificate_url?: string
}

export function useCourseApi() {
  const baseService = createApiService<ICourse>('/courses/')
  const apiClient = useApiClient()

  return {
    ...baseService,

    // Get courses with filters
    getCourses: (params?: {
      search?: string
      category?: string
      price_min?: number
      price_max?: number
      level?: string
      instructor?: number
      is_free?: boolean
      page?: number
      limit?: number
    }) => {
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })
      }
      const queryString = queryParams.toString()
      return apiClient.get<{ results: ICourse[], count: number, next: string | null, previous: string | null }>(
        `/courses/${queryString ? `?${queryString}` : ''}`,
      )
    },

    // Get featured courses
    getDetailCourses: (id: string) =>
      apiClient.get<ICourse>(`/courses/${id}`),

    // Get featured courses
    getFeaturedCourses: () =>
      apiClient.get<ICourse[]>('/courses/featured/'),

    // Get popular courses
    getPopularCourses: () =>
      apiClient.get<ICourse[]>('/courses/popular/'),

    // Get courses by category
    getCoursesByCategory: (categoryId: string) =>
      apiClient.get<ICourse[]>(`/courses/category/${categoryId}/`),

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
    getLessons: (courseId: string) =>
      apiClient.get<ILesson[]>(`/courses/${courseId}/lessons/`),

    // Get lesson detail
    getLesson: (courseId: string, lessonId: string) =>
      apiClient.get<ILesson>(`/courses/${courseId}/lessons/${lessonId}/`),

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
      apiClient.get<ICourse[]>('/courses/wishlist/'),

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
      return apiClient.get<ICourse[]>(`/courses/search/?${queryParams.toString()}`)
    },

    // Get course recommendations
    getRecommendations: (userId?: string) =>
      apiClient.get<ICourse[]>(`/courses/recommendations/${userId ? `?user_id=${userId}` : ''}`),
  }
}
