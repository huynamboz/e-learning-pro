<script setup lang="ts">
import type { Chapter, Lesson, LessonMaterial } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

// Dynamically import VueOfficePptx component
const VueOfficePptx = defineAsyncComponent(() => import('@vue-office/pptx').then(m => m.default))

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const courseApi = useCourseApi()

const courseId = computed(() => route.params.id as string)
const lessonId = computed(() => route.query.lessonId as string)
const documentId = computed(() => route.query.documentId as string)

// State
const loading = ref(true)
const error = ref<string | null>(null)
const course = ref<any>(null)
const chapters = ref<Chapter[]>([])
const lesson = ref<Lesson | null>(null)
const document = ref<LessonMaterial | null>(null)
const currentChapterId = ref<string>('')

// PPTX viewer state
const pptxError = ref<string | null>(null)
const pptxLoading = ref(true)
const showPptxViewer = ref(false)

// Fetch course and chapters
async function fetchCourse() {
  try {
    loading.value = true
    error.value = null

    // Fetch course details
    const courseData = await courseApi.getDetailCourses(courseId.value)
    course.value = courseData

    // Fetch chapters
    const chaptersData = await courseApi.getChapters(courseId.value)
    chapters.value = chaptersData

    // Find chapter containing the lesson
    if (lessonId.value) {
      for (const chapter of chapters.value) {
        const foundLesson = chapter.lessons?.find(l => l.id === lessonId.value)
        if (foundLesson) {
          currentChapterId.value = chapter.id
          await fetchLesson(chapter.id)
          break
        }
      }
    }
  }
  catch (err: any) {
    console.error('Error fetching course:', err)
    error.value = err?.data?.message || 'Failed to load course'
    notification.error({
      message: 'Error',
      description: error.value,
    })
  }
  finally {
    loading.value = false
  }
}

// Fetch lesson detail
async function fetchLesson(chapterId: string) {
  if (!lessonId.value)
    return

  try {
    const lessonData = await courseApi.getLesson(courseId.value, chapterId, lessonId.value)
    lesson.value = lessonData

    // Find document by documentId
    if (documentId.value && lessonData.materials) {
      const foundDocument = lessonData.materials.find((m: LessonMaterial) => m.id === documentId.value)
      if (foundDocument) {
        document.value = foundDocument

        // Check access
        if (!foundDocument.has_access) {
          error.value = 'You do not have access to this document'
          notification.error({
            message: 'Access Denied',
            description: 'You do not have permission to view this document',
          })
        }
        else {
          // Load PPTX preview after document is found
          // Will be loaded when container is ready
        }
      }
      else {
        error.value = 'Document not found'
        notification.error({
          message: 'Not Found',
          description: 'The requested document could not be found',
        })
      }
    }
  }
  catch (err: any) {
    console.error('Error fetching lesson:', err)
    error.value = err?.data?.message || 'Failed to load lesson'
    notification.error({
      message: 'Error',
      description: error.value,
    })
  }
}

// Check if document is PowerPoint (PPTX or PPT)
const isPptx = computed(() => {
  if (!document.value)
    return false
  return document.value.file_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    || document.value.file_type === 'application/vnd.ms-powerpoint'
    || document.value.file_type?.includes('pptx')
    || document.value.file_type?.includes('ppt')
    || document.value.file_type?.includes('powerpoint')
    || document.value.file_type?.includes('presentation')
})

// Get document URL
const documentUrl = computed(() => {
  if (!document.value)
    return null
  return document.value.file_url || document.value.file_path || null
})

// Load PPTX preview
async function loadPptxPreview() {
  if (!documentUrl.value || !isPptx.value) {
    return
  }

  try {
    pptxLoading.value = true
    pptxError.value = null

    // Wait a bit for component to be ready
    await nextTick()

    // Show the viewer component
    showPptxViewer.value = true
    pptxLoading.value = false
  }
  catch (err: any) {
    console.error('PPTX loading error:', err)
    pptxError.value = err?.message || 'Failed to load PPTX document'
    pptxLoading.value = false
    notification.error({
      message: 'Error',
      description: 'Failed to load PPTX document. Please try again or download the file.',
    })
  }
}

watch([document, isPptx], () => {
  if (document.value && isPptx.value && document.value.has_access) {
    loadPptxPreview()
  }
}, {
  immediate: true,
})

// Prevent download and save
function preventDownload(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}

function _preventContextMenu(event: Event) {
  event.preventDefault()
}

function _preventKeydown(event: KeyboardEvent) {
  // Disable common save shortcuts
  if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
    event.preventDefault()
    notification.warning({
      message: 'Download Disabled',
      description: 'Saving this document is not allowed',
    })
  }
  // Disable print shortcut
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault()
    notification.warning({
      message: 'Print Disabled',
      description: 'Printing this document is not allowed',
    })
  }
}

// Handle back
function handleBack() {
  router.push(`/learning/${courseId.value}?lessonId=${lessonId.value}`)
}

// Initialize
onMounted(async () => {
  if (!lessonId.value || !documentId.value) {
    error.value = 'Missing required parameters'
    loading.value = false
    return
  }

  await fetchCourse()
})

// SEO
useHead({
  title: () => {
    if (document.value)
      return `${document.value.title} - ${course.value?.title || 'Document'}`
    return 'Document Viewer'
  },
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <a-button type="text" size="small" class="!flex !items-center !justify-center !p-1" @click="handleBack">
              <Icon name="solar:alt-arrow-left-outline" size="18" />
            </a-button>
            <div class="min-w-0 flex-1">
              <h1 class="text-base font-medium text-gray-900 truncate">
                {{ document?.title || 'Document Viewer' }}
              </h1>
              <p v-if="course" class="text-xs text-gray-500 truncate">
                {{ course.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <a-spin size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <a-alert type="error" :message="error" show-icon closable @close="error = null" />
    </div>

    <!-- Document Viewer -->
    <div
      v-else-if="document && documentUrl && isPptx" class="mx-auto flex-1 flex flex-col pptx-viewer-container"
      @contextmenu.prevent="preventDownload"
    >
      <!-- PPTX Viewer -->
      <div v-if="pptxLoading" class="flex items-center justify-center py-20">
        <a-spin size="large" />
        <span class="ml-3 text-gray-600">Loading PowerPoint...</span>
      </div>

      <a-alert v-if="pptxError" type="error" :message="pptxError" show-icon class="m-4" />

      <!-- PPTX Preview Container -->
      <ClientOnly v-if="!pptxError && showPptxViewer">
        <VueOfficePptx :src="documentUrl" style="width: 100%; min-height: 600px; height: 100%; flex: 1;" />
      </ClientOnly>
    </div>

    <!-- No Document State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <Icon name="solar:presentation-graph-bold" size="64" class="text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Document not found
        </h3>
        <p class="text-gray-500 mb-4">
          The requested document could not be found.
        </p>
        <a-button type="primary" @click="handleBack">
          Back to Lesson
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pptx-viewer-container {
  position: relative;
  min-height: 600px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.pptx-container {
  /* padding: 2rem; */
  background: #f5f5f5;
  min-height: 600px;
  width: 100%;
}

/* Prevent text selection */
.pptx-viewer-container * {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide download buttons */
:deep(.pptx-viewer-container a),
:deep(.pptx-viewer-container button[download]) {
  display: none !important;
}
:deep(.pptx-preview-wrapper) {
  height: 100% !important;
}
</style>
