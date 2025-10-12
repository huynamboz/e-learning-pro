<script setup lang="ts">
import QuizList from '~/components/admin/course/quiz/QuizList.vue'

// Get route parameters
const route = useRoute()
const courseId = route.params.id as string
const router = useRouter()

// State management
const currentView = ref<'list' | 'create' | 'edit'>('list') 

// API composable

// Handle view switching
function switchToCreate() {
  router.push(`/admin/courses/${courseId}/quiz/create`)
}

function switchToEdit(quizId: string) {
  router.push(`/admin/courses/${courseId}/quiz/${quizId}/edit`)
}

// i18n
const { t } = useI18n()

// SEO
useHead({
  title: () => `${t('quiz.management.title')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('quiz.management.description') }
  ]
})

</script>

<template>
  <div class="quiz-management">
    <QuizList
      v-if="currentView === 'list'"
      :course-id="courseId"
      @create-quiz="switchToCreate"
      @edit-quiz="switchToEdit"
    />
  </div>
</template>
