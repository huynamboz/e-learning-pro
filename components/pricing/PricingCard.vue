<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  price?: string
  features?: string[]
  backgroundImage?: string
  titleColor?: string
}>()
</script>

<template>
  <div class="relative w-full max-w-[325px] bg-shade-3 rounded-[20px]">
    <img class="absolute top-0 left-0 rounded-[20px]" :src="backgroundImage" alt="">
    <p
      :style="{ color: titleColor }"
      class="px-6 py-3 font-medium text-xl relative z-10"
    >
      {{ title }}
    </p>
    <div class="relative rounded-[20px] bg-shade-1 border border-shade-5 dark:border-shade-3 p-3">
      <p class="text-[15px] p-3">
        Perfect for hobbyists, students, or early-stage creators.
      </p>
      <div class="bg-shade-2 mt-3 border border-shade-5  dark:border-shade-3 rounded-[20px] p-3 shadow-xs">
        <div class="flex items-start">
          <span class="text-2xl text-shade-6 mr-1 mt-2">$</span>
          <div class="flex items-center">
            <span class="text-[40px]">
              {{ price }}
            </span>
            <div class="flex text-shade-6 flex-col ml-2 text-xs">
              <span>USD /</span>
              <span>month</span>
            </div>
          </div>
        </div>
        <BaseButton class="mt-3 w-full" disabled>
          Get Started
        </BaseButton>
      </div>

      <!-- marketing features -->
      <div class="mt-5">
        <ul class="pl-3 text-sm text-shade-9">
          <li class="flex items-center gap-2 mb-2">
            <Icon name="hugeicons-tick-02" class="text-xl" />
            Basic SEO tools
          </li>
          <li class="flex items-center gap-2 mb-2">
            <Icon name="hugeicons-tick-02" class="text-xl" />
            Email marketing integration
          </li>
          <li class="flex items-center gap-2 mb-2">
            <Icon name="hugeicons-tick-02" class="text-xl" />
            Social media sharing
          </li>
          <li class="flex items-center gap-2 mb-2">
            <Icon name="hugeicons-tick-02" class="text-xl" />
            Basic analytics
          </li>
          <li class="flex items-center gap-2 mb-2">
            <Icon name="hugeicons-tick-02" class="text-xl" />
            Community support
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
