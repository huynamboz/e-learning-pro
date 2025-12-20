<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form'
import type { NewQuizLevel, NewQuizLevelCreate } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

interface Props {
  mode?: 'create' | 'edit'
  levelId?: string
  isCreating?: boolean
  isUpdating?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  isCreating: false,
  isUpdating: false,
  isLoading: false,
})

const emit = defineEmits<{
  back: []
  'create-level': [data: NewQuizLevelCreate]
  'update-level': [data: Partial<NewQuizLevelCreate>]
}>()

const { t } = useI18n()
const { getLevel } = useNewQuizApi()

const formData = reactive<NewQuizLevelCreate>({
  code: '',
  name: '',
  order: 1,
  description: '',
  is_active: true,
})

const loadingLevel = ref(false)

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: t('newQuiz.level.editor.codeRequired'), trigger: 'blur' },
    { max: 20, message: t('newQuiz.level.editor.codeMaxLength'), trigger: 'blur' },
  ],
  name: [
    { required: true, message: t('newQuiz.level.editor.nameRequired'), trigger: 'blur' },
    { max: 100, message: t('newQuiz.level.editor.nameMaxLength'), trigger: 'blur' },
  ],
  order: [
    { required: true, message: t('newQuiz.level.editor.orderRequired'), trigger: 'blur' },
    { type: 'number', min: 1, message: t('newQuiz.level.editor.orderMin'), trigger: 'blur' },
  ],
}

async function loadLevelData() {
  if (props.mode === 'edit' && props.levelId) {
    try {
      loadingLevel.value = true
      const level = await getLevel(props.levelId)
      formData.code = level.code
      formData.name = level.name
      formData.order = level.order
      formData.description = level.description || ''
      formData.is_active = level.is_active
    }
    catch (err: any) {
      console.error('Error loading level:', err)
    }
    finally {
      loadingLevel.value = false
    }
  }
}

function onFinish() {
  if (props.mode === 'create') {
    emit('create-level', { ...formData })
  }
  else {
    emit('update-level', { ...formData })
  }
}

function onFinishFailed(errorInfo: any) {
  console.error('Form validation failed:', errorInfo)
}

onMounted(async () => {
  await loadLevelData()
})
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-md:px-0 bg-gray-50 min-h-screen">
    <div class="w-full max-w-3xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Icon
              name="solar:layers-bold-duotone"
              class="text-2xl text-white"
            />
          </div>
          <div class="flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {{ props.mode === 'edit' ? $t('newQuiz.level.editor.editTitle') : $t('newQuiz.level.editor.createTitle') }}
            </h1>
            <p class="text-sm text-gray-600">
              {{ props.mode === 'edit' ? $t('newQuiz.level.editor.editDescription') : $t('newQuiz.level.editor.createDescription') }}
            </p>
          </div>
          <a-button
            type="default"
            size="large"
            class="!flex !justify-center !items-center !gap-1"
            @click="emit('back')"
          >
            <Icon name="solar:arrow-left-bold" />
            <span class="hidden sm:inline">{{ $t('newQuiz.level.editor.backToList') }}</span>
          </a-button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading || loadingLevel" class="flex items-center justify-center py-16">
        <div class="text-center">
          <a-spin size="large" />
          <p class="text-sm text-gray-500 mt-4">
            {{ $t('newQuiz.level.editor.loadingLevel') }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <a-form
        v-if="!isLoading && !loadingLevel"
        :model="formData"
        :rules="rules"
        layout="vertical"
        class="space-y-6"
        @finish="onFinish"
        @finish-failed="onFinishFailed"
      >
        <!-- Basic Information Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-2 mb-6">
            <Icon name="solar:document-text-bold-duotone" class="text-xl text-blue-600" />
            <h2 class="text-lg font-semibold text-gray-800">
              {{ $t('newQuiz.level.editor.basicInfo') }}
            </h2>
          </div>

          <div class="space-y-4">
            <!-- Code -->
            <a-form-item :label="$t('newQuiz.level.editor.code')" name="code" class="mb-4">
              <a-input
                v-model:value="formData.code"
                :placeholder="$t('newQuiz.level.editor.codePlaceholder')"
                size="large"
                class="rounded-lg"
                :disabled="props.mode === 'edit'"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ $t('newQuiz.level.editor.codeHint') }}
              </div>
            </a-form-item>

            <!-- Name -->
            <a-form-item :label="$t('newQuiz.level.editor.name')" name="name" class="mb-4">
              <a-input
                v-model:value="formData.name"
                :placeholder="$t('newQuiz.level.editor.namePlaceholder')"
                size="large"
                class="rounded-lg"
              />
            </a-form-item>

            <!-- Description -->
            <a-form-item :label="$t('newQuiz.level.editor.description')" name="description" class="mb-4">
              <a-textarea
                v-model:value="formData.description"
                :placeholder="$t('newQuiz.level.editor.descriptionPlaceholder')"
                :rows="4"
                class="rounded-lg"
              />
            </a-form-item>

            <!-- Order -->
            <a-form-item :label="$t('newQuiz.level.editor.order')" name="order" class="mb-4">
              <a-input-number
                v-model:value="formData.order"
                :placeholder="$t('newQuiz.level.editor.orderPlaceholder')"
                :min="1"
                size="large"
                class="w-full md:w-64 rounded-lg"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ $t('newQuiz.level.editor.orderHint') }}
              </div>
            </a-form-item>

            <!-- Active Status -->
            <a-form-item :label="$t('newQuiz.level.editor.isActive')" name="is_active" class="mb-0">
              <a-switch v-model:checked="formData.is_active" />
              <div class="text-xs text-gray-500 mt-1">
                {{ $t('newQuiz.level.editor.isActiveHint') }}
              </div>
            </a-form-item>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <a-button
              size="large"
              class="w-full sm:w-auto !flex !justify-center !items-center !gap-1"
              @click="emit('back')"
            >
              <Icon name="solar:close-circle-bold" />
              {{ $t('newQuiz.level.editor.cancel') }}
            </a-button>
            <a-button
              type="primary"
              size="large"
              :loading="isCreating || isUpdating"
              html-type="submit"
              class="w-full sm:w-auto !flex !justify-center !items-center !gap-1"
            >
              <Icon name="solar:check-circle-bold" />
              {{ props.mode === 'edit' ? $t('newQuiz.level.editor.updateLevel') : $t('newQuiz.level.editor.createLevel') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </div>
  </div>
</template>
