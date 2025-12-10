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
  account_type: 'generated' | 'google' | 'email'
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
  // Additional onboarding fields
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  phone_number?: string
  address?: string
  bio?: string
}

export interface Profile {
  headline?: string
  first_name: string
  last_name: string
  avatar?: string
  email?: string
  // Additional onboarding fields
  gender?: 'male' | 'female' | 'other'
  date_of_birth?: string
  phone_number?: string
  contact_address?: string
  bio?: string
  created_at?: string
  updated_at?: string
  preferred_language?: string
  occupation?: string
  website_url?: string
  x_handle?: string
  linkedin_url?: string
  youtube_url?: string
  facebook_url?: string
}

// User role types
export type UserRole = 'user' | 'teacher' | 'admin'

// Admin specific interfaces
export interface AdminUser extends User {
  role: 'admin'
}
