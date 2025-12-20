<script setup lang="ts">
interface VideoPost {
  id: string
  title: string
  content: string
  videoUrl: string
  thumbnail?: string
  publishedAt: string
  author?: string
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

// Get video ID from URL (support YouTube, Vimeo, etc.)
function getVideoEmbedUrl(url: string): string {
  // YouTube
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`
    }
  }
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`
    }
  }
  // Return original URL if not recognized
  return url
}

const embedUrl = computed(() => getVideoEmbedUrl(props.post.videoUrl))
</script>

<template>
  <article class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
    <!-- Video Container -->
    <div class="relative w-full aspect-video bg-gray-900 overflow-hidden">
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <Icon name="solar:play-circle-bold-duotone" class="text-6xl" />
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
        class="text-gray-600 text-sm leading-relaxed line-clamp-3"
        v-html="post.content"
      />
    </div>
  </article>
</template>
