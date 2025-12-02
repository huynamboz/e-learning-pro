<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import ResourceCheckoutCard from '~/components/course/ResourceCheckoutCard.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.courseId as string)
const classroomId = computed(() => route.params.classroomId as string)

const { getDetailCourses } = useCourseApi()

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

// Find classroom from course data
const currentClassroom = computed(() => {
  if (!currentCourse.value || !currentCourse.value.classrooms)
    return null

  return currentCourse.value.classrooms.find((c: any) => c.id === classroomId.value) || null
})

const isLoading = computed(() => isLoadingCourse.value)
const fetchError = computed(() => courseError.value)

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
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <course-description-course
                :course-data="currentCourse"
              />
            </div>
          </div>

          <!-- Right: Checkout Card -->
          <div class="lg:w-[35%] w-full lg:sticky lg:top-8">
            <ResourceCheckoutCard
              :course-data="currentCourse"
              :classroom-id="classroomId"
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
