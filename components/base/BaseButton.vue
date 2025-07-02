<script setup lang="ts">
import { cn } from '~/lib/utils'

const prop = withDefaults(
  defineProps<{
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg' | 'icon'
    state?: 'default' | 'primary' | 'secondary' | 'danger'
    class?: string
  }>(),
  {
    disabled: false,
    size: 'md',
    state: 'default',
    class: '',
  },
)

const baseSize = {
  sm: 'h-8 px-3 rounded-[10px]',
  md: 'py-[8px] px-6 ',
  lg: 'py-[10px] px-6 ',
  icon: 'h-9 w-9 p-2 rounded-[10px] flex items-center justify-center',
}

const baseState = {
  default: 'bg-shade-4 dark:bg-shade-2 text-shade-9 hover:bg-shade-5',
  primary: 'bg-primary hover:bg-primary/90',
  secondary: 'bg-secondary hover:bg-secondary/90',
  danger: 'bg-danger hover:bg-danger/90',
}
</script>

<template>
  <button
    :class="cn(
      'text-sm font-semibold text-shade-9 cursor-pointer transition-all duration-200 rounded-[12px] flex items-center justify-center gap-2 relative overflow-hidden',
      baseSize[size],
      baseState[state],
      prop.class,
      {
        'opacity-50 pointer-events-none': disabled,
      },
    )"
    style="box-shadow: var(--button-box-shadow)"
  >
    <slot />
  </button>
</template>

<style scoped></style>
