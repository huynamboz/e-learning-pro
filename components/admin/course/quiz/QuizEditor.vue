<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { CreateQuizPayload, Quiz, QuizFormData, UpdateQuizPayload } from '~/types/quiz.type'
import MultipleChoiceQuestion from './MultipleChoiceQuestion.vue'
import TextInputQuestion from './TextInputQuestion.vue'

interface Props {
  mode?: 'create' | 'edit'
  quizId?: string
  isCreating?: boolean
  isUpdating?: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'back'): void
  (e: 'createQuiz', quizData: CreateQuizPayload): void
  (e: 'updateQuiz', quizData: UpdateQuizPayload): void
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
  timeType: '',
  quantity: null,
  unit: '',
})
const { loadQuizForEdit } = useQuizManagement()
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
      { required: formData.timeType === 'limit', message: 'Please input quantity!', trigger: 'blur' },
    ],
    unit: [
      { required: formData.timeType === 'limit', message: 'Please select unit!', trigger: 'change' },
    ],
  }
))

const categoryOptions = ref([
  { label: 'Italian for Beginners', value: 'italian-beginners' },
  { label: 'Italian Intermediate', value: 'italian-intermediate' },
  { label: 'Italian Advanced', value: 'italian-advanced' },
  { label: 'English Basics', value: 'english-basics' },
  { label: 'Spanish Fundamentals', value: 'spanish-fundamentals' },
])

const chapterOptions = ref([
  { label: 'Chapter 1', value: 'chapter-1' },
  { label: 'Chapter 2', value: 'chapter-2' },
  { label: 'Chapter 3', value: 'chapter-3' },
  { label: 'Chapter 4', value: 'chapter-4' },
  { label: 'Chapter 5', value: 'chapter-5' },
])

const timeTypeOptions = ref([
  { label: 'Limit', value: 'limit' },
  { label: 'No Limit', value: 'no-limit' },
])

const unitOptions = ref([
  { label: 'minute', value: 'minute' },
  { label: 'hour', value: 'hour' },
  { label: 'second', value: 'second' },
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

async function onFinish(values: QuizFormData) {
  if (!questionsValidation.value.isValid) {
    return
  }

  try {
    const basePayload = {
      title: values.title,
      description: values.description,
      category: values.category,
      chapter: values.chapter,
      timeType: values.timeType as 'limit' | 'no-limit',
      questions: questions.value.map(q => ({
        id: q.id,
        type: q.type,
        question: q.data.question,
        files: q.data.files || [],
        answer: q.type === 'text-input' ? q.data.answer : undefined,
        options: q.type === 'multiple-choice' ? q.data.options : undefined,
        correctAnswer: q.type === 'multiple-choice' ? q.data.correctAnswer : undefined,
      })),
    }

    // Add optional fields only if timeType is 'limit' and values exist
    const payload = {
      ...basePayload,
      ...(values.timeType === 'limit' && values.quantity && {
        quantity: values.quantity,
        unit: values.unit as 'minute' | 'hour' | 'second',
      }),
    }

    if (props.mode === 'edit' && props.quizId) {
      emit('updateQuiz', { id: props.quizId, ...payload })
    }
    else {
      emit('createQuiz', payload)
    }
  }
  catch {
    // Error handling is done in the composable
  }
}

function onFinishFailed(_errorInfo: any) {
  // Form validation failed
}

// Load quiz data for editing
onMounted(() => {
  if (props.mode === 'edit' && props.quizId) {
    const quiz = loadQuizForEdit(props.quizId)
    if (quiz) {
      Object.assign(formData, {
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        chapter: quiz.chapter,
        timeType: quiz.timeType,
        quantity: quiz.quantity,
        unit: quiz.unit || '',
      })

      // Load questions and transform them to the expected format
      questions.value = (quiz.questions || []).map(q => ({
        id: q.id,
        type: q.type,
        data: {
          question: q.question,
          files: q.files || [],
          answer: q.answer || '',
          options: q.options || [
            { text: '', label: 'A' },
            { text: '', label: 'B' },
            { text: '', label: 'C' },
            { text: '', label: 'D' },
          ],
          correctAnswer: q.correctAnswer || '',
        },
      }))
    }
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

      <!-- Form -->
      <a-form
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
              placeholder="Italian for Beginners"
              class="h-12"
              :options="categoryOptions"
            />
          </a-form-item>

          <a-form-item
            label="Chapter"
            name="chapter"
            class="flex-1"
          >
            <a-select
              v-model:value="formData.chapter"
              placeholder="Chapter 1"
              class="h-12"
              :options="chapterOptions"
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
              placeholder="45"
              class="w-full h-10"
              style="width: 100%"
              :min="1"
              :max="999"
              :disabled="formData.timeType !== 'limit'"
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
              :disabled="formData.timeType !== 'limit'"
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
