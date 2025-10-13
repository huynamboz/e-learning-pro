<script setup lang="ts">
import { useLearnStore } from '~/stores/learn.store'

const learnStore = useLearnStore()

// Computed properties for progress data
const attendanceProgress = computed(() => learnStore.sidebarProgress.attendance)
const courseCompletionProgress = computed(() => learnStore.sidebarProgress.courseCompletion)

// Load progress data on mount
onMounted(() => {
  learnStore.loadSidebarProgress()
})
</script>

<template>
  <div class="flex flex-col bg-[#F5F6F8] border border-[#E6E7EC] rounded-2xl p-2 items-center gap-3">
    <!-- Attendance Progress -->
    <!-- <LayoutMenuDonutChart
      :percentage="attendanceProgress.percentage"
      :label="$t('sidebar.attendance')"
      :value="attendanceProgress.value"
      color="#ef4444"
    /> -->

    <!-- Course Completion Progress -->
    <LayoutMenuDonutChart
      :percentage="courseCompletionProgress.percentage"
      :label="$t('sidebar.completeCourse')"
      :value="courseCompletionProgress.value"
      color="#22c55e"
    />

    <!-- Check Video Message -->
    <!-- <p class="text-[14px] text-[#83899F] text-center mb-4 leading-[17px]">
      {{ $t('sidebar.checkVideo') }}
    </p> -->

    <!-- Study Now Button -->
    <!-- <NuxtLink to="/learning" class="w-full bg-white border border-[#E6E7EC] rounded-xl py-2.5 px-4 shadow-sm text-center">
      <span class="text-[14px] font-medium text-[#0A1B39]">{{ $t('sidebar.studyNow') }}</span>
    </NuxtLink> -->
  </div>
</template>
