import type { Chapter, Course, Lesson } from '~/types/course.type'
import { defineStore } from 'pinia'
import { useCourseApi } from '~/composables/api/useCourseApi'

// Define lesson and chapter interfaces for the learning page
export interface CourseLesson extends Lesson {
  isCompleted: boolean
  isActive: boolean
}

export interface CourseChapterStore extends Chapter {
  isExpanded: boolean
  lessons: CourseLesson[]
}

export interface LearningState {
  // Course data
  course: Course | null
  courseChapters: CourseChapterStore[]

  // UI state
  isLoading: boolean
  error: string | null
  activeTab: string

  // Learning progress
  activeLesson: CourseLesson | null
  completedLessons: Set<string>
  currentChapterId: string | null
}

export const useLearnStore = defineStore('learn', {
  state: (): LearningState => ({
    // Course data
    course: null,
    courseChapters: [],

    // UI state
    isLoading: false,
    error: null,
    activeTab: 'details',

    // Learning progress
    activeLesson: null,
    completedLessons: new Set(),
    currentChapterId: null,
  }),

  getters: {
    // Get current active lesson
    currentLesson: (state: LearningState): CourseLesson | null => {
      return state.activeLesson
    },

    // Get progress percentage
    progressPercentage: (state: LearningState): number => {
      const totalLessons = state.courseChapters.reduce((acc: number, chapter: CourseChapterStore) => acc + chapter.lessons.length, 0)
      if (totalLessons === 0)
        return 0
      return Math.round((state.completedLessons.size / totalLessons) * 100)
    },

    // Get expanded chapters
    expandedChapters: (state: LearningState): CourseChapterStore[] => {
      return state.courseChapters.filter((chapter: CourseChapterStore) => chapter.isExpanded)
    },

    // Get current chapter
    currentChapter: (state: LearningState): CourseChapterStore | null => {
      if (!state.currentChapterId)
        return null
      return state.courseChapters.find((chapter: CourseChapterStore) => chapter.id === state.currentChapterId) || null
    },
  },

  actions: {
    // Set loading state
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    // Set error state
    setError(error: string | null) {
      this.error = error
    },

    // Set active tab
    setActiveTab(tab: string) {
      this.activeTab = tab
    },

    // Set course data
    setCourse(course: Course) {
      this.course = course
    },

    // Set course chapters data
    setCourseChapters(courseChapters: CourseChapterStore[]) {
      this.courseChapters = courseChapters
    },

    // Load course data
    async loadCourse(courseId: string) {
      try {
        this.setLoading(true)
        this.setError(null)

        const { getDetailCourses, getChapters } = useCourseApi()

        // Fetch course details
        const courseData = await getDetailCourses(courseId)
        this.setCourse(courseData)

        // Fetch chapters
        const chaptersData = await getChapters(courseId)

        // Set course chapters with transformed lessons
        this.setCourseChapters(chaptersData.map((chapter: Chapter) => ({
          ...chapter,
          isExpanded: false,
          lessons: chapter.lessons.map((lesson: Lesson) => ({
            ...lesson,
            isCompleted: false,
            isActive: false,
          })) as CourseLesson[],
        })))

        // Load lesson from URL query after chapters are loaded
        this.loadLessonFromQuery()
      }
      catch (err) {
        console.error('Error loading course:', err)
        this.setError('Failed to load course data. Please try again later.')
      }
      finally {
        this.setLoading(false)
      }
    },

    // Toggle chapter expansion
    toggleChapter(chapterId: string) {
      const chapter = this.courseChapters.find((c: CourseChapterStore) => c.id === chapterId)
      if (chapter) {
        chapter.isExpanded = !chapter.isExpanded
      }
    },

    // Set active lesson
    setActiveLesson(lesson: CourseLesson) {
      // Reset all lessons to inactive
      this.courseChapters = this.courseChapters.map((chapter: CourseChapterStore) => ({
        ...chapter,
        lessons: chapter.lessons.map((les: CourseLesson) => ({
          ...les,
          isActive: lesson.id === les.id,
        })),
      }))

      // Set new active lesson
      this.activeLesson = lesson

      // Find and set current chapter
      const chapter = this.courseChapters.find((c: CourseChapterStore) =>
        c.lessons.some((l: CourseLesson) => l.id === lesson.id),
      )
      if (chapter) {
        this.setCurrentChapter(chapter.id)
        // Expand the chapter that contains the active lesson
        chapter.isExpanded = true
      }

      // Update URL query parameters
      this.updateUrlWithLessonId(lesson.id)
    },

    // Update URL with lesson ID
    updateUrlWithLessonId(lessonId: string) {
      if (typeof window !== 'undefined') {
        const route = useRoute()
        const router = useRouter()
        router.replace({
          query: {
            ...route.query,
            lessonId,
          },
        })
      }
    },

    // Load lesson from URL query
    loadLessonFromQuery() {
      if (typeof window !== 'undefined') {
        const route = useRoute()
        const lessonId = route.query.lessonId as string

        if (lessonId && this.courseChapters.length > 0) {
          // Find the lesson in chapters
          for (const chapter of this.courseChapters) {
            const lesson = chapter.lessons.find((l: CourseLesson) => l.id === lessonId)
            if (lesson) {
              // Set the lesson as active without updating URL (to avoid loop)
              this.setActiveLessonFromQuery(lesson as CourseLesson)
              break
            }
          }
        }
      }
    },

    // Set active lesson from query (without updating URL)
    setActiveLessonFromQuery(lesson: CourseLesson) {
      // Reset all lessons to inactive
      this.courseChapters = this.courseChapters.map((chapter: CourseChapterStore) => ({
        ...chapter,
        lessons: chapter.lessons.map((les: CourseLesson) => ({
          ...les,
          isActive: lesson.id === les.id,
        })),
      }))

      // Set new active lesson
      this.activeLesson = lesson

      // Find and set current chapter
      const chapter = this.courseChapters.find((c: CourseChapterStore) =>
        c.lessons.some((l: CourseLesson) => l.id === lesson.id),
      )
      if (chapter) {
        this.setCurrentChapter(chapter.id)
        // Expand the chapter that contains the active lesson
        chapter.isExpanded = true
      }
    },

    // Set current chapter
    setCurrentChapter(chapterId: string) {
      this.currentChapterId = chapterId
    },

    // Toggle lesson completion
    toggleLessonCompletion(lessonId: string, completed: boolean) {
      // Find lesson in all chapters
      for (const chapter of this.courseChapters) {
        const lesson = chapter.lessons.find((l: CourseLesson) => l.id === lessonId)
        if (lesson) {
          (lesson as any).isCompleted = completed

          // Update completed lessons set
          if (completed) {
            this.completedLessons.add(lessonId)
          }
          else {
            this.completedLessons.delete(lessonId)
          }
          break
        }
      }
    },

    // Mark lesson as completed
    completeLesson(lessonId: string) {
      this.toggleLessonCompletion(lessonId, true)
    },

    // Mark lesson as incomplete
    incompleteLesson(lessonId: string) {
      this.toggleLessonCompletion(lessonId, false)
    },

    // Get previous lesson
    getPreviousLesson(): CourseLesson | null {
      const allLessons = this.courseChapters.flatMap((chapter: CourseChapterStore) => chapter.lessons)
      const currentIndex = allLessons.findIndex((lesson: CourseLesson) => lesson.id === this.activeLesson?.id)

      if (currentIndex > 0) {
        return allLessons[currentIndex - 1]
      }

      return null
    },

    // Reset store state
    reset() {
      this.course = null
      this.courseChapters = []
      this.isLoading = false
      this.error = null
      this.activeTab = 'details'
      this.activeLesson = null
      this.completedLessons.clear()
      this.currentChapterId = null
    },
  },
})
