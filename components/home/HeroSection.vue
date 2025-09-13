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
  <section class="grid grid-cols-2 items-center min-h-[524px] w-full px-[80px] gap-10 max-w-[1280px] mx-auto">
    <div class="flex flex-col ">
      <h1 class="text-4xl font-bold text-[#0F172A] dark:text-white !mb-12">
        {{ heroData.title }}
      </h1>
      <p class="text-base text-[#334155] dark:text-gray-300 max-w-lg !mb-6">
        {{ heroData.description }}
      </p>
      <div>
        <Button type="primary" size="large">
          {{ heroData.ctaText }}
        </Button>
      </div>
    </div>
    <Transition name="fade-zoom">
      <img
        v-show="isVisible"
        src="@/assets/images/home/hero-banner.webp"
        alt="Hero Image"
        class="w-full h-auto max-w-[500px] mx-auto animate-fade-in"
      >
    </Transition>
  </section>
</template>

<style scoped>
.ant-btn {
  height: 48px;
  border-radius: 8px;
  background-color: #15803D;
  display: flex;
  align-items: center;
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
