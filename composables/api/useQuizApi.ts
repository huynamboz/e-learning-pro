import type { ListApiResponse } from '~/api/apiClient'
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
  question_type: 'multiple_choice' | 'text_input' | 'essay'
  prompt: string
  explanation: string
  score: number
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
  chapter_title: string
  lesson: string
  time_type: 'limit' | 'no-limit'
  time_value: number | null
  time_unit: 'minute' | 'hour' | 'second' | null
  time_limit_display: string
  is_published: boolean
  retake_limit: number | null // Number of times user can retake the quiz (null = unlimited)
  questions: QuizQuestion[]
  total_questions: number
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface QuizListResponse extends ListApiResponse<QuizApiResponse> {}

export interface QuizListParams {
  category?: string
  lesson?: string
  is_published?: boolean
  created_by?: number
  search?: string
  ordering?: string
}

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
  total_score: number
  max_score: number
  score: string | null
  correct_answers: number
  total_questions: number
  answers: StudentAnswer[]
  time_remaining_seconds: number | null
}

export interface StudentAnswer {
  id: string
  question: string
  question_prompt: string
  question_type: 'multiple_choice' | 'text_input' | 'essay'
  selected_option: string | null
  selected_option_text: string | null
  text_answer?: string
  answer_text: string // Add answer_text field for essay questions
  is_correct: boolean | null // Allow null for pending essay grading
  correct_answer?: {
    label?: string
    text: string
  }
  answered_at: string
  // Essay-specific fields
  essay_grading_status?: 'pending' | 'graded'
  essay_score?: number
  essay_feedback?: string
  essay_corrected_answer?: string
  status?: string
}

export interface StartQuizAttemptRequest {
  quiz_id: string
}

export interface StartQuizAttemptResponse {
  message: string
  attempt: QuizAttempt
}

export interface SubmitAnswersRequest {
  answers: {
    question_id: string
    selected_option_id?: string
    answer_text?: string
  }[]
}

export interface SubmitAnswersResponse {
  message: string
  attempt: QuizAttempt
  results: {
    total_score: number
    max_score: number
    percentage: number
    correct_answers: number
    total_questions: number
    formatted: string
  }
}

// Essay Grading Types
export interface EssayGrading {
  id: string
  student_answer_id: string
  student_name: string
  student_email: string
  question_prompt: string
  student_answer_text: string
  quiz_title: string
  attempt_id: string
  max_score: number
  grading_status: 'pending' | 'graded'
  created_at: string
}

export interface EssayGradingListResponse extends ListApiResponse<EssayGrading> {}

export interface GradeEssayRequest {
  score: number
  feedback: string
  corrected_answer?: string
}

export interface GradeEssayResponse {
  id: string
  student_answer: string
  student_name: string
  grader: number
  grader_name: string
  score: number
  max_score: number
  feedback: string
  grading_status: 'graded'
  graded_at: string
  created_at: string
}

// Recent Submissions Types
export interface RecentSubmission {
  id: string
  student_name: string
  quiz_title: string
  status: 'completed' | 'in_progress' | 'expired'
  score: string
  total_score: number
  max_score: number
  has_pending_essays: boolean
  started_at: string
}

export interface RecentSubmissionsResponse extends ListApiResponse<RecentSubmission> {}

// Question Comments Types
export interface QuestionComment {
  id: string
  question: string
  answer: string
  author: number
  author_name: string
  role: 'teacher' | 'student'
  content: string
  created_at: string
}

export interface QuestionCommentListResponse extends ListApiResponse<QuestionComment> {}

export interface CreateCommentRequest {
  answer: string
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export function useQuizApi() {
  const apiClient = useApiClient()

  return {
    // Get all quizzes with optional filters
    getQuizzes: (params?: QuizListParams) => {
      const queryParams = new URLSearchParams()

      if (params?.category)
        queryParams.append('category', params.category)
      if (params?.lesson)
        queryParams.append('lesson', params.lesson)
      if (params?.is_published !== undefined)
        queryParams.append('is_published', params.is_published.toString())
      if (params?.created_by)
        queryParams.append('created_by', params.created_by.toString())
      if (params?.search)
        queryParams.append('search', params.search)
      if (params?.ordering)
        queryParams.append('ordering', params.ordering)

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

    // Start quiz attempt
    startQuizAttempt: (data: StartQuizAttemptRequest) =>
      apiClient.post<StartQuizAttemptResponse>('/quiz/attempts/start/', data),

    // Submit quiz answers
    submitQuizAnswers: (attemptId: string, data: SubmitAnswersRequest) =>
      apiClient.post<SubmitAnswersResponse>(`/quiz/attempts/${attemptId}/submit/`, data),

    // Get attempt details
    getAttempt: (attemptId: string) =>
      apiClient.get<QuizAttempt>(`/quiz/attempts/${attemptId}/`),

    // Get my attempts
    getMyAttempts: () =>
      apiClient.get<ListApiResponse<QuizAttempt>>('/quiz/attempts/my_attempts/'),

    // Get attempts for a specific quiz
    getQuizAttempts: (quizId: string) =>
      apiClient.get<QuizAttempt[]>(`/quiz/quizzes/${quizId}/attempts/`),

    // Essay Grading APIs
    getRecentSubmissions: (params?: {
      status?: string
      classroom_id?: string
      needs_grading?: boolean
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.classroom_id) queryParams.append('classroom_id', params.classroom_id)
      if (params?.needs_grading) queryParams.append('needs_grading', 'true')
      
      return apiClient.get<RecentSubmissionsResponse>(`/quiz/attempts/recent_submissions/?${queryParams.toString()}`)
    },

    getSubmissionsByClassroom: (classroomId: string, quizId?: string) => {
      const queryParams = new URLSearchParams()
      queryParams.append('classroom_id', classroomId)
      if (quizId) queryParams.append('quiz_id', quizId)
      
      return apiClient.get<RecentSubmissionsResponse>(`/quiz/attempts/by_classroom/?${queryParams.toString()}`)
    },

    getEssayGradingsNeedingGrading: (classroomId?: string) => {
      const queryParams = new URLSearchParams()
      if (classroomId) queryParams.append('classroom_id', classroomId)
      
      return apiClient.get<EssayGradingListResponse>(`/quiz/essay-gradings/needs_grading/?${queryParams.toString()}`)
    },

    getPendingEssayGradings: () =>
      apiClient.get<EssayGradingListResponse>('/quiz/essay-gradings/pending/'),

    getEssayGradingDetail: (gradingId: string) =>
      apiClient.get<EssayGrading>(`/quiz/essay-gradings/${gradingId}/`),

    gradeEssay: (gradingId: string, data: GradeEssayRequest) =>
      apiClient.post<GradeEssayResponse>(`/quiz/essay-gradings/${gradingId}/grade/`, data),

    getMyGradings: () =>
      apiClient.get<EssayGradingListResponse>('/quiz/essay-gradings/my_gradings/'),

    // Question Comments APIs
    getQuestionComments: (quizId: string, questionId: string) =>
      apiClient.get<QuestionCommentListResponse>(`/quiz/quizzes/${quizId}/questions/${questionId}/comments/`),

    createQuestionComment: (quizId: string, questionId: string, data: CreateCommentRequest) =>
      apiClient.post<QuestionComment>(`/quiz/quizzes/${quizId}/questions/${questionId}/comments/`, data),

    getQuestionComment: (quizId: string, questionId: string, commentId: string) =>
      apiClient.get<QuestionComment>(`/quiz/quizzes/${quizId}/questions/${questionId}/comments/${commentId}/`),

    updateQuestionComment: (quizId: string, questionId: string, commentId: string, data: UpdateCommentRequest) =>
      apiClient.put<QuestionComment>(`/quiz/quizzes/${quizId}/questions/${questionId}/comments/${commentId}/`, data),

    deleteQuestionComment: (quizId: string, questionId: string, commentId: string) =>
      apiClient.delete(`/quiz/quizzes/${quizId}/questions/${questionId}/comments/${commentId}/`),
  }
}
