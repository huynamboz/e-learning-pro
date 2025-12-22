// Types for New Quiz Attempt System
// Used for standalone quizzes organized by Level (independent of courses)

export interface QuizAttempt {
  id: string
  quiz: string
  quiz_title: string
  student: number
  student_name: string
  status: 'in_progress' | 'completed' | 'expired'
  started_at: string
  completed_at: string | null
  time_spent_seconds: number
  time_remaining_seconds: number | null
  total_score: number | string // API may return as string
  max_score: number | string // API may return as string
  score: number | string | null // API may return as string
  correct_answers: number
  total_questions: number
  has_pending_essays: boolean
  answers: SavedAnswer[]
}

export interface SavedAnswer {
  id: string
  question: string
  question_prompt: string
  question_type: 'multiple_choice' | 'text_input' | 'essay'
  selected_option: string | null
  selected_option_text: string | null
  text_answer: string | null
  attachment_url: string | null
  is_correct: boolean | null
  correct_answer: {
    label?: string
    text: string
  } | null
  auto_graded: boolean
  answered_at: string
}

export interface QuizResults {
  total_score: number | string // API may return as string
  max_score: number | string // API may return as string
  percentage: number | string // API may return as string
  correct_answers: number
  total_questions: number
  formatted: string
  has_pending_essays?: boolean
}

// Request/Response types for API calls

export interface StartAttemptRequest {
  quiz_id: string
}

export interface StartAttemptResponse {
  message: string
  attempt: QuizAttempt
}

export interface SaveAnswerRequest {
  question_id: string
  selected_option_id?: string // For MCQ
  text_answer?: string // For text-input/essay
  attachment_url?: string // For essay (optional)
}

export interface SaveAnswerResponse {
  message: string
  answer: SavedAnswer
  is_correct: boolean | null
  auto_graded: boolean
}

export interface SubmitAttemptResponse {
  message: string
  attempt: QuizAttempt
  results: QuizResults
}

