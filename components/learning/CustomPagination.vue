<script setup lang="ts">
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 3,
})

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const { currentPage, totalPages, maxVisiblePages } = props

  if (totalPages <= maxVisiblePages) {
    // If total pages is less than max visible, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }
  else {
    // Calculate start and end pages
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
  }

  return pages
})

function handlePageClick(page: number) {
  if (page !== props.currentPage) {
    emit('pageChange', page)
  }
}

function handlePrevious() {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1)
  }
}

function handleNext() {
  if (props.currentPage < props.totalPages) {
    emit('pageChange', props.currentPage + 1)
  }
}
</script>

<template>
  <div class="flex justify-center items-center mt-10">
    <div class="flex -gap-px bg-white rounded-lg shadow-[0_0_8px_rgba(59,130,246,0.12)]">
      <!-- Previous button -->
      <div
        class="flex flex-col justify-center items-center w-[43px] border border-[#E2E8F0] bg-white cursor-pointer transition-all duration-200 select-none py-[13px] px-3 rounded-l-[4px]"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1, 'hover:bg-gray-50': currentPage > 1 }"
        @click="handlePrevious"
      >
        <LeftOutlined class="text-[15px] text-[#475569]" :class="{ 'text-gray-400': currentPage === 1 }" />
      </div>

      <!-- Page numbers -->
      <div
        v-for="page in visiblePages"
        :key="page"
        class="flex flex-col justify-center items-center w-[43px] border border-[#E2E8F0] bg-white cursor-pointer transition-all duration-200 select-none py-[13px] px-3 text-xs font-semibold leading-[1.21]"
        :class="{
          'text-white !bg-[#0F172A]': currentPage === page,
          'text-[#334155]': currentPage !== page,
          'hover:bg-gray-50': currentPage !== page,
        }"
        @click="handlePageClick(page)"
      >
        {{ page }}
      </div>

      <!-- Next button -->
      <div
        class="flex flex-col justify-center items-center w-[43px] border border-[#E2E8F0] bg-white cursor-pointer transition-all duration-200 select-none py-[13px] px-3 rounded-r-[4px]"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages, 'hover:bg-gray-50': currentPage < totalPages }"
        @click="handleNext"
      >
        <RightOutlined class="text-[15px] text-[#475569]" :class="{ 'text-gray-400': currentPage === totalPages }" />
      </div>
    </div>
  </div>
</template>
