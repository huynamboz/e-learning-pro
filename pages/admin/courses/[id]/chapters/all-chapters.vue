<script setup lang="ts">
import type { DragChangeEvent } from 'vue-draggable-next'
import type { Chapter } from '~/types/course.type'
import { useCourse } from '#imports'
import { notification } from 'ant-design-vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import LessonsList from '~/components/admin/course/chapter/LessonsList.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { generateSlug } from '~/utils/slug'

const { t } = useI18n()

const { fetchChapters, createChapter, chapters, isCreatingChapter } = useCourse()
const { patchChapter, updateChapter, deleteChapter } = useCourseApi()
const route = useRoute()

const courseId = computed(() => route.params.id as string)
const open = ref<boolean>(false)
const editOpen = ref<boolean>(false)
const deleteModalVisible = ref<boolean>(false)
const formRef = ref()
const editFormRef = ref()

const formState = ref({
  title: '',
  description: '',
})

const editFormState = ref({
  title: '',
  description: '',
})

const chapterToEdit = ref<Chapter | null>(null)
const chapterToDelete = ref<Chapter | null>(null)
const isUpdatingChapter = ref<boolean>(false)
const isDeletingChapter = ref<boolean>(false)

const activeChapterId = ref<string>('')
const chaptersList = ref([...chapters.value])

async function handleChapterChange(e: DragChangeEvent<Chapter>) {
  if (e.moved) {
    const { newIndex, element } = e.moved
    try {
      // Create a partial payload with just the order field
      const orderPayload = { order: newIndex } as any
      await patchChapter(courseId.value, element.id, orderPayload)

      notification.success({
        message: t('admin.chapterManagement.notifications.updateOrderSuccess'),
      })
    }
    catch (error) {
      console.error('Failed to update chapter order:', error)
      // Revert the change on error
      chaptersList.value = [...chapters.value] as any
      notification.error({
        message: t('admin.chapterManagement.notifications.updateOrderFailed'),
      })
    }
  }
}

async function handleAddChapter() {
  await formRef.value?.validateFields()
  try {
    // Generate slug from title
    const chapterData = {
      ...formState.value,
      slug: generateSlug(formState.value.title),
    }

    const response = createChapter(courseId.value, chapterData as any)
    if ((await response).success) {
      notification.success({
        message: t('admin.chapterManagement.notifications.createChapterSuccess'),
      })
      await fetchChapters(courseId.value)
      open.value = false
      chaptersList.value = [...chapters.value] as any
      // Reset form
      formState.value = {
        title: '',
        description: '',
      }
    }
  }
  catch {
    notification.error({
      message: t('admin.chapterManagement.notifications.createChapterFailed'),
    })
  }
}

const activeChapter = computed(() => {
  return chapters.value?.find(ch => ch.id === activeChapterId.value)
})

function showModal() {
  open.value = true
}

function showEditModal(chapter: Chapter) {
  chapterToEdit.value = chapter
  editFormState.value = {
    title: chapter.title,
    description: chapter.description || '',
  }
  editOpen.value = true
}

function hideEditModal() {
  editOpen.value = false
  chapterToEdit.value = null
  editFormState.value = {
    title: '',
    description: '',
  }
}

function showDeleteModal(chapter: Chapter) {
  chapterToDelete.value = chapter
  deleteModalVisible.value = true
}

function hideDeleteModal() {
  deleteModalVisible.value = false
  chapterToDelete.value = null
}

async function handleEditChapter() {
  if (!chapterToEdit.value)
    return

  await editFormRef.value?.validateFields()
  try {
    isUpdatingChapter.value = true

    const chapterData = {
      ...editFormState.value,
      slug: generateSlug(editFormState.value.title),
    }

    await updateChapter(courseId.value, chapterToEdit.value.id, chapterData as any)

    notification.success({
      message: t('admin.chapterManagement.notifications.updateChapterSuccess'),
    })

    await fetchChapters(courseId.value)
    chaptersList.value = [...chapters.value] as any

    // Update active chapter if it was the one being edited
    if (activeChapterId.value === chapterToEdit.value.id) {
      const updatedChapter = chapters.value?.find(ch => ch.id === chapterToEdit.value?.id)
      if (updatedChapter) {
        activeChapterId.value = updatedChapter.id
      }
    }

    hideEditModal()
  }
  catch {
    notification.error({
      message: t('admin.chapterManagement.notifications.updateChapterFailed'),
    })
  }
  finally {
    isUpdatingChapter.value = false
  }
}

async function handleDeleteChapter() {
  if (!chapterToDelete.value)
    return

  try {
    isDeletingChapter.value = true

    await deleteChapter(courseId.value, chapterToDelete.value.id)

    notification.success({
      message: t('admin.chapterManagement.notifications.deleteChapterSuccess'),
    })

    await fetchChapters(courseId.value)
    chaptersList.value = [...chapters.value] as any

    // Clear active chapter if it was the one being deleted
    if (activeChapterId.value === chapterToDelete.value.id) {
      activeChapterId.value = chapters.value && chapters.value.length > 0 ? chapters.value[0].id : ''
    }

    hideDeleteModal()
  }
  catch {
    notification.error({
      message: t('admin.chapterManagement.notifications.deleteChapterFailed'),
    })
  }
  finally {
    isDeletingChapter.value = false
  }
}

onMounted(async () => {
  await fetchChapters(courseId.value)
  chaptersList.value = [...chapters.value] as any
  // Set first chapter as active if available
  if (chapters.value && chapters.value.length > 0) {
    activeChapterId.value = chapters.value[0].id
  }
})
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4">
    <!-- Sidebar Chapter List -->
    <div class="w-full lg:w-1/4">
      <div class="bg-white rounded-md shadow p-3 flex flex-col gap-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <h1 class="text-base sm:text-lg font-semibold mb-2 text-gray-600 !m-0">
            {{ t('admin.chapterManagement.title') }}
          </h1>
          <a-button
            type="primary"
            class="!h-8 sm:!h-10 rounded-lg text-xs sm:text-sm !font-semibold !flex !items-center !justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
            @click="showModal"
          >
            <span class="hidden sm:inline">{{ t('admin.chapterManagement.addChapter') }}</span>
            <Icon name="i-material-symbols-edit-square-outline-rounded" class="text-sm sm:text-base ml-1 sm:ml-2" />
          </a-button>
        </div>
        <!-- Empty state for chapters -->
        <div v-if="!chapters || chapters.length === 0" class="flex flex-col gap-2 items-center text-center py-6 sm:py-8">
          <div class="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <Icon name="solar:book-2-bold-duotone" size="24" class="text-gray-400 sm:text-3xl" />
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {{ t('admin.chapterManagement.emptyStates.noChapters') }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mb-4">
            {{ t('admin.chapterManagement.emptyStates.noChaptersDescription') }}
          </p>
        </div>

        <!-- Chapter list -->
        <draggable
          v-model="chaptersList"
          tag="transition-group"
          :component-data="{
            tag: 'div',
            type: 'transition',
            name: 'fade',
          }"
          :animation="200"
          group="chapters"
          item-key="id"
          @change="handleChapterChange"
        >
          <div
            v-for="ch in chaptersList"
            :key="ch.id"
            class="px-2 sm:px-3 py-2 mt-2 rounded-lg cursor-pointer border transition-all flex items-center justify-between drag-item group"
            :class="activeChapterId === ch.id
              ? 'border-green-500 bg-green-50 font-medium'
              : 'border-gray-300 hover:bg-gray-100'"
            @click="activeChapterId = ch.id"
          >
            <div class="flex items-center flex-1 min-w-0">
              <Icon v-if="activeChapterId === ch.id" name="i-charm-tick" class="text-sm sm:text-lg mr-1 sm:mr-2 text-green-600 flex-shrink-0" />
              <span class="truncate text-sm sm:text-base">{{ ch.title }}</span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a-button
                type="text"
                size="small"
                class="!h-5 !w-5 sm:!h-6 sm:!w-6 !p-0 !flex !items-center !justify-center"
                @click.stop="showEditModal(ch as any)"
              >
                <Icon name="tabler:edit" class="text-xs sm:text-sm text-blue-600" />
              </a-button>
              <a-button
                type="text"
                size="small"
                class="!h-5 !w-5 sm:!h-6 sm:!w-6 !p-0 !flex !items-center !justify-center"
                @click.stop="showDeleteModal(ch as any)"
              >
                <Icon name="tabler:trash" class="text-xs sm:text-sm text-red-600" />
              </a-button>
            </div>
          </div>
        </draggable>
      </div>
    </div>

    <!-- Create Chapter Modal -->
    <a-modal v-model:open="open" :title="t('admin.chapterManagement.form.title')" width="90vw" :style="{ maxWidth: '600px' }" :confirm-loading="isCreatingChapter" @ok="handleAddChapter">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          :label="t('admin.chapterManagement.form.chapterTitle')"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: t('admin.chapterManagement.form.chapterTitleRequired') }]"
        >
          <a-input v-model:value="formState.title" size="large" :placeholder="t('admin.chapterManagement.form.chapterTitlePlaceholder')" />
        </a-form-item>
        <a-form-item
          :label="t('admin.chapterManagement.form.chapterDescription')"
          name="description"
          class="w-full"
        >
          <a-textarea v-model:value="formState.description" size="large" :placeholder="t('admin.chapterManagement.form.chapterDescriptionPlaceholder')" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Chapter Modal -->
    <a-modal v-model:open="editOpen" :title="t('admin.chapterManagement.form.editTitle')" width="90vw" :style="{ maxWidth: '600px' }" :confirm-loading="isUpdatingChapter" @ok="handleEditChapter" @cancel="hideEditModal">
      <a-form
        ref="editFormRef"
        :model="editFormState"
        name="editForm"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          :label="t('admin.chapterManagement.form.chapterTitle')"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: t('admin.chapterManagement.form.chapterTitleRequired') }]"
        >
          <a-input v-model:value="editFormState.title" size="large" :placeholder="t('admin.chapterManagement.form.chapterTitlePlaceholder')" />
        </a-form-item>
        <a-form-item
          :label="t('admin.chapterManagement.form.chapterDescription')"
          name="description"
          class="w-full"
        >
          <a-textarea v-model:value="editFormState.description" size="large" :placeholder="t('admin.chapterManagement.form.chapterDescriptionPlaceholder')" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Delete Chapter Modal -->
    <a-modal
      v-model:open="deleteModalVisible"
      :title="t('admin.chapterManagement.deleteConfirm.title')"
      width="90vw"
      :style="{ maxWidth: '480px' }"
      centered
      @cancel="hideDeleteModal"
    >
      <template #footer>
        <div class="flex justify-end gap-3">
          <a-button @click="hideDeleteModal">
            {{ t('admin.chapterManagement.deleteConfirm.cancel') }}
          </a-button>
          <a-button
            type="primary"
            danger
            :loading="isDeletingChapter"
            @click="handleDeleteChapter"
          >
            {{ t('admin.chapterManagement.deleteConfirm.confirm') }}
          </a-button>
        </div>
      </template>

      <div class="py-4">
        <div class="flex items-start gap-3 sm:gap-4">
          <!-- Warning Icon -->
          <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="tabler:alert-triangle" class="text-lg sm:text-xl text-red-600" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {{ t('admin.chapterManagement.deleteConfirm.message') }}
            </h3>

            <div v-if="chapterToDelete" class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                {{ chapterToDelete.title }}
              </h4>
              <div class="text-xs sm:text-sm text-gray-600 space-y-1">
                <p><span class="font-medium">{{ t('admin.chapterManagement.deleteConfirm.lessons') }}:</span> {{ chapterToDelete.lessons?.length || 0 }}</p>
                <p v-if="chapterToDelete.description" class="text-gray-500 mt-2 text-xs sm:text-sm">
                  {{ chapterToDelete.description }}
                </p>
              </div>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
              <p class="text-xs sm:text-sm text-red-700">
                <Icon name="tabler:info-circle" class="inline mr-1" />
                <strong>{{ t('admin.chapterManagement.deleteConfirm.warning') }}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- Lesson List -->
    <div class="flex-1 bg-white rounded-md shadow p-3 sm:p-4">
      <!-- Empty state when no chapter is selected -->
      <div v-if="!activeChapter && chapters && chapters.length > 0" class="text-center py-8 sm:py-12">
        <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6">
          <Icon name="solar:playlist-bold-duotone" size="32" class="text-gray-400 sm:text-4xl" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
          {{ t('admin.chapterManagement.emptyStates.selectChapter') }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-500">
          {{ t('admin.chapterManagement.emptyStates.selectChapterDescription') }}
        </p>
      </div>

      <!-- Empty state when no chapters exist -->
      <div v-else-if="!chapters || chapters.length === 0" class="text-center flex flex-col gap-2 items-center py-8 sm:py-12">
        <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6">
          <Icon name="solar:book-2-bold-duotone" size="32" class="text-gray-400 sm:text-4xl" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
          {{ t('admin.chapterManagement.emptyStates.noChaptersAvailable') }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          {{ t('admin.chapterManagement.emptyStates.noChaptersAvailableDescription') }}
        </p>
        <a-button
          type="primary"
          class="!h-8 sm:!h-10 !flex gap-1 items-center !px-4 sm:!px-6 rounded-lg text-xs sm:text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
          @click="showModal"
        >
          <template #icon>
            <Icon name="solar:add-circle-bold-duotone" size="12" class="sm:text-base" />
          </template>
          <span class="hidden sm:inline">{{ t('admin.chapterManagement.createFirstChapter') }}</span>
        </a-button>
      </div>

      <!-- Chapter content -->
      <div v-else-if="activeChapter">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-2xl font-semibold !m-0">
            {{ activeChapter.title }} ({{ activeChapter.lessons.length }} {{ t('admin.chapterManagement.lessons.minutes') }})
          </h2>
          <NuxtLink :to="`/admin/courses/${courseId}/chapters/${activeChapter.id}/lessons-create`">
            <a-button
              type="primary"
              class="!h-8 sm:!h-12 !mt-0 sm:!mt-4 rounded-lg text-xs sm:text-sm !font-semibold !flex !items-center !justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
            >
              <span class="hidden sm:inline">{{ t('admin.chapterManagement.lessons.addLesson') }}</span>
              <Icon name="i-material-symbols-edit-square-outline-rounded" class="text-sm sm:text-base ml-1 sm:ml-2" />
            </a-button>
          </NuxtLink>
        </div>

        <!-- Empty state for lessons -->
        <div v-if="!activeChapter.lessons || activeChapter.lessons.length === 0" class="text-center py-8 sm:py-12 flex flex-col gap-2 items-center">
          <div class="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6">
            <Icon name="solar:playlist-bold-duotone" size="32" class="text-gray-400 sm:text-4xl" />
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
            {{ t('admin.chapterManagement.emptyStates.noLessons') }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            {{ t('admin.chapterManagement.emptyStates.noLessonsDescription') }}
          </p>
          <NuxtLink :to="`/admin/courses/${courseId}/chapters/${activeChapter.id}/lessons-create`">
            <a-button
              type="primary"
              class="!h-8 sm:!h-10 !flex gap-1 items-center !px-4 sm:!px-6 rounded-lg text-xs sm:text-sm !font-semibold bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
            >
              <template #icon>
                <Icon name="solar:add-circle-bold-duotone" size="12" class="sm:text-base" />
              </template>
              <span class="hidden sm:inline">{{ t('admin.chapterManagement.emptyStates.createFirstLesson') }}</span>
            </a-button>
          </NuxtLink>
        </div>

        <!-- Lessons list -->
        <LessonsList v-else :key="activeChapter.id" :chapter-id="activeChapter.id" :list-lesson="activeChapter.lessons" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
:deep(.ql-editor) {
  min-height: 200px;
}
:deep(.ql-toolbar.ql-snow) {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
:deep(.ql-container.ql-snow) {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

:deep(.ql-editor) {
  height: 200px !important;
  overflow-y: auto;
}
</style>
