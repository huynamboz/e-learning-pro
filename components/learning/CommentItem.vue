<template>
  <div class="border-b border-gray-100 last:border-b-0">
    <!-- Comment Header -->
    <div class="flex items-start gap-3 mb-3">
      <a-avatar 
        :size="40" 
        :src="comment.author_avatar"
        class="flex-shrink-0"
      >
        {{ comment.author_name.charAt(0).toUpperCase() }}
      </a-avatar>
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-gray-900 text-sm">
            {{ comment.author_name }}
          </span>
          <span class="text-xs text-gray-500">
            {{ formatTime(comment.created_at) }}
          </span>
        </div>
        
        <!-- Comment Content -->
        <div class="text-gray-800 text-sm leading-relaxed mb-3">
          {{ comment.content }}
        </div>
        
        <!-- Comment Actions -->
        <div class="flex items-center gap-4">
          <!-- <span class="text-xs text-gray-500">
            {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'Like' : 'Likes' }}
          </span> -->
          <a-button 
            type="link" 
            size="small" 
            class="text-gray-500 hover:text-blue-600 p-0 h-auto font-normal"
            @click="toggleReplyForm"
          >
            <Icon name="tabler:arrow-back" class="w-3 h-3 mr-1" />
            Reply
          </a-button>
          
          <!-- Delete button (only for own comments or teachers) -->
          <a-button 
            v-if="canDelete"
            type="link" 
            size="small" 
            class="!flex items-center text-gray-500 hover:text-red-600 p-0 h-auto font-normal"
            @click="showDeleteConfirm"
            :loading="isDeleting"
          >
            <Icon name="tabler:trash" class="w-3 h-3 mr-1" />
            Delete
          </a-button>
        </div>
      </div>
    </div>
    
    <!-- Reply Form -->
    <div v-if="showReplyForm" class="ml-11 mb-4">
      <a-textarea
        v-model:value="replyContent"
        placeholder="Write a reply..."
        :rows="3"
        :maxlength="500"
        show-count
        class="mb-3"
      />
      <div class="flex gap-2">
        <a-button 
          type="primary" 
          size="small"
          @click="handleReply"
          :loading="isSubmittingReply"
          :disabled="!replyContent.trim()"
        >
          Reply
        </a-button>
        <a-button 
          size="small"
          @click="cancelReply"
        >
          Cancel
        </a-button>
      </div>
    </div>
    
    <!-- Replies -->
    <div v-if="comment.replies.length > 0" class="ml-11 space-y-0">
      <div 
        v-for="reply in comment.replies" 
        :key="reply.id"
        class="border-l-2 border-gray-200 pl-4 pb-4"
      >
        <div class="flex items-start gap-3">
          <a-avatar 
            :size="32" 
            :src="reply.author_avatar"
            class="flex-shrink-0"
          >
            {{ reply.author_name.charAt(0).toUpperCase() }}
          </a-avatar>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-gray-900 text-sm">
                {{ reply.author_name }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatTime(reply.created_at) }}
              </span>
            </div>
            
            <div class="text-gray-800 text-sm leading-relaxed">
              {{ reply.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Delete Confirmation Modal -->
  <a-modal
    v-model:open="showDeleteModal"
    title="Delete Comment"
    @ok="handleDelete"
    @cancel="showDeleteModal = false"
    :confirm-loading="isDeleting"
  >
    <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
  </a-modal>
</template>

<script setup lang="ts">
import type { Comment } from '~/types/comment.type'
import { useAuth } from '~/composables/useAuth'

interface Props {
  comment: Comment
  onReply?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
}

const props = defineProps<Props>()
const { user, profile } = useAuth()

// Local state
const showReplyForm = ref(false)
const replyContent = ref('')
const isSubmittingReply = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

// Computed
const canDelete = computed(() => {
  if (!user.value) return false
  
  // User can delete their own comments
  if (user.value.id === props.comment.author) return true
  
  // Teachers can delete any comment (assuming they're the course teacher)
  if (user.value.is_teacher) return true
  
  return false
})

// Methods
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
  if (!showReplyForm.value) {
    replyContent.value = ''
  }
}

const cancelReply = () => {
  showReplyForm.value = false
  replyContent.value = ''
}

const handleReply = async () => {
  if (!replyContent.value.trim() || !props.onReply) return
  
  try {
    isSubmittingReply.value = true
    await props.onReply(props.comment.id, replyContent.value.trim())
    replyContent.value = ''
    showReplyForm.value = false
  } catch (error) {
    console.error('Error creating reply:', error)
  } finally {
    isSubmittingReply.value = false
  }
}

const showDeleteConfirm = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!props.onDelete) return
  
  try {
    isDeleting.value = true
    await props.onDelete(props.comment.id)
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error deleting comment:', error)
  } finally {
    isDeleting.value = false
  }
}

// Utility function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`
  
  return date.toLocaleDateString()
}
</script>

