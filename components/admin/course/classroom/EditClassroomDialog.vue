<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

interface Props {
  open: boolean
  classroomId: string | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getClassroomDetail, patchClassroom } = useClassroomApi()

// List of background colors (dark colors suitable for white text)
const BACKGROUND_COLORS = [
  '#268100', // Green (default)
  '#1e40af', // Blue
  '#7c3aed', // Purple
  '#c2410c', // Orange
  '#be123c', // Rose
  '#0891b2', // Cyan
  '#b45309', // Amber
  '#059669', // Emerald
  '#7c2d12', // Brown
  '#6b21a8', // Violet
  '#0c4a6e', // Sky
  '#831843', // Fuchsia
  '#1e3a8a', // Indigo
  '#92400e', // Yellow
  '#991b1b', // Red
]

const dialogVisible = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

const classroomEditFormRef = ref()
const classroomEditFormState = ref({
  title: '',
  student_count: '',
  price: null as number | null,
  discount_price: null as number | null,
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
  background_color: BACKGROUND_COLORS[0],
})
const isLoadingClassroomDetail = ref(false)
const isSavingClassroom = ref(false)

// Watch for dialog open to load classroom detail
watch(dialogVisible, async (newValue) => {
  if (newValue && props.classroomId) {
    await loadClassroomDetail()
  }
  else {
    // Reset form when dialog closes
    classroomEditFormState.value = {
      title: '',
      student_count: '',
      price: null,
      discount_price: null,
      meeting_link: '',
      meeting_id: '',
      meeting_pass: '',
      background_color: BACKGROUND_COLORS[0],
    }
  }
})

async function loadClassroomDetail() {
  if (!props.classroomId)
    return

  try {
    isLoadingClassroomDetail.value = true
    const response = await getClassroomDetail(props.classroomId)
    classroomEditFormState.value = {
      title: response.title || '',
      student_count: String(response.student_count || ''),
      price: response.price ? Number.parseFloat(response.price) : null,
      discount_price: response.discount_price ? Number.parseFloat(response.discount_price) : null,
      meeting_link: response.meeting_link || '',
      meeting_id: response.meeting_id || '',
      meeting_pass: response.meeting_pass || '',
      background_color: response.background_color || BACKGROUND_COLORS[0],
    }
  }
  catch (error: any) {
    console.error('Error loading classroom detail:', error)
    notification.error({
      message: 'Lỗi',
      description: error?.data?.detail || 'Không thể tải thông tin lớp học',
      duration: 5,
    })
    dialogVisible.value = false
  }
  finally {
    isLoadingClassroomDetail.value = false
  }
}

function cancelEditClassroom() {
  dialogVisible.value = false
}

async function saveClassroom() {
  if (!props.classroomId || !classroomEditFormRef.value)
    return

  try {
    await classroomEditFormRef.value.validate()
    isSavingClassroom.value = true

    const updatePayload: any = {
      title: classroomEditFormState.value.title,
      student_count: Number.parseInt(classroomEditFormState.value.student_count, 10),
    }

    if (classroomEditFormState.value.price !== null) {
      updatePayload.price = String(classroomEditFormState.value.price)
    }
    if (classroomEditFormState.value.discount_price !== null) {
      updatePayload.discount_price = String(classroomEditFormState.value.discount_price)
    }
    if (classroomEditFormState.value.meeting_link) {
      updatePayload.meeting_link = classroomEditFormState.value.meeting_link
    }
    if (classroomEditFormState.value.meeting_id) {
      updatePayload.meeting_id = classroomEditFormState.value.meeting_id
    }
    if (classroomEditFormState.value.meeting_pass) {
      updatePayload.meeting_pass = classroomEditFormState.value.meeting_pass
    }
    if (classroomEditFormState.value.background_color) {
      updatePayload.background_color = classroomEditFormState.value.background_color
    }

    await patchClassroom(props.classroomId, updatePayload)

    notification.success({
      message: 'Thành công',
      description: 'Đã cập nhật thông tin lớp học',
      duration: 3,
    })

    dialogVisible.value = false
    emit('success')
  }
  catch (error: any) {
    console.error('Error updating classroom:', error)
    notification.error({
      message: 'Lỗi',
      description: error?.data?.detail || 'Không thể cập nhật thông tin lớp học',
      duration: 5,
    })
  }
  finally {
    isSavingClassroom.value = false
  }
}
</script>

<template>
  <a-modal
    v-model:open="dialogVisible"
    title="Chỉnh sửa lớp học"
    width="600px"
    :confirm-loading="isSavingClassroom"
    @cancel="cancelEditClassroom"
  >
    <div v-if="isLoadingClassroomDetail" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>
    <a-form
      v-else
      ref="classroomEditFormRef"
      :model="classroomEditFormState"
      layout="vertical"
      class="space-y-4"
    >
      <a-form-item
        label="Tên lớp học"
        name="title"
        :rules="[{ required: true, message: 'Vui lòng nhập tên lớp học' }]"
      >
        <a-input
          v-model:value="classroomEditFormState.title"
          placeholder="Nhập tên lớp học"
          size="large"
        />
      </a-form-item>

      <a-form-item
        label="Số lượng học viên tối đa"
        name="student_count"
        :rules="[{ required: true, message: 'Vui lòng nhập số lượng học viên' }]"
      >
        <a-input-number
          v-model:value="classroomEditFormState.student_count"
          placeholder="Nhập số lượng học viên"
          :min="1"
          size="large"
          class="w-full"
        />
      </a-form-item>

      <a-form-item
        label="Giá (€)"
        name="price"
        :rules="[{ required: true, message: 'Vui lòng nhập giá' }]"
      >
        <a-input-number
          v-model:value="classroomEditFormState.price"
          placeholder="Nhập giá"
          :min="0"
          :precision="2"
            size="large"
            class="w-full"
        />
      </a-form-item>

      <a-form-item
        label="Giá khuyến mãi (€)"
        name="discount_price"
      >
        <a-input-number
          v-model:value="classroomEditFormState.discount_price"
          placeholder="Nhập giá khuyến mãi (tùy chọn)"
          :min="0"
          :precision="2"
            size="large"
            class="w-full"
        />
      </a-form-item>

      <a-form-item
        label="Meeting Link"
        name="meeting_link"
      >
        <a-input
          v-model:value="classroomEditFormState.meeting_link"
          placeholder="https://zoom.us/j/..."
          size="large"
        />
      </a-form-item>

      <div class="grid grid-cols-2 gap-4">
        <a-form-item
          label="Meeting ID"
          name="meeting_id"
        >
          <a-input
            v-model:value="classroomEditFormState.meeting_id"
            placeholder="Nhập Meeting ID"
            size="large"
          />
        </a-form-item>

        <a-form-item
          label="Meeting Password"
          name="meeting_pass"
        >
          <a-input
            v-model:value="classroomEditFormState.meeting_pass"
            placeholder="Nhập Meeting Password"
            size="large"
          />
        </a-form-item>
      </div>

      <!-- Background Color Section -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Màu nền cho lịch học
        </h3>

        <a-form-item
          label="Màu nền"
          name="background_color"
        >
          <div class="flex flex-wrap gap-2">
            <div
              v-for="color in BACKGROUND_COLORS"
              :key="color"
              class="w-10 h-10 rounded-lg cursor-pointer border-2 transition-all"
              :class="classroomEditFormState.background_color === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-500'"
              :style="{ backgroundColor: color }"
              @click="classroomEditFormState.background_color = color"
            />
          </div>
        </a-form-item>
        <div class="text-xs text-gray-500 mt-1">
          Chọn màu nền để hiển thị trên lịch học
        </div>
      </div>
    </a-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="cancelEditClassroom">
          Hủy
      </a-button>
      <a-button
        type="primary"
          :loading="isSavingClassroom"
          @click="saveClassroom"
      >
          Lưu
      </a-button>
    </div>
    </template>
  </a-modal>
</template>
