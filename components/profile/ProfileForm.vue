<script lang="ts" setup>
import type { Profile } from '@/types/auth.type'
import { useAuth } from '#imports'
import { notification } from 'ant-design-vue'

const props = defineProps<{
  dataProfile?: Profile
  isFetchingProfile: boolean
}>()

const { updateProfile, fetchProfile } = useAuth()

const formRef = ref()

const formState = reactive({
  first_name: '',
  last_name: '',
  headline: '',
  bio: '',
  preferred_language: 'en',
  website_url: '',
  x_handle: '',
  linkedin_url: '',
  youtube_url: '',
  facebook_url: '',
})

const listLanguages = ref([
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'en', label: 'English' },
])

watch(
  () => props.dataProfile,
  (val) => {
    if (val) {
      formState.first_name = val.first_name || ''
      formState.last_name = val.last_name || ''
      formState.headline = val.headline || ''
      formState.bio = val.bio || ''
      formState.preferred_language = val.preferred_language || 'VI'
      formState.website_url = val.website_url || ''
      formState.x_handle = val.x_handle || ''
      formState.linkedin_url = val.linkedin_url || ''
      formState.youtube_url = val.youtube_url || ''
      formState.facebook_url = val.facebook_url || ''
    }
  },
  { immediate: true },
)

async function onFinish() {
  await formRef.value?.validateFields()
  try {
    // hell
    const response = updateProfile(formState)
    if ((await response).success) {
      notification.success({
        message: 'Create chapter cuccess',
      })
      fetchProfile()
    }
  }
  catch (error) {
    notification.error({
      message: 'Update profile failed',
    })
  }
}
</script>

<template>
  <a-form
    ref="formRef"
    :model="formState"
    name="basic"
    autocomplete="off"
    layout="vertical"
    class="flex flex-col gap-8 w-full !pb-20"
    @finish="onFinish"
  >
    <!-- Personal Info -->
    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <div class="flex items-center gap-3">
        <a-form-item
          label="First Name"
          name="first_name"
          :rules="[{ required: true, message: 'Please input your first name!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.first_name" size="large" placeholder="Enter first name" />
        </a-form-item>
        <a-form-item
          label="Last Name"
          name="last_name"
          :rules="[{ required: true, message: 'Please input your last name!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.last_name" size="large" placeholder="Enter last name" />
        </a-form-item>
      </div>

      <a-form-item
        label="Headline"
        name="headline"
        :rules="[{ required: true, message: 'Please input your headline!' }]"
        class="w-1/2"
      >
        <a-input v-model:value="formState.headline" size="large" placeholder="Enter headline" />
      </a-form-item>

      <a-form-item
        label="Bio"
        name="bio"
        :rules="[{ required: true, message: 'Please input your bio!' }]"
        class="w-full"
      >
        <a-textarea
          v-model:value="formState.bio"
          placeholder="Enter bio"
          :auto-size="{ minRows: 5, maxRows: 5 }"
        />
      </a-form-item>

      <a-form-item
        label="Preferred Language"
        name="preferred_language"
        :rules="[{ required: true, message: 'Please choose language!' }]"
        class="w-1/2"
      >
        <a-select
          v-model:value="formState.preferred_language"
          :options="listLanguages"
          placeholder="Language"
          size="large"
          :field-names="{ label: 'label', value: 'key' }"
        />
      </a-form-item>
    </div>

    <!-- Upload -->
    <ProfileUploadForm />

    <!-- Links -->
    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <h1 class="text-xl font-semibold mb-6">
        Links
      </h1>

      <a-form-item
        label="Website" name="website_url" :rules="[
          { type: 'url', message: 'Please enter a valid URL!' },
        ]"
      >
        <a-input v-model:value="formState.website_url" size="large" placeholder="Enter website" />
      </a-form-item>

      <a-form-item
        label="X (Formerly Twitter)" name="x_handle" :rules="[
          { type: 'url', message: 'Please enter a valid URL!' },
        ]"
      >
        <a-input v-model:value="formState.x_handle" size="large" placeholder="Enter X handle" />
      </a-form-item>

      <a-form-item
        label="LinkedIn" name="linkedin_url" :rules="[
          { type: 'url', message: 'Please enter a valid URL!' },
        ]"
      >
        <a-input v-model:value="formState.linkedin_url" size="large" placeholder="Enter LinkedIn" />
      </a-form-item>

      <a-form-item
        label="YouTube" name="youtube_url" :rules="[
          { type: 'url', message: 'Please enter a valid URL!' },
        ]"
      >
        <a-input v-model:value="formState.youtube_url" size="large" placeholder="Enter YouTube" />
      </a-form-item>

      <a-form-item
        label="Facebook" name="facebook_url" :rules="[
          { type: 'url', message: 'Please enter a valid URL!' },
        ]"
      >
        <a-input v-model:value="formState.facebook_url" size="large" placeholder="Enter Facebook" />
      </a-form-item>
    </div>

    <div class="text-right w-full">
      <a-button :loading="isFetchingProfile" type="primary" class="max-w-[148px] !h-[40px]" html-type="submit">
        Update Profile
      </a-button>
    </div>
  </a-form>
</template>
