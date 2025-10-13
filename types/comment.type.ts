// Comment system types based on the API documentation

export interface Comment {
  id: string
  lesson: string
  author: number
  author_name: string
  author_email: string
  author_avatar?: string
  role: 'student' | 'teacher'
  content: string
  depth: number
  parent_id: string | null
  replies: Reply[]
  created_at: string
  updated_at: string
}

export interface Reply {
  id: string
  author: number
  author_name: string
  author_email: string
  author_avatar?: string
  role: 'student' | 'teacher'
  content: string
  depth: number
  created_at: string
  updated_at: string
}

export interface CommentCreateRequest {
  content: string
}

export interface CommentCreateResponse {
  id: string
  lesson: string
  author: number
  author_name: string
  author_email: string
  role: 'student' | 'teacher'
  content: string
  depth: number
  parent_id: string | null
  replies: Reply[]
  created_at: string
  updated_at: string
}

export interface CommentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Comment[]
}

export interface CommentError {
  non_field_errors?: string[]
  content?: string[]
  parent?: string[]
  error?: string
}

// Comment form state
export interface CommentFormState {
  content: string
  isSubmitting: boolean
  error: string | null
}

// Comment list state
export interface CommentListState {
  comments: Comment[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

// Reply form state
export interface ReplyFormState {
  content: string
  isSubmitting: boolean
  error: string | null
  isVisible: boolean
}

// Comment permissions
export interface CommentPermissions {
  canComment: boolean
  canReply: boolean
  canDelete: (comment: Comment) => boolean
  canEdit: (comment: Comment) => boolean
}
