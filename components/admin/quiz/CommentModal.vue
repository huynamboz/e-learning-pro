<script setup lang="ts">
import type { QuestionComment, CreateCommentRequest, UpdateCommentRequest } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import { notification } from 'ant-design-vue'

interface Props {
  visible: boolean
  quizId: string
  questionId: string
  answerId: string
  questionPrompt: string
  studentAnswer: string
  studentName: string
  existingComment?: QuestionComment | null
}

interface Emits {
  (e: 'close'): void
  (e: 'success', comment: QuestionComment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// API composable
const { createQuestionComment, updateQuestionComment } = useQuizApi()

// Form state
const formRef = ref()
const loading = ref(false)
const formData = reactive<CreateCommentRequest>({
  answer: props.answerId,
  content: ''
})

// Form validation
const rules = {
  content: [
    { required: true, message: 'Vui lòng nhập nội dung nhận xét!', trigger: 'blur' },
    { min: 5, message: 'Nhận xét phải có ít nhất 5 ký tự!', trigger: 'blur' },
    { max: 500, message: 'Nhận xét không được quá 500 ký tự!', trigger: 'blur' }
  ]
}

// Computed
const isEditing = computed(() => !!props.existingComment)
const modalTitle = computed(() => 
  isEditing.value ? 'Chỉnh sửa nhận xét' : 'Thêm nhận xét'
)

// Methods
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    let response: QuestionComment
    if (isEditing.value && props.existingComment) {
      // Update existing comment
      const updateData: UpdateCommentRequest = {
        content: formData.content
      }
      response = await updateQuestionComment(
        props.quizId, 
        props.questionId, 
        props.existingComment.id, 
        updateData
      )
    } else {
      // Create new comment
      response = await createQuestionComment(
        props.quizId, 
        props.questionId, 
        formData
      )
    }

    notification.success({
      message: 'Thành công',
      description: isEditing.value ? 'Đã cập nhật nhận xét!' : 'Đã thêm nhận xét!',
      duration: 3,
    })

    emit('success', response)
    handleClose()
  } catch (err: any) {
    notification.error({
      message: 'Lỗi',
      description: err.message || 'Failed to save comment',
      duration: 4,
    })
    console.error('Error saving comment:', err)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formData.content = ''
  emit('close')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for existing comment changes
watch(() => props.existingComment, (newComment) => {
  if (newComment) {
    formData.content = newComment.content
  } else {
    formData.content = ''
  }
}, { immediate: true })

// Watch for modal visibility
watch(() => props.visible, (visible) => {
  if (visible && props.existingComment) {
    formData.content = props.existingComment.content
  } else if (visible && !props.existingComment) {
    formData.content = ''
  }
})
</script>

<template>
  <a-modal
    :open="visible"
    :title="modalTitle"
    :width="800"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="space-y-6">
      <!-- Question Info -->
      <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Câu hỏi:</h4>
        <p class="text-sm text-gray-900">{{ questionPrompt }}</p>
      </div>

      <!-- Student Answer -->
      <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">
          Câu trả lời của {{ studentName }}:
        </h4>
        <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ studentAnswer }}</p>
      </div>

      <!-- Existing Comment (if editing) -->
      <div v-if="isEditing && existingComment" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Nhận xét hiện tại:</h4>
        <p class="text-sm text-gray-900">{{ existingComment.content }}</p>
        <p class="text-xs text-gray-500 mt-2">
          Tạo bởi {{ existingComment.author_name }} - {{ formatDate(existingComment.created_at) }}
        </p>
      </div>

      <!-- Comment Form -->
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="Nhận xét của giáo viên" name="content">
          <a-textarea
            v-model:value="formData.content"
            :rows="4"
            placeholder="Nhập nhận xét chi tiết cho học sinh..."
            class="w-full"
            :maxlength="500"
            show-count
          />
        </a-form-item>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <a-button @click="handleClose">
            Hủy
          </a-button>
          <a-button 
            type="primary" 
            html-type="submit"
            :loading="loading"
          >
            <template #icon>
              <Icon name="tabler:check" />
            </template>
            {{ isEditing ? 'Cập nhật' : 'Thêm nhận xét' }}
          </a-button>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>
