<script lang="ts" setup>
import type { Course } from '~/types/course.type'

interface Props {
  courseData: Course
}

const props = defineProps<Props>()

const selectedCalendar = ref<string>('')

function handleSelectCalendar(id: string) {
  selectedCalendar.value = id
}

function handleAddToCard() {
}

function handleBuyNow() {
}
</script>

<template>
  <div class="flex flex-col bg-white rounded-lg border border-[#E2E8F0]">
    <div class="p-5 flex flex-col gap-5">
      <img v-if="props.courseData.thumbnail" :src="props.courseData?.thumbnail" class="h-[200px] rounded-lg object-cover" alt="image course">
      <img v-else src="/assets/images/course/python.webp" class="h-[200px] rounded-lg object-cover" alt="image course">
      <div class="flex items-center gap-3">
        <span class="text-black font-bold text-2xl">
          ${{ props.courseData?.price }}
        </span>
        <span v-if="courseData.has_discount" class="font-bold text-lg text-[#94A3B8] line-through">
          ${{ courseData?.discount_price }}
        </span>
        <span v-if="props.courseData?.has_discount" class="font-bold text-lg text-green">
          {{ props.courseData?.discount_price }}% Off
        </span>
      </div>
      <div class="">
        <h3 class="font-semibold">
          {{ $t('checkoutCard.classroom') }}
        </h3>
        <div class="flex items-start gap-2 flex-col">
          <div
            v-for="item in props.courseData.classrooms" :key="item.id"
            class="flex text-[14px] font-semibold justify-between items-center gap-1 border-1 border-[#DDDDDD] hover:border-green-600 cursor-pointer rounded-lg p-2 w-full"
            :class="{ 'border-green-600': selectedCalendar === item.id }"
            @click="handleSelectCalendar(item.id)"
          >
            <div class="flex items-center gap-2">
              <Icon v-if="selectedCalendar === item.id" name="i-material-symbols-check-circle-rounded" class="text-[12px] sm:text-[18px] text-[#49ba61]" />
              <div>
                <div class="font-medium text-gray-900">
                  {{ item.title }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ item.schedule_summary || 'No schedule' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ item.student_count }}</span>
              <Icon name="i-heroicons-users" class="text-[12px] sm:text-[18px]" />
            </div>
          </div>
        </div>
        <a-button
          type="primary"
          class="w-full !h-12 !mt-8 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          @click="handleAddToCard"
        >
          {{ $t('checkoutCard.addToCart') }}
        </a-button>

        <a-button
          class="w-full !h-12 !mt-4 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="handleBuyNow"
        >
          {{ $t('checkoutCard.buyNow') }}
        </a-button>
      </div>
    </div>

    <div class="line border-b border-[#E2E8F0]" />
    <div class="flex flex-col items-start justify-center gap-2 px-10 py-5">
      <span>{{ $t('checkoutCard.share') }}</span>
      <div class="flex items-center justify-center gap-5 w-full">
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-facebook" class="text-[16px]" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-github-icon" class="text-[16px]" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-devicon-google" class="text-[16px]" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-devicon-twitter" class="text-[16px]" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-microsoft-icon" class="text-[16px]" />
        </a>
      </div>
    </div>
  </div>
</template>
