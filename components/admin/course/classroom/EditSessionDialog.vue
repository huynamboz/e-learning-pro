<script lang="ts" setup>
interface Props {
  visible: boolean
  session: any
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

const { t } = useI18n()

// Form state
const formState = ref({
  topic: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  meeting_link: '',
  meeting_id: '',
  meeting_pass: '',
  limit: 100,
})

// Handle dialog visibility
const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// Watch for session changes to populate form
watch(() => props.session, (newSession) => {
  if (newSession) {
    formState.value = {
      topic: newSession.topic || '',
      description: newSession.description || '',
      start_time: newSession.start_time ? new Date(newSession.start_time).toISOString().slice(0, 16) : '',
      end_time: newSession.end_time ? new Date(newSession.end_time).toISOString().slice(0, 16) : '',
      location: newSession.location || '',
      meeting_link: newSession.meeting_link || '',
      meeting_id: newSession.meeting_id || '',
      meeting_pass: newSession.meeting_pass || '',
      limit: newSession.limit || 0,
    }
  }
}, { immediate: true })

// Handle save
async function handleSave() {
  const formData = {
    topic: formState.value.topic,
    description: formState.value.description,
    start_time: new Date(formState.value.start_time).toISOString(),
    end_time: new Date(formState.value.end_time).toISOString(),
    location: formState.value.location,
    meeting_link: formState.value.meeting_link,
    meeting_id: formState.value.meeting_id,
    meeting_pass: formState.value.meeting_pass,
    limit: formState.value.limit,
  }

  emit('save', formData)
}

// Handle cancel
function handleCancel() {
  emit('cancel')
  isVisible.value = false
}
</script>

<template>
  <a-modal
    v-model:open="isVisible"
    :title="$t('admin.classroom.detail.editSession')"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="space-y-4">
      <!-- Topic -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.sessionTopic') }}
        </label>
        <a-input
          v-model:value="formState.topic"
          :placeholder="$t('admin.classroom.detail.sessionTopicPlaceholder')"
          size="large"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.sessionDescription') }}
        </label>
        <a-textarea
          v-model:value="formState.description"
          :placeholder="$t('admin.classroom.detail.sessionDescriptionPlaceholder')"
          :rows="3"
          size="large"
        />
      </div>

      <!-- Date and Time -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.startTime') }}
          </label>
          <a-input
            v-model:value="formState.start_time"
            type="datetime-local"
            size="large"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.endTime') }}
          </label>
          <a-input
            v-model:value="formState.end_time"
            type="datetime-local"
            size="large"
          />
        </div>
      </div>

      <!-- Location -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('admin.classroom.detail.location') }}
        </label>
        <a-input
          v-model:value="formState.location"
          :placeholder="$t('admin.classroom.detail.locationPlaceholder')"
          size="large"
        />
      </div>

      <!-- Meeting Information -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900">
          {{ $t('admin.classroom.detail.meetingInfo') }}
        </h4>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.meetingLink') }}
          </label>
          <a-input
            v-model:value="formState.meeting_link"
            :placeholder="$t('admin.classroom.meetingLink.meetingLinkPlaceholder')"
            size="large"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('admin.classroom.detail.meetingId') }}
            </label>
            <a-input
              v-model:value="formState.meeting_id"
              :placeholder="$t('admin.classroom.detail.meetingIdPlaceholder')"
              size="large"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('admin.classroom.detail.meetingPassword') }}
            </label>
            <a-input
              v-model:value="formState.meeting_pass"
              :placeholder="$t('admin.classroom.detail.meetingPasswordPlaceholder')"
              size="large"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.classroom.detail.participantLimit') }}
          </label>
          <a-input-number
            v-model:value="formState.limit"
            :min="1"
            :max="1000"
            size="large"
            class="w-full"
          />
        </div>

      </div>
    </div>

    <!-- Dialog Actions -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
      <a-button @click="handleCancel">
        {{ $t('admin.classroom.meetingLink.cancel') }}
      </a-button>
      <a-button
        type="primary"
        :loading="loading"
        class="!bg-[#548A1D]"
        @click="handleSave"
      >
        {{ $t('admin.classroom.detail.saveSession') }}
      </a-button>
    </div>
  </a-modal>
</template>
