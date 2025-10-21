<script lang="ts" setup>
import type { CourseStudent } from '~/types/course.type'


interface Props {
  visible: boolean
  students: CourseStudent[]
  classroomTitle?: string
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  classroomTitle: '',
  loading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})


// Handle cancel
function handleCancel() {
  emit('cancel')
  isVisible.value = false
}

// Format date for display
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.detail.studentList')"
    width="900px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Classroom Info -->
      <div v-if="classroomTitle" class="bg-blue-50 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2">
          <Icon name="i-heroicons-academic-cap" class="w-5 h-5 text-blue-600" />
          <span class="font-medium text-blue-900">{{ classroomTitle }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <a-spin size="large" />
      </div>

      <!-- Empty State -->
      <div v-else-if="students.length === 0" class="text-center py-8">
        <Icon name="i-heroicons-users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 mb-4">
          {{ $t('admin.classroom.detail.noStudents') }}
        </p>
      </div>

      <!-- Students List -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('admin.classroom.detail.totalStudents') }}: {{ students.length }}
          </h3>
        </div>

        <div class="grid gap-3">
          <div
            v-for="(student, index) in students"
            :key="student.id || index"
            class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="i-heroicons-user" class="w-6 h-6 text-blue-600" />
                </div>

                <!-- Student Info -->
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 mb-1">
                    {{ `${student.last_name || ''} ${student.first_name || ''}`.trim() || student.username || student.email || 'N/A' }}
                  </h4>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div v-if="student.email" class="flex items-center gap-2">
                      <Icon name="i-heroicons-envelope" class="w-4 h-4" />
                      <span>{{ student.email }}</span>
                    </div>
                    <div v-if="student.username" class="flex items-center gap-2">
                      <Icon name="i-heroicons-user" class="w-4 h-4" />
                      <span>{{ student.username }}</span>
                    </div>
                    <div v-if="student.enrollment.enrolled_at" class="flex items-center gap-2">
                      <Icon name="i-heroicons-calendar-days" class="w-4 h-4" />
                      <span>{{ $t('admin.classroom.detail.enrolledOn') }}: {{ formatDate(student.enrollment.enrolled_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="student.enrollment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ student.enrollment.is_active ? $t('admin.classroom.detail.active') : $t('admin.classroom.detail.inactive') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Actions -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
      <a-button @click="handleCancel">
        {{ $t('admin.classroom.meetingLink.cancel') }}
      </a-button>
    </div>
  </a-modal>
</template>
