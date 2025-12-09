<script setup lang="ts">
import { Modal } from 'ant-design-vue'

interface Resource {
  id: string
  course: string
  asset_type: 'video' | 'pdf' | 'doc' | 'ppt' | 'zip' | 'image' | 'audio' | 'other'
  title: string
  description: string
  file_url: string
  duration?: number
  file_size: number
  order: number
  is_downloadable: boolean
  uploaded_by: {
    id: string
    username: string
    email: string
  }
  uploaded_at: string
  updated_at: string
  visible_classrooms?: Array<{
    id: string
    title: string
  }>
}

const props = defineProps<{
  resource: Resource
}>()

const emit = defineEmits<{
  edit: [resource: Resource]
  delete: [resourceId: string]
}>()

const { t } = useI18n()

// Get asset type icon and color
function getAssetTypeInfo(type: string) {
  const typeMap: Record<string, { icon: string, color: string, bgColor: string }> = {
    video: { icon: 'solar:videocamera-record-bold', color: 'text-red-600', bgColor: 'bg-red-50' },
    pdf: { icon: 'solar:document-text-bold', color: 'text-red-600', bgColor: 'bg-red-50' },
    doc: { icon: 'solar:document-bold', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    ppt: { icon: 'solar:presentation-graph-bold', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    zip: { icon: 'solar:archive-bold', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    image: { icon: 'solar:gallery-bold', color: 'text-green-600', bgColor: 'bg-green-50' },
    audio: { icon: 'solar:music-note-bold', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    other: { icon: 'solar:file-bold', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  }
  return typeMap[type] || typeMap.other
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

// Format duration
function formatDuration(seconds?: number): string {
  if (!seconds)
    return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// // Format date
// function formatDate(dateString: string): string {
//   if (!dateString)
//     return ''
//   const date = new Date(dateString)
//   return date.toLocaleDateString('vi-VN', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   })
// }

// Handle delete with confirmation
function handleDelete() {
  Modal.confirm({
    title: t('admin.resources.deleteConfirm.title'),
    content: t('admin.resources.deleteConfirm.content', { title: props.resource.title }),
    okText: t('admin.resources.deleteConfirm.okText'),
    cancelText: t('admin.resources.deleteConfirm.cancelText'),
    okType: 'danger',
    onOk: () => {
      emit('delete', props.resource.id)
    },
  })
}

const assetInfo = computed(() => getAssetTypeInfo(props.resource.asset_type))
</script>

<template>
  <div
    class="bg-white flex flex-col border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 group relative"
  >
    <!-- Header with Actions Menu -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div :class="`size-[34px] flex items-center justify-center rounded ${assetInfo.bgColor}`">
          <Icon :name="assetInfo.icon" size="18" :class="assetInfo.color" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {{ props.resource.title }}
          </h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-gray-500 uppercase">
              {{ props.resource.asset_type }}
            </span>
            <span v-if="props.resource.is_downloadable" class="text-xs text-green-600">
              <Icon name="solar:download-bold" size="12" class="inline" />
            </span>
          </div>
        </div>
      </div>
      <!-- Actions Dropdown -->
      <a-dropdown :trigger="['click']" placement="bottomRight">
        <a-button type="text" size="small" class="!h-6 !w-6 !p-0 flex items-center justify-center">
          <Icon name="solar:menu-dots-bold" size="16" class="text-gray-400" />
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="edit" @click="emit('edit', props.resource)">
              <div class="flex items-center gap-2">
                <Icon name="solar:pen-bold" size="16" />
                {{ t('admin.resources.edit') }}
              </div>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="delete" danger @click="handleDelete">
              <div class="flex items-center gap-2">
                <Icon name="solar:trash-bin-trash-bold" size="16" />
                {{ t('admin.resources.delete') }}
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Description -->
    <p v-if="props.resource.description" class="text-xs text-gray-600 mb-3 line-clamp-2">
      {{ props.resource.description }}
    </p>

    <!-- Metadata - Compact -->
    <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
      <div class="flex items-center gap-1">
        <Icon name="solar:file-bold" size="12" />
        <span>{{ formatFileSize(props.resource.file_size) }}</span>
      </div>
      <div v-if="props.resource.duration" class="flex items-center gap-1">
        <Icon name="solar:clock-circle-bold" size="12" />
        <span>{{ formatDuration(props.resource.duration) }}</span>
      </div>
      <div v-if="props.resource.visible_classrooms && props.resource.visible_classrooms.length > 0" class="flex items-center gap-1">
        <Icon name="solar:users-group-rounded-bold" size="12" />
        <span>{{ props.resource.visible_classrooms.length }}</span>
      </div>
    </div>
  </div>
</template>
