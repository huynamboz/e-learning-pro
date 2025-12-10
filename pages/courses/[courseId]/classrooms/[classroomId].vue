<script lang="ts" setup>
import type { CourseAsset } from '~/composables/api/useAssetApi'
import { notification } from 'ant-design-vue'
import CheckoutCard from '~/components/course/CheckoutCard.vue'
import ResourceItem from '~/components/learning/ResourceItem.vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.courseId as string)
const classroomId = computed(() => route.params.classroomId as string)

const { getDetailCourses } = useCourseApi()
const { getAssets } = useAssetApi()

// Fetch course data
const { data: currentCourse, pending: isLoadingCourse, error: courseError, refresh: retryCourse } = useLazyAsyncData(
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
      throw error
    }
  },
  {
    default: () => null,
    server: true,
    watch: [courseId],
  },
)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const allResources = ref<CourseAsset[]>([])
const resourcesData = ref<{ count: number, next: string | null, previous: string | null } | null>(null)
const isLoadingMore = ref(false)

// Fetch resources/assets filtered by classroom
const { data: initialResourcesData, pending: isLoadingResources, error: resourcesError } = useLazyAsyncData(
  `resources-${courseId.value}-${classroomId.value}`,
  async () => {
    try {
      const response = await getAssets(courseId.value, {
        ordering: 'order',
        visible_classrooms: classroomId.value,
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
    watch: [courseId, classroomId],
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

// Load more resources
async function loadMoreResources() {
  if (!hasMore.value || isLoadingMore.value)
    return

  try {
    isLoadingMore.value = true
    currentPage.value += 1

    const response = await getAssets(courseId.value, {
      ordering: 'order',
      visible_classrooms: classroomId.value,
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
      message: t('classroomDetail.resources.loadMoreFailed'),
      description: error?.data?.message || t('classroomDetail.resources.loadMoreFailedDescription'),
    })
  }
  finally {
    isLoadingMore.value = false
  }
}

// Find classroom from course data
const currentClassroom = computed(() => {
  if (!currentCourse.value || !currentCourse.value.classrooms)
    return null

  return currentCourse.value.classrooms.find((c: any) => c.id === classroomId.value) || null
})

const isLoading = computed(() => isLoadingCourse.value || isLoadingResources.value)
const fetchError = computed(() => courseError.value || resourcesError.value)

// Watch for errors and show notifications
watch(fetchError, (error) => {
  if (error) {
    notification.error({
      message: t('classroomDetail.notifications.loadFailed'),
      description: error.statusMessage || t('classroomDetail.notifications.notFound'),
    })
  }
})

// Watch for classroom not found
watch([currentCourse, currentClassroom], ([course, classroom]) => {
  if (course && !classroom) {
    notification.error({
      message: t('classroomDetail.notifications.notFound'),
      description: t('classroomDetail.notFound.description'),
    })
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <a-spin size="large">
        <div class="content">
          <p class="text-gray-500">
            {{ $t('classroomDetail.loading') }}
          </p>
        </div>
      </a-spin>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div class="text-center max-w-md">
        <Icon name="solar:danger-circle-bold" class="text-6xl text-red-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('classroomDetail.error.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ fetchError.statusMessage || $t('classroomDetail.error.description') }}
        </p>
        <div class="flex gap-4 justify-center">
          <button
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="() => retryCourse()"
          >
            <Icon name="solar:refresh-bold" class="mr-2" />
            {{ $t('classroomDetail.error.tryAgain') }}
          </button>
          <NuxtLink to="/" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Icon name="solar:arrow-left-bold" class="mr-2" />
            {{ $t('classroomDetail.error.backToHome') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="currentCourse && currentClassroom" class="flex flex-col">
      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-200">
        <div class="px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex items-center gap-2 text-sm text-gray-600">
            <NuxtLink to="/" class="hover:text-green-600 transition-colors">
              {{ $t('classroomDetail.breadcrumb.home') }}
            </NuxtLink>
            <Icon name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
            <NuxtLink :to="`/courses/${courseId}`" class="hover:text-green-600 transition-colors">
              {{ currentCourse.title }}
            </NuxtLink>
            <Icon name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
            <span class="text-gray-900 font-medium">{{ currentClassroom.title }}</span>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row items-start gap-8">
          <!-- Left: Course Description -->
          <div class="lg:w-[65%] w-full">
            <!-- Course Description -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <course-description-course
                :course-data="currentCourse"
              />

              <!-- Resources Section - Below Curriculum -->
              <div class="mt-10">
                <div class="mx-8 line border-1 border-[#E2E8F0] mb-6" />
                <div class="px-8 flex flex-col gap-3">
                  <h1 class="font-bold text-2xl !mb-0 flex items-center gap-3">
                    <Icon name="solar:document-text-bold" size="28" class="text-blue-600" />
                    {{ $t('classroomDetail.resources.title') }}
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
                        {{ $t('classroomDetail.resources.loadMore') }}
                      </a-button>
                    </div>

                    <!-- Loading More State -->
                    <div v-if="isLoadingMore" class="flex justify-center items-center py-4">
                      <a-spin size="small" />
                      <span class="ml-2 text-sm text-gray-500">{{ $t('classroomDetail.resources.loadingMore') }}</span>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="resources.length === 0 && !isLoadingResources" class="text-center py-12">
                    <Icon name="solar:document-text-bold-duotone" size="48" class="text-gray-300 mx-auto mb-4" />
                    <p class="text-gray-500">
                      {{ $t('classroomDetail.resources.empty') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Checkout Card -->
          <div class="lg:w-[35%] w-full lg:sticky lg:top-8">
            <CheckoutCard
              :course-data="currentCourse"
              :preselected-classroom-id="classroomId"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div class="text-center max-w-md">
        <Icon name="solar:document-text-bold" class="text-6xl text-gray-300 mb-4" />
        <h2 class="text-2xl font-bold text-gray-700 mb-2">
          {{ $t('classroomDetail.notFound.title') }}
        </h2>
        <p class="text-gray-500 mb-6">
          {{ $t('classroomDetail.notFound.description') }}
        </p>
        <NuxtLink to="/" class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Icon name="solar:arrow-left-bold" class="mr-2" />
          {{ $t('classroomDetail.notFound.backToHome') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
