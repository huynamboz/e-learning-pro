<script setup lang="ts">
import type { QuestionComment } from '~/composables/api/useQuizApi'
import { useQuizApi } from '~/composables/api/useQuizApi'
import { notification } from 'ant-design-vue'
import CommentModal from './CommentModal.vue'

interface Props {
  quizId: string
  questionId: string
  answerId: string
  questionPrompt: string
  studentAnswer: string
  studentName: string
  comments: QuestionComment[]
  loading?: boolean
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// API composable
const { deleteQuestionComment } = useQuizApi()

// Modal state
const showCommentModal = ref(false)
const editingComment = ref<QuestionComment | null>(null)

// Methods
const handleAddComment = () => {
  editingComment.value = null
  showCommentModal.value = true
}

const handleEditComment = (comment: QuestionComment) => {
  editingComment.value = comment
  showCommentModal.value = true
}

const handleDeleteComment = async (comment: QuestionComment) => {
  try {
    await deleteQuestionComment(props.quizId, props.questionId, comment.id)
    
    notification.success({
      message: 'Thành công',
      description: 'Đã xóa nhận xét!',
      duration: 3,
    })
    
    emit('refresh')
  } catch (err: any) {
    notification.error({
      message: 'Lỗi',
      description: err.message || 'Failed to delete comment',
      duration: 4,
    })
    console.error('Error deleting comment:', err)
  }
}

const handleCommentSuccess = (comment: QuestionComment) => {
  emit('refresh')
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

const getRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  
  return formatDate(dateString)
}
</script>

<template>
  <div class="border-t border-gray-200 pt-4">
    <div class="flex items-center justify-between mb-3">
      <h5 class="text-sm font-medium text-gray-700">
        Nhận xét của giáo viên ({{ comments.length }})
      </h5>
      <a-button 
        type="primary" 
        size="small"
        @click="handleAddComment"
      >
        <template #icon>
          <Icon name="tabler:plus" />
        </template>
        Thêm nhận xét
      </a-button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-sm text-gray-600">Đang tải nhận xét...</span>
    </div>

    <!-- Comments List -->
    <div v-else-if="comments.length > 0" class="space-y-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-gray-50 border border-gray-200 p-4 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">{{ comment.author_name }}</span>
            <span 
              :class="comment.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
              class="text-xs font-medium px-2 py-1 rounded-full"
            >
              {{ comment.role === 'teacher' ? 'Giáo viên' : 'Học sinh' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500" :title="formatDate(comment.created_at)">
              {{ getRelativeTime(comment.created_at) }}
            </span>
            <a-dropdown v-if="comment.role === 'teacher'">
              <a-button type="text" size="small">
                <template #icon>
                  <Icon name="tabler:dots-vertical" />
                </template>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditComment(comment)">
                    <template #icon>
                      <Icon name="tabler:edit" />
                    </template>
                    Chỉnh sửa
                  </a-menu-item>
                  <a-menu-item danger @click="handleDeleteComment(comment)">
                    <template #icon>
                      <Icon name="tabler:trash" />
                    </template>
                    Xóa
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>
      </div>
    </div>

    <!-- No Comments -->
    <div v-else class="text-center py-6 text-gray-500">
      <Icon name="tabler:message-circle" class="text-3xl mx-auto mb-3" />
      <p class="text-sm">Chưa có nhận xét nào</p>
      <p class="text-xs text-gray-400 mt-1">Hãy thêm nhận xét để phản hồi cho học sinh</p>
    </div>

    <!-- Comment Modal -->
    <CommentModal
      :visible="showCommentModal"
      :quiz-id="quizId"
      :question-id="questionId"
      :answer-id="answerId"
      :question-prompt="questionPrompt"
      :student-answer="studentAnswer"
      :student-name="studentName"
      :existing-comment="editingComment"
      @close="showCommentModal = false"
      @success="handleCommentSuccess"
    />
  </div>
</template>
