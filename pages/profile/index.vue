<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const tabList = ref([
  {
    key: 'PROFILE',
    name: 'Profile',
  },
  {
    key: 'MY_COURSES',
    name: 'My Courses',
  },
  {
    key: 'TEACHERS',
    name: 'Teachers',
  },
  {
    key: 'MESSAGE',
    name: 'Message',
  },
  {
    key: 'MY_REVIEWS',
    name: 'My Reviews',
  },
])

const tabActive = ref<string>('PROFILE')

function handleChangeActive(key: string) {
  tabActive.value = key
}
</script>

<template>
  <div class="flex gap-8 items-start  p-8">
    <div class="flex flex-col rounded-lg bg-[#F8FAFC] w-1/3">
      <div class="flex flex-col gap-4 items-center justify-center p-6">
        <div class="w-[160px] h-[160px]">
          <img src="@/assets/images/profile.png" class="object-cover w-[160px] h-[160px] rounded-full" alt="profile">
        </div>
        <p class="text-xl font-semibold !m-0 p-0">
          Hi Nam
        </p>
        <a-button class="!h-[40px] !flex items-center !gap-2">
          <span>Share Profile</span>
          <Icon
            name="i-solar-share-linear"
            class="w-5 h-5"
          />
        </a-button>
      </div>
      <div class="line mx-2 mb-6 w-full h-[1px] bg-[#E2E8F0]" />
      <div
        v-for="(tab, index) in tabList"
        :key="index"
        class="px-3 py-4 hover:bg-slate-600 cursor-pointer hover:text-white"
        :class="{
          'border-b border-b-gray-300 pb-3': index < tabList.length - 1,
          'bg-slate-600 text-white': tabActive === tab.key,
        }"
        @click="handleChangeActive(tab.key)"
      >
        <p
          class="!mb-0"
        >
          {{ tab.name }}
        </p>
      </div>
    </div>
    <ProfileForm />
  </div>
</template>
