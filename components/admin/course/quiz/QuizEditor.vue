<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { CreateQuizPayload, Quiz, QuizFormData, UpdateQuizPayload } from '~/types/quiz.type'
import type { QuizApiResponse, QuizQuestion } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { notification } from 'ant-design-vue'
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
  timeType: 'limit', // Default to limit since no-limit is not allowed
  quantity: 30, // Default to 30 minutes
  unit: 'minute',
})

// API composables
const { getDetailCourses, getCategories } = useCourseApi()

// State for API data
const categories = ref<any[]>([])
const chapters = ref<any[]>([])
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
    timeType: [
      { required: true, message: 'Please select time type!', trigger: 'change' },
    ],
    quantity: [
      { required: true, message: 'Please input quantity!', trigger: 'blur' },
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
  }))
)

const chapterOptions = computed(() => 
  chapters.value.map(chapter => ({
    label: chapter.title,
    value: chapter.id,
  }))
)

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
  type: 'text-input' | 'multiple-choice'
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

    if (question.type === 'text-input') {
      if (!question.data.answer || question.data.answer.trim() === '') {
        errors.push(`Question ${questionNumber}: Answer is required`)
      }
    }
    else if (question.type === 'multiple-choice') {
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
      files: [],
      answer: '',
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
const transformQuestionsToApi = (questions: Question[]) => {
  return questions.map((q, index) => {
    const baseQuestion = {
      question_type: q.type === 'multiple-choice' ? 'multiple_choice' : 'text_input',
      prompt: q.data.question,
      explanation: '',
      order: index + 1,
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
    } else {
      return {
        ...baseQuestion,
        options: [],
        sample_answer: {
          text: q.data.answer || '',
        },
      }
    }
  })
}

// Create API payload
const createApiPayload = (values: QuizFormData) => ({
  title: values.title,
  description: values.description,
  category: values.category,
  chapter: values.chapter,
  time_type: values.timeType as 'limit' | 'no-limit',
  time_value: values.timeType === 'limit' ? values.quantity : null,
  time_unit: values.timeType === 'limit' ? values.unit : null,
  is_published: false,
  questions: transformQuestionsToApi(questions.value),
})

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
    } else {
      emit('createQuiz', apiPayload)
      notification.success({
        message: 'Success',
        description: 'Quiz created successfully!',
        duration: 3,
      })
    }
  } catch (error: any) {
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
const fetchApiData = async () => {
  try {
    loadingData.value = true
    
    // Fetch categories and course data in parallel
    const [categoriesResponse, courseResponse] = await Promise.allSettled([
      getCategories(),
      props.courseId ? getDetailCourses(props.courseId) : Promise.resolve(null)
    ])
    
    // Handle categories
    if (categoriesResponse.status === 'fulfilled') {
      categories.value = categoriesResponse.value.results
    } else {
      throw new Error('Failed to load categories')
    }
    
    // Handle course data
    if (courseResponse.status === 'fulfilled' && courseResponse.value) {
      chapters.value = courseResponse.value.chapters
      
      // Auto-select the course's category
      if (courseResponse.value.category && !formData.category) {
        formData.category = courseResponse.value.category.id
      }
    } else if (props.courseId) {
      throw new Error('Failed to load course data')
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to load data'
    notification.error({
      message: 'Error',
      description: errorMessage,
      duration: 4.5,
    })
    console.error('Error fetching API data:', err)
  } finally {
    loadingData.value = false
  }
}

// Load quiz data for editing
const loadQuizData = async () => {
  if (!props.quizId) return
  
  try {
    loadingQuiz.value = true
    const { getQuiz } = useQuizApi()
    const quiz = await getQuiz(props.quizId)
    
    if (quiz) {
      // Update form data
      Object.assign(formData, {
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        chapter: quiz.chapter,
        timeType: quiz.time_type,
        quantity: quiz.time_value,
        unit: quiz.time_unit || 'minute',
      })

      // Map questions from API response to component format
      questions.value = mapApiQuestionsToComponent(quiz.questions)
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to load quiz data'
    notification.error({
      message: 'Error',
      description: errorMessage,
      duration: 4.5,
    })
    console.error('Error loading quiz for edit:', err)
  } finally {
    loadingQuiz.value = false
  }
}

// Helper function to map API questions to component format
const mapApiQuestionsToComponent = (apiQuestions: QuizQuestion[]) => {
  if (!apiQuestions || apiQuestions.length === 0) return []
  
  return apiQuestions.map((apiQuestion: QuizQuestion) => {
    if (apiQuestion.question_type === 'multiple_choice') {
      return {
        id: apiQuestion.id,
        type: 'multiple-choice' as const,
        data: {
          question: apiQuestion.prompt,
          files: [],
          options: apiQuestion.options?.map((option) => ({
            text: option.text,
            label: option.label,
          })) || [
            { text: '', label: 'A' },
            { text: '', label: 'B' },
            { text: '', label: 'C' },
            { text: '', label: 'D' },
          ],
          correctAnswer: apiQuestion.options?.find((opt) => opt.is_correct)?.label || '',
        },
      }
    } else {
      // text_input question
      return {
        id: apiQuestion.id,
        type: 'text-input' as const,
        data: {
          question: apiQuestion.prompt,
          files: [],
          answer: apiQuestion.sample_answer?.text || '',
        },
      }
    }
  })
}

onMounted(async () => {
  // First fetch API data
  await fetchApiData()
  
  // Then load quiz data if in edit mode
  if (props.mode === 'edit') {
    await loadQuizData()
  }
})

defineExpose({
  formData,
  resetForm: () => {
    Object.assign(formData, {
      title: '',
      description: '',
      category: '',
      chapter: '',
      timeType: '',
      quantity: null,
      unit: '',
    })
  },
})
</script>

<template>
  <div class="px-10 pb-3">
    <div class="w-full max-w-[750px] mx-auto">
      <!-- Header -->
      <div class="flex justify-between">
        <h3 class="text-2xl font-semibold text-green-700 mb-3">
          {{ props.mode === 'edit' ? 'Edit Quiz' : 'Create Quiz' }}
        </h3>
        <a-button
          type="default"
          danger
          @click="emit('back')"
        >
          Back to Quizzes List
        </a-button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p class="text-sm text-gray-500">
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
        <a-form-item
          label="Title quiz"
          name="title"
          class="mb-3"
        >
          <a-input
            v-model:value="formData.title"
            placeholder="Basic Italian Quiz – Beginner Level"
            class="h-12 rounded-lg border-gray-300"
          />
        </a-form-item>

        <!-- Description Quiz -->
        <a-form-item
          label="Description quiz"
          name="description"
          class="mb-3"
        >
          <a-textarea
            v-model:value="formData.description"
            placeholder="This short quiz is designed to test your basic Italian knowledge. You will find both multiple-choice and short-answer questions covering greetings, numbers, and simple vocabulary. Good luck! 🍀"
            :rows="4"
            class="rounded-lg border-gray-300"
          />
        </a-form-item>

        <!-- Categories and Chapter Row -->
        <div class="flex gap-3 mb-3">
          <a-form-item
            label="Categories"
            name="category"
            class="flex-1"
          >
            <a-select
              v-model:value="formData.category"
              placeholder="Select a category"
              class="h-12"
              :options="categoryOptions"
              :loading="loadingData"
              :disabled="loadingData"
            />
          </a-form-item>

          <a-form-item
            label="Chapter"
            name="chapter"
            class="flex-1"
          >
            <a-select
              v-model:value="formData.chapter"
              placeholder="Select a chapter"
              class="h-12"
              :options="chapterOptions"
              :loading="loadingData"
              :disabled="loadingData"
            />
          </a-form-item>
        </div>

        <!-- Type time, Quantity, and Unit Row -->
        <div class="flex gap-3 mb-3">
          <a-form-item
            label="Type time"
            name="timeType"
            class="flex-1"
          >
            <a-select
              v-model:value="formData.timeType"
              placeholder="Limit"
              class="h-12"
              :options="timeTypeOptions"
            />
          </a-form-item>

          <a-form-item
            label="Quantity"
            name="quantity"
            class="flex-1"
          >
            <a-input-number
              v-model:value="formData.quantity"
              placeholder="30"
              class="w-full h-10"
              style="width: 100%"
              :min="1"
              :max="999"
            />
          </a-form-item>

          <a-form-item
            label="Unit"
            name="unit"
            class="flex-1"
          >
            <a-select
              v-model:value="formData.unit"
              placeholder="minute"
              class="h-12"
              :options="unitOptions"
            />
          </a-form-item>
        </div>

        <!-- Questions Section -->
        <div class="pt-6">
          <!-- Questions List -->
          <div class="space-y-4">
            <template
              v-for="(question, index) in questions"
              :key="question.id"
            >
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
            </template>

            <!-- Empty State -->
            <div
              v-if="questions.length === 0"
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            >
              <p class="text-gray-500 mb-4">
                No questions added yet
              </p>
              <div class="flex justify-center gap-2">
                <a-button
                  type="primary"
                  @click="addTextInputQuestion"
                >
                  Add Text Input Question
                </a-button>
                <a-button
                  type="primary"
                  @click="addMultipleChoiceQuestion"
                >
                  Add Multiple Choice Question
                </a-button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-6 pb-4 border-b border-gray-200">
            <div class="flex gap-2">
              <a-button
                type="default"
                @click="addTextInputQuestion"
              >
                Add Text Input Question
              </a-button>
              <a-button
                type="default"
                @click="addMultipleChoiceQuestion"
              >
                Add Multiple Choice Question
              </a-button>
            </div>
          </div>
        </div>

        <!-- Questions Validation Errors -->
        <div v-if="!questionsValidation.isValid && questions.length > 0" class="mt-4">
          <a-alert
            type="error"
            show-icon
            class="mb-4"
          >
            <template #message>
              <div>
                <p class="font-medium mb-2">
                  Please fix the following issues:
                </p>
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="error in questionsValidation.errors" :key="error" class="text-sm">
                    {{ error }}
                  </li>
                </ul>
              </div>
            </template>
          </a-alert>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-6">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="isCreating || isUpdating"
            :disabled="!questionsValidation.isValid"
          >
            <template v-if="questions.length === 0">
              {{ props.mode === 'edit' ? 'Update Quiz (No questions)' : 'Create Quiz (No questions)' }}
            </template>
            <template v-else>
              {{ props.mode === 'edit' ? 'Update Quiz' : 'Create Quiz' }} ({{ questions.length }} question{{ questions.length !== 1 ? 's' : '' }})
            </template>
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>
