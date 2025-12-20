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

// Mock data - Replace with API call later
const videoPosts = ref<VideoPost[]>([
  {
    id: '1',
    title: 'Học tiếng Ý cơ bản - Bài 1: Chào hỏi và giới thiệu',
    content: '<p>Trong video này, chúng ta sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Ý. Đây là bài học đầu tiên trong series học tiếng Ý cơ bản.</p>',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishedAt: '2025-01-15T10:00:00Z',
    author: 'Giáo viên Maria',
  },
  {
    id: '2',
    title: 'Ngữ pháp tiếng Ý: Động từ essere và avere',
    content: '<p>Học cách sử dụng hai động từ quan trọng nhất trong tiếng Ý: essere (là) và avere (có). Chúng ta sẽ xem các ví dụ thực tế và cách áp dụng trong giao tiếp hàng ngày.</p>',
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
])

const loading = ref(false)
const searchQuery = ref('')

// Filter posts by search query
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) {
    return videoPosts.value
  }
  const query = searchQuery.value.toLowerCase()
  return videoPosts.value.filter(post =>
    post.title.toLowerCase().includes(query)
    || post.content.toLowerCase().includes(query)
    || post.author?.toLowerCase().includes(query),
  )
})

// Sort posts by date (newest first)
const sortedPosts = computed(() => {
  return [...filteredPosts.value].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
})

useHead({
  title: 'Video Blog - Học tiếng Ý qua video',
  meta: [
    {
      name: 'description',
      content: 'Xem các video bài học tiếng Ý với nội dung phong phú, từ ngữ pháp đến văn hóa, giúp bạn học tiếng Ý hiệu quả.',
    },
  ],
})
</script>

<template>
  <div class="video-blog-page min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-white border-b border-gray-200 py-6 sm:py-8">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <Icon name="solar:video-frame-play-vertical-bold-duotone" class="text-3xl sm:text-4xl text-blue-600" />
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
                Video Blog
              </h1>
              <p class="text-sm sm:text-base text-gray-600 mt-1">
                Học tiếng Ý qua các video bài học chất lượng
              </p>
            </div>
          </div>
          <!-- Search Bar -->
          <div class="sm:max-w-xs">
            <div class="relative">
              <Icon
                name="solar:magnifer-bold"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm video..."
                class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-2xl shadow-md animate-pulse"
        >
          <div class="aspect-video bg-gray-200" />
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4" />
            <div class="h-4 bg-gray-200 rounded w-1/2" />
            <div class="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="sortedPosts.length === 0"
        class="text-center py-16"
      >
        <Icon name="solar:video-frame-play-vertical-bold-duotone" class="text-6xl text-gray-300 mb-4 mx-auto" />
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy video nào
        </h3>
        <p class="text-gray-600 mb-6">
          Thử tìm kiếm với từ khóa khác
        </p>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          @click="searchQuery = ''"
        >
          Xóa bộ lọc
        </button>
      </div>

      <!-- Video Posts Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="post in sortedPosts"
          :key="post.id"
          :to="`/video/${post.id}`"
          class="block"
        >
          <VideoPostCard :post="post" />
        </NuxtLink>
      </div>

      <!-- Load More Button (if needed) -->
      <div
        v-if="sortedPosts.length > 0 && sortedPosts.length >= 6"
        class="mt-12 text-center"
      >
        <button
          class="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Xem thêm video
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-blog-page {
  min-height: 100vh;
}
</style>
