export interface ICourse {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  category: ICategory
  teacher: ITeacher
  thumbnail: string
  video_preview: string
  level: string
  language: string
  duration_hours: string
  price: number
  discount_price: string
  effective_price: string
  has_discount: string
  is_free: boolean
  is_published: boolean
  is_featured: boolean
  enrollment_count: number
  rating_average: string
  rating_count: number
  chapters: IChapter[]
  chapters_count: string
  lessons_count: string
  created_at: string
  updated_at: string
}

export interface ICategory {
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

export interface ITeacher {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export interface IChapter {
  id: string
  title: string
  slug: string
  description: string
  order: number
  lessons: ILesson[]
  lessons_count: string
  created_at: string
  updated_at: string
}

export interface ILesson {
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
