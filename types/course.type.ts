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

export interface CoursePayload {
  title: string
  slug: string
  description: string
  short_description: string
  category_id: string
  teacher_id: number
  video_preview?: string
  level: string
  language: string
  duration_hours: string
  price: string
  discount_price: string
  is_free: boolean
  is_published: boolean
  is_featured: boolean
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
