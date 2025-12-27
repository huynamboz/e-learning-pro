<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const highlights = [
  'Thực hành lái xe an toàn',
  'Phiên dịch viên có kinh nghiệm 10+ năm',
  'Hỗ trợ thi bằng lái xe',
]

const stats = [
  { label: 'Học viên đã tốt nghiệp', value: '2.500+', icon: 'solar:ranking-linear' },
  { label: 'Tỷ lệ đậu thi bằng', value: '95%', icon: 'solar:medal-star-bold' },
  { label: 'Giờ thực hành', value: '30h+', icon: 'solar:car-line-duotone' },
  { label: 'Xe tập lái', value: '15+ xe', icon: 'solar:car-front-line-duotone' },
]

const drivingCourses = [
  {
    key: 'basic',
    level: 'Cơ bản',
    title: 'Khoá học lái xe cơ bản',
    description: 'Học từ đầu các kỹ năng lái xe cơ bản, luật giao thông và an toàn khi tham gia giao thông.',
    duration: '8 tuần · 20 buổi học',
    outcomes: [
      'Nắm vững luật giao thông đường bộ',
      'Thành thạo các kỹ năng lái xe cơ bản',
      'Tự tin xử lý các tình huống giao thông thông thường',
    ],
    classes: [
      { key: 'basic-1', label: 'Lớp cơ bản · 1 học viên', href: '/courses?level=driving&sublevel=basic&class=basic-1', type: 'Học riêng' },
      { key: 'basic-4', label: 'Lớp cơ bản · 4 học viên', href: '/courses?level=driving&sublevel=basic&class=basic-4', type: 'Lớp nhóm' },
    ],
  },
  {
    key: 'advanced',
    level: 'Nâng cao',
    title: 'Khoá học lái xe nâng cao',
    description: 'Nâng cao kỹ năng lái xe, xử lý tình huống phức tạp và chuẩn bị thi bằng lái xe hạng B2, C.',
    duration: '10 tuần · 25 buổi học',
    outcomes: [
      'Xử lý thành thạo các tình huống khó',
      'Lái xe an toàn trên đường cao tốc',
      'Đậu kỳ thi sát hạch bằng lái xe',
    ],
    classes: [
      { key: 'advanced-1', label: 'Lớp nâng cao · 1 học viên', href: '/courses?level=driving&sublevel=advanced&class=advanced-1', type: 'Học riêng' },
      { key: 'advanced-6', label: 'Lớp nâng cao · 6 học viên', href: '/courses?level=driving&sublevel=advanced&class=advanced-6', type: 'Lớp nhóm' },
    ],
  },
]

const learningJourney = [
  {
    title: 'Lý thuyết & Luật giao thông · Tuần 1-2',
    description: 'Học lý thuyết về luật giao thông, biển báo, quy tắc an toàn và các tình huống giao thông cơ bản.',
  },
  {
    title: 'Thực hành cơ bản · Tuần 3-5',
    description: 'Làm quen với xe, tập các thao tác cơ bản: khởi động, dừng, đỗ, quay đầu, lùi xe.',
  },
  {
    title: 'Lái xe trên đường · Tuần 6-7',
    description: 'Thực hành lái xe trên đường thực tế, xử lý các tình huống giao thông phức tạp.',
  },
  {
    title: 'Ôn tập & Thi sát hạch · Tuần 8',
    description: 'Ôn tập toàn bộ kiến thức, luyện thi sát hạch và chuẩn bị thi bằng lái xe chính thức.',
  },
]

const benefits = [
  {
    title: 'Giáo trình chuẩn Bộ GTVT',
    description: 'Giáo trình được biên soạn theo tiêu chuẩn của Bộ Giao thông Vận tải, cập nhật mới nhất các quy định.',
    icon: 'solar:book-bookmark-bold',
  },
  {
    title: 'Xe tập lái đời mới',
    description: 'Đội ngũ xe tập lái đời mới, được bảo dưỡng thường xuyên, đảm bảo an toàn cho học viên.',
    icon: 'solar:car-front-line-duotone',
  },
  {
    title: 'Phiên dịch viên chuyên nghiệp',
    description: 'Đội ngũ phiên dịch viên có nhiều năm kinh nghiệm, tận tâm và kiên nhẫn với từng học viên.',
    icon: 'solar:user-id-bold',
  },
  {
    title: 'Hỗ trợ thi bằng lái',
    description: 'Hỗ trợ đăng ký thi, chuẩn bị hồ sơ và đồng hành cùng học viên trong suốt quá trình thi.',
    icon: 'solar:document-check-bold',
  },
]

const testimonials = [
  {
    name: 'Nguyễn Văn An · Sinh viên',
    quote: 'Khoá học giúp mình tự tin lái xe sau 8 tuần. Phiên dịch viên rất tận tâm, chỉ dẫn từng chi tiết nhỏ. Mình đã đậu thi bằng ngay lần đầu.',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    name: 'Trần Thị Bình · Nhân viên văn phòng',
    quote: 'Ban đầu mình rất sợ lái xe, nhưng nhờ sự kiên nhẫn của phiên dịch viên và phương pháp dạy khoa học, mình đã vượt qua nỗi sợ và lái xe tự tin.',
    avatar: 'https://i.pravatar.cc/100?img=23',
  },
]

const faqItems = [
  {
    question: 'Tôi chưa biết gì về lái xe, có học được không?',
    answer: 'Hoàn toàn được. Khoá học được thiết kế dành cho người mới bắt đầu, phiên dịch viên sẽ hướng dẫn từ những kiến thức cơ bản nhất.',
  },
  {
    question: 'Thời gian học có linh hoạt không?',
    answer: 'Có. Chúng tôi có nhiều ca học khác nhau: sáng, chiều, tối và cuối tuần để phù hợp với lịch trình của học viên.',
  },
  {
    question: 'Có bao gồm chi phí thi bằng lái không?',
    answer: 'Chi phí khoá học không bao gồm lệ phí thi bằng lái. Tuy nhiên, chúng tôi sẽ hỗ trợ đăng ký và chuẩn bị hồ sơ thi.',
  },
  {
    question: 'Nếu không đậu thi thì sao?',
    answer: 'Học viên được hỗ trợ học lại miễn phí các phần chưa đạt và được tư vấn để cải thiện kỹ năng trước khi thi lại.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
    <!-- Hero -->
    <section class="bg-gradient-to-b from-green-50/30 via-white to-white pt-16 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-green-600 mb-4 font-semibold">
            Khoá học lái xe · An toàn & Chuyên nghiệp
          </p>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance text-gray-900">
            Khoá học lái xe an toàn cho mọi người
          </h1>
          <p class="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Học lái xe từ cơ bản đến nâng cao với đội ngũ phiên dịch viên chuyên nghiệp, xe tập lái đời mới và hỗ trợ thi bằng lái xe.
          </p>
          <div class="flex flex-wrap gap-3 mb-10">
            <span
              v-for="tag in highlights"
              :key="tag"
              class="px-4 py-2 rounded-full border border-green-100 text-sm bg-green-50 text-green-700"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink
              to="#courses"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors shadow-lg"
            >
              Xem chương trình học
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 hover:border-green-300 transition-colors"
            >
              Đăng ký tư vấn
            </NuxtLink>
          </div>
        </div>
        <div class="relative">
          <div class="relative bg-white border border-green-100 rounded-3xl p-8 shadow-lg">
            <h3 class="text-2xl font-bold mb-6 text-gray-900">
              Bạn sẽ trải nghiệm
            </h3>
            <div class="space-y-4">
              <div v-for="(item, index) in learningJourney" :key="item.title" class="flex gap-4 items-start">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                    {{ index + 1 }}
                  </div>
                  <div v-if="index !== learningJourney.length - 1" class="w-px h-12 bg-green-200 mt-2" />
                </div>
                <div>
                  <p class="text-sm uppercase text-green-600 tracking-wide mb-1 font-semibold">
                    {{ item.title }}
                  </p>
                  <p class="text-sm text-gray-600 leading-relaxed">
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
          <div class="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
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
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest mb-4">
            Lộ trình chuyên nghiệp
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Từ người mới bắt đầu đến tự tin lái xe trong 8 tuần
          </h2>
          <div class="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Khoá học lái xe được thiết kế khoa học, giúp bạn nắm vững lý thuyết và thực hành thành thạo,
              tự tin tham gia giao thông và đậu kỳ thi sát hạch bằng lái xe.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Học lý thuyết với giáo trình chuẩn Bộ GTVT, cập nhật mới nhất</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Thực hành với xe tập lái đời mới, được bảo dưỡng thường xuyên</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Hỗ trợ đăng ký thi và chuẩn bị hồ sơ thi bằng lái xe</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="grid gap-6">
          <div class="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl p-8 shadow-lg">
            <p class="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">
              Ưu điểm nổi bật
            </p>
            <h3 class="text-2xl font-bold mb-4">
              Phiên dịch viên tận tâm · Xe đời mới · Hỗ trợ 24/7
            </h3>
            <p class="text-white/90 leading-relaxed">
              Đội ngũ phiên dịch viên có nhiều năm kinh nghiệm, kiên nhẫn và tận tâm. Xe tập lái được bảo dưỡng định kỳ,
              đảm bảo an toàn. Hỗ trợ học viên mọi lúc, mọi nơi.
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h4 class="text-xl font-semibold text-gray-900 mb-4">
              Lịch học linh hoạt
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Buổi sáng
                </p>
                <p class="font-semibold text-gray-900">
                  8h00 - 11h00
                </p>
                <p>Thứ 2 - 6</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Buổi chiều
                </p>
                <p class="font-semibold text-gray-900">
                  14h00 - 17h00
                </p>
                <p>Thứ 2 - 6</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Buổi tối
                </p>
                <p class="font-semibold text-gray-900">
                  18h00 - 21h00
                </p>
                <p>Thứ 2 - 6</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Cuối tuần
                </p>
                <p class="font-semibold text-gray-900">
                  8h00 - 17h00
                </p>
                <p>Thứ 7 - CN</p>
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
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest">
            Khoá học lái xe
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Chọn khoá học phù hợp với nhu cầu của bạn
          </h2>
          <p class="text-gray-600 text-lg">
            Từ người mới bắt đầu đến nâng cao kỹ năng – mỗi khoá học đều có phiên dịch viên riêng và lộ trình học tập cá nhân hoá.
          </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="course in drivingCourses"
            :key="course.key"
            class="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col"
          >
            <div class="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6">
              <p class="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">
                {{ course.level }}
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
                    <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
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
                    class="block p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-semibold text-gray-900 group-hover:text-green-700">
                          {{ classItem.label }}
                        </p>
                        <p class="text-xs uppercase tracking-wide text-gray-500">
                          {{ classItem.type }}
                        </p>
                      </div>
                      <Icon
                        name="solar:alt-arrow-right-line-duotone"
                        size="18"
                        class="text-gray-300 group-hover:text-green-600 transition-colors"
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
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest">
            Giá trị khác biệt
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Tại sao chọn chúng tôi?
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4"
          >
            <div class="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
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
            <p class="text-sm font-semibold text-green-600 uppercase tracking-widest">
              Feedback thực tế
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Học viên nói gì về khoá học?
            </h2>
            <p class="text-gray-600 mb-6 leading-relaxed">
              95% học viên đậu thi bằng lái xe ngay lần đầu tiên nhờ phương pháp dạy khoa học và sự tận tâm của đội ngũ phiên dịch viên.
            </p>
            <NuxtLink
              to="/testimonials"
              class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-green-400 hover:text-green-600 transition-colors"
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
    <section class="py-12 sm:py-16 bg-gray-900 text-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-8">
          <div>
            <p class="text-sm font-semibold text-green-400 uppercase tracking-widest">
              FAQ
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Giải đáp thắc mắc về khoá học lái xe
            </h2>
            <p class="text-white/70 leading-relaxed">
              Gửi câu hỏi cho chúng tôi nếu bạn cần tư vấn chi tiết hơn về khoá học, lịch học hay quy trình thi bằng lái xe.
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
        <div class="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình lái xe an toàn?
          </h2>
          <p class="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
            Đăng ký tư vấn miễn phí, làm bài test đánh giá và nhận lộ trình học tập cá nhân hoá chỉ trong 24h.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-6 py-4 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-colors shadow-lg"
            >
              Đặt lịch tư vấn 1:1
            </NuxtLink>
            <NuxtLink
              to="#courses"
              class="inline-flex items-center justify-center px-6 py-4 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Khám phá khoá học
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

