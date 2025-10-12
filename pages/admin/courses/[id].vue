<script lang="ts" setup>
// import DetailLessonManage from '~/components/admin/course/chapter/DetailLessonManage.vue'
// import AttendanceManagement from '~/components/admin/course/classroom/AttendanceManagement.vue'
// import DetailAttendance from '~/components/admin/course/classroom/DetailAttendance.vue'
// import DetailClassroom from '~/components/admin/course/classroom/DetailClassroom.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const listOptions = computed(() => [
  {
    path: 'classrooms/all-classrooms',
    name: t('admin.courses.tabs.classroom'),
  },
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
    path: 'course-detail',
    name: t('admin.courses.tabs.detail'),
  },
])

const activeTab = ref(listOptions.value.find(tab => route.path.includes(tab.path))?.path || '')

function handleChangeTab(key: string) {
  // const query = { ...route.query, tab: key }
  navigateTo(`/admin/courses/${courseId.value}/${key}`)
}

const courseId = computed(() => route.params.id as string)
const chapterId = computed(() => route.query.chapterId as string)
const lessonId = computed(() => route.query.lessonId as string)
const classroomId = computed(() => route.query.classroomId)
const attendanceId = computed(() => route.query.attendanceId)
const attendanceManageId = computed(() => route.query.attendanceManageId)

const { getDetailCourses } = useCourseApi()
const courseDetail = ref<any>(null)

onMounted(async () => {
  courseDetail.value = await getDetailCourses(courseId.value)
})

</script>

<template>
  <div class="px-4">
    <div class="flex mb-6 items-center gap-2 text-sm text-[#00000066]">
      <span>{{ t('admin.courses.breadcrumb.course') }}</span>
      <span>/</span>
      <span class="text-black">{{ courseDetail?.title }}</span>
    </div>
    <!-- <DetailAttendance v-if="attendanceId && !attendanceManageId" />
    <DetailLessonManage v-else-if="lessonId" :course-id="courseId" :chapter-id="chapterId" :lesson-id="lessonId" />
    <DetailClassroom v-else-if="classroomId" />
    <AttendanceManagement v-else-if="attendanceManageId" /> -->
    <div class="">
      <a-tabs v-model:active-key="activeTab" @change="handleChangeTab">
        <a-tab-pane v-for="tab in listOptions" :key="tab.path" :tab="tab.name">
          <!-- <component :is="tab.component" :type="tab.key" :course-id="courseId" /> -->
        </a-tab-pane>
      </a-tabs>
    </div>
    <NuxtPage />
  </div>
</template>
