<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue'
import type { CourseAsset } from '~/composables/api/useAssetApi'
import { message, Modal } from 'ant-design-vue'
import ResourceCard from '~/components/admin/course/resource/ResourceCard.vue'
import ResourceEditModal from '~/components/admin/course/resource/ResourceEditModal.vue'
import ResourceFormModal from '~/components/admin/course/resource/ResourceFormModal.vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useCourse } from '~/composables/useCourse'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { t } = useI18n()
const courseId = computed(() => route.params.id as string)
const { getAssets, deleteAsset } = useAssetApi()
const { currentCourse, fetchCourseDetail } = useCourse()

// Check if course type is 'course'
const isCourseType = computed(() => currentCourse.value?.course_type === 'course')

// View mode: 'grid' or 'table'
const viewMode = ref<'grid' | 'table'>('table')

// Load view mode preference from localStorage
onMounted(() => {
  const savedViewMode = localStorage.getItem('resources-view-mode')
  if (savedViewMode === 'grid' || savedViewMode === 'table') {
    viewMode.value = savedViewMode
  }
})

// State
const resources = ref<CourseAsset[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingResource = ref<CourseAsset | null>(null)

// Load resources from API
async function loadResources() {
  try {
    isLoading.value = true
    const response = await getAssets(courseId.value, {
      ordering: 'order',
    })
    resources.value = response.results || []
  }
  catch (error: any) {
    console.error('Error loading resources:', error)
    message.error(error?.data?.message || t('admin.resources.notifications.loadFailed'))
  }
  finally {
    isLoading.value = false
  }
}

// Handle add resource
function handleAddResource() {
  editingResource.value = null
  isModalOpen.value = true
}

// Handle edit resource
function handleEditResource(resource: CourseAsset) {
  editingResource.value = resource
  isEditModalOpen.value = true
}

// Handle delete resource
async function handleDeleteResource(resourceId: string) {
  const resource = resources.value.find(r => r.id === resourceId)
  if (!resource)
    return

  Modal.confirm({
    title: t('admin.resources.deleteConfirm.title'),
    content: t('admin.resources.deleteConfirm.content', { title: resource.title }),
    okText: t('admin.resources.deleteConfirm.okText'),
    cancelText: t('admin.resources.deleteConfirm.cancelText'),
    okType: 'danger',
    async onOk() {
      try {
        await deleteAsset(courseId.value, resourceId)
        message.success(t('admin.resources.notifications.deleteSuccess'))
        await loadResources()
      }
      catch (error: any) {
        console.error('Error deleting resource:', error)
        message.error(error?.data?.message || t('admin.resources.notifications.deleteFailed'))
      }
    },
  })
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get asset type info
function getAssetTypeInfo(type: string) {
  const typeMap: Record<string, { icon: string, color: string, label: string }> = {
    video: { icon: 'solar:videocamera-record-bold', color: 'text-red-600', label: 'Video' },
    pdf: { icon: 'solar:document-text-bold', color: 'text-red-600', label: 'PDF' },
    doc: { icon: 'solar:document-bold', color: 'text-blue-600', label: 'Document' },
    ppt: { icon: 'solar:presentation-graph-bold', color: 'text-orange-600', label: 'PowerPoint' },
    zip: { icon: 'solar:archive-bold', color: 'text-purple-600', label: 'ZIP' },
    image: { icon: 'solar:gallery-bold', color: 'text-green-600', label: 'Image' },
    audio: { icon: 'solar:music-note-bold', color: 'text-pink-600', label: 'Audio' },
    other: { icon: 'solar:file-bold', color: 'text-gray-600', label: 'Other' },
  }
  return typeMap[type] || typeMap.other
}

// Table columns
const columns = computed((): TableColumnsType<CourseAsset> => {
  const baseColumns: TableColumnsType<CourseAsset> = [
    {
      title: t('admin.resources.table.columns.type'),
      key: 'type',
      width: 120,
    },
    {
      title: t('admin.resources.table.columns.title'),
      key: 'title',
      width: 300,
    },
    {
      title: t('admin.resources.table.columns.size'),
      key: 'size',
      width: 120,
      sorter: (a, b) => a.file_size - b.file_size,
    },
  ]

  // Only add classrooms column if course type is 'course'
  if (isCourseType.value) {
    baseColumns.push({
      title: t('admin.resources.table.columns.classrooms'),
      key: 'classrooms',
      width: 150,
    })
  }

  baseColumns.push(
    {
      title: t('admin.resources.table.columns.uploadedAt'),
      key: 'uploaded_at',
      width: 180,
      sorter: (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime(),
    },
    {
      title: t('admin.resources.table.columns.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
    },
  )

  return baseColumns
})

// Handle save resource (from modal)
async function handleSaveResource() {
  // Reload resources from API after save
  await loadResources()
  isModalOpen.value = false
  isEditModalOpen.value = false
  editingResource.value = null
}

onMounted(async () => {
  await fetchCourseDetail(courseId.value)
  await loadResources()
})
</script>

<template>
  <div class="resources-management min-h-screen bg-gray-50 p-6 pt-0 max-md:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2 flex-wrap">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div class="size-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Icon name="solar:document-text-bold" size="28" class="text-white" />
            </div>
            {{ t('admin.resources.title') }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ t('admin.resources.description') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <a-button-group>
            <a-button
              :type="viewMode === 'table' ? 'primary' : 'default'"
              class="rounded-l-lg"
              @click="viewMode = 'table'; localStorage.setItem('resources-view-mode', 'table')"
            >
              <Icon name="solar:list-bold" size="18" />
            </a-button>
            <a-button
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              class="rounded-r-lg"
              @click="viewMode = 'grid'; localStorage.setItem('resources-view-mode', 'grid')"
            >
              <Icon name="solar:widget-4-bold" size="18" />
            </a-button>
          </a-button-group>
          <!-- Add Resource Button -->
          <a-button
            type="primary"
            class="rounded-lg gap-2 text-sm !font-semibold !flex !items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
            @click="handleAddResource"
          >
            <Icon name="solar:add-circle-bold" size="18" />
            {{ t('admin.resources.addResource') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Resources Table View -->
    <div v-if="viewMode === 'table'" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="resources"
        :loading="isLoading"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `${total} ${t('admin.resources.table.totalResources')}`,
        }"
        :scroll="{ x: 1200 }"
        row-key="id"
        class="custom-table"
      >
        <!-- Empty State -->
        <template #emptyText>
          <div class="py-12 text-center">
            <div class="mb-4">
              <Icon name="solar:document-text-bold-duotone" size="48" class="text-gray-300 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ t('admin.resources.empty.title') }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ t('admin.resources.empty.subtitle') }}
            </p>
            <a-button type="primary" class="rounded-lg" @click="handleAddResource">
              {{ t('admin.resources.addResource') }}
            </a-button>
          </div>
        </template>

        <!-- Table Body Cells -->
        <template #bodyCell="{ column, record }">
          <!-- Type Column -->
          <template v-if="column.key === 'type'">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-lg bg-gray-50">
                <Icon :name="getAssetTypeInfo(record.asset_type).icon" size="20" :class="getAssetTypeInfo(record.asset_type).color" />
              </div>
              <span class="text-sm font-medium text-gray-700">
                {{ getAssetTypeInfo(record.asset_type).label }}
              </span>
            </div>
          </template>

          <!-- Title Column -->
          <template v-else-if="column.key === 'title'">
            <div>
              <div class="font-semibold text-gray-900 line-clamp-1">
                {{ record.title }}
              </div>
              <div v-if="record.description" class="text-sm text-gray-500 line-clamp-1 mt-1">
                {{ record.description }}
              </div>
            </div>
          </template>

          <!-- Size Column -->
          <template v-else-if="column.key === 'size'">
            <div class="text-sm text-gray-700">
              {{ formatFileSize(record.file_size) }}
            </div>
          </template>

          <!-- Classrooms Column (only for course type) -->
          <template v-else-if="column.key === 'classrooms' && isCourseType">
            <div v-if="record.visible_classrooms && Array.isArray(record.visible_classrooms) && record.visible_classrooms.length > 0" class="text-sm text-gray-700">
              <div class="flex items-center gap-1">
                <Icon name="solar:users-group-rounded-bold" size="14" />
                <span>{{ record.visible_classrooms.length }} {{ t('admin.resources.classrooms') }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">
                {{ record.visible_classrooms.map((c: any) => c?.title || '').filter(Boolean).join(', ') }}
              </div>
            </div>
            <span v-else class="text-sm text-gray-400">
              {{ t('admin.resources.allClassrooms') }}
            </span>
          </template>

          <!-- Uploaded At Column -->
          <template v-else-if="column.key === 'uploaded_at'">
            <div class="text-sm text-gray-700">
              {{ formatDate(record.uploaded_at) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template v-else-if="column.key === 'actions'">
            <a-dropdown :trigger="['click']">
              <a-button type="text" size="small">
                <Icon name="solar:menu-dots-bold" size="20" />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit" @click="handleEditResource(record)">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:pen-bold" size="16" />
                      {{ t('admin.resources.edit') }}
                    </div>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger @click="handleDeleteResource(record.id)">
                    <div class="flex items-center gap-2">
                      <Icon name="solar:trash-bin-trash-bold" size="16" />
                      {{ t('admin.resources.delete') }}
                    </div>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Resources Grid View -->
    <div v-else class="resources-grid">
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="n in 6" :key="n" class="p-4 border rounded-lg shadow-sm bg-white">
          <a-skeleton active :paragraph="{ rows: 4 }" />
        </div>
      </div>

      <!-- Resources Grid -->
      <div v-else-if="resources.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ResourceCard
          v-for="resource in resources"
          :key="resource.id"
          :resource="resource"
          @edit="handleEditResource"
          @delete="handleDeleteResource"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="mb-4">
          <Icon name="solar:document-text-bold-duotone" size="64" class="text-gray-300 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ t('admin.resources.empty.title') }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{ t('admin.resources.empty.subtitle') }}
        </p>
        <a-button type="primary" class="rounded-lg" @click="handleAddResource">
          {{ t('admin.resources.addResource') }}
        </a-button>
      </div>
    </div>

    <!-- Resource Form Modal (Add) -->
    <ResourceFormModal
      v-model:open="isModalOpen"
      :course-id="courseId"
      @save="handleSaveResource"
    />

    <!-- Resource Edit Modal -->
    <ResourceEditModal
      v-model:open="isEditModalOpen"
      :resource="editingResource"
      :course-id="courseId"
      @save="handleSaveResource"
    />
  </div>
</template>

<style scoped>
/* Custom table styles */
:deep(.custom-table) {
  .ant-pagination {
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
}

/* Line clamp utility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
