<script setup lang="ts">
import { NuxtLink } from '#components'
import { Tooltip } from 'ant-design-vue'
import { cn } from '~/lib/utils'

const { isCollapsed, toggleSidebar, menu } = useSidebar()
const { user } = useAuth()
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
    <div class="py-6 flex flex-col h-full">
      <!-- Site logo and dark mode toggle -->
      <div class="flex items-center justify-center gap-3 mb-5 h-10">
        <NuxtLink v-if="!isCollapsed" class="flex gap-2" to="'/'">
          <img src="@/assets/images/logo.webp" alt="" class="h-10 w-10 object-contain">
          <div class="grid">
            <h4 class="font-extrabold text-[#0F172A] text-base whitespace-nowrap">
              PHAN THI TAM
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
      <div v-if="!isCollapsed" class="relative my-5">
        <Icon
          name="solar-magnifer-line-duotone"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
        />
        <input
          type="text"
          :placeholder="$t('sidebar.search')"
          class="w-full pl-10 pr-4 py-3 bg-[#F5F6F8] border-0 rounded-xl text-sm placeholder-gray-400 placeholder:text-sm focus:ring-2 focus:ring-[#15803D] focus:outline-none transition-all"
        >
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
                  : 'hover:!bg-shade-3',
              )"
              @click="item.subItems && item.subItems.length > 0 && !isCollapsed ? toggleExpand(item.name) : null"
            >
              <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'gap-3'">
                <div class="size-8 flex justify-center items-center">
                  <Icon
                    :name="item.icon"
                    class="text-[20px]"
                    :class="item.link && item.link !== '#' && route.path.includes(item.link) ? 'text-white' : 'text-shade-6'"
                  />
                </div>
                <p
                  v-if="!isCollapsed"
                  class="font-semibold text-sm"
                  :class="item.link && item.link !== '#' && route.path.includes(item.link) ? 'text-white' : 'text-[#0A1B39]'"
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
      <div v-if="!isCollapsed" class="mt-6 p-3 bg-[#F5F6F8] border border-[#E6E7EC] rounded-2xl">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <img
              :src="user?.avatar || '/profile.png'"
              :alt="user?.username"
              class="w-10 h-10 rounded-full"
            >
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#0A1B39] truncate">
              {{ user?.first_name }} {{ user?.last_name }}
            </p>
            <p class="text-xs text-[#83899F] truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Regular User Content -->
      <div v-if="!isCollapsed" class="space-y-4 mt-2">
        <div class="flex flex-col bg-[#F5F6F8] border border-[#E6E7EC] rounded-2xl p-2 items-center gap-3">
          <LayoutMenuDonutChart
            :percentage="80"
            :label="$t('sidebar.attendance')"
            value="4/5"
            color="#ef4444"
          />

          <LayoutMenuDonutChart
            :percentage="50"
            :label="$t('sidebar.completeCourse')"
            value="5/10"
            color="#22c55e"
          />
          <p class="text-[14px] text-[#83899F] text-center mb-4 leading-[17px]">
            {{ $t('sidebar.checkVideo') }}
          </p>

          <!-- Study Now Button -->
          <NuxtLink to="/learning" class="w-full bg-white border border-[#E6E7EC] rounded-xl py-2.5 px-4 shadow-sm text-center">
            <span class="text-[14px] font-medium text-[#0A1B39]">{{ $t('sidebar.studyNow') }}</span>
          </NuxtLink>
        </div>

        <NuxtLink to="#" class="bg-[#F5F6F8] border border-[#E6E7EC] rounded-2xl p-3 flex items-center gap-3">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <div class="w-7 h-7 relative">
              <svg class="w-full h-full" viewBox="0 0 28 28" fill="none">
                <path d="M11.29 9.8h13.91v15.4H11.29z" fill="#799AD6" />
                <path d="M2.8 4.2h15.4v15.4H2.8z" fill="#317BFF" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-[15px] text-[#0A1B39] leading-[20px]">
              {{ $t('sidebar.helpCenter') }}
            </h4>
            <p class="text-[14px] text-[#83899F] leading-[18px]">
              {{ $t('sidebar.helpCenterDesc') }}
            </p>
          </div>
          <Icon name="tabler-chevron-right" class="w-4 h-4 text-[#9CA0B2]" />
        </NuxtLink>
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
