<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const highlights = [
  'Chuẩn hoá ngữ pháp B-level',
  'Workshop phản xạ thực chiến',
  'Giảng viên bản địa + mentor Việt',
]

const stats = [
  { label: 'Học viên đạt B1+', value: '1.250+', icon: 'solar:ranking-linear' },
  { label: 'Tỷ lệ đậu kỳ thi', value: '93%', icon: 'solar:medal-star-bold' },
  { label: 'Giờ coaching riêng', value: '24h+', icon: 'solar:chat-round-money-line-duotone' },
  { label: 'Dự án thực tế', value: '08 projects', icon: 'solar:document-text-line-duotone' },
]

const intermediateCourses = [
  {
    key: 'B1',
    level: 'B1',
    title: 'Professional Italian B1',
    description: 'Phát triển kỹ năng giao tiếp trong môi trường học thuật và công việc, học cách trình bày quan điểm và viết email chuyên nghiệp.',
    duration: '12 tuần · 36 buổi học',
    outcomes: [
      'Chủ động mô tả kinh nghiệm, ước mơ, mục tiêu',
      'Trình bày quan điểm rõ ràng với cấu trúc logic',
      'Viết email/essay 250 từ với ngữ pháp chính xác',
    ],
    classes: [
      { key: 'B1-1', label: 'Lớp B1 · 1 học viên', href: '/courses?level=intermediate&sublevel=B1&class=B1-1', type: 'Executive coaching' },
      { key: 'B1-4', label: 'Lớp B1 · 4 học viên', href: '/courses?level=intermediate&sublevel=B1&class=B1-4', type: 'Elite micro class' },
    ],
  },
  {
    key: 'B2',
    level: 'B2',
    title: 'Impact Italian B2',
    description: 'Hoàn thiện khả năng tranh luận, xử lý tình huống phức tạp và nghe hiểu nội dung chuyên môn chuẩn CEFR B2.',
    duration: '14 tuần · 40 buổi học',
    outcomes: [
      'Tranh luận, phản biện với cấu trúc rõ ràng',
      'Nghe hiểu podcast, talkshow tốc độ tự nhiên',
      'Viết báo cáo, proposal dạng dài với từ vựng chuyên ngành',
    ],
    classes: [
      { key: 'B2-1', label: 'Lớp B2 · 1 học viên', href: '/courses?level=intermediate&sublevel=B2&class=B2-1', type: 'Mentor 1:1' },
      { key: 'B2-6', label: 'Lớp B2 · 6 học viên', href: '/courses?level=intermediate&sublevel=B2&class=B2-6', type: 'Small cohort' },
    ],
  },
]

const learningJourney = [
  {
    title: 'Phân tích lỗ hổng · Tuần 1-2',
    description: 'Mock test chuẩn CEFR, phân tích điểm yếu phát âm, ngữ pháp, kỹ năng viết. Thiết kế KPI cá nhân.',
  },
  {
    title: 'Tăng tốc kỹ năng · Tuần 3-6',
    description: 'Shadowing với audio bản ngữ, workshop viết academic, luyện phản xạ tranh luận tình huống thực tế.',
  },
  {
    title: 'Dự án thực chiến · Tuần 7-10',
    description: 'Xử lý case-study: pitching dự án, phỏng vấn, thuyết trình. Mentor sửa bài ghi hình.',
  },
  {
    title: 'Ôn thi & chứng nhận · Tuần 11-12',
    description: 'Thi thử 02 lần, coaching riêng từng kỹ năng, hướng dẫn đăng ký kỳ thi CELI/CILS.',
  },
]


const benefits = [
  {
    title: 'Curriculum chuẩn CEFR B-level',
    description: 'Giáo trình độc quyền kết hợp tài liệu CELI, CILS và đề thi thực tế trong 3 năm gần nhất.',
    icon: 'solar:book-bookmark-bold',
  },
  {
    title: 'Coaching giao tiếp chuyên ngành',
    description: 'Tùy chọn module Hospitality, Marketing, Business để luyện theo mục tiêu sự nghiệp.',
    icon: 'solar:case-line-duotone',
  },
  {
    title: 'AI Performance Tracker',
    description: 'Theo dõi tiến bộ từng kỹ năng, đề xuất bài tập tự học thông minh mỗi ngày.',
    icon: 'ph:cpu-duotone',
  },
  {
    title: 'Mentor đồng hành 24/7',
    description: 'Mentor Việt hỗ trợ giải đáp, sửa bài viết và nhắc lịch học qua Discord/Telegram.',
    icon: 'solar:chat-round-dots-line-duotone',
  },
]

const testimonials = [
  {
    name: 'Phạm Minh Thư · Marketing Manager',
    quote: 'Lộ trình B1 giúp mình trình bày ý tưởng với đối tác Ý tự tin hơn hẳn. Thích nhất là phần workshop phản biện cùng mentor.',
    avatar: 'https://i.pravatar.cc/100?img=47',
  },
  {
    name: 'Hoàng Tùng Lâm · Du học sinh Ý',
    quote: 'Thi CILS B2 vượt target nhờ các buổi mock test và feedback chi tiết. Thầy cô sửa từng câu chữ và body language khi thuyết trình.',
    avatar: 'https://i.pravatar.cc/100?img=18',
  },
]

const faqItems = [
  {
    question: 'Không có chứng chỉ A2 có học được không?',
    answer: 'Nếu bạn đã từng học ít nhất 200 giờ tiếng Ý hoặc có bằng chứng khả năng giao tiếp cơ bản, chúng tôi sẽ tổ chức placement test để sắp lớp phù hợp.',
  },
  {
    question: 'Khóa học có bao gồm luyện thi B1/B2 không?',
    answer: 'Có. Trong 4 tuần cuối, học viên được luyện đề hoàn chỉnh, chấm điểm theo rubric chính thức và hướng dẫn đăng ký kỳ thi sắp tới.',
  },
  {
    question: 'Có hỗ trợ tìm việc hay du học không?',
    answer: 'Đối với học viên hoàn thành B2 với điểm speaking > 80, chúng tôi có network mentor hỗ trợ chuẩn bị phỏng vấn và hồ sơ du học.',
  },
  {
    question: 'Nếu bỏ lỡ buổi học thì sao?',
    answer: 'Lớp 1:1 được học bù tối đa 4 buổi/khoá. Lớp nhóm sẽ có bản ghi hình và mentor phụ đạo lại nội dung quan trọng.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
    <!-- Hero -->
    <section class="bg-gradient-to-b from-indigo-900 to-slate-900 text-white pt-16 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-white/70 mb-4">
            Level B1 · B2 · CEFR aligned
          </p>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            Khoá học trung cấp chinh phục tiếng Ý học thuật & công việc
          </h1>
          <p class="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
            Luyện nói - nghe - viết nâng cao, xử lý các buổi thuyết trình, phản biện và thi chứng chỉ B1/B2
            với hệ thống bài tập thực chiến và mentor đồng hành.
          </p>
          <div class="flex flex-wrap gap-3 mb-10">
            <span
              v-for="tag in highlights"
              :key="tag"
              class="px-4 py-2 rounded-full border border-white/30 text-sm bg-white/10 backdrop-blur"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink
              to="#courses"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 bg-white text-indigo-900 font-semibold rounded-full hover:bg-slate-100 transition-colors shadow-lg"
            >
              Xem chương trình B-level
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Gặp mentor lộ trình
            </NuxtLink>
          </div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-2xl" />
          <div class="relative bg-white/10 border border-white/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <h3 class="text-2xl font-bold mb-6">
              Bạn sẽ trải nghiệm
            </h3>
            <div class="space-y-4">
              <div v-for="(item, index) in learningJourney" :key="item.title" class="flex gap-4 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                    {{ index + 1 }}
                  </div>
                  <div v-if="index !== learningJourney.length - 1" class="w-px h-12 bg-white/30 mt-2" />
                </div>
                <div>
                  <p class="text-sm uppercase text-white/70 tracking-wide mb-1">
                    {{ item.title }}
                  </p>
                  <p class="text-sm text-white/80 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
        >
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Icon :name="stat.icon" size="22" />
          </div>
          <p class="text-2xl font-bold text-gray-900">
            {{ stat.value }}
          </p>
          <p class="text-gray-500 text-sm">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </section>

    <!-- Overview -->
    <section id="overview" class="py-12 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <p class="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-4">
            Lộ trình chuyên sâu
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Từ vững nền A2 tới tự tin B1/B2 trong 12 tuần
          </h2>
          <div class="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Khoá học trung cấp tập trung khai thác kỹ năng tư duy bằng tiếng Ý, giúp bạn
              trình bày ý tưởng logic và phản biện đa chiều, song song chuẩn bị cho kỳ thi chứng chỉ quốc tế.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-indigo-600 mt-1" />
                <span>600+ collocations & idioms thường dùng trong học thuật và business</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-indigo-600 mt-1" />
                <span>8 dự án mô phỏng meeting thực tế với feedback bằng video</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-indigo-600 mt-1" />
                <span>2 kỳ mock test full format CELI/CILS đi kèm điểm số chi tiết</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="grid gap-6">
          <div class="bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-2xl p-8 shadow-lg">
            <p class="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">
              Workshop chuyên đề
            </p>
            <h3 class="text-2xl font-bold mb-4">
              Debate Lab · Business Pitch · Academic Writing
            </h3>
            <p class="text-white/90 leading-relaxed">
              Mỗi tháng có 3 workshop invite-only cùng chuyên gia Ý. Học viên được chỉnh body language,
              rhythm nói, cách xử lý câu hỏi khó và storytelling bằng tiếng Ý.
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h4 class="text-xl font-semibold text-gray-900 mb-4">
              Lịch học linh hoạt
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Buổi tối
                </p>
                <p class="font-semibold text-gray-900">
                  19h00 - 21h30
                </p>
                <p>Thứ 2 - 4 - 6</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Cuối tuần
                </p>
                <p class="font-semibold text-gray-900">
                  8h30 - 11h
                </p>
                <p>Thứ 7 - Chủ nhật</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Hình thức
                </p>
                <p class="font-semibold text-gray-900">
                  Hybrid
                </p>
                <p>Zoom + Offline meet-up</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Coaching
                </p>
                <p class="font-semibold text-gray-900">
                  1 buổi/tuần
                </p>
                <p>Feedback 1:1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Courses -->
    <section id="courses" class="py-12 sm:py-16 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <p class="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
            B1 · B2 Programs
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Lộ trình trung cấp phù hợp từng mục tiêu
          </h2>
          <p class="text-gray-600 text-lg">
            Từ học thuật, nghề nghiệp đến chuẩn bị du học – mỗi khoá học đều có mentor riêng và hệ thống bài tập chuyên sâu.
          </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="course in intermediateCourses"
            :key="course.key"
            class="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col"
          >
            <div class="bg-gradient-to-r from-indigo-600 to-violet-500 text-white p-6">
              <p class="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">
                Level {{ course.level }}
              </p>
              <h3 class="text-2xl font-bold mb-2">
                {{ course.title }}
              </h3>
              <p class="text-white/80">
                {{ course.description }}
              </p>
              <p class="mt-4 font-semibold text-white">
                ⏱ {{ course.duration }}
              </p>
            </div>
            <div class="p-6 sm:p-8 flex-1 flex flex-col gap-6">
              <div>
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Bạn sẽ đạt được
                </h4>
                <ul class="space-y-2 text-gray-600">
                  <li v-for="outcome in course.outcomes" :key="outcome" class="flex items-start gap-2">
                    <Icon name="solar:check-circle-bold" class="text-indigo-500 mt-1" />
                    <span>{{ outcome }}</span>
                  </li>
                </ul>
              </div>
              <div class="border-t border-dashed border-gray-200 pt-6">
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Chọn hình thức học
                </h4>
                <div class="space-y-3">
                  <NuxtLink
                    v-for="classItem in course.classes"
                    :key="classItem.key"
                    :to="classItem.href"
                    class="block p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-semibold text-gray-900 group-hover:text-indigo-700">
                          {{ classItem.label }}
                        </p>
                        <p class="text-xs uppercase tracking-wide text-gray-500">
                          {{ classItem.type }}
                        </p>
                      </div>
                      <Icon
                        name="solar:alt-arrow-right-line-duotone"
                        size="18"
                        class="text-gray-300 group-hover:text-indigo-600 transition-colors"
                      />
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section class="py-12 sm:py-16 bg-slate-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <p class="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
            Giá trị khác biệt
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Luôn có đội ngũ hỗ trợ phía sau bạn
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4"
          >
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
              <Icon :name="benefit.icon" size="26" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                {{ benefit.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed">
                {{ benefit.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p class="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
              Feedback thực tế
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Học viên nói gì về level trung cấp?
            </h2>
            <p class="text-gray-600 mb-6 leading-relaxed">
              9/10 học viên tiếp tục học lên B2 sau khi hoàn thành B1 tại trung tâm nhờ trải nghiệm học tập cá nhân hóa và cộng đồng hỗ trợ.
            </p>
            <NuxtLink
              to="/testimonials"
              class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              Xem thêm review
              <Icon name="solar:arrow-right-up-linear" size="18" />
            </NuxtLink>
          </div>
          <div class="space-y-6">
            <div
              v-for="review in testimonials"
              :key="review.name"
              class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div class="flex items-center gap-4 mb-4">
                <img :src="review.avatar" alt="" class="w-12 h-12 rounded-full object-cover">
                <div>
                  <p class="font-semibold text-gray-900">
                    {{ review.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    ⭐️⭐️⭐️⭐️⭐️
                  </p>
                </div>
              </div>
              <p class="text-gray-600 leading-relaxed">
                "{{ review.quote }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-12 sm:py-16 bg-indigo-950 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-8">
          <div>
            <p class="text-sm font-semibold text-indigo-200 uppercase tracking-widest">
              FAQ
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Giải đáp thắc mắc về khoá trung cấp
            </h2>
            <p class="text-white/70 leading-relaxed">
              Gửi câu hỏi cho chúng tôi nếu bạn cần tư vấn chi tiết hơn về chứng chỉ, visa hay định hướng nghề nghiệp.
            </p>
          </div>
          <div class="space-y-4">
            <details
              v-for="faq in faqItems"
              :key="faq.question"
              class="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <summary class="cursor-pointer text-lg font-semibold mb-2 text-white">
                {{ faq.question }}
              </summary>
              <p class="text-white/80 leading-relaxed">
                {{ faq.answer }}
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-12 sm:py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-gradient-to-r from-indigo-700 to-violet-600 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Chạm mốc B1/B2 nhanh hơn với mentor đồng hành
          </h2>
          <p class="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
            Đăng ký tư vấn miễn phí, làm placement test và nhận kế hoạch học tập cá nhân hoá chỉ trong 24h.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-6 py-4 bg-white text-indigo-700 font-semibold rounded-full hover:bg-slate-100 transition-colors shadow-lg"
            >
              Đặt lịch tư vấn 1:1
            </NuxtLink>
            <NuxtLink
              to="#courses"
              class="inline-flex items-center justify-center px-6 py-4 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Khám phá khoá trung cấp
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

