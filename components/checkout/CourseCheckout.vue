<script lang="ts" setup>
interface Props {
  data: any
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex flex-col sm:flex-row items-stretch gap-3 border border-grey-400 rounded-lg p-4 cursor-pointer h-full w-full">
    <div class="w-full sm:w-[192px] self-stretch overflow-hidden rounded-lg">
      <img :src="props.data?.image" class="object-cover w-full h-full" alt="main-course">
    </div>
    <div class="flex flex-1 items-center justify-between gap-4">
      <div class="flex gap-3 flex-col flex-1">
        <div class="border border-grey-500 rounded-full p-2 flex items-center justify-center max-w-[250px]">
          Thurday (8:30pm - 9pm)
        </div>
        <h2 class="text-lg font-bold !m-0">
          {{ props.data?.title }}
        </h2>
        <p class="!m-0 !-mt-2 text-[15px] text-gray-700">
          By Some one
        </p>
        <div class="flex items-center gap-2 text-[#334155]">
          <div class="flex items-center gap-1">
            <span class="text-base text-yellow-500 font-medium">{{ props.data?.rating }}</span>
            <Icon name="i-material-symbols-star-rounded" class="text-[16px] text-yellow-500" />
            <span class="text-xs">{{ `(3 rating)` }}</span>
          </div>
          <div class="text-[#334155] text-xs">
            |
          </div>
          <p class="!m-0 !p-0 text-xs">
            {{ props.data?.duration }}
          </p>
        </div>
        <div class="flex items-center">
          <div class="text-blue-400">
            Save for later
          </div>
          <div class="text-[#334155] text-xs mx-2">
            |
          </div>
          <div class="text-red-400">
            Remove
          </div>
        </div>
      </div>
      <div class="text-2xl font-bold">
        ${{ props.data?.price }}
      </div>
    </div>
  </div>
</template>
