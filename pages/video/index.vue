<script setup lang="ts">
import type { VideoPost as ApiVideoPost } from '~/composables/api/useVideoBlogApi'
import { useDebounceFn } from '@vueuse/core'
import VideoPostCard from '~/components/video/VideoPostCard.vue'
import { useVideoBlogApi } from '~/composables/api/useVideoBlogApi'

interface VideoPost {
  id: string
  title: string
  content: string
  videoUrl: string
  thumbnail?: string
  publishedAt: string
  author?: string
  tags?: string[]
}

definePageMeta({
  layout: 'auth',
})

const { getPosts } = useVideoBlogApi()
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const videoPosts = ref<VideoPost[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(false)

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
    tags: apiPost.tags || undefined,
  }
}

// Load posts from API
async function loadPosts() {
  try {
    loading.value = true
    error.value = null

    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      is_published: true,
      ordering: '-published_at,-created_at',
    }

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    const response = await getPosts(params)

    if (response) {
      const newPosts = response.results.map(mapApiPostToComponent)
      if (currentPage.value === 1) {
        videoPosts.value = newPosts
      }
      else {
        videoPosts.value = [...videoPosts.value, ...newPosts]
      }
      totalCount.value = response.count || 0
      hasMore.value = !!response.next
    }
  }
  catch (err: any) {
    console.error('Error loading video posts:', err)
    error.value = 'Không thể tải danh sách video. Vui lòng thử lại sau.'
    videoPosts.value = []
  }
  finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadPosts()
}, 500)

watch(searchQuery, () => {
  debouncedSearch()
})

// Load posts on mount
onMounted(() => {
  loadPosts()
})

// Filter posts by search query (client-side fallback if needed)
const filteredPosts = computed(() => {
  return videoPosts.value
})

// Sort posts by date (newest first) - already sorted by API
const sortedPosts = computed(() => {
  return filteredPosts.value
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
                Khám phá các video mới nhất về tiếng Ý
              </p>
            </div>
          </div>
          <!-- Search Bar -->
          <div class="sm:max-w-xs">
            <div class="relative">
              <Icon
                name="solar:magnifer-linear"
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
      <!-- Error State -->
      <div
        v-if="error && !loading"
        class="text-center py-16"
      >
        <Icon name="solar:danger-triangle-bold-duotone" class="text-6xl text-red-300 mb-4 mx-auto" />
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          Đã xảy ra lỗi
        </h3>
        <p class="text-gray-600 mb-6">
          {{ error }}
        </p>
        <button
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors !flex !justify-center !items-center !gap-1 mx-auto"
          @click="loadPosts"
        >
          <Icon name="solar:refresh-bold" size="18" />
          Thử lại
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          {{ searchQuery ? 'Không tìm thấy video nào' : 'Chưa có video nào' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hiện tại chưa có video nào được xuất bản.' }}
        </p>
        <button
          v-if="searchQuery"
          class="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors !flex !justify-center !items-center !gap-1 mx-auto"
          @click="searchQuery = ''"
        >
          <Icon name="solar:close-circle-bold" size="18" />
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
        v-if="sortedPosts.length > 0 && hasMore && !loading"
        class="mt-12 text-center"
      >
        <button
          class="px-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium !flex !justify-center !items-center !gap-1 mx-auto"
          @click="() => { currentPage++; loadPosts() }"
        >
          <Icon name="solar:arrow-down-bold" size="18" />
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
