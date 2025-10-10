<script lang="ts" setup>
import type { User } from '@/types/auth.type'
import { useAuth } from '#imports'
import { notification } from 'ant-design-vue'

const props = defineProps<{
  dataProfile?: User
  isFetchingProfile: boolean
}>()

const { updateProfile, fetchProfile } = useAuth()
const { t } = useI18n()

const formRef = ref()

const formState = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
})

watch(
  () => props.dataProfile,
  (val) => {
    if (val) {
      formState.first_name = val.first_name || ''
      formState.last_name = val.last_name || ''
      formState.username = val.username || ''
      formState.email = val.email || ''
    }
  },
  { immediate: true },
)

async function onFinish() {
  await formRef.value?.validateFields()
  try {
    const response = updateProfile(formState)
    if ((await response).success) {
      notification.success({
        message: t('profileForm.messages.updateSuccess'),
      })
      fetchProfile()
    }
  }
  catch (error) {
    notification.error({
      message: t('profileForm.messages.updateFailed'),
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
          :label="$t('profileForm.firstName')"
          name="first_name"
          :rules="[{ required: true, message: $t('profileForm.validation.firstNameRequired') }]"
          class="w-full"
        >
          <a-input v-model:value="formState.first_name" size="large" :placeholder="$t('profileForm.enterFirstName')" />
        </a-form-item>
        <a-form-item
          :label="$t('profileForm.lastName')"
          name="last_name"
          :rules="[{ required: true, message: $t('profileForm.validation.lastNameRequired') }]"
          class="w-full"
        >
          <a-input v-model:value="formState.last_name" size="large" :placeholder="$t('profileForm.enterLastName')" />
        </a-form-item>
      </div>

      <a-form-item
        :label="$t('profileForm.username')"
        name="username"
        :rules="[{ required: true, message: $t('profileForm.validation.usernameRequired') }]"
        class="w-1/2"
      >
        <a-input v-model:value="formState.username" size="large" :placeholder="$t('profileForm.enterUsername')" />
      </a-form-item>

      <a-form-item
        :label="$t('profileForm.email')"
        name="email"
        :rules="[
          { required: true, message: $t('profileForm.validation.emailRequired') },
          { type: 'email', message: $t('profileForm.validation.emailInvalid') }
        ]"
        class="w-1/2"
      >
        <a-input v-model:value="formState.email" size="large" :placeholder="$t('profileForm.enterEmail')" />
      </a-form-item>
    </div>


    <div class="text-right w-full">
      <a-button :loading="isFetchingProfile" type="primary" class="max-w-[148px] !h-[40px]" html-type="submit">
        {{ $t('profileForm.updateProfile') }}
      </a-button>
    </div>
  </a-form>
</template>
