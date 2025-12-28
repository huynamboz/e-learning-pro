<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { NewQuizQuestion, NewQuizQuestionCreate } from '~/composables/api/useNewQuizApi'
import { notification } from 'ant-design-vue'
import EssayQuestion from '~/components/admin/course/quiz/EssayQuestion.vue'
import MultipleChoiceQuestion from '~/components/admin/course/quiz/MultipleChoiceQuestion.vue'
import TextInputQuestion from '~/components/admin/course/quiz/TextInputQuestion.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
import LevelSelector from './LevelSelector.vue'

interface Props {
  mode?: 'create' | 'edit'
  quizId?: string
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
  isLoading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getQuiz } = useNewQuizApi()

const formData = reactive({
  title: '',
  description: '',
  level_id: '',
  time_type: 'limit' as 'limit' | 'none',
  time_value: 30,
  time_unit: 'minute' as 'minute' | 'second',
  retake_limit: 1,
})

const loadingQuiz = ref(false)

const rules: Record<string, Rule[]> = {
  title: [
    { required: true, message: t('newQuiz.level.levelRequired'), trigger: 'blur' },
  ],
  level_id: [
    { required: true, message: t('newQuiz.level.levelRequired'), trigger: 'change' },
  ],
  time_value: [
    {
      required: true,
      message: 'Please input time value!',
      trigger: 'blur',
      type: 'number',
      min: 1,
    },
  ],
  time_unit: [
    { required: true, message: 'Please select time unit!', trigger: 'change' },
  ],
}

interface Question {
  id: string
  type: 'text-input' | 'multiple-choice' | 'essay'
  data: any
}

const questions = ref<Question[]>([])

const questionsValidation = computed(() => {
  const errors: string[] = []

  questions.value.forEach((question, index) => {
    const questionNumber = index + 1

    if (!question.data.question || question.data.question.trim() === '') {
      errors.push(`Question ${questionNumber}: Question text is required`)
    }

    if (!question.data.score || question.data.score <= 0) {
      errors.push(`Question ${questionNumber}: Score must be greater than 0`)
    }

    if (question.type === 'multiple-choice') {
      const hasEmptyOptions = question.data.options?.some((option: any) =>
        !option.text || option.text.trim() === '',
      )
      if (hasEmptyOptions) {
        errors.push(`Question ${questionNumber}: All answer options must be filled`)
      }

      if (!question.data.correctAnswer) {
        errors.push(`Question ${questionNumber}: Correct answer must be selected`)
      }
    }

    if (question.type === 'text-input') {
      if (!question.data.answer || question.data.answer.trim() === '') {
        errors.push(`Question ${questionNumber}: Sample answer is required`)
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
    id: `question-${Date.now()}-${Math.random()}`,
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
    id: `question-${Date.now()}-${Math.random()}`,
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
    id: `question-${Date.now()}-${Math.random()}`,
    type: 'multiple-choice',
    data: {
      question: '',
      explanation: '',
      score: 1.0,
      files: [],
      options: [
        { text: '', label: 'A', id: 'option-a' },
        { text: '', label: 'B', id: 'option-b' },
        { text: '', label: 'C', id: 'option-c' },
        { text: '', label: 'D', id: 'option-d' },
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
    questions.value[index].data = { ...questions.value[index].data, ...data }
  }
}

// Check if ID is a UUID (real question ID) or temporary ID
function isRealQuestionId(id: string): boolean {
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Transform questions to API format
function transformQuestionsToApi(): Array<NewQuizQuestionCreate & { id?: string }> {
  return questions.value.map((question, index) => {
    const baseQuestion: NewQuizQuestionCreate & { id?: string } = {
      question_type: question.type === 'multiple-choice' ? 'multiple_choice' : question.type === 'text-input' ? 'text_input' : 'essay',
      prompt: question.data.question,
      explanation: question.data.explanation || '',
      order: index + 1,
      score: Number(question.data.score) || 1.0,
    }

    // Only include id if it's a real UUID (existing question), not a temporary ID
    if (isRealQuestionId(question.id)) {
      baseQuestion.id = question.id
    }

    if (question.type === 'multiple-choice') {
      baseQuestion.options = question.data.options.map((opt: any) => ({
        label: opt.label,
        text: opt.text,
        is_correct: opt.label === question.data.correctAnswer,
      }))
    }

    if (question.type === 'text-input') {
      baseQuestion.sample_answer = {
        text: question.data.answer,
      }
    }

    return baseQuestion
  })
}

// Load quiz data for edit mode
async function loadQuizData() {
  if (!props.quizId)
    return

  try {
    loadingQuiz.value = true
    const quiz = await getQuiz(props.quizId)

    formData.title = quiz.title
    formData.description = quiz.description || ''
    formData.level_id = quiz.level
    formData.time_type = 'limit' // Always use limit
    formData.time_value = quiz.time_value || 30
    formData.time_unit = quiz.time_unit || 'minute'
    formData.retake_limit = quiz.retake_limit

    // Load questions
    if (quiz.questions && quiz.questions.length > 0) {
      questions.value = quiz.questions.map((q: NewQuizQuestion) => {
        const questionType = q.question_type === 'multiple_choice' ? 'multiple-choice' : q.question_type === 'text_input' ? 'text-input' : 'essay'

        const questionData: any = {
          question: q.prompt,
          explanation: q.explanation || '',
          score: q.score,
          files: [],
        }

        if (questionType === 'multiple-choice' && q.options) {
          questionData.options = q.options.map((opt, idx) => ({
            text: opt.text,
            label: opt.label || String.fromCharCode(65 + idx),
            id: `option-${opt.id || idx}`,
          }))
          const correctOption = q.options.find(opt => opt.is_correct)
          questionData.correctAnswer = correctOption?.label || ''
        }

        if (questionType === 'text-input' && q.sample_answer) {
          questionData.answer = q.sample_answer.text
        }

        return {
          id: q.id,
          type: questionType,
          data: questionData,
        }
      })
    }
  }
  catch (err: any) {
    notification.error({
      message: t('newQuiz.messages.loadQuizError'),
      description: err.message,
      duration: 4.5,
    })
    console.error('Error loading quiz:', err)
  }
  finally {
    loadingQuiz.value = false
  }
}

// Create API payload
function createApiPayload() {
  const payload: any = {
    title: formData.title,
    description: formData.description,
    level_id: formData.level_id,
    time_type: 'limit', // Always use limit
    time_value: formData.time_value,
    time_unit: formData.time_unit,
    retake_limit: formData.retake_limit,
    is_published: false,
    questions: transformQuestionsToApi(),
  }

  return payload
}

async function onFinish() {
  if (!questionsValidation.value.isValid) {
    notification.warning({
      message: t('newQuiz.messages.validationError'),
      description: questionsValidation.value.errors.join(', '),
      duration: 4,
    })
    return
  }

  try {
    const apiPayload = createApiPayload()

    if (props.mode === 'edit' && props.quizId) {
      emit('updateQuiz', { id: props.quizId, ...apiPayload })
    }
    else {
      emit('createQuiz', apiPayload)
    }
  }
  catch (error: any) {
    notification.error({
      message: t('newQuiz.messages.formValidationError'),
      description: error.message || t('newQuiz.messages.formValidationMessage'),
      duration: 4,
    })
    console.error('Error saving quiz:', error)
  }
}

function onFinishFailed(errorInfo: any) {
  notification.error({
    message: t('newQuiz.messages.formValidationError'),
    description: t('newQuiz.messages.formValidationMessage'),
    duration: 4,
  })
  console.error('Form validation failed:', errorInfo)
}

const unitOptions = [
  { label: t('quiz.minute'), value: 'minute' },
  { label: t('quiz.second'), value: 'second' },
]

onMounted(async () => {
  if (props.mode === 'edit' && props.quizId) {
    await loadQuizData()
  }
})

const totalScore = computed(() => {
  return questions.value.reduce((total, question) => {
    return total + (Number(question.data.score) || 0)
  }, 0)
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-md:px-0 bg-gray-50 min-h-screen">
    <div class="w-full max-w-5xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Icon
              name="solar:clipboard-list-bold-duotone"
              class="text-2xl text-white"
            />
          </div>
          <div class="flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {{ props.mode === 'edit' ? $t('newQuiz.editor.editTitle') : $t('newQuiz.editor.createTitle') }}
            </h1>
            <p class="text-sm text-gray-600">
              {{ props.mode === 'edit' ? 'Chỉnh sửa thông tin và câu hỏi của quiz' : 'Tạo quiz độc lập mới với các câu hỏi tùy chỉnh' }}
            </p>
          </div>
          <a-button
            type="default"
            size="large"
            class="!flex !justify-center !items-center !gap-1"
            @click="emit('back')"
          >
            <Icon name="solar:arrow-left-bold" />
            <span class="hidden sm:inline">{{ $t('newQuiz.editor.backToList') }}</span>
          </a-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading || loadingQuiz" class="flex items-center justify-center py-16">
        <div class="text-center">
          <a-spin size="large" />
          <p class="text-sm text-gray-500 mt-4">
            {{ $t('newQuiz.editor.loadingQuiz') }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <a-form
        v-if="!isLoading && !loadingQuiz"
        :model="formData"
        :rules="rules"
        layout="vertical"
        class="space-y-6"
        @finish="onFinish"
        @finish-failed="onFinishFailed"
      >
        <!-- Basic Information Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-2 mb-6">
            <Icon name="solar:document-text-bold-duotone" class="text-xl text-green-600" />
            <h2 class="text-lg font-semibold text-gray-800">
              Thông tin cơ bản
            </h2>
          </div>

          <div class="space-y-4">
            <!-- Title -->
            <a-form-item :label="$t('newQuiz.editor.title')" name="title" class="mb-4">
              <a-input
                v-model:value="formData.title"
                :placeholder="$t('newQuiz.editor.titlePlaceholder')"
                size="large"
                class="rounded-lg"
              />
            </a-form-item>

            <!-- Description -->
            <a-form-item :label="$t('newQuiz.editor.description')" name="description" class="mb-4">
              <a-textarea
                v-model:value="formData.description"
                :placeholder="$t('newQuiz.editor.descriptionPlaceholder')"
                :rows="4"
                class="rounded-lg"
              />
            </a-form-item>

            <!-- Level -->
            <a-form-item :label="$t('newQuiz.editor.level')" name="level_id" class="mb-0">
              <LevelSelector v-model="formData.level_id" />
            </a-form-item>
          </div>
        </div>

        <!-- Settings Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-2 mb-6">
            <Icon name="solar:settings-bold-duotone" class="text-xl text-blue-600" />
            <h2 class="text-lg font-semibold text-gray-800">
              Cài đặt Quiz
            </h2>
          </div>

          <div class="space-y-4">
            <!-- Time Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a-form-item :label="$t('newQuiz.editor.timeLimit')" name="time_value" class="mb-0">
                <a-input-number
                  v-model:value="formData.time_value"
                  :placeholder="$t('newQuiz.editor.timeLimitPlaceholder')"
                  :min="1"
                  size="large"
                  class="w-full rounded-lg"
                />
              </a-form-item>

              <a-form-item :label="$t('newQuiz.editor.unit')" name="time_unit" class="mb-0">
                <a-select
                  v-model:value="formData.time_unit"
                  size="large"
                  class="rounded-lg"
                  :options="unitOptions"
                />
              </a-form-item>
            </div>

            <!-- Retake Limit -->
            <a-form-item :label="$t('newQuiz.editor.retakeLimit')" name="retake_limit" class="mb-0">
              <a-input-number
                v-model:value="formData.retake_limit"
                :placeholder="$t('newQuiz.editor.retakeLimitPlaceholder')"
                :min="1"
                size="large"
                class="w-full md:w-64 rounded-lg"
              />
              <div class="text-xs text-gray-500 mt-1">
                Số lần học viên có thể làm lại quiz này
              </div>
            </a-form-item>
          </div>
        </div>

        <!-- Questions Section Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div class="flex items-center gap-2">
              <Icon name="solar:question-circle-bold-duotone" class="text-xl text-purple-600" />
              <div>
                <h2 class="text-lg font-semibold text-gray-800">
                  {{ $t('newQuiz.editor.questions') }}
                </h2>
                <p class="text-sm text-gray-500">
                  {{ questions.length }} {{ questions.length === 1 ? $t('newQuiz.editor.questionsCount') : $t('newQuiz.editor.questionsCountPlural') }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addMultipleChoiceQuestion"
              >
                <Icon name="solar:list-check-bold" />
                {{ $t('newQuiz.editor.addMultipleChoice') }}
              </a-button>
              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addTextInputQuestion"
              >
                <Icon name="solar:text-field-bold" />
                {{ $t('newQuiz.editor.addTextInput') }}
              </a-button>
              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addEssayQuestion"
              >
                <Icon name="solar:document-text-bold" />
                {{ $t('newQuiz.editor.addEssay') }}
              </a-button>
            </div>
          </div>

          <!-- Questions List -->
          <div class="space-y-4">
            <template v-for="(question, index) in questions" :key="question.id">
              <TextInputQuestion
                v-if="question.type === 'text-input'"
                :initial-data="question.data"
                :question-number="index + 1"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
              <MultipleChoiceQuestion
                v-else-if="question.type === 'multiple-choice'"
                :initial-data="question.data"
                :question-number="index + 1"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
              <EssayQuestion
                v-else-if="question.type === 'essay'"
                :initial-data="question.data"
                :question-number="index + 1"
                @delete="removeQuestion(index)"
                @update="updateQuestion(index, $event)"
              />
            </template>

            <!-- Các nút thêm quiz -->
            <div v-if="questions.length > 0" class="flex flex-wrap gap-2">
              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addMultipleChoiceQuestion"
              >
                <Icon name="solar:list-check-bold" />
                {{ $t('newQuiz.editor.addMultipleChoice') }}
              </a-button>

              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addTextInputQuestion"
              >
                <Icon name="solar:text-field-bold" />
                {{ $t('newQuiz.editor.addTextInput') }}
              </a-button>
              <a-button
                type="default"
                class="!flex !justify-center !items-center !gap-1"
                @click="addEssayQuestion"
              >
                <Icon name="solar:document-text-bold" />
                {{ $t('newQuiz.editor.addEssay') }}
              </a-button>
            </div>

            <!-- Empty State -->
            <div
              v-if="questions.length === 0"
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center bg-gray-50"
            >
              <Icon name="solar:question-circle-bold-duotone" class="text-6xl text-gray-300 mb-4 mx-auto" />
              <h3 class="text-lg font-semibold text-gray-700 mb-2">
                {{ $t('newQuiz.editor.noQuestions') }}
              </h3>
              <p class="text-sm text-gray-500 mb-6">
                Thêm câu hỏi để tạo quiz hoàn chỉnh
              </p>
            </div>
          </div>

          <!-- Total Score -->
          <div v-if="questions.length > 0" class="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="solar:star-bold-duotone" class="text-xl text-green-600" />
                <span class="text-sm font-semibold text-gray-700">Tổng điểm:</span>
              </div>
              <span class="text-2xl font-bold text-green-600">{{ totalScore }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <a-button
              size="large"
              class="w-full sm:w-auto !flex !justify-center !items-center !gap-1"
              @click="emit('back')"
            >
              <Icon name="solar:close-circle-bold" />
              Hủy
            </a-button>
            <a-button
              type="primary"
              size="large"
              :loading="isCreating || isUpdating"
              html-type="submit"
              class="w-full sm:w-auto !flex !justify-center !items-center !gap-1"
            >
              <Icon name="solar:check-circle-bold" />
              {{ props.mode === 'edit' ? $t('newQuiz.editor.updateQuiz') : $t('newQuiz.editor.createQuiz') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </div>
  </div>
</template>
