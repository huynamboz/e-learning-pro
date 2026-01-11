<script setup lang="ts">
import { NuxtLink } from '#components'
import { Tooltip } from 'ant-design-vue'
import { cn } from '~/lib/utils'
import SidebarProgressCard from './SidebarProgressCard.vue'

const { isCollapsed, toggleSidebar, menu } = useSidebar()
const { profile } = useAuth()
const expandedItems = ref(new Set())
const route = useRoute()

// Get menu items based on mode
const currentMenu = computed(() => {
  return menu.value
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

const isInLearningPage = computed(() => {
  return route.path.split('/learning/')[1] !== undefined
})

// Smart route matching function
function isActiveRoute(menuLink: string | undefined): boolean {
  if (!menuLink || menuLink === '#') {
    return false
  }

  const currentPath = route.path

  // Exact match routes (should match exactly, not as prefix)
  const exactMatchRoutes = ['/admin', '/my-course', '/learning', '/calendars', '/profile']

  if (exactMatchRoutes.includes(menuLink)) {
    // For exact match routes, check if path matches exactly
    // But allow sub-routes for /admin (e.g., /admin/courses should match /admin)
    if (menuLink === '/admin') {
      return currentPath === '/admin' || currentPath.startsWith('/admin/')
    }
    // For other exact match routes, check exact match or if it's a base path
    return currentPath === menuLink || currentPath.startsWith(`${menuLink}/`)
  }

  // For other routes, use startsWith matching
  return currentPath.startsWith(menuLink)
}

onMounted(() => {
  currentMenu.value.forEach((item) => {
    if (item.subItems && item.subItems.some(subItem => subItem.link === route.path)) {
      expandedItems.value.add(item.name)
    }
  })
})
</script>

<template>
  <div
    class="fixed bg-white top-0 left-0 border rounded-e-2xl border-[#E6E7EC] z-50 h-full transition-all duration-300 ease-in-out h-100vh overflow-y-auto scrollbar-hide"
     :class="isCollapsed ? 'w-[80px] px-4' : 'w-[280px] px-[18px]'"
  >
    <div class="py-6 flex flex-col h-full flex-1">
      <!-- Site logo and dark mode toggle -->
      <div class="flex items-center justify-center gap-3 mb-5 h-10">
        <NuxtLink v-if="!isCollapsed" class="flex gap-2" to="/">
          <img src="@/assets/images/logo.webp" alt="" class="h-10 w-10 object-contain">
          <div class="grid">
            <h4 class="font-extrabold text-[#0F172A] text-xs whitespace-nowrap">
              Phiên Dịch Viên Phan Tâm
            </h4>
            <p class="font-medium text-[#15803D] text-xs -mt-2 whitespace-nowrap">
              E-Learning Platform
            </p>
          </div>
        </NuxtLink>
        <Icon
          :name="isCollapsed ? 'lucide:sidebar-open' : 'lucide:sidebar-close'"
          class="text-2xl cursor-pointer hover:text-[#15803D] transition-colors"
          @click="toggleSidebar"
        />
      </div>

      <!-- Search bar - hide when collapsed -->
      <!-- <div v-if="!isCollapsed" class="relative my-5">
        <Icon
          name="solar-magnifer-line-duotone"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
        />
        <input
          type="text"
          :placeholder="$t('sidebar.search')"
          class="w-full pl-10 pr-4 py-3 bg-[#F5F6F8] border-0 rounded-xl text-sm placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-[#15803D] focus:outline-none transition-all"
        >
      </div> -->

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
                isActiveRoute(item.link)
                  ? '!bg-[#15803D] hover:!bg-[#15803D] !text-white'
                  : 'hover:!bg-shade-3',
              )"
              @click="item.subItems && item.subItems.length > 0 && !isCollapsed ? toggleExpand(item.name) : null"
            >
              <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'gap-3'">
                <div class="size-8 flex justify-center items-center">
                  <Icon
                    :name="item.icon"
                    class="text-[20px]"
                    :class="isActiveRoute(item.link) ? 'text-white' : 'text-shade-6'"
                  />
                </div>
                <p
                  v-if="!isCollapsed"
                  class="font-semibold text-sm"
                  :class="isActiveRoute(item.link) ? 'text-white' : 'text-[#0A1B39]'"
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
                  'text-white': isActiveRoute(item.link),
                  'text-shade-9': !isActiveRoute(item.link),
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
                    :key="subItem.name"
                    :to="subItem.link"
                    active-class="active-route"
                    class="flex p-2 px-4 font-medium border border-transparent relative text-sm group hover:bg-shade-2 rounded-lg cursor-pointer transition-all duration-150"
                  >
                    <div
                      :class="[index !== 0 ? 'h-[51px]' : 'h-[22px] !border-none']"
                      class="absolute z-10 -left-[16px] bottom-3 w-4 border-l-[1.5px] border-[#D8DBE4]"
                    />
                    <div class="absolute z-10 -left-[19px] bottom-3.5 w-2 h-2 rounded-full bg-[#D8DBE4]" />
                    <p class="text-[#485066] group-hover:text-[#0A1B39]">
                      {{ subItem.name }}
                    </p>
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </Tooltip>
        </li>
      </ul>
      <!-- Admin User Profile Section -->
      <div v-if="!isCollapsed" class="mt-auto p-3 bg-[#F5F6F8] border border-[#E6E7EC] rounded-2xl">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <a-avatar
              :size="40"
              :src="profile?.avatar"
              class="border-4 border-white shadow-sm"
            >
              {{ profile?.first_name?.charAt(0) }}
            </a-avatar>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#0A1B39] truncate">
              {{ profile?.first_name }} {{ profile?.last_name }}
            </p>
            <p class="text-xs text-[#83899F] truncate">
              {{ profile?.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Regular User Content -->
      <div v-if="!isCollapsed && isInLearningPage" class="space-y-4 mt-2">
        <SidebarProgressCard />
      </div>
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
