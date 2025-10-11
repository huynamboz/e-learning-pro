<script lang="ts" setup>
import type { Course } from '~/types/course.type'
import { notification } from 'ant-design-vue'

interface Props {
  courseData: Course
}

const props = defineProps<Props>()
const cartStore = useCartStore()
const { t } = useI18n()

const selectedCalendar = ref<string>('')

function handleSelectCalendar(id: string) {
  selectedCalendar.value = id
}

// Auto-select classroom if already in cart
onMounted(() => {
  // Check if this course has any classroom in cart
  const cartItem = cartStore.items.find(item => item.course.id === props.courseData.id)
  if (cartItem) {
    selectedCalendar.value = cartItem.selectedClassroom.id
  }
})

function handleAddToCard() {
  if (!selectedCalendar.value) {
    notification.warning({
      message: t('checkoutCard.messages.selectClassroom'),
      description: t('checkoutCard.messages.selectClassroomDesc'),
    })
    return
  }

  // Check if this course is already in cart
  const existingCartItem = cartStore.items.find(item => item.course.id === props.courseData.id)
  if (existingCartItem) {
    // If same classroom, show already in cart message
    if (existingCartItem.selectedClassroom.id === selectedCalendar.value) {
      notification.info({
        message: t('checkoutCard.messages.alreadyInCart'),
        description: t('checkoutCard.messages.alreadyInCartDesc', {
          title: props.courseData.title,
          classroom: existingCartItem.selectedClassroom.title
        }),
      })
      return
    }
    
    // If different classroom, remove old one and add new one
    cartStore.removeFromCart(existingCartItem.id)
    notification.info({
      message: t('checkoutCard.messages.classroomChanged'),
      description: t('checkoutCard.messages.classroomChangedDesc', {
        title: props.courseData.title
      }),
    })
  }

  const selectedClassroom = props.courseData.classrooms.find(c => c.id === selectedCalendar.value)
  if (selectedClassroom) {
    cartStore.addToCart(props.courseData, selectedClassroom)
    notification.success({
      message: t('checkoutCard.messages.addedToCart'),
      description: t('checkoutCard.messages.addedToCartDesc', {
        title: props.courseData.title,
        classroom: selectedClassroom.title
      }),
    })
  }
}

// Check if item is already in cart
const isInCart = computed(() => {
  if (!selectedCalendar.value) return false
  const selectedClassroom = props.courseData.classrooms.find(c => c.id === selectedCalendar.value)
  if (!selectedClassroom) return false
  return cartStore.isInCart(props.courseData.id, selectedClassroom.id)
})

function handleBuyNow() {
  if (!selectedCalendar.value) {
    notification.warning({
      message: t('checkoutCard.messages.selectClassroom'),
      description: t('checkoutCard.messages.selectClassroomBuy'),
    })
    return
  }

  // Check if this course is already in cart
  const existingCartItem = cartStore.items.find(item => item.course.id === props.courseData.id)
  if (existingCartItem) {
    // If different classroom, remove old one and add new one
    if (existingCartItem.selectedClassroom.id !== selectedCalendar.value) {
      cartStore.removeFromCart(existingCartItem.id)
    }
  }

  const selectedClassroom = props.courseData.classrooms.find(c => c.id === selectedCalendar.value)
  if (selectedClassroom) {
    cartStore.addToCart(props.courseData, selectedClassroom)
    navigateTo('/checkout')
  }
}
</script>

<template>
  <div class="flex flex-col bg-white rounded-lg border border-[#E2E8F0]">
    <div class="p-5 flex flex-col gap-5">
      <img v-if="props.courseData.thumbnail" :src="props.courseData?.thumbnail" class="h-[200px] rounded-lg object-cover" alt="image course">
      <img v-else src="/assets/images/course/python.webp" class="h-[200px] rounded-lg object-cover" alt="image course">
      <div class="flex items-center gap-3">
        <span v-if="!courseData.has_discount || !courseData.discount_price || parseFloat(courseData.discount_price) === 0" class="text-black font-bold text-2xl">
          ${{ props.courseData?.price }}
        </span>
        <template v-else>
          <span class="font-bold text-lg text-[#94A3B8] line-through">
            ${{ courseData?.price }}
          </span>
          <span class="text-black font-bold text-2xl">
            ${{ courseData?.discount_price }}
          </span>
          <span class="font-bold text-lg text-green">
            {{ Math.round(((parseFloat(courseData?.price || '0') - parseFloat(courseData?.discount_price || '0')) / parseFloat(courseData?.price || '1')) * 100) }}% Off
          </span>
        </template>
      </div>
      <div class="">
        <h3 class="font-semibold">
          {{ $t('checkoutCard.classroom') }}
        </h3>
        <div class="flex items-start gap-2 flex-col">
          <div
            v-for="item in props.courseData.classrooms" :key="item.id"
            class="flex text-[14px] font-semibold justify-between items-center gap-1 border-1 border-[#DDDDDD] hover:border-green-600 cursor-pointer rounded-lg p-2 w-full"
            :class="{ 'border-green-600': selectedCalendar === item.id }"
            @click="handleSelectCalendar(item.id)"
          >
            <div class="flex items-center gap-2">
              <Icon v-if="selectedCalendar === item.id" name="i-material-symbols-check-circle-rounded" size="18" class="text-[#49ba61]" />
              <div>
                <div class="font-medium text-gray-900">
                  {{ item.title }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ item.schedule_summary || 'No schedule' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span class="font-medium">{{ item.student_count }}</span>
              <Icon name="i-heroicons-users" size="18" />
            </div>
          </div>
        </div>
        <!-- Thông báo khi không có lớp học -->
        <div v-if="!props.courseData.classrooms || props.courseData.classrooms.length === 0" class="w-full !mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center gap-2">
            <Icon name="tabler:info-circle" class="text-yellow-600" size="20" />
            <span class="text-yellow-800 font-medium">{{ $t('checkoutCard.messages.noClassroom') }}</span>
          </div>
        </div>

        <!-- Show different buttons based on cart status -->
        <template v-if="isInCart">
          <!-- Already in cart - show checkout button -->
          <a-button
            type="primary"
            class="w-full !flex items-center !h-12 !mt-8 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
            @click="handleBuyNow"
          >
            <Icon name="solar:check-circle-bold" size="20" class="mr-2" />
            {{ $t('checkoutCard.buttons.checkoutNow') }}
          </a-button>
          <a-button
            class="w-full !flex items-center !h-12 !mt-4 rounded-lg text-sm !font-semibold flex items-center justify-center bg-gray-100 border-gray-100 text-gray-600 hover:bg-gray-200 hover:border-gray-200"
            @click="navigateTo('/checkout')"
          >
            <Icon name="solar:bag-heart-bold" size="20" class="mr-2" />
            {{ $t('checkoutCard.buttons.viewCart') }}
          </a-button>
        </template>
        <template v-else>
          <!-- Not in cart - show add to cart button -->
          <a-button
            type="primary"
            :disabled="!props.courseData.classrooms || props.courseData.classrooms.length === 0"
            class="w-full !flex items-center !h-12 !mt-8 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            @click="handleAddToCard"
          >
            {{ $t('checkoutCard.addToCart') }}
          </a-button>

          <a-button
            :disabled="!props.courseData.classrooms || props.courseData.classrooms.length === 0"
            class="w-full !flex items-center !h-12 !mt-4 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            @click="handleBuyNow"
          >
            {{ $t('checkoutCard.buyNow') }}
          </a-button>
        </template>
      </div>
    </div>

    <div class="line border-b border-[#E2E8F0]" />
    <div class="flex flex-col items-start justify-center gap-2 px-10 py-5">
      <span>{{ $t('checkoutCard.share') }}</span>
      <div class="flex items-center justify-center gap-5 w-full">
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-facebook" size="16" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-github-icon" size="16" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-devicon-google" size="16" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-devicon-twitter" size="16" />
        </a>
        <a href="#" class="flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#E2E8F0]">
          <Icon name="i-logos-microsoft-icon" size="16" />
        </a>
      </div>
    </div>
  </div>
</template>
