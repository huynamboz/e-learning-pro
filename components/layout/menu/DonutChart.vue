<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  label: string
  value: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#22c55e',
})

const radius = 40
const circumference = 2 * Math.PI * radius

const dashArray = computed(() => {
  return `${(props.percentage / 100) * circumference} ${circumference}`
})
</script>

<template>
  <div class="flex items-center gap-3 w-full">
    <div class="w-24 h-24">
      <svg class="w-24 h-24">
        <circle
          class="text-gray-200"
          stroke="currentColor"
          stroke-width="10"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
        />
        <circle
          :stroke="props.color"
          stroke-width="10"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
          stroke-linecap="round"
          :stroke-dasharray="dashArray"
        />
        <text
          x="50"
          y="55"
          text-anchor="middle"
          class="text-lg font-bold"
          fill="black"
        >
          {{ props.percentage }}%
        </text>
      </svg>
    </div>
    <div class="flex-1 font-semibold text-[#0A1B39] text-center">
      <p class="font-semibold">
        {{ props.label }}
      </p>
      <p class="font-semibold">
        {{ props.value }}
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
</style>
