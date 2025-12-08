<script lang="ts" setup>
import type { Course } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import { useCartStore } from '~/stores/cart.store'

interface Props {
  courseData: Course
  classroomId: string // Required classroom ID for this checkout
}

const props = defineProps<Props>()
const cartStore = useCartStore()
const { t } = useI18n()
const { user } = useAuth()

// Load cart on mount
onMounted(() => {
  cartStore.loadCart()
})

// Check if user is teacher
const isTeacher = computed(() => user.value?.is_teacher || false)

// Find the selected classroom
const selectedClassroom = computed(() => {
  return props.courseData.classrooms?.find(c => c.id === props.classroomId)
})

// Computed properties for classroom pricing
const classroomPrice = computed(() => {
  if (!selectedClassroom.value)
    return props.courseData.price || '0'
  return selectedClassroom.value.price || '0'
})

const classroomDiscountPrice = computed(() => {
  if (!selectedClassroom.value)
    return props.courseData.discount_price
  return selectedClassroom.value.discount_price
})

const classroomEffectivePrice = computed(() => {
  if (!selectedClassroom.value)
    return props.courseData.effective_price || 0
  return selectedClassroom.value.effective_price || 0
})

const classroomIsFree = computed(() => {
  if (!selectedClassroom.value)
    return props.courseData.is_free || false
  return selectedClassroom.value.is_free || false
})

const hasClassroomDiscount = computed(() => {
  if (!selectedClassroom.value)
    return props.courseData.has_discount || false
  const discountPrice = parseFloat(selectedClassroom.value.discount_price || '0')
  return discountPrice > 0 && discountPrice < parseFloat(selectedClassroom.value.price || '0')
})

// Check if item is already in cart
const isInCart = computed(() => {
  if (!selectedClassroom.value || typeof window === 'undefined')
    return false
  // Load cart on client side
  if (cartStore.items.length === 0) {
    cartStore.loadCart()
  }
  return cartStore.isInCart(props.courseData.id, selectedClassroom.value.id)
})

function handleAddToCard() {
  if (!selectedClassroom.value) {
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
    if (existingCartItem.selectedClassroom.id === selectedClassroom.value.id) {
      notification.info({
        message: t('checkoutCard.messages.alreadyInCart'),
        description: t('checkoutCard.messages.alreadyInCartDesc', {
          title: props.courseData.title,
          classroom: existingCartItem.selectedClassroom.title,
        }),
      })
      return
    }

    // If different classroom, remove old one and add new one
    cartStore.removeFromCart(existingCartItem.id)
    notification.info({
      message: t('checkoutCard.messages.classroomChanged'),
      description: t('checkoutCard.messages.classroomChangedDesc', {
        title: props.courseData.title,
      }),
    })
  }

  // Add to cart
  cartStore.addToCart(props.courseData, selectedClassroom.value)

  notification.success({
    message: t('checkoutCard.messages.addedToCart'),
    description: t('checkoutCard.messages.addedToCartDesc', {
      title: props.courseData.title,
      classroom: selectedClassroom.value.title,
    }),
  })
}

function handleBuyNow() {
  if (!selectedClassroom.value) {
    notification.warning({
      message: t('checkoutCard.messages.selectClassroom'),
      description: t('checkoutCard.messages.selectClassroomDesc'),
    })
    return
  }

  // Add to cart first
  handleAddToCard()
  // Then navigate to checkout
  navigateTo('/checkout')
}

function copyCourseLink() {
  const courseUrl = `${window.location.origin}/courses/${props.courseData.id}/classrooms/${props.classroomId}`

  if (navigator.clipboard) {
    navigator.clipboard.writeText(courseUrl).then(() => {
      notification.success({
        message: t('checkoutCard.messages.linkCopied'),
        description: t('checkoutCard.messages.linkCopiedDesc'),
      })
    }).catch(() => {
      fallbackCopyTextToClipboard(courseUrl)
    })
  }
  else {
    fallbackCopyTextToClipboard(courseUrl)
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    notification.success({
      message: t('checkoutCard.messages.linkCopied'),
      description: t('checkoutCard.messages.linkCopiedDesc'),
    })
  }
  catch {
    notification.error({
      message: t('checkoutCard.messages.copyFailed'),
      description: t('checkoutCard.messages.copyFailedDesc'),
    })
  }

  document.body.removeChild(textArea)
}
</script>

<template>
  <div class="flex flex-col bg-white rounded-lg border border-[#E2E8F0]">
    <div class="p-5 flex flex-col gap-5">
      <img :src="props.courseData?.thumbnail || '/images/course-thumbnail-default.webp'" class="h-[200px] rounded-lg object-cover" alt="image course">

      <!-- Classroom Title -->
      <h3 v-if="selectedClassroom" class="border-b  pb-5 text-xl font-bold text-gray-900">
        {{ selectedClassroom.title }}
      </h3>

      <div class="flex items-center gap-3">
        <!-- Free classroom -->
        <span v-if="classroomIsFree" class="text-green-600 font-bold text-2xl">
          Free
        </span>
        <!-- No discount or discount price is 0 -->
        <span v-else-if="!hasClassroomDiscount || !classroomDiscountPrice || parseFloat(classroomDiscountPrice) === 0" class="text-black font-bold text-2xl">
          €{{ Number(classroomEffectivePrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </span>
        <!-- Has discount -->
        <template v-else>
          <span class="font-bold text-lg text-[#94A3B8] line-through">
            €{{ Number(classroomPrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="text-black font-bold text-2xl">
            €{{ Number(classroomDiscountPrice || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="font-bold text-lg text-green">
            {{ Math.round(((parseFloat(classroomPrice || '0') - parseFloat(classroomDiscountPrice || '0')) / parseFloat(classroomPrice || '1')) * 100) }}% Off
          </span>
        </template>
      </div>

      <!-- Show different buttons based on user role -->
      <ClientOnly>
        <template v-if="isTeacher">
          <!-- Teacher - show edit course button -->
          <a-button
            type="primary"
            class="w-full !flex items-center !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
            @click="navigateTo(`/admin/courses/${props.courseData.id}/course-detail`)"
          >
            <Icon name="solar:settings-bold" size="20" class="mr-2" />
            {{ $t('checkoutCard.buttons.editCourse') }}
          </a-button>
        </template>
        <template v-else>
          <!-- Student - show cart buttons -->
          <template v-if="isInCart">
            <!-- Already in cart - show checkout button -->
            <a-button
              type="primary"
              class="w-full !flex items-center !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
              @click="handleBuyNow"
            >
              <Icon name="solar:check-circle-bold" size="20" class="mr-2" />
              {{ $t('checkoutCard.buttons.checkoutNow') }}
            </a-button>
            <a-button
              class="w-full !flex items-center !h-10 rounded-lg text-sm !font-semibold flex items-center justify-center bg-gray-100 border-gray-100 text-gray-600 hover:bg-gray-200 hover:border-gray-200"
              @click="navigateTo('/checkout')"
            >
              <Icon name="solar:bag-heart-bold" size="20" class="mr-2" />
              {{ $t('checkoutCard.buttons.viewCart') }}
            </a-button>
          </template>
          <template v-else>
            <a-button
              type="primary"
              :disabled="!selectedClassroom"
              class="w-full !flex items-center !h-10 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              @click="handleAddToCard"
            >
              {{ $t('checkoutCard.addToCart') }}
            </a-button>

            <a-button
              :disabled="!selectedClassroom"
              class="w-full !flex items-center !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              @click="handleBuyNow"
            >
              {{ $t('checkoutCard.buyNow') }}
            </a-button>
          </template>
        </template>
        <template #fallback>
          <!-- Fallback for SSR -->
          <a-button
            type="primary"
            :disabled="!selectedClassroom"
            class="w-full !flex items-center !h-10 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {{ $t('checkoutCard.addToCart') }}
          </a-button>
        </template>
      </ClientOnly>
    </div>

    <div class="line border-b border-[#E2E8F0]" />
    <div class="flex flex-col items-center justify-center gap-3 px-10 py-5">
      <span class="text-sm text-gray-600">{{ $t('checkoutCard.share') }}</span>
      <a-button
        class="!flex !items-center !justify-center !gap-2 !h-10 !px-4 !rounded-lg !text-sm !font-medium !bg-gray-50 !border-gray-200 !text-gray-700 hover:!bg-gray-100 hover:!border-gray-300"
        @click="copyCourseLink"
      >
        <Icon name="solar:link-bold" size="16" />
        {{ $t('checkoutCard.copyLink') }}
      </a-button>
    </div>
  </div>
</template>
