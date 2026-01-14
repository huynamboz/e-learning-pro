// Comment API service
import { useApiClient } from '~/api/apiClient'
import type { 
  Comment, 
  CommentCreateRequest, 
  CommentCreateResponse, 
  CommentListResponse,
  CommentError 
} from '~/types/comment.type'

export function useCommentApi() {
  const apiClient = useApiClient()

  return {
    // Get comments for a lesson
    getComments: (courseId: string, chapterId: string, lessonId: string, page: number = 1) => {
      const params = new URLSearchParams()
      if (page > 1) {
        params.append('page', page.toString())
      }
      const queryString = params.toString()
      
      return apiClient.get<CommentListResponse>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${queryString ? `?${queryString}` : ''}`
      )
    },

    // Create a root comment
    createComment: (courseId: string, chapterId: string, lessonId: string, data: CommentCreateRequest) =>
      apiClient.post<CommentCreateResponse>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/`,
        data
      ),

    // Create a reply to a comment
    createReply: (courseId: string, chapterId: string, lessonId: string, commentId: string, data: CommentCreateRequest) =>
      apiClient.post<CommentCreateResponse>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${commentId}/reply/`,
        data
      ),

    // Delete a comment
    deleteComment: (courseId: string, chapterId: string, lessonId: string, commentId: string) =>
      apiClient.delete<{ message: string }>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${commentId}/`
      ),

    // Get a single comment by ID
    getComment: (courseId: string, chapterId: string, lessonId: string, commentId: string) =>
      apiClient.get<Comment>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/comments/${commentId}/`
      ),
  }
}

// Comment management composable with state
export function useCommentManagement(courseId: string, chapterId: string, lessonId: string) {
  const commentApi = useCommentApi()
  
  // State
  const comments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(1)

  // Load comments
  const loadComments = async (page: number = 1, append: boolean = false) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await commentApi.getComments(courseId, chapterId, lessonId, page)
      
      if (append) {
        comments.value = [...comments.value, ...response.results]
      } else {
        comments.value = response.results
      }
      
      hasMore.value = !!response.next
      currentPage.value = page
    } catch (err: any) {
      console.error('Error loading comments:', err)
      error.value = err.message || 'Failed to load comments'
    } finally {
      isLoading.value = false
    }
  }

  // Create comment
  const createComment = async (content: string) => {
    try {
      const response = await commentApi.createComment(courseId, chapterId, lessonId, { content })
      
      // Add the new comment to the beginning of the list
      comments.value = [response, ...comments.value]
      
      return response
    } catch (err: any) {
      console.error('Error creating comment:', err)
      throw err
    }
  }

  // Create reply
  const createReply = async (commentId: string, content: string) => {
    try {
      const response = await commentApi.createReply(courseId, chapterId, lessonId, commentId, { content })
      
      // Find the parent comment and add the reply
      const parentComment = comments.value.find(c => c.id === commentId)
      if (parentComment) {
        parentComment.replies.push(response)
      }
      
      return response
    } catch (err: any) {
      console.error('Error creating reply:', err)
      throw err
    }
  }

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(courseId, chapterId, lessonId, commentId)
      
      // Remove comment or reply from list
      const rootIndex = comments.value.findIndex(c => c.id === commentId)
      if (rootIndex !== -1) {
        comments.value = comments.value.filter(c => c.id !== commentId)
        return
      }

      comments.value = comments.value.map(comment => {
        const replies = comment.replies.filter(reply => reply.id !== commentId)
        if (replies.length === comment.replies.length) return comment
        return { ...comment, replies }
      })
    } catch (err: any) {
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  // Load more comments (pagination)
  const loadMore = async () => {
    if (hasMore.value && !isLoading.value) {
      await loadComments(currentPage.value + 1, true)
    }
  }

  // Refresh comments
  const refreshComments = async () => {
    await loadComments(1, false)
  }

  return {
    // State
    comments: readonly(comments),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    currentPage: readonly(currentPage),

    // Actions
    loadComments,
    createComment,
    createReply,
    deleteComment,
    loadMore,
    refreshComments,
  }
}
