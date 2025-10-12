<script lang="ts" setup>
import type { ClassroomDetail, ClassroomSchedule } from '~/types/course.type'

interface Props {
  visible: boolean
  classroom: ClassroomDetail | null
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: any): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const { t: _t } = useI18n()

// Form state
const formState = ref({
  title: '',
  student_count: 0,
  start_date: '',
  end_date: '',
  meeting_link: '',
  schedules_data: [] as ClassroomSchedule[],
})

// Form validation
const formRef = ref()

// Watch for classroom changes to populate form
watch(() => props.classroom, (newClassroom) => {
  if (newClassroom) {
    formState.value = {
      title: newClassroom.title || '',
      student_count: newClassroom.student_count || 0,
      start_date: newClassroom.start_date ? newClassroom.start_date.split('T')[0] : '',
      end_date: newClassroom.end_date ? newClassroom.end_date.split('T')[0] : '',
      meeting_link: newClassroom.meeting_link || '',
      schedules_data: newClassroom.schedules?.map(schedule => ({
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
      })) || [],
    }
  }
}, { immediate: true })

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Handle save
async function handleSave() {
  try {
    await formRef.value?.validateFields()

    const formData = {
      title: formState.value.title,
      student_count: formState.value.student_count,
      start_date: formState.value.start_date,
      end_date: formState.value.end_date,
      meeting_link: formState.value.meeting_link,
      schedules_data: formState.value.schedules_data,
    }

    emit('save', formData)
  }
  catch (error) {
    console.error('Form validation failed:', error)
  }
}

// Handle cancel
function handleCancel() {
  emit('cancel')
  isVisible.value = false
}

// Schedule management functions
function addSchedule() {
  formState.value.schedules_data.push({
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '10:00',
  })
}

function removeSchedule(index: number) {
  formState.value.schedules_data.splice(index, 1)
}

// Day options for schedule
const dayOptions = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]
</script>

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.edit.title')"
    width="600px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Classroom Title -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.edit.classroomTitle') }}
        </label>
        <a-input
          v-model:value="formState.title"
          :placeholder="$t('admin.classroom.edit.classroomTitlePlaceholder')"
          size="large"
        />
      </div>

      <!-- Student Count -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.edit.studentCount') }}
        </label>
        <a-input-number
          v-model:value="formState.student_count"
          :min="1"
          :max="1000"
          size="large"
          class="w-full"
          :placeholder="$t('admin.classroom.edit.studentCountPlaceholder')"
        />
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.edit.startDate') }}
          </label>
          <a-date-picker
            v-model:value="formState.start_date"
            size="large"
            class="w-full"
            :placeholder="$t('admin.classroom.edit.startDatePlaceholder')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.edit.endDate') }}
          </label>
          <a-date-picker
            v-model:value="formState.end_date"
            size="large"
            class="w-full"
            :placeholder="$t('admin.classroom.edit.endDatePlaceholder')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
      </div>

      <!-- Meeting Link -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.edit.meetingLink') }}
        </label>
        <a-input
          v-model:value="formState.meeting_link"
          :placeholder="$t('admin.classroom.edit.meetingLinkPlaceholder')"
          size="large"
        />
      </div>

      <!-- Schedule Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-medium text-gray-900">
            {{ $t('admin.classroom.edit.schedule') }}
          </h4>
          <a-button type="dashed" size="small" @click="addSchedule">
            <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
            {{ $t('admin.classroom.edit.addSchedule') }}
          </a-button>
        </div>

        <div v-if="formState.schedules_data.length === 0" class="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <Icon name="i-heroicons-calendar-days" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500 text-sm">
            {{ $t('admin.classroom.edit.noSchedules') }}
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(schedule, index) in formState.schedules_data"
            :key="index"
            class="border rounded-lg p-4 bg-gray-50"
          >
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-gray-700">
                {{ $t('admin.classroom.edit.scheduleItem') }} {{ index + 1 }}
              </h5>
              <a-button
                type="text"
                size="small"
                danger
                @click="removeSchedule(index)"
              >
                <Icon name="i-heroicons-trash" class="w-4 h-4" />
              </a-button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Day of Week -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  {{ $t('admin.classroom.edit.dayOfWeek') }}
                </label>
                <a-select
                  v-model:value="schedule.day_of_week"
                  :options="dayOptions"
                  size="small"
                  class="w-full"
                />
              </div>

              <!-- Start Time -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  {{ $t('admin.classroom.edit.startTime') }}
                </label>
                <a-time-picker
                  v-model:value="schedule.start_time"
                  format="HH:mm"
                  value-format="HH:mm"
                  size="small"
                  class="w-full"
                />
              </div>

              <!-- End Time -->
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  {{ $t('admin.classroom.edit.endTime') }}
                </label>
                <a-time-picker
                  v-model:value="schedule.end_time"
                  format="HH:mm"
                  value-format="HH:mm"
                  size="small"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Info Display -->
      <div v-if="classroom" class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">
          {{ $t('admin.classroom.edit.currentInfo') }}
        </h4>
        <div class="space-y-1 text-sm text-gray-600">
          <div>
            <span class="font-medium">{{ $t('admin.classroom.edit.course') }}:</span>
            {{ classroom.course.title }}
          </div>
          <div>
            <span class="font-medium">{{ $t('admin.classroom.edit.enrolled') }}:</span>
            {{ classroom.enrollment_count }} {{ $t('admin.classroom.edit.students') }}
          </div>
          <div>
            <span class="font-medium">{{ $t('admin.classroom.edit.sessions') }}:</span>
            {{ classroom.session_count }}
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Actions -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
      <a-button @click="handleCancel">
        {{ $t('admin.classroom.edit.cancel') }}
      </a-button>
      <a-button
        type="primary"
        :loading="loading"
        class="!bg-[#548A1D]"
        @click="handleSave"
      >
        {{ $t('admin.classroom.edit.save') }}
      </a-button>
    </div>
  </a-modal>
</template>
