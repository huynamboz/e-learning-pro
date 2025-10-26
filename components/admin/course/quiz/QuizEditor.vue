<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { QuizQuestion } from '~/composables/api/useQuizApi'
import type { QuizFormData } from '~/types/quiz.type'
import { notification } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import EssayQuestion from './EssayQuestion.vue'
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue'
import TextInputQuestion from './TextInputQuestion.vue'

interface Props {
  mode?: 'create' | 'edit'
  quizId?: string
  courseId?: string
  isCreating?: boolean
  isUpdating?: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'back'): void
  (e: 'createQuiz', quizData: any): void
  (e: 'updateQuiz', quizData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  quizId: undefined,
  isCreating: false,
  isUpdating: false,
  isLoading: true,
})

const emit = defineEmits<Emits>()

const formData = reactive<QuizFormData>({
  title: '',
  description: '',
  category: '',
  chapter: '',
  lesson: '', // Add lesson field
  timeType: 'limit', // Default to limit since no-limit is not allowed
  quantity: 30, // Default to 30 minutes
  unit: 'minute',
  retake_limit: null, // Default to unlimited retakes
})

// API composables
const { getDetailCourses, getCategories } = useCourseApi()

// State for API data
const categories = ref<any[]>([])
const chapters = ref<any[]>([])
const lessons = ref<any[]>([])
const loadingData = ref(false)
const loadingQuiz = ref(false)

// Computed loading state
const isLoading = computed(() => loadingData.value || loadingQuiz.value)

const rules = computed<Record<string, Rule[]>>(() => (
  {
    title: [
      { required: true, message: 'Please input the quiz title!', trigger: 'blur' },
    ],
    description: [
      { required: true, message: 'Please input the quiz description!', trigger: 'blur' },
    ],
    category: [
      { required: true, message: 'Please select a category!', trigger: 'change' },
    ],
    chapter: [
      { required: true, message: 'Please select a chapter!', trigger: 'change' },
    ],
    lesson: [
      { required: true, message: 'Please select a lesson!', trigger: 'change' },
    ],
    timeType: [
      { required: true, message: 'Please select time type!', trigger: 'change' },
    ],
    quantity: [
      { required: true, message: 'Please input quantity!', trigger: 'blur' },
      {
        pattern: /^\d+$/,
        message: 'Quantity must be a positive number!',
        trigger: 'blur',
      },
    ],
    unit: [
      { required: true, message: 'Please select unit!', trigger: 'change' },
    ],
  }
))

// Computed options from API data
const categoryOptions = computed(() =>
  categories.value.map(cat => ({
    label: cat.name,
    value: cat.id,
  })),
)

const chapterOptions = computed(() => {
  return chapters.value.map(chapter => ({
    label: chapter.title,
    value: chapter.id,
  }))
})

const lessonOptions = computed(() => {
  // Filter lessons by selected chapter
  const filteredLessons = formData.chapter
    ? lessons.value.filter(lesson => lesson.chapter_id === formData.chapter)
    : lessons.value

  return filteredLessons.map(lesson => ({
    label: `${lesson.chapter_title} - ${lesson.title}`,
    value: lesson.id,
  }))
})

// Handle chapter change to reset lesson selection
function handleChapterChange(chapterId: string) {
  formData.chapter = chapterId
  // Reset lesson when chapter changes (only if lesson is not valid for new chapter)
  const validLessons = lessons.value.filter(lesson => lesson.chapter_id === chapterId)
  const isCurrentLessonValid = validLessons.some(lesson => lesson.id === formData.lesson)

  if (!isCurrentLessonValid) {
    formData.lesson = ''
  }
}

const timeTypeOptions = ref([
  { label: 'Limit', value: 'limit' },
  // Removed 'no-limit' option as it's not allowed by API
])

const unitOptions = ref([
  { label: 'Minute', value: 'minute' },
  { label: 'Hour', value: 'hour' },
  { label: 'Second', value: 'second' },
])

interface Question {
  id: string
  type: 'text-input' | 'multiple-choice' | 'essay'
  data: any
}

const questions = ref<Question[]>([])

const questionsValidation = computed(() => {
  if (questions.value.length === 0) {
    return {
      isValid: false,
      errors: ['At least one question is required'],
    }
  }

  const errors: string[] = []

  questions.value.forEach((question, index) => {
    const questionNumber = index + 1

    if (!question.data.question || question.data.question.trim() === '') {
      errors.push(`Question ${questionNumber}: Question text is required`)
    }

    if (!question.data.score || question.data.score <= 0) {
      errors.push(`Question ${questionNumber}: Score must be greater than 0`)
    }

    // Text-input and essay questions don't require answer validation
    // if (question.type === 'text-input') {
    //   if (!question.data.answer || question.data.answer.trim() === '') {
    //     errors.push(`Question ${questionNumber}: Answer is required`)
    //   }
    // }
    if (question.type === 'multiple-choice') {
      const hasEmptyOptions = question.data.options.some((option: any) =>
        !option.text || option.text.trim() === '',
      )
      if (hasEmptyOptions) {
        errors.push(`Question ${questionNumber}: All answer options must be filled`)
      }

      if (!question.data.correctAnswer) {
        errors.push(`Question ${questionNumber}: Correct answer must be selected`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
})

function addTextInputQuestion() {
  const newQuestion: Question = {
    id: `question-${Date.now()}`,
    type: 'text-input',
    data: {
      question: '',
      explanation: '',
      score: 1.0,
      files: [],
      answer: '',
    },
  }
  questions.value.push(newQuestion)
}

function addEssayQuestion() {
  const newQuestion: Question = {
    id: `question-${Date.now()}`,
    type: 'essay',
    data: {
      question: '',
      explanation: '',
      score: 1.0,
      files: [],
    },
  }
  questions.value.push(newQuestion)
}

function addMultipleChoiceQuestion() {
  const newQuestion: Question = {
    id: `question-${Date.now()}`,
    type: 'multiple-choice',
    data: {
      question: '',
      explanation: '',
      score: 1.0,
      files: [],
      options: [
        { text: '', label: 'A' },
        { text: '', label: 'B' },
        { text: '', label: 'C' },
        { text: '', label: 'D' },
      ],
      correctAnswer: '',
    },
  }
  questions.value.push(newQuestion)
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

function updateQuestion(index: number, data: any) {
  if (questions.value[index]) {
    questions.value[index].data = data
  }
}

// Transform questions to API format
function transformQuestionsToApi(questions: Question[]) {
  return questions.map((q, index) => {
    const baseQuestion = {
      question_type: q.type === 'multiple-choice' ? 'multiple_choice' : q.type === 'text-input' ? 'text_input' : 'essay',
      prompt: q.data.question,
      explanation: q.data.explanation || '',
      order: index + 1,
      score: q.data.score || 1.0,
    }

    if (q.type === 'multiple-choice') {
      return {
        ...baseQuestion,
        options: q.data.options?.map((option: any) => ({
          label: option.label,
          text: option.text,
          is_correct: option.label === q.data.correctAnswer,
        })) || [],
      }
    }
    else if (q.type === 'text-input') {
      return {
        ...baseQuestion,
        options: [],
        sample_answer: {
          text: q.data.answer || '',
        },
      }
    }
    else {
      // essay question
      return {
        ...baseQuestion,
        options: [],
      }
    }
  })
}

// Create API payload
function createApiPayload(values: QuizFormData) {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    lesson: values.lesson, // Use lesson instead of chapter
    time_type: values.timeType as 'limit' | 'no-limit',
    time_value: values.timeType === 'limit' ? values.quantity : null,
    time_unit: values.timeType === 'limit' ? values.unit : null,
    retake_limit: values.retake_limit,
    is_published: false,
    questions: transformQuestionsToApi(questions.value),
  }
}

async function onFinish(values: QuizFormData) {
  if (!questionsValidation.value.isValid) {
    notification.warning({
      message: 'Validation Error',
      description: 'Please fix the form errors before submitting',
      duration: 3,
    })
    return
  }

  try {
    const apiPayload = createApiPayload(values)

    if (props.mode === 'edit' && props.quizId) {
      emit('updateQuiz', { id: props.quizId, ...apiPayload })
      notification.success({
        message: 'Success',
        description: 'Quiz updated successfully!',
        duration: 3,
      })
    }
    else {
      emit('createQuiz', apiPayload)
      notification.success({
        message: 'Success',
        description: 'Quiz created successfully!',
        duration: 3,
      })
    }
  }
  catch (error: any) {
    notification.error({
      message: 'Error',
      description: error.message || 'Failed to save quiz',
      duration: 4.5,
    })
    console.error('Error creating quiz:', error)
  }
}

function onFinishFailed(errorInfo: any) {
  notification.error({
    message: 'Form Validation Failed',
    description: 'Please check all required fields and try again',
    duration: 4,
  })
  console.error('Form validation failed:', errorInfo)
}

// Fetch API data
async function fetchApiData() {
  try {
    loadingData.value = true

    // Fetch categories and course data in parallel
    const [categoriesResponse, courseResponse] = await Promise.allSettled([
      getCategories(),
      props.courseId ? getDetailCourses(props.courseId) : Promise.resolve(null),
    ])

    // Handle categories
    if (categoriesResponse.status === 'fulfilled') {
      categories.value = categoriesResponse.value.results
    }
    else {
      throw new Error('Failed to load categories')
    }

    // Handle course data
    if (courseResponse.status === 'fulfilled' && courseResponse.value) {
      chapters.value = courseResponse.value.chapters

      // Flatten all lessons from all chapters
      lessons.value = courseResponse.value.chapters.flatMap(chapter =>
        chapter.lessons?.map(lesson => ({
          ...lesson,
          chapter_id: chapter.id, // Add chapter ID for filtering
          chapter_title: chapter.title, // Add chapter title for reference
        })) || [],
      )

      // Auto-select the course's category
      if (courseResponse.value.category && !formData.category) {
        formData.category = courseResponse.value.category.id
      }
    }
    else if (props.courseId) {
      throw new Error('Failed to load course data')
    }
  }
  catch (err: any) {
    const errorMessage = err.message || 'Failed to load data'
    notification.error({
      message: 'Error',
      description: errorMessage,
      duration: 4.5,
    })
    console.error('Error fetching API data:', err)
  }
  finally {
    loadingData.value = false
  }
}

// Load quiz data for editing
async function loadQuizData() {
  if (!props.quizId)
    return

  try {
    loadingQuiz.value = true
    const { getQuiz } = useQuizApi()
    const quiz = await getQuiz(props.quizId)

    if (quiz) {
      // Update form data - set chapter first, then lesson to avoid watch reset
      formData.title = quiz.title
      formData.description = quiz.description
      formData.category = quiz.category

      // Find chapter by lesson ID
      const chapter = chapters.value.find(ch =>
        ch.lessons?.some((lesson: any) => lesson.id === quiz.lesson),
      )

      if (chapter) {
        formData.chapter = chapter.id
      }

      formData.timeType = quiz.time_type
      formData.quantity = quiz.time_value
      formData.unit = quiz.time_unit || 'minute'
      formData.lesson = quiz.lesson
      formData.retake_limit = quiz.retake_limit

      // Map questions from API response to component format
      questions.value = mapApiQuestionsToComponent(quiz.questions)
    }
  }
  catch (err: any) {
    const errorMessage = err.message || 'Failed to load quiz data'
    notification.error({
      message: 'Error',
      description: errorMessage,
      duration: 4.5,
    })
    console.error('Error loading quiz for edit:', err)
  }
  finally {
    loadingQuiz.value = false
  }
}

// Helper function to map API questions to component format
function mapApiQuestionsToComponent(apiQuestions: QuizQuestion[]) {
  if (!apiQuestions || apiQuestions.length === 0)
    return []

  return apiQuestions.map((apiQuestion: QuizQuestion) => {
    if (apiQuestion.question_type === 'multiple_choice') {
      return {
        id: apiQuestion.id,
        type: 'multiple-choice' as const,
        data: {
          question: apiQuestion.prompt,
          explanation: apiQuestion.explanation || '',
          score: apiQuestion.score || 1.0,
          files: [],
          options: apiQuestion.options?.map(option => ({
            text: option.text,
            label: option.label,
          })) || [
            { text: '', label: 'A' },
            { text: '', label: 'B' },
            { text: '', label: 'C' },
            { text: '', label: 'D' },
          ],
          correctAnswer: apiQuestion.options?.find(opt => opt.is_correct)?.label || '',
        },
      }
    }
    else if (apiQuestion.question_type === 'text_input') {
      // text_input question
      return {
        id: apiQuestion.id,
        type: 'text-input' as const,
        data: {
          question: apiQuestion.prompt,
          explanation: apiQuestion.explanation || '',
          score: apiQuestion.score || 1.0,
          files: [],
          answer: apiQuestion.sample_answer?.text || '',
        },
      }
    }
    else {
      // essay question
      return {
        id: apiQuestion.id,
        type: 'essay' as const,
        data: {
          question: apiQuestion.prompt,
          explanation: apiQuestion.explanation || '',
          score: apiQuestion.score || 1.0,
          files: [],
        },
      }
    }
  })
}

onMounted(async () => {
  // First fetch API data
  await fetchApiData()

  // Auto-fill chapter and lesson from query parameters (for create mode)
  if (props.mode === 'create') {
    const route = useRoute()
    const chapterId = route.query.chapterId as string
    const lessonId = route.query.lessonId as string

    // Set chapter and lesson
    if (chapterId) {
      formData.chapter = chapterId
    }
    if (lessonId) {
      formData.lesson = lessonId
    }
  }

  // Then load quiz data if in edit mode
  if (props.mode === 'edit') {
    await loadQuizData()
  }
})

// Calculate total score
const totalScore = computed(() => {
  return questions.value.reduce((total, question) => {
    return total + (Number(question.data.score) || 0)
  }, 0)
})

defineExpose({
  formData,
  totalScore,
  resetForm: () => {
    Object.assign(formData, {
      title: '',
      description: '',
      category: '',
      chapter: '',
      lesson: '', // Add lesson field
      timeType: '',
      quantity: null,
      unit: '',
    })
  },
})
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-10 pb-3 max-md:px-0">
    <div class="w-full max-w-[750px] mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
        <h3 class="text-xl sm:text-2xl font-semibold text-green-700 mb-3">
          {{ props.mode === 'edit' ? 'Edit Quiz' : 'Create Quiz' }}
        </h3>
        <a-button type="default" danger class="text-xs sm:text-sm" @click="emit('back')">
          <span class="hidden sm:inline">Back to Quizzes List</span>
        </a-button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-8 sm:py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-700 mx-auto mb-4" />
          <p class="text-xs sm:text-sm text-gray-500">
            {{ loadingData ? 'Loading categories and chapters...' : 'Loading quiz data...' }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <a-form
        v-if="!isLoading"
        :model="formData"
        :rules="rules"
        layout="vertical"
        class="space-y-3"
        @finish="onFinish"
        @finish-failed="onFinishFailed"
      >
        <!-- Title Quiz -->
        <a-form-item label="Title quiz" name="title" class="mb-3">
          <a-input
            v-model:value="formData.title"
            placeholder="Basic Italian Quiz – Beginner Level"
            class="h-10 sm:h-12 rounded-lg border-gray-300"
          />
        </a-form-item>

        <!-- Description Quiz -->
        <a-form-item label="Description quiz" name="description" class="mb-3">
          <a-textarea
            v-model:value="formData.description"
            placeholder="This short quiz is designed to test your basic Italian knowledge. You will find both multiple-choice and short-answer questions covering greetings, numbers, and simple vocabulary. Good luck! 🍀"
            :rows="3"
            class="rounded-lg border-gray-300"
          />
        </a-form-item>

        <!-- Categories and Chapter Row -->
        <div class="flex flex-col sm:flex-row gap-3 mb-3">
          <a-form-item label="Categories" name="category" class="flex-1">
            <a-select
              v-model:value="formData.category"
              placeholder="Select a category"
              class="h-10 sm:h-12"
              :options="categoryOptions"
              :loading="loadingData"
              :disabled="loadingData"
            />
          </a-form-item>

          <a-form-item label="Chapter" name="chapter" class="flex-1">
            <a-select
              :value="formData.chapter"
              placeholder="Select a chapter"
              class="h-10 sm:h-12"
              :options="chapterOptions"
              :loading="loadingData"
              :disabled="loadingData"
              @change="handleChapterChange"
            />
          </a-form-item>
        </div>

        <!-- Lesson Row -->
        <div class="mb-3">
          <a-form-item label="Lesson" name="lesson">
            <a-select
              v-model:value="formData.lesson"
              placeholder="Select a lesson"
              class="h-10 sm:h-12"
              :options="lessonOptions"
              :loading="loadingData"
              :disabled="loadingData || !formData.chapter"
            />
          </a-form-item>
        </div>

        <!-- Type time, Quantity, and Unit Row -->
        <div class="flex flex-col sm:flex-row gap-3 mb-3">
          <a-form-item label="Type time" name="timeType" class="flex-1">
            <a-select
              v-model:value="formData.timeType"
              placeholder="Limit"
              class="h-10 sm:h-12"
              :options="timeTypeOptions"
            />
          </a-form-item>

          <a-form-item label="Quantity" name="quantity" class="flex-1">
            <a-input-number
              v-model:value="formData.quantity"
              placeholder="30"
              class="w-full h-10"
              style="width: 100%"
              :min="1"
              :max="999"
            />
          </a-form-item>

          <a-form-item label="Unit" name="unit" class="flex-1">
            <a-select
              v-model:value="formData.unit"
              placeholder="minute"
              class="h-10 sm:h-12"
              :options="unitOptions"
            />
          </a-form-item>
        </div>

        <!-- Retake Limit Row -->
        <div class="mb-3">
          <a-form-item label="Số lần làm lại" name="retake_limit" class="w-full max-w-md">
            <a-input-number
              v-model:value="formData.retake_limit"
              placeholder="Không giới hạn"
              class="w-full h-10"
              style="width: 100%"
              :min="1"
              :max="100"
            />
            <div class="text-xs text-gray-500 mt-1">
              Để trống hoặc 0 = không giới hạn số lần làm lại
            </div>
          </a-form-item>
        </div>

        <!-- Questions Section -->
        <div class="pt-6">
          <!-- Questions List -->
          <div class="space-y-4">
            <template v-for="(question, index) in questions" :key="question.id">
              <TextInputQuestion
                v-if="question.type === 'text-input'"
                :initial-data="question.data"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
              <MultipleChoiceQuestion
                v-else-if="question.type === 'multiple-choice'"
                :initial-data="question.data"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
              <EssayQuestion
                v-else-if="question.type === 'essay'"
                :initial-data="question.data"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
            </template>

            <!-- Empty State -->
            <div
              v-if="questions.length === 0"
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center"
            >
              <p class="text-sm sm:text-base text-gray-500 mb-4">
                No questions added yet
              </p>
              <div class="flex flex-col sm:flex-row justify-center gap-2">
                <!-- <a-button type="primary" @click="addTextInputQuestion">
                  Add Text Input Question
                </a-button> -->
                <a-button type="primary" class="text-xs sm:text-sm" @click="addMultipleChoiceQuestion">
                  Add Multiple Choice Question
                </a-button>
                <a-button type="primary" class="text-xs sm:text-sm" @click="addEssayQuestion">
                  Add Essay Question
                </a-button>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pb-4 border-b border-gray-200 gap-3">
            <div class="flex flex-col sm:flex-row gap-2">
              <!-- <a-button type="default" class="text-xs sm:text-sm" @click="addTextInputQuestion">
                Add Text Input Question
              </a-button> -->
              <a-button type="default" class="text-xs sm:text-sm" @click="addMultipleChoiceQuestion">
                Add Multiple Choice Question
              </a-button>
              <a-button type="default" class="text-xs sm:text-sm" @click="addEssayQuestion">
                Add Essay Question
              </a-button>
            </div>
          </div>
        </div>

        <!-- Questions Validation Errors -->
        <div v-if="!questionsValidation.isValid && questions.length > 0" class="mt-4">
          <a-alert type="error" show-icon class="mb-4">
            <template #message>
              <div>
                <p class="text-sm sm:text-base font-medium mb-2">
                  Please fix the following issues:
                </p>
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="error in questionsValidation.errors" :key="error" class="text-xs sm:text-sm">
                    {{ error }}
                  </li>
                </ul>
              </div>
            </template>
          </a-alert>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-4 sm:pt-6">
          <a-button
            type="primary"
            html-type="submit"
            size="small"
            class="sm:size-large"
            :loading="isCreating || isUpdating"
            :disabled="!questionsValidation.isValid"
          >
            <template v-if="questions.length === 0">
              <span class="hidden sm:inline">{{ props.mode === 'edit' ? 'Update Quiz (No questions)' : 'Create Quiz (No questions)' }}</span>
            </template>
            <template v-else>
              <span class="hidden sm:inline">{{ props.mode === 'edit' ? 'Update Quiz' : 'Create Quiz' }} ({{ questions.length }} question{{ questions.length !== 1 ? 's' : '' }}, {{ totalScore }} points)</span>
            </template>
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>
