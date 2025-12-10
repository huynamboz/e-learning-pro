<script lang="ts" setup>
import type { CourseAsset } from '~/composables/api/useAssetApi'

interface Props {
  resource: CourseAsset
  isOpenable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpenable: false,
})

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

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// Handle click on resource
function handleResourceClick() {
  if (props.isOpenable && props.resource.file_url) {
    window.open(props.resource.file_url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
    :class="{ 'cursor-pointer': isOpenable }"
  >
    <!-- Icon -->
    <div class="size-12 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors flex-shrink-0">
      <Icon :name="getAssetTypeInfo(resource.asset_type).icon" size="24" :class="getAssetTypeInfo(resource.asset_type).color" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3
        class="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors"
        :class="{ 'hover:underline cursor-pointer': isOpenable }"
        @click="handleResourceClick"
      >
        {{ resource.title }}
      </h3>
      <p v-if="resource.description" class="text-sm text-gray-600 mb-2 line-clamp-1">
        {{ resource.description }}
      </p>
      <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <div class="flex items-center gap-1">
          <Icon name="solar:file-bold" size="12" />
          <span>{{ formatFileSize(resource.file_size) }}</span>
        </div>
        <span class="text-gray-300">•</span>
        <span class="uppercase">{{ resource.asset_type }}</span>
      </div>
    </div>
  </div>
</template>
