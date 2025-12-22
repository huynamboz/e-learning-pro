import type { ListApiResponse } from '~/api/apiClient'
import { useApiClient } from '~/api/apiClient'
import type {
  QuizAttempt,
  SaveAnswerRequest,
  SaveAnswerResponse,
  StartAttemptRequest,
  StartAttemptResponse,
  SubmitAttemptResponse,
} from '~/types/new-quiz.type'

// Level entity types
export interface NewQuizLevel {
  id: string
  code: string
  name: string
  order: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NewQuizLevelListResponse extends ListApiResponse<NewQuizLevel> {}

export interface NewQuizLevelListParams {
  is_active?: boolean
  search?: string
  ordering?: string
}

export interface NewQuizLevelCreate {
  code: string
  name: string
  order: number
  description?: string
  is_active?: boolean
}

// Quiz option and sample answer types
export interface NewQuizOption {
  id: string
  label: string
  text: string
  is_correct: boolean
  order?: number
}

export interface NewQuizSampleAnswer {
  id: string
  text: string
}

// Question types
export interface NewQuizQuestion {
  id: string
  quiz: string
  question_type: 'multiple_choice' | 'text_input' | 'essay'
  prompt: string
  explanation?: string
  media?: string | null
  order: number
  score: number
  options?: NewQuizOption[]
  sample_answer?: NewQuizSampleAnswer | null
  created_at: string
  updated_at: string
}

// Main quiz entity types
export interface NewQuiz {
  id: string
  title: string
  description?: string
  level: string
  level_code: string
  level_name: string
  time_type: 'limit' | 'none'
  time_value?: number | null
  time_unit?: 'minute' | 'second' | null
  time_limit_display: string
  is_published: boolean
  retake_limit: number
  total_questions: number
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface NewQuizDetail extends NewQuiz {
  questions: NewQuizQuestion[]
}

export interface NewQuizListResponse extends ListApiResponse<NewQuiz> {}

export interface NewQuizListParams {
  level?: string
  is_published?: boolean
  created_by?: number
  search?: string
  ordering?: string
}

export interface NewQuizCreate {
  title: string
  description?: string
  level_id: string
  time_type: 'limit' | 'none'
  time_value?: number | null
  time_unit?: 'minute' | 'second' | null
  retake_limit?: number
  is_published?: boolean
  questions?: NewQuizQuestionCreate[]
}

export interface NewQuizQuestionCreate {
  question_type: 'multiple_choice' | 'text_input' | 'essay'
  prompt: string
  explanation?: string
  order: number
  score?: number
  options?: Array<{
    label: string
    text: string
    is_correct: boolean
  }>
  sample_answer?: {
    text: string
  }
}

export interface NewQuizUpdate extends Partial<NewQuizCreate> {
  questions?: Array<NewQuizQuestionCreate & { id?: string }>
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  student_id: string
  student_name: string
  student_email?: string
  score: string | number
  correct_answers: number
  time_spent_seconds: number
  completed_at: string
}

export interface LeaderboardResponse {
  quiz_id: string
  entries: LeaderboardEntry[]
}

export function useNewQuizApi() {
  const apiClient = useApiClient()

  return {
    // Level management
    getLevels: (params?: NewQuizLevelListParams) => {
      const queryParams = new URLSearchParams()
      if (params?.is_active !== undefined)
        queryParams.append('is_active', params.is_active.toString())
      if (params?.search)
        queryParams.append('search', params.search)
      if (params?.ordering)
        queryParams.append('ordering', params.ordering)
      const queryString = queryParams.toString()
      return apiClient.get<NewQuizLevelListResponse>(
        `/new_quiz/levels/${queryString ? `?${queryString}` : ''}`,
      )
    },

    getLevel: (id: string) =>
      apiClient.get<NewQuizLevel>(`/new_quiz/levels/${id}/`),

    createLevel: (data: NewQuizLevelCreate) =>
      apiClient.post<NewQuizLevel>('/new_quiz/levels/', data),

    updateLevel: (id: string, data: Partial<NewQuizLevelCreate>) =>
      apiClient.patch<NewQuizLevel>(`/new_quiz/levels/${id}/`, data),

    deleteLevel: (id: string) =>
      apiClient.delete(`/new_quiz/levels/${id}/`),

    // Quiz management
    getQuizzes: (params?: NewQuizListParams) => {
      const queryParams = new URLSearchParams()
      if (params?.level)
        queryParams.append('level', params.level)
      if (params?.is_published !== undefined)
        queryParams.append('is_published', params.is_published.toString())
      if (params?.created_by)
        queryParams.append('created_by', params.created_by.toString())
      if (params?.search)
        queryParams.append('search', params.search)
      if (params?.ordering)
        queryParams.append('ordering', params.ordering)
      const queryString = queryParams.toString()
      return apiClient.get<NewQuizListResponse>(
        `/new_quiz/quizzes/${queryString ? `?${queryString}` : ''}`,
      )
    },

    getQuiz: (id: string) =>
      apiClient.get<NewQuizDetail>(`/new_quiz/quizzes/${id}/`),

    createQuiz: (data: NewQuizCreate) =>
      apiClient.post<NewQuizDetail>('/new_quiz/quizzes/', data),

    updateQuiz: (id: string, data: NewQuizUpdate) =>
      apiClient.put<NewQuizDetail>(`/new_quiz/quizzes/${id}/`, data),

    patchQuiz: (id: string, data: Partial<NewQuizUpdate>) =>
      apiClient.patch<NewQuizDetail>(`/new_quiz/quizzes/${id}/`, data),

    deleteQuiz: (id: string) =>
      apiClient.delete(`/new_quiz/quizzes/${id}/`),

    // Publish/Unpublish
    publishQuiz: (id: string) =>
      apiClient.patch(`/new_quiz/quizzes/${id}/publish/`, {}),

    unpublishQuiz: (id: string) =>
      apiClient.patch(`/new_quiz/quizzes/${id}/unpublish/`, {}),

    // Additional endpoints
    getMyQuizzes: () =>
      apiClient.get<NewQuizListResponse>('/new_quiz/quizzes/mine/'),

    getQuizzesByLevel: (levelId: string) =>
      apiClient.get<NewQuizListResponse>(`/new_quiz/quizzes/by_level/?level_id=${levelId}`),

    // Quiz Attempt Management
    startAttempt: (data: StartAttemptRequest) =>
      apiClient.post<StartAttemptResponse>('/new_quiz/attempts/start/', data),

    getAttempt: (attemptId: string) =>
      apiClient.get<QuizAttempt>(`/new_quiz/attempts/${attemptId}/`),

    saveAnswer: (attemptId: string, answerData: SaveAnswerRequest) =>
      apiClient.post<SaveAnswerResponse>(`/new_quiz/attempts/${attemptId}/save-answer/`, answerData),

    submitAttempt: (attemptId: string) =>
      apiClient.post<SubmitAttemptResponse>(`/new_quiz/attempts/${attemptId}/submit/`, {}),

    // Get attempts for a quiz (students see only their own)
    getQuizAttempts: (quizId: string, studentId?: string) => {
      const queryParams = studentId ? `?student_id=${studentId}` : ''
      return apiClient.get<ListApiResponse<QuizAttempt>>(`/new_quiz/quizzes/${quizId}/attempts/${queryParams}`)
    },

    // Leaderboard
    getLeaderboard: (quizId: string) =>
      apiClient.get<LeaderboardResponse>(`/new_quiz/quizzes/${quizId}/leaderboard/`),
  }
}
