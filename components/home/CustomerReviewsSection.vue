<script setup>
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Props
defineProps({
  reviewsData: {
    type: Array,
    required: true,
  },
})

// Swiper modules
const modules = [Navigation, Pagination, Autoplay]

// Swiper configuration
const swiperOptions = {
  modules,
  spaceBetween: 16,
  slidesPerView: 1,
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: '.swiper-button-next-custom',
    prevEl: '.swiper-button-prev-custom',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 1,
      spaceBetween: 16,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 16,
    },
  },
}
</script>

<template>
  <section class="py-12">
    <div class="max-w-[1280px] mx-auto px-4">
      <div class="flex w-full justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-black mb-12">
          What Our Customer Say About Us
        </h2>
        <div class="flex gap-6 justify-end">
          <button class="cursor-pointer swiper-button-prev-custom w-14 h-10 bg-gray-400 hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors">
            <Icon name="majesticons:chevron-left-line" class="text-2xl text-white" />
          </button>
          <button class="cursor-pointer swiper-button-next-custom w-14 h-10 bg-gray-400 hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors">
            <Icon name="majesticons:chevron-right-line" class="text-2xl text-white" />
          </button>
        </div>
      </div>

      <div class="relative">
        <Swiper v-bind="swiperOptions" class="reviews-swiper">
          <SwiperSlide
            v-for="review in reviewsData"
            :key="review.id"
          >
            <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full">
              <div class="space-y-6">
                <div class="w-12 h-12 flex items-center justify-center">
                  <Icon name="ri:double-quotes-l" class="text-[48px] text-[#3B82F6]" />
                </div>
                <p class="text-gray-600 leading-relaxed min-h-[130px]">
                  {{ review.review }}
                </p>
                <div class="flex items-center gap-4">
                  <img
                    :src="review.image"
                    :alt="review.name"
                    class="w-15 h-15 rounded-full object-cover"
                  >
                  <div>
                    <h4 class="font-semibold text-black">
                      {{ review.name }}
                    </h4>
                    <p class="text-sm text-gray-600">
                      {{ review.designation }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

        <!-- Pagination dots -->
        <div class="swiper-pagination mt-8" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom Swiper styles */
:deep(.swiper-pagination-bullet) {
  background-color: #d1d5db;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #3b82f6;
  opacity: 1;
}

:deep(.reviews-swiper) {
  padding-bottom: 3rem;
}

/* Ensure equal height for all slides */
:deep(.swiper-slide) {
  height: auto;
  display: flex;
}

:deep(.swiper-slide > div) {
  width: 100%;
}
</style>
