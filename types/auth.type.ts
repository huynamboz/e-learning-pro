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
  user: any
  id_token: string
}
