<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue'
import CourseChapterItem from '~/components/learning/CourseChapterItem.vue'
import { useLearnStore } from '~/stores/learn.store'
import 'video.js/dist/video-js.css'

// Page meta
definePageMeta({
  layout: 'default',
})

// Get route params
const route = useRoute()
const courseId = route.params.id as string

// Use learn store
const learnStore = useLearnStore()

// Computed properties from store
const course = computed(() => learnStore.course)
const courseChapters = computed(() => learnStore.courseChapters)
const activeLesson = computed(() => learnStore.activeLesson)
const isLoading = computed(() => learnStore.isLoading)
const error = computed(() => learnStore.error)
const activeTab = computed({
  get: () => learnStore.activeTab,
  set: (value: string) => learnStore.setActiveTab(value),
})

// Mock data for demonstration
const instructorAvatar = ref('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')

const courseStudents = ref([
  { id: '1', name: 'Natali Craig', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face' },
  { id: '2', name: 'Drew Cano', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: '3', name: 'Andi Lane', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: '4', name: 'Koray Okumus', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: '5', name: 'Kate Morrison', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { id: '6', name: 'Melody Macy', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
])

onMounted(async () => {
  await learnStore.loadCourse(courseId)
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
              Loading course...
            </p>
          </div>
        </a-spin>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <Icon name="tabler:alert-circle" class="text-red-500 text-6xl mx-auto mb-4" />
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Course
          </h2>
          <p class="text-gray-600 mb-4">
            {{ error }}
          </p>
          <a-button type="primary" @click="() => navigateTo(route.fullPath, { replace: true })">
            Try Again
          </a-button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content Area -->
        <div class="lg:col-span-2">
          <h1 class="text-2xl font-semibold text-gray-900 mb-6">
            {{ course?.title || 'Introduction to User Experience Design' }}
          </h1>
          <!-- Video Player Area -->
          <div class="relative w-full rounded-2xl overflow-hidden mb-6 bg-gray-900 aspect-video">
            <!-- <img
              v-if="course?.thumbnail"
              :src="course.thumbnail"
              :alt="course.title"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gradient-to-br from-green-900 to-green-950 flex items-center justify-center">
              <Icon name="tabler:play-filled" class="text-white text-6xl" />
            </div> -->
            <VideoPlayer
              class="w-full h-full"
              style="width: 100%; height: 100%;"
              :src="activeLesson?.video_url"
              controls :loop="true"
              :volume="0.6"
            />
          </div>
          <a-divider />
          <!-- Tabs Section -->
          <div class="mb-6">
            <a-tabs v-model:active-key="activeTab" class="course-tabs space-x-6">
              <a-tab-pane key="details" tab="Details">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <!-- Course Overview -->
                  <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">
                      Course Overview
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
                      Instructor
                    </h2>
                    <div class="flex items-start gap-4">
                      <div class="flex-shrink-0">
                        <a-avatar :size="120" :src="instructorAvatar" />
                      </div>
                      <div class="flex-1">
                        <div class="mb-2">
                          <h3 class="text-xl font-semibold text-blue-600">
                            {{ course?.teacher?.full_name || 'Ronald Richards' }}
                          </h3>
                          <p class="text-gray-700">
                            UI/UX Designer
                          </p>
                        </div>
                        <div class="flex flex-wrap gap-6 mb-4">
                          <div class="flex items-center gap-1">
                            <Icon name="tabler:award" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">40,445 Reviews</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Icon name="tabler:school" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">500 Students</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <Icon name="tabler:play" class="text-gray-600" size="20" />
                            <span class="text-sm text-gray-900">15 Courses</span>
                          </div>
                        </div>
                        <p class="text-gray-700 leading-relaxed">
                          With over a decade of industry experience, Ronald brings a wealth of practical knowledge to
                          the classroom. He has played a pivotal role in designing user-centric interfaces for renowned
                          tech companies, ensuring seamless and engaging user experiences.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <a-tab-pane key="quiz" tab="Quiz (1)">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">
                    Course Quiz
                  </h2>
                  <a-empty description="No quizzes available for this lesson yet." />
                </div>
              </a-tab-pane>

              <a-tab-pane key="comments" tab="Comment (2)">
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">
                    Comments
                  </h2>
                  <a-empty description="No comments yet. Be the first to comment!" />
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-9">
          <!-- Course Completion Card -->
          <div class="bg-white border border-gray-200 rounded-2xl course-completion-card">
            <h2 class="border-b pb-4 text-2xl px-4 mt-4 font-bold text-gray-900">
              Course Completion
            </h2>

            <!-- Chapter Sections with Lessons -->
            <div class="space-y-0">
              <CourseChapterItem
                v-for="chapter in courseChapters" :key="chapter.id" :chapter="chapter"
              />
            </div>
          </div>

          <!-- Students Section -->
          <div class="rounded-2xl p-4 mt-9">
            <div class="mb-4">
              <div class="text-xl font-semibold text-gray-900 mb-2 px-2">
                Student in course (20)
              </div>
            </div>

            <div class="space-y-1">
              <div
                v-for="student in courseStudents" :key="student.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <a-avatar :size="38" :src="student.avatar" :alt="student.name">
                  {{ student.name.charAt(0) }}
                </a-avatar>
                <span class="text-sm font-medium text-gray-900">{{ student.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
