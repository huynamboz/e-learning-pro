import type { Chapter, Course, Lesson, LessonPayload } from '~/types/course.type'
import { defineStore } from 'pinia'
import { useCourseApi } from '~/composables/api/useCourseApi'

// Define lesson and chapter interfaces for the learning page
export interface CourseLesson extends Lesson {
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
  currentChapterId: string | null

  // Sidebar progress data
  sidebarProgress: {
    attendance: {
      percentage: number
      value: string
      label: string
    }
    courseCompletion: {
      percentage: number
      value: string
      label: string
    }
  }
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
    currentChapterId: null,

    // Sidebar progress data
    sidebarProgress: {
      attendance: {
        percentage: 0,
        value: '0/0',
        label: 'Attendance'
      },
      courseCompletion: {
        percentage: 0,
        value: '0/0',
        label: 'Course Completion'
      }
    },
  }),

  getters: {
    // Get current active lesson
    currentLesson: (state: LearningState): CourseLesson | null => {
      return state.activeLesson
    },

    // Get completed lessons from chapters
    completedLessons: (state: LearningState): Set<string> => {
      const completed = new Set<string>()
      state.courseChapters.forEach((chapter: CourseChapterStore) => {
        chapter.lessons.forEach((lesson: CourseLesson) => {
          if (lesson.is_completed) {
            completed.add(lesson.id)
          }
        })
      })
      return completed
    },

    // Get progress percentage
    progressPercentage: (state: LearningState): number => {
      const totalLessons = state.courseChapters.reduce((acc: number, chapter: CourseChapterStore) => acc + chapter.lessons.length, 0)
      if (totalLessons === 0)
        return 0
      
      // Calculate completed lessons from chapters
      const completedCount = state.courseChapters.reduce((acc: number, chapter: CourseChapterStore) => {
        return acc + chapter.lessons.filter((lesson: CourseLesson) => lesson.is_completed).length
      }, 0)
      
      return Math.round((completedCount / totalLessons) * 100)
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
          isExpanded: true,
          lessons: chapter.lessons.map((lesson: Lesson) => ({
            ...lesson,
            is_completed: lesson.is_completed,
            isActive: false,
          })) as CourseLesson[],
        })))

        // Load lesson from URL query after chapters are loaded
        this.loadLessonFromQuery()

        // Load sidebar progress data
        await this.loadSidebarProgress()
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
    async toggleLessonCompletion(lessonId: string, completed: boolean) {
      if (!this.course) {
        console.error('No course loaded')
        return
      }

      // Find lesson in all chapters to get chapterId
      let chapterId: string | null = null
      let lesson: CourseLesson | null = null
      
      for (const chapter of this.courseChapters) {
        const foundLesson = chapter.lessons.find((l: CourseLesson) => l.id === lessonId)
        if (foundLesson) {
          chapterId = chapter.id
          lesson = foundLesson
          break
        }
      }

      if (!chapterId || !lesson) {
        console.error('Lesson not found')
        return
      }

      try {
        // Call API to update lesson completion
        const { patchLesson } = useCourseApi()
        await patchLesson(this.course.id, chapterId, lessonId, {
          is_completed: completed
        })

        // Update local state only after successful API call
        lesson.is_completed = completed

        // Refresh sidebar progress after lesson completion change
        await this.loadSidebarProgress()
      } catch (error) {
        console.error('Error updating lesson completion:', error)
        // Optionally show error notification to user
        throw error
      }
    },

    // Mark lesson as completed
    async completeLesson(lessonId: string) {
      await this.toggleLessonCompletion(lessonId, true)
    },

    // Mark lesson as incomplete
    async incompleteLesson(lessonId: string) {
      await this.toggleLessonCompletion(lessonId, false)
    },

    // Update sidebar progress
    updateSidebarProgress(progress: {
      attendance?: {
        percentage: number
        value: string
        label: string
      }
      courseCompletion?: {
        percentage: number
        value: string
        label: string
      }
    }) {
      if (progress.attendance) {
        this.sidebarProgress.attendance = progress.attendance
      }
      if (progress.courseCompletion) {
        this.sidebarProgress.courseCompletion = progress.courseCompletion
      }
    },

    // Load sidebar progress data
    async loadSidebarProgress() {
      try {
        // This would typically call APIs to get attendance and course completion data
        // For now, we'll use mock data or calculate from existing data
        
        // Calculate course completion from completed lessons
        const totalLessons = this.courseChapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
        const completedCount = this.completedLessons.size
        const completionPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
        
        console.log('completionPercentage', completionPercentage)
        console.log('completedCount', completedCount)
        console.log('totalLessons', totalLessons)
        this.updateSidebarProgress({
          courseCompletion: {
            percentage: completionPercentage,
            value: `${completedCount}/${totalLessons}`,
            label: 'Course Completion'
          }
        })
        
        // For attendance, we would need to call a separate API
        // This is a placeholder - you would implement based on your attendance API
        this.updateSidebarProgress({
          attendance: {
            percentage: 80, // This should come from API
            value: '4/5', // This should come from API
            label: 'Attendance'
          }
        })
      } catch (error) {
        console.error('Error loading sidebar progress:', error)
      }
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
