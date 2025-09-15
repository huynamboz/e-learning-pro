export interface RegisterRequest {
  firstName: string
  lastName: string
  userName: string
  email: string
  password: string
  confirmPassword: string
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
  role?: string
  createdAt?: string
  updatedAt?: string
}
