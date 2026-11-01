// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth Types
export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken?: string
  refreshToken?: string
}

// Car Types
export interface CarFilters {
  brand: string[]
  gerbox: string[]
  fuel: string[]
  colors: string[]
  motor_status: string[]
  chassis_status: string[]
  body_status: string[]
  gerbox_status: string[]
}

export interface CarFormData {
  brand: string
  gerbox: string
  fuel: string
  colors: string
  motor_status: string
  chassis_status: string
  body_status: string
  gerbox_status: string
}

export interface PredictionResponse {
  prediction: number
  confidence?: number
  range?: {
    min: number
    max: number
  }
}

// Form Types
export interface FormField {
  key: string
  label: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'password' | 'select' | 'number'
}

export interface FormGroup {
  title: string
  fields: FormField[]
}

export interface ValidationError {
  field: string
  message: string
}

// UI Types
export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Config Types
export interface AppConfig {
  apiBaseUrl: string
  appName: string
  defaultLocale: string
}