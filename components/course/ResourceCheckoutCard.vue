<script lang="ts" setup>
import type { Course, ResourcePricePlan } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import { useCartStore } from '~/stores/cart.store'

interface Props {
  courseData: Course
  pricePlans: ResourcePricePlan[]
  loading?: boolean
}

const props = defineProps<Props>()
const cartStore = useCartStore()
const { t } = useI18n()
const { user } = useAuth()

// Check if user is teacher
const isTeacher = computed(() => user.value?.is_teacher || false)

// Selected price plan
const selectedPlanId = ref<string>('')

// Auto-select first available plan
watch(() => props.pricePlans, (plans) => {
  if (plans && plans.length > 0 && !selectedPlanId.value) {
    // Prefer default plan, otherwise first available plan
    const defaultPlan = plans.find(p => p.is_default && p.is_available)
    const firstAvailable = plans.find(p => p.is_available)
    selectedPlanId.value = defaultPlan?.id || firstAvailable?.id || ''
  }
}, { immediate: true })

// Get selected plan
const selectedPlan = computed(() => {
  return props.pricePlans.find(p => p.id === selectedPlanId.value)
})

// Format price
function formatPrice(amount: string, currency: string): string {
  const numAmount = Number.parseFloat(amount)
  if (currency === 'VND') {
    return `${new Intl.NumberFormat('vi-VN').format(numAmount)} ₫`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(numAmount)
}

// Check if item is already in cart
const isInCart = computed(() => {
  // For resource courses, check if course with selected price plan is in cart
  if (selectedPlanId.value) {
    return cartStore.isInCart(props.courseData.id, undefined, selectedPlanId.value)
  }
  return cartStore.items.some(item => item.course.id === props.courseData.id)
})

function handleAddToCart() {
  if (!selectedPlanId.value || !selectedPlan.value) {
    notification.warning({
      message: t('checkoutCard.messages.selectPricePlan'),
      description: t('checkoutCard.messages.selectPricePlanDesc'),
    })
    return
  }

  // Check if this course is already in cart
  const existingCartItem = cartStore.items.find(item => item.course.id === props.courseData.id)
  if (existingCartItem) {
    notification.info({
      message: t('checkoutCard.messages.alreadyInCart'),
      description: t('checkoutCard.messages.alreadyInCartDesc', {
        title: props.courseData.title,
      }),
    })
    return
  }

  // Add resource to cart with price plan
  cartStore.addResourceToCart(props.courseData, selectedPlan.value)

  notification.success({
    message: t('checkoutCard.messages.addedToCart'),
    description: t('checkoutCard.messages.addedToCartDesc', {
      title: props.courseData.title,
    }),
  })
}

function handleBuyNow() {
  if (!selectedPlanId.value || !selectedPlan.value) {
    notification.warning({
      message: t('checkoutCard.messages.selectPricePlan'),
      description: t('checkoutCard.messages.selectPricePlanBuy'),
    })
    return
  }

  // Add to cart and navigate to checkout
  handleAddToCart()
  navigateTo('/checkout')
}

function copyCourseLink() {
  const courseUrl = `${window.location.origin}/courses/${props.courseData.id}`

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
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'
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

// Load cart on mount
onMounted(() => {
  cartStore.loadCart()
})
</script>

<template>
  <div class="flex flex-col bg-white rounded-lg border border-[#E2E8F0]">
    <div class="p-5 flex flex-col gap-5">
      <img :src="props.courseData?.thumbnail || '/images/course-thumbnail-default.webp'" class="h-[200px] rounded-lg object-cover" alt="image course">

      <!-- Price Plans Selection -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <a-spin size="large" />
      </div>

      <div v-else-if="pricePlans.length > 0" class="flex flex-col gap-3">
        <label class="text-sm font-semibold text-gray-700">
          {{ t('checkoutCard.selectPricePlan') }}
        </label>
        <a-select
          v-model:value="selectedPlanId"
          :placeholder="t('checkoutCard.selectPricePlanPlaceholder')"
          class="w-full"
          size="large"
        >
          <a-select-option
            v-for="plan in pricePlans.filter(p => p.is_available)"
            :key="plan.id"
            :value="plan.id"
          >
            <!-- <div class="flex items-center justify-between">
              <span>{{ plan.duration_months }} {{ t('checkoutCard.months') }}</span>
              <span class="font-semibold text-[#16A34A] ml-4">
                {{ formatPrice(plan.price_amount, plan.price_currency) }}
              </span>
            </div> -->
            {{ plan.duration_months }} {{ t('checkoutCard.months') }} - {{ formatPrice(plan.price_amount, plan.price_currency) }}
          </a-select-option>
        </a-select>

        <!-- Selected Plan Price Display -->
        <div v-if="selectedPlan" class="flex items-center gap-3 pt-2">
          <span class="text-black font-bold text-2xl">
            {{ formatPrice(selectedPlan.price_amount, selectedPlan.price_currency) }}
          </span>
        </div>
      </div>

      <div v-else class="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="tabler:info-circle" class="text-yellow-600" size="20" />
          <span class="text-yellow-800 font-medium">{{ t('checkoutCard.messages.noPricePlans') }}</span>
        </div>
      </div>

      <!-- Show different buttons based on user role -->
      <template v-if="isTeacher">
        <!-- Teacher - show edit course button -->
        <a-button
          type="primary"
          class="w-full !flex items-center !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
          @click="navigateTo(`/admin/courses/${props.courseData.id}/course-detail`)"
        >
          <Icon name="solar:settings-bold" size="20" class="mr-2" />
          {{ t('checkoutCard.buttons.editCourse') }}
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
            {{ t('checkoutCard.buttons.checkoutNow') }}
          </a-button>
          <a-button
            class="w-full !flex items-center !h-12 !mt-4 rounded-lg text-sm !font-semibold flex items-center justify-center bg-gray-100 border-gray-100 text-gray-600 hover:bg-gray-200 hover:border-gray-200"
            @click="navigateTo('/checkout')"
          >
            <Icon name="solar:bag-heart-bold" size="20" class="mr-2" />
            {{ t('checkoutCard.buttons.viewCart') }}
          </a-button>
        </template>
        <template v-else>
          <!-- Not in cart - show add to cart button -->
          <a-button
            type="primary"
            :disabled="!selectedPlanId || pricePlans.length === 0"
            class="w-full !flex items-center !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            @click="handleAddToCart"
          >
            {{ t('checkoutCard.addToCart') }}
          </a-button>

          <a-button
            :disabled="!selectedPlanId || pricePlans.length === 0"
            class="w-full !flex items-center !h-12 !mt-4 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            @click="handleBuyNow"
          >
            {{ t('checkoutCard.buyNow') }}
          </a-button>
        </template>
      </template>
    </div>

    <div class="line border-b border-[#E2E8F0]" />
    <div class="flex flex-col items-center justify-center gap-3 px-10 py-5">
      <span class="text-sm text-gray-600">{{ t('checkoutCard.share') }}</span>
      <a-button
        class="!flex !items-center !justify-center !gap-2 !h-10 !px-4 !rounded-lg !text-sm !font-medium !bg-gray-50 !border-gray-200 !text-gray-700 hover:!bg-gray-100 hover:!border-gray-300"
        @click="copyCourseLink"
      >
        <Icon name="solar:link-bold" size="16" />
        {{ t('checkoutCard.copyLink') }}
      </a-button>
    </div>
  </div>
</template>
