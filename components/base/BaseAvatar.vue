<script setup lang="ts">
const { profile } = useAuth()
defineProps<{
  src?: string
  size?: string
}>()
</script>

<template>
  <div>
    <div class="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-gray-200"
      :style="{ width: size, height: size }">
      <img v-if="src" :src="src" alt="Avatar" class="w-full h-full object-cover rounded-full">
      <span v-else class="text-gray-500">
        {{ profile?.first_name?.charAt(0) }}
      </span>
    </div>
  </div>
</template>
