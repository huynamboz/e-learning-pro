<script setup lang="ts">
defineProps<{
  menu: {
    name: string
    icon: string
    link: string
    iconColor?: string
  }
  active?: boolean
}>()
</script>

<template>
  <NuxtLink
    active-class="active-route-item"
    :to="menu.link"
    :class="{
      'bg-shade-3 border-shade-4': active,
      'border-transparent': !active,
    }"
    class="hover:bg-shade-3 cursor-pointer p-1 flex items-center gap-3 border rounded-lg"
  >
    <div
      :class="{
        'shadow-sm bg-white': active,
      }"
      class="size-8 flex justify-center items-center rounded-md"
    >
      <Icon :name="menu.icon" class="text-[20px]" :style="{ color: menu.iconColor }" />
    </div>
    <p class="text-xs text-shade-9 font-medium">
      {{ menu.name }}
    </p>
  </NuxtLink>
</template>

<style scoped>
.active-route-item {
  background-color: var(--shade-3);
  border: 1px solid;
  border-color: var(--shade-4) !important;
}

.active-route-item div {
  box-shadow: var(--shadow-sm);
  background-color: var(--white) !important;
}
</style>
