<script setup lang="ts">
import VideoPostCard from '~/components/video/VideoPostCard.vue'

interface VideoPost {
  id: string
  title: string
  content: string
  videoUrl: string
  thumbnail?: string
  publishedAt: string
  author?: string
}

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const postId = computed(() => route.params.id as string)

// Mock data - Same as in video.vue, replace with API call later
const allPosts: VideoPost[] = [
  {
    id: '1',
    title: 'Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu',
    content: '<p>Trong video này, chúng ta sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Ý. Đây là bài học đầu tiên trong series học tiếng Ý cơ bản.</p><p>Chúng ta sẽ bắt đầu với những câu chào hỏi cơ bản như "Ciao", "Buongiorno", "Buonasera" và cách sử dụng chúng trong các tình huống khác nhau. Sau đó, chúng ta sẽ học cách giới thiệu tên, tuổi, quốc tịch và nghề nghiệp của mình.</p><p>Video này phù hợp cho người mới bắt đầu học tiếng Ý và muốn có nền tảng vững chắc để tiếp tục học các bài học nâng cao hơn.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-15T10:00:00Z',
    author: 'Giáo viên Maria',
  },
  {
    id: '2',
    title: 'Ngữ pháp tiếng Ý: Động từ essere và avere',
    content: '<p>Học cách sử dụng hai động từ quan trọng nhất trong tiếng Ý: essere (là) và avere (có). Chúng ta sẽ xem các ví dụ thực tế và cách áp dụng trong giao tiếp hàng ngày.</p><p>Động từ essere và avere là nền tảng của ngữ pháp tiếng Ý. Chúng được sử dụng rất thường xuyên và có nhiều cách chia khác nhau tùy theo chủ ngữ.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-14T14:30:00Z',
    author: 'Giáo viên Luca',
  },
  {
    id: '3',
    title: 'Văn hóa Ý: Phong tục và truyền thống',
    content: '<p>Khám phá những nét đẹp văn hóa của nước Ý, từ ẩm thực đến lễ hội, giúp bạn hiểu sâu hơn về đất nước và con người Ý.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-13T09:15:00Z',
    author: 'Giáo viên Sofia',
  },
  {
    id: '4',
    title: 'Luyện phát âm tiếng Ý: Nguyên âm và phụ âm',
    content: '<p>Hướng dẫn chi tiết cách phát âm đúng các nguyên âm và phụ âm trong tiếng Ý, với các bài tập thực hành để cải thiện kỹ năng phát âm của bạn.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-12T16:45:00Z',
    author: 'Giáo viên Marco',
  },
  {
    id: '5',
    title: 'Từ vựng tiếng Ý: Chủ đề gia đình',
    content: '<p>Học các từ vựng liên quan đến gia đình trong tiếng Ý, bao gồm các thành viên trong gia đình và cách sử dụng chúng trong câu.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-11T11:20:00Z',
    author: 'Giáo viên Elena',
  },
  {
    id: '6',
    title: 'Giao tiếp tiếng Ý: Tại nhà hàng',
    content: '<p>Học cách giao tiếp khi đi ăn tại nhà hàng Ý, từ cách đặt bàn, gọi món đến thanh toán. Các tình huống thực tế và mẫu câu hữu ích.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-10T13:00:00Z',
    author: 'Giáo viên Antonio',
  },
]

// Find current post
const currentPost = computed(() => {
  return allPosts.find(post => post.id === postId.value)
})

// Related posts (exclude current post)
const relatedPosts = computed(() => {
  return allPosts
    .filter(post => post.id !== postId.value)
    .slice(0, 3)
})

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

// Get video embed URL
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
  return url
}

const embedUrl = computed(() => {
  if (!currentPost.value)
    return ''
  return getVideoEmbedUrl(currentPost.value.videoUrl)
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

// Handle not found
watchEffect(() => {
  if (!currentPost.value && postId.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video post not found',
    })
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
    <div v-if="!currentPost" class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-center min-h-[400px]">
        <a-spin size="large" />
      </div>
    </div>

    <!-- Post Content -->
    <div v-else class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Video Player -->
        <div class="mb-8">
          <div class="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
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
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            {{ currentPost.title }}
          </h1>

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
              <VideoPostCard :post="post" />
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
</style>
