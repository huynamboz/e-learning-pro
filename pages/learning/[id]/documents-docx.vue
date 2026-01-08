<script setup lang="ts">
import { notification } from 'ant-design-vue'
import { getFileExtension } from '~/utils/fileExtension'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const courseApi = useCourseApi()

const courseId = computed(() => route.params.id as string)
const fileUrlQuery = computed(() => route.query.file_url as string | undefined)

// State
const loading = ref(false)
const error = ref<string | null>(null)
const document = ref<any>(null)

// DOCX viewer state
const docxError = ref<string | null>(null)
const docxLoading = ref(true)
const docxContainerRef = ref<HTMLElement | null>(null)

// Load document from query parameters
function loadDocumentFromQuery() {
  try {
    if (!fileUrlQuery.value) {
      error.value = 'File URL not found in query parameters'
      return
    }

    // Decode file_url from query
    const decodedFileUrl = decodeURIComponent(fileUrlQuery.value)

    // Build document object from query parameters
    document.value = {
      file_url: decodedFileUrl,
      title: route.query.title as string || 'Document',
      description: route.query.description as string || '',
      file_size: route.query.file_size ? Number(route.query.file_size) : undefined,
      asset_type: route.query.asset_type as string || 'other',
    }
  }
  catch (err: any) {
    console.error('Error loading document from query:', err)
    error.value = 'Failed to load document'
    notification.error({
      message: 'Error',
      description: 'Failed to load document from query parameters',
    })
  }
}

// Check if document is Word document (DOCX or DOC - both can be previewed as DOCX)
const isDocx = computed(() => {
  if (!document.value)
    return false
  const extension = getFileExtension(document.value)
  const extLower = extension.toLowerCase()
  return extLower === 'docx' || extLower === 'doc'
})

// Get document URL
const documentUrl = computed(() => {
  if (!document.value)
    return null
  return document.value.file_url || null
})

// Load DOCX preview
async function loadDocxPreview() {
  if (!documentUrl.value || !docxContainerRef.value || !isDocx.value) {
    return
  }

  // Only run on client-side
  if (!process.client) {
    return
  }

  try {
    docxLoading.value = true
    docxError.value = null

    // Dynamically import docx-preview (client-side only)
    // @ts-expect-error - Dynamic import for docx-preview
    const { renderAsync } = await import('docx-preview')

    // Fetch the DOCX file
    const response = await fetch(documentUrl.value)
    if (!response.ok) {
      throw new Error('Failed to fetch document')
    }

    const arrayBuffer = await response.arrayBuffer()

    // Clear container
    if (!docxContainerRef.value) {
      throw new Error('Container element not found')
    }
    docxContainerRef.value.innerHTML = ''

    // Render DOCX
    await renderAsync(arrayBuffer, docxContainerRef.value as HTMLElement, undefined, {

    })

    docxLoading.value = false
  }
  catch (err: any) {
    console.error('DOCX loading error:', err)
    docxError.value = err?.message || 'Failed to load DOCX document'
    docxLoading.value = false
    notification.error({
      message: 'Error',
      description: 'Failed to load DOCX document. Please try again or download the file.',
    })
  }
}

watch([docxContainerRef, document, documentUrl], () => {
  if (docxContainerRef.value && document.value && documentUrl.value && isDocx.value) {
    loadDocxPreview()
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
  router.push(`/learning/${courseId.value}`)
}

// Open document in new tab
function openInNewTab() {
  if (process.client && documentUrl.value && window) {
    window.open(documentUrl.value, '_blank', 'noopener,noreferrer')
  }
}

// Initialize
onMounted(() => {
  loadDocumentFromQuery()
})

// SEO
useHead({
  title: () => {
    if (document.value)
      return `${document.value.title} - Document Viewer`
    return 'Document Viewer'
  },
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <a-button
              type="text"
              size="small"
              class="!flex !items-center !justify-center !p-1"
              @click="handleBack"
            >
              <Icon name="solar:alt-arrow-left-outline" size="18" />
            </a-button>
            <div class="min-w-0 flex-1">
              <h1 class="text-base font-medium text-gray-900 truncate">
                {{ document?.title || 'Document Viewer' }}
              </h1>
              <p v-if="document" class="text-xs text-gray-500 truncate">
                {{ document.title }}
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
      <a-alert
        type="error"
        :message="error"
        show-icon
        closable
        @close="error = null"
      />
    </div>

    <!-- Document Viewer -->
    <div v-else-if="document && documentUrl" class="mx-auto">
      <!-- DOCX Viewer -->
      <div v-if="isDocx" class="">
        <div
          class="docx-viewer-container"
          @contextmenu.prevent="preventDownload"
        >
          <div v-if="docxLoading" class="flex items-center justify-center py-20">
            <a-spin size="large" />
            <span class="ml-3 text-gray-600">Loading DOCX...</span>
          </div>

          <a-alert
            v-if="docxError"
            type="error"
            :message="docxError"
            show-icon
            class="m-4"
          />

          <!-- DOCX Preview Container -->
          <div
            v-if="!docxError"
            ref="docxContainerRef"
            class="docx-container overflow-auto"
          />
        </div>
      </div>

      <!-- Other File Types -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Icon name="solar:file-bold" size="64" class="text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ document.title }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          File type: {{ document.asset_type }}
        </p>
        <a-button
          type="primary"
          @click="openInNewTab"
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
.docx-viewer-container {
  position: relative;
  min-height: 600px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.docx-container {
  /* padding: 2rem; */
  background: #ffffff;
  min-height: 600px;
}

/* DOCX Preview Styles */
:deep(.docx-wrapper) {
  background: #ffffff;
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.docx-wrapper > section) {
  background: #ffffff;
  padding: 40px;
  margin: 0 auto;
  max-width: 816px; /* A4 width in pixels at 96 DPI */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Prevent text selection */
.docx-viewer-container * {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide download buttons */
:deep(.docx-viewer-container a),
:deep(.docx-viewer-container button[download]) {
  display: none !important;
}
</style>
