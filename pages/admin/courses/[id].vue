<script lang="ts" setup>
import DetailLessonManage from '~/components/admin/course/chapter/DetailLessonManage.vue'
import AttendanceManagement from '~/components/admin/course/classroom/AttendanceManagement.vue'
import DetailAttendance from '~/components/admin/course/classroom/DetailAttendance.vue'
import DetailClassroom from '~/components/admin/course/classroom/DetailClassroom.vue'
import { useCourseApi } from '~/composables/api/useCourseApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const activeTab = ref(route.query.tab ? (route.query.tab as string) : 'DETAIL',

)

const listOptions = computed(() => [
  {
    key: 'CLASSROOM',
    name: t('admin.courses.tabs.classroom'),
    component: defineAsyncComponent(() => import('~/components/admin/course/classroom/Classroom.vue')),
  },
  {
    key: 'QUIZ',
    name: t('admin.courses.tabs.quiz'),
    component: defineAsyncComponent(() => import('~/components/admin/course/quiz/QuizManager.vue')),
  },
  {
    key: 'STUDENTS',
    name: t('admin.courses.tabs.students'),
    component: defineAsyncComponent(() => import('~/components/admin/course/StudentsManagement.vue')),
  },
  {
    key: 'CHAPTERS',
    name: t('admin.courses.tabs.chapters'),
    component: defineAsyncComponent(() => import('~/components/admin/course/chapter/ChapterManagement.vue')),
  },
  {
    key: 'DETAIL',
    name: t('admin.courses.tabs.detail'),
    component: defineAsyncComponent(() => import('~/components/admin/course/FormCourse.vue')),
  },
])

function handleChangeTab(key: string) {
  const query = { ...route.query, tab: key }
  router.replace({ query })
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
    <DetailAttendance v-if="attendanceId && !attendanceManageId" />
    <DetailLessonManage v-else-if="lessonId" :course-id="courseId" :chapter-id="chapterId" :lesson-id="lessonId" />
    <DetailClassroom v-else-if="classroomId" />
    <AttendanceManagement v-else-if="attendanceManageId" />
    <div v-else class="">
      <a-tabs v-model:active-key="activeTab" @change="handleChangeTab">
        <a-tab-pane v-for="tab in listOptions" :key="tab.key" :tab="tab.name">
          <component :is="tab.component" :type="tab.key" :course-id="courseId" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
