<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

interface Props {
  initialData: {
    question: string
    explanation: string
    score: number
    files: any[]
  }
  questionNumber?: number
}

interface Emits {
  (e: 'update', data: any): void
  (e: 'delete'): void
}

const props = withDefaults(defineProps<Props>(), {
  questionNumber: 1,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const formData = reactive({
  question: props.initialData.question || '',
  explanation: props.initialData.explanation || '',
  score: props.initialData.score || 1.0,
  files: props.initialData.files || [],
})

// Watch for changes and emit updates
watch(formData, (newData) => {
  emit('update', newData)
}, { deep: true })

const rules = computed(() => ({
  question: [
    { required: true, message: t('quiz.question.questionRequired'), trigger: 'blur' },
  ],
  score: [
    { required: true, message: t('quiz.question.scoreRequired'), trigger: 'blur' },
    { 
      pattern: /^\d+(\.\d+)?$/, 
      message: t('quiz.question.scoreMustBePositive'), 
      trigger: 'blur' 
    },
  ],
}))
</script>

<template>
  <div class="w-full max-w-[750px] border-l-4 border-green-500 p-4 rounded-2xl shadow-md">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {{ t('quiz.question.essayQuestion') }}
        </span>
        <span class="text-sm text-gray-500">
          {{ t('quiz.question.manualGradingRequired') }}
        </span>
      </div>
      <a-button type="text" class="!flex items-center gap-2" danger size="small" @click="emit('delete')">
        <template #icon>
          <DeleteOutlined />
        </template>
        {{ t('quiz.question.delete') }}
      </a-button>
    </div>

    <div class="mb-4">
      <h4 class="text-lg font-medium text-slate-900">
        {{ t('quiz.question.questionNumber', { number: props.questionNumber }) }}
      </h4>
    </div>

    <a-form :model="formData" :rules="rules" layout="vertical" class="space-y-4">
      <!-- Question Text -->
      <a-form-item :label="t('quiz.question.question')" name="question" class="mb-4">
        <a-textarea 
          v-model:value="formData.question"
          :placeholder="t('quiz.question.essayQuestionPlaceholder')"
          :rows="3"
          class="rounded-lg border-gray-300"
        />
      </a-form-item>

      <!-- Explanation -->
      <a-form-item :label="t('quiz.question.explanationOptional')" name="explanation" class="mb-4">
        <a-textarea 
          v-model:value="formData.explanation"
          :placeholder="t('quiz.question.explanationHintPlaceholder')"
          :rows="2"
          class="rounded-lg border-gray-300"
        />
      </a-form-item>

      <!-- Score -->
      <div class="flex gap-4 items-end">
        <a-form-item :label="t('quiz.question.score')" name="score" class="flex-1">
          <a-input-number 
            v-model:value="formData.score"
            placeholder="1.0"
            :min="0.1"
            :max="100"
            :step="0.1"
            class="w-full"
          />
        </a-form-item>
      </div>

      <!-- Info Box -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <InfoCircleOutlined class="text-blue-500 mt-0.5" />
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">{{ t('quiz.question.essayQuestion') }}</p>
            <p>{{ t('quiz.question.essayQuestionInfo') }}</p>
          </div>
        </div>
      </div>
    </a-form>
  </div>
</template>
