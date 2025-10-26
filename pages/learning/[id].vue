<script setup lang="ts">
import type { CourseStudent } from '~/types/course.type'
import { VideoPlayer } from '@videojs-player/vue'
import { notification } from 'ant-design-vue'
import CommentList from '~/components/learning/CommentList.vue'
import CourseChapterItem from '~/components/learning/CourseChapterItem.vue'
import LearningQuizList from '~/components/learning/QuizList.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useLearnStore } from '~/stores/learn.store'
import 'video.js/dist/video-js.css'
// Nuxt auto-imports `ref`, `computed`, lifecycle hooks

// Page meta
definePageMeta({
  layout: 'default',
})

// Get route params and query
const route = useRoute()
const router = useRouter()
const courseId = route.params.id as string
const { t } = useI18n()

// Use learn store
const learnStore = useLearnStore()

// Use course API
const courseApi = useCourseApi()

// Computed properties from store
const course = computed(() => learnStore.course)
const courseChapters = computed(() => learnStore.courseChapters)
const activeLesson = computed(() => learnStore.activeLesson)
const isLoading = computed(() => learnStore.isLoading)
const error = computed(() => learnStore.error)

// Tab management with query persistence
const activeTab = computed({
  get: () => {
    // Get from query first, then fallback to store
    const queryTab = route.query.tab as string
    return queryTab || learnStore.activeTab || 'details'
  },
  set: (value: string) => {
    learnStore.setActiveTab(value)
    // Update query params
    router.replace({
      query: { ...route.query, tab: value },
    })
  },
})

// Student data
const courseStudents = ref<CourseStudent[]>([])
const studentsLoading = ref(false)
const studentsError = ref<string | null>(null)

// Comment data
const commentCount = ref(0)

// Video progress tracking
const videoProgress = ref(0)
const hasCompletedLesson = ref(false)
const isCompletingLesson = ref(false)

// Video player protection
const playerInstance = ref<any>(null)
const drmContainer = ref<HTMLElement | null>(null)
const videoPlayerOptions = {
  controls: true,
  preload: 'auto',
  autoplay: false,
  responsive: true,
  fluid: true,
  controlBar: {
    pictureInPictureToggle: false,
    remainingTimeDisplay: false,
    playToggle: true,
    progressControl: true,
    fullscreenToggle: true,
    currentTimeDisplay: true,
    volumePanel: {
      inline: false,
    },
  },
  html5: {
    nativeTextTracks: false,
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
}

function preventContextMenu(event: MouseEvent) {
  if (!drmContainer.value) {
    return
  }
  const target = event.target as HTMLElement | null
  if (target && drmContainer.value.contains(target)) {
    event.preventDefault()
  }
}

function preventKeydown(event: KeyboardEvent) {
  const blockedByModifier = (event.ctrlKey || event.metaKey)
  if (blockedByModifier && ['s', 'S', 'p', 'P', 'u', 'U'].includes(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (blockedByModifier && event.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (event.key === 'F12') {
    event.preventDefault()
    event.stopPropagation()
  }
}

function applyDrmAttributes(player: any) {
  if (!player) {
    return
  }
  const videoEl = player?.el?.()?.querySelector?.('video') as HTMLVideoElement | null
  if (videoEl) {
    videoEl.setAttribute('controlsList', 'nodownload noremoteplayback')
    videoEl.setAttribute('disablePictureInPicture', 'true')
    videoEl.setAttribute('playsinline', 'true')
    videoEl.setAttribute('webkit-playsinline', 'true')
    videoEl.oncontextmenu = (event) => {
      event.preventDefault()
    }
  }

}

function handlePlayerReady(player: any) {
  playerInstance.value = player
  applyDrmAttributes(player)
}

function handleVideoProgress() {
  if (!playerInstance.value || !activeLesson.value)
    return

  const currentTime = playerInstance.value.state.currentTime
  const duration = playerInstance.value.state.duration

  if (duration > 0) {
    const progress = (currentTime / duration) * 100
    videoProgress.value = progress

    // Check if user has watched more than 80% and lesson is not completed
    if (progress >= 80 && !activeLesson.value.is_completed && !hasCompletedLesson.value && !isCompletingLesson.value) {
      completeLessonAutomatically()
    }
  }
}

function handleVideoEnded() {
  if (!activeLesson.value || activeLesson.value.is_completed || hasCompletedLesson.value)
    return

  // If video ended and not completed, complete it automatically
  if (!isCompletingLesson.value) {
    completeLessonAutomatically()
  }
}

async function completeLessonAutomatically() {
  if (!activeLesson.value || isCompletingLesson.value)
    return

  try {
    isCompletingLesson.value = true
    hasCompletedLesson.value = true

    // Call the store method to complete the lesson
    await learnStore.completeLesson(activeLesson.value.id)

    // Show success notification
    notification.success({
      message: t('learning.lessonCompleted'),
      description: t('learning.lessonCompletedDesc', {
        title: activeLesson.value.title,
      }),
      duration: 4,
    })
  }
  catch (error: any) {
    console.error('Error completing lesson:', error)
    hasCompletedLesson.value = false

    // Show error notification
    notification.error({
      message: t('learning.lessonCompletionFailed'),
      description: error.message || t('learning.lessonCompletionFailedDesc'),
      duration: 4,
    })
  }
  finally {
    isCompletingLesson.value = false
  }
}

// Load course classmates
async function loadCourseStudents() {
  try {
    studentsLoading.value = true
    studentsError.value = null
    const response = await courseApi.getCourseClassmates(courseId)
    courseStudents.value = response.results
  }
  catch (err: any) {
    console.error('Error loading course classmates:', err)
    studentsError.value = err.message || 'Failed to load classmates'
  }
  finally {
    studentsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    learnStore.loadCourse(courseId),
    loadCourseStudents(),
  ])

  drmContainer.value = document.querySelector('.drm-protected')
  document.addEventListener('contextmenu', preventContextMenu)
  document.addEventListener('keydown', preventKeydown)

  // Sync tab state from query to store
  const queryTab = route.query.tab as string
  if (queryTab && queryTab !== learnStore.activeTab) {
    learnStore.setActiveTab(queryTab)
  }

  // Save courseId and lessonId to localStorage for navigation back from quiz results
  const lessonId = route.query.lessonId as string
  if (courseId) {
    localStorage.setItem('learning_course_id', courseId)
  }
  if (lessonId) {
    localStorage.setItem('learning_lesson_id', lessonId)
  }
})

watch(activeLesson, () => {
  if (!playerInstance.value) {
    return
  }

  // Reset progress tracking when lesson changes
  videoProgress.value = 0
  hasCompletedLesson.value = false
  isCompletingLesson.value = false

  nextTick(() => {
    applyDrmAttributes(playerInstance.value)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('contextmenu', preventContextMenu)
  document.removeEventListener('keydown', preventKeydown)

  if (playerInstance.value?.dispose) {
    playerInstance.value.dispose()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <a-spin size="large">
          <div class="text-center">
            <p class="text-gray-600 mt-4">
              {{ t('course.loadingCourse') }}
            </p>
          </div>
        </a-spin>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <Icon name="tabler:alert-circle" class="text-red-500 text-6xl mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            {{ t('course.errorLoadingCourse') }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ error }}
          </p>
          <a-button type="primary" @click="() => navigateTo(route.fullPath, { replace: true })">
            {{ t('common.tryAgain') }}
          </a-button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content Area -->
        <div class="lg:col-span-2">
          <h1 class="text-2xl font-semibold text-gray-900 mb-6">
            {{ course?.title || t('course.defaultTitle') }}
          </h1>
          <!-- Video Player Area -->
          <div ref="drmContainer" class="flex relative w-full rounded-2xl mb-6 bg-gray-900 aspect-video drm-protected" @contextmenu.prevent>
            <!-- <img
              v-if="course?.thumbnail"
              :src="course.thumbnail"
              :alt="course.title"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gradient-to-br from-green-900 to-green-950 flex items-center justify-center">
              <Icon name="tabler:play-filled" class="text-white text-6xl" />
            </div> -->
            <img v-if="!activeLesson" :src="course?.thumbnail || undefined" class="w-full h-full object-cover">
            <VideoPlayer
              v-if="activeLesson"
              :poster="activeLesson?.thumbnail || course?.thumbnail || undefined"
              :options="videoPlayerOptions"
              :width="400"
              :height="225"
              class="rounded-2xl overflow-hidden"
              :src="activeLesson?.video_url"
              controls
              :loop="true"
              :volume="0.6"
              playsinline
              @mounted="handlePlayerReady"
              @timeupdate="handleVideoProgress"
              @ended="handleVideoEnded"
            />

            <!-- Video Progress Indicator -->
            <div v-if="activeLesson && videoProgress > 0" class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
              {{ Math.round(videoProgress) }}%
            </div>
          </div>
          <a-divider />
          <!-- Tabs Section -->
          <div class="mb-6">
            <a-tabs v-model:active-key="activeTab" class="course-tabs space-x-6">
              <a-tab-pane key="details" :tab="$t('course.details')">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <!-- Course Overview -->
                  <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">
                      {{ t('course.overview') }}
                    </h2>
                    <p class="text-gray-700 leading-relaxed" v-html="course?.description" />
                  </div>

                  <!-- Key Learning Objectives -->
                  <!-- <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">
                      Key Learning Objectives
                    </h2>
                    <ul class="text-gray-700 leading-relaxed">
                      <li>Gain a clear understanding of what User Experience (UX) Design entails and its importance in today's digital world.</li>
                      <li>Explore the fundamental principles of user-centered design and how to apply them to create intuitive and user-friendly interfaces.</li>
                      <li>Learn about the various elements that contribute to a positive user experience, including information architecture, interaction design, and visual design.</li>
                    </ul>
                  </div> -->

                  <!-- Instructor Section -->
                  <div class="border-t border-gray-200 pt-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">
                      {{ t('course.instructor') }}
                    </h2>
                    <div class="flex items-start gap-4">
                      <div class="flex-shrink-0">
                        <a-avatar :size="120" :src="course?.teacher?.avatar || '/assets/images/teacher.webp'" />
                      </div>
                      <div class="flex-1">
                        <div class="mb-2">
                          <h3 class="text-xl font-semibold text-blue-600">
                            {{ course?.teacher?.full_name || t('course.defaultInstructor') }}
                          </h3>
                          <!-- <p class="text-gray-700">
                            {{ t('course.instructorTitle') }}
                          </p> -->
                        </div>
                        <div class="flex flex-wrap gap-6 mb-4">
                          <!-- <div class="flex items-center gap-1">
                            <Icon name="tabler:award" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">{{ t('course.reviews', { count: '0' }) }}</span>
                          </div> -->
                          <div class="flex items-center gap-1">
                            <Icon name="tabler:school" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">{{ t('course.students', { count: course?.teacher?.total_students || '0' }) }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Icon name="tabler:play" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">{{ t('course.courses', { count: course?.teacher?.total_courses || '0' }) }}</span>
                          </div>
                        </div>
                        <!-- <p class="text-gray-700 leading-relaxed">
                          {{ t('course.instructorDescription') }}
                        </p> -->
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <a-tab-pane key="quiz" :tab="`${t('course.quizTab')} (${activeLesson?.quiz_count || 0})`">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">
                    {{ t('course.courseQuiz') }}
                  </h2>
                  <LearningQuizList
                    :course-id="courseId"
                    :lesson-id="activeLesson?.id || undefined"
                  />
                </div>
              </a-tab-pane>

              <a-tab-pane key="comments" :tab="`${t('course.comments')} (${activeLesson?.comment_count || 0})`">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">
                    {{ t('course.comments') }}
                  </h2>
                  <CommentList
                    v-if="activeLesson"
                    :course-id="courseId"
                    :chapter-id="learnStore.currentChapterId || ''"
                    :lesson-id="activeLesson.id"
                    @comment-count-updated="commentCount = $event"
                  />
                  <div v-else class="text-center py-8">
                    <Icon name="tabler:video" class="text-gray-400 text-4xl mx-auto mb-3" />
                    <p class="text-gray-500">
                      {{ t('course.selectLessonToViewComments') }}
                    </p>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-9">
          <!-- Course Completion Card -->
          <div class="max-h-[calc(90vh-100px)] overflow-y-auto bg-white border border-gray-200 rounded-2xl course-completion-card">
            <h2 class="border-b pb-4 text-2xl px-4 mt-4 font-bold text-gray-900">
              {{ t('course.courseContent') }}
            </h2>

            <!-- Chapter Sections with Lessons -->
            <div class="space-y-0">
              <CourseChapterItem
                v-for="chapter in courseChapters"
                :key="chapter.id"
                :chapter="chapter"
              />
            </div>
          </div>

          <!-- Students Section -->
          <div class="rounded-2xl p-4 mt-9">
            <div class="mb-4">
              <div class="text-xl font-semibold text-gray-900 mb-2 px-2">
                {{ t('course.classmates', { count: courseStudents.length }) }}
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="studentsLoading" class="flex items-center justify-center py-8">
              <a-spin size="small" />
              <span class="ml-2 text-gray-600">{{ t('course.loadingClassmates') }}</span>
            </div>

            <!-- Error State -->
            <div v-else-if="studentsError" class="text-center py-8">
              <Icon name="tabler:alert-circle" class="text-red-500 text-2xl mx-auto mb-2" />
              <p class="text-sm text-red-600 mb-2">
                {{ studentsError }}
              </p>
              <a-button size="small" @click="loadCourseStudents">
                {{ t('common.tryAgain') }}
              </a-button>
            </div>

            <!-- Students List -->
            <div v-else-if="courseStudents.length > 0" class="space-y-1">
              <div
                v-for="student in courseStudents" :key="student.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <a-avatar :size="38" :alt="student.full_name" :src="student.avatar || '/assets/images/teacher.webp'">
                  {{ student.full_name.charAt(0) }}
                </a-avatar>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ student.full_name }}
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ student.username }}
                  </div>
                </div>
                <div v-if="student.enrollment?.completion_percentage" class="text-xs text-gray-400">
                  {{ Math.round(student.enrollment.completion_percentage) }}%
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <Icon name="tabler:users" class="text-gray-400 text-2xl mx-auto mb-2" />
              <p class="text-sm text-gray-500">
                {{ t('course.noClassmatesYet') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.vjs-picture-in-picture-control),
:deep(.vjs-airplay-control),
:deep(.vjs-remaining-time) {
  display: none !important;
}

.drm-protected video::-webkit-media-controls-enclosure {
  overflow: hidden;
}

.drm-protected video::-webkit-media-controls-download-button,
.drm-protected video::-webkit-media-controls-remote-playback-button {
  display: none !important;
}

.drm-protected video {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Custom tab styling */
.course-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 1.5rem;
}

.course-tabs :deep(.ant-tabs-nav::before) {
  display: none;
}

.course-tabs :deep(.ant-tabs-tab) {
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  /* margin: 0 12px; */
  background-color: white;
  margin-bottom: 0;
}

.course-tabs :deep(.ant-tabs-tab+.ant-tabs-tab) {
  margin-left: 24px;
}

.course-tabs :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #0F172A;
}

.course-tabs :deep(.ant-tabs-tab-active) {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.course-tabs :deep(.ant-tabs-tab):hover {
  border-color: #d1d5db;
}

.course-tabs :deep(.ant-tabs-tab-active):hover {
  border-color: #bfdbfe;
}

.course-tabs :deep(.ant-tabs-ink-bar) {
  display: none;
}

.course-tabs :deep(.ant-tabs-content-holder) {
  border: 0;
}

/* Course completion card styling */
.course-completion-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
