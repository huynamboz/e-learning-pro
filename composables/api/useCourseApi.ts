// Course API service
import type { User } from '~/types/auth.type'
import { useApiClient } from '~/api/apiClient'
import { createApiService } from '~/composables/api/useApiService'

// Course interface
export interface Course {
  id: number
  title: string
  description: string
  price: number
  instructor: User
  created_at: string
  updated_at: string
  thumbnail?: string
  duration?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  tags?: string[]
  is_published?: boolean
  enrollment_count?: number
  rating?: number
  rating_count?: number
}

// Lesson interface
export interface Lesson {
  id: number
  course: number
  title: string
  description: string
  video_url?: string
  duration?: number
  order: number
  is_free?: boolean
  is_completed?: boolean
  created_at: string
  updated_at: string
}

// Course enrollment interface
export interface CourseEnrollment {
  id: number
  course: Course
  user: User
  enrolled_at: string
  progress: number
  completed_at?: string
  certificate_url?: string
}

export function useCourseApi() {
  const baseService = createApiService<Course>('/courses/')
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
      return apiClient.get<{ results: Course[], count: number, next: string | null, previous: string | null }>(
        `/courses/${queryString ? `?${queryString}` : ''}`,
      )
    },

    // Get featured courses
    getFeaturedCourses: () =>
      apiClient.get<Course[]>('/courses/featured/'),

    // Get popular courses
    getPopularCourses: () =>
      apiClient.get<Course[]>('/courses/popular/'),

    // Get courses by category
    getCoursesByCategory: (categoryId: number) =>
      apiClient.get<Course[]>(`/courses/category/${categoryId}/`),

    // Enroll in course
    enroll: (courseId: number) =>
      apiClient.post<CourseEnrollment>(`/courses/${courseId}/enroll/`),

    // Unenroll from course
    unenroll: (courseId: number) =>
      apiClient.delete(`/courses/${courseId}/enroll/`),

    // Get user's enrolled courses
    getEnrolledCourses: () =>
      apiClient.get<CourseEnrollment[]>('/courses/enrolled/'),

    // Get course progress
    getCourseProgress: (courseId: number) =>
      apiClient.get(`/courses/${courseId}/progress/`),

    // Get course lessons
    getLessons: (courseId: number) =>
      apiClient.get<Lesson[]>(`/courses/${courseId}/lessons/`),

    // Get lesson detail
    getLesson: (courseId: number, lessonId: number) =>
      apiClient.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}/`),

    // Mark lesson as completed
    completeLesson: (courseId: number, lessonId: number) =>
      apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete/`),

    // Get course reviews
    getReviews: (courseId: number, params?: { page?: number }) => {
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
    addReview: (courseId: number, data: { rating: number, comment?: string }) =>
      apiClient.post(`/courses/${courseId}/reviews/`, data),

    // Update course review
    updateReview: (courseId: number, reviewId: number, data: { rating?: number, comment?: string }) =>
      apiClient.patch(`/courses/${courseId}/reviews/${reviewId}/`, data),

    // Delete course review
    deleteReview: (courseId: number, reviewId: number) =>
      apiClient.delete(`/courses/${courseId}/reviews/${reviewId}/`),

    // Add course to wishlist
    addToWishlist: (courseId: number) =>
      apiClient.post(`/courses/${courseId}/wishlist/`),

    // Remove course from wishlist
    removeFromWishlist: (courseId: number) =>
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
    getRecommendations: (userId?: number) =>
      apiClient.get<Course[]>(`/courses/recommendations/${userId ? `?user_id=${userId}` : ''}`),
  }
}
