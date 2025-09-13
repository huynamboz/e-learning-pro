<script setup>
import { cn } from '~/lib/utils'

// Props
defineProps({
  statsData: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="py-10 bg-[#DC2626]">
    <div class="grid grid-cols-2 lg:grid-cols-4  gap-8 px-4 sm:px-8 lg:px-20">
      <template v-for="(stat, index) in statsData" :key="index">
        <div
          :class="cn('flex flex-col items-center gap-1.5', (index < statsData.length - 1) && 'border-r-4 border-[#E2E8F0]',
                     (index % 2 === 1) && 'max-lg:border-none')"
        >
          <div class="text-white text-[32px] font-semibold leading-[1.3] flex">
            <CountUp
              :end-val="parseInt(stat.number)"
              :duration="5"
              :decimal-places="0"
              :autoplay="true"
            />
            +
          </div>
          <div class="text-white text-center text-sm font-normal leading-[1.5]" :class="[stat.width, stat.textAlign]">
            {{ stat.description }}
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
