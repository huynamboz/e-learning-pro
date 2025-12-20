<script setup lang="ts">
import type { VideoPost as ApiVideoPost } from '~/composables/api/useVideoBlogApi'
import { VideoPlayer } from '@videojs-player/vue'
import VideoPostCard from '~/components/video/VideoPostCard.vue'
import { useVideoBlogApi } from '~/composables/api/useVideoBlogApi'
import 'video.js/dist/video-js.css'

interface VideoPost {
  id: string
  title: string
  content: string
  videoUrl: string | null
  thumbnail?: string | null
  publishedAt: string
  author?: string
  hasAccess?: boolean
  tags?: string[]
}

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const { getPost, getRelatedPosts } = useVideoBlogApi()
const postId = computed(() => route.params.id as string)

const loading = ref(false)
const error = ref<string | null>(null)
const currentPost = ref<VideoPost | null>(null)
const relatedPosts = ref<VideoPost[]>([])

// Video player instance
const playerInstance = ref<any>(null)
const drmContainer = ref<HTMLElement | null>(null)

// Video player options (same as learning page)
const videoPlayerOptions = {
  controls: true,
  preload: 'auto',
  autoplay: false,
  responsive: true,
  fluid: true,
  controlBar: {
    pictureInPictureToggle: false,
    remainingTimeDisplay: false,
    playToggle: true,
    progressControl: true,
    fullscreenToggle: true,
    currentTimeDisplay: true,
    volumePanel: {
      inline: false,
    },
  },
  html5: {
    nativeTextTracks: false,
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
}

// DRM protection functions
function preventContextMenu(event: MouseEvent) {
  if (!drmContainer.value) {
    return
  }
  const target = event.target as HTMLElement | null
  if (target && drmContainer.value.contains(target)) {
    event.preventDefault()
  }
}

function preventKeydown(event: KeyboardEvent) {
  const blockedByModifier = (event.ctrlKey || event.metaKey)
  if (blockedByModifier && ['s', 'S', 'p', 'P', 'u', 'U'].includes(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (blockedByModifier && event.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (event.key === 'F12') {
    event.preventDefault()
    event.stopPropagation()
  }
}

function applyDrmAttributes(player: any) {
  if (!player) {
    return
  }
  const videoEl = player?.el?.()?.querySelector?.('video') as HTMLVideoElement | null
  if (videoEl) {
    videoEl.setAttribute('controlsList', 'nodownload noremoteplayback')
    videoEl.setAttribute('disablePictureInPicture', 'true')
    videoEl.setAttribute('playsinline', 'true')
    videoEl.setAttribute('webkit-playsinline', 'true')
    videoEl.oncontextmenu = (event) => {
      event.preventDefault()
    }
  }
}

function handlePlayerReady(player: any) {
  playerInstance.value = player
  applyDrmAttributes(player)
}

// Map API response to component format
function mapApiPostToComponent(apiPost: ApiVideoPost): VideoPost {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    videoUrl: apiPost.video_url,
    thumbnail: apiPost.thumbnail || undefined,
    publishedAt: apiPost.published_at || apiPost.created_at,
    author: apiPost.author || undefined,
    hasAccess: apiPost.has_access,
    tags: apiPost.tags || undefined,
  }
}

// Load post detail
async function loadPost() {
  try {
    loading.value = true
    error.value = null

    const post = await getPost(postId.value)
    currentPost.value = mapApiPostToComponent(post)

    // Load related posts (limit: 3, max: 10)
    try {
      const relatedResponse = await getRelatedPosts(postId.value, 3)
      if (relatedResponse?.results) {
        relatedPosts.value = relatedResponse.results
          .filter(p => p.id !== postId.value) // Exclude current post
          .map(mapApiPostToComponent)
      }
    }
    catch (relatedErr) {
      console.warn('Failed to load related posts:', relatedErr)
      relatedPosts.value = []
    }
  }
  catch (err: any) {
    console.error('Error loading video post:', err)
    if (err?.status === 404 || err?.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Video post not found',
      })
    }
    error.value = err?.message || 'Không thể tải video. Vui lòng thử lại sau.'
  }
  finally {
    loading.value = false
  }
}

// Format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  catch {
    return dateString
  }
}

// Get thumbnail URL with fallback
const thumbnailUrl = computed(() => {
  if (!currentPost.value)
    return '/images/course-thumbnail-default.webp'
  return currentPost.value.thumbnail || '/images/course-thumbnail-default.webp'
})

// SEO
useHead({
  title: () => currentPost.value ? `${currentPost.value.title} - Video Blog` : 'Video Blog',
  meta: [
    {
      name: 'description',
      content: () => currentPost.value?.content.replace(/<[^>]*>/g, '').substring(0, 160) || 'Video Blog',
    },
  ],
})

// Load post on mount
onMounted(() => {
  loadPost()
  drmContainer.value = document.querySelector('.drm-protected')
  document.addEventListener('contextmenu', preventContextMenu)
  document.addEventListener('keydown', preventKeydown)
})

// Reload when route changes
watch(() => postId.value, () => {
  if (postId.value) {
    loadPost()
    nextTick(() => {
      if (playerInstance.value) {
        applyDrmAttributes(playerInstance.value)
      }
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('contextmenu', preventContextMenu)
  document.removeEventListener('keydown', preventKeydown)

  if (playerInstance.value?.dispose) {
    playerInstance.value.dispose()
  }
})
</script>

<template>
  <div class="video-detail-page min-h-screen bg-gray-50">
    <!-- Back Button -->
    <div class="bg-white border-b border-gray-200 py-4">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          @click="router.push('/video')"
        >
          <Icon name="solar:arrow-left-bold" class="text-xl" />
          <span class="font-medium">Quay lại danh sách video</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-center min-h-[400px]">
        <a-spin size="large" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-2xl mx-auto text-center">
        <a-alert
          :message="error"
          type="error"
          show-icon
          closable
          class="mb-6"
          @close="error = null"
        />
        <a-button type="primary" @click="loadPost">
          Thử lại
        </a-button>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="currentPost" class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Video Player / Access Control -->
        <div class="mb-8">
          <div ref="drmContainer" class="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-lg drm-protected" @contextmenu.prevent>
            <!-- Video Player (if has access) -->
            <VideoPlayer
              v-if="currentPost.videoUrl && currentPost.hasAccess"
              :poster="thumbnailUrl"
              :options="videoPlayerOptions"
              :width="400"
              :height="225"
              class="rounded-2xl overflow-hidden"
              :src="currentPost.videoUrl"
              controls
              :loop="false"
              :volume="0.6"
              playsinline
              @mounted="handlePlayerReady"
            />

            <!-- No Access Message -->
            <div
              v-else-if="!currentPost.hasAccess"
              class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8"
            >
              <Icon name="solar:lock-password-bold-duotone" class="text-6xl mb-4 text-purple-400" />
              <h3 class="text-2xl font-bold mb-2">
                Video này yêu cầu quyền truy cập
              </h3>
              <p class="text-gray-300 text-center max-w-md mb-6">
                Để xem video này, bạn cần mua ít nhất một khóa học (course hoặc resource) trên hệ thống.
              </p>
              <a-button
                type="primary"
                size="large"
                class="!flex !justify-center !items-center !gap-1"
                @click="router.push('/courses')"
              >
                <Icon name="solar:shop-bold" size="18" />
                Xem các khóa học
              </a-button>
            </div>

            <!-- Thumbnail Placeholder (if no video URL) -->
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-gray-900"
            >
              <img
                :src="thumbnailUrl"
                :alt="currentPost.title"
                class="w-full h-full object-cover opacity-50"
              >
              <div class="absolute inset-0 flex items-center justify-center">
                <Icon name="solar:play-circle-bold-duotone" class="text-6xl text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Post Info -->
        <article class="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
          <!-- Date and Author -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div class="flex items-center gap-2">
              <Icon name="solar:calendar-bold-duotone" class="text-base" />
              <time :datetime="currentPost.publishedAt">
                {{ formatDate(currentPost.publishedAt) }}
              </time>
            </div>
            <span v-if="currentPost.author" class="flex items-center gap-2">
              <Icon name="solar:user-bold-duotone" class="text-base" />
              {{ currentPost.author }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {{ currentPost.title }}
          </h1>

          <!-- Tags -->
          <div v-if="currentPost.tags && currentPost.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
            <a-tag
              v-for="tag in currentPost.tags"
              :key="tag"
              color="purple"
              class="!m-0"
            >
              {{ tag }}
            </a-tag>
          </div>

          <!-- Content -->
          <div
            class="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            v-html="currentPost.content"
          />
        </article>

        <!-- Related Posts -->
        <div v-if="relatedPosts.length > 0" class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Video liên quan
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="post in relatedPosts"
              :key="post.id"
              :to="`/video/${post.id}`"
              class="block"
            >
              <VideoPostCard
                :post="{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  videoUrl: post.videoUrl,
                  thumbnail: post.thumbnail,
                  publishedAt: post.publishedAt,
                  author: post.author,
                  tags: post.tags,
                }"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-detail-page {
  min-height: 100vh;
}

.prose {
  color: #374151;
}

.prose p {
  margin-bottom: 1.25em;
  line-height: 1.75;
}

.prose p:last-child {
  margin-bottom: 0;
}

/* DRM Protection Styles */
.drm-protected video::-webkit-media-controls-enclosure {
  overflow: hidden;
}

.drm-protected video::-webkit-media-controls-download-button,
.drm-protected video::-webkit-media-controls-remote-playback-button {
  display: none !important;
}

.drm-protected video {
  pointer-events: auto;
}
</style>
