<script lang="ts" setup>
import { listOptionsDetailLesson } from '~/constant/admin'
import FormChapter from './FormChapter.vue'
import FormResearch from './FormResearch.vue'
import FormSEO from './FormSEO.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref('DETAIL')

function handleChangeTab(tab: string) {
  activeTab.value = tab
}

function handleDelete() {

}

function handleDraft() {

}

function handleAddCourse() {

}
</script>

<template>
  <div class="">
    <div class="flex items-center gap-4 justify-between mb-6">
      <div class="flex items-center gap-1 cursor-pointer" @click="router.push(`/admin/courses/${route.params.id}`)">
        <Icon name="i-material-symbols-chevron-left-rounded" class="text-[24px]" />
        <h1 class="text-xl font-bold text-gray-900 dark:text-white !m-0">
          Italian for Beginners
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <a-button
          danger
          class="w-full !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          @click="handleDelete"
        >
          Delete
        </a-button>

        <a-button
          class="w-full !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="handleDraft"
        >
          Move to Draft
        </a-button>
        <a-button
          type="primary"
          class="w-full !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          @click="handleAddCourse"
        >
          Add Course
        </a-button>
      </div>
    </div>
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane v-for="tab in listOptionsDetailLesson" :key="tab.key" :tab="tab.name" @change="handleChangeTab(tab.key)">
        <FormChapter v-if="activeTab === 'DETAIL'" />
        <FormResearch v-if="activeTab === 'RESEARCH'" />
        <FormSEO v-if="activeTab === 'SEO'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
