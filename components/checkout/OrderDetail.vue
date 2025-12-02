<script lang="ts" setup>
interface Props {
  data: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  handleCheckout: void,
}>()
</script>

<template>
    <div class="flex flex-col gap-3">
        <h2 class="text-2xl !m-0 font-extrabold">Order Details</h2>
        <div class="p-4 rounded-lg border border-grey-400 gap-4 flex flex-col bg-[#F8FAFC]">
            <div class="flex items-center justify-between gap-3">
                <span>Price</span>
                <span class="text-base font-bold">€{{ Number(data?.price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3">
                <span>Discount</span>
                <span class="text-base font-bold">-€{{ Number(data?.discount || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="flex items-center justify-between gap-3">
                <span>Tax</span>
                <span class="text-base font-bold">{{ data?.tax }}</span>
            </div>
            <div class="line w-full border-b border-grey-400 my-2"></div>
            <div class="flex items-center justify-between gap-3 text-xl font-bold">
                <span>Total</span>
                <span>€{{ Number(data?.price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
        </div>
        <a-button @click="emit('handleCheckout')" type="primary" class="w-full !h-12 flex items-center justify-center !text-base !font-medium bg-[#16A34A] hover:bg-[#15803d] border-[#16A34A] hover:border-[#15803d]">
            Proceed to Checkout
        </a-button>
    </div>
</template>