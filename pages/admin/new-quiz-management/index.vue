<script setup lang="ts">
import type { NewQuiz, NewQuizLevel } from '~/composables/api/useNewQuizApi'
import { useDebounceFn } from '@vueuse/core'
import QuizList from '~/components/admin/new-quiz/QuizList.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const { getQuizzes, getLevels } = useNewQuizApi()

// State
const quizzes = ref<NewQuiz[]>([])
const levels = ref<NewQuizLevel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filters
const selectedLevel = ref<string>('')
const publishStatus = ref<string>('all')
const searchQuery = ref('')

// Load levels
async function loadLevels() {
  try {
    const response = await getLevels({ is_active: true, ordering: 'order,code' })
    levels.value = response.results
  }
  catch (err) {
    console.error('Error loading levels:', err)
  }
}

// Load quizzes with filters
async function loadQuizzes() {
  try {
    loading.value = true
    error.value = null

    const params: any = {}
    if (selectedLevel.value) {
      params.level = selectedLevel.value
    }
    if (publishStatus.value !== 'all') {
      params.is_published = publishStatus.value === 'published'
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await getQuizzes(params)
    quizzes.value = response.results
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.messages.loadError')
    console.error('Error loading quizzes:', err)
  }
  finally {
    loading.value = false
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  loadQuizzes()
}, 500)

watch(searchQuery, () => {
  debouncedSearch()
})

watch([selectedLevel, publishStatus], () => {
  loadQuizzes()
})

function handleCreateQuiz() {
  router.push('/admin/new-quiz-management/create')
}

const levelOptions = computed(() => {
  return [
    { label: t('newQuiz.filters.allLevels'), value: '' },
    ...levels.value.map(level => ({
      label: `${level.code} - ${level.name}`,
      value: level.id,
    })),
  ]
})

const statusOptions = computed(() => [
  { label: t('newQuiz.filters.allStatus'), value: 'all' },
  { label: t('newQuiz.filters.published'), value: 'published' },
  { label: t('newQuiz.filters.draft'), value: 'draft' },
])

const totalCount = computed(() => quizzes.value.length)
const publishedCount = computed(() => quizzes.value.filter(q => q.is_published).length)
const draftCount = computed(() => quizzes.value.filter(q => !q.is_published).length)

onMounted(async () => {
  await loadLevels()
  await loadQuizzes()
})

// SEO
useHead({
  title: () => `${t('newQuiz.management.title')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.management.description') },
  ],
})
</script>

<template>
  <div class="p-4 sm:p-6 max-md:px-0">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {{ $t('newQuiz.management.title') }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600">
            {{ $t('newQuiz.management.description') }}
          </p>
        </div>
        <div class="flex gap-2">
          <a-button
            type="default"
            size="large"
            class="!flex !justify-center !items-center !gap-1"
            @click="router.push('/admin/new-quiz-management/levels')"
          >
            <Icon name="solar:layers-bold-duotone" />
            {{ $t('newQuiz.level.management.title') }}
          </a-button>
          <a-button
            type="primary"
            size="large"
            class="!flex !justify-center !items-center !gap-1"
            @click="handleCreateQuiz"
          >
            <Icon name="solar:add-circle-bold" />
            {{ $t('newQuiz.management.createNewQuiz') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <a-alert
      v-if="error"
      type="error"
      :message="$t('newQuiz.messages.loadError')"
      :description="error"
      show-icon
      closable
      class="mb-4"
      @close="error = null"
    />

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Level Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('newQuiz.level.title') }}
          </label>
          <a-select
            v-model:value="selectedLevel"
            :placeholder="$t('newQuiz.filters.allLevels')"
            :options="levelOptions"
            class="w-full"
            allow-clear
          />
        </div>

        <!-- Publish Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('newQuiz.filters.allStatus') }}
          </label>
          <a-select
            v-model:value="publishStatus"
            :options="statusOptions"
            class="w-full"
          />
        </div>

        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('sidebar.search') }}
          </label>
          <a-input
            v-model:value="searchQuery"
            :placeholder="$t('newQuiz.filters.searchPlaceholder')"
            allow-clear
          >
            <template #prefix>
              <Icon name="solar:magnifer-bold" />
            </template>
          </a-input>
        </div>
      </div>

      <!-- Filter Summary -->
      <div class="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
        <span>
          {{ $t('newQuiz.management.totalQuizzes') }}: <strong>{{ totalCount }}</strong>
        </span>
        <span class="text-green-600">
          {{ $t('newQuiz.management.published') }}: <strong>{{ publishedCount }}</strong>
        </span>
        <span class="text-orange-600">
          {{ $t('newQuiz.management.draft') }}: <strong>{{ draftCount }}</strong>
        </span>
      </div>
    </div>

    <!-- Quiz list -->
    <QuizList
      :quizzes="quizzes"
      :loading="loading"
      @refresh="loadQuizzes"
    />
  </div>
</template>
