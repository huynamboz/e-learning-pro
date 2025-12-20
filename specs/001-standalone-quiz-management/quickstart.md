# Quickstart: Standalone Quiz Management

**Feature**: Standalone Quiz Management  
**Date**: 2025-01-15

## Overview

This guide provides a quick reference for implementing the standalone quiz management feature. It covers the essential steps to get started with development.

## Prerequisites

- Nuxt 3 project with existing API client setup
- Backend API available at `/api/v1/new_quiz/` endpoints
- Admin authentication and permissions configured
- Existing quiz editor components (for reuse/adaptation)

## Implementation Steps

### 1. Create API Composable

Create `composables/api/useNewQuizApi.ts`:

```typescript
import type { ListApiResponse } from '~/api/apiClient'
import { useApiClient } from '~/api/apiClient'

export interface NewQuizLevel {
  id: string
  code: string
  name: string
  order: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NewQuiz {
  id: string
  title: string
  description?: string
  level: string
  level_code: string
  level_name: string
  time_type: 'limit' | 'none'
  time_value?: number
  time_unit?: 'minute' | 'second'
  time_limit_display: string
  is_published: boolean
  retake_limit: number
  total_questions: number
  created_by: number
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface NewQuizListResponse extends ListApiResponse<NewQuiz> {}

export function useNewQuizApi() {
  const apiClient = useApiClient()

  return {
    // Level management
    getLevels: (params?: { is_active?: boolean; search?: string; ordering?: string }) => {
      const queryParams = new URLSearchParams()
      if (params?.is_active !== undefined)
        queryParams.append('is_active', params.is_active.toString())
      if (params?.search)
        queryParams.append('search', params.search)
      if (params?.ordering)
        queryParams.append('ordering', params.ordering)
      const queryString = queryParams.toString()
      return apiClient.get<NewQuizListResponse>(
        `/new_quiz/levels/${queryString ? `?${queryString}` : ''}`,
      )
    },
    createLevel: (data: Partial<NewQuizLevel>) =>
      apiClient.post<NewQuizLevel>('/new_quiz/levels/', data),
    updateLevel: (id: string, data: Partial<NewQuizLevel>) =>
      apiClient.patch<NewQuizLevel>(`/new_quiz/levels/${id}/`, data),
    deleteLevel: (id: string) => apiClient.delete(`/new_quiz/levels/${id}/`),

    // Quiz management
    getQuizzes: (params?: {
      level?: string
      is_published?: boolean
      created_by?: number
      search?: string
      ordering?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.level)
        queryParams.append('level', params.level)
      if (params?.is_published !== undefined)
        queryParams.append('is_published', params.is_published.toString())
      if (params?.created_by)
        queryParams.append('created_by', params.created_by.toString())
      if (params?.search)
        queryParams.append('search', params.search)
      if (params?.ordering)
        queryParams.append('ordering', params.ordering)
      const queryString = queryParams.toString()
      return apiClient.get<NewQuizListResponse>(
        `/new_quiz/quizzes/${queryString ? `?${queryString}` : ''}`,
      )
    },
    getQuiz: (id: string) => apiClient.get<NewQuiz>(`/new_quiz/quizzes/${id}/`),
    createQuiz: (data: any) => apiClient.post<NewQuiz>('/new_quiz/quizzes/', data),
    updateQuiz: (id: string, data: any) =>
      apiClient.put<NewQuiz>(`/new_quiz/quizzes/${id}/`, data),
    patchQuiz: (id: string, data: any) =>
      apiClient.patch<NewQuiz>(`/new_quiz/quizzes/${id}/`, data),
    deleteQuiz: (id: string) => apiClient.delete(`/new_quiz/quizzes/${id}/`),
    publishQuiz: (id: string) => apiClient.patch(`/new_quiz/quizzes/${id}/publish/`, {}),
    unpublishQuiz: (id: string) => apiClient.patch(`/new_quiz/quizzes/${id}/unpublish/`, {}),
    getMyQuizzes: () => apiClient.get<NewQuizListResponse>('/new_quiz/quizzes/mine/'),
    getQuizzesByLevel: (levelId: string) =>
      apiClient.get<NewQuizListResponse>(`/new_quiz/quizzes/by_level/?level_id=${levelId}`),
  }
}
```

### 2. Update Admin Sidebar

Update `composables/useSidebar.ts` to add new menu item:

```typescript
const menuAdmin = computed<MenuItem[]>(() => [
  // ... existing items
  {
    name: t('adminMenu.newQuizManagement'),
    icon: 'i-heroicons-clipboard-document-list',
    link: '/admin/new-quiz-management',
  },
  // ... rest of items
])
```

### 3. Add i18n Keys

Add to `i18n/locales/vi.json` and `i18n/locales/en.json`:

```json
{
  "adminMenu": {
    "newQuizManagement": "Quản lý Quiz độc lập"
  },
  "newQuiz": {
    "title": "Quản lý Quiz độc lập",
    "create": "Tạo Quiz mới",
    "edit": "Chỉnh sửa Quiz",
    "delete": "Xóa Quiz",
    "publish": "Xuất bản",
    "unpublish": "Gỡ xuất bản",
    "level": "Cấp độ",
    "selectLevel": "Chọn cấp độ",
    "levelRequired": "Vui lòng chọn cấp độ"
  }
}
```

### 4. Create Quiz List Page

Create `pages/admin/new-quiz-management/index.vue`:

```vue
<script setup lang="ts">
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

definePageMeta({
  layout: 'admin',
})

const { getQuizzes, getLevels } = useNewQuizApi()
const quizzes = ref([])
const levels = ref([])
const selectedLevel = ref<string>('')
const searchQuery = ref('')
const loading = ref(false)

async function loadQuizzes() {
  loading.value = true
  try {
    const params: any = {}
    if (selectedLevel.value) params.level = selectedLevel.value
    if (searchQuery.value) params.search = searchQuery.value
    const response = await getQuizzes(params)
    quizzes.value = response.results
  } finally {
    loading.value = false
  }
}

async function loadLevels() {
  const response = await getLevels({ is_active: true })
  levels.value = response.results
}

onMounted(() => {
  loadLevels()
  loadQuizzes()
})

watch([selectedLevel, searchQuery], () => {
  loadQuizzes()
})
</script>

<template>
  <div class="p-6">
    <h1>{{ $t('newQuiz.title') }}</h1>
    <!-- Filters and quiz list -->
  </div>
</template>
```

### 5. Create Quiz Editor Page

Create `pages/admin/new-quiz-management/create.vue`:

```vue
<script setup lang="ts">
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'
// Reuse/adapt existing QuizEditor component

const { createQuiz, getLevels } = useNewQuizApi()
const router = useRouter()

async function handleCreate(quizData: any) {
  await createQuiz(quizData)
  router.push('/admin/new-quiz-management')
}
</script>

<template>
  <div>
    <!-- Quiz editor with Level selector instead of course/lesson -->
  </div>
</template>
```

## Key Implementation Notes

1. **Level Selection**: Replace course/lesson selectors with Level selector in quiz forms
2. **API Endpoints**: Use `/api/v1/new_quiz/` prefix for all operations
3. **Component Reuse**: Adapt existing `QuizEditor.vue` for Level-based organization
4. **Validation**: Ensure Level is required, time settings validated, questions present for publish
5. **Error Handling**: Use Ant Design Vue notifications for user feedback
6. **Loading States**: Show loading indicators during API calls
7. **Filtering**: Implement debounced search and Level filtering

## Testing Checklist

- [ ] Admin can navigate to standalone quiz management from sidebar
- [ ] Admin can view list of quizzes filtered by Level
- [ ] Admin can create new quiz with Level selection
- [ ] Admin can edit existing quiz (including changing Level)
- [ ] Admin can delete quiz with confirmation
- [ ] Admin can publish/unpublish quiz
- [ ] Validation prevents publishing quiz without questions
- [ ] Validation requires Level selection
- [ ] Search and filtering work correctly
- [ ] Error messages display appropriately
- [ ] Loading states show during API calls

## Common Patterns

### Fetching with Filters
```typescript
const params: any = {}
if (levelFilter.value) params.level = levelFilter.value
if (publishFilter.value !== undefined) params.is_published = publishFilter.value
if (searchQuery.value) params.search = searchQuery.value
const response = await getQuizzes(params)
```

### Handling Errors
```typescript
import { notification } from 'ant-design-vue'

try {
  await createQuiz(data)
  notification.success({ message: 'Quiz created successfully' })
} catch (error: any) {
  notification.error({ 
    message: 'Error', 
    description: error.data?.detail || 'Failed to create quiz' 
  })
}
```

### Level Selector Component
```vue
<template>
  <a-select
    v-model:value="selectedLevel"
    :placeholder="$t('newQuiz.selectLevel')"
    :options="levelOptions"
  />
</template>
```

## Next Steps

1. Implement quiz list page with filtering
2. Create/adapt quiz editor for Level-based organization
3. Implement quiz detail and edit pages
4. Add Level management pages (if needed)
5. Add i18n translations
6. Test all CRUD operations
7. Verify backward compatibility with course-based quizzes
