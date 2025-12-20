<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { Ref } from 'vue'
import type { VideoPost } from '~/composables/api/useVideoBlogApi'
import { useDebounceFn } from '@vueuse/core'
import { Modal, notification } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useVideoBlogApi } from '~/composables/api/useVideoBlogApi'

const { t } = useI18n()
const router = useRouter()
const { getPosts, deletePost, publishPost, unpublishPost } = useVideoBlogApi()

// State management
const loading = ref(false)
const searchText = ref('')
const selectedStatus = ref<string>('all')
const posts = ref<VideoPost[]>([])
const totalCount = ref(0)
const currentPage: Ref<number> = ref(1)
const pageSize: Ref<number> = ref(10)
const hasNext = ref(false)
const hasPrevious = ref(false)

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

// Load posts
async function loadPosts() {
  try {
    loading.value = true

    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value,
      ordering: '-created_at',
    }

    if (selectedStatus.value !== 'all') {
      params.is_published = selectedStatus.value === 'published'
    }

    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }

    const response = await getPosts(params)

    if (response) {
      posts.value = response.results || []
      totalCount.value = response.count || 0
      hasNext.value = !!response.next
      hasPrevious.value = !!response.previous
    }
  }
  catch (error) {
    console.error('Error loading posts:', error)
    notification.error({ message: t('admin.videoPosts.error.loadError') })
  }
  finally {
    loading.value = false
  }
}

// Load posts on mount
onMounted(() => {
  loadPosts()
})

// Watch for all changes and reload data
watch([searchText, selectedStatus, currentPage, pageSize], () => {
  loadPosts()
})

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadPosts()
}, 500)

watch(searchText, () => {
  debouncedSearch()
})

// Status options
const statusOptions = computed(() => [
  { label: t('admin.videoPosts.filters.allStatus'), value: 'all' },
  { label: t('admin.videoPosts.filters.published'), value: 'published' },
  { label: t('admin.videoPosts.filters.unpublished'), value: 'unpublished' },
])

// Pagination configuration
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: totalCount.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} ${t('admin.videoPosts.stats.totalPosts').toLowerCase()}`,
  onChange: (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
  },
  onShowSizeChange: (current: number, size: number) => {
    currentPage.value = 1
    pageSize.value = size
  },
}))

// Statistics
const stats = computed(() => {
  const totalPosts = totalCount.value
  const publishedPosts = posts.value.filter(post => post.is_published).length
  const unpublishedPosts = posts.value.filter(post => !post.is_published).length
  const totalViews = posts.value.reduce((sum, post) => sum + post.view_count, 0)

  return {
    totalPosts,
    publishedPosts,
    unpublishedPosts,
    totalViews,
  }
})

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date short
function formatDateShort(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Handle actions
function handleCreatePost() {
  router.push('/admin/video-posts/create')
}

function handleEditPost(post: VideoPost) {
  router.push(`/admin/video-posts/${post.id}/edit`)
}

async function handleDeletePost(post: VideoPost) {
  Modal.confirm({
    title: t('admin.videoPosts.actions.deleteConfirm.title'),
    content: t('admin.videoPosts.actions.deleteConfirm.message', { title: post.title }),
    okText: t('admin.videoPosts.actions.deleteConfirm.confirm'),
    cancelText: t('admin.videoPosts.actions.deleteConfirm.cancel'),
    okType: 'danger',
    onOk: async () => {
      try {
        await deletePost(post.id)
        notification.success({ message: t('admin.videoPosts.messages.deleteSuccess', { title: post.title }) })
        await loadPosts()
      }
      catch (error) {
        console.error('Error deleting post:', error)
        notification.error({ message: t('admin.videoPosts.messages.deleteError') })
      }
    },
  })
}

async function handleTogglePublish(post: VideoPost) {
  try {
    if (post.is_published) {
      await unpublishPost(post.id)
      notification.success({ message: t('admin.videoPosts.messages.unpublishSuccess', { title: post.title }) })
    }
    else {
      await publishPost(post.id)
      notification.success({ message: t('admin.videoPosts.messages.publishSuccess', { title: post.title }) })
    }
    await loadPosts()
  }
  catch (error) {
    console.error('Error toggling publish:', error)
    notification.error({ message: t('admin.videoPosts.messages.togglePublishError') })
  }
}

// Refresh data
async function handleRefresh() {
  await loadPosts()
  notification.success({ message: t('admin.videoPosts.messages.refreshSuccess') })
}

// Table columns
const columns = computed((): TableColumnsType<VideoPost> => [
  {
    title: t('admin.videoPosts.table.columns.title'),
    key: 'title',
    width: 300,
    fixed: 'left',
  },
  {
    title: t('admin.videoPosts.table.columns.author'),
    key: 'author',
    width: 150,
  },
  {
    title: t('admin.videoPosts.table.columns.status'),
    key: 'status',
    width: 120,
  },
  {
    title: t('admin.videoPosts.table.columns.publishedAt'),
    key: 'published_at',
    width: 180,
  },
  {
    title: t('admin.videoPosts.table.columns.createdAt'),
    key: 'created_at',
    width: 180,
    sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  },
  {
    title: t('admin.videoPosts.table.columns.actions'),
    key: 'actions',
    width: 150,
    fixed: 'right',
  },
])
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 pt-0 max-md:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Icon name="solar:video-frame-play-vertical-bold" size="28" class="text-white" />
            </div>
            {{ $t('admin.videoPosts.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ $t('admin.videoPosts.description') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a-button
            type="primary"
            size="large"
            class="!flex !items-center !justify-center !gap-1"
            @click="handleCreatePost"
          >
            <Icon name="solar:add-circle-bold" size="18" />
            {{ $t('admin.videoPosts.actions.create') }}
          </a-button>
          <a-button
            class="rounded-lg gap-1 text-sm !font-semibold !flex !justify-center !items-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
            @click="handleRefresh"
          >
            <Icon name="solar:refresh-bold" size="18" />
            {{ $t('admin.videoPosts.actions.refresh') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Posts -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-blue-50 rounded-lg size-12">
            <Icon name="solar:video-frame-play-vertical-bold" size="24" class="text-blue-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.totalPosts }}
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('admin.videoPosts.stats.totalPosts') }}
        </div>
      </div>

      <!-- Published Posts -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-green-50 rounded-lg size-12">
            <Icon name="solar:check-circle-bold" size="24" class="text-green-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.publishedPosts }}
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('admin.videoPosts.stats.publishedPosts') }}
        </div>
      </div>

      <!-- Unpublished Posts -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-orange-50 rounded-lg size-12">
            <Icon name="solar:clock-circle-bold" size="24" class="text-orange-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.unpublishedPosts }}
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('admin.videoPosts.stats.unpublishedPosts') }}
        </div>
      </div>

      <!-- Total Views -->
      <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="p-3 bg-purple-50 rounded-lg size-12">
            <Icon name="solar:eye-bold" size="24" class="text-purple-600" />
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-1">
          {{ stats.totalViews.toLocaleString() }}
        </div>
        <div class="text-sm text-gray-600">
          {{ $t('admin.videoPosts.stats.totalViews') }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search -->
        <a-input
          v-model:value="searchText"
          :placeholder="$t('admin.videoPosts.filters.searchPlaceholder')"
          size="large"
          allow-clear
        >
          <template #prefix>
            <Icon name="solar:magnifer-linear" size="18" class="text-gray-400" />
          </template>
        </a-input>

        <!-- Status Filter -->
        <a-select
          v-model:value="selectedStatus"
          size="large"
          :placeholder="$t('admin.videoPosts.filters.statusFilter')"
          style="width: 100%"
        >
          <a-select-option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- Posts Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="posts"
        :loading="loading"
        :pagination="paginationConfig"
        :scroll="{ x: 1200 }"
        row-key="id"
        class="custom-table"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:video-frame-play-vertical-bold" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ $t('admin.videoPosts.table.emptyState.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ $t('admin.videoPosts.table.emptyState.description') }}
            </p>
          </div>
        </template>

        <!-- Title Column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <div class="flex items-center gap-3">
              <img
                v-if="record.thumbnail"
                :src="record.thumbnail"
                :alt="record.title"
                class="w-16 h-12 object-cover rounded-lg"
              >
              <div
                v-else
                class="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <Icon name="solar:video-frame-play-vertical-bold" size="20" class="text-gray-400" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-900 truncate">
                  {{ record.title }}
                </div>
                <div v-if="record.tags && record.tags.length > 0" class="flex gap-1 mt-1 flex-wrap">
                  <a-tag
                    v-for="tag in record.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="text-xs"
                  >
                    {{ tag }}
                  </a-tag>
                </div>
              </div>
            </div>
          </template>

          <!-- Author Column -->
          <template v-else-if="column.key === 'author'">
            <div class="text-gray-900">
              {{ record.author || $t('admin.videoPosts.table.noAuthor') }}
            </div>
          </template>

          <!-- Status Column -->
          <template v-else-if="column.key === 'status'">
            <a-tag
              :color="record.is_published ? 'green' : 'orange'"
              class="font-medium"
            >
              {{ record.is_published ? $t('admin.videoPosts.table.status.published') : $t('admin.videoPosts.table.status.unpublished') }}
            </a-tag>
          </template>

          <!-- Published At Column -->
          <template v-else-if="column.key === 'published_at'">
            <div class="text-gray-600">
              {{ record.published_at ? formatDateShort(record.published_at) : '-' }}
            </div>
          </template>

          <!-- Created At Column -->
          <template v-else-if="column.key === 'created_at'">
            <div class="text-gray-600">
              {{ formatDate(record.created_at) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <div class="flex items-center gap-2">
              <a-button
                type="text"
                size="small"
                class="!flex !items-center !justify-center !gap-1"
                @click="handleEditPost(record)"
              >
                <Icon name="solar:pen-bold" size="16" />
              </a-button>
              <a-switch
                :checked="record.is_published"
                size="small"
                @change="() => handleTogglePublish(record)"
              />
              <a-button
                type="text"
                danger
                size="small"
                class="!flex !items-center !justify-center !gap-1"
                @click="handleDeletePost(record)"
              >
                <Icon name="solar:trash-bin-trash-bold" size="16" />
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
.custom-table :deep(.ant-table-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}
</style>
