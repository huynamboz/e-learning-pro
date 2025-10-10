<script setup lang="ts">
import { NuxtLink } from '#components'
import { Tooltip } from 'ant-design-vue'
import { cn } from '~/lib/utils'

const { isCollapsed, toggleSidebar, menuAdmin } = useSidebar()
const expandedItems = ref(new Set())
const route = useRoute()

// Get menu items based on mode
const currentMenu = computed(() => {
  return menuAdmin.value
})

function toggleExpand(itemName: string) {
  if (expandedItems.value.has(itemName)) {
    expandedItems.value.delete(itemName)
  }
  else {
    expandedItems.value.add(itemName)
  }
}

function isExpanded(itemName: string) {
  return expandedItems.value.has(itemName)
}

// onMounted(() => {
//   currentMenu.value.forEach((item) => {
//     if (item.subItems && item.subItems.some(subItem => subItem.link === route.path)) {
//       expandedItems.value.add(item.name)
//     }
//   })
// })
</script>

<template>
  <div
    class="fixed bg-[#151414] top-0 left-0 border rounded-e-2xl border-[#151414] z-50 h-full transition-all duration-300 ease-in-out h-100vh overflow-y-auto scrollbar-hide"
    :class="isCollapsed ? 'w-[80px] px-4' : 'w-[280px] px-[18px]'"
  >
    <div class="py-6">
      <!-- Site logo and dark mode toggle -->
      <div class="flex items-center justify-center gap-3 mb-5 h-10">
        <NuxtLink v-if="!isCollapsed" class="flex gap-2" to="/admin">
          <img src="@/assets/images/logo.webp" alt="" class="h-10 w-10 object-contain">
          <div class="grid">
            <h4 class="font-extrabold text-white text-base whitespace-nowrap">
              {{ $t('admin.sidebar.title') }}
            </h4>
            <p class="font-medium text-[#15803D] text-xs -mt-2 whitespace-nowrap">
              {{ $t('admin.sidebar.subtitle') }} <span class="text-[#EF4444]">{{ $t('admin.sidebar.author') }}</span>
            </p>
          </div>
        </NuxtLink>
        <Icon
          :name="isCollapsed ? 'lucide:sidebar-open' : 'lucide:sidebar-close'"
          class="text-2xl cursor-pointer text-white hover:text-[#15803D] transition-colors"
          @click="toggleSidebar"
        />
      </div>

      <!-- Menu -->
      <ul>
        <li v-for="item in currentMenu" :key="item.name" class="mb-px">
          <!-- Main menu item -->
          <Tooltip placement="right" :title="isCollapsed ? item.name : null">
            <component
              :is="item.link ? NuxtLink : 'div'"
              :to="item.link && item.link !== '#' ? item.link : undefined"
              :class="cn(
                'group p-1 flex items-center transition-all duration-200 rounded-xl border border-transparent cursor-pointer',
                ((item.subItems && item.subItems.length > 0) || !isCollapsed) && 'cursor-pointer',
                isExpanded(item.name) && !isCollapsed && '!border-[#E6E7EC]',
                isCollapsed && 'justify-center tooltip',
                !isCollapsed && 'justify-between pr-3',
                (item.link && item.link !== '#') && (
                  (item.link === '/admin' ? route.path === '/admin' : route.path.startsWith(item.link))
                )
                  ? '!bg-[#15803D] hover:!bg-[#15803D] !text-white'
                  : 'hover:!bg-white/10',
              )"
              @click="item.subItems && item.subItems.length > 0 && !isCollapsed ? toggleExpand(item.name) : null"
            >
              <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'gap-3'">
                <div class="size-8 flex justify-center items-center">
                  <Icon
                    :name="item.icon"
                    class="text-[20px] text-white"
                    :class="item.link && item.link !== '#' && route.path === item.link ? 'text-white' : 'text-shade-6'"
                  />
                </div>
                <p
                  v-if="!isCollapsed"
                  class="font-semibold text-sm text-white"
                  :class="item.link && item.link !== '#'"
                >
                  {{ item.name }}
                </p>
              </div>
              <Icon
                v-if="!isCollapsed && item.subItems && item.subItems.length > 0"
                name="tabler-chevron-down"
                class="text-[16px] transition-all duration-200"
                :class="{
                  'rotate-180': isExpanded(item.name),
                  'rotate-0': !isExpanded(item.name),
                  'opacity-100': item.subItems && item.subItems.length > 0,
                  'opacity-0 group-hover:opacity-100': !item.subItems || item.subItems.length === 0,
                  'text-white': item.link && item.link !== '#' && route.path === item.link,
                  'text-shade-9': !(item.link && item.link !== '#' && route.path === item.link),
                }"
              />
            </component>

            <!-- Sub menu items with animation - hide when collapsed -->
            <Transition
              v-if="!isCollapsed"
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
                    :key="subItem?.name"
                    :to="subItem?.link"
                    active-class="active-route"
                    class="flex p-2 px-4 font-medium border border-transparent relative text-sm group hover:bg-shade-2 rounded-lg cursor-pointer transition-all duration-150"
                  >
                    <div
                      :class="[index !== 0 ? 'h-[51px]' : 'h-[22px] !border-none']"
                      class="absolute z-10 -left-[16px] bottom-3 w-4 border-l-[1.5px] border-[#D8DBE4]"
                    />
                    <div class="absolute z-10 -left-[19px] bottom-3.5 w-2 h-2 rounded-full bg-[#D8DBE4]" />
                    <p class="text-[#485066] group-hover:text-[#0A1B39]">
                      {{ subItem?.name }}
                    </p>
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </Tooltip>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
h4,p{
  margin: 0;
  padding: 0;
}

/* Menu expand/collapse animations */
.menu-expand-enter-active,
.menu-expand-leave-active {
  transition: all 0.3s ease;
}

.menu-expand-enter-from,
.menu-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.menu-expand-enter-to,
.menu-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
