<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { message } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

const courseApi = useCourseApi()
const { user } = useAuth()

// Reactive data
const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Check if user is teacher
const isTeacher = computed(() => user.value?.is_teacher || false)

// Load enrolled courses
async function loadEnrolledCourses() {
  try {
    loading.value = true
    error.value = null
    const response = await courseApi.getEnrolledCourses()
    courses.value = response.results || []
  }
  catch (err: any) {
    console.error('Error loading enrolled courses:', err)
    error.value = err.message || 'Failed to load enrolled courses'
    message.error('Failed to load enrolled courses')
  }
  finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  // Only load enrolled courses if user is not a teacher
  if (!isTeacher.value) {
    loadEnrolledCourses()
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Teacher Message -->
      <div v-if="isTeacher" class="text-center py-12">
        <div class="max-w-md mx-auto flex flex-col items-center justify-center">
          <Icon name="solar:graduation-cap-bold-duotone" class="text-blue-500 text-6xl mx-auto mb-6" />
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            {{ $t('profile.courses.teacher.title') }}
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            {{ $t('profile.courses.teacher.message') }}
          </p>
          <a-button
            type="primary"
            size="large"
            class="!h-12 !px-8 !rounded-lg !flex !items-center !gap-2"
            @click="() => navigateTo('/admin/courses')"
          >
            <template #icon>
              <Icon name="solar:settings-bold" size="18" />
            </template>
            {{ $t('profile.courses.teacher.goToDashboard') }}
          </a-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex items-center justify-center py-12">
        <a-spin size="large">
          <div class="text-center">
            <p class="text-gray-600 mt-4">
              {{ $t('profile.courses.loading') }}
            </p>
          </div>
        </a-spin>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="tabler:alert-circle" class="text-red-500 text-4xl mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ $t('profile.courses.error.title') }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ error }}
        </p>
        <a-button type="primary" @click="loadEnrolledCourses">
          {{ $t('profile.courses.error.tryAgain') }}
        </a-button>
      </div>

      <!-- Courses Grid -->
      <div v-else class="flex flex-col gap-6">
        <div v-if="courses.length === 0" class="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200">
          <div class="inline-flex p-4 bg-gray-100 rounded-full mb-4">
            <Icon name="solar:book-2-bold-duotone" class="text-gray-400 text-4xl" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            {{ $t('profile.courses.empty.title') }}
          </h3>
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            {{ $t('profile.courses.empty.message') }}
          </p>
          <a-button type="primary" size="large" class="!h-12 !px-8 !rounded-lg" @click="() => navigateTo('/learning')">
            <template #icon>
              <Icon name="solar:book-bookmark-bold" size="18" />
            </template>
            {{ $t('profile.courses.empty.browseCourses') }}
          </a-button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <div
            v-for="course in courses"
            :key="course.id"
            class="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            @click="() => navigateTo(`/learning/${course.id}`)"
          >
            <!-- Course Image -->
            <div class="relative w-full h-40 overflow-hidden bg-gray-100">
              <img
                :src="course.thumbnail || '/images/course-thumbnail-default.webp'"
                :alt="course.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="(e) => (e.target as HTMLImageElement).src = '/images/course-thumbnail-default.webp'"
              >
            </div>

            <!-- Course Info -->
            <div class="p-4 flex flex-col gap-3">
              <!-- Title and Category -->
              <div>
                <h3 class="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                  {{ course.title }}
                </h3>
                <div class="flex items-center flex-wrap gap-2">
                  <span
                    v-if="course.category"
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :style="{
                      backgroundColor: `${course.category.color}20`,
                      color: course.category.color,
                    }"
                  >
                    {{ course.category.name }}
                  </span>
                  <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {{ $t(`homepage.courses.levels.${course.level}`) || course.level }}
                  </span>
                </div>
              </div>


              <!-- Continue Learning Button -->
              <a-button
                type="primary"
                block
                class="!flex !items-center !justify-center !gap-2 !bg-green-600 hover:!bg-green-700 !border-green-600 !mt-1"
                @click.stop="() => navigateTo(`/learning/${course.id}`)"
              >
                <template #icon>
                  <Icon name="solar:play-circle-bold" size="14" />
                </template>
                {{ $t('profile.courses.continueLearning') }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
