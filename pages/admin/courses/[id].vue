<script lang="ts" setup>
import FormCourse from '~/components/admin/course/FormCourse.vue'
import { listOptions } from '~/constant/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const activeTab = ref('DETAIL')

function handleChangeTab(tab: string) {
  activeTab.value = tab
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      Italian for Beginners
    </h1>
    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane v-for="tab in listOptions" :key="tab.key" :tab="tab.name" @change="handleChangeTab(tab.key)">
        <FormCourse type="detail" v-if="activeTab === 'DETAIL'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
