<script lang="ts" setup>
import type { CourseAsset } from '~/composables/api/useAssetApi'
import { notification } from 'ant-design-vue'
import { useCourseApi } from '@/composables/api/useCourseApi'
import ResourceCheckoutCard from '~/components/course/ResourceCheckoutCard.vue'
import ResourceItem from '~/components/learning/ResourceItem.vue'
import { useAssetApi } from '~/composables/api/useAssetApi'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.id as string)
const { getDetailCourses, getPricePlans } = useCourseApi()
const { getAssets } = useAssetApi()

// Use useLazyAsyncData for better data fetching
const { data: currentCourse, pending: isLoading, error: fetchError, refresh: retryFetch } = useLazyAsyncData(
  `course-${courseId.value}`,
  async () => {
    try {
      const response = await getDetailCourses(courseId.value)

      if (!response) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Course not found',
        })
      }

      return response
    }
    catch (error: any) {
      console.error('Error loading course:', error)
      // throw createError({
      //   statusCode: error.statusCode || 500,
      //   statusMessage: error.statusMessage || 'Failed to load course details',
      // })
    }
  },
  {
    default: () => null,
    server: true, // Fetch on server-side for better SEO
    watch: [courseId], // Watch for courseId changes
  },
)

// Pagination state for resources
const currentPage = ref(1)
const pageSize = ref(10)
const allResources = ref<CourseAsset[]>([])
const resourcesData = ref<{ count: number, next: string | null, previous: string | null } | null>(null)
const isLoadingMore = ref(false)

// Fetch resources/assets for course
const { data: initialResourcesData, pending: isLoadingResources } = useLazyAsyncData(
  `resources-${courseId.value}`,
  async () => {
    try {
      const response = await getAssets(courseId.value, {
        ordering: 'order',
        page: 1,
        limit: pageSize.value,
      })
      return response
    }
    catch (error: any) {
      console.error('Error loading resources:', error)
      return { count: 0, results: [], next: null, previous: null }
    }
  },
  {
    default: () => ({ count: 0, results: [], next: null, previous: null }),
    server: true,
    watch: [courseId],
  },
)

// Watch for initial data changes
watch(initialResourcesData, (data) => {
  if (data) {
    allResources.value = data.results || []
    resourcesData.value = {
      count: data.count || 0,
      next: data.next,
      previous: data.previous,
    }
    currentPage.value = 1
  }
}, { immediate: true })

// Computed for resources
const resources = computed(() => allResources.value)

// Check if there are more pages
const hasMore = computed(() => !!resourcesData.value?.next)

// Check if course is resource type
const isResourceCourse = computed(() => currentCourse.value?.course_type === 'resource')

// Price plans for resource courses
const pricePlans = ref<any[]>([])
const isLoadingPricePlans = ref(false)

// Fetch price plans if course is resource type
const { data: pricePlansData } = useLazyAsyncData(
  `price-plans-${courseId.value}`,
  async () => {
    if (!isResourceCourse.value) {
      return null
    }
    try {
      isLoadingPricePlans.value = true
      const response = await getPricePlans(courseId.value)
      if (response && typeof response === 'object' && 'results' in response) {
        return (response as any).results || []
      }
      return Array.isArray(response) ? response : []
    }
    catch (error: any) {
      console.error('Error loading price plans:', error)
      return []
    }
    finally {
      isLoadingPricePlans.value = false
    }
  },
  {
    default: () => [],
    server: false, // Fetch client-side only
    watch: [courseId, isResourceCourse],
  },
)

// Watch price plans data
watch(pricePlansData, (data) => {
  if (data) {
    pricePlans.value = data
  }
}, { immediate: true })

// Load more resources
async function loadMoreResources() {
  if (!hasMore.value || isLoadingMore.value)
    return

  try {
    isLoadingMore.value = true
    currentPage.value += 1

    const response = await getAssets(courseId.value, {
      ordering: 'order',
      page: currentPage.value,
      limit: pageSize.value,
    })

    if (response.results && response.results.length > 0) {
      allResources.value = [...allResources.value, ...response.results]
      resourcesData.value = {
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
      }
    }
  }
  catch (error: any) {
    console.error('Error loading more resources:', error)
    notification.error({
      message: t('courseDetail.resources.loadMoreFailed'),
      description: error?.data?.message || t('courseDetail.resources.loadMoreFailedDescription'),
    })
  }
  finally {
    isLoadingMore.value = false
  }
}

// Get asset type info
function getAssetTypeInfo(type: string) {
  const typeMap: Record<string, { icon: string, color: string, label: string }> = {
    video: { icon: 'solar:videocamera-record-bold', color: 'text-red-600', label: 'Video' },
    pdf: { icon: 'solar:document-text-bold', color: 'text-red-600', label: 'PDF' },
    doc: { icon: 'solar:document-bold', color: 'text-blue-600', label: 'Document' },
    ppt: { icon: 'solar:presentation-graph-bold', color: 'text-orange-600', label: 'PowerPoint' },
    zip: { icon: 'solar:archive-bold', color: 'text-purple-600', label: 'ZIP' },
    image: { icon: 'solar:gallery-bold', color: 'text-green-600', label: 'Image' },
    audio: { icon: 'solar:music-note-bold', color: 'text-pink-600', label: 'Audio' },
    other: { icon: 'solar:file-bold', color: 'text-gray-600', label: 'Other' },
  }
  return typeMap[type] || typeMap.other
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const isLoadingAll = computed(() => isLoading.value || isLoadingResources.value)

// Watch for errors and show notifications
watch(fetchError, (error) => {
  if (error) {
    notification.error({
      message: t('courseDetail.notifications.loadFailed'),
      description: error.statusMessage || t('courseDetail.notifications.courseNotFound'),
    })
  }
})
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading State -->
    <div v-if="isLoadingAll" class="flex justify-center items-center min-h-[400px]">
      <a-spin size="large">
        <div class="content">
          <p class="text-gray-500">
            {{ $t('courseDetail.loading') }}
          </p>
        </div>
      </a-spin>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon name="solar:danger-circle-bold" class="text-6xl text-red-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('courseDetail.error.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ fetchError.statusMessage || $t('courseDetail.error.description') }}
        </p>
        <div class="flex gap-4 justify-center">
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="() => retryFetch()"
          >
            <Icon name="solar:refresh-bold" class="mr-2" />
            {{ $t('courseDetail.error.tryAgain') }}
          </button>
          <NuxtLink to="/learning" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Icon name="solar:arrow-left-bold" class="mr-2" />
            {{ $t('courseDetail.error.backToCourses') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Course Not Found -->
    <div v-else-if="!currentCourse" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="text-center">
        <Icon name="solar:document-text-bold" class="text-6xl text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('courseDetail.notFound.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ $t('courseDetail.notFound.description') }}
        </p>
        <NuxtLink to="/learning" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Icon name="solar:arrow-left-bold" class="mr-2" />
          {{ $t('courseDetail.notFound.backToCourses') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Course Content -->
    <div v-else class="flex flex-col lg:flex-row items-start gap-12">
      <div class="lg:w-[65%] w-full">
        <course-description-course
          class="w-full"
          :course-data="currentCourse"
        />

        <!-- Resources Section - Below Curriculum -->
        <div class="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div class="mt-10">
            <div class="mx-8 line border-1 border-[#E2E8F0] mb-6" />
            <div class="px-8 flex flex-col gap-3">
              <h1 class="font-bold text-2xl !mb-0 flex items-center gap-3">
                <Icon name="solar:document-text-bold" size="28" class="text-blue-600" />
                {{ $t('courseDetail.resources.title') }}
              </h1>

              <!-- Loading State -->
              <div v-if="isLoadingResources" class="flex justify-center items-center py-12">
                <a-spin size="large" />
              </div>

              <!-- Resources List -->
              <div v-else-if="resources.length > 0" class="space-y-3">
                <ResourceItem
                  v-for="resource in resources"
                  :key="resource.id"
                  :resource="resource"
                  :is-openable="false"
                />

                <!-- Load More Button -->
                <div v-if="hasMore" class="flex justify-center pt-4">
                  <a-button
                    type="default"
                    size="large"
                    :loading="isLoadingMore"
                    class="!flex items-center gap-2"
                    @click="loadMoreResources"
                  >
                    <Icon name="solar:download-bold" size="16" />
                    {{ $t('courseDetail.resources.loadMore') }}
                  </a-button>
                </div>

                <!-- Loading More State -->
                <div v-if="isLoadingMore" class="flex justify-center items-center py-4">
                  <a-spin size="small" />
                  <span class="ml-2 text-sm text-gray-500">{{ $t('courseDetail.resources.loadingMore') }}</span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="resources.length === 0 && !isLoadingResources" class="text-center dd py-12">
                <Icon name="solar:document-text-bold-duotone" size="48" class="text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">
                  {{ $t('courseDetail.resources.empty') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-8 lg:pr-8 w-full lg:w-[35%] md:pr-4 md:pl-4">
        <course-checkout-card
          v-if="!isResourceCourse"
          class="w-full"
          :course-data="currentCourse"
        />
        <ResourceCheckoutCard
          v-else
          class="w-full"
          :course-data="currentCourse"
          :price-plans="pricePlans"
          :loading="isLoadingPricePlans"
        />
      </div>
    </div>
  </div>
</template>
