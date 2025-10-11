<script lang="ts" setup>
import { notification } from 'ant-design-vue'
import { useOrderApi } from '~/composables/api/useOrderApi'

definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const cartStore = useCartStore()
const router = useRouter()

// Check if user is logged in
const { isLoggedIn } = useAuth()

// Dialog state
const showPaymentDialog = ref(false)
const showLoginDialog = ref(false)

// Load cart on mount
onMounted(() => {
  cartStore.loadCart()
})

// Format time for display
function formatTime(time: string): string {
  if (!time)
    return ''
  return time.substring(0, 5)
}

// Format date for display
function formatDate(dateString: string): string {
  if (!dateString)
    return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

// Remove item from cart
function removeFromCart(itemId: string) {
  cartStore.removeFromCart(itemId)
  notification.success({
    message: t('checkout.messages.removedFromCart'),
    description: t('checkout.messages.removedFromCartDesc'),
  })
}

// Proceed to checkout
function proceedToCheckout() {
  if (cartStore.totalItems === 0) {
    notification.warning({
      message: t('checkout.messages.emptyCart'),
      description: t('checkout.messages.emptyCartDesc'),
    })
    return
  }

  // Check if user is logged in
  if (!isLoggedIn.value) {
    showLoginDialog.value = true
    return
  }

  // Show payment confirmation dialog
  showPaymentDialog.value = true
}

// Confirm payment
async function confirmPayment() {
  showPaymentDialog.value = false
  
  try {
    // Create orders for each item in cart
    const { createOrder } = useOrderApi()
    
    for (const item of cartStore.items) {
      const orderPayload = {
        course_id: item.course.id,
        classroom_id: item.selectedClassroom.id,
        price_amount: item.price.toString(),
        price_currency: 'USD',
        payment_method: 'bank_transfer',
        payment_reference: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        notes: `Payment for course: ${item.course.title} - Classroom: ${item.selectedClassroom.title}`,
        metadata: {
          course_title: item.course.title,
          classroom_title: item.selectedClassroom.title,
          schedule: item.selectedClassroom.schedule_summary,
        }
      }
      
      await createOrder(orderPayload)
    }
    
    // Clear cart and redirect to success page
    cartStore.clearCart()
    router.push('/checkout-complete')
    
  } catch (error) {
    console.error('Error creating order:', error)
    notification.error({
      message: t('checkout.messages.paymentError'),
      description: t('checkout.messages.paymentErrorDesc'),
    })
  }
}

// Cancel payment
function cancelPayment() {
  showPaymentDialog.value = false
}

// Handle login dialog
function goToLogin() {
  showLoginDialog.value = false
  router.push('/auth/login')
}

function goToRegister() {
  showLoginDialog.value = false
  router.push('/auth/register')
}

function cancelLogin() {
  showLoginDialog.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-4">
          <NuxtLink to="/" class="flex items-center text-gray-500 hover:text-gray-700">
            <Icon name="solar:home-bold" size="16" class="mr-2" />
            {{ $t('checkout.breadcrumb.home') }}
          </NuxtLink>
          <Icon name="solar:alt-arrow-right-bold" size="16" class="mx-2 text-gray-400" />
          <span class="text-blue-600 font-medium">{{ $t('checkout.breadcrumb.cart') }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ $t('checkout.title') }}
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2">
          <!-- Cart Summary -->
          <div class="mb-6">
            <p class="text-gray-600">
              {{ $t('checkout.summary.coursesInCart', { 
                count: cartStore.totalItems, 
                plural: cartStore.totalItems !== 1 ? 's' : '' 
              }) }}
            </p>
          </div>

          <!-- Empty Cart -->
          <div v-if="cartStore.totalItems === 0" class="text-center py-12">
            <Icon name="solar:bag-heart-bold" size="50" class="text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ $t('checkout.summary.emptyCart.title') }}
            </h3>
            <p class="text-gray-500 mb-6">
              {{ $t('checkout.summary.emptyCart.description') }}
            </p>
            <NuxtLink to="/courses" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Icon name="solar:arrow-left-bold" size="16" class="mr-2" />
              {{ $t('checkout.summary.emptyCart.continueShopping') }}
            </NuxtLink>
          </div>

          <!-- Cart Items List -->
          <div v-else class="space-y-4">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div class="flex items-start space-x-4">
                <!-- Course Image -->
                <div class="flex-shrink-0">
                  <img
                    v-if="item.course.thumbnail"
                    :src="item.course.thumbnail"
                    :alt="item.course.title"
                    class="w-24 h-24 object-cover rounded-lg"
                  >
                  <div v-else class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon name="solar:play-circle-bold" size="32" class="text-gray-400" />
                  </div>
                </div>

                <!-- Course Details -->
                <div class="flex-1 min-w-0">
                  <!-- Schedule Tag -->
                  <div class="mb-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ item.selectedClassroom.schedule_summary }}
                    </span>
                  </div>

                  <!-- Course Title -->
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    {{ item.course.title }}
                  </h3>

                  <!-- Instructor -->
                  <p class="text-sm text-gray-600 mb-2">
                    By {{ item.course.teacher.full_name }}
                  </p>

                  <!-- Rating -->
                  <div class="flex items-center mb-2">
                    <div class="flex items-center">
                      <Icon name="solar:star-bold" class="w-4 h-4 text-yellow-400" />
                      <Icon name="solar:star-bold" class="w-4 h-4 text-yellow-400" />
                      <Icon name="solar:star-bold" class="w-4 h-4 text-yellow-400" />
                      <Icon name="solar:star-bold" class="w-4 h-4 text-yellow-400" />
                      <Icon name="solar:star-half-bold" class="w-4 h-4 text-yellow-400" />
                    </div>
                    <span class="ml-2 text-sm font-medium text-gray-900">4.6</span>
                    <span class="ml-1 text-sm text-gray-500">(250 rating)</span>
                  </div>

                  <!-- Course Info -->
                  <p class="text-sm text-gray-600 mb-4">
                    {{ item.course.duration_hours }} Total Hours. {{ item.course.lessons_count }} Lectures. {{ item.course.level }}
                  </p>

                  <!-- Action Links -->
                  <div class="flex space-x-4">
                    <button
                      class="text-sm text-red-600 hover:text-red-800 transition-colors"
                      @click="removeFromCart(item.id)"
                    >
                      {{ $t('checkout.orderSummary.remove') }}
                    </button>
                  </div>
                </div>

                <!-- Price -->
                <div class="flex-shrink-0 text-right">
                  <p class="text-xl font-bold text-gray-900">
                    ${{ item.price.toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              {{ $t('checkout.orderSummary.title') }}
            </h2>

            <!-- Price Breakdown -->
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ $t('checkout.orderSummary.price') }}</span>
                <span class="font-medium">${{ cartStore.totalPrice.toFixed(2) }}</span>
              </div>

              <div v-if="cartStore.totalDiscount > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ $t('checkout.orderSummary.discount') }}</span>
                <span class="font-medium text-green-600">-${{ cartStore.totalDiscount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ $t('checkout.orderSummary.tax') }}</span>
                <span class="font-medium">${{ cartStore.tax.toFixed(2) }}</span>
              </div>

              <div class="border-t border-gray-200 pt-3">
                <div class="flex justify-between">
                  <span class="text-base font-semibold text-gray-900">{{ $t('checkout.orderSummary.total') }}</span>
                  <span class="text-xl font-bold text-gray-900">${{ cartStore.finalTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Proceed to Checkout Button -->
            <button
              class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              :disabled="cartStore.totalItems === 0"
              @click="proceedToCheckout"
            >
              {{ $t('checkout.orderSummary.proceedToCheckout') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Confirmation Dialog -->
    <a-modal
      v-model:open="showPaymentDialog"
      :title="$t('checkout.paymentDialog.title')"
      :footer="null"
      centered
      width="500px"
    >
      <div class="text-center py-6 rounded-3xl">
        <!-- Icon -->
        <div class="mb-6">
          <Icon name="solar:card-send-bold" size="50" class="text-blue-500 mx-auto" />
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          {{ $t('checkout.paymentDialog.confirmTitle') }}
        </h3>

        <!-- Description -->
        <p class="text-gray-600 mb-6 leading-relaxed">
          {{ $t('checkout.paymentDialog.description', { amount: `$${cartStore.finalTotal.toFixed(2)}` }) }}
          <br><br>
          {{ $t('checkout.paymentDialog.afterConfirm') }}
        </p>

        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 class="font-medium text-gray-900 mb-3">{{ $t('checkout.paymentDialog.orderDetails') }}</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('checkout.paymentDialog.totalAmount') }}</span>
              <span class="font-medium">${{ cartStore.totalPrice.toFixed(2) }}</span>
            </div>
            <div v-if="cartStore.totalDiscount > 0" class="flex justify-between">
              <span class="text-gray-600">{{ $t('checkout.paymentDialog.discount') }}</span>
              <span class="font-medium text-green-600">-${{ cartStore.totalDiscount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">{{ $t('checkout.paymentDialog.tax') }}</span>
              <span class="font-medium">${{ cartStore.tax.toFixed(2) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-2">
              <div class="flex justify-between">
                <span class="font-medium text-gray-900">{{ $t('checkout.paymentDialog.finalAmount') }}</span>
                <span class="font-bold text-lg text-green-600">${{ cartStore.finalTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 justify-center">
          <button
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="cancelPayment"
          >
            {{ $t('checkout.paymentDialog.cancel') }}
          </button>
          <button
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="confirmPayment"
          >
            {{ $t('checkout.paymentDialog.confirmTransfer') }}
          </button>
        </div>
      </div>
    </a-modal>

    <!-- Login Required Dialog -->
    <a-modal
      v-model:open="showLoginDialog"
      :title="$t('checkout.loginDialog.title')"
      :footer="null"
      centered
      width="400px"
    >
      <div class="text-center py-6">
        <!-- Icon -->
        <div class="mb-6">
          <Icon name="solar:lock-keyhole-bold" size="50" class="text-orange-500 mx-auto" />
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          {{ $t('checkout.loginDialog.confirmTitle') }}
        </h3>

        <!-- Description -->
        <p class="text-gray-600 mb-6 leading-relaxed">
          {{ $t('checkout.loginDialog.description') }}
          <br><br>
          {{ $t('checkout.loginDialog.registerInfo') }}
        </p>

        <!-- Action Buttons -->
        <div class="flex space-x-3 justify-center">
          <button
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            @click="cancelLogin"
          >
            {{ $t('checkout.loginDialog.cancel') }}
          </button>
          <button
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="goToLogin"
          >
            {{ $t('checkout.loginDialog.login') }}
          </button>
          <button
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="goToRegister"
          >
            {{ $t('checkout.loginDialog.register') }}
          </button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
