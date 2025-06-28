<template>
  <div class="flex bg-shade-1 min-h-lvh">
    <LayoutSideBar />
    <div class="flex-1 flex flex-col p-4 ml-[260px]">
      <LayoutHeader />
      <slot />
    </div>
  </div>
</template>
