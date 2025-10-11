<script lang="ts" setup>
import type { Course } from '~/composables/api'
import { Icon } from '#components'
import { useCourseApi } from '@/composables/api/useCourseApi'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { user } = useAuth()
const { getCourseEnrolled } = useCourseApi()
const { t } = useI18n()

// Fetch enrolled courses
const { data: enrolledCourses, pending: loadingEnrolled } = await useLazyAsyncData(
  'enrolled-courses',
  async () => {
    try {
      const response = await getCourseEnrolled()
      return response.results || []
    }
    catch (error) {
      console.error('Error fetching enrolled courses:', error)
      return []
    }
  },
  { default: () => [] },
)

// Fetch recommended courses
const { data: recommendedCourses, pending: loadingRecommended } = await useLazyAsyncData(
  'recommended-courses',
  async () => {
    try {
      const response = await getCourseEnrolled()
      return response?.results || []
    }
    catch (error) {
      console.error('Error fetching recommended courses:', error)
      return []
    }
  },
  { default: () => [] },
)

// Calculate statistics
const stats = computed(() => {
  const courses = enrolledCourses.value || []
  const total = courses.length
  const inProgress = courses.filter((c: Course) =>
    c.progress && c.progress.progress_percentage > 0 && c.progress.progress_percentage < 100,
  ).length
  const completed = courses.filter((c: Course) =>
    c.progress && c.progress.progress_percentage === 100,
  ).length
  const certificates = courses.filter((c: Course) => c.certificate_url).length

  return { total, inProgress, completed, certificates }
})

// Continue learning courses (in progress)
const continueLearningCourses = computed(() => {
  return enrolledCourses.value || []
  return (enrolledCourses.value || [])
    .filter((c: Course) =>
      c.progress && c.progress.progress_percentage > 0 && c.progress.progress_percentage < 100,
    )
    .slice(0, 3)
})

// Recent activity (recently accessed courses)
const recentActivity = computed(() => {
  return (enrolledCourses.value || [])
    .slice(0, 5)
    // .map((enrollment: Course) => ({
    //   id: enrollment.id,
    //   title: enrollment.course?.title,
    //   action: enrollment.progress?.progress_percentage === 100 ? t('learning.recentActivity.completed') : t('learning.recentActivity.continueLearning'),
    //   date: enrollment.enrolled_at,
    //   thumbnail: enrollment.course.thumbnail,
    // }))
})

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0)
    return t('learning.date.today')
  if (diffInDays === 1)
    return t('learning.date.yesterday')
  if (diffInDays < 7)
    return t('learning.date.daysAgo', { days: diffInDays })
  if (diffInDays < 30)
    return t('learning.date.weeksAgo', { weeks: Math.floor(diffInDays / 7) })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Navigate to course
function navigateToCourse(courseId: string) {
  navigateTo(`/learning/${courseId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-shade-1 via-shade-1 to-shade-2 dark:from-shade-1 dark:via-shade-1 dark:to-shade-2 p-4 sm:p-6 lg:p-8">
    <!-- Welcome Header -->
    <div class="mb-8 sm:mb-10">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue via-purple to-blue bg-clip-text text-transparent mb-3">
        {{ $t('learning.welcome', { name: user?.first_name || user?.username || 'Student' }) }}
      </h1>
      <p class="text-base sm:text-lg text-shade-6 dark:text-shade-6">
        {{ $t('learning.welcomeDesc') }}
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10">
      <!-- Total Courses -->
      <div class="stat-card group bg-gradient-to-br from-blue/5 to-blue/10 dark:from-blue/5 dark:to-blue/10 border border-blue/20 dark:border-blue/20 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:scale-105 hover:border-blue/40 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-blue to-blue/80 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Icon name="solar:book-bold" size="30" class="text-white" />
          </div>
        </div>
        <div class="text-3xl sm:text-4xl font-bold text-shade-9 dark:text-shade-9 mb-1">
          {{ stats.total }}
        </div>
        <div class="text-sm sm:text-base font-medium text-shade-7 dark:text-shade-7">
          {{ $t('learning.stats.totalCourses') }}
        </div>
      </div>

      <!-- In Progress -->
      <div class="stat-card group bg-gradient-to-br from-orange/5 to-orange/10 dark:from-orange/5 dark:to-orange/10 border border-orange/20 dark:border-orange/20 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:scale-105 hover:border-orange/40 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-orange to-orange/80 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Icon name="solar:play-circle-bold" size="30" class="text-white" />
          </div>
        </div>
        <div class="text-3xl sm:text-4xl font-bold text-shade-9 dark:text-shade-9 mb-1">
          {{ stats.inProgress }}
        </div>
        <div class="text-sm sm:text-base font-medium text-shade-7 dark:text-shade-7">
          {{ $t('learning.stats.inProgress') }}
        </div>
      </div>

      <!-- Completed -->
      <div class="stat-card group bg-gradient-to-br from-green/5 to-green/10 dark:from-green/5 dark:to-green/10 border border-green/20 dark:border-green/20 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:scale-105 hover:border-green/40 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-green to-green/80 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Icon name="solar:check-circle-bold" size="30" class="text-white" />
          </div>
        </div>
        <div class="text-3xl sm:text-4xl font-bold text-shade-9 dark:text-shade-9 mb-1">
          {{ stats.completed }}
        </div>
        <div class="text-sm sm:text-base font-medium text-shade-7 dark:text-shade-7">
          {{ $t('learning.stats.completed') }}
        </div>
      </div>

      <!-- Certificates -->
      <div class="stat-card group bg-gradient-to-br from-purple/5 to-purple/10 dark:from-purple/5 dark:to-purple/10 border border-purple/20 dark:border-purple/20 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:scale-105 hover:border-purple/40 transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-gradient-to-br from-purple to-purple/80 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Icon name="solar:diploma-bold" size="30" class="text-white" />
          </div>
        </div>
        <div class="text-3xl sm:text-4xl font-bold text-shade-9 dark:text-shade-9 mb-1">
          {{ stats.certificates }}
        </div>
        <div class="text-sm sm:text-base font-medium text-shade-7 dark:text-shade-7">
          {{ $t('learning.stats.certificates') }}
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-6 sm:space-y-8">
        <!-- Continue Learning Section -->
        <section>
          <div class="flex items-center justify-between mb-5 sm:mb-7">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-shade-9 dark:text-shade-9 mb-1">
                {{ $t('learning.continueLearning.title') }}
              </h2>
              <p class="text-sm text-shade-6 dark:text-shade-6">
                {{ $t('learning.continueLearning.subtitle') }}
              </p>
            </div>
            <NuxtLink
              to="/profile?tab=MY_COURSES"
              class="text-sm font-medium text-blue hover:text-blue/80 hover:gap-2 transition-all flex items-center gap-1"
            >
              {{ $t('learning.continueLearning.viewAll') }}
              <Icon name="solar:alt-arrow-right-line-duotone" size="16" />
            </NuxtLink>
          </div>

          <!-- Loading State -->
          <div v-if="loadingEnrolled" class="space-y-4">
            <div v-for="i in 3" :key="i" class="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-4 sm:p-6 animate-pulse">
              <div class="flex gap-4">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-shade-3 dark:bg-shade-3 rounded-lg" />
                <div class="flex-1 space-y-3">
                  <div class="h-4 bg-shade-3 dark:bg-shade-3 rounded w-3/4" />
                  <div class="h-3 bg-shade-3 dark:bg-shade-3 rounded w-1/2" />
                  <div class="h-2 bg-shade-3 dark:bg-shade-3 rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="continueLearningCourses.length === 0" class="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-8 sm:p-12 text-center">
            <Icon name="solar:book-bold" size="40" class="size-12 text-shade-5 dark:text-shade-5 mx-auto mb-4" />
            <h3 class="text-lg sm:text-xl font-semibold text-shade-9 dark:text-shade-9 mb-2">
              {{ $t('learning.continueLearning.noCourses') }}
            </h3>
            <p class="text-sm text-shade-6 dark:text-shade-6 mb-6">
              {{ $t('learning.continueLearning.noCoursesDesc') }}
            </p>
            <NuxtLink to="/courses">
              <BaseButton variant="primary" class="mx-auto !text-white">
                {{ $t('learning.continueLearning.browseCourses') }}
              </BaseButton>
            </NuxtLink>
          </div>

          <!-- Course List -->
          <div v-else class="space-y-5">
            <div
              v-for="enrollment in continueLearningCourses"
              :key="enrollment.id"
              class="group bg-card dark:bg-card border border-border dark:border-border rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-2xl hover:border-blue/30 transition-all duration-300 cursor-pointer overflow-hidden relative"
              @click="navigateToCourse(enrollment.id)"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue/0 via-blue/0 to-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div class="flex flex-col sm:flex-row gap-5 relative z-10">
                <!-- Thumbnail -->
                <div class="w-full sm:w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-xl">
                  <img
                    :src="enrollment?.thumbnail || '/images/course-thumbnail-default.webp'"
                    :alt="enrollment?.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  >
                  <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <!-- Course Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg sm:text-xl font-bold text-shade-9 dark:text-shade-9 mb-2 group-hover:text-blue transition-colors line-clamp-2">
                    {{ enrollment?.title }}
                  </h3>
                  <p class="text-sm text-shade-6 dark:text-shade-6 mb-4 flex items-center gap-2">
                    <Icon name="solar:user-circle-bold" size="16" />
                    {{ enrollment.teacher?.full_name || 'Unknown Teacher' }}
                  </p>

                  <!-- Progress Bar -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-shade-6 dark:text-shade-6 font-medium">{{ $t('learning.continueLearning.progress') }}</span>
                      <span class="font-bold text-shade-9 dark:text-shade-9">
                        {{ enrollment.progress_percentage || 0 }}%
                      </span>
                    </div>
                    <div class="w-full bg-shade-3 dark:bg-shade-3 rounded-full h-2.5 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-green to-green/80 h-2.5 rounded-full transition-all duration-500 relative"
                        :style="{ width: `${enrollment.progress_percentage || 0}%` }"
                      >
                        <div class="absolute inset-0 bg-white/30 animate-pulse" />
                      </div>
                    </div>
                    <div class="text-xs text-shade-6 dark:text-shade-6 flex items-center gap-1">
                      <Icon name="solar:checklist-bold" size="14" />
                      {{ $t('learning.continueLearning.lessonsCompleted', {
                        completed: enrollment.completed_lessons || 0,
                        total: enrollment.lessons_count || 0,
                      }) }}
                    </div>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="flex sm:flex-col items-center justify-end gap-2">
                  <BaseButton variant="primary" size="md" class="w-full sm:w-auto whitespace-nowrap text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <Icon name="solar:play-bold" size="16" class="mr-1" />
                    {{ $t('learning.continueLearning.continue') }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recommended Courses Section -->
        <section>
          <div class="flex items-center justify-between mb-5 sm:mb-7">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-shade-9 dark:text-shade-9 mb-1">
                {{ $t('learning.recommended.title') }}
              </h2>
              <p class="text-sm text-shade-6 dark:text-shade-6">
                {{ $t('learning.recommended.subtitle') }}
              </p>
            </div>
            <NuxtLink
              to="/courses"
              class="text-sm font-medium text-blue hover:text-blue/80 hover:gap-2 transition-all flex items-center gap-1"
            >
              {{ $t('learning.recommended.viewAll') }}
              <Icon name="solar:alt-arrow-right-line-duotone" size="16" />
            </NuxtLink>
          </div>

          <div v-if="loadingRecommended" class="grid sm:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-4 animate-pulse">
              <div class="w-full h-32 bg-shade-3 dark:bg-shade-3 rounded-lg mb-4" />
              <div class="space-y-3">
                <div class="h-4 bg-shade-3 dark:bg-shade-3 rounded" />
                <div class="h-3 bg-shade-3 dark:bg-shade-3 rounded w-3/4" />
              </div>
            </div>
          </div>

          <div v-else class="grid sm:grid-cols-2 gap-5">
            <!-- Use CourseCard component for consistent design -->
            <CourseCard
              v-for="course in recommendedCourses"
              :key="course.id"
              v-bind="course"
            />
          </div>
        </section>
      </div>

      <!-- Right Column -->
      <div class="lg:col-span-1">
        <!-- Recent Activity Section -->
        <section class="sticky top-8 space-y-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-shade-9 dark:text-shade-9 mb-1">
              {{ $t('learning.recentActivity.title') }}
            </h2>
            <p class="text-sm text-shade-6 dark:text-shade-6">
              {{ $t('learning.recentActivity.subtitle') }}
            </p>
          </div>

          <div v-if="loadingEnrolled" class="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-4 sm:p-6">
            <div v-for="i in 5" :key="i" class="flex gap-3 pb-4 mb-4 border-b border-border dark:border-border last:border-0 animate-pulse">
              <div class="w-12 h-12 bg-shade-3 dark:bg-shade-3 rounded-lg" />
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-shade-3 dark:bg-shade-3 rounded" />
                <div class="h-2 bg-shade-3 dark:bg-shade-3 rounded w-2/3" />
              </div>
            </div>
          </div>

          <div v-else-if="recentActivity.length === 0" class="bg-card dark:bg-card border border-border dark:border-border rounded-xl p-6 sm:p-8 text-center">
            <Icon name="solar:history-bold" size="40" class="size-12 text-shade-5 dark:text-shade-5 mx-auto mb-3" />
            <p class="text-sm text-shade-6 dark:text-shade-6">
              {{ $t('learning.recentActivity.noActivity') }}
            </p>
          </div>

          <div v-else class="bg-card dark:bg-card border border-border dark:border-border rounded-2xl p-5 sm:p-6 shadow-md">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex gap-3.5 pb-4 mb-4 border-b border-border/50 dark:border-border/50 last:border-0 last:pb-0 last:mb-0 hover:bg-shade-2/50 dark:hover:bg-shade-2/50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <div class="w-14 h-14 flex-shrink-0 relative overflow-hidden rounded-xl shadow-sm">
                <img
                  :src="activity?.thumbnail || '/images/image-default.png'"
                  :alt="activity?.title"
                  class="w-full h-full object-cover"
                >
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-shade-9 dark:text-shade-9 mb-1.5 line-clamp-2 hover:text-blue transition-colors">
                  {{ activity?.title }}
                </h4>
                <p class="text-xs text-shade-6 dark:text-shade-6 mb-1 flex items-center gap-1">
                  <Icon name="solar:clock-circle-bold" size="12" />
                  {{ activity.action }}
                </p>
                <p class="text-xs text-shade-5 dark:text-shade-5 font-medium">
                  {{ formatDate(activity.date) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions Section -->
          <div class="bg-card dark:bg-card border border-border dark:border-border rounded-2xl p-5 sm:p-6 shadow-md">
            <h3 class="text-lg sm:text-xl font-bold text-shade-9 dark:text-shade-9 mb-5 flex items-center gap-2">
              <div class="size-10 flex items-center justify-center bg-gradient-to-br from-blue to-purple rounded-lg">
                <Icon name="solar:widget-bold" size="16" class="text-white" />
              </div>
              {{ $t('learning.quickActions.title') }}
            </h3>
            <div class="space-y-1">
              <NuxtLink to="/courses" class="block group">
                <div class="flex items-center gap-3.5 p-3.5 rounded-xl border border-transparent hover:border-blue/30 bg-gradient-to-r from-transparent to-transparent hover:from-blue/5 hover:to-blue/10 transition-all duration-300 cursor-pointer">
                  <div class="p-2.5 bg-gradient-to-br from-blue to-blue/80 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                    <Icon name="solar:magnifer-bold" size="20" class="text-white" />
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-shade-9 dark:text-shade-9 group-hover:text-blue transition-colors">
                      {{ $t('learning.quickActions.browseCourses') }}
                    </div>
                    <div class="text-xs text-shade-6 dark:text-shade-6">
                      {{ $t('learning.quickActions.browseCoursesDesc') }}
                    </div>
                  </div>
                  <Icon name="solar:alt-arrow-right-line-duotone" size="20" class="text-shade-5 dark:text-shade-5 group-hover:text-blue group-hover:translate-x-1 transition-all" />
                </div>
              </NuxtLink>

              <NuxtLink to="/profile?tab=MY_COURSES" class="block group">
                <div class="flex items-center gap-3.5 p-3.5 rounded-xl border border-transparent hover:border-purple/30 bg-gradient-to-r from-transparent to-transparent hover:from-purple/5 hover:to-purple/10 transition-all duration-300 cursor-pointer">
                  <div class="p-2.5 bg-gradient-to-br from-purple to-purple/80 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                    <Icon name="solar:book-bookmark-bold" size="20" class="text-white" />
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-shade-9 dark:text-shade-9 group-hover:text-purple transition-colors">
                      {{ $t('learning.quickActions.myCourses') }}
                    </div>
                    <div class="text-xs text-shade-6 dark:text-shade-6">
                      {{ $t('learning.quickActions.myCoursesDesc') }}
                    </div>
                  </div>
                  <Icon name="solar:alt-arrow-right-line-duotone" size="20" class="text-shade-5 dark:text-shade-5 group-hover:text-purple group-hover:translate-x-1 transition-all" />
                </div>
              </NuxtLink>

              <NuxtLink to="/profile" class="block group">
                <div class="flex items-center gap-3.5 p-3.5 rounded-xl border border-transparent hover:border-green/30 bg-gradient-to-r from-transparent to-transparent hover:from-green/5 hover:to-green/10 transition-all duration-300 cursor-pointer">
                  <div class="p-2.5 bg-gradient-to-br from-green to-green/80 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
                    <Icon name="solar:user-circle-bold" size="20" class="text-white" />
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-shade-9 dark:text-shade-9 group-hover:text-green transition-colors">
                      {{ $t('learning.quickActions.myProfile') }}
                    </div>
                    <div class="text-xs text-shade-6 dark:text-shade-6">
                      {{ $t('learning.quickActions.myProfileDesc') }}
                    </div>
                  </div>
                  <Icon name="solar:alt-arrow-right-line-duotone" size="20" class="text-shade-5 dark:text-shade-5 group-hover:text-green group-hover:translate-x-1 transition-all" />
                </div>
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for activity section */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--shade-2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--blue), var(--purple));
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--blue-dark), var(--purple-dark));
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.stat-card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
