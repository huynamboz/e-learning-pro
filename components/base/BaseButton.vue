<script setup lang="ts">
import { cn } from '~/lib/utils'

const prop = withDefaults(
  defineProps<{
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg' | 'icon'
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
    class?: string
  }>(),
  {
    disabled: false,
    size: 'md',
    variant: 'default',
    class: '',
  },
)

const baseSize = {
  sm: 'h-8 px-3 rounded-[10px]',
  md: 'px-6 h-9',
  lg: 'px-6 h-10',
  icon: 'h-9 w-9 p-2 rounded-[10px] flex items-center justify-center',
}

const baseState = {
  default: 'bg-shade-4 text-shade-9 hover:bg-shade-5 shadow-[var(--button-box-shadow)]',
  primary: 'bg-green hover:bg-green/90 text-white',
  secondary: 'bg-secondary hover:bg-secondary/90',
  destructive: 'bg-destructive hover:bg-destructive/90 text-white',
  ghost: 'bg-transparent text-shade-9 hover:bg-shade-2',
  outline: 'bg-transparent border text-shade-9 hover:bg-shade-2',
}
</script>

<template>
  <button
    :class="cn(
      'text-sm text-shade-9 cursor-pointer transition-all duration-200 rounded-[12px] flex items-center justify-center gap-2 relative overflow-hidden',
      baseSize[size],
      baseState[variant],
      prop.class,
      {
        'opacity-40 pointer-events-none cursor-not-allowed': disabled,
      },
    )"
  >
    <slot />
  </button>
</template>

<style scoped></style>
