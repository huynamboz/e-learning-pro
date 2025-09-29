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

// User role types
export type UserRole = 'user' | 'teacher' | 'admin'

// Admin specific interfaces
export interface AdminUser extends User {
  role: 'admin'
}
