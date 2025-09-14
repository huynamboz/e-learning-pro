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
  data: {
    id_token: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userName: string
  avatar?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}
