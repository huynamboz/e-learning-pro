export interface RegisterRequest {
  username: string
  email: string
  password: string
  password2: string
}

export interface ResetRequest {
  email: string
  token: string
  new_password: string
  new_password2: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  user: User
}

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  is_teacher: boolean
  is_verified: boolean
  avatar?: string
  role?: 'user' | 'teacher' | 'admin'
  createdAt?: string
  updatedAt?: string
}

export interface Profile {
  avatar: string | null
  bio: string
  created_at: string
  email: string
  facebook_url: string | null
  first_name: string
  headline: string
  last_name: string
  linkedin_url: string | null
  preferred_language: string
  updated_at: string
  website_url: string | null
  x_handle: string | null
  youtube_url: string | null
}

// User role types
export type UserRole = 'user' | 'teacher' | 'admin'

// Admin specific interfaces
export interface AdminUser extends User {
  role: 'admin'
}
