import type { CreateQuizPayload, Quiz, QuizChapter, QuizQuestion, UpdateQuizPayload } from '~/types/quiz.type'
import { message } from 'ant-design-vue'
import { quizzes } from '~/resources/admin/quizzes'

export function useQuizManagement() {
  const isLoading = useState<boolean>('quiz.isLoading', () => false)
  const isCreating = useState<boolean>('quiz.isCreating', () => false)
  const isUpdating = useState<boolean>('quiz.isUpdating', () => false)

  // Get all quizzes
  const getQuizzes = (): QuizChapter[] => {
    return quizzes
  }

  // Create new quiz
  const createQuiz = async (payload: CreateQuizPayload): Promise<void> => {
    try {
      isCreating.value = true
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        chapter: payload.chapter,
        timeType: payload.timeType,
        quantity: payload.quantity ?? null,
        unit: (payload.unit as 'minute' | 'hour' | 'second') ?? null,
        questions: payload.questions,
        number_of_questions: payload.questions.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      // eslint-disable-next-line no-console
      console.log('Creating quiz with payload:', newQuiz)
      message.success('Quiz created successfully!')
    }
    catch (error) {
      console.error('Error creating quiz:', error)
      message.error('Failed to create quiz')
    }
    finally {
      isCreating.value = false
    }
  }

  // Update existing quiz
  const updateQuiz = async (payload: UpdateQuizPayload): Promise<void> => {
    try {
      isUpdating.value = true
      // eslint-disable-next-line no-console
      console.log('Updating quiz with payload:', payload)
      message.success('Quiz updated successfully!')
    }
    catch (error) {
      console.error('Error updating quiz:', error)
      message.error('Failed to update quiz')
    }
    finally {
      isUpdating.value = false
    }
  }

  // Delete quiz
  const deleteQuiz = async (quizId: string): Promise<void> => {
    try {
      // eslint-disable-next-line no-console
      console.log('Deleting quiz with ID:', quizId)
      message.success('Quiz deleted successfully!')
    }
    catch (error) {
      console.error('Error deleting quiz:', error)
      message.error('Failed to delete quiz')
    }
  }

  // Load quiz for editing
  const loadQuizForEdit = (quizId: string): Quiz => {
    const quiz: Quiz = {
      id: quizId,
      title: 'Sample Quiz',
      description: 'This is a sample quiz description',
      category: 'Programming',
      chapter: 'Chapter 1',
      timeType: 'limit',
      quantity: 30,
      unit: 'minute',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'What is TypeScript?',
          options: [
            {
              text: 'A programming language',
              label: 'A',
              id: 'option-a',
            },
            {
              text: 'A framework',
              label: 'B',
              id: 'option-b',
            },
            {
              text: 'A database',
              label: 'C',
              id: 'option-c',
            },
          ],
          correctAnswer: 'C',
          files: [],
        },
      ],
      number_of_questions: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    return quiz
  }

  // Validate quiz data
  const validateQuizData = (questions: QuizQuestion[]): { isValid: boolean, errors: string[] } => {
    if (questions.length === 0) {
      return {
        isValid: false,
        errors: ['At least one question is required'],
      }
    }

    const errors: string[] = []

    questions.forEach((question, index) => {
      const questionNumber = index + 1

      if (!question.question || question.question.trim() === '') {
        errors.push(`Question ${questionNumber}: Question text is required`)
      }

      if (question.type === 'text-input') {
        if (!question.answer || question.answer.trim() === '') {
          errors.push(`Question ${questionNumber}: Answer is required`)
        }
      }
      else if (question.type === 'multiple-choice') {
        const hasEmptyOptions = question.options?.some(option =>
          !option.text || option.text.trim() === '',
        )
        if (hasEmptyOptions) {
          errors.push(`Question ${questionNumber}: All answer options must be filled`)
        }

        if (!question.correctAnswer) {
          errors.push(`Question ${questionNumber}: Correct answer must be selected`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  return {
    // State
    quizzes: readonly(quizzes),
    isLoading: readonly(isLoading),
    isCreating: readonly(isCreating),
    isUpdating: readonly(isUpdating),

    // Actions
    getQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    loadQuizForEdit,
    validateQuizData,
  }
}
