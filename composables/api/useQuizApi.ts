import { useApiClient } from '~/api/apiClient'

export interface QuizOption {
  id: string
  label: string
  text: string
  is_correct: boolean
}

export interface QuizSampleAnswer {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  question_type: 'multiple_choice' | 'text_input'
  prompt: string
  explanation: string
  media: string | null
  media_url: string | null
  order: number
  options: QuizOption[]
  sample_answer: QuizSampleAnswer | null
  created_at: string
  updated_at: string
}

export interface QuizApiResponse {
  id: string
  title: string
  description: string
  category: string
  category_name: string
  chapter: string
  chapter_title: string
  time_type: 'limit' | 'no-limit'
  time_value: number | null
  time_unit: 'minute' | 'hour' | 'second' | null
  time_limit_display: string
  is_published: boolean
  questions: QuizQuestion[]
  total_questions: number
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface QuizListResponse {
  count: number
  next: string | null
  previous: string | null
  results: QuizApiResponse[]
}

export interface QuizListParams {
  category?: string
  chapter?: string
  is_published?: boolean
  created_by?: number
  search?: string
  ordering?: string
}

export function useQuizApi() {
  const apiClient = useApiClient()

  return {
    // Get all quizzes with optional filters
    getQuizzes: (params?: QuizListParams) => {
      const queryParams = new URLSearchParams()
      
      if (params?.category) queryParams.append('category', params.category)
      if (params?.chapter) queryParams.append('chapter', params.chapter)
      if (params?.is_published !== undefined) queryParams.append('is_published', params.is_published.toString())
      if (params?.created_by) queryParams.append('created_by', params.created_by.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.ordering) queryParams.append('ordering', params.ordering)

      const queryString = queryParams.toString()
      const url = queryString ? `/quiz/quizzes/?${queryString}` : '/quiz/quizzes/'
      
      return apiClient.get<QuizListResponse>(url)
    },

    // Get quiz by ID
    getQuiz: (id: string) =>
      apiClient.get<QuizApiResponse>(`/quiz/quizzes/${id}/`),

    // Create new quiz
    createQuiz: (quizData: any) =>
      apiClient.post<QuizApiResponse>('/quiz/quizzes/', quizData),

    // Update quiz
    updateQuiz: (id: string, quizData: any) =>
      apiClient.put<QuizApiResponse>(`/quiz/quizzes/${id}/`, quizData),

    // Patch quiz (partial update)
    patchQuiz: (id: string, quizData: any) =>
      apiClient.patch<QuizApiResponse>(`/quiz/quizzes/${id}/`, quizData),

    // Delete quiz
    deleteQuiz: (id: string) =>
      apiClient.delete(`/quiz/quizzes/${id}/`),
  }
}
