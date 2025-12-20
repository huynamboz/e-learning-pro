<script setup lang="ts">
import { computed } from 'vue'

interface VideoPost {
  id: string
  title: string
  content: string
  videoUrl: string | null
  thumbnail?: string | null
  publishedAt: string
  author?: string
  tags?: string[]
}

interface Props {
  post: VideoPost
}

const props = defineProps<Props>()

// Format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
  catch {
    return dateString
  }
}

// Get thumbnail URL, fallback to default if empty
const thumbnailUrl = computed(() => {
  return props.post.thumbnail || '/images/course-thumbnail-default.webp'
})
</script>

<template>
  <article class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
    <!-- Thumbnail Container -->
    <div class="relative w-full aspect-video bg-gray-900 overflow-hidden group cursor-pointer">
      <img
        :src="thumbnailUrl"
        :alt="post.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <!-- Play Icon Overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div class="rounded-full p-4 transition-colors">
          <Icon name="solar:play-circle-bold-duotone" class="text-5xl text-white" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Date and Author -->
      <div class="flex items-center gap-3 text-sm text-gray-500 mb-3">
        <div class="flex items-center gap-2">
          <Icon name="solar:calendar-bold-duotone" class="text-base" />
          <time :datetime="post.publishedAt">
            {{ formatDate(post.publishedAt) }}
          </time>
        </div>
        <span v-if="post.author" class="flex items-center gap-2">
          <Icon name="solar:user-bold-duotone" class="text-base" />
          {{ post.author }}
        </span>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
        {{ post.title }}
      </h2>

      <!-- Content -->
      <div
        class="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3"
        v-html="post.content"
      />

      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
        <a-tag
          v-for="tag in post.tags"
          :key="tag"
          color="purple"
          class="!m-0"
        >
          {{ tag }}
        </a-tag>
      </div>
    </div>
  </article>
</template>
