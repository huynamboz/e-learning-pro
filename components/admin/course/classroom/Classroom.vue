<script lang="ts" setup>
import type { ClassroomPayload } from '~/composables/api/useClassroomApi'
import { useCourseApi } from '~/composables/api'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import CardClassroom from './CardClassroom.vue'

interface Props {
  courseId: string
}

const props = defineProps<Props>()

const { createClassroom } = useClassroomApi()
const { getDetailCourses } = useCourseApi()

// State
const classRoomData = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const courseDetail = ref<any>(null)

const open = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
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
  title: '',
  student_count: '',
  schedule: [
    { day: null, start: null, end: null },
  ],
})

function AddNewClassroom() {
  open.value = true
}

function addScheduleItem() {
  formState.value.schedule.push({ day: null, start: null, end: null })
}

function removeScheduleItem(index: number) {
  if (index > 0) {
    formState.value.schedule.splice(index, 1)
  }
}

// Load course detail and extract classrooms
async function loadCourseDetail() {
  try {
    isLoading.value = true
    error.value = null
    const response = await getDetailCourses(props.courseId)
    courseDetail.value = response

    // Extract classrooms from course detail
    if ((response as any).classrooms) {
      classRoomData.value = (response as any).classrooms
    }
    else {
      classRoomData.value = []
    }
  }
  catch (err: any) {
    console.error('Error loading course detail:', err)
    error.value = err.message || 'Failed to load course detail'
  }
  finally {
    isLoading.value = false
  }
}

// Format time for API
function formatTimeForApi(time: any): string {
  if (!time)
    return ''
  if (typeof time === 'string')
    return time
  if (time.format) {
    return time.format('HH:mm:ss')
  }
  return time.toString()
}

// Create classroom
async function handleOk() {
  try {
    await formRef.value?.validateFields()
    confirmLoading.value = true

    // Transform form data to API format
    const classroomPayload: ClassroomPayload = {
      course_id: props.courseId,
      title: formState.value.title,
      student_count: Number.parseInt(formState.value.student_count),
      schedules_data: formState.value.schedule
        .filter(schedule => schedule.day && schedule.start && schedule.end)
        .map(schedule => ({
          day_of_week: schedule.day as unknown as string,
          start_time: formatTimeForApi(schedule.start),
          end_time: formatTimeForApi(schedule.end),
        })),
    }

    await createClassroom(classroomPayload)

    // Reload course detail to get updated classrooms
    await loadCourseDetail()

    // Reset form and close modal
    resetForm()
    open.value = false

    // Show success message
    const { $message } = useNuxtApp() as unknown as { $message: any }
    $message.success('Classroom created successfully!')
  }
  catch (err: any) {
    console.error('Error creating classroom:', err)
    const { $message } = useNuxtApp() as unknown as { $message: any }
    $message.error(err.message || 'Failed to create classroom')
  }
  finally {
    confirmLoading.value = false
  }
}

// Reset form
function resetForm() {
  formState.value = {
    title: '',
    student_count: '',
    schedule: [
      { day: null, start: null, end: null },
    ],
  }
  formRef.value?.resetFields()
}

// Load course detail on mount
onMounted(() => {
  loadCourseDetail()
})
</script>

<template>
  <div class="classroom">
    <a-button
      type="primary"
      class="!px-6 !h-12 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-1 !bg-[#548A1D] !my-6"
      @click="AddNewClassroom"
    >
      Add new classroom
      <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
    </a-button>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <a-spin size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500 mb-4">
        {{ error }}
      </p>
      <a-button @click="loadCourseDetail">
        Try Again
      </a-button>
    </div>

    <!-- Classrooms Grid -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      <CardClassroom
        v-for="item in classRoomData"
        :key="item.id"
        :class-room-data="item"
      />
    </div>

    <a-modal v-model:open="open" title="Create class room" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          label="Classroom Title"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: 'Please input classroom title!' }]"
        >
          <a-input v-model:value="formState.title" size="large" placeholder="Enter classroom title" />
        </a-form-item>

        <a-form-item
          label="Student Count"
          name="student_count"
          class="w-full"
          :rules="[
            { required: true, message: 'Please input student count!' },
            { type: 'number', min: 1, message: 'Student count must be at least 1!' },
          ]"
        >
          <a-input-number
            v-model:value="formState.student_count"
            size="large"
            placeholder="Enter student count"
            :min="1"
            class="w-full"
          />
        </a-form-item>

        <a-form-item
          label="Schedule"
          name="schedule"
          class="w-full"
          :rules="[{ required: true, message: 'Please input schedule!' }]"
        >
          <div class="flex flex-col gap-3 w-full">
            <div
              v-for="(item, index) in formState.schedule"
              :key="index"
              class="flex items-center gap-2 w-full"
            >
              <a-select
                v-model:value="item.day"
                placeholder="Chọn thứ"
                class="h-10 w-1/3"
                :rules="[{ required: true, message: 'Please select day!' }]"
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
                format="HH:mm"
                :minute-step="30"
                placeholder="Start time"
                size="large"
                class="w-full"
              />

              <a-time-picker
                v-model:value="item.end"
                format="HH:mm"
                :minute-step="30"
                size="large"
                class="w-full"
                placeholder="End time"
              />

              <div class="">
                <Icon v-if="index > 0" name="i-material-symbols-delete-outline" class="text-[16px] text-red-500 cursor-pointer" @click="removeScheduleItem(index)" />
              </div>
            </div>

            <a-button
              type="primary"
              class="!h-10 !mt-2 !flex !items-center !gap-2 w-[118px]"
              @click="addScheduleItem"
            >
              Add more
              <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
