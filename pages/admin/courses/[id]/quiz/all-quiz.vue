<script setup lang="ts">
import QuizList from '~/components/admin/course/quiz/QuizList.vue'

// Get route parameters
const route = useRoute()

const router = useRouter()
const courseId = computed(() => route.params.id as string)

const { chapters, fetchChapters } = useCourse()
const { t } = useI18n()

// State management
const expandedChapters = ref<Set<string>>(new Set())

// Handle view switching
function switchToCreate(lessonId?: string, chapterId?: string) {
  const params = new URLSearchParams()
  if (lessonId)
    params.set('lessonId', lessonId)
  if (chapterId)
    params.set('chapterId', chapterId)

  const url = `/admin/courses/${courseId.value}/quiz/create${params.toString() ? `?${params.toString()}` : ''}`
  router.push(url)
}

function switchToEdit(quizId: string) {
  router.push(`/admin/courses/${courseId.value}/quiz/${quizId}/edit`)
}

// Toggle chapter expansion
function toggleChapter(chapterId: string) {
  if (expandedChapters.value.has(chapterId)) {
    expandedChapters.value.delete(chapterId)
  }
  else {
    expandedChapters.value.add(chapterId)
  }
}

// Expand all chapters
function expandAll() {
  chapters.value.forEach((chapter) => {
    expandedChapters.value.add(chapter.id)
  })
}

// Collapse all chapters
function collapseAll() {
  expandedChapters.value.clear()
}

// SEO
useHead({
  title: () => `${t('quiz.management.title')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('quiz.management.description') },
  ],
})

onMounted(async () => {
  if (courseId.value) {
    await fetchChapters(courseId.value)
  }
})
</script>

<template>
  <div class="quiz-management p-3 sm:p-6">
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 class="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
            {{ t('quiz.management.title') }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600">
            {{ t('quiz.management.description') }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div class="flex gap-2 flex-wrap">
            <a-button class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" @click="collapseAll">
              <Icon name="solar:minimise-square-2-bold" size="14" class="sm:text-base" />
              <span class="hidden sm:inline">Thu gọn tất cả</span>
            </a-button>
            <a-button class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" @click="expandAll">
              <Icon name="solar:maximise-square-2-bold" size="14" class="sm:text-base" />
              <span class="hidden sm:inline">Mở rộng tất cả</span>
            </a-button>
          </div>
          <a-button
            type="primary"
            class="!flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            @click="switchToCreate()"
          >
            <Icon name="solar:add-circle-bold" size="14" class="sm:text-base" />
            <span class="hidden sm:inline">{{ t('quiz.management.createNewQuiz') }}</span>
          </a-button>
        </div>
      </div>
    </div>

    <!-- Chapters and Lessons -->
    <div class="space-y-4 sm:space-y-6">
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <!-- Chapter Header -->
        <div
          class="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
          @click="toggleChapter(chapter.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Icon name="solar:book-2-bold" size="20" class="text-white sm:text-2xl" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {{ chapter.title }}
                </h2>
                <p class="text-xs sm:text-sm text-gray-600">
                  {{ chapter.lessons?.length || 0 }} bài học
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <span class="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                {{ expandedChapters.has(chapter.id) ? 'Thu gọn' : 'Mở rộng' }}
              </span>
              <Icon
                :name="expandedChapters.has(chapter.id) ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'"
                size="16"
                class="text-gray-500 sm:text-xl"
              />
            </div>
          </div>
        </div>

        <!-- Lessons -->
        <div v-if="expandedChapters.has(chapter.id)" class="divide-y divide-gray-100">
          <div
            v-for="lesson in chapter.lessons"
            :key="lesson.id"
            class="p-4 sm:p-6 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="solar:play-circle-bold" size="16" class="text-green-600 sm:text-xl" />
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    {{ lesson.title }}
                  </h3>
                  <p class="text-xs sm:text-sm text-gray-600">
                    {{ lesson.video_duration }} phút
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <a-button
                  type="primary"
                  size="small"
                  class="!flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  @click="switchToCreate(lesson.id, chapter.id)"
                >
                  <Icon name="solar:add-circle-bold" size="12" class="sm:text-sm" />
                  <span class="hidden sm:inline">Thêm Quiz</span>
                </a-button>
              </div>
            </div>

            <!-- Quiz List for this lesson -->
            <div class="ml-0 sm:ml-14">
              <QuizList
                :course-id="courseId"
                :lesson-id="lesson.id"
                :show-header="false"
                @create-quiz="() => switchToCreate(lesson.id, chapter.id)"
                @edit-quiz="switchToEdit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!chapters || chapters.length === 0" class="text-center py-8 sm:py-12">
      <div class="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="solar:book-2-bold" size="24" class="text-gray-400 sm:text-3xl" />
      </div>
      <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        Chưa có chương nào
      </h3>
      <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Tạo chương và bài học trước khi thêm quiz
      </p>
      <a-button type="primary" class="text-xs sm:text-sm" @click="router.push(`/admin/courses/${courseId}`)">
        Quay lại khóa học
      </a-button>
    </div>
  </div>
</template>
