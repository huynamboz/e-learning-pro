<script lang="ts" setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
const route = useRoute()
const { t } = useI18n()
const { fetchCourseDetail, currentCourse } = useCourse()

const listOptions = computed(() => {
  const baseTabs = [
    {
      path: 'quiz/all-quiz',
      name: t('admin.courses.tabs.quiz'),
    },
    {
      path: 'students',
      name: t('admin.courses.tabs.students'),
    },
    {
      path: 'chapters/all-chapters',
      name: t('admin.courses.tabs.chapters'),
    },
    {
      path: 'resources',
      name: t('admin.courses.tabs.resources'),
    },
  ]

  // Add pricing tab only for resource courses
  if (currentCourse.value?.course_type === 'resource') {
    baseTabs.push({
      path: 'price-plans',
      name: t('admin.courses.tabs.pricing'),
    })
  }

  if (currentCourse.value?.course_type === 'course') {
    baseTabs.push({
      path: 'classrooms/all-classrooms',
      name: t('admin.courses.tabs.classroom'),
    })
  }

  baseTabs.push({
    path: 'course-detail',
    name: t('admin.courses.tabs.detail'),
  })

  return baseTabs
})

const courseId = computed(() => route.params.id as string)

const activeTab = ref(listOptions.value.find(tab => route.path.includes(tab.path))?.path || '')

function handleChangeTab(key: string) {
  // const query = { ...route.query, tab: key }
  navigateTo(`/admin/courses/${courseId.value}/${key}`)
}

onMounted(async () => {
  await fetchCourseDetail(courseId.value)
})
</script>

<template>
  <div class="px-4">
    <div class="flex mb-6 items-center gap-2 text-sm text-[#00000066]">
      <span>{{ t('admin.courses.breadcrumb.course') }}</span>
      <span>/</span>
      <span class="text-black">{{ currentCourse?.title }}</span>
    </div>
    <!-- <DetailAttendance v-if="attendanceId && !attendanceManageId" />
    <DetailLessonManage v-else-if="lessonId" :course-id="courseId" :chapter-id="chapterId" :lesson-id="lessonId" />
    <DetailClassroom v-else-if="classroomId" />
    <AttendanceManagement v-else-if="attendanceManageId" /> -->
    <div v-if="currentCourse" class="">
      <a-tabs v-model:active-key="activeTab" @change="handleChangeTab">
        <a-tab-pane v-for="tab in listOptions" :key="tab.path" :tab="tab.name">
          <!-- <component :is="tab.component" :type="tab.key" :course-id="courseId" /> -->
        </a-tab-pane>
      </a-tabs>
    </div>
    <NuxtPage />
  </div>
</template>
