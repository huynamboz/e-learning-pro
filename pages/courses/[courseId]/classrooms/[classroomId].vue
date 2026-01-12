<script lang="ts" setup>
import type { CourseAsset } from '~/composables/api/useAssetApi'
import type { Classroom } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import { VueCal } from 'vue-cal'
import ResourceItem from '~/components/learning/ResourceItem.vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useOrderApi } from '~/composables/api/useOrderApi'
import 'vue-cal/style'

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

// Group resources by asset_type
const groupedResources = computed(() => {
  const grouped: Record<string, CourseAsset[]> = {}

  resources.value.forEach((resource) => {
    const type = resource.asset_type || 'other'
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(resource)
  })

  return grouped
})

// Get sorted asset types (priority order)
const assetTypeOrder = ['video', 'pdf', 'doc', 'ppt', 'image', 'audio', 'zip', 'other']

const sortedAssetTypes = computed(() => {
  const types = Object.keys(groupedResources.value)
  return types.sort((a, b) => {
    const indexA = assetTypeOrder.indexOf(a)
    const indexB = assetTypeOrder.indexOf(b)
    // If type not in order array, put it at the end
    const orderA = indexA === -1 ? 999 : indexA
    const orderB = indexB === -1 ? 999 : indexB
    return orderA - orderB
  })
})

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

// Calendar section for registration schedule
interface CalendarEvent {
  start: string
  end: string
  title: string
  id?: string
  class?: string
}

const calendarEvents = ref<CalendarEvent[]>([])
const selectedDate = ref(new Date())
const viewDate = ref(new Date())
const currentView = ref('week')

// Dialog state for classroom registration
const showClassroomDialog = ref(false)
const selectedClassroomForDialog = ref<Classroom | null>(null)
const showPaymentDialog = ref(false)
const isProcessingPayment = ref(false)
const { user } = useAuth()
const { createOrder } = useOrderApi()

// Check if user is logged in
const { isLoggedIn } = useAuth()

// Check if user is teacher
const isTeacher = computed(() => user.value?.is_teacher || false)

// Check if user has generated account
const isGeneratedAccount = computed(() => user.value?.account_type === 'generated')

// Computed for classroom pricing
const classroomPrice = computed(() => {
  if (!selectedClassroomForDialog.value)
    return '0'
  return selectedClassroomForDialog.value.price || '0'
})

const classroomDiscountPrice = computed(() => {
  if (!selectedClassroomForDialog.value)
    return null
  return selectedClassroomForDialog.value.discount_price
})

const classroomEffectivePrice = computed(() => {
  if (!selectedClassroomForDialog.value)
    return 0
  return selectedClassroomForDialog.value.effective_price || 0
})

const classroomIsFree = computed(() => {
  if (!selectedClassroomForDialog.value)
    return false
  return selectedClassroomForDialog.value.is_free || false
})

const hasClassroomDiscount = computed(() => {
  if (!selectedClassroomForDialog.value)
    return false
  const discountPrice = Number.parseFloat(selectedClassroomForDialog.value.discount_price || '0')
  return discountPrice > 0 && discountPrice < Number.parseFloat(selectedClassroomForDialog.value.price || '0')
})

// Generate seed data for calendar events
function generateCalendarEvents() {
  const events: CalendarEvent[] = []
  const now = dayjs()

  // Get the start of current week (Monday)
  const startOfWeek = now.startOf('week').add(1, 'day') // Monday

  // Generate events for the next 4 weeks
  for (let week = 0; week < 4; week++) {
    const weekStart = startOfWeek.add(week, 'week')

    // Class 1: Monday and Wednesday from 6 PM to 8 PM (18:00-20:00)
    // Monday
    const monday = weekStart.hour(18).minute(0).second(0)
    const mondayEnd = monday.hour(20).minute(0).second(0)

    events.push({
      id: `class1-monday-${week}`,
      start: monday.format('YYYY-MM-DD HH:mm'),
      end: mondayEnd.format('YYYY-MM-DD HH:mm'),
      title: 'Lớp 1 thành viên',
    })

    // Wednesday
    const wednesday = weekStart.add(2, 'day').hour(18).minute(0).second(0)
    const wednesdayEnd = wednesday.hour(20).minute(0).second(0)

    events.push({
      id: `class1-wednesday-${week}`,
      start: wednesday.format('YYYY-MM-DD HH:mm'),
      end: wednesdayEnd.format('YYYY-MM-DD HH:mm'),
      title: 'Lớp 1 thành viên',
    })

    // Class 2: Thursday and Saturday from 1 PM to 4 PM (13:00-16:00)
    // Thursday
    const thursday = weekStart.add(3, 'day').hour(13).minute(0).second(0)
    const thursdayEnd = thursday.hour(16).minute(0).second(0)

    events.push({
      id: `class2-thursday-${week}`,
      start: thursday.format('YYYY-MM-DD HH:mm'),
      end: thursdayEnd.format('YYYY-MM-DD HH:mm'),
      title: 'Lớp 3 thành viên',
    })

    // Saturday
    const saturday = weekStart.add(5, 'day').hour(13).minute(0).second(0)
    const saturdayEnd = saturday.hour(16).minute(0).second(0)

    events.push({
      id: `class2-saturday-${week}`,
      start: saturday.format('YYYY-MM-DD HH:mm'),
      end: saturdayEnd.format('YYYY-MM-DD HH:mm'),
      title: 'Lớp 3 thành viên',
    })
  }

  return events
}

// Initialize calendar events
onMounted(() => {
  calendarEvents.value = generateCalendarEvents()
})

// Watch for view date changes
watch(viewDate, (newViewDate) => {
  if (currentView.value === 'week') {
    const firstDayOfWeek = new Date(newViewDate)
    const dayOfWeek = firstDayOfWeek.getDay()
    const diff = firstDayOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    firstDayOfWeek.setDate(diff)
    selectedDate.value = firstDayOfWeek
  }
})

// Map event title to classroom
function findClassroomByEventTitle(eventTitle: string): Classroom | null {
  if (!currentCourse.value || !currentCourse.value.classrooms)
    return null

  // Map event titles to classroom titles
  // "Lớp 1 thành viên" -> find classroom with student_count = 1 or title contains "1 thành viên"
  // "Lớp 3 thành viên" -> find classroom with student_count = 3 or title contains "3 thành viên"
  if (eventTitle.includes('1 thành viên')) {
    return currentCourse.value.classrooms.find((c: Classroom) =>
      c.is_one_on_one || c.student_count === 1 || c.title.includes('1 thành viên'),
    ) || currentCourse.value.classrooms[0] || null
  }
  else if (eventTitle.includes('3 thành viên')) {
    return currentCourse.value.classrooms.find((c: Classroom) =>
      c.student_count === 3 || c.title.includes('3 thành viên'),
    ) || currentCourse.value.classrooms[1] || null
  }

  // Fallback: try to find by title match
  return currentCourse.value.classrooms.find((c: Classroom) =>
    c.title === eventTitle || c.title.includes(eventTitle),
  ) || null
}

// Handle event click
function handleEventClick(event: any) {
  const calendarEvent = event.event as CalendarEvent
  const classroom = findClassroomByEventTitle(calendarEvent.title)

  if (classroom) {
    selectedClassroomForDialog.value = classroom
    showClassroomDialog.value = true
  }
  else {
    notification.warning({
      message: 'Không tìm thấy lớp học',
      description: 'Không thể tìm thấy thông tin lớp học cho lịch học này.',
    })
  }
}

// Handle register classroom - show payment dialog
function handleRegisterClassroom() {
  if (!selectedClassroomForDialog.value || !currentCourse.value) {
    return
  }

  // Check if user is logged in
  if (!isLoggedIn.value) {
    notification.warning({
      message: 'Vui lòng đăng nhập',
      description: 'Bạn cần đăng nhập để đăng ký lớp học.',
    })
    navigateTo('/auth/login')
    return
  }

  // Check if user is teacher
  if (isTeacher.value) {
    notification.info({
      message: 'Giáo viên không thể đăng ký',
      description: 'Bạn là giáo viên, không thể đăng ký lớp học này.',
    })
    return
  }

  // Check if generated account
  if (isGeneratedAccount.value) {
    notification.warning({
      message: 'Không thể đăng ký',
      description: 'Tài khoản được tạo tự động không thể mua khóa học.',
    })
    return
  }

  // Close classroom dialog and open payment dialog
  showClassroomDialog.value = false
  showPaymentDialog.value = true
}

// Confirm payment - create order directly
async function confirmPayment() {
  if (!selectedClassroomForDialog.value || !currentCourse.value) {
    return
  }

  try {
    isProcessingPayment.value = true

    const orderPayload: any = {
      course_id: currentCourse.value.id,
      classroom_id: selectedClassroomForDialog.value.id,
      price_currency: 'EUR',
      payment_method: 'bank_transfer',
      payment_reference: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      notes: `Payment for course: ${currentCourse.value.title} - Classroom: ${selectedClassroomForDialog.value.title}`,
      metadata: {
        course_title: currentCourse.value.title,
        classroom_title: selectedClassroomForDialog.value.title,
        schedule: selectedClassroomForDialog.value.schedule_summary || '',
      },
    }

    await createOrder(orderPayload)

    // Close dialog
    showPaymentDialog.value = false
    selectedClassroomForDialog.value = null

    // Redirect to success page
    navigateTo('/checkout-complete')
  }
  catch (error: any) {
    console.error('Error creating order:', error)
    notification.error({
      message: 'Lỗi thanh toán',
      description: error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.',
    })
  }
  finally {
    isProcessingPayment.value = false
  }
}

// Cancel payment
function cancelPayment() {
  showPaymentDialog.value = false
}
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
        <div class="flex flex-col gap-8">
          <!-- Course Description -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <course-description-course
              :course-data="currentCourse"
            />

            <!-- Resources Section - Below Curriculum -->
            <div class="bg-white rounded-lg my-6 pt-6">
              <div class="">
                <div class="px-8 flex flex-col gap-3">
                  <h1 class="font-bold text-2xl !mb-0 flex items-center gap-3">
                    <Icon name="solar:document-text-bold" size="28" class="text-blue-600" />
                    {{ $t('classroomDetail.resources.title') }}
                  </h1>

                  <!-- Loading State -->
                  <div v-if="isLoadingResources" class="flex justify-center items-center py-12">
                    <a-spin size="large" />
                  </div>

                  <!-- Resources List - Grouped by Type -->
                  <div v-else-if="resources.length > 0" class="space-y-2 border rounded-lg">
                    <a-collapse
                      :bordered="false"
                      class="resources-accordion"
                    >
                      <a-collapse-panel
                        v-for="assetType in sortedAssetTypes"
                        :key="assetType"
                        class="resource-type-panel"
                      >
                        <template #header>
                          <div class="flex items-center gap-3 w-full">
                            <Icon
                              :name="getAssetTypeInfo(assetType).icon"
                              size="20"
                              :class="getAssetTypeInfo(assetType).color"
                            />
                            <span class="font-semibold text-gray-900">
                              {{ getAssetTypeInfo(assetType).label }}
                            </span>
                            <span class="ml-auto text-sm text-gray-500">
                              ({{ groupedResources[assetType]?.length || 0 }})
                            </span>
                          </div>
                        </template>

                        <div class="space-y-3 pt-2">
                          <ResourceItem
                            v-for="resource in groupedResources[assetType]"
                            :key="resource.id"
                            :resource="resource"
                            :is-openable="false"
                          />
                        </div>
                      </a-collapse-panel>
                    </a-collapse>

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

          <!-- Registration Schedule Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="font-bold text-2xl mb-6 flex items-center gap-3">
              <Icon name="solar:calendar-bold" size="28" class="text-green-600" />
              Chọn lịch đăng ký học
            </h2>

            <div class="flex flex-col lg:flex-row gap-6">
              <!-- Calendar View -->
              <div class="flex-1 flex flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <VueCal
                  v-model:selected-date="selectedDate"
                  v-model:view-date="viewDate"
                  v-model:view="currentView"
                  :views-bar="false"
                  class="custom-theme calendar w-full !h-auto"
                  :time-from="7 * 60"
                  :time-step="60"
                  :time-to="24 * 60"
                  :time-cell-height="72"
                  :events="calendarEvents"
                  :views="['week']"
                  time-at-cursor
                  @ready="({ view }: any) => view.scrollToCurrentTime()"
                  @event-click="handleEventClick"
                />
              </div>
            </div>
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

    <!-- Classroom Registration Dialog -->
    <a-modal
      v-model:open="showClassroomDialog"
      :title="null"
      :footer="null"
      width="600px"
      class="classroom-registration-modal"
      @cancel="showClassroomDialog = false"
    >
      <div v-if="selectedClassroomForDialog" class="px-6 py-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <Icon name="solar:calendar-bold" class="h-8 w-8" />
          </div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-2">
            {{ selectedClassroomForDialog.title }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ currentCourse?.title }}
          </p>
        </div>

        <!-- Classroom Info -->
        <div class="rounded-xl border border-gray-200 bg-gray-50 p-6 mb-6">
          <div class="space-y-4">
            <!-- Student Count -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="solar:users-group-two-rounded-bold" class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-600">Số lượng học viên</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">
                {{ selectedClassroomForDialog.student_count }} học viên
              </span>
            </div>

            <!-- Schedule Summary -->
            <div v-if="selectedClassroomForDialog.schedule_summary" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="solar:calendar-mark-bold" class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-600">Lịch học</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">
                {{ selectedClassroomForDialog.schedule_summary }}
              </span>
            </div>

            <!-- Session Count -->
            <div v-if="selectedClassroomForDialog.session_count" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="solar:document-text-bold" class="h-5 w-5 text-gray-400" />
                <span class="text-sm font-medium text-gray-600">Số buổi học</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">
                {{ selectedClassroomForDialog.session_count }} buổi
              </span>
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="mb-6">
          <div class="flex items-center gap-3 justify-center">
            <!-- Free classroom -->
            <span v-if="classroomIsFree" class="text-green-600 font-bold text-3xl">
              Miễn phí
            </span>
            <!-- No discount or discount price is 0 -->
            <span v-else-if="!hasClassroomDiscount || !classroomDiscountPrice || parseFloat(classroomDiscountPrice) === 0" class="text-black font-bold text-3xl">
              €{{ Number(classroomEffectivePrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
            <!-- Has discount -->
            <template v-else>
              <span class="font-bold text-xl text-gray-400 line-through">
                €{{ Number(classroomPrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-black font-bold text-3xl">
                €{{ Number(classroomDiscountPrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="font-bold text-lg text-green-600">
                {{ Math.round(((Number.parseFloat(classroomPrice || '0') - Number.parseFloat(classroomDiscountPrice || '0')) / Number.parseFloat(classroomPrice || '1')) * 100) }}% Off
              </span>
            </template>
          </div>
        </div>

        <!-- Warning for teacher -->
        <div v-if="isTeacher" class="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div class="flex items-center gap-2">
            <Icon name="solar:info-circle-bold" class="h-5 w-5 text-yellow-600" />
            <span class="text-sm font-medium text-yellow-800">Bạn là giáo viên, không thể đăng ký lớp học này.</span>
          </div>
        </div>

        <!-- Warning for generated account -->
        <div v-if="isGeneratedAccount" class="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div class="flex items-center gap-2">
            <Icon name="solar:info-circle-bold" class="h-5 w-5 text-yellow-600" />
            <span class="text-sm font-medium text-yellow-800">Tài khoản được tạo tự động không thể mua khóa học.</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <template v-if="!isTeacher && !isGeneratedAccount">
            <!-- Register button -->
            <a-button
              type="primary"
              size="large"
              class="!h-12 !rounded-lg !flex !items-center !justify-center !text-sm !font-semibold !bg-green-700 hover:!bg-green-800"
              @click="handleRegisterClassroom"
            >
              <Icon name="solar:wallet-bold" size="20" class="mr-2" />
              Đăng ký lớp này ngay
            </a-button>
            <a-button
              size="large"
              class="!h-12 !rounded-lg !flex !items-center !justify-center !text-sm !font-semibold !bg-gray-100 hover:!bg-gray-200"
              @click="showClassroomDialog = false"
            >
              Đóng
            </a-button>
          </template>
          <template v-else>
            <!-- Teacher or generated account - only close button -->
            <a-button
              size="large"
              class="!h-12 !rounded-lg !flex !items-center !justify-center !text-sm !font-semibold !bg-gray-100 hover:!bg-gray-200"
              @click="showClassroomDialog = false"
            >
              Đóng
            </a-button>
          </template>
        </div>
      </div>
    </a-modal>

    <!-- Payment QR Code Dialog -->
    <a-modal
      v-model:open="showPaymentDialog"
      :title="null"
      :footer="null"
      centered
      width="500px"
      class="payment-qr-modal"
      @cancel="cancelPayment"
    >
      <div v-if="selectedClassroomForDialog" class="text-center py-6">
        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          Xác nhận đã thanh toán đơn hàng
        </h3>

        <!-- Description -->
        <p class="text-gray-600 mb-6 leading-relaxed">
          Số tiền cần thanh toán:
          <span class="font-semibold text-green-600">
            €{{ Number(classroomEffectivePrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </p>

        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 class="font-medium text-gray-900 mb-3">
            Thông tin đơn hàng
          </h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Khóa học</span>
              <span class="font-medium">{{ currentCourse?.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Lớp học</span>
              <span class="font-medium">{{ selectedClassroomForDialog.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Số tiền</span>
              <span class="font-medium">€{{ Number(classroomEffectivePrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Instructions -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <p class="text-sm text-blue-800 leading-relaxed">
            Sau khi nhắn tin và thanh toán khóa học cho phiên dịch viên <span class="font-semibold">Phan tâm</span> thì nhấn nút "Tôi đã chuyển tiền" để xác nhận đã thanh toán.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 justify-center">
          <a-button
            size="large"
            class="!h-11 !px-6 !rounded-lg !border-gray-300 !text-gray-700 hover:!bg-gray-50"
            @click="cancelPayment"
          >
            Hủy
          </a-button>
          <a-button
            type="primary"
            size="large"
            :loading="isProcessingPayment"
            class="!h-11 !px-6 !flex items-center justify-center !rounded-lg !bg-green-600 hover:!bg-green-700"
            @click="confirmPayment"
          >
            <Icon name="solar:check-circle-bold" size="18" class="mr-2" />
            Tôi đã chuyển tiền
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
/* Vue-cal theme customization */
:deep(.vuecal.custom-theme) {
  /* --vuecal-primary-color: #15803d; */
  --vuecal-primary-color: #fff;
  --vuecal-secondary-color: #fafbfc;
  --vuecal-base-color: #0f172a;
  --vuecal-contrast-color: #ffffff;
  --vuecal-time-cell-height: 50px !important;
}

:deep(.vuecal__header) {
  color: var(--vuecal-base-color) !important;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-bottom: none;
}

:deep(.date-picker .vuecal__title-bar) {
  color: white !important;
}

:deep(.vuecal__event) {
  color: var(--vuecal-base-color) !important;
  border-color: rgba(203, 213, 225, 0.25) !important;
}

:deep(.vuecal__today-btn) {
  color: var(--vuecal-base-color) !important;
}

/* Event styling */
:deep(.vuecal--default-theme .vuecal__event) {
  color: #ffffff;
  background: #268100;
  border: 1px solid rgba(203, 213, 225, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.vuecal--default-theme .vuecal__event:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  /* background: #f8fafc; */
}

/* Date picker styling */
:deep(.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today:before) {
  background: #94a3b8;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.25);
}

:deep(.date-picker.vuecal--default-theme.vuecal--light .vuecal__cell--selected:before) {
  background-color: color-mix(in srgb, #15803d 10%, transparent) !important;
}

:deep(.date-picker.vuecal--default-theme.vuecal--date-picker .vuecal__cell-date) {
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.date-picker .vuecal__cell--selected),
:deep(.date-picker.vuecal--default-theme.vuecal--date-picker.vuecal--light .vuecal__cell--today) {
  font-weight: 600;
}

:deep(.date-picker .vuecal__cell:hover.vuecal__cell:before) {
  background: #64748b;
}

:deep(.date-picker .vuecal__cell:hover) {
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

/* Calendar navigation */
:deep(.calendar .vuecal__title-bar button) {
  height: 36px;
  border-radius: 10px;
  /* color: #ffffff !important; */
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.calendar .vuecal__nav--today) {
  margin-left: 3px;
  display: none;
}

/* Event content styling */
:deep(.vuecal__event) {
  position: relative;
  overflow: hidden;
}

:deep(.vuecal__event .vuecal__event-title),
:deep(.calendar .vuecal__event-time) {
  font-size: 14px;
  color: #ffffff;
  font-weight: 700;
}

:deep(.vuecal__event .vuecal__event-time) {
  margin-top: 4px;
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
}

:deep(.vuecal__event::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #20683b;
  border-radius: 0 3px 3px 0;
}

/* Week and day view styling */
:deep(.vuecal--default-theme .vuecal__time-cell) {
  border-color: #e2e8f0;
}

:deep(.vuecal--default-theme .vuecal__time-cell--now) {
  background: #fef9c3;
  border-color: #fbbf24;
}

:deep(.vuecal__weekday.vuecal__weekday--today .vuecal__weekday-date) {
  background: #15803d;
  color: #fff;
}

/* Classroom Registration Dialog Styling */
:deep(.classroom-registration-modal .ant-modal-content) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 45px -18px rgba(15, 23, 42, 0.35);
  background: #ffffff;
}

:deep(.classroom-registration-modal .ant-modal-body) {
  padding: 0;
}

/* Payment QR Dialog Styling */
:deep(.payment-qr-modal .ant-modal-content) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 45px -18px rgba(15, 23, 42, 0.35);
  background: #ffffff;
}

:deep(.payment-qr-modal .ant-modal-body) {
  padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.vuecal--default-theme .vuecal__event) {
    padding: 6px;
    font-size: 12px;
  }

  :deep(.vuecal__event .vuecal__event-title) {
    font-size: 12px;
  }

  :deep(.vuecal__event .vuecal__event-time) {
    font-size: 10px;
  }
}
</style>
