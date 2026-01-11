<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useClassroomApi } from '~/composables/api/useClassroomApi'

const { t } = useI18n()
const { createBulkSessions } = useClassroomApi()

interface Props {
  open: boolean
  courseId: string
  classrooms: Array<{ id: string; title: string }>
  loading?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  classrooms: () => [],
})

const emit = defineEmits<Emits>()

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

const formState = ref({
  classroom_id: null as string | null,
  schedule: [
    { day: null, start: null, end: null, repeat: false, repeat_start_date: null as any, repeat_end_date: null as any },
  ],
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
})

// Computed for dialog visibility
const dialogVisible = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  },
})

function addScheduleItem() {
  formState.value.schedule.push({ day: null, start: null, end: null, repeat: false, repeat_start_date: null, repeat_end_date: null })
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
  return ''
}

// Validate repeat date range for schedule item
function validateRepeatDateRange(rule: any, value: any, callback: any, scheduleItem: any) {
  if (!scheduleItem.repeat) {
    callback()
    return
  }

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

// Reset form
function resetForm() {
  formState.value = {
    classroom_id: null,
    schedule: [
      { day: null, start: null, end: null, repeat: false, repeat_start_date: null, repeat_end_date: null },
    ],
    meeting_link: '',
    meeting_id: '',
    meeting_pass: '',
  }
  formRef.value?.resetFields()
}

// Handle cancel
function handleCancel() {
  resetForm()
  dialogVisible.value = false
}

// Handle OK button
async function handleOk() {
  if (!formState.value.classroom_id) {
    notification.error({
      message: 'Lỗi',
      description: 'Vui lòng chọn lớp học',
      duration: 3,
    })
    return
  }

  try {
    await formRef.value?.validateFields()
    confirmLoading.value = true

    // Transform form data to API format
    const schedulesData = formState.value.schedule
      .filter(schedule => schedule.day && schedule.start && schedule.end)
      .map((schedule) => {
        const scheduleData: any = {
          day_of_week: schedule.day as unknown as string,
          start_time: formatTimeForApi(schedule.start),
          end_time: formatTimeForApi(schedule.end),
        }

        // Add repeat dates if repeat is enabled
        if (schedule.repeat && schedule.repeat_start_date && schedule.repeat_end_date) {
          scheduleData.repeat_start_date = schedule.repeat_start_date.format('YYYY-MM-DD')
          scheduleData.repeat_end_date = schedule.repeat_end_date.format('YYYY-MM-DD')
        }

        return scheduleData
      })

    if (schedulesData.length === 0) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng thêm ít nhất một lịch học',
        duration: 3,
      })
      confirmLoading.value = false
      return
    }

    const sessionsPayload: any = {
      schedules_data: schedulesData,
    }

    // Add meeting fields if provided
    if (formState.value.meeting_link) {
      sessionsPayload.meeting_link = formState.value.meeting_link
    }
    if (formState.value.meeting_id) {
      sessionsPayload.meeting_id = formState.value.meeting_id
    }
    if (formState.value.meeting_pass) {
      sessionsPayload.meeting_pass = formState.value.meeting_pass
    }

    // Call API to create bulk sessions
    await createBulkSessions(formState.value.classroom_id, sessionsPayload)

    // Reset form and close modal
    resetForm()
    dialogVisible.value = false

    // Emit success event
    emit('success')

    // Show success message
    notification.success({
      message: 'Thành công',
      description: 'Đã tạo buổi học thành công',
      duration: 3,
    })
  }
  catch (err: any) {
    console.error('Error creating sessions:', err)
    notification.error({
      message: 'Lỗi khi tạo buổi học',
      description: err.message || err.detail || 'Vui lòng thử lại',
      duration: 5,
    })
  }
  finally {
    confirmLoading.value = false
  }
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
    title="Thêm buổi học cho lớp"
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
      <!-- Classroom Selection -->
      <a-form-item
        label="Chọn lớp học"
        name="classroom_id"
        class="w-full"
        :rules="[{ required: true, message: 'Vui lòng chọn lớp học' }]"
      >
        <a-select
          v-model:value="formState.classroom_id"
          size="large"
          placeholder="Chọn lớp học"
          class="w-full"
        >
          <a-select-option
            v-for="classroom in classrooms"
            :key="classroom.id"
            :value="classroom.id"
          >
            {{ classroom.title }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Schedule Section -->
      <a-form-item
        label="Lịch học"
        name="schedule"
        class="w-full"
        :rules="[{ required: true, message: 'Vui lòng thêm ít nhất một lịch học' }]"
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
                placeholder="Chọn thứ"
                class="h-10 w-1/3"
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
                placeholder="Giờ bắt đầu"
                size="large"
                class="w-full"
              />

              <a-time-picker
                v-model:value="item.end"
                format="HH:mm"
                :minute-step="30"
                size="large"
                class="w-full"
                placeholder="Giờ kết thúc"
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

            <!-- Repeat Checkbox -->
            <div class="flex items-center gap-2">
              <a-checkbox v-model:checked="item.repeat">
                Lặp lại
              </a-checkbox>
            </div>

            <!-- Repeat Date Range (shown when repeat is checked) -->
            <div v-if="item.repeat" class="flex gap-4 w-full pl-6">
              <a-form-item
                label="Các buổi học lặp lại từ ngày"
                :name="['schedule', index, 'repeat_start_date']"
                class="w-full"
                :rules="[
                  { required: item.repeat, message: 'Vui lòng chọn ngày bắt đầu' },
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
                  { required: item.repeat, message: 'Vui lòng chọn ngày kết thúc' },
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
            Thêm lịch
            <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
          </a-button>
        </div>
      </a-form-item>

      <!-- Meeting Information Section -->
      <div class="w-full border-t border-gray-200 pt-4 mt-4">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Thông tin meeting (tùy chọn)
        </h3>

        <!-- Meeting Link -->
        <a-form-item
          label="Meeting Link"
          name="meeting_link"
          class="w-full"
        >
          <a-input
            v-model:value="formState.meeting_link"
            size="large"
            placeholder="https://zoom.us/j/..."
            class="w-full"
          />
        </a-form-item>

        <!-- Meeting ID -->
        <a-form-item
          label="Meeting ID"
          name="meeting_id"
          class="w-full"
        >
          <a-input
            v-model:value="formState.meeting_id"
            size="large"
            placeholder="Nhập Meeting ID"
            class="w-full"
          />
        </a-form-item>

        <!-- Meeting Password -->
        <a-form-item
          label="Meeting Password"
          name="meeting_pass"
          class="w-full"
        >
          <a-input
            v-model:value="formState.meeting_pass"
            size="large"
            placeholder="Nhập password"
            type="password"
            class="w-full"
          />
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

