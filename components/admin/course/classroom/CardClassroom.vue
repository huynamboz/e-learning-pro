<script setup lang="ts">
defineProps<{
  classRoomData: ClassroomData
}>()

const { t } = useI18n()

interface ClassroomData {
  id: string
  course: {
    id: string
    title: string
    slug: string
  }
  title: string
  background_url: string
  student_count: number
  // Pricing fields
  price?: string
  discount_price?: string | null
  is_free?: boolean
  effective_price?: number
  is_one_on_one?: boolean
  schedules: Array<{
    id: string
    day_of_week: string
    day_display: string
    start_time: string
    end_time: string
    created_at: string
    updated_at: string
  }>
  enrollment_count: number
  session_count: number
  schedule_summary: string
  upcoming_sessions: any[]
  created_at: string
  updated_at: string
}

// Format date for display
function formatDate(dateString: string): string {
  if (!dateString)
    return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    class="bg-white flex flex-col border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
  >
    <!-- Header with Course Info -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 bg-green-500 rounded-full" />
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {{ classRoomData?.course?.title }}
          </span>
        </div>
        <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {{ classRoomData?.title }}
        </h3>
      </div>
      <div class="flex items-center gap-1 text-gray-400">
        <Icon name="tabler:calendar" size="16" />
        <span class="text-xs">{{ formatDate(classRoomData?.created_at) }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">
          {{ classRoomData?.student_count }}
        </div>
        <div class="text-xs text-gray-500 font-medium">
          {{ t('admin.classroom.card.maxStudents') }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-green-600">
          {{ classRoomData?.enrollment_count }}
        </div>
        <div class="text-xs text-gray-500 font-medium">
          {{ t('admin.classroom.card.enrolledStudents') }}
        </div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-purple-600">
          {{ classRoomData?.session_count }}
        </div>
        <div class="text-xs text-gray-500 font-medium">
          {{ t('admin.classroom.card.sessions') }}
        </div>
      </div>
    </div>

    <!-- Pricing Section -->
    <div v-if="classRoomData?.price || classRoomData?.is_free" class="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="tabler:currency-euro" size="18" class="text-green-600" />
          <span class="text-sm font-medium text-gray-700">{{ t('admin.classroom.card.pricing') }}</span>
        </div>
        <div class="text-right">
          <!-- Free Classroom -->
          <div v-if="classRoomData?.is_free" class="text-lg font-bold text-green-600">
            {{ t('admin.classroom.card.free') }}
          </div>
          <!-- Has Discount -->
          <template v-else-if="classRoomData?.discount_price && parseFloat(classRoomData.discount_price) > 0 && parseFloat(classRoomData.discount_price) < parseFloat(classRoomData.price || '0')">
            <div class="flex flex-col items-end">
              <span class="text-xs text-gray-500 line-through">
                €{{ Number(classRoomData.price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-lg font-bold text-green-600">
                €{{ Number(classRoomData.discount_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-xs font-medium text-green-600">
                {{ Math.round(((parseFloat(classRoomData.price || '0') - parseFloat(classRoomData.discount_price)) / parseFloat(classRoomData.price || '1')) * 100) }}% {{ t('admin.classroom.card.off') }}
              </span>
            </div>
          </template>
          <!-- Regular Price -->
          <div v-else class="text-lg font-bold text-green-600">
            €{{ Number(classRoomData?.effective_price || classRoomData?.price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
        </div>
      </div>
      <!-- 1-on-1 Badge -->
      <div v-if="classRoomData?.is_one_on_one" class="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <Icon name="tabler:user" size="12" />
        {{ t('admin.classroom.card.oneOnOne') }}
      </div>
    </div>

    <!-- Schedule Summary -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <Icon name="tabler:clock" size="16" class="text-gray-500" />
        <span class="text-sm font-medium text-gray-700">{{ t('admin.classroom.card.schedule') }}</span>
      </div>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="text-sm font-semibold text-blue-800" v-for="item in classRoomData?.schedule_summary.split(';')" :key="item">
          {{ item }}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-2 pt-4 border-t border-gray-200 mt-auto">
      <!-- Xem lịch học (View Schedule) -->
      <!-- <NuxtLink :to="`${classRoomData?.id}/calendars`" class="w-full">
        <a-button
          type="primary"
          class="w-full rounded-lg text-sm !font-semibold !flex items-center justify-center gap-2 bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
        >
          <Icon name="tabler:calendar" size="16" />
          {{ t('admin.classroom.card.viewSchedule') }}
        </a-button>
      </NuxtLink> -->
      
      <!-- Xem chi tiết lớp học (View Classroom Details) -->
      <NuxtLink :to="`${classRoomData?.id}`" class="w-full">
        <a-button
          type="default"
          class="w-full rounded-lg text-sm !font-semibold !flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Icon name="tabler:eye" size="16" />
          {{ t('admin.classroom.card.viewDetails') }}
        </a-button>
      </NuxtLink>
      
      <!-- Điểm danh (Attendance) -->
      <!-- <NuxtLink :to="`${classRoomData?.id}/all-attendance`" class="w-full">
        <a-button
          type="default"
          class="w-full rounded-lg text-sm !font-semibold !flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Icon name="tabler:clipboard-check" size="16" />
          {{ t('admin.classroom.card.attendance') }}
        </a-button>
      </NuxtLink> -->
    </div>
  </div>
</template>
