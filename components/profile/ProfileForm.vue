<script lang="ts" setup>
const formState = reactive<any>({
  firstName: '',
  lastName: '',
  heading: '',
  description: '',
  language: 'VI',
  link: {
    website: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    facebook: '',
  },
})

const listLanguages = ref([
  {
    key: 'VI',
    label: 'Tiếng việt',
  },
  {
    key: 'EN',
    label: 'English',
  },
])

function onFinish() {
}
</script>

<template>
  <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    layout="vertical"
    class="flex items-start flex-col w-full gap-8 !pb-20"
    @finish="onFinish"
  >
    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <div class="flex items-center gap-3">
        <a-form-item
          label="First Name"
          name="firstName"
          :rules="[{ required: true, message: 'Please input your first name!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.firstName" size="large" placeholder="Enter first name" />
        </a-form-item>
        <a-form-item
          label="Last Name"
          name="lastName"
          :rules="[{ required: true, message: 'Please input your last name!' }]"
          class="w-full"
        >
          <a-input v-model:value="formState.lastName" size="large" placeholder="Enter last name" />
        </a-form-item>
      </div>
      <a-form-item
        label="Heading"
        name="heading"
        :rules="[{ required: true, message: 'Please input your heading!' }]"
        class="w-1/2"
      >
        <a-input v-model:value="formState.heading" size="large" placeholder="Enter heading" />
      </a-form-item>
      <a-form-item
        label="Description"
        name="description"
        :rules="[{ required: true, message: 'Please input your description!' }]"
        class="w-full"
      >
        <a-textarea
          v-model:value="formState.description"
          placeholder="Enter description"
          :auto-size="{ minRows: 5, maxRows: 5 }"
        />
      </a-form-item>
      <a-form-item
        label="Language"
        name="language"
        :rules="[{ required: true, message: 'Please choose language!' }]"
        class="w-1/2"
      >
        <a-select
          v-model:value="formState.language"
          :options="listLanguages"
          placeholder="Label"
          size="large"
        />
      </a-form-item>
    </div>

    <ProfileUploadForm />

    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <h1 class="text-xl font-semibold mb-6">
        Links
      </h1>
      <a-form-item
        label="Website"
        name="website"
        class="w-full"
      >
        <a-input v-model:value="formState.link.website" size="large" placeholder="Enter website" />
      </a-form-item>
      <a-form-item
        label="X(Formerly twitter)"
        name="twitter"
        class="w-full"
      >
        <a-input v-model:value="formState.link.twitter" size="large" placeholder="Enter twitter" />
      </a-form-item>
      <a-form-item
        label="Linkdin"
        name="linkdin"
        class="w-full"
      >
        <a-input v-model:value="formState.link.linkdin" size="large" placeholder="Enter linkdin" />
      </a-form-item>
      <a-form-item
        label="Youtube"
        name="youtube"
        class="w-full"
      >
        <a-input v-model:value="formState.link.youtube" size="large" placeholder="Enter youtube" />
      </a-form-item>
      <a-form-item
        label="Facebook"
        name="facebook"
        class="w-full"
      >
        <a-input v-model:value="formState.link.facebook" size="large" placeholder="Enter facebook" />
      </a-form-item>
    </div>

    <div class="text-right w-full">
      <a-button type="primary" class="max-w-[148px] !h-[40px]" html-type="submit">
        Update Profile
      </a-button>
    </div>
  </a-form>
</template>
