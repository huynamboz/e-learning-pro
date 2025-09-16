<script lang="ts" setup>
import { categoriesData, coursesData, heroData, instructorsData, reviewsData, statsData } from '@/resources/home'

const isPaid = ref<boolean>(false)

const handlecheckout = () => {
  isPaid.value = true
}
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-10 w-full">
    <h1 class="titlle !m-0 text-3xl font-extrabold !mb-10">Shopping Cart</h1>

    <div v-if="!isPaid" class="flex flex-col lg:flex-row items-start gap-10 lg:gap-20 justify-between w-full">
      <div class="flex flex-col gap-4 w-full lg:w-[65%]">
      <div class="w-full border-b border-grey-400 mb-3 text-grey-800 text-base pb-3">
        {{ coursesData.length }} course in cart
      </div>
      <div v-for="course in coursesData" :key="course.id" class="flex items-start flex-col gap-4">
        <CheckoutCourseCheckout :data="course"/>
      </div>
    </div>
    <CheckoutOrderDetail class="w-full lg:w-[35%]" @handleCheckout="handlecheckout()" :data="coursesData[0]" />
    </div>
    
    <!-- complete -->
    <div v-else class="flex flex-col gap-2 items-center justify-center">
      <div class="flex items-center justify-center h-[200px] w-[200px] bg-[#16A34A] rounded-full">
        <Icon class="text-[164px] text-white" name="i-material-symbols-check-small-rounded" />
      </div>
      <h2 class="!m-0 text-3xl font-extrabold !mt-2">Order Complete</h2>
      <p class="!m-0 text-lg font-semibold !-mt-1">You Will Receive a confirmation email soon!</p>
    </div>
  </div>
</template>
