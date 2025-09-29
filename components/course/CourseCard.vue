<script setup lang="ts">
import { Icon } from '#components'

defineProps<{
  id: string | number
  image: string
  title: string
  instructor: string
  ratingsCount: number
  duration: string
  price: number | string
  type?: string
}>()
</script>

<template>
  <RouterLink
    :to="type === 'admin' ? `courses/${id}` : `/courses/${id}`"
    class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="space-y-4">
      <img
        :src="image"
        :alt="title"
        class="w-full h-32 sm:h-36 lg:h-[139px] object-cover rounded-lg"
      >
      <div class="space-y-2">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
          {{ title }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600">
          {{ instructor }}
        </p>

        <div class="flex items-center gap-2" v-if="type !== 'admin'">
          <div class="flex">
            <Icon
              v-for="star in 5"
              :key="star"
              name="solar:star-bold"
              class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
            />
          </div>
          <span class="text-xs font-semibold text-gray-600">
            ({{ ratingsCount }} Ratings)
          </span>
        </div>

        <p class="text-xs sm:text-sm text-gray-600">
          {{ duration }}
        </p>

        <div class="text-lg sm:text-xl font-semibold text-gray-900">
          ${{ price }}
        </div>
      </div>
    </div>
  </RouterLink>
</template>
