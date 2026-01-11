<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})
const emit = defineEmits<Emits>()
const { t } = useI18n()
const { createClassroom } = useClassroomApi()

interface Props {
  open: boolean
  courseId: string
  loading?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const confirmLoading = ref(false)
const formRef = ref()

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

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

const formState = ref({
  title: '',
  student_count: '',
  schedule: [
    { day: null, start: null, end: null, repeat: true, repeat_start_date: null as any, repeat_end_date: null as any },
  ],
  // Pricing fields
  price: null as number | null,
  discount_price: null as number | null,
  background_color: BACKGROUND_COLORS[0], // Default to first color
})

// Computed for dialog visibility
const dialogVisible = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

function addScheduleItem() {
  formState.value.schedule.push({ day: null, start: null, end: null, repeat: true, repeat_start_date: null, repeat_end_date: null })
}

function removeScheduleItem(index: number) {
  if (index > 0) {
    formState.value.schedule.splice(index, 1)
  }
}

// Format time for API
function formatTimeForApi(time: any): string {
  if (!time)
    return ''
  if (typeof time === 'string')
    return time
  if (time.format) {
    return time.format('HH:mm')
  }
  return time.toString()
}

// Validate repeat date range for schedule item
function validateRepeatDateRange(rule: any, value: any, callback: any, scheduleItem: any) {
  // Repeat is always true now, so always validate dates
  if (!scheduleItem.repeat_start_date || !scheduleItem.repeat_end_date) {
    callback()
    return
  }

  if (scheduleItem.repeat_start_date.isAfter && scheduleItem.repeat_start_date.isAfter(scheduleItem.repeat_end_date)) {
    callback(new Error('Ngày bắt đầu phải trước ngày kết thúc'))
    return
  }

  callback()
}

// Validate price
function validatePrice(rule: any, value: any, callback: any) {
  if (!value || value <= 0) {
    callback(new Error('Giá cả là bắt buộc và phải lớn hơn 0'))
    return
  }

  callback()
}

// Validate discount price
function validateDiscountPrice(rule: any, value: any, callback: any) {
  if (!value) {
    // Discount price is optional
    callback()
    return
  }

  const price = formState.value.price || 0
  if (value >= price) {
    callback(new Error('Giá khuyến mãi phải nhỏ hơn giá gốc'))
    return
  }

  callback()
}

// Reset form
function resetForm() {
  formState.value = {
    title: '',
    student_count: '',
    schedule: [
      { day: null, start: null, end: null, repeat: true, repeat_start_date: null, repeat_end_date: null },
    ],
    // Reset pricing fields
    price: null,
    discount_price: null,
    background_color: BACKGROUND_COLORS[0],
  }
  // Reset form fields if formRef exists
  if (formRef.value) {
    try {
      formRef.value.resetFields()
    }
    catch (err) {
      // Ignore reset errors if form is not mounted
      console.warn('Form reset error:', err)
    }
  }
}

// Handle OK button
async function handleOk() {
  try {
    await formRef.value?.validateFields()
    confirmLoading.value = true

    // Transform form data to API format
    const classroomPayload: any = {
      course_id: props.courseId,
      title: formState.value.title,
      student_count: Number.parseInt(formState.value.student_count),
      schedules_data: formState.value.schedule
        .filter(schedule => schedule.day && schedule.start && schedule.end)
        .map((schedule) => {
          const scheduleData: any = {
            day_of_week: schedule.day as unknown as string,
            start_time: formatTimeForApi(schedule.start),
            end_time: formatTimeForApi(schedule.end),
          }

          // Add repeat dates (always required now)
          if (schedule.repeat_start_date && schedule.repeat_end_date) {
            scheduleData.repeat_start_date = schedule.repeat_start_date.format('YYYY-MM-DD')
            scheduleData.repeat_end_date = schedule.repeat_end_date.format('YYYY-MM-DD')
          }

          return scheduleData
        }),
      // Pricing fields
      price: formState.value.price?.toString() || '0',
      discount_price: formState.value.discount_price ? formState.value.discount_price.toString() : null,
      // Background color
      background_color: formState.value.background_color,
    }

    // Call API to create classroom
    // console.warn('Classroom payload (ready for backend):', JSON.stringify(classroomPayload, null, 2))
    await createClassroom(classroomPayload)

    // Close modal first
    dialogVisible.value = false
    
    // Reset form after dialog closes to avoid formRef errors
    await nextTick()
    resetForm()

    // Emit success event
    emit('success')

    // Show success message
    notification.success({
      message: t('admin.classroom.notifications.createSuccess') || 'Đã tạo lớp học thành công',
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Error creating classroom:', err)
    notification.error({
      message: t('admin.classroom.notifications.createFailed') || 'Có lỗi xảy ra khi tạo lớp học',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    confirmLoading.value = false
  }
}

// Handle cancel
function handleCancel() {
  dialogVisible.value = false
  // Reset form after dialog closes
  nextTick(() => {
    resetForm()
  })
}

// Watch for dialog close to reset form
watch(() => props.open, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="$t('admin.classroom.form.title')"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      name="basic"
      autocomplete="off"
      layout="vertical"
      class="flex items-start flex-col w-full"
    >
      <a-form-item
        :label="$t('admin.classroom.form.classroomTitle')"
        name="title"
        class="w-full"
        :rules="[{ required: true, message: t('admin.classroom.form.classroomTitleRequired') }]"
      >
        <a-input
          v-model:value="formState.title"
          size="large"
          :placeholder="$t('admin.classroom.form.classroomTitlePlaceholder')"
        />
      </a-form-item>

      <a-form-item
        :label="$t('admin.classroom.form.studentCount')"
        name="student_count"
        class="w-full"
        :rules="[
          { required: true, message: t('admin.classroom.form.studentCountRequired') },
          { type: 'number', min: 1, message: t('admin.classroom.form.studentCountMin') },
        ]"
      >
        <a-input-number
          v-model:value="formState.student_count"
          size="large"
          :placeholder="$t('admin.classroom.form.studentCountPlaceholder')"
          :min="1"
          class="w-full"
        />
      </a-form-item>

      <a-form-item
        :label="$t('admin.classroom.form.schedule')"
        name="schedule"
        class="w-full"
        :rules="[{ required: true, message: t('admin.classroom.form.scheduleRequired') }]"
      >
        <div class="flex flex-col gap-4 w-full">
          <div
            v-for="(item, index) in formState.schedule"
            :key="index"
            class="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center gap-2 w-full">
              <a-select
                v-model:value="item.day"
                :placeholder="$t('admin.classroom.form.selectDay')"
                class="h-10 w-1/3"
                :rules="[{ required: true, message: t('admin.classroom.form.selectDayRequired') }]"
              >
                <a-select-option
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  :value="day.value"
                >
                  {{ day.label }}
                </a-select-option>
              </a-select>

              <a-time-picker
                v-model:value="item.start"
                :allow-clear="false"
                format="HH:mm"
                :minute-step="30"
                :placeholder="$t('admin.classroom.form.startTime')"
                size="large"
                class="w-full"
              />

              <a-time-picker
                v-model:value="item.end"
                format="HH:mm"
                :minute-step="30"
                size="large"
                class="w-full"
                :placeholder="$t('admin.classroom.form.endTime')"
              />

              <div class="">
                <Icon
                  v-if="index > 0"
                  name="i-material-symbols-delete-outline"
                  class="text-[16px] text-red-500 cursor-pointer"
                  @click="removeScheduleItem(index)"
                />
              </div>
            </div>

            <!-- Repeat Date Range (always shown, repeat is always true) -->
            <div class="flex gap-4 w-full">
              <a-form-item
                label="Các buổi học lặp lại từ ngày"
                :name="['schedule', index, 'repeat_start_date']"
                class="w-full"
                :rules="[
                  { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
                  { validator: (rule: any, value: any, callback: any) => validateRepeatDateRange(rule, value, callback, item), trigger: 'change' },
                ]"
              >
                <a-date-picker
                  v-model:value="item.repeat_start_date"
                  size="large"
                  placeholder="Chọn ngày bắt đầu"
                  class="w-full"
                  format="YYYY-MM-DD"
                />
              </a-form-item>

              <a-form-item
                label="đến ngày"
                :name="['schedule', index, 'repeat_end_date']"
                class="w-full"
                :rules="[
                  { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                  { validator: (rule: any, value: any, callback: any) => validateRepeatDateRange(rule, value, callback, item), trigger: 'change' },
                ]"
              >
                <a-date-picker
                  v-model:value="item.repeat_end_date"
                  size="large"
                  placeholder="Chọn ngày kết thúc"
                  class="w-full"
                  format="YYYY-MM-DD"
                  :disabled-date="(current: any) => item.repeat_start_date && current && current < item.repeat_start_date.startOf('day')"
                />
              </a-form-item>
            </div>
          </div>

          <a-button
            type="primary"
            class="!h-10 !mt-2 !flex !items-center !gap-2 w-[118px]"
            @click="addScheduleItem"
          >
            {{ t('admin.classroom.form.addMore') }}
            <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
          </a-button>
        </div>
      </a-form-item>

      <!-- Pricing Section -->
      <div class="w-full border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Giá cả
        </h3>

        <div class="grid grid-cols-2 gap-4">
          <!-- Price -->
          <a-form-item
            label="Giá gốc"
            name="price"
            class="w-full"
            :rules="[{ required: true, validator: validatePrice, trigger: 'change' }]"
          >
            <a-input-number
              v-model:value="formState.price"
              size="large"
              placeholder="Nhập giá gốc"
              :min="0"
              :step="0.01"
              :precision="2"
              class="w-full"
            >
              <template #prefix>
                <span class="text-gray-500">€</span>
              </template>
            </a-input-number>
            <div class="text-xs text-gray-500 mt-1">
              Giá gốc của lớp học (bắt buộc)
            </div>
          </a-form-item>

          <!-- Discount Price -->
          <a-form-item
            label="Giá khuyến mãi"
            name="discount_price"
            class="w-full"
            :rules="[{ validator: validateDiscountPrice, trigger: 'change' }]"
          >
            <a-input-number
              v-model:value="formState.discount_price"
              size="large"
              placeholder="Nhập giá khuyến mãi (tùy chọn)"
              :min="0"
              :step="0.01"
              :precision="2"
              class="w-full"
            >
              <template #prefix>
                <span class="text-gray-500">€</span>
              </template>
            </a-input-number>
            <div class="text-xs text-gray-500 mt-1">
              Giá khuyến mãi (nếu có). Phải nhỏ hơn giá gốc.
            </div>
          </a-form-item>
        </div>

        <!-- Effective Price Display (Read-only) -->
        <div v-if="formState.price" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600 mb-1">
            Giá hiệu lực:
          </div>
          <div class="text-lg font-semibold text-green-600">
            €{{ (formState.discount_price && formState.discount_price < formState.price
              ? formState.discount_price
              : formState.price).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </div>
        </div>
      </div>

      <!-- Background Color Section -->
      <div class="w-full border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Màu nền cho lịch học
        </h3>

        <a-form-item
          label="Màu nền"
          name="background_color"
          class="w-full"
        >
          <div class="flex flex-wrap gap-2">
            <div
              v-for="color in BACKGROUND_COLORS"
              :key="color"
              class="w-10 h-10 rounded-lg cursor-pointer border-2 transition-all"
              :class="formState.background_color === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-500'"
              :style="{ backgroundColor: color }"
              @click="formState.background_color = color"
            />
          </div>
        </a-form-item>
        <div class="text-xs text-gray-500 mt-1">
          Chọn màu nền để hiển thị trên lịch học
        </div>
      </div>
    </a-form>
  </a-modal>
</template>
