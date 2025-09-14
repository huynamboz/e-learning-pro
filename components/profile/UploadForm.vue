<script lang="ts" setup>
const formState = reactive<any>({
  email: '',
  password: '',
})

function onFinish() {
}
</script>

<template>
  <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    layout="vertical"
    class="flex flex-col w-full rounded-lg border border-[#E2E8F0] !p-6"
    @finish="onFinish"
  >
    <div class="flex flex-col gap-3">
      <h3 class="text-xl font-semibold">
        Image Preview
      </h3>
      <div class="w-1/3 h-[198px] rounded-lg border border-[#E2E8F0] p-2 cursor-pointer">
        <div class="bg-[#E2E8F0] flex items-center justify-center h-full rounded-lg">
          <img src="@/assets/images/image-default.png" alt="">
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 w-full mt-8">
      <a-form-item
        label="Add/Change Image"
        name="changeImage"
        class="w-full"
      >
        <a-input v-model:value="formState.changeImage" size="large" placeholder="Enter label" />
      </a-form-item>
      <a-button class="!h-[40px] flex items-center justify-center">
        Upload image
      </a-button>
    </div>

    <a-button type="primary" class="max-w-[138px] !h-[40px] flex items-center justify-center !bg-black">
      Save Image
    </a-button>
  </a-form>
</template>
