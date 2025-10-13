<script lang="ts" setup>
import type { EnrolledCourse } from '~/types/course.type'
import { formatCurrency } from '~/utils/currency'

interface Props {
  course: EnrolledCourse
  showStatusBadge?: boolean
  statusText?: string
  statusColor?: 'orange' | 'blue' | 'green' | 'red'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStatusBadge: true,
  statusText: 'Đang chờ duyệt',
  statusColor: 'orange',
  clickable: true,
})

const emit = defineEmits<{
  click: [course: EnrolledCourse]
}>()

// Status badge colors
const statusColors = {
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange/30',
    hover: 'hover:border-orange/30',
    gradient: 'from-orange/0 via-orange/0 to-orange/5',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue/30',
    hover: 'hover:border-blue/30',
    gradient: 'from-blue/0 via-blue/0 to-blue/5',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green/30',
    hover: 'hover:border-green/30',
    gradient: 'from-green/0 via-green/0 to-green/5',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red/30',
    hover: 'hover:border-red/30',
    gradient: 'from-red/0 via-red/0 to-red/5',
  },
}

const currentColor = statusColors[props.statusColor]

function handleClick() {
  if (props.clickable) {
    emit('click', props.course)
  }
}
</script>

<template>
  <div
    class="group bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
    :class="[
      clickable ? 'cursor-pointer' : '',
      currentColor.hover
    ]"
    @click="handleClick"
  >
    <div class="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" :class="currentColor.gradient" />
    
    <!-- Status Badge -->
    <div v-if="showStatusBadge" class="absolute top-4 right-4 z-20">
      <span class="shadow-lg inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="[currentColor.bg, currentColor.text]">
        <Icon name="solar:clock-circle-bold" size="12" class="mr-1" />
        {{ statusText }}
      </span>
    </div>
    
    <div class="relative z-10">
      <!-- Thumbnail -->
      <div class="w-full h-32 sm:h-40 mb-4 relative overflow-hidden rounded-xl">
        <img
          :src="course.thumbnail || '/images/course-thumbnail-default.webp'"
          :alt="course.title"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <!-- Course Info -->
      <div class="space-y-3">
        <h3 class="text-lg sm:text-xl font-bold text-shade-9 group-hover:text-blue transition-colors line-clamp-2">
          {{ course.title }}
        </h3>
        
        <p class="text-sm text-shade-6 flex items-center gap-2">
          <Icon name="solar:user-circle-bold" size="16" />
          {{ course.teacher?.full_name || 'Unknown Teacher' }}
        </p>

        <p class="text-sm text-shade-6 line-clamp-2">
          {{ course.short_description }}
        </p>

        <!-- Order Info -->
        <div v-if="course.order" class="bg-orange-50 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-orange-700 font-medium">Mã đơn hàng:</span>
            <span class="font-mono text-orange-800">{{ course.order.invoice_code }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-orange-700 font-medium">Số tiền:</span>
            <span class="font-bold text-orange-800">
              {{ formatCurrency(course.order.price_amount) }}
            </span>
          </div>
        </div>

        <!-- Classroom Info -->
        <div v-if="course.classroom" class="bg-blue-50 rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-blue-700 font-medium">Lớp học:</span>
            <span class="text-blue-800">{{ course.classroom.title }}</span>
          </div>
          <div class="text-sm">
            <span class="text-blue-700 font-medium block mb-2">Lịch học:</span>
            <div class="space-y-1">
              <div
                v-for="(schedule, index) in course.classroom.schedules"
                :key="schedule.id"
                class="flex items-center gap-2 text-blue-800"
              >
                <Icon name="solar:calendar-bold" size="14" class="text-blue-600 flex-shrink-0" />
                <span class="font-medium">{{ schedule.day_display }}</span>
                <span class="text-blue-600">•</span>
                <span>{{ schedule.start_time.slice(0, 5) }} - {{ schedule.end_time.slice(0, 5) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
