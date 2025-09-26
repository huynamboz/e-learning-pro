import type { ICourse, ICategory, ITeacher, IChapter, ILesson } from '~/types/course.type'
import { useCourseApi } from '~/composables/api/useCourseApi'

export function useCourse() {
  // State management
  const courses = useState<ICourse[]>('course.courses', () => [])
  const featuredCourses = useState<ICourse[]>('course.featuredCourses', () => [])
  const popularCourses = useState<ICourse[]>('course.popularCourses', () => [])
  const categories = useState<ICategory[]>('course.categories', () => [])
  const wishlist = useState<ICourse[]>('course.wishlist', () => [])
  const enrolledCourses = useState<ICourse[]>('course.enrolledCourses', () => [])
  
  // Current course detail
  const currentCourse = useState<ICourse | null>('course.currentCourse', () => null)
  const currentLessons = useState<ILesson[]>('course.currentLessons', () => [])
  
  // Pagination state
  const pagination = useState('course.pagination', () => ({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  }))
  
  // Loading states
  const isLoading = useState<boolean>('course.isLoading', () => false)
  const isFetchingCourses = useState<boolean>('course.isFetchingCourses', () => false)
  const isFetchingFeatured = useState<boolean>('course.isFetchingFeatured', () => false)
  const isFetchingPopular = useState<boolean>('course.isFetchingPopular', () => false)
  const isFetchingCategories = useState<boolean>('course.isFetchingCategories', () => false)
  const isEnrolling = useState<boolean>('course.isEnrolling', () => false)
  
  // Get API service
  const courseApi = useCourseApi()
  
  // Combined loading state
  const isAnyLoading = computed(() => 
    isLoading.value || 
    isFetchingCourses.value || 
    isFetchingFeatured.value || 
    isFetchingPopular.value || 
    isFetchingCategories.value || 
    isEnrolling.value
  )
  
  // Fetch all courses with filters
  async function fetchCourses(params?: {
    search?: string
    category?: string
    price_min?: number
    price_max?: number
    level?: string
    instructor?: number
    is_free?: boolean
    page?: number
    limit?: number
  }): Promise<{ success: boolean, error?: string }> {
    isFetchingCourses.value = true
    
    try {
      const response = await courseApi.getCourses(params)
      
      if (response?.results) {
        courses.value = response.results
        pagination.value = {
          page: params?.page || 1,
          limit: params?.limit || 12,
          total: response.count,
          totalPages: Math.ceil(response.count / (params?.limit || 12)),
          hasNext: !!response.next,
          hasPrevious: !!response.previous,
        }
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch courses error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch courses',
      }
    }
    finally {
      isFetchingCourses.value = false
    }
  }
  
  // Fetch featured courses
  async function fetchFeaturedCourses(): Promise<{ success: boolean, error?: string }> {
    isFetchingFeatured.value = true
    
    try {
      const response = await courseApi.getFeaturedCourses()
      
      if (response) {
        featuredCourses.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch featured courses error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch featured courses',
      }
    }
    finally {
      isFetchingFeatured.value = false
    }
  }
  
  // Fetch popular courses
  async function fetchPopularCourses(): Promise<{ success: boolean, error?: string }> {
    isFetchingPopular.value = true
    
    try {
      const response = await courseApi.getPopularCourses()
      
      if (response) {
        popularCourses.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch popular courses error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch popular courses',
      }
    }
    finally {
      isFetchingPopular.value = false
    }
  }
  
  // Fetch course categories
  async function fetchCategories(): Promise<{ success: boolean, error?: string }> {
    isFetchingCategories.value = true
    
    try {
      const response = await courseApi.getCategories()
      
      if (response) {
        categories.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch categories error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch categories',
      }
    }
    finally {
      isFetchingCategories.value = false
    }
  }
  
  // Fetch course detail
  async function fetchCourseDetail(courseId: string): Promise<{ success: boolean, error?: string }> {
    isLoading.value = true
    
    try {
      const response = await courseApi.getDetailCourses(courseId)
      
      if (response) {
        currentCourse.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch course detail error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch course detail',
      }
    }
    finally {
      isLoading.value = false
    }
  }
  
  // Fetch course lessons
  async function fetchCourseLessons(courseId: string): Promise<{ success: boolean, error?: string }> {
    isLoading.value = true
    
    try {
      const response = await courseApi.getLessons(courseId)
      
      if (response) {
        currentLessons.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch course lessons error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch course lessons',
      }
    }
    finally {
      isLoading.value = false
    }
  }
  
  // Enroll in course
  async function enrollInCourse(courseId: string): Promise<{ success: boolean, error?: string }> {
    isEnrolling.value = true
    
    try {
      const response = await courseApi.enroll(courseId)
      
      if (response) {
        // Update enrolled courses list
        await fetchEnrolledCourses()
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Enroll course error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to enroll in course',
      }
    }
    finally {
      isEnrolling.value = false
    }
  }
  
  // Unenroll from course
  async function unenrollFromCourse(courseId: string): Promise<{ success: boolean, error?: string }> {
    isEnrolling.value = true
    
    try {
      await courseApi.unenroll(courseId)
      
      // Update enrolled courses list
      await fetchEnrolledCourses()
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Unenroll course error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to unenroll from course',
      }
    }
    finally {
      isEnrolling.value = false
    }
  }
  
  // Fetch enrolled courses
  async function fetchEnrolledCourses(): Promise<{ success: boolean, error?: string }> {
    isLoading.value = true
    
    try {
      const response = await courseApi.getEnrolledCourses()
      
      if (response) {
        enrolledCourses.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch enrolled courses error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch enrolled courses',
      }
    }
    finally {
      isLoading.value = false
    }
  }
  
  // Add to wishlist
  async function addToWishlist(courseId: string): Promise<{ success: boolean, error?: string }> {
    try {
      await courseApi.addToWishlist(courseId)
      
      // Update wishlist
      await fetchWishlist()
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Add to wishlist error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to add to wishlist',
      }
    }
  }
  
  // Remove from wishlist
  async function removeFromWishlist(courseId: string): Promise<{ success: boolean, error?: string }> {
    try {
      await courseApi.removeFromWishlist(courseId)
      
      // Update wishlist
      await fetchWishlist()
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Remove from wishlist error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to remove from wishlist',
      }
    }
  }
  
  // Fetch wishlist
  async function fetchWishlist(): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await courseApi.getWishlist()
      
      if (response) {
        wishlist.value = response
      }
      
      return { success: true }
    }
    catch (error: any) {
      console.error('Fetch wishlist error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to fetch wishlist',
      }
    }
  }
  
  // Search courses
  async function searchCourses(query: string, params?: { category?: string, limit?: number }): Promise<{ success: boolean, error?: string, data?: ICourse[] }> {
    isLoading.value = true
    
    try {
      const response = await courseApi.searchCourses(query, params)
      
      if (response) {
        return { success: true, data: response }
      }
      
      return { success: true, data: [] }
    }
    catch (error: any) {
      console.error('Search courses error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to search courses',
      }
    }
    finally {
      isLoading.value = false
    }
  }
  
  // Get course progress
  async function getCourseProgress(courseId: string): Promise<{ success: boolean, error?: string, data?: any }> {
    try {
      const response = await courseApi.getCourseProgress(courseId)
      
      return { success: true, data: response }
    }
    catch (error: any) {
      console.error('Get course progress error:', error)
      return {
        success: false,
        error: error.data?.message || error.statusMessage || 'Failed to get course progress',
      }
    }
  }
  
  // Check if user is enrolled in course
  function isEnrolledInCourse(courseId: string): boolean {
    return enrolledCourses.value.some(course => course.id === courseId)
  }
  
  // Check if course is in wishlist
  function isInWishlist(courseId: string): boolean {
    return wishlist.value.some(course => course.id === courseId)
  }
  
  // Clear current course data
  function clearCurrentCourse(): void {
    currentCourse.value = null
    currentLessons.value = []
  }
  
  // Reset all course data
  function resetCourseData(): void {
    courses.value = []
    featuredCourses.value = []
    popularCourses.value = []
    categories.value = []
    wishlist.value = []
    enrolledCourses.value = []
    clearCurrentCourse()
    pagination.value = {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    }
  }
  
  return {
    // State
    courses: readonly(courses),
    featuredCourses: readonly(featuredCourses),
    popularCourses: readonly(popularCourses),
    categories: readonly(categories),
    wishlist: readonly(wishlist),
    enrolledCourses: readonly(enrolledCourses),
    currentCourse: readonly(currentCourse),
    currentLessons: readonly(currentLessons),
    pagination: readonly(pagination),
    
    // Loading states
    isLoading: readonly(isLoading),
    isFetchingCourses: readonly(isFetchingCourses),
    isFetchingFeatured: readonly(isFetchingFeatured),
    isFetchingPopular: readonly(isFetchingPopular),
    isFetchingCategories: readonly(isFetchingCategories),
    isEnrolling: readonly(isEnrolling),
    isAnyLoading,
    
    // Functions
    fetchCourses,
    fetchFeaturedCourses,
    fetchPopularCourses,
    fetchCategories,
    fetchCourseDetail,
    fetchCourseLessons,
    enrollInCourse,
    unenrollFromCourse,
    fetchEnrolledCourses,
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
    searchCourses,
    getCourseProgress,
    isEnrolledInCourse,
    isInWishlist,
    clearCurrentCourse,
    resetCourseData,
  }
}
