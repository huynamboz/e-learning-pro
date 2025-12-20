<script setup lang="ts">
import type { NewQuizLevel } from '~/composables/api/useNewQuizApi'
import LevelList from '~/components/admin/new-quiz/LevelList.vue'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const { getLevels } = useNewQuizApi()

// State
const levels = ref<NewQuizLevel[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Load levels
async function loadLevels() {
  try {
    loading.value = true
    error.value = null

    const params: any = {
      ordering: 'order,code',
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await getLevels(params)
    levels.value = response.results
  }
  catch (err: any) {
    error.value = err.message || t('newQuiz.level.messages.loadError')
    console.error('Error loading levels:', err)
  }
  finally {
    loading.value = false
  }
}

// Debounced search
const debouncedLoadLevels = useDebounceFn(loadLevels, 500)

watch(searchQuery, () => {
  debouncedLoadLevels()
})

function handleCreateLevel() {
  router.push('/admin/new-quiz-management/levels/create')
}

function handleRefresh() {
  loadLevels()
}

onMounted(() => {
  loadLevels()
})

// SEO
useHead({
  title: () => `${t('newQuiz.level.management.title')} - E-Learning Platform`,
  meta: [
    { name: 'description', content: () => t('newQuiz.level.management.description') },
  ],
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-md:px-0 bg-gray-50 min-h-screen">
    <div class="w-full max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Icon
              name="solar:layers-bold-duotone"
              class="text-2xl text-white"
            />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {{ $t('newQuiz.level.management.title') }}
            </h1>
            <p class="text-sm text-gray-600">
              {{ $t('newQuiz.level.management.description') }}
            </p>
          </div>
        </div>
        <a-button
          type="primary"
          size="large"
          class="!flex !justify-center !items-center !gap-1"
          @click="handleCreateLevel"
        >
          <Icon name="solar:add-circle-bold" />
          {{ $t('newQuiz.level.management.createNewLevel') }}
        </a-button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <a-input
            v-model:value="searchQuery"
            :placeholder="$t('newQuiz.level.management.searchPlaceholder')"
            size="large"
            class="flex-1 rounded-lg"
          >
            <template #prefix>
              <Icon name="solar:magnifer-linear" />
            </template>
          </a-input>
        </div>
      </div>

      <!-- Error State -->
      <a-alert
        v-if="error"
        type="error"
        :message="$t('newQuiz.level.messages.loadError')"
        :description="error"
        show-icon
        closable
        @close="error = null"
      />

      <!-- Levels List -->
      <LevelList
        :levels="levels"
        :loading="loading"
        @refresh="handleRefresh"
      />
    </div>
  </div>
</template>
