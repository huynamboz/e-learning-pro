<template>
  <div class="comment-list">
    <!-- Comment Form -->
    <div class="mb-6">
      <CommentForm 
        @submit="handleCreateComment"
        :show-cancel="false"
      />
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading && comments.length === 0" class="flex items-center justify-center py-8">
      <a-spin size="large" />
      <span class="ml-3 text-gray-600">Loading comments...</span>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error && comments.length === 0" class="text-center py-8">
      <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-3" />
      <p class="text-red-600 mb-4">{{ error }}</p>
      <a-button @click="refreshComments">
        Try Again
      </a-button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="comments.length === 0" class="text-center py-12">
      <Icon name="tabler:message-circle" class="text-gray-400 text-6xl mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
      <p class="text-gray-500">Be the first to start the conversation!</p>
    </div>
    
    <!-- Comments List -->
    <div v-else class="space-y-6">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment as Comment"
        @reply="handleCreateReply"
        @delete="handleDeleteComment"
      />
      
      <!-- Load More Button -->
      <div v-if="hasMore" class="text-center pt-4">
        <a-button 
          @click="loadMore"
          :loading="isLoading"
          type="dashed"
          class="w-full"
        >
          Load More Comments
        </a-button>
      </div>
    </div>
    
    <!-- Loading More State -->
    <div v-if="isLoading && comments.length > 0" class="text-center py-4">
      <a-spin size="small" />
      <span class="ml-2 text-gray-600">Loading more comments...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import type { Comment } from '~/types/comment.type'
import { useCommentManagement } from '~/composables/api/useCommentApi'

interface Props {
  courseId: string
  chapterId: string
  lessonId: string
}

interface Emits {
  (e: 'comment-count-updated', count: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive comment management
const commentManager = computed(() => 
  useCommentManagement(props.courseId, props.chapterId, props.lessonId)
)

// Destructure from reactive manager
const comments = computed(() => commentManager.value.comments.value)
const isLoading = computed(() => commentManager.value.isLoading.value)
const error = computed(() => commentManager.value.error.value)
const hasMore = computed(() => commentManager.value.hasMore.value)
const createComment = (content: string) => commentManager.value.createComment(content)
const createReply = (commentId: string, content: string) => commentManager.value.createReply(commentId, content)
const deleteComment = (commentId: string) => commentManager.value.deleteComment(commentId)
const loadMore = () => commentManager.value.loadMore()
const refreshComments = () => commentManager.value.refreshComments()

// Load comments on mount
onMounted(() => {
  refreshComments()
})

// Reload comments when lesson changes
watch([() => props.courseId, () => props.chapterId, () => props.lessonId], () => {
  refreshComments()
}, { immediate: false })

// Computed for total comment count
const totalCommentCount = computed(() => {
  return comments.value.reduce((total: number, comment) => {
    return total + 1 + comment.replies.length
  }, 0)
})

// Methods
const handleCreateComment = async (content: string) => {
  try {
    await createComment(content)
  emit('comment-count-updated', totalCommentCount.value)
  // Count will be updated automatically by the watcher
  } catch (err: any) {
    console.error('Error creating comment:', err)
    // Error handling is done in the composable
  }
}

const handleCreateReply = async (commentId: string, content: string) => {
  try {
    await createReply(commentId, content)
    emit('comment-count-updated', totalCommentCount.value)
    // Count will be updated automatically by the watcher
  } catch (err: any) {
    console.error('Error creating reply:', err)
    // Error handling is done in the composable
  }
}

const handleDeleteComment = async (commentId: string) => {
  try {
    await deleteComment(commentId)
    // Count will be updated automatically by the watcher
  } catch (err: any) {
    console.error('Error deleting comment:', err)
    // Error handling is done in the composable
  }
}
</script>

