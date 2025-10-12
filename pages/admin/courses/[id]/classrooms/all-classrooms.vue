// Classrooms list
<script lang="ts" setup>
import type { ClassroomPayload } from '~/composables/api/useClassroomApi'
import { useCourseApi } from '~/composables/api'
import { useClassroomApi } from '~/composables/api/useClassroomApi'
import CardClassroom from '~/components/admin/course/classroom/CardClassroom.vue'

const { t } = useI18n()

const route = useRoute()
const courseId = computed(() => route.params.id as string)
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
    const response = await getDetailCourses(courseId.value)
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
    error.value = err.message || t('admin.classroom.notifications.loadFailed')
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
      course_id: courseId.value,
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
    $message.success(t('admin.classroom.notifications.createSuccess'))
  }
  catch (err: any) {
    console.error('Error creating classroom:', err)
    const { $message } = useNuxtApp() as unknown as { $message: any }
    $message.error(err.message || t('admin.classroom.notifications.createFailed'))
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
      v-if="classRoomData && classRoomData.length > 0"
      type="primary"
      class="!px-6 !h-12 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-1 !bg-[#548A1D] !my-6"
      @click="AddNewClassroom"
    >
      {{ t('admin.classroom.addNewClassroom') }}
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
        {{ t('common.tryAgain') }}
      </a-button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!classRoomData || classRoomData.length === 0" class="text-center py-12">
      <div class="flex flex-col items-center justify-center space-y-6">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon name="i-heroicons-building-office-2" size="40" class="text-gray-500" />
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-gray-900">{{ t('admin.classroom.emptyStates.noClassrooms') }}</h3>
          <p class="text-gray-500 max-w-md text-sm leading-relaxed">
            {{ t('admin.classroom.emptyStates.noClassroomsDescription') }}
          </p>
        </div>
        <a-button
          type="primary"
          size="large"
          class="!px-6 !h-12 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-2"
          @click="AddNewClassroom"
        >
          <Icon name="i-material-symbols-add-2-rounded" size="16" />
          {{ t('admin.classroom.createFirstClassroom') }}
        </a-button>
      </div>
    </div>

    <!-- Classrooms Grid -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      <CardClassroom
        v-for="item in classRoomData"
        :key="item.id"
        :class-room-data="item"
      />
    </div>

    <a-modal v-model:open="open" :title="t('admin.classroom.form.title')" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          :label="t('admin.classroom.form.classroomTitle')"
          name="title"
          class="w-full"
          :rules="[{ required: true, message: t('admin.classroom.form.classroomTitleRequired') }]"
        >
          <a-input v-model:value="formState.title" size="large" :placeholder="t('admin.classroom.form.classroomTitlePlaceholder')" />
        </a-form-item>

        <a-form-item
          :label="t('admin.classroom.form.studentCount')"
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
            :placeholder="t('admin.classroom.form.studentCountPlaceholder')"
            :min="1"
            class="w-full"
          />
        </a-form-item>

        <a-form-item
          :label="t('admin.classroom.form.schedule')"
          name="schedule"
          class="w-full"
          :rules="[{ required: true, message: t('admin.classroom.form.scheduleRequired') }]"
        >
          <div class="flex flex-col gap-3 w-full">
            <div
              v-for="(item, index) in formState.schedule"
              :key="index"
              class="flex items-center gap-2 w-full"
            >
              <a-select
                v-model:value="item.day"
                :placeholder="t('admin.classroom.form.selectDay')"
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
                :allow-clear="false"
                v-model:value="item.start"
                format="HH:mm"
                :minute-step="30"
                :placeholder="t('admin.classroom.form.startTime')"
                size="large"
                class="w-full"
              />

              <a-time-picker
                v-model:value="item.end"
                format="HH:mm"
                :minute-step="30"
                size="large"
                class="w-full"
                :placeholder="t('admin.classroom.form.endTime')"
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
              {{ t('admin.classroom.form.addMore') }}
              <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
