<script setup lang="ts">
import type { NewQuiz, NewQuizLevel } from '~/composables/api/useNewQuizApi'
import { useNewQuizApi } from '~/composables/api/useNewQuizApi'

// empty layout
definePageMeta({
  layout: 'empty',
})

useHead({
  title: 'Ngân hàng Quiz theo Level',
  meta: [
    {
      name: 'description',
      content: 'Khám phá các bài quiz theo từng level CEFR, luyện tập với giới hạn thời gian và chế độ chấm điểm tự động.',
    },
  ],
})

const { getLevels, getQuizzes } = useNewQuizApi()

const heroHighlights = [
  'Cấu trúc theo khung CEFR',
  'Giới hạn thời gian thông minh',
  'Tự động chấm điểm & lưu tiến độ',
]

const heroPatternSvg = computed(() => `
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" fill="none"/>
  <circle cx="10" cy="10" r="2" fill="#67C28E"/>
  <circle cx="80" cy="40" r="2" fill="#67C28E"/>
  <circle cx="140" cy="120" r="2" fill="#67C28E"/>
  <circle cx="30" cy="130" r="2" fill="#67C28E"/>
  <circle cx="120" cy="60" r="2" fill="#67C28E"/>
</svg>
`)

const heroBackgroundStyle = computed(() => ({
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(heroPatternSvg.value.trim())}")`,
  backgroundSize: '160px 160px',
}))

const insightCards = computed(() => {
  const totalLevel = levels.value.length
  const publishedQuizzes = quizzes.value.length
  const questionCount = quizzes.value.reduce((sum, quiz) => sum + quiz.total_questions, 0)

  return [
    { label: 'Level đang mở', value: totalLevel },
    { label: 'Quiz sẵn sàng', value: publishedQuizzes },
    { label: 'Câu hỏi luyện tập', value: questionCount },
  ]
})

const searchTerm = ref('')
const selectedLevel = ref<'all' | string>('all')
const loading = ref(true)
const errorMessage = ref('')

const levels = ref<NewQuizLevel[]>([])
const quizzes = ref<NewQuiz[]>([])

const levelFilters = computed(() => [
  { label: 'Tất cả level', value: 'all' },
  ...levels.value
    .filter(level => level.is_active)
    .sort((a, b) => a.order - b.order)
    .map(level => ({
      label: level.code,
      value: level.id,
    })),
])

const normalizedSearch = computed(() => searchTerm.value.trim().toLowerCase())

const levelSections = computed(() => {
  const map = new Map<string, NewQuiz[]>()

  const matchesSearch = (quiz: NewQuiz) => {
    if (!normalizedSearch.value)
      return true
    const target = `${quiz.title} ${quiz.description ?? ''} ${quiz.level_code} ${quiz.level_name}`.toLowerCase()
    return target.includes(normalizedSearch.value)
  }

  quizzes.value.forEach((quiz) => {
    if (selectedLevel.value !== 'all' && quiz.level !== selectedLevel.value)
      return
    if (!matchesSearch(quiz))
      return

    const current = map.get(quiz.level) ?? []
    current.push(quiz)
    map.set(quiz.level, current)
  })

  return levels.value
    .filter(level => level.is_active)
    .sort((a, b) => a.order - b.order)
    .map((level) => ({
      level,
      quizzes: (map.get(level.id) ?? []).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    }))
    .filter(section => section.quizzes.length > 0)
})

const hasResults = computed(() => levelSections.value.some(section => section.quizzes.length > 0))

async function loadQuizzData() {
  try {
    loading.value = true
    errorMessage.value = ''
    const [levelResponse, quizResponse] = await Promise.all([
      getLevels({ is_active: true, ordering: 'order,code' }),
      getQuizzes({ is_published: true, ordering: '-updated_at' }),
    ])

    levels.value = levelResponse.results
    quizzes.value = quizResponse.results
  }
  catch (error) {
    console.error(error)
    errorMessage.value = 'Không thể tải dữ liệu quiz. Vui lòng thử lại sau.'
  }
  finally {
    loading.value = false
  }
}

function formatTimeLimit(quiz: NewQuiz) {
  if (quiz.time_type === 'none' || !quiz.time_value || !quiz.time_unit)
    return 'Không giới hạn'

  const unit = quiz.time_unit === 'minute' ? 'phút' : 'giây'
  return `${quiz.time_value} ${unit}`
}

function formatRetake(quiz: NewQuiz) {
  if (!quiz.retake_limit || quiz.retake_limit <= 0)
    return 'Không giới hạn'
  return `${quiz.retake_limit} lần`
}

function formatUpdatedAt(date: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  }
  catch {
    return ''
  }
}

onMounted(() => {
  loadQuizzData()
})
</script>

<template>
  <div class="bg-slate-50 min-h-screen pb-24">
    <section class="relative overflow-hidden bg-white text-slate-900">
      <div class="hidden sm:block absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" :style="heroBackgroundStyle" />
      <div class="absolute top-10 -right-20 w-72 h-72 bg-slate-100 rounded-full blur-3xl" aria-hidden="true" />
      <div class="absolute -bottom-12 -left-10 w-60 h-60 bg-slate-200/70 rounded-3xl rotate-6" aria-hidden="true" />
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-6">
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Quiz Hub · CEFR Ready
            </p>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-balance text-slate-900">
              Tăng tốc kỹ năng với thư viện quiz phân tầng theo CEFR
            </h1>
            <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Mỗi level sở hữu bộ câu hỏi riêng giúp bạn luyện tập trọn vẹn: từ trắc nghiệm, viết cho tới essay.
              Theo dõi thời gian, lượt thi, điểm số để biết chính xác mình đã sẵn sàng lên level tiếp theo hay chưa.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <span
              v-for="highlight in heroHighlights"
              :key="highlight"
              class="px-4 py-2 text-sm rounded-full border border-slate-200 text-slate-700 bg-white"
            >
              {{ highlight }}
            </span>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="#level-list"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Bắt đầu khám phá
              <Icon name="mdi:arrow-right" class="text-base" />
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Nhận tư vấn cá nhân
            </NuxtLink>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">
                Học viên đang online
              </p>
              <p class="text-3xl font-semibold">
                128
              </p>
            </div>
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <Icon name="mdi:lightning-bolt" class="text-base text-slate-500" />
              Real-time
            </span>
          </div>
          <div class="mt-6 space-y-4">
            <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wide">
                  Mục tiêu hôm nay
                </p>
                <p class="text-lg font-semibold">
                  3 Quiz hoàn thành
                </p>
              </div>
              <span class="text-sm font-semibold text-slate-700">
                +1 so với hôm qua
              </span>
            </div>
            <div class="rounded-2xl border border-slate-100 p-4 space-y-3">
              <div class="flex justify-between text-xs text-slate-500 uppercase tracking-wide">
                <span>Tiến độ tuần</span>
                <span>72%</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-slate-900" style="width: 72%;" />
              </div>
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span>Thời gian trung bình</span>
                <span>18 phút/quiz</span>
              </div>
            </div>
            <div class="rounded-2xl border border-slate-100 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-900">
                  Level được truy cập nhiều nhất
                </p>
                <span class="text-xs text-slate-500">
                  7 ngày gần đây
                </span>
              </div>
              <div class="space-y-2 text-sm text-slate-600">
                <div class="flex items-center justify-between">
                  <span>A1 · Starter</span>
                  <span class="text-slate-700">45 lượt</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>B1 · Explorer</span>
                  <span class="text-slate-700">32 lượt</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>C1 · Mastery</span>
                  <span class="text-slate-700">18 lượt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="level-list" class="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div class="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div class="flex-1">
            <label for="quiz-search" class="sr-only">Tìm kiếm quiz</label>
            <div class="relative">
              <Icon name="mdi:magnify" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="quiz-search"
                v-model="searchTerm"
                type="text"
                placeholder="Tìm theo tên quiz, level hoặc mô tả"
                class="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900/20 focus:outline-none"
              >
            </div>
          </div>
          <button
            type="button"
            class="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="loadQuizzData"
          >
            Làm mới danh sách
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-1">
          <button
            v-for="filter in levelFilters"
            :key="filter.value"
            type="button"
            class="px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
            :class="selectedLevel === filter.value
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm shadow-slate-200'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            @click="selectedLevel = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 flex items-start gap-3">
        <Icon name="mdi:alert-circle" class="text-2xl text-red-500" />
        <div>
          <p class="font-semibold">
            Có lỗi xảy ra
          </p>
          <p class="text-sm">
            {{ errorMessage }}
          </p>
        </div>
      </div>

      <div v-else>
        <div v-if="loading" class="space-y-6">
          <div v-for="index in 3" :key="index" class="bg-white border border-slate-100 rounded-3xl p-6 animate-pulse">
            <div class="h-6 bg-slate-200 rounded w-1/3 mb-4" />
            <div class="h-4 bg-slate-200 rounded w-2/3 mb-6" />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="h-24 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="!hasResults" class="bg-white border border-slate-100 rounded-3xl p-10 text-center space-y-4">
            <Icon name="mdi:clipboard-text-off-outline" class="text-4xl text-slate-400 mx-auto" />
            <div>
              <p class="text-lg font-semibold text-slate-900">
                Không tìm thấy quiz phù hợp
              </p>
              <p class="text-sm text-slate-500">
                Điều chỉnh lại bộ lọc hoặc thử từ khóa khác để tiếp tục khám phá.
              </p>
            </div>
          </div>

          <div v-else class="space-y-12">
            <div
              v-for="section in levelSections"
              :key="section.level.id"
              class="space-y-6"
            >
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm font-semibold text-slate-500 uppercase">
                    {{ section.level.code }}
                  </p>
                  <h2 class="text-2xl font-semibold text-slate-900">
                    {{ section.level.name }}
                  </h2>
                  <p class="text-sm text-slate-500">
                    {{ section.level.description || 'Các bài quiz được thiết kế để củng cố nền tảng trước khi bước sang level tiếp theo.' }}
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Xem roadmap level
                  <Icon name="mdi:arrow-right" class="text-base text-slate-500" />
                </button>
              </div>

              <div class="space-y-3">
                <article
                  v-for="quiz in section.quizzes"
                  :key="quiz.id"
                  class="bg-white border border-slate-200/70 rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex flex-col gap-2 sm:flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Level {{ quiz.level_code }}
                      </span>
                      <span class="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5">
                        {{ quiz.total_questions }} câu
                      </span>
                      <span class="inline-flex items-center text-xs text-slate-500">
                        {{ formatTimeLimit(quiz) }} · {{ formatRetake(quiz) }}
                      </span>
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-slate-900">
                        {{ quiz.title }}
                      </h3>
                      <p class="text-sm text-slate-600 line-clamp-1">
                        {{ quiz.description || 'Quiz bao gồm câu hỏi trắc nghiệm, tự luận và bài tập thực hành.' }}
                      </p>
                    </div>
                    <p class="text-xs text-slate-500">
                      GV: {{ quiz.created_by_name }} · Cập nhật {{ formatUpdatedAt(quiz.updated_at) }}
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/quizz/${quiz.id}`"
                    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 shrink-0"
                  >
                    Bắt đầu
                    <Icon name="mdi:arrow-top-right" class="text-base" />
                  </NuxtLink>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
