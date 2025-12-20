<script setup lang="ts">
import type { NewQuizLevel } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
import { Modal, notification } from 'ant-design-vue'

interface Props {
  levels: NewQuizLevel[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
const router = useRouter()
const { deleteLevel } = useNewQuizApi()

function handleEditLevel(levelId: string) {
  router.push(`/admin/new-quiz-management/levels/${levelId}/edit`)
}

async function handleDeleteLevel(levelId: string, levelName: string) {
  Modal.confirm({
    title: t('newQuiz.level.deleteConfirm.title'),
    content: t('newQuiz.level.deleteConfirm.message', { name: levelName }),
    okText: t('newQuiz.level.deleteConfirm.confirm'),
    okType: 'danger',
    cancelText: t('newQuiz.level.deleteConfirm.cancel'),
    onOk: async () => {
      try {
        await deleteLevel(levelId)
        notification.success({
          message: t('newQuiz.level.messages.deleteSuccess', { name: levelName }),
          duration: 3,
        })
        emit('refresh')
      }
      catch (err: any) {
        notification.error({
          message: t('newQuiz.level.messages.deleteError'),
          description: err.message,
          duration: 4.5,
        })
      }
    },
  })
}
</script>

<template>
  <div class="level-list">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="`skeleton-${i}`"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-12 h-12 bg-gray-200 rounded-lg" />
            <div class="flex-1 space-y-2">
              <div class="h-5 bg-gray-200 rounded w-32" />
              <div class="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>
          <div class="flex gap-2">
            <div class="w-20 h-8 bg-gray-200 rounded" />
            <div class="w-20 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && levels.length === 0"
      class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
    >
      <Icon name="solar:layers-bold-duotone" class="text-6xl text-gray-300 mb-4 mx-auto" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">
        {{ $t('newQuiz.level.noLevels') }}
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        {{ $t('newQuiz.level.createFirstLevel') }}
      </p>
    </div>

    <!-- Levels List -->
    <div v-else class="space-y-4">
      <div
        v-for="level in levels"
        :key="level.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <!-- Level Badge -->
            <div
              class="flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg"
              :class="level.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ level.code }}
            </div>

            <!-- Level Info -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-gray-800">
                  {{ level.name }}
                </h3>
                <a-tag
                  :color="level.is_active ? 'green' : 'default'"
                  class="text-xs"
                >
                  {{ level.is_active ? $t('newQuiz.level.active') : $t('newQuiz.level.inactive') }}
                </a-tag>
              </div>
              <p v-if="level.description" class="text-sm text-gray-600 mb-1">
                {{ level.description }}
              </p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  {{ $t('newQuiz.level.order') }}: {{ level.order }}
                </span>
                <span>
                  {{ $t('newQuiz.level.createdAt') }}: {{ new Date(level.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <a-button
              type="default"
              class="!flex !justify-center !items-center !gap-1"
              @click="handleEditLevel(level.id)"
            >
              <Icon name="solar:pen-bold" />
              {{ $t('newQuiz.level.edit') }}
            </a-button>
            <a-button
              type="primary"
              danger
              class="!flex !justify-center !items-center !gap-1"
              @click="handleDeleteLevel(level.id, level.name)"
            >
              <Icon name="solar:trash-bin-minimalistic-bold" />
              {{ $t('newQuiz.level.delete') }}
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
