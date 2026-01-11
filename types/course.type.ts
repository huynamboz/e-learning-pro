import type { ListApiResponse } from '~/api/apiClient'
import type { CourseAsset } from '~/composables/api/useAssetApi'

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  category: Category
  teacher: Teacher
  thumbnail: string | null
  video_preview: string
  level: string
  language: string
  duration_hours: string
  price: string
  discount_price: string | null
  effective_price: number
  has_discount: boolean
  is_free: boolean
  is_published: boolean
  is_featured: boolean
  enrollment_count: number
  rating_average: string
  rating_count: number
  chapters: Chapter[]
  chapters_count: string
  lessons_count: string
  created_at: string
  updated_at: string
  classrooms: Classroom[]
  assets: CourseAsset[]
  assets_count: number
  course_type: 'course' | 'resource'
}

export interface ClassroomSchedule {
  day_of_week: string
  start_time: string
  end_time: string
}
export interface Classroom {
  id: string
  course: {
    id: string
    title: string
    slug: string
  }
  title: string
  background_url: string
  student_count: number
  // Pricing fields (independent from course)
  price: string
  discount_price: string | null
  is_free: boolean
  effective_price: number
  is_one_on_one: boolean
  schedules: Array<{
    id: string
    day_of_week: string
    day_display: string
    start_time: string
    end_time: string
    created_at: string
    updated_at: string
  }>
  enrollment_count: number
  session_count: number
  schedule_summary: string
  upcoming_sessions: any[]
  created_at: string
  updated_at: string
}

export interface ClassroomDetail {
  id: string
  course: {
    id: string
    title: string
    slug: string
  }
  title: string
  background_url: string
  student_count: number
  // Pricing fields (independent from course)
  price: string
  discount_price: string | null
  is_free: boolean
  effective_price: number
  is_one_on_one: boolean
  start_date: string
  end_date: string
  meeting_link: string | null
  schedules: Array<{
    id: string
    day_of_week: string
    day_display: string
    start_time: string
    end_time: string
    created_at: string
    updated_at: string
  }>
  enrollment_count: number
  session_count: number
  schedule_summary: string
  upcoming_sessions: Array<{
    id: string
    topic: string
    start_time: string
    end_time: string
    status: string
    attendance_count: number
    present_count: number
  }>
  created_at: string
  updated_at: string
}

export interface CoursePayload {
  title: string
  slug: string
  description: string
  short_description: string
  category_id: string
  teacher_id?: number // Optional - mặc định là current user
  video_preview?: string
  course_type: 'course' | 'resource' // "course" hoặc "resource"
  course_level?: 'basic' | 'intermediate' | 'advanced' | 'driving_theory' // Optional
  course_sub_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' // Optional, phải khớp với course_level (không áp dụng cho driving_theory)
  level: string // Legacy field
  language: string
  duration_hours?: string
  price?: number // Optional - removed from form
  discount_price?: number | null // Optional - removed from form
  is_free?: boolean
  is_published: boolean
  is_featured?: boolean
  thumbnail?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  total_courses: number
  total_students: number
  avatar: string
}

export interface ChapterPayload {
  title: string
  slug: string
  description: string
  order: string
}

export interface Chapter {
  id: string
  title: string
  slug: string
  description: string
  order: number
  lessons: Lesson[]
  lessons_count: string
  created_at: string
  updated_at: string
}

export interface LessonMaterial {
  id?: string // Optional: có id = update, không có = create mới
  title: string
  description?: string
  file_url?: string // Public URL từ upload step (dùng khi upload mới)
  file_path?: string // File path từ API response (dùng khi update)
  file_type: string // MIME type hoặc model choice (backend tự convert)
  file_size: number
  order?: number // Optional: Display order, default: auto-increment
  is_downloadable?: boolean // Optional: Can students download?, default: true
  uploaded_at?: string // Read-only from API
  uploaded_by?: number // Read-only from API
  has_access?: boolean // Read-only from API
}

export interface LessonPayload {
  chapter_id: string
  title: string
  slug: string
  description: string
  video_url: string
  video_duration: number
  content: string
  order: number
  is_preview: boolean
  is_published: boolean
  is_unlocked: boolean
  is_completed?: boolean
  materials?: LessonMaterial[]
}

export interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  video_url: string
  video_duration: number
  video_duration_formatted: string
  order: number
  is_preview: boolean
  is_published: boolean
  is_unlocked: boolean
  thumbnail: string | null
  is_completed: boolean
  quiz_count: number
  comment_count: number
  materials?: LessonMaterial[]
}

// Course API Response Types
export interface CourseListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Course[]
}

// Course Filter Types
export interface CourseFilters {
  search?: string
  category?: string
  price_min?: number
  price_max?: number
  level?: string
  instructor?: number
  is_free?: boolean
  page?: number
  limit?: number
}

// Course Summary (for lists)
export interface CourseSummary {
  id: string
  title: string
  slug: string
  short_description: string
  category: Pick<Category, 'id' | 'name' | 'slug'>
  teacher: Pick<Teacher, 'id' | 'full_name'>
  thumbnail: string | null
  level: string
  duration_hours: string
  price: string
  effective_price: number
  has_discount: boolean
  is_free: boolean
  is_featured: boolean
  enrollment_count: number
  rating_average: string
  rating_count: number
  lessons_count: string
}

// Course Detail (for course detail page)
export interface CourseDetail extends Course {
  chapters: Chapter[]
  reviews?: CourseReview[]
  related_courses?: CourseSummary[]
}

// Course Review
export interface CourseReview {
  id: string
  user: {
    id: string
    username: string
    full_name: string
    avatar?: string
  }
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

// Course Progress
export interface CourseProgress {
  course_id: string
  user_id: string
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  last_accessed_lesson?: string
  completed_at?: string
  certificate_url?: string
}

// Course Enrollment
export interface CourseEnrollment {
  id: string
  course: Course
  user: {
    id: string
    username: string
    email: string
    full_name: string
  }
  enrolled_at: string
  progress: CourseProgress
  completed_at?: string
  certificate_url?: string
}

// Enrolled Course (for learning page) - matches API response exactly
export interface EnrolledCourse {
  id: string
  title: string
  slug: string
  short_description: string
  category: Category
  teacher: Teacher
  thumbnail: string | null
  level: string
  language: string
  duration_hours: string
  price: string
  discount_price: string | null
  effective_price: number
  has_discount: boolean
  is_free: boolean
  is_featured: boolean
  enrollment_count: number
  rating_average: string
  rating_count: number
  created_at: string
  updated_at: string
  classroom?: {
    id: string
    title: string
    student_count: number
    start_date: string
    end_date: string
    meeting_link: string
    schedules: Array<{
      id: string
      day_of_week: string
      day_display: string
      start_time: string
      end_time: string
    }>
    schedule_summary: string
    created_at: string
  }
  enrollment?: {
    id: string
    enrolled_at: string
    completion_percentage: number
    progress_status: string
  }
  order?: {
    id: string
    invoice_code: string
    status: string
    status_display: string
    price_amount: number
    payment_method: string
    created_at: string
    notes: string
  }
  order_status?: 'enrolled' | 'pending' | 'cancelled' | 'completed'
}

// Course Student
export interface CourseStudent {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar: string
  enrollment: {
    id: string
    classroom_id: string
    classroom_title: string
    enrolled_at: string
    is_active: boolean
    completion_percentage: number
    progress_status: string
    completed_at: string | null
  }
}

// Generic API Response Interface

export interface AllStudentsResponse extends ListApiResponse<StudentWithStats> {}

export interface StudentWithStats {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  stats: {
    total_courses: number
    active_courses: number
    completed_courses: number
    average_completion: number
  }
}

// Course Students Response
export interface CourseStudentsResponse extends ListApiResponse<CourseStudent> {}

// Course List Response
export interface CourseListResponse extends ListApiResponse<CourseSummary> {}

// Calendar API Response Types
export interface CalendarSession {
  id: string
  topic: string
  start_time: string
  end_time: string
  status: string
  attendance_count: number
  present_count: number
  meeting_link: string
  background_color: string | null
}

export interface CalendarClassroom {
  id: string
  title: string
  background_url: string
  background_color: string | null
  meeting_link?: string
  course: {
    id: string
    title: string
    slug: string
  }
  student_count: number
  schedules: Array<{
    id: string
    day_of_week: string
    day_display: string
    start_time: string
    end_time: string
    created_at: string
    updated_at: string
  }>
  sessions: CalendarSession[]
  enrollment_count: number
  created_at: string
}

export interface CalendarApiResponse {
  view_type: string
  period: string
  date_range: {
    start: string
    end: string
  }
  classrooms: CalendarClassroom[]
  upcoming_today: any[]
  total_classrooms: number
  total_sessions: number
}

export interface ResourcePricePlan {
  id: string
  course: string
  duration_months: number
  price_amount: string
  price_currency: string
  is_active: boolean
  is_default: boolean
  is_available: boolean
  starts_at: string | null
  ends_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ResourcePricePlanPayload {
  duration_months: number
  price_amount: string
  price_currency: string
  is_active?: boolean
  is_default?: boolean
  starts_at?: string | null
  ends_at?: string | null
}
