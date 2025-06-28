<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <div
    :class="{
      '!cursor-not-allowed opacity-30': disabled,
    }"
    class="cursor-pointer hover:bg-shade-5 transition-all duration-200 bg-shade-4 border border-shade-5 rounded-xl pt-[9px] pr-6 pb-[9px] pl-6 flex flex-row gap-2 items-center justify-center shrink-0 relative overflow-hidden "
    style="box-shadow: var(--button-box-shadow);"
  >
    <p
      class="text-sm font-semibold text-shade-9"
    >
      <slot />
    </p>
  </div>
</template>

<style scoped></style>
