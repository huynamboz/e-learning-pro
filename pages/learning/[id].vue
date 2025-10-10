<script setup lang="ts">
import type { Course } from '~/types/course.type'
import { computed, ref } from 'vue'

// Define lesson and chapter interfaces for the learning page
interface CourseLesson {
  id: string
  title: string
  duration: string
  isCompleted: boolean
  isActive: boolean
}

interface CourseChapter {
  id: string
  title: string
  lessonsCount: number
  duration: string
  isExpanded: boolean
  lessons: CourseLesson[]
}

// Page meta
definePageMeta({
  layout: 'default',
})

// Get route params
const route = useRoute()
const courseId = route.params.id as string

// Reactive data
const activeTab = ref('details')
const course = ref<Course | null>(null)

// Mock data for demonstration
const instructorAvatar = ref('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face')

const courseChapters = ref<CourseChapter[]>([
  {
    id: '1',
    title: 'Introduction to UX Design',
    lessonsCount: 5,
    duration: '1 hour',
    isExpanded: true,
    lessons: [
      {
        id: '1-1',
        title: 'What is User Experience (UX) Design?',
        duration: '4min',
        isCompleted: true,
        isActive: false,
      },
      {
        id: '1-2',
        title: 'Historical Overview of UX Design',
        duration: '4min',
        isCompleted: true,
        isActive: false,
      },
      {
        id: '1-3',
        title: 'Understanding User-Centered Design',
        duration: '4min',
        isCompleted: false,
        isActive: true,
      },
      {
        id: '1-4',
        title: 'The Role of UX Design in Digital Products',
        duration: '4min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '1-5',
        title: 'Introduction to UX Design Tools and Techniques',
        duration: '4min',
        isCompleted: false,
        isActive: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Basics of User-Centered Design',
    lessonsCount: 4,
    duration: '50min',
    isExpanded: false,
    lessons: [
      {
        id: '2-1',
        title: 'Understanding User Needs',
        duration: '12min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '2-2',
        title: 'User Research Methods',
        duration: '15min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '2-3',
        title: 'Creating User Personas',
        duration: '10min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '2-4',
        title: 'User Journey Mapping',
        duration: '13min',
        isCompleted: false,
        isActive: false,
      },
    ],
  },
  {
    id: '3',
    title: 'Elements of User Experience',
    lessonsCount: 6,
    duration: '1 hour 20min',
    isExpanded: false,
    lessons: [
      {
        id: '3-1',
        title: 'Information Architecture',
        duration: '15min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '3-2',
        title: 'Interaction Design Principles',
        duration: '12min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '3-3',
        title: 'Visual Hierarchy',
        duration: '10min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '3-4',
        title: 'Navigation Design',
        duration: '18min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '3-5',
        title: 'Content Strategy',
        duration: '14min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '3-6',
        title: 'Accessibility in UX',
        duration: '11min',
        isCompleted: false,
        isActive: false,
      },
    ],
  },
  {
    id: '4',
    title: 'Visual Design Principles',
    lessonsCount: 5,
    duration: '1 hour 5min',
    isExpanded: false,
    lessons: [
      {
        id: '4-1',
        title: 'Color Theory in UX',
        duration: '12min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '4-2',
        title: 'Typography for Digital Interfaces',
        duration: '15min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '4-3',
        title: 'Layout and Grid Systems',
        duration: '18min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '4-4',
        title: 'Icons and Imagery',
        duration: '10min',
        isCompleted: false,
        isActive: false,
      },
      {
        id: '4-5',
        title: 'Creating Style Guides',
        duration: '10min',
        isCompleted: false,
        isActive: false,
      },
    ],
  },
])

// Computed property to get all lessons from all chapters (for future use)
const _allLessons = computed(() => {
  return courseChapters.value.flatMap(chapter =>
    chapter.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      globalIndex: courseChapters.value
        .slice(0, courseChapters.value.findIndex(c => c.id === chapter.id))
        .reduce((acc, ch) => acc + ch.lessons.length, 0) + lessonIndex + 1,
    })),
  )
})

const courseStudents = ref([
  { id: '1', name: 'Natali Craig', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face' },
  { id: '2', name: 'Drew Cano', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: '3', name: 'Andi Lane', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: '4', name: 'Koray Okumus', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: '5', name: 'Kate Morrison', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
  { id: '6', name: 'Melody Macy', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face' },
])

function selectLesson(lesson: CourseLesson) {
  // Update active lesson - reset all lessons in all chapters
  courseChapters.value.forEach((chapter) => {
    chapter.lessons.forEach(l => l.isActive = false)
  })
  lesson.isActive = true

  // TODO: Load lesson content
}

function toggleLessonCompletion(lessonId: string, completed: boolean) {
  // Find lesson in all chapters
  for (const chapter of courseChapters.value) {
    const lesson = chapter.lessons.find(l => l.id === lessonId)
    if (lesson) {
      lesson.isCompleted = completed
      break
    }
  }
}

function toggleChapter(chapterId: string) {
  const chapter = courseChapters.value.find(c => c.id === chapterId)
  if (chapter) {
    chapter.isExpanded = !chapter.isExpanded
  }
}

// Load course data
onMounted(async () => {
  try {
    // TODO: Fetch actual course data from API
    course.value = {
      id: courseId,
      title: 'Introduction to User Experience Design',
      description: 'Embark on a transformative journey into the dynamic world of User Experience (UX) Design with our comprehensive course, "Introduction to User Experience Design." This course is meticulously crafted to provide you with a foundational understanding of the principles, methodologies, and tools that drive exceptional user experiences in the digital landscape.',
      teacher: {
        full_name: 'Ronald Richards',
      },
    } as any
  }
  catch (error) {
    console.error('Error loading course:', error)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Content Area -->
        <div class="lg:col-span-2">
          <h1 class="text-2xl font-semibold text-gray-900 mb-6">
            {{ course?.title || 'Introduction to User Experience Design' }}
          </h1>
          <!-- Video Player Area -->
          <div class="relative w-full rounded-2xl overflow-hidden mb-6 bg-gray-900 aspect-video">
            <img
              v-if="course?.thumbnail"
              :src="course.thumbnail"
              :alt="course.title"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gradient-to-br from-green-900 to-green-950 flex items-center justify-center">
              <Icon name="tabler:play-filled" class="text-white text-6xl" />
            </div>
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
                    <p class="text-gray-700 leading-relaxed">
                      {{ course?.description || `Embark on a transformative journey into the dynamic world of User Experience (UX) Design with our comprehensive course, "Introduction to User Experience Design." This course is meticulously crafted to provide you with a foundational understanding of the principles, methodologies, and tools that drive exceptional user experiences in the digital landscape.` }}
                    </p>
                  </div>

                  <!-- Key Learning Objectives -->
                  <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">
                      Key Learning Objectives
                    </h2>
                    <ul class="text-gray-700 leading-relaxed">
                      <li>Gain a clear understanding of what User Experience (UX) Design entails and its importance in today's digital world.</li>
                      <li>Explore the fundamental principles of user-centered design and how to apply them to create intuitive and user-friendly interfaces.</li>
                      <li>Learn about the various elements that contribute to a positive user experience, including information architecture, interaction design, and visual design.</li>
                    </ul>
                  </div>

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
                          With over a decade of industry experience, Ronald brings a wealth of practical knowledge to the classroom. He has played a pivotal role in designing user-centric interfaces for renowned tech companies, ensuring seamless and engaging user experiences.
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
          <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h2 class="text-2xl font-semibold text-gray-900 mb-8 px-2">
              Course Completion
            </h2>

            <!-- Chapter Sections with Lessons -->
            <div class="space-y-0">
              <div
                v-for="chapter in courseChapters"
                :key="chapter.id"
                class="border-b border-gray-200 last:border-b-0"
              >
                <!-- Chapter Header -->
                <div
                  class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50  transition-all duration-200"
                  @click="toggleChapter(chapter.id)"
                >
                  <div class="flex items-center gap-4">
                    <Icon
                      :name="chapter.isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'"
                      class="text-gray-600"
                      size="20"
                    />
                    <span class="text-lg font-semibold text-gray-900">{{ chapter.title }}</span>
                  </div>
                </div>

                <!-- Chapter Lessons (shown when expanded) -->
                <div v-if="chapter.isExpanded" class="space-y-0">
                  <div
                    v-for="(lesson, lessonIndex) in chapter.lessons"
                    :key="lesson.id"
                    class="flex items-center justify-between px-4 py-6 group hover:bg-green-600 hover:text-white cursor-pointer"
                    :class="{
                      'bg-green-600 text-white': lesson.isActive,
                      'bg-gray-50': !lesson.isActive,
                    }"
                    @click="selectLesson(lesson)"
                  >
                    <div class="flex items-center gap-2">
                      <a-checkbox
                        :checked="lesson.isCompleted"
                        :class="{ 'text-white': lesson.isActive }"
                        @change="(e: any) => toggleLessonCompletion(lesson.id, e.target.checked)"
                      />
                      <span class="font-medium group-hover:text-white">{{ lessonIndex + 1 }}.</span>
                      <span class="flex-1 group-hover:text-white" :class="{ 'text-white': lesson.isActive, 'text-gray-900': !lesson.isActive }">
                        {{ lesson.title }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5 group-hover:text-white" :class="{ 'text-white': lesson.isActive, 'text-gray-500': !lesson.isActive }">
                      <Icon name="tabler:video" size="20" />
                      <span class="text-sm">{{ lesson.duration }}</span>
                    </div>
                  </div>
                </div>
              </div>
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
                v-for="student in courseStudents"
                :key="student.id"
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

/* Custom checkbox styling for active lessons */
:deep(.ant-checkbox-wrapper-checked .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Override checkbox colors for active lesson */
.bg-green-600 :deep(.ant-checkbox-checked .ant-checkbox-inner) {
  background-color: white;
  border-color: white;
}

.bg-green-600 :deep(.ant-checkbox-checked .ant-checkbox-inner):after {
  border-color: #16a34a;
}
</style>
