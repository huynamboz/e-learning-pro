<script setup lang="ts">
import type { Category, Teacher } from '~/types/course.type'
import { Icon } from '#components'

// Course Card Props (for components)
export interface CourseCardProps {
  id: string
  title: string
  category: Category
  teacher: Teacher
  thumbnail: string | null
  level: string
  duration_hours: string
  price: string
  effective_price: number
  has_discount: boolean
  is_free: boolean
  is_featured: boolean
  enrollment_count: number
  rating_average: string
  rating_count: number
  lessons_count: string
  type?: string
  discount_price: string | null
}

const props = defineProps<CourseCardProps>()
const { t } = useI18n()

// Computed properties for better performance
const averageRating = computed(() => Number.parseFloat(props.rating_average) || 0)
const roundedRating = computed(() => Math.round(averageRating.value))
const formattedPrice = computed(() => {
  if (props.is_free)
    return t('courseCard.free')
  if (props.has_discount)
    return `€${Number(props.effective_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `€${Number(props.effective_price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})
const originalPrice = computed(() => props.discount_price && Number.parseFloat(props.discount_price) > 0 ? `€${Number(props.price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null)
</script>

<template>
  <RouterLink
    :to="type === 'admin' ? `courses/${id}/course-detail` : `/courses/${id}`"
    class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="space-y-4 relative">
      <div class="relative">
        <img
          :src="thumbnail || '/images/course-thumbnail-default.webp'" :alt="title"
          class="w-full h-32 sm:h-36 lg:h-[139px] object-cover rounded-lg"
        >
        <span
          v-if="is_featured"
          class="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
        >
          {{ t('courseCard.featured') }}
        </span>
      </div>
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 leading-tight flex-1">
            {{ title }}
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-gray-600">
          {{ t('courseCard.by') }} {{ teacher?.full_name || t('courseCard.unknownTeacher') }}
        </p>
        <p class="text-xs text-gray-500">
          {{ category?.name || t('courseCard.unknownCategory') }}
        </p>

        <p class="text-xs sm:text-sm text-gray-600">
          {{ duration_hours || '0' }} {{ t('courseCard.totalHours') }}. {{ lessons_count || '0' }} {{ t('courseCard.lectures') }}. {{ $t(`homepage.courses.levels.${level}`) || 'Unknown' }}
        </p>
        <p class="text-xs text-gray-500">
          {{ (enrollment_count || 0).toLocaleString() }} {{ t('courseCard.studentsEnrolled') }}
        </p>

        <div class="text-lg sm:text-xl font-semibold text-gray-900">
          <span v-if="is_free" class="text-green-600">{{ t('courseCard.free') }}</span>
          <span v-else-if="originalPrice" class="flex items-center gap-2">
            <span class="text-gray-500 line-through">{{ originalPrice }}</span>
            <span class="text-green-600">{{ formattedPrice }}</span>
          </span>
          <span v-else>{{ formattedPrice }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
