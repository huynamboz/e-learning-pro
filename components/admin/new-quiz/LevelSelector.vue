<script setup lang="ts">
import type { NewQuizLevel } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  disabled: false,
})

const emit = defineEmits<Emits>()

const { getLevels } = useNewQuizApi()

const levels = ref<NewQuizLevel[]>([])
const loading = ref(false)

const levelOptions = computed(() => {
  return levels.value
    .filter(level => level.is_active)
    .sort((a, b) => a.order - b.order)
    .map(level => ({
      label: `${level.code}`,
      value: level.id,
    }))
})

async function loadLevels() {
  try {
    loading.value = true
    const response = await getLevels({ is_active: true, ordering: 'order,code' })
    levels.value = response.results
  }
  catch (err) {
    console.error('Error loading levels:', err)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLevels()
})
</script>

<template>
  <a-select
    :value="modelValue"
    :placeholder="placeholder || $t('newQuiz.level.selectLevel')"
    :loading="loading"
    :disabled="disabled || loading"
    :options="levelOptions"
    class="h-10 sm:h-12"
    @update:value="emit('update:modelValue', $event)"
  />
</template>
