<script setup lang="ts">
const { isAdmin } = useAdmin()
const { isCollapsed, menu, menuAdmin } = useSidebar()

const navbar = ref<HTMLElement | null>(null)
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
const pageTitle = computed(() => {
  if (isAdmin.value) {
    return menuAdmin.value.find(item => item.link && useRoute().path.startsWith(item.link))?.name || ''
  }
  return menu.value.find(item => item.link && useRoute().path.startsWith(item.link))?.name || ''
})

function handleScroll(): void {
  if (!navbar.value)
    return
  const navbarOffsetBottomWithPadding = navbar.value.offsetHeight + 20
  if (!navbar.value)
    return
  const scrollY = window.scrollY
  if (scrollY > navbarOffsetBottomWithPadding) {
    navbar.value.classList.add(
      'bg-white/70',
      'border-b-[1px]',
      'dark:bg-slate-900/80',
      'backdrop-blur',
    )
  }
  else {
    navbar.value.classList.remove(
      'bg-white/70',
      'border-b-[1px]',
      'dark:bg-slate-900/80',
      'backdrop-blur',
    )
  }
}
</script>

<template>
  <div
    ref="navbar"
    class="fixed top-0 flex left-0 w-full border-b border-shade-4 bg-shade-1 z-40 h-[80px] transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[280px]'"
  >
    <div class="flex-1 w-full h-full flex items-center justify-between px-5">
      <div class="flex items-center gap-2 text-sm text-[#00000066]">
        <span>Dashboard</span>
        <span>/</span>
        <span class="text-black">{{ pageTitle }}</span>
      </div>
      <div class="flex items-center gap-5">
        <div class="p-[10px] flex justify-center items-center">
          <Icon name="solar-bell-linear" class="text-shade-9" size="20" />
        </div>
        <BaseUserProfilePopup />
      </div>
    </div>
  </div>
</template>
