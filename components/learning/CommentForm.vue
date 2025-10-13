<template>
  <div class="p-4 px-0">
    <div class="flex items-start gap-3">
      <a-avatar 
        :size="40" 
        :src="profile?.avatar"
        class="flex-shrink-0"
      >
        {{ profile?.first_name?.charAt(0)?.toUpperCase() || 'U' }}
      </a-avatar>
      
      <div class="flex-1">
        <a-textarea
          v-model:value="content"
          placeholder="Write a comment..."
          :rows="3"
          :maxlength="500"
          show-count
          class="mb-3"
          :class="{ 'border-red-500': error }"
        />
        
        <div v-if="error" class="text-red-500 text-sm mb-3">
          {{ error }}
        </div>
        
        <div class="flex gap-2">
          <a-button 
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
            :disabled="!content.trim()"
          >
            Comment
          </a-button>
          <a-button 
            v-if="showCancel"
            @click="handleCancel"
            :disabled="isSubmitting"
          >
            Cancel
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

interface Props {
  placeholder?: string
  showCancel?: boolean
  initialContent?: string
}

interface Emits {
  (e: 'submit', content: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write a comment...',
  showCancel: false,
  initialContent: ''
})

const emit = defineEmits<Emits>()

const { user, profile } = useAuth()

// Local state
const content = ref(props.initialContent)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Methods
const handleSubmit = async () => {
  if (!content.value.trim()) return
  
  try {
    isSubmitting.value = true
    error.value = null
    emit('submit', content.value.trim())
    content.value = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to submit comment'
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  content.value = ''
  error.value = null
  emit('cancel')
}

// Watch for initial content changes
watch(() => props.initialContent, (newContent) => {
  content.value = newContent
})
</script>

