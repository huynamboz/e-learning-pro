<script setup lang="ts">
import type { Chapter, Lesson, LessonMaterial } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { useCourseApi } from '~/composables/api/useCourseApi'
// PDF component - will be loaded dynamically
// const VuePdfEmbed = ref<any>(null)
// const usePdfEmbed = ref(false)

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

// PDF viewer state
const pdfError = ref<string | null>(null)
const pdfLoading = ref(true)
const pdfWidth = ref<number | null>(null) // null = 100% (default), range: 200-2000
const baseWidth = ref<number | null>(null) // Store initial width for percentage calculation
const minWidth = 200
const maxWidth = 2000
const widthStep = 100
const pdfWrapperRef = ref<HTMLElement | null>(null)

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

// Check if document is PDF
const isPdf = computed(() => {
  if (!document.value)
    return false
  return document.value.file_type === 'application/pdf' || document.value.file_type?.includes('pdf')
})

// Get document URL
const documentUrl = computed(() => {
  if (!document.value)
    return null
  return document.value.file_url || document.value.file_path || null
})

// PDF viewer handlers
function handlePdfLoaded(_pdf: any) {
  pdfLoading.value = false
  pdfError.value = null
}

function handlePdfError(error: any) {
  pdfLoading.value = false
  pdfError.value = error?.message || 'Failed to load PDF'
  console.error('PDF loading error:', error)
}

// Get initial element width (only used once to get base width)
function getInitialWidth(): number {
  if (pdfWrapperRef.value) {
    return pdfWrapperRef.value.offsetWidth || pdfWrapperRef.value.clientWidth
  }
  // Fallback: if no ref, return default
  return 800
}

// Zoom functions using width
function zoomIn() {
  // If first time (null), get initial width from element
  if (pdfWidth.value === null) {
    const initialWidth = getInitialWidth()
    baseWidth.value = initialWidth
    pdfWidth.value = initialWidth + widthStep
  }
  else {
    // Use current pdfWidth value
    const newWidth = pdfWidth.value + widthStep
    if (newWidth <= maxWidth) {
      pdfWidth.value = newWidth
    }
    else {
      pdfWidth.value = maxWidth
    }
  }
}

function zoomOut() {
  // If first time (null), get initial width from element
  if (pdfWidth.value === null) {
    const initialWidth = getInitialWidth()
    baseWidth.value = initialWidth
    pdfWidth.value = initialWidth - widthStep
  }
  else {
    // Use current pdfWidth value
    const newWidth = pdfWidth.value - widthStep
    if (newWidth >= minWidth) {
      pdfWidth.value = newWidth
    }
    else {
      pdfWidth.value = minWidth
    }
  }
}

function resetZoom() {
  pdfWidth.value = null // Reset to 100% (null)
  baseWidth.value = null // Reset base width
}

// Calculate zoom percentage (null = 100%)
const zoomPercentage = computed(() => {
  if (pdfWidth.value === null) {
    return 100 // Always 100% when null
  }
  // Use stored base width for calculation
  const base = baseWidth.value || getInitialWidth()
  return Math.round((pdfWidth.value / base) * 100)
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

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Initialize
onMounted(async () => {
  if (!lessonId.value || !documentId.value) {
    error.value = 'Missing required parameters'
    loading.value = false
    return
  }

  fetchCourse()

  // Add event listeners to prevent download
  // if (process.client) {
  //   document.value?.addEventListener('contextmenu', preventContextMenu)
  //   document.value?.addEventListener('keydown', preventKeydown)
  // }
})

onBeforeUnmount(() => {
  // if (process.client) {
  //   document.value?.removeEventListener('contextmenu', preventContextMenu)
  //   document.value?.removeEventListener('keydown', preventKeydown)
  // }
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
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a-button
              type="text"
              class="!flex !items-center !justify-center"
              @click="handleBack"
            >
              <Icon name="solar:alt-arrow-left-outline" size="20" />
            </a-button>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">
                {{ document?.title || 'Document Viewer' }}
              </h1>
              <p v-if="course" class="text-sm text-gray-500 mt-1">
                {{ course.title }}
              </p>
            </div>
          </div>
          <div v-if="isPdf" class="flex items-center gap-2">
            <!-- Zoom Controls -->
            <div class="flex items-center gap-2">
              <a-button
                :disabled="pdfWidth !== null && pdfWidth <= minWidth"
                size="small"
                title="Zoom Out"
                @click="zoomOut"
              >
                <Icon name="solar:zoom-out-bold" size="16" />
              </a-button>
              <span class="text-sm text-gray-600 px-2 min-w-[60px] text-center">
                {{ zoomPercentage }}%
              </span>
              <a-button
                :disabled="pdfWidth !== null && pdfWidth >= maxWidth"
                size="small"
                title="Zoom In"
                @click="zoomIn"
              >
                <Icon name="solar:zoom-in-bold" size="16" />
              </a-button>
              <a-button
                size="small"
                title="Reset Zoom"
                @click="resetZoom"
              >
                <Icon name="solar:restart-bold" size="16" />
              </a-button>
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
      <a-alert
        type="error"
        :message="error"
        show-icon
        closable
        @close="error = null"
      />
    </div>

    <!-- Document Viewer -->
    <div v-else-if="document && documentUrl" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- PDF Viewer -->
      <div v-if="isPdf" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="solar:file-text-bold" size="20" class="text-red-600" />
              <span class="text-sm font-medium text-gray-700">PDF Document</span>
            </div>
            <span v-if="document.file_size" class="text-xs text-gray-500">
              {{ formatFileSize(document.file_size) }}
            </span>
          </div>
        </div>

        <div
          class="pdf-viewer-container"
          @contextmenu.prevent="preventDownload"
          @click.prevent="preventDownload"
        >
          <div v-if="pdfLoading" class="flex items-center justify-center py-20">
            <a-spin size="large" />
            <span class="ml-3 text-gray-600">Loading PDF...</span>
          </div>

          <a-alert
            v-if="pdfError"
            type="error"
            :message="pdfError"
            show-icon
            class="m-4"
          />

          <!-- PDF Embed Component -->
          <div
            v-if="!pdfError && VuePdfEmbed"
            ref="pdfWrapperRef"
            class="pdf-embed-wrapper overflow-auto"
          >
            <VuePdfEmbed
              :source="documentUrl"
              :page="null"
              :width="pdfWidth"
              class="pdf-embed w-full justify-center flex flex-col items-center border-0"
              @loaded="handlePdfLoaded"
              @rendered="pdfLoading = false"
              @error="handlePdfError"
            />
          </div>
        </div>
      </div>

      <!-- Other File Types -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Icon name="solar:file-bold" size="64" class="text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ document.title }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          File type: {{ document.file_type }}
        </p>
        <a-button
          type="primary"
          @click="window.open(documentUrl, '_blank', 'noopener,noreferrer')"
        >
          Open in New Tab
        </a-button>
      </div>

      <!-- Document Info -->
      <div v-if="document.description" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Description
        </h3>
        <p class="text-gray-600 whitespace-pre-wrap">
          {{ document.description }}
        </p>
      </div>
    </div>

    <!-- No Document State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <Icon name="solar:file-text-bold" size="64" class="text-gray-400 mx-auto mb-4" />
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
.pdf-viewer-container {
  position: relative;
  min-height: 600px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.pdf-embed-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f5f5f5;
  min-height: 600px;
}

.pdf-embed {
  max-width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Prevent text selection */
.pdf-viewer-container * {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide download buttons in PDF viewer */
:deep(.pdf-viewer-container a),
:deep(.pdf-viewer-container button[download]) {
  display: none !important;
}
</style>
