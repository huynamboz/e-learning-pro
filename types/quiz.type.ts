export interface QuizQuestion {
  id: string
  type: 'text-input' | 'multiple-choice'
  question: string
  explanation?: string // Add explanation field
  score?: number // Add score field
  files: any[]
  answer?: string // For text-input questions
  options?: QuestionOption[] // For multiple-choice questions
  correctAnswer?: string // For multiple-choice questions
}

export interface QuestionOption {
  id: string
  text: string
  label: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  category: string
  chapter: string
  lesson: string // Add lesson field
  timeType: 'limit' | 'no-limit'
  quantity: number | null
  unit: 'minute' | 'hour' | 'second' | null
  retake_limit: number | null // Number of times user can retake the quiz (null = unlimited)
  questions: QuizQuestion[]
  number_of_questions: number
  created_at?: string
  updated_at?: string
}

export interface QuizChapter {
  id: string
  chapter_title: string
  quizzes: Quiz[]
}

export interface QuizFormData {
  title: string
  description: string
  category: string
  chapter: string
  lesson: string // Add lesson field
  timeType: string
  quantity: number | null
  unit: string
  retake_limit: number | null
}

export interface CreateQuizPayload {
  title: string
  description: string
  category: string
  chapter: string
  lesson: string // Add lesson field
  timeType: 'limit' | 'no-limit'
  quantity?: number
  unit?: 'minute' | 'hour' | 'second'
  retake_limit?: number | null
  questions: QuizQuestion[]
}

export interface UpdateQuizPayload extends Partial<CreateQuizPayload> {
  id: string
}
