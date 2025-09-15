<script setup>
import { onMounted, ref } from 'vue'

// Props
defineProps({
  heroData: {
    type: Object,
    required: true,
  },
})

const isVisible = ref(false)
onMounted(() => {
  isVisible.value = true
})
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[400px] sm:min-h-[480px] lg:min-h-[524px] w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[80px] gap-6 sm:gap-8 lg:gap-10 max-w-[1280px] mx-auto">
    <div class="flex flex-col text-center lg:text-left order-2 lg:order-1">
      <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-[#0F172A] dark:text-white mb-4 sm:mb-6 lg:mb-12">
        {{ heroData.title }}
      </h1>
      <p class="text-sm sm:text-base text-[#334155] dark:text-gray-300 max-w-full lg:max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 lg:mb-6">
        {{ heroData.description }}
      </p>
      <div class="flex justify-center lg:justify-start">
        <Button type="primary" size="large" class="w-full sm:w-auto">
          {{ heroData.ctaText }}
        </Button>
      </div>
    </div>
    <Transition name="fade-zoom">
      <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
        <img
          v-show="isVisible"
          src="@/assets/images/home/hero-banner.webp"
          alt="Hero Image"
          class="w-full h-auto max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto lg:mx-0 animate-fade-in"
        >
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.ant-btn {
  height: 40px;
  border-radius: 8px;
  background-color: #15803D;
  display: flex;
  align-items: center;
  min-width: 120px;
}

@media (min-width: 640px) {
  .ant-btn {
    height: 48px;
    min-width: 140px;
  }
}
.fade-zoom-enter-active {
  transition: all 0.5s ease;
}
.fade-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
}
.fade-zoom-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
