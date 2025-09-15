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
  <section class="py-8 sm:py-12">
    <div class="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 lg:mb-12">
        <h2 class="text-xl sm:text-2xl font-semibold text-black">
          What Our Customer Say About Us
        </h2>
        <div class="flex gap-4 sm:gap-6 justify-start sm:justify-end">
          <button class="cursor-pointer swiper-button-prev-custom w-12 h-9 sm:w-14 sm:h-10 bg-gray-400 hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors">
            <Icon name="majesticons:chevron-left-line" class="text-xl sm:text-2xl text-white" />
          </button>
          <button class="cursor-pointer swiper-button-next-custom w-12 h-9 sm:w-14 sm:h-10 bg-gray-400 hover:bg-gray-500 rounded-lg flex items-center justify-center transition-colors">
            <Icon name="majesticons:chevron-right-line" class="text-xl sm:text-2xl text-white" />
          </button>
        </div>
      </div>

      <div class="relative">
        <Swiper v-bind="swiperOptions" class="reviews-swiper">
          <SwiperSlide
            v-for="review in reviewsData"
            :key="review.id"
          >
            <div class="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm h-full">
              <div class="space-y-4 sm:space-y-6">
                <div class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <Icon name="ri:double-quotes-l" class="text-[40px] sm:text-[48px] text-[#3B82F6]" />
                </div>
                <p class="text-sm sm:text-base text-gray-600 leading-relaxed min-h-[100px] sm:min-h-[130px]">
                  {{ review.review }}
                </p>
                <div class="flex items-center gap-3 sm:gap-4">
                  <img
                    :src="review.image"
                    :alt="review.name"
                    class="w-12 h-12 sm:w-15 sm:h-15 rounded-full object-cover"
                  >
                  <div>
                    <h4 class="text-sm sm:text-base font-semibold text-black">
                      {{ review.name }}
                    </h4>
                    <p class="text-xs sm:text-sm text-gray-600">
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
