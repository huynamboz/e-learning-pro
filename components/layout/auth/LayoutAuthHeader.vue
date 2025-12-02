<script setup lang="ts">
import { Button } from 'ant-design-vue'
import { useCourseApi } from '~/composables/api/useCourseApi'
import { useCartStore } from '~/stores/cart.store'

const listOfLinks = computed(() => [
  { name: 'Quiz', href: '/#quiz' },
  { name: 'Video', href: '/#video' },
  { name: 'Tài nguyên', href: '/courses' },
])

const isMobileMenuOpen = ref(false)
const isDesktopCourseMenuOpen = ref(false)
const isMobileCourseMenuOpen = ref(false)
const hoverLevelKey = ref<string | null>(null)
const hoverCourseKey = ref<string | null>(null)
const openMobileLevelKey = ref<string | null>(null)

// API service
const courseApi = useCourseApi()

// Load hierarchical courses from API
const hierarchicalData = ref<any>(null)
const loadingCourses = ref(false)

// Level configuration
const levelConfig = {
  basic: {
    label: 'Cơ bản',
    href: '/basic-level',
    summary: 'Xây nền tảng tiếng Ý với giáo trình chuẩn CEFR.',
  },
  intermediate: {
    label: 'Trung cấp',
    href: '/middle-level',
    summary: 'Hoàn thiện kỹ năng nghe - nói - viết học thuật.',
  },
  advanced: {
    label: 'Nâng cao',
    href: '/high-level',
    summary: 'Chinh phục chứng chỉ C-level & dự án chuyên sâu.',
  },
  driving_theory: {
    label: 'Lý thuyết lái xe',
    href: '/driving-level',
    summary: 'Học lý thuyết lái xe với giáo trình chuẩn.',
  },
}

// Transform API data to menu structure
const courseMenu = computed(() => {
  if (!hierarchicalData.value) {
    return []
  }

  const levels = ['basic', 'intermediate', 'advanced', 'driving_theory'] as const
  const menu: any[] = []

  levels.forEach((levelKey) => {
    const config = levelConfig[levelKey]
    const courses = hierarchicalData.value[levelKey] || []

    if (courses.length > 0 || levelKey === 'driving_theory') {
      // If only 1 course AND it's driving_theory, parent menu links directly to that course (no submenu)
      if (courses.length === 1 && levelKey === 'driving_theory') {
        const course = courses[0]
        // Determine href based on level
        let courseHref = config.href
        if (course.course_sub_level) {
          courseHref = `${config.href}#${course.course_sub_level.toLowerCase()}`
        }
        else {
          // If no sub_level, link to course detail
          courseHref = `/courses/${course.id}`
        }

        menu.push({
          key: levelKey,
          label: config.label, // Always use level label
          href: courseHref, // Link directly to the single course
          summary: course.short_description || config.summary,
          courses: [], // Empty courses array means no submenu
          isDirectLink: true, // Flag to indicate this is a direct link
        })
      }
      else if (courses.length > 0) {
        // Multiple courses - show submenu
        const transformedCourses = courses.map((course: any) => {
          // Determine href based on level
          let courseHref = config.href
          if (course.course_sub_level) {
            courseHref = `${config.href}#${course.course_sub_level.toLowerCase()}`
          }
          else {
            courseHref = `/courses/${course.id}`
          }

          // Transform classrooms to classes
          const classes = course.classrooms.map((classroom: any) => ({
            key: classroom.id,
            label: classroom.title,
            href: `/courses/${course.id}/classrooms/${classroom.id}`,
          }))

          return {
            key: course.id,
            label: course.title,
            href: courseHref,
            description: course.short_description,
            classes,
          }
        })

        menu.push({
          key: levelKey,
          label: config.label, // Always use level label
          href: config.href,
          summary: config.summary,
          courses: transformedCourses,
          isDirectLink: false,
        })
      }
      else if (levelKey === 'driving_theory' && courses.length === 0) {
        // Empty driving_theory - show as direct link to level page
        menu.push({
          key: levelKey,
          label: config.label, // Always use level label
          href: config.href,
          summary: config.summary,
          courses: [],
          isDirectLink: true,
        })
      }
    }
  })

  return menu
})

const openMobileCourseKeys = ref<Record<string, string | null>>({})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function toggleMobileCourseMenu() {
  isMobileCourseMenuOpen.value = !isMobileCourseMenuOpen.value
  if (!isMobileCourseMenuOpen.value) {
    resetMobileMenuState()
  }
}

function resetMobileMenuState() {
  openMobileLevelKey.value = null
  openMobileCourseKeys.value = {}
}

function toggleMobileLevel(levelKey: string) {
  openMobileLevelKey.value = openMobileLevelKey.value === levelKey ? null : levelKey
  openMobileCourseKeys.value = {
    ...openMobileCourseKeys.value,
    [levelKey]: null,
  }
}

function toggleMobileCourse(levelKey: string, courseKey: string) {
  const current = openMobileCourseKeys.value[levelKey]
  openMobileCourseKeys.value = {
    ...openMobileCourseKeys.value,
    [levelKey]: current === courseKey ? null : courseKey,
  }
}

function handleDesktopMenuEnter() {
  isDesktopCourseMenuOpen.value = true
}

function handleDesktopMenuLeave() {
  isDesktopCourseMenuOpen.value = false
  hoverLevelKey.value = null
  hoverCourseKey.value = null
}

function handleLevelHover(levelKey: string) {
  hoverLevelKey.value = levelKey
  hoverCourseKey.value = null
}

function handleCourseHover(courseKey: string) {
  hoverCourseKey.value = courseKey
}

// Check if user is logged in
const { isLoggedIn } = useAuth()

// Cart store
const cartStore = useCartStore()

// Load hierarchical courses
async function loadHierarchicalCourses() {
  try {
    loadingCourses.value = true
    const data = await courseApi.getCoursesHierarchical()
    hierarchicalData.value = data
  }
  catch (error) {
    console.error('Error loading hierarchical courses:', error)
    // Fallback to empty data
    hierarchicalData.value = {
      basic: [],
      intermediate: [],
      advanced: [],
      driving_theory: [],
    }
  }
  finally {
    loadingCourses.value = false
  }
}

// Load cart and courses on mount
onMounted(() => {
  cartStore.loadCart()
  loadHierarchicalCourses()
})

// Watch for changes in courseMenu to update initialCourseState
watch(courseMenu, (newMenu) => {
  const newState: Record<string, string | null> = {}
  newMenu.forEach((level) => {
    newState[level.key] = null
  })
  openMobileCourseKeys.value = newState
}, { immediate: true })
</script>

<template>
  <header
    class="border-b bg-white shadow-[0_0_20px_0_#0F306A0D] sticky top-0 z-50 left-0"
  >
    <div class="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8">
      <!-- Logo and Mobile Menu Button -->
      <div class="flex items-center justify-between w-full lg:w-auto">
        <div class="flex items-center h-16 lg:h-[76px]">
          <NuxtLink to="/" class="flex-shrink-0">
            <img src="@/assets/images/logo.webp" alt="PHAN THI TAM Logo" class="w-10 h-10 sm:w-12 sm:h-12">
          </NuxtLink>
          <!-- Brand name -->
          <div class="ml-3">
            <div class="text-lg font-bold">
              <span class="text-red-600">PHAN THI TAM</span>
            </div>
            <div class="text-xs text-green-600 font-medium">
              {{ $t('layoutAuthHeader.brand.tagline') }}
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" :aria-label="$t('layoutAuthHeader.mobile.toggleMenu')"
          @click="toggleMobileMenu"
        >
          <Icon
            :name="isMobileMenuOpen ? 'solar:close-square-outline' : 'solar:hamburger-menu-outline'"
            size="24"
            class="text-gray-700 dark:text-gray-300"
          />
        </button>
      </div>

      <!-- Desktop Navigation - Different for logged in users -->
      <nav class="hidden lg:flex items-center space-x-8">
        <!-- Giới thiệu Link -->
        <NuxtLink
          to="#instructor"
          class="flex items-center group !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors"
        >
          Giới thiệu
          <Icon
            name="solar:alt-arrow-right-line-duotone"
            size="18"
            class="text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
          />
        </NuxtLink>

        <!-- Course Dropdown Menu -->
        <div
          class="relative course-menu-container"
          @mouseenter="handleDesktopMenuEnter"
          @mouseleave="handleDesktopMenuLeave"
        >
          <button
            class="flex items-center group cursor-pointer !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors"
            type="button"
          >
            <span>Khoá học</span>
            <Icon
              name="solar:alt-arrow-down-line-duotone"
              size="18"
              class="text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
              :class="{ 'rotate-180': isDesktopCourseMenuOpen }"
            />
          </button>
          <!-- Dropdown Menu -->
          <div
            v-show="isDesktopCourseMenuOpen"
            class="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
          >
            <div
              v-for="level in courseMenu"
              :key="level.key"
              class="relative group/level"
              @mouseenter="level.courses && level.courses.length > 0 ? handleLevelHover(level.key) : null"
            >
              <!-- Direct link (no submenu) - for single course or empty level -->
              <template v-if="!level.courses || level.courses.length === 0 || level.isDirectLink">
                <NuxtLink
                  :to="level.href"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#16A34A]"
                  @click="isDesktopCourseMenuOpen = false"
                >
                  {{ level.label }}
                </NuxtLink>
              </template>
              <!-- Submenu: Courses -->
              <template v-else>
                <div class="relative course-level-item">
                  <div class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#16A34A]">
                    <span>{{ level.label }}</span>
                    <Icon name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
                  </div>
                </div>
                <!-- Submenu: Courses -->
                <div
                  v-show="hoverLevelKey === level.key"
                  class="absolute left-full top-0 course-submenu bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50"
                  style="margin-left: 4px;"
                >
                  <div
                    v-for="course in level.courses"
                    :key="course.key"
                    class="relative group/course course-item"
                    @mouseenter="handleCourseHover(course.key)"
                  >
                    <div class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#16A34A]">
                      <span>{{ course.label }}</span>
                      <Icon v-if="course.classes && course.classes.length" name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
                    </div>
                    <!-- Submenu: Classes -->
                    <div
                      v-if="course.classes && course.classes.length && hoverCourseKey === course.key"
                      class="absolute left-full top-0 course-submenu bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50"
                      style="margin-left: 4px;"
                    >
                      <NuxtLink
                        v-for="classItem in course.classes"
                        :key="classItem.key"
                        :to="classItem.href"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#16A34A]"
                        @click="isDesktopCourseMenuOpen = false"
                      >
                        {{ classItem.label }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Other Links -->
        <NuxtLink
          v-for="value in listOfLinks" :key="value.name" :to="value.href"
          class="flex items-center group !text-[#181D26] dark:text-gray-300 hover:text-[#16A34A] transition-colors"
        >
          {{ value.name }}
          <Icon
            name="solar:alt-arrow-right-line-duotone"
            size="18"
            class="text-gray-600 ml-1.5 group-hover:text-[#16A34A] transition-colors"
          />
        </NuxtLink>
      </nav>

      <!-- Desktop Buttons - Different for logged in users -->
      <div v-if="!isLoggedIn" class="hidden lg:flex items-center space-x-2">
        <!-- Shopping Cart for non-logged in users -->
        <NuxtLink to="/checkout" class="relative size-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:bag-heart-bold" class="!text-gray-600" size="26" />
          <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>

        <NuxtLink to="/auth/register">
          <Button size="middle" type="primary" class="rounded-xl text-sm lg:text-base bg-[#16A34A]">
            {{ $t('layoutAuthHeader.buttons.signUpForFree') }}
          </Button>
        </NuxtLink>
        <NuxtLink to="/auth/login">
          <Button size="middle" type="ghost" class="rounded-xl text-sm lg:text-base">
            {{ $t('layoutAuthHeader.buttons.signIn') }}
          </Button>
        </NuxtLink>
      </div>

      <!-- Logged in user buttons -->
      <div v-else class="hidden lg:flex items-center space-x-2">
        <!-- Shopping Cart -->
        <NuxtLink to="/checkout" class="relative size-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:bag-heart-bold" class="!text-gray-600" size="26" />
          <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {{ cartStore.totalItems }}
          </span>
        </NuxtLink>

        <!-- Language selector -->
        <button class="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <Icon name="solar:globe-bold" size="20" class="!text-gray-600" />
        </button>

        <!-- User menu -->
        <div class="flex gap-2 py-2  items-center border rounded-full px-3 space-x-2">
          <button class="flex p-1 cursor-pointer hover:bg-gray-200 rounded transition-colors">
            <Icon name="solar:hamburger-menu-outline" size="20" class="text-gray-600" />
          </button>

          <BaseUserProfilePopup />
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-show="isMobileMenuOpen"
        class="lg:hidden bg-white border-t border-gray-200"
      >
        <div class="px-4 pt-2 pb-4 space-y-1">
          <!-- Mobile Navigation Links - Different for logged in users -->
          <nav v-if="!isLoggedIn" class="space-y-1">
            <!-- Giới thiệu Link -->
            <NuxtLink
              to="#instructor"
              class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>Giới thiệu</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>

            <!-- Course Menu (Mobile) -->
            <div class="space-y-1">
              <button
                class="w-full flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                @click="toggleMobileCourseMenu"
              >
                <span>Khoá học</span>
                <Icon
                  name="solar:alt-arrow-down-line-duotone"
                  size="18"
                  class="text-gray-400 transition-transform"
                  :class="{ 'rotate-180': isMobileCourseMenuOpen }"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 transform -translate-y-2"
                enter-to-class="opacity-100 transform translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 transform translate-y-0"
                leave-to-class="opacity-0 transform -translate-y-2"
              >
                <div v-show="isMobileCourseMenuOpen" class="pl-4 space-y-2">
                  <div
                    v-for="level in courseMenu"
                    :key="level.key"
                    class="rounded-lg border border-gray-100 bg-gray-50/80"
                  >
                    <!-- Direct link (no submenu) -->
                    <NuxtLink
                      v-if="!level.courses || level.courses.length === 0 || level.isDirectLink"
                      :to="level.href"
                      class="flex items-center justify-between py-3 px-2 text-sm font-semibold text-gray-900 hover:text-[#16A34A]"
                      @click="isMobileMenuOpen = false"
                    >
                      <div>
                        <p>{{ level.label }}</p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ level.summary }}
                        </p>
                      </div>
                      <Icon name="solar:alt-arrow-right-line-duotone" size="16" class="text-gray-400" />
                    </NuxtLink>
                    <!-- Submenu with courses -->
                    <button
                      v-else
                      class="w-full flex items-start justify-between py-3 px-2 text-left"
                      @click="toggleMobileLevel(level.key)"
                    >
                      <div>
                        <p class="text-sm font-semibold text-gray-900">
                          {{ level.label }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ level.summary }}
                        </p>
                      </div>
                      <Icon
                        name="solar:alt-arrow-down-line-duotone"
                        size="18"
                        class="text-gray-400 transition-transform"
                        :class="{ 'rotate-180': openMobileLevelKey === level.key }"
                      />
                    </button>

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 transform -translate-y-2"
                      enter-to-class="opacity-100 transform translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 transform translate-y-0"
                      leave-to-class="opacity-0 transform -translate-y-2"
                    >
                      <div
                        v-if="level.courses && level.courses.length"
                        v-show="openMobileLevelKey === level.key"
                        class="px-3 pb-3 space-y-2"
                      >
                        <div
                          v-for="course in level.courses"
                          :key="course.key"
                          class="rounded-md bg-white border border-gray-100 p-3"
                        >
                          <div
                            class="flex items-start justify-between cursor-pointer"
                            @click="toggleMobileCourse(level.key, course.key)"
                          >
                            <div>
                              <p class="text-sm font-semibold text-gray-900">
                                {{ course.label }}
                              </p>
                              <p class="text-xs text-gray-500 mt-1">
                                {{ course.description }}
                              </p>
                            </div>
                            <div class="flex items-center gap-2">
                              <NuxtLink
                                :to="course.href"
                                class="text-xs font-semibold text-[#16A34A]"
                                @click.stop="isMobileMenuOpen = false"
                              >
                                Chi tiết
                              </NuxtLink>
                              <Icon
                                name="solar:alt-arrow-down-linear"
                                size="16"
                                class="text-gray-400 transition-transform"
                                :class="{ 'rotate-180': openMobileCourseKeys[level.key] === course.key }"
                              />
                            </div>
                          </div>

                          <Transition
                            enter-active-class="transition duration-150 ease-out"
                            enter-from-class="opacity-0 -translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 -translate-y-1"
                          >
                            <div
                              v-show="openMobileCourseKeys[level.key] === course.key"
                              class="mt-2 pl-3 space-y-1 border-l border-dashed border-green-200"
                            >
                              <NuxtLink
                                v-for="classItem in course.classes"
                                :key="classItem.key"
                                :to="classItem.href"
                                class="flex items-center justify-between text-xs font-medium text-gray-700 hover:text-[#16A34A]"
                                @click="isMobileMenuOpen = false"
                              >
                                <span>{{ classItem.label }}</span>
                                <Icon name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
                              </NuxtLink>
                            </div>
                          </Transition>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Other Links -->
            <NuxtLink
              v-for="value in listOfLinks" :key="value.name" :to="value.href" class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ value.name }}</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>
          </nav>

          <!-- Logged in user mobile navigation (match desktop) -->
          <nav v-else class="space-y-1">
            <!-- Giới thiệu Link -->
            <NuxtLink
              to="#instructor"
              class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>Giới thiệu</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>

            <!-- Course Menu Links (Mobile) -->
            <div class="space-y-1">
              <button
                class="w-full flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                @click="toggleMobileCourseMenu"
              >
                <span>Khoá học</span>
                <Icon
                  name="solar:alt-arrow-down-line-duotone"
                  size="18"
                  class="text-gray-400 transition-transform"
                  :class="{ 'rotate-180': isMobileCourseMenuOpen }"
                />
              </button>
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 transform -translate-y-2"
                enter-to-class="opacity-100 transform translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 transform translate-y-0"
                leave-to-class="opacity-0 transform -translate-y-2"
              >
                <div v-show="isMobileCourseMenuOpen" class="pl-4 space-y-2">
                  <div
                    v-for="level in courseMenu"
                    :key="level.key"
                    class="rounded-lg border border-gray-100 bg-gray-50/80"
                  >
                    <!-- Direct link (no submenu) -->
                    <NuxtLink
                      v-if="!level.courses || level.courses.length === 0 || level.isDirectLink"
                      :to="level.href"
                      class="flex items-center justify-between py-3 px-2 text-sm font-semibold text-gray-900 hover:text-[#16A34A]"
                      @click="isMobileMenuOpen = false"
                    >
                      <div>
                        <p>{{ level.label }}</p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ level.summary }}
                        </p>
                      </div>
                      <Icon name="solar:alt-arrow-right-line-duotone" size="16" class="text-gray-400" />
                    </NuxtLink>
                    <!-- Submenu with courses -->
                    <button
                      v-else
                      class="w-full flex items-start justify-between py-3 px-2 text-left"
                      @click="toggleMobileLevel(level.key)"
                    >
                      <div>
                        <p class="text-sm font-semibold text-gray-900">
                          {{ level.label }}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ level.summary }}
                        </p>
                      </div>
                      <Icon
                        name="solar:alt-arrow-down-line-duotone"
                        size="18"
                        class="text-gray-400 transition-transform"
                        :class="{ 'rotate-180': openMobileLevelKey === level.key }"
                      />
                    </button>

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 transform -translate-y-2"
                      enter-to-class="opacity-100 transform translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 transform translate-y-0"
                      leave-to-class="opacity-0 transform -translate-y-2"
                    >
                      <div
                        v-if="level.courses && level.courses.length"
                        v-show="openMobileLevelKey === level.key"
                        class="px-3 pb-3 space-y-2"
                      >
                        <div
                          v-for="course in level.courses"
                          :key="course.key"
                          class="rounded-md bg-white border border-gray-100 p-3"
                        >
                          <div
                            class="flex items-start justify-between cursor-pointer"
                            @click="toggleMobileCourse(level.key, course.key)"
                          >
                            <div>
                              <p class="text-sm font-semibold text-gray-900">
                                {{ course.label }}
                              </p>
                              <p class="text-xs text-gray-500 mt-1">
                                {{ course.description }}
                              </p>
                            </div>
                            <div class="flex items-center gap-2">
                              <NuxtLink
                                :to="course.href"
                                class="text-xs font-semibold text-[#16A34A]"
                                @click.stop="isMobileMenuOpen = false"
                              >
                                Chi tiết
                              </NuxtLink>
                              <Icon
                                name="solar:alt-arrow-down-linear"
                                size="16"
                                class="text-gray-400 transition-transform"
                                :class="{ 'rotate-180': openMobileCourseKeys[level.key] === course.key }"
                              />
                            </div>
                          </div>

                          <Transition
                            enter-active-class="transition duration-150 ease-out"
                            enter-from-class="opacity-0 -translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 -translate-y-1"
                          >
                            <div
                              v-show="openMobileCourseKeys[level.key] === course.key"
                              class="mt-2 pl-3 space-y-1 border-l border-dashed border-green-200"
                            >
                              <NuxtLink
                                v-for="classItem in course.classes"
                                :key="classItem.key"
                                :to="classItem.href"
                                class="flex items-center justify-between text-xs font-medium text-gray-700 hover:text-[#16A34A]"
                                @click="isMobileMenuOpen = false"
                              >
                                <span>{{ classItem.label }}</span>
                                <Icon name="solar:alt-arrow-right-line-duotone" size="14" class="text-gray-400" />
                              </NuxtLink>
                            </div>
                          </Transition>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Other Links -->
            <NuxtLink
              v-for="value in listOfLinks" :key="value.name" :to="value.href"
              class="flex items-center justify-between py-3 px-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <span>{{ value.name }}</span>
              <Icon name="solar:alt-arrow-right-line-duotone" size="18" class="text-gray-400" />
            </NuxtLink>
          </nav>

          <!-- Mobile Buttons - Different for logged in users -->
          <div v-if="!isLoggedIn" class="pt-4 space-y-3 border-t border-gray-200">
            <!-- Shopping Cart for non-logged in users -->
            <NuxtLink
              to="/checkout" class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors relative"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:bag-heart-bold" size="30" class=" mr-2" />
              Giỏ hàng
              <span v-if="cartStore.totalItems > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>

            <NuxtLink to="/auth/register" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="primary" class="w-full rounded-xl text-base bg-[#16A34A]">
                {{ $t('layoutAuthHeader.buttons.signUpForFree') }}
              </Button>
            </NuxtLink>
            <NuxtLink to="/auth/login" class="block" @click="isMobileMenuOpen = false">
              <Button size="large" type="ghost" class="w-full rounded-xl text-base">
                {{ $t('layoutAuthHeader.buttons.signIn') }}
              </Button>
            </NuxtLink>
          </div>

          <!-- Logged in user mobile buttons -->
          <div v-else class="pt-4 space-y-3 border-t border-gray-200">
            <NuxtLink
              to="/checkout" class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors relative"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:bag-heart-bold" size="30" class=" mr-2" />
              Giỏ hàng
              <span v-if="cartStore.totalItems > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:globe-bold" size="20" class="mr-2" />
              {{ $t('layoutAuthHeader.buttons.language') }}
            </button>
            <button
              class="w-full flex items-center justify-center py-3 px-2 text-base font-medium text-gray-600 hover:text-[#16A34A] hover:bg-gray-50 rounded-md transition-colors"
              @click="isMobileMenuOpen = false"
            >
              <Icon name="solar:user-bold" size="20" class="mr-2" />
              {{ $t('layoutAuthHeader.navigation.profile') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.ant-btn {
  border-radius: 8px;
  color: #181D26;

}

.ant-btn-primary {
  background-color: #16A34A;
  color: #FFFFFF;
  border: 1px solid #16A34A;
}

.ant-btn-primary:hover {
  background-color: #15803d;
  border-color: #15803d;
}

.ant-btn-default {
  background-color: transparent;
  border: 1px solid #d1d5db;
}

.ant-btn-default:hover {
  border-color: #16A34A;
  color: #16A34A;
}

.ant-btn-ghost {
  background-color: transparent;
  border: 1px solid transparent;
}

.ant-btn-ghost:hover {
  background-color: #f3f4f6;
  color: #16A34A;
}

/* Mobile menu button animations */
.mobile-menu-button {
  transition: transform 0.2s ease;
}

.mobile-menu-button:active {
  transform: scale(0.95);
}

/* Course menu hover bridge */
.course-menu-container::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;
  background: transparent;
  z-index: 49;
}

/* Course submenu hover bridge (tạo bridge giữa item và submenu) */
.course-submenu::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 4px;
  height: 100%;
  background: transparent;
  z-index: 49;
}
</style>
