<script setup lang="ts">
import type { CourseAsset, CourseAssetPayload } from '~/composables/api/useAssetApi'
import { message } from 'ant-design-vue'
import { useAssetApi } from '~/composables/api/useAssetApi'
import { useCourse } from '~/composables/useCourse'

interface Props {
  open: boolean
  resource: CourseAsset | null
  courseId: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { updateAsset } = useAssetApi()
const { currentCourse } = useCourse()

const formRef = ref()
const isModalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const saving = ref(false)

// Get classrooms from currentCourse (already loaded in parent page)
const classrooms = computed(() => {
  if (!currentCourse.value?.classrooms || !Array.isArray(currentCourse.value.classrooms)) {
    return []
  }
  return currentCourse.value.classrooms.map((c: any) => ({
    id: c.id,
    title: c.title,
  }))
})

// Check if course type is 'course' (needed for classrooms)
const isCourseType = computed(() => currentCourse.value?.course_type === 'course' || false)

const formState = ref({
  title: '',
  description: '',
  visible_classrooms: [] as string[],
})


// Watch for resource changes
watch(() => props.resource, (newResource) => {
  if (newResource) {
    // Extract classroom IDs from visible_classrooms
    let classroomIds: string[] = []
    if (newResource.visible_classrooms && Array.isArray(newResource.visible_classrooms) && newResource.visible_classrooms.length > 0) {
      classroomIds = newResource.visible_classrooms
        .map((c: any) => {
          // Handle both object format { id, title } and string format
          if (typeof c === 'string') {
            return c
          }
          return c?.id
        })
        .filter((id: any) => id) // Filter out undefined/null values
    }

    formState.value = {
      title: newResource.title || '',
      description: newResource.description || '',
      visible_classrooms: classroomIds,
    }
  }
  else {
    resetForm()
  }
}, { immediate: true })

// Watch for modal open to ensure form is populated when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen && props.resource) {
    // Re-populate form when modal opens to ensure select is updated
    nextTick(() => {
      if (formRef.value && props.resource) {
        let classroomIds: string[] = []
        if (props.resource.visible_classrooms && Array.isArray(props.resource.visible_classrooms) && props.resource.visible_classrooms.length > 0) {
          classroomIds = props.resource.visible_classrooms
            .map((c: any) => {
              if (typeof c === 'string') {
                return c
              }
              return c?.id
            })
            .filter((id: any) => id)
        }

        // Update formState and form fields
        formRef.value.setFieldsValue({
          visible_classrooms: classroomIds,
          title: props.resource.title || '',
          description: props.resource.description || '',
        })
        formState.value.title = props.resource.title || ''
        formState.value.description = props.resource.description || ''
        formState.value.visible_classrooms = classroomIds
      }
    })
  }
  else if (!isOpen) {
    resetForm()
  }
})

// Reset form
function resetForm() {
  formState.value = {
    title: '',
    description: '',
    visible_classrooms: [],
  }
  formRef.value?.resetFields()
}

// Handle save
async function handleSave() {
  if (!props.resource) {
    return
  }

  try {
    await formRef.value?.validateFields()
    saving.value = true

    const payload: Partial<CourseAssetPayload> = {
      title: formState.value.title,
      description: formState.value.description,
      visible_classroom_ids: isCourseType.value && formState.value.visible_classrooms.length > 0
        ? formState.value.visible_classrooms
        : undefined,
    }

    await updateAsset(props.courseId, props.resource.id, payload)
    message.success(t('admin.resources.notifications.updateSuccess'))

    resetForm()
    emit('save')
    isModalOpen.value = false
  }
  catch (error: any) {
    console.error('Save failed:', error)
    const errorMessage = error?.data?.message || error?.message || t('admin.resources.notifications.saveFailed')
    message.error(errorMessage)
  }
  finally {
    saving.value = false
  }
}

// Handle cancel
function handleCancel() {
  resetForm()
  isModalOpen.value = false
}
</script>

<template>
  <a-modal
    v-model:open="isModalOpen"
    :title="t('admin.resources.form.editTitle')"
    :width="600"
    :confirm-loading="saving"
    :ok-text="t('admin.resources.form.save')"
    :cancel-text="t('admin.resources.form.cancel')"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      layout="vertical"
      class="w-full"
    >
      <!-- Title -->
      <a-form-item
        :label="t('admin.resources.form.title')"
        name="title"
        :rules="[{ required: true, message: t('admin.resources.form.titleRequired') }]"
      >
        <a-input
          v-model:value="formState.title"
          size="large"
          :placeholder="t('admin.resources.form.titlePlaceholder')"
        />
      </a-form-item>

      <!-- Description -->
      <a-form-item
        :label="t('admin.resources.form.description')"
        name="description"
      >
        <a-textarea
          v-model:value="formState.description"
          :rows="4"
          :placeholder="t('admin.resources.form.descriptionPlaceholder')"
        />
      </a-form-item>

      <!-- Visible Classrooms (only for course type) -->
      <a-form-item
        v-if="isCourseType"
        :label="t('admin.resources.form.visibleClassrooms')"
        name="visible_classrooms"
      >
        <a-select
          v-model:value="formState.visible_classrooms"
          mode="multiple"
          size="large"
          :placeholder="t('admin.resources.form.visibleClassroomsPlaceholder')"
          :options="classrooms.map(c => ({ value: c.id, label: c.title }))"
        />
        <div class="text-xs text-gray-500 mt-1">
          {{ t('admin.resources.form.visibleClassroomsDescription') }}
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

