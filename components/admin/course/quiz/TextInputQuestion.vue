<script setup lang="ts">
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { message, Upload } from 'ant-design-vue'
import { reactive, watch } from 'vue'

interface Props {
  initialData?: Partial<TextInputQuestionData>
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
})

const emit = defineEmits<{
  delete: []
  update: [data: TextInputQuestionData]
}>()

interface TextInputQuestionData {
  question: string
  explanation: string
  score: number
  files: any[]
  answer: string
}

const questionData = reactive<TextInputQuestionData>({
  question: props.initialData.question || '',
  explanation: props.initialData.explanation || '',
  score: props.initialData.score || 1.0,
  files: props.initialData.files || [],
  answer: props.initialData.answer || '',
})

const rules: Record<string, Rule[]> = {
  question: [
    { required: true, message: 'Please enter the question!', trigger: 'blur' },
  ],
  score: [
    { required: true, message: 'Please enter the score!', trigger: 'blur' },
    { 
      pattern: /^\d+(\.\d+)?$/, 
      message: 'Score must be a positive number!', 
      trigger: 'blur' 
    },
  ],
  answer: [
    { required: true, message: 'Please enter the answer!', trigger: 'blur' },
  ],
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
const loading = ref<boolean>(false)
const imageUrl = ref<string>('')
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

async function handleChange(info: UploadChangeParam) {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done' && info.file.originFileObj) {
    imageUrl.value = await getBase64(info.file.originFileObj as File) as string
    loading.value = false
  }
  if (info.file.status === 'error') {
    loading.value = false
    message.error('upload error')
  }
}

function beforeUpload(file: File) {
  const isValidType = file.type.startsWith('image/')
  if (!isValidType) {
    message.error('You can only upload JPG file!')
    return Upload.LIST_IGNORE
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('Image must smaller than 10MB!')
    return Upload.LIST_IGNORE
  }
  return true
}

async function handlePreview(file: any) {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj as File)) as string
  }
  previewImage.value = file.url || file.preview
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
}
function handleCancel() {
  previewVisible.value = false
  previewTitle.value = ''
}

watch(
  () => questionData,
  (newData) => {
    emit('update', { ...newData })
  },
  { deep: true },
)
</script>

<template>
  <div class="w-full max-w-[750px] border-l-4 border-green-500 rounded-2xl shadow-md">
    <!-- Question Header -->
    <div class="bg-green-50 px-5 py-4 rounded-t-2xl flex items-center justify-between">
      <h4 class="text-lg font-medium text-slate-900">
        Domanda
      </h4>
      <button
        type="button"
        class="w-6 h-6 flex-shrink-0 cursor-pointer"
        @click="$emit('delete')"
      >
        <Icon
          name="heroicons-outline:trash"
          class="text-[#E71D36] text-xl"
        />
      </button>
    </div>

    <!-- Question Form -->
    <div class="bg-gray-50 px-8 py-5 rounded-b-2xl">
      <a-form
        :model="questionData"
        :rules="rules"
        layout="vertical"
        class="space-y-3"
      >
        <!-- Question Input -->
        <a-form-item
          label="Question"
          name="question"
          class="mb-3"
        >
          <a-textarea
            v-model:value="questionData.question"
            placeholder="Enter your question"
            :rows="3"
            class="rounded-lg border-gray-300"
          />
        </a-form-item>

        <!-- Explanation and Score Row -->
        <div class="flex gap-3 mb-3">
          <a-form-item
            label="Explanation"
            class="flex-1"
          >
            <a-textarea
              v-model:value="questionData.explanation"
              placeholder="Explanation for the answer (optional)"
              :rows="2"
              class="rounded-lg border-gray-300"
            />
          </a-form-item>
          <a-form-item
            label="Score"
            name="score"
            class="w-32"
          >
            <a-input-number
              v-model:value="questionData.score"
              placeholder="1.0"
              class="w-full"
              :min="0.1"
              :max="100"
              :step="0.1"
              :precision="1"
            />
          </a-form-item>
        </div>

        <!-- Upload File Section -->
        <div class="mb-3">
          <label class="block text-base whitespace-nowrap font-normal text-gray-800 mb-2">Upload file</label>
          <a-upload
            v-model:file-list="questionData.files"
            class="upload-area"
            :before-upload="beforeUpload"
            :max-count="1"
            list-type="picture-card"
            @change="handleChange"
            @remove="() => { imageUrl = '' }"
            @preview="handlePreview"
          >
            <div class="border border-gray-400 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-gray-500 transition-colors">
              <div class="w-5 h-5 flex-shrink-0">
                <Icon
                  name="material-symbols:upload-rounded"
                  class="text-gray-800 text-2xl"
                />
              </div>
              <span class="text-base text-slate-900">Upload file</span>
            </div>
            <a-modal :open="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
              <img alt="example" style="width: 100%" :src="previewImage">
            </a-modal>
          </a-upload>
        </div>

        <!-- Answer Input -->
        <a-form-item
          label="Your answers"
          name="answer"
          class="mb-0"
        >
          <a-textarea
            v-model:value="questionData.answer"
            placeholder="Enter your answer"
            :rows="3"
            class="rounded-lg border-gray-300"
          />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles */
:deep(.ant-form-item-label > label) {
  color: #1e1e1e;
  font-weight: 400;
  font-size: 16px;
}

:deep(.ant-textarea) {
  border-color: #d9d9d9;
  border-radius: 8px;
}

:deep(.ant-textarea:focus) {
  border-color: #15803d;
  box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.1);
}

:deep(.ant-upload) {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.ant-form-item {
  margin-bottom: 12px;
}

.ant-form-item:last-child {
  margin-bottom: 0;
}

:deep(.ant-upload.ant-upload-select.ant-upload-select-picture-card) {
  margin-left: 4px;
  border: none;
  background: transparent;
}
</style>
