<script setup lang="ts">
import { useCourseApi } from '@/composables/api/useCourseApi'

definePageMeta({
  layout: 'auth',
})

// Use course API directly
const { getCourses } = useCourseApi()

// i18n
const { t } = useI18n()

// Counter animation state
const isCounterVisible = ref(false)
const counterValues = ref({
  activeStudents: 0,
  averageRating: 0,
  completionRate: 0,
})

// Helper functions
// function getLevelText(level: string): string {
//   const levelMap: Record<string, string> = {
//     beginner: t('homepage.courses.levels.beginner'),
//     intermediate: t('homepage.courses.levels.intermediate'),
//     advanced: t('homepage.courses.levels.advanced'),
//   }
//   return levelMap[level] || t('homepage.courses.levels.beginner')
// }

// function formatPrice(price: number): string {
//   if (!price)
//     return '€149'
//   return `€${price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// }

// Counter animation function
function animateCounter(target: number, key: keyof typeof counterValues.value, duration: number = 2000) {
  const start = 0
  const increment = target / (duration / 16) // 60fps
  let current = start

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }

    // Handle decimal values for rating
    if (key === 'averageRating') {
      counterValues.value[key] = Math.round(current * 10) / 10
    }
    else {
      counterValues.value[key] = Math.floor(current)
    }
  }, 16)
}

// Intersection Observer for counter animation
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !isCounterVisible.value) {
        isCounterVisible.value = true
        // Start animations with slight delays
        setTimeout(() => animateCounter(2500, 'activeStudents'), 100)
        setTimeout(() => animateCounter(4.9, 'averageRating'), 300)
        setTimeout(() => animateCounter(98, 'completionRate'), 500)
      }
    })
  }, { threshold: 0.5 })

  const statsElement = document.querySelector('.stats-section')
  if (statsElement) {
    observer.observe(statsElement)
  }
})

// Fetch courses data
const { data: _coursesData, pending: _isFetchingCourses, error: _fetchError, refresh: _retryFetch } = useLazyAsyncData(
  'homepage-courses',
  async () => {
    try {
      const response = await getCourses({ limit: 3 })
      return response?.results || []
    }
    catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.data?.message || error.statusMessage || 'Failed to fetch courses',
      })
    }
  },
  {
    default: () => [],
    server: true,
  },
)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Hero Section -->
    <section class="relative py-10 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="inline-block">
              <span class="text-sm font-medium px-4 py-2 bg-green-100 text-green-800 rounded-full">
                {{ t('homepage.hero.badge') }}
              </span>
            </div>

            <h1 class="text-5xl lg:text-7xl font-serif font-bold leading-tight text-balance">
              {{ t('homepage.hero.title') }}
            </h1>

            <p class="text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl">
              {{ t('homepage.hero.description') }}
            </p>

            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/courses">
                <button
                  class="bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all hover:scale-105 cursor-pointer"
                >
                  {{ t('homepage.hero.exploreCourses') }}
                </button>
              </NuxtLink>
              <NuxtLink to="/auth/register">
                <button
                  class="border-2 border-green-600 text-green-600 px-8 py-4 rounded-full font-medium hover:bg-green-50 transition-colors cursor-pointer"
                >
                  {{ t('homepage.hero.signUpNow') }}
                </button>
              </NuxtLink>
            </div>

            <div class="flex items-center flex-wrap gap-8 pt-4 stats-section">
              <div>
                <div class="text-3xl font-bold">
                  {{ counterValues.activeStudents.toLocaleString() }}+
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.hero.stats.activeStudents') }}
                </div>
              </div>
              <div class="w-px h-12 bg-green-200" />
              <div>
                <div class="text-3xl font-bold">
                  {{ counterValues.averageRating.toFixed(1) }}/5
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.hero.stats.averageRating') }}
                </div>
              </div>
              <div class="w-px h-12 bg-green-200" />
              <div>
                <div class="text-3xl font-bold">
                  {{ counterValues.completionRate }}%
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.hero.stats.completionRate') }}
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="relative rounded-3xl overflow-hidden bg-green-50 aspect-[4/5]">
              <img src="/images/cotam1.jpg" alt="Instructor Phan Tam" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div class="absolute bottom-8 left-8 right-8">
                <div class="bg-background/95 backdrop-blur rounded-2xl p-3 shadow-xl">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold"
                    >
                      <img class="size-12 object-cover rounded-full" src="/images/cotam.jpg" alt="">
                    </div>
                    <div>
                      <div class="font-semibold">
                        Phan Tâm
                      </div>
                      <div class="text-sm text-muted-foreground">
                        Italian Language Expert
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Courses Section -->
    <!-- <section id="courses" class="py-20 bg-green-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-serif font-bold mb-4 text-balance">
            {{ t('homepage.courses.title') }}
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {{ t('homepage.courses.description') }}
          </p>
        </div>

        <div v-if="_isFetchingCourses" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
          >
            <div class="aspect-video bg-gray-200" />
            <div class="p-6 space-y-4">
              <div class="h-4 bg-gray-200 rounded w-1/3" />
              <div class="h-6 bg-gray-200 rounded w-2/3" />
              <div class="h-4 bg-gray-200 rounded" />
              <div class="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>

        <div v-else-if="_fetchError" class="text-center py-12">
          <div class="text-red-500 mb-4">
            <Icon name="i-heroicons-exclamation-triangle" class="h-12 w-12 mx-auto" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải khóa học
          </h3>
          <p class="text-gray-600 mb-4">
            Vui lòng thử lại sau
          </p>
          <a-button
            class="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
            @click="_retryFetch"
          >
            Thử lại
          </a-button>
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="(course) in _coursesData"
            :key="course.id"
            class="group flex flex-col !bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
            :to="`/courses/${course.id}`"
          >
            <div class="relative aspect-video overflow-hidden bg-green-50">
              <img
                :src="course.thumbnail || 'https://g-r1gvkzrgljd.vusercontent.net/placeholder.svg?height=400&width=600'"
                :alt="course.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              >
              <div
                class="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ getLevelText(course.level) }}
              </div>
            </div>
            <div class="p-6 space-y-4 flex-1 flex flex-col">
              <div class="flex items-center gap-2 text-sm">
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  {{ getLevelText(course.level) }}
                </span>
                <span>•</span>
                <span>{{ course.duration_hours }} {{ $t('descriptionCourse.hours') }}</span>
              </div>
              <h3 class="text-2xl font-serif font-bold group-hover:text-green-600 transition-colors">
                {{ course.title }}
              </h3>
              <p class="text-muted-foreground leading-relaxed">
                {{ course.description || course.short_description }}
              </p>
              <div class="flex items-center justify-between pt-4 border-t mt-auto">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-500">★</span>
                  <span class="font-semibold">4.9</span>
                  <span class="text-sm text-muted-foreground">({{ course.enrollment_count || '1,234' }})</span>
                </div>
                <div class="text-2xl font-bold">
                  {{ formatPrice(course.effective_price) }}
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section> -->

    <!-- Quiz Section -->
    <section id="quiz" class="relative py-20 overflow-x-hidden">
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-50 via-white to-green-50" aria-hidden="true" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div>
              <span class="inline-flex items-center text-sm font-medium px-4 py-2 bg-green-100 text-green-800 rounded-full">
                {{ t('homepage.quiz.badge') }}
              </span>
            </div>
            <h2 class="text-4xl leading-[64px] lg:text-5xl font-serif font-bold text-balance">
              {{ t('homepage.quiz.title') }}
            </h2>
            <p class="text-lg text-muted-foreground leading-relaxed text-pretty">
              {{ t('homepage.quiz.description') }}
            </p>

            <div class="grid sm:grid-cols-3 gap-4 pt-6">
              <div class="rounded-2xl border border-green-100 bg-white/80 backdrop-blur p-4 shadow-sm">
                <div class="text-3xl font-bold text-green-600">
                  {{ t('homepage.quiz.metrics.questions.value') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.quiz.metrics.questions.label') }}
                </div>
              </div>
              <div class="rounded-2xl border border-green-100 bg-white/80 backdrop-blur p-4 shadow-sm">
                <div class="text-3xl font-bold text-green-600">
                  {{ t('homepage.quiz.metrics.passRate.value') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.quiz.metrics.passRate.label') }}
                </div>
              </div>
              <div class="rounded-2xl border border-green-100 bg-white/80 backdrop-blur p-4 shadow-sm">
                <div class="text-3xl font-bold text-green-600">
                  {{ t('homepage.quiz.metrics.time.value') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.quiz.metrics.time.label') }}
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6">
              <div class="flex items-start gap-4">
                <div class="flex size-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                  🧠
                </div>
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ t('homepage.quiz.highlights.adaptive.title') }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.quiz.highlights.adaptive.description') }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="flex size-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                  ⚡️
                </div>
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ t('homepage.quiz.highlights.feedback.title') }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.quiz.highlights.feedback.description') }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="flex size-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                  🎯
                </div>
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ t('homepage.quiz.highlights.certification.title') }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.quiz.highlights.certification.description') }}
                  </p>
                </div>
              </div>
            </div>

            <NuxtLink to="/quiz">
              <button
                class="mt-8 bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all hover:scale-105 cursor-pointer"
              >
                {{ t('homepage.quiz.cta') }}
              </button>
            </NuxtLink>
          </div>

          <div class="relative">
            <div class="absolute -top-8 -right-6 bg-white border border-green-100 rounded-2xl shadow-xl p-6 w-60">
              <div class="text-sm font-medium text-green-600 mb-2">
                {{ t('homepage.quiz.summary.title') }}
              </div>
              <div class="text-3xl font-bold text-green-700">
                {{ t('homepage.quiz.summary.value') }}
              </div>
              <p class="text-xs text-muted-foreground mt-2 leading-relaxed">
                {{ t('homepage.quiz.summary.caption') }}
              </p>
            </div>

            <div
              class="relative rounded-3xl border border-green-100 bg-white/80 backdrop-blur p-8 shadow-2xl shadow-green-100/70"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <p class="text-sm font-medium text-green-600">
                    {{ t('homepage.quiz.preview.title') }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ t('homepage.quiz.preview.subtitle') }}
                  </p>
                </div>
                <div class="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <span class="text-lg">🔥</span>
                  {{ t('homepage.quiz.preview.badge') }}
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <p class="text-sm uppercase tracking-wide text-muted-foreground mb-1">
                    {{ t('homepage.quiz.preview.topic') }}
                  </p>
                  <h3 class="text-xl font-semibold leading-snug">
                    {{ t('homepage.quiz.preview.question') }}
                  </h3>
                </div>

                <div class="space-y-3">
                  <div
                    class="flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <span class="text-muted-foreground">A</span>
                    {{ t('homepage.quiz.preview.options.a') }}
                  </div>
                  <div
                    class="flex items-center gap-3 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-green-500/30"
                  >
                    <span class="text-white/80">B</span>
                    {{ t('homepage.quiz.preview.options.b') }}
                    <span class="ml-auto text-xs font-semibold uppercase tracking-wide bg-white/20 rounded-full px-3 py-1">
                      {{ t('homepage.quiz.preview.correct') }}
                    </span>
                  </div>
                  <div
                    class="flex items-center gap-3 rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <span class="text-muted-foreground">C</span>
                    {{ t('homepage.quiz.preview.options.c') }}
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                    <span>{{ t('homepage.quiz.progress.label') }}</span>
                    <span>{{ t('homepage.quiz.progress.value') }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-green-100 overflow-hidden">
                    <div class="h-full w-4/5 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Section -->
    <section id="video" class="py-20 bg-white overflow-x-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <div>
              <span class="inline-flex items-center text-sm font-medium px-4 py-2 bg-green-100 text-green-800 rounded-full">
                Hệ thống video bài giảng
              </span>
            </div>
            <h2 class="text-4xl lg:text-5xl font-serif font-bold text-balance">
              Hệ thống video bài giảng chuyên nghiệp
            </h2>
            <p class="text-lg text-muted-foreground leading-relaxed text-pretty">
              Trải nghiệm học tập mượt mà với hệ thống video tối ưu cho giáo dục chất lượng ổn định, tốc độ tải nhanh, bảo mật nội dung và nhiều tiện ích hỗ trợ học hiệu quả.
            </p>

            <div class="rounded-3xl border border-green-100 bg-white/80 backdrop-blur p-6 shadow-sm space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center size-10 rounded-2xl bg-green-100">
                  <Icon name="i-heroicons-play" class="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <div class="text-sm font-semibold">
                    Trải nghiệm xem tối ưu
                  </div>
                  <div class="text-xs text-muted-foreground">
                    Giao diện trực quan
                  </div>
                </div>
              </div>

              <!-- Mini player controls preview (composite, single card) -->
              <div class="rounded-2xl border border-green-100 bg-white p-4">
                <div class="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span class="font-medium">00:42</span>
                  <div class="h-px flex-1 bg-green-100" />
                  <span>12:30</span>
                </div>
                <div class="h-2 rounded-full bg-green-100 overflow-hidden">
                  <div class="h-full w-1/4 rounded-full bg-green-500" />
                </div>
                <div class="mt-3 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button class="p-2 rounded-md hover:bg-green-50 cursor-pointer">
                      <Icon name="i-heroicons-play" class="h-5 w-5 text-green-700" />
                    </button>
                    <button class="p-2 rounded-md hover:bg-green-50 cursor-pointer">
                      <Icon name="i-heroicons-sparkles" class="h-5 w-5 text-green-700" />
                    </button>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">1080p</span>
                    <span class="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">Adaptive</span>
                    <span class="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">Subtitles</span>
                    <span class="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">1.25x</span>
                    <button class="p-2 rounded-md hover:bg-green-50 cursor-pointer">
                      <Icon name="i-heroicons-cog-8-tooth" class="h-5 w-5 text-green-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-4 pt-2">
              <NuxtLink to="/auth/register">
                <button
                  class="bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all hover:scale-105 cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </NuxtLink>
            </div>
          </div>

          <div class="relative">
            <div class="relative rounded-3xl overflow-hidden bg-green-50 aspect-video shadow-2xl">
              <img src="/images/cotam2.jpg" alt="Video bài giảng" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="flex items-center gap-3 bg-white/90 backdrop-blur rounded-full px-5 py-3 shadow-lg">
                  <Icon name="i-heroicons-play" class="h-6 w-6 text-green-600" />
                  <!-- <span class="text-sm font-medium text-gray-800">Xem preview 30s</span> -->
                </div>
              </div>
              <div class="absolute bottom-4 left-4 right-4">
                <div class="bg-background/95 backdrop-blur rounded-2xl p-3 shadow-xl">
                  <div class="flex items-center justify-between text-xs text-muted-foreground">
                    <span>HD • Adaptive Streaming</span>
                    <span>1.25x • 1080p</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Instructor Section -->
    <section id="instructor" class="py-20 overflow-x-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="relative">
            <div class="aspect-square rounded-3xl overflow-hidden bg-green-50">
              <img src="/images/cotam3.jpg" alt="Phan Tâm" class="w-full h-full object-cover">
            </div>
            <div class="absolute -bottom-8 -right-8 bg-green-600 text-white rounded-3xl p-8 shadow-2xl max-w-xs">
              <div class="text-4xl font-bold mb-2">
                {{ t('homepage.instructor.experience') }}
              </div>
              <div class="text-sm opacity-90">
                {{ t('homepage.instructor.experienceText') }}
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div>
              <span class="text-sm font-medium px-4 py-2 bg-green-100 text-green-800 rounded-full">
                {{ t('homepage.instructor.badge') }}
              </span>
            </div>

            <h2 class="text-4xl lg:text-5xl font-serif font-bold text-balance">
              {{ t('homepage.instructor.title') }}
            </h2>

            <p class="text-lg text-muted-foreground leading-relaxed text-pretty">
              {{ t('homepage.instructor.description') }}
            </p>

            <div class="space-y-8">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">🎓</span>
                </div>
                <div>
                  <h4 class="font-semibold mb-1">
                    {{ t('homepage.instructor.features.certified.title') }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.instructor.features.certified.description') }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">🌍</span>
                </div>
                <div>
                  <h4 class="font-semibold mb-1">
                    {{ t('homepage.instructor.features.cultural.title') }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.instructor.features.cultural.description') }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">💬</span>
                </div>
                <div>
                  <h4 class="font-semibold mb-1">
                    {{ t('homepage.instructor.features.method.title') }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    {{ t('homepage.instructor.features.method.description') }}
                  </p>
                </div>
              </div>
            </div>

            <button
              class="cursor-pointer bg-green-600 text-white px-8 py-4 rounded-full font-medium hover:bg-green-700 transition-all hover:scale-105 mt-8"
            >
              {{ t('homepage.instructor.button') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="py-20 bg-green-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-serif font-bold mb-4 text-balance">
            {{ t('homepage.testimonials.title') }}
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {{ t('homepage.testimonials.description') }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-background rounded-3xl p-8 shadow-lg">
            <div class="flex gap-1 mb-4">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              "{{ t('homepage.testimonials.testimonial1.text') }}"
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold"
              >
                SM
              </div>
              <div>
                <div class="font-semibold">
                  {{ t('homepage.testimonials.testimonial1.author') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.testimonials.testimonial1.course') }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-background rounded-3xl p-8 shadow-lg">
            <div class="flex gap-1 mb-4">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              "{{ t('homepage.testimonials.testimonial2.text') }}"
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold"
              >
                JC
              </div>
              <div>
                <div class="font-semibold">
                  {{ t('homepage.testimonials.testimonial2.author') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.testimonials.testimonial2.course') }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-background rounded-3xl p-8 shadow-lg">
            <div class="flex gap-1 mb-4">
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
              <span class="text-yellow-500">★</span>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              "{{ t('homepage.testimonials.testimonial3.text') }}"
            </p>
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold"
              >
                EP
              </div>
              <div>
                <div class="font-semibold">
                  {{ t('homepage.testimonials.testimonial3.author') }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ t('homepage.testimonials.testimonial3.course') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-green-600 text-white rounded-3xl p-12 lg:p-16 shadow-2xl">
          <h2 class="text-4xl lg:text-5xl font-serif font-bold mb-6">
            {{ t('homepage.cta.title') }}
          </h2>
          <p class="text-lg opacity-90 mb-8 max-w-2xl mx-auto text-pretty">
            {{ t('homepage.cta.description') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/courses">
              <button
                class="bg-white text-green-600 px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all hover:scale-105 cursor-pointer"
              >
                {{ t('homepage.cta.browseCourses') }}
              </button>
            </NuxtLink>

            <NuxtLink to="/auth/register">
              <button
                class="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-green-600 transition-all cursor-pointer"
              >
                {{ t('homepage.cta.signUpNow') }}
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');

.font-serif {
  /* font-family: 'Playfair Display', serif; */
  font-family: 'Inter', serif;
}

.bg-primary {
  background-color: hsl(var(--color-primary));
}

.text-primary {
  color: hsl(var(--color-primary));
}

.bg-secondary {
  background-color: hsl(var(--color-secondary));
}

.bg-accent {
  background-color: hsl(var(--color-accent));
}
.bg-background {
  background-color: hsl(var(--color-background));
}

/* Counter animation styles */
.stats-section .text-3xl {
  transition: all 0.3s ease-in-out;
}

.stats-section .text-3xl:hover {
  transform: scale(1.05);
  color: #059669;
}
</style>
