<script setup lang="ts">
import { ShareAltOutlined } from '@ant-design/icons-vue'

interface UserProfile {
  name: string
  avatar: string
}

interface NavigationTab {
  key: string
  label: string
}

interface Props {
  activeTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'MY_COURSES',
})

const { user } = useAuth()

const emit = defineEmits<{
  tabChange: [tabKey: string]
  shareProfile: []
}>()

const { t } = useI18n()

const navigationTabs = computed<NavigationTab[]>(() => [
  { key: 'PROFILE', label: t('profileSidebar.profile') },
  { key: 'MY_COURSES', label: t('profileSidebar.myCourses') },
])

const activeTab = ref(props.activeTab)

function handleTabClick(tabKey: string) {
  activeTab.value = tabKey
  emit('tabChange', tabKey)
}

function handleShareProfile() {
  emit('shareProfile')
}
</script>

<template>
  <div class="bg-gray-50 rounded-2xl p-6 sm:w-80 w-full h-fit">
    <div class="flex flex-col items-center gap-4">
      <a-avatar
        :size="160"
        :src="user?.avatar"
        class="border-4 border-white shadow-sm"
      />
      <h4 class="text-xl font-semibold text-gray-900 m-0 leading-6">
        {{ user?.first_name }} {{ user?.last_name }}
      </h4>
      <a-button
        type="default"
        class="h-12 px-6 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium flex items-center gap-2 hover:border-gray-400 hover:bg-gray-50"
        @click="handleShareProfile"
      >
        <template #icon>
          <ShareAltOutlined />
        </template>
        Share Profile
      </a-button>
    </div>

    <a-divider />

    <div class="flex flex-col w-full">
      <div
        v-for="tab in navigationTabs"
        :key="tab.key"
        class="nav-tab flex items-center px-4 py-4 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-100"
        :class="{ 'bg-gray-900 text-white hover:bg-gray-900': activeTab === tab.key }"
        @click="handleTabClick(tab.key)"
      >
        <span class="text-sm font-normal" :class="activeTab === tab.key ? 'text-white' : 'text-gray-700'">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>
