<script lang="ts" setup>
import DetailLessonManage from '~/components/admin/course/chapter/DetailLessonManage.vue'
import AttendanceManagement from '~/components/admin/course/classroom/AttendanceManagement.vue'
import DetailAttendance from '~/components/admin/course/classroom/DetailAttendance.vue'
import DetailClassroom from '~/components/admin/course/classroom/DetailClassroom.vue'

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
    component: defineAsyncComponent(() => import('~/components/admin/course/classroom/Classroom.vue')),
  },
  {
    key: 'QUIZ',
    name: 'Quiz',
    component: defineAsyncComponent(() => import('~/components/admin/course/quiz/QuizManager.vue')),
  },
  {
    key: 'STUDENTS',
    name: 'Students',
    component: defineAsyncComponent(() => import('~/components/admin/course/StudentsManagement.vue')),
  },
  {
    key: 'CHAPTERS',
    name: 'Chapters',
    component: defineAsyncComponent(() => import('~/components/admin/course/chapter/ChapterManagement.vue')),
  },
  {
    key: 'DETAIL',
    name: 'Detail',
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
</script>

<template>
  <div class="px-4">
    <DetailAttendance v-if="attendanceId && !attendanceManageId" />
    <DetailLessonManage :course-id="courseId" :chapter-id="chapterId" :lesson-id="lessonId"  v-else-if="lessonId" />
    <DetailClassroom v-else-if="classroomId" />
    <AttendanceManagement v-else-if="attendanceManageId" />
    <div v-else class="">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Italian for Beginners
      </h1>
      <a-tabs v-model:active-key="activeTab" @change="handleChangeTab">
        <a-tab-pane v-for="tab in listOptions" :key="tab.key" :tab="tab.name">
          <component :is="tab.component" :type="tab.key" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
