<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab ? (route.query.tab as string) : 'DETAIL',

)

const listOptions = ref([
  {
    key: 'CLASSROOM',
    name: 'Classroom',
  },
  {
    key: 'QUIZ',
    name: 'Quiz',
    component: defineAsyncComponent(() => import('~/components/admin/course/quiz/Quiz.vue')),
  },
  {
    key: 'STUDENTS',
    name: 'Students',
  },
  {
    key: 'CHAPTERS',
    name: 'Chapters',
  },
  {
    key: 'PROMOTION',
    name: 'Promotion',
  },
  {
    key: 'DETAIL',
    name: 'Detail',
    component: defineAsyncComponent(() => import('~/components/admin/course/FormCourse.vue')),
  },
  {
    key: 'SETTING',
    name: 'Setting',
  },
])

function handleChangeTab(key: string) {
  const query = { ...route.query, tab: key }
  router.replace({ query })
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      Italian for Beginners
    </h1>
    <a-tabs v-model:active-key="activeTab" @change="handleChangeTab">
      <a-tab-pane v-for="tab in listOptions" :key="tab.key" :tab="tab.name">
        <component :is="tab.component" :type="tab.key" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
