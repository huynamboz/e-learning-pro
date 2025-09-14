<script setup lang="ts">
const expandedItems = ref(new Set())
const route = useRoute()
const menu = ref([
  {
    name: 'Components',
    icon: 'solar-box-minimalistic-broken',
    link: '#',
    subItems: [
      { name: 'Home', link: '/' },
      { name: 'Button', link: '#' },
      { name: 'Input', link: '#' },
    ],
  },
  {
    name: 'Pages',
    icon: 'solar-book-2-line-duotone',
    link: '#',
    subItems: [
      { name: 'Pricing', link: '#' },
      { name: 'Videos', link: '#' },
      { name: 'Documents', link: '#' },
    ],
  },
  {
    name: 'Liked',
    icon: 'solar-user-bold-duotone',
    link: '#',
    subItems: [
      { name: 'Favorites', link: '#' },
      { name: 'Bookmarks', link: '#' },
    ],
  },
])

function toggleExpand(itemName: string) {
  if (expandedItems.value.has(itemName)) {
    expandedItems.value.delete(itemName)
  }
  else {
    expandedItems.value.add(itemName)
  }
}

const staticMenu = ref([
  {
    name: 'New folder',
    icon: 'solar-add-folder-bold-duotone',
    link: '#',
    active: false,
    iconColor: '#7B7B7B',
  },
  {
    name: 'My scenes',
    icon: 'solar-folder-open-line-duotone',
    link: '#',
    active: false,
    iconColor: '#E36323',
  },
  {
    name: 'Untitled folder',
    icon: 'solar-folder-open-line-duotone',
    link: '#',
    active: false,
    iconColor: '#49BA61',
  },
  {
    name: '3D icons',
    icon: 'solar-folder-open-line-duotone',
    link: '#',
    active: false,
    iconColor: '#FFB73A',
  },
  {
    name: 'Source code',
    icon: 'solar-folder-open-line-duotone',
    link: '#',
    active: false,
    iconColor: '#8755E9',
  },
])

function isExpanded(itemName: string) {
  return expandedItems.value.has(itemName)
}

onMounted(() => {
  // open collapse if the current route matches any subItem link
  menu.value.forEach((item) => {
    if (item.subItems && item.subItems.some(subItem => subItem.link === route.path)) {
      expandedItems.value.add(item.name)
    }
  })
})
</script>

<template>
  <div class="fixed bg-shade-1 top-0 left-0 w-[220px] border-r border-shade-4 z-50 p-5 h-full">
    <!-- Site logo and dark mode toggle -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2">
        <Icon name="solar-bolt-line-duotone" class="text-2xl text-green" />
        <p class="font-bold text-2xl">
          <span class="text-green">UNLabs</span>
        </p>
      </div>
      <BaseDarkModeToggle />
    </div>
    <!-- Menu -->
    <ul>
      <li v-for="item in menu" :key="item.name" class="mb-1">
        <!-- Main menu item -->
        <div
          class="group mt-[2px] p-1 flex items-center justify-between hover:bg-shade-3 transition-all duration-200 pr-3 rounded-xl"
          :class="{ 'cursor-pointer': item.subItems && item.subItems.length > 0 }"
          @click="item.subItems && item.subItems.length > 0 ? toggleExpand(item.name) : null"
        >
          <div class="flex items-center gap-3">
            <div class="size-8 flex justify-center items-center">
              <Icon :name="item.icon" class="text-[20px] text-shade-6" />
            </div>
            <p class="font-semibold text-xs">
              {{ item.name }}
            </p>
          </div>
          <Icon
            name="tabler-chevron-down"
            class="text-[16px] text-shade-9 transition-all duration-200"
            :class="{
              'rotate-180': isExpanded(item.name),
              'rotate-0': !isExpanded(item.name),
              'opacity-100': item.subItems && item.subItems.length > 0,
              'opacity-0 group-hover:opacity-100': !item.subItems || item.subItems.length === 0,
            }"
          />
        </div>

        <!-- Sub menu items with animation -->
        <Transition
          enter-active-class="menu-expand-enter-active"
          enter-from-class="menu-expand-enter-from"
          enter-to-class="menu-expand-enter-to"
          leave-active-class="menu-expand-leave-active"
          leave-from-class="menu-expand-leave-from"
          leave-to-class="menu-expand-leave-to"
        >
          <div v-show="isExpanded(item.name)" class="overflow-hidden">
            <div class="ml-8 mt-1 space-y-1 pb-2">
              <NuxtLink
                v-for="(subItem, index) in item.subItems"
                :key="subItem.name"
                :to="subItem.link"
                active-class="active-route"
                class="flex p-2 px-4 font-medium border border-transparent relative text-xs text-shade-6 hover:text-shade-8 hover:bg-shade-2 rounded-lg cursor-pointer transition-all duration-150"
              >
                <div
                  :style="{ height: index !== 0 ? '51px' : '22px' }"
                  class="absolute z-10 -left-[16px] bottom-5 w-4 border-l-[1.5px] border-b-[1.5px] border-shade-4 rounded-bl-[8px]"
                />
                <p>
                  {{ subItem.name }}
                </p>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </li>
    </ul>

    <!-- static menu -->
    <div class="p-[10px] mt-3">
      <p class="text-sm text-shade-6 font-medium">
        My scenes
      </p>
    </div>
    <div class="flex flex-col gap-[2px]">
      <LayoutMenuItem
        v-for="item in staticMenu"
        :key="item.icon"
        :active="item.active"
        :menu="item"
      />
    </div>
  </div>
</template>
