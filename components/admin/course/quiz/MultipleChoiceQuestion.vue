<script setup lang="ts">
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { message, Upload } from 'ant-design-vue'
import { computed, reactive, watch } from 'vue'

interface Props {
  initialData?: Partial<MultipleChoiceQuestionData>
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
})

const emit = defineEmits<{
  delete: []
  update: [data: MultipleChoiceQuestionData]
}>()

interface QuestionOption {
  text: string
  label: string
}

interface MultipleChoiceQuestionData {
  question: string
  files: any[]
  options: QuestionOption[]
  correctAnswer: string
}

const questionData = reactive<MultipleChoiceQuestionData>({
  question: props.initialData.question || '',
  files: props.initialData.files || [],
  options: props.initialData.options || [
    { text: 'Friend', label: 'A' },
    { text: 'Option B', label: 'B' },
    { text: 'Option C', label: 'C' },
    { text: 'Option D', label: 'D' },
  ],
  correctAnswer: props.initialData.correctAnswer || '',
})

const rules: Record<string, Rule[]> = {
  question: [
    { required: true, message: 'Please enter the question!', trigger: 'blur' },
  ],
  correctAnswer: [
    { required: true, message: 'Please select the correct answer!', trigger: 'change' },
  ],
}

const correctAnswerOptions = computed(() =>
  questionData.options.map((option, index) => ({
    label: `${getOptionLabel(index)} - ${option.text || `Option ${getOptionLabel(index)}`}`,
    value: getOptionLabel(index),
  })),
)

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function getOptionColor(index: number): string {
  const colors = [
    'bg-blue-200',
    'bg-orange-200',
    'bg-red-200',
    'bg-yellow-200',
  ]
  return colors[index] || 'bg-gray-200'
}

function updateOption(index: number, value: string) {
  questionData.options[index].text = value
}

const loading = ref<boolean>(false)
const imageUrl = ref<string>('')
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

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
  console.log(file)
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
async function handlePreview(file: UploadProps['fileList'][number]) {
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

        <!-- Upload File Section -->
        <div class="mb-3">
          <label class="block text-base font-normal text-gray-800 mb-2">Upload file</label>
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

        <!-- Answer Options -->
        <div class="mb-3">
          <label class="block text-base font-normal text-gray-800 mb-2">Answer Options</label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in questionData.options"
              :key="index"
              class="flex items-center gap-2"
            >
              <!-- Option Label -->
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-black font-normal text-base flex-shrink-0"
                :class="getOptionColor(index)"
              >
                {{ getOptionLabel(index) }}
              </div>

              <!-- Option Input -->
              <a-input
                v-model:value="option.text"
                :placeholder="`Option ${getOptionLabel(index)}`"
                class="flex-1 rounded-lg border-gray-300"
                @input="updateOption(index, $event.target.value)"
              />
            </div>
          </div>
        </div>

        <!-- Correct Answer Selection -->
        <a-form-item
          label="Correct answer"
          name="correctAnswer"
          class="mb-0"
        >
          <a-select
            v-model:value="questionData.correctAnswer"
            placeholder="Select correct answer"
            class="h-12"
            :options="correctAnswerOptions"
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

:deep(.ant-input) {
  border-color: #d9d9d9;
  border-radius: 8px;
}

:deep(.ant-input:focus) {
  border-color: #15803d;
  box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.1);
}

:deep(.ant-select-selector) {
  border-color: #d9d9d9;
  border-radius: 8px;
  height: 48px;
  display: flex;
  align-items: center;
}

:deep(.ant-select-focused .ant-select-selector) {
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
