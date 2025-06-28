<template>
  <div class="flex bg-shade-1 min-h-lvh">
    <LayoutSideBar />
    <div class="flex-1 flex flex-col ml-[260px] pt-[80px]">
      <LayoutHeader />
      <slot />
    </div>
  </div>
</template>
