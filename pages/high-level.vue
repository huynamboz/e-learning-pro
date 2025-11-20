<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const highlights = [
  'Masterclass C1/C2 chuẩn CEFR',
  'Giảng viên bản ngữ 15+ năm kinh nghiệm',
  'Coaching thuyết trình & nghiên cứu',
]

const stats = [
  { label: 'Tỷ lệ đạt C1/C2', value: '88%', icon: 'solar:trophy-bold' },
  { label: 'Thời lượng seminar', value: '60h+', icon: 'solar:microphone-2-line-duotone' },
  { label: 'Case-study chuyên sâu', value: '10+', icon: 'solar:clipboard-text-line-duotone' },
  { label: 'Mentor quốc tế', value: '12 mentors', icon: 'solar:earth-line-duotone' },
]

const advancedCourses = [
  {
    key: 'C1',
    level: 'C1',
    title: 'Strategic Italian C1',
    description: 'Làm chủ ngôn ngữ học thuật và nghề nghiệp, xử lý tài liệu phức tạp, thuyết trình chuyên sâu bằng tiếng Ý.',
    duration: '14 tuần · 42 buổi học',
    outcomes: [
      'Viết luận nghiên cứu 800+ từ với lập luận vững chắc',
      'Nghe hiểu 100% podcast, tin tức tốc độ bản ngữ',
      'Điều phối cuộc họp đa văn hoá, phản hồi nhanh',
    ],
    classes: [
      { key: 'C1-1', label: 'Lớp C1 · 1 học viên', href: '/courses?level=advanced&sublevel=C1&class=C1-1', type: 'Premier coaching' },
      { key: 'C1-5', label: 'Lớp C1 · 5 học viên', href: '/courses?level=advanced&sublevel=C1&class=C1-5', type: 'Master cohort' },
    ],
  },
  {
    key: 'C2',
    level: 'C2',
    title: 'Signature Italian C2',
    description: 'Chạm tới độ tinh tế của người bản xứ: xử lý nghiên cứu chuyên ngành, đàm phán cấp cao, viết báo cáo chiến lược.',
    duration: '16 tuần · 48 buổi học',
    outcomes: [
      'Biên tập tài liệu chuyên môn, chính sách, hợp đồng',
      'Đàm phán, thương thảo đa chiều với đối tác Ý',
      'Đạt band C2 trong kỳ thi CELI 5 / CILS C2',
    ],
    classes: [
      { key: 'C2-1', label: 'Lớp C2 · 1 học viên', href: '/courses?level=advanced&sublevel=C2&class=C2-1', type: 'Advisor 1:1' },
      { key: 'C2-lab', label: 'C2 Research Lab', href: '/courses?level=advanced&sublevel=C2&class=C2-lab', type: 'Project-based' },
    ],
  },
]

const learningJourney = [
  {
    title: 'Diagnostics & Goal Design',
    description: 'Đánh giá 360° từng kỹ năng, phỏng vấn mục tiêu nghề nghiệp, cá nhân hoá KPI theo kỳ thi hoặc dự án.',
  },
  {
    title: 'Deep Dive Seminar',
    description: 'Seminar phân tích văn bản triết học, chính trị, kinh tế; tranh biện chuyên sâu cùng giảng viên bản xứ.',
  },
  {
    title: 'Capstone Project',
    description: 'Thực hiện dự án cá nhân: whitepaper, podcast, keynote. Được mentor chỉnh sửa 1:1 từng phần.',
  },
  {
    title: 'Certification Sprint',
    description: 'Ôn luyện chiến lược, quản lý thời gian thi, coaching tâm lý và diễn tập điều kiện thi thật.',
  },
]

const benefits = [
  {
    title: 'Hệ thống mentor quốc tế',
    description: 'Giảng viên C2 từng giảng dạy tại đại học Ý, kèm mentor Việt hỗ trợ định hướng nghề nghiệp.',
    icon: 'solar:users-group-rounded-bold',
  },
  {
    title: 'Phòng thu & studio ảo',
    description: 'Ghi hình bài nói, podcast với thiết bị chuẩn để phân tích phát âm, ngữ điệu, gesture.',
    icon: 'solar:videocamera-record-line-duotone',
  },
  {
    title: 'Data-driven feedback',
    description: 'AI Speech Lab đánh giá 30 tiêu chí, xuất báo cáo chi tiết sau mỗi lần luyện tập.',
    icon: 'solar:chart-square-bold',
  },
  {
    title: 'Network kết nối chuyên gia',
    description: 'Tham gia cộng đồng alumni tại Ý, Ý – Việt để mở rộng quan hệ hợp tác, sự nghiệp.',
    icon: 'ph:handshake-duotone',
  },
]

const testimonials = [
  {
    name: 'Lê Hồng Nhung · PhD Candidate',
    quote: 'Khoá C1 giúp mình viết luận nghiên cứu bằng tiếng Ý một cách trôi chảy. Mentor phản hồi từng đoạn văn và đề xuất tài liệu chuyên sâu.',
    avatar: 'https://i.pravatar.cc/100?img=33',
  },
  {
    name: 'Đặng Quang Huy · Business Director',
    quote: 'Sau 4 tháng học C2, mình tự tin dẫn dắt negotiation với đối tác Ý. Hệ thống mock negotiation rất sát thực tế.',
    avatar: 'https://i.pravatar.cc/100?img=5',
  },
]

const faqItems = [
  {
    question: 'Yêu cầu đầu vào cho lớp C1/C2 là gì?',
    answer: 'Bạn cần hoàn thành tối thiểu B2 hoặc vượt qua placement test gồm speaking + writing để đảm bảo sẵn sàng cho chương trình chuyên sâu.',
  },
  {
    question: 'Khoá học có hỗ trợ làm luận văn hay hồ sơ học thuật không?',
    answer: 'Có. Mentor sẽ hỗ trợ phản biện đề cương, chỉnh sửa văn phong và chuẩn hoá tài liệu theo yêu cầu của trường/đơn vị.',
  },
  {
    question: 'Nếu không thi chứng chỉ có tham gia được không?',
    answer: 'Hoàn toàn được. Bạn có thể chọn lộ trình chuyên ngành (business, diplomatic, academic) và hoàn thành capstone project thay thế.',
  },
  {
    question: 'Có chương trình học tại Ý không?',
    answer: 'Học viên đạt C1 trở lên có thể đăng ký short trip 2 tuần tại Ý để thực hành với native speakers (chi phí riêng).',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-gray-900">
    <!-- Hero -->
    <section class="bg-gradient-to-b from-emerald-600 to-teal-600 text-white pt-16 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-white/60 mb-4">
            Level C1 · C2 · Mastery Program
          </p>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            Khoá học nâng cao cho người muốn làm chủ tiếng Ý
          </h1>
          <p class="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
            Hoàn thiện ngôn ngữ ở đẳng cấp bản xứ, phục vụ nghiên cứu, đàm phán cấp cao hoặc giảng dạy. Học cùng mentor quốc tế và hệ thống bài tập đột phá.
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
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Khám phá lộ trình C-level
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Đặt lịch tư vấn riêng
            </NuxtLink>
          </div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-3xl" />
          <div class="relative bg-white/5 border border-white/20 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
            <h3 class="text-2xl font-bold mb-6">
              Lộ trình cá nhân hoá 4 giai đoạn
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
          class="bg-white rounded-2xl border border-emerald-100 p-5 flex flex-col gap-3 shadow-sm"
        >
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
          <p class="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-4">
            Signature Program
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Khi tiếng Ý trở thành bản năng thứ hai của bạn
          </h2>
          <div class="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Chương trình nâng cao tập trung khai thác phong cách cá nhân và khả năng tư duy bằng tiếng Ý ở những chủ đề phức tạp.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-emerald-500 mt-1" />
                <span>Seminar đọc hiểu văn bản học thuật, triết học và chính trị</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-emerald-500 mt-1" />
                <span>Coaching thuyết trình TED-style với đạo diễn hình ảnh chuyên nghiệp</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-emerald-500 mt-1" />
                <span>Được phản biện bởi 2 mentor (bản ngữ + người Việt) sau mỗi bài assignment</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="grid gap-6 text-white">
          <div class="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-8 shadow-xl">
            <p class="text-sm uppercase tracking-[0.3em] mb-3">
              Capstone studio
            </p>
            <h3 class="text-2xl font-bold mb-4">
              Biến ý tưởng thành keynote, podcast hoặc research paper
            </h3>
            <p class="text-white/80 leading-relaxed">
              Học viên được cung cấp template, thư viện nguồn và đội ngũ kỹ thuật hỗ trợ dựng slide, ghi âm,
              để biến dự án tiếng Ý thành sản phẩm thực tế.
            </p>
          </div>
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-emerald-50">
            <h4 class="text-xl font-semibold text-gray-900 mb-4">
              Lịch học & coaching
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div class="p-4 rounded-xl border border-emerald-50">
                <p class="text-gray-400 mb-1">
                  Intensive
                </p>
                <p class="font-semibold text-gray-900">
                  2-4 buổi/tuần
                </p>
                <p>120-150 phút</p>
              </div>
              <div class="p-4 rounded-xl border border-emerald-50">
                <p class="text-gray-400 mb-1">
                  Coaching
                </p>
                <p class="font-semibold text-gray-900">
                  1-1 mentor
                </p>
                <p>Feedback đa góc</p>
              </div>
              <div class="p-4 rounded-xl border border-emerald-50">
                <p class="text-gray-400 mb-1">
                  Hình thức
                </p>
                <p class="font-semibold text-gray-900">
                  Hybrid studio
                </p>
                <p>Online + workshop</p>
              </div>
              <div class="p-4 rounded-xl border border-emerald-50">
                <p class="text-gray-400 mb-1">
                  Tài liệu
                </p>
                <p class="font-semibold text-gray-900">
                  500+ resources
                </p>
                <p>Academic + business</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Courses -->
    <section id="courses" class="py-12 sm:py-16 bg-emerald-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <p class="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
            C1 · C2 Programs
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Chọn lộ trình nâng cao phù hợp với mục tiêu đỉnh cao của bạn
          </h2>
          <p class="text-gray-600 text-lg">
            Mỗi khoá học đều có capstone thực tế, mentor quốc tế và hệ thống đánh giá chuẩn CEFR cao nhất.
          </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="course in advancedCourses"
            :key="course.key"
            class="bg-white rounded-2xl border border-emerald-100 overflow-hidden flex flex-col shadow-lg"
          >
            <div class="bg-gradient-to-r text-white from-emerald-500 to-cyan-400 p-6">
              <p class="text-sm uppercase tracking-[0.3em] mb-2">
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
            <div class="p-6 sm:p-8 flex-1 flex flex-col gap-6 text-gray-700">
              <div>
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Bạn sẽ đạt được
                </h4>
                <ul class="space-y-2 text-gray-700">
                  <li v-for="outcome in course.outcomes" :key="outcome" class="flex items-start gap-2">
                    <Icon name="solar:check-circle-bold" class="text-emerald-500 mt-1" />
                    <span>{{ outcome }}</span>
                  </li>
                </ul>
              </div>
              <div class="border-t border-gray-100 pt-6">
                <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Chọn hình thức học
                </h4>
                <div class="space-y-3">
                  <NuxtLink
                    v-for="classItem in course.classes"
                    :key="classItem.key"
                    :to="classItem.href"
                    class="block p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-semibold text-gray-900 group-hover:text-emerald-600">
                          {{ classItem.label }}
                        </p>
                        <p class="text-xs uppercase tracking-wide text-gray-500">
                          {{ classItem.type }}
                        </p>
                      </div>
                      <Icon
                        name="solar:alt-arrow-right-line-duotone"
                        size="18"
                        class="text-gray-300 group-hover:text-emerald-500 transition-colors"
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
    <section class="py-12 sm:py-16 bg-white text-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <p class="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
            Giá trị khác biệt
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Trải nghiệm học tập đẳng cấp quốc tế
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex gap-4"
          >
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
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
    <section class="py-12 sm:py-16 bg-gradient-to-b from-white to-slate-100 text-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p class="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              Feedback thực tế
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Những câu chuyện thành công từ level nâng cao
            </h2>
            <p class="text-gray-600 mb-6 leading-relaxed">
              Học viên đạt C1/C2 đang làm việc tại các tập đoàn Ý, giảng dạy tại trường đại học hoặc chuẩn bị bảo vệ nghiên cứu sinh.
            </p>
            <NuxtLink
              to="/testimonials"
              class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
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
    <section class="py-12 sm:py-16 bg-emerald-50 text-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-8">
          <div>
            <p class="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              FAQ
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Hỏi đáp về chương trình nâng cao
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Chúng tôi luôn sẵn sàng tư vấn nếu bạn cần thêm thông tin về kỳ thi, visa giáo dục hay định hướng nghề nghiệp.
            </p>
          </div>
          <div class="space-y-4">
            <details
              v-for="faq in faqItems"
              :key="faq.question"
              class="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm"
            >
              <summary class="cursor-pointer text-lg font-semibold mb-2 text-gray-900">
                {{ faq.question }}
              </summary>
              <p class="text-gray-600 leading-relaxed">
                {{ faq.answer }}
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Sẵn sàng chạm đỉnh tiếng Ý?
          </h2>
          <p class="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
            Đăng ký tư vấn cùng Academic Director, nhận phân tích năng lực và lộ trình cá nhân hoá để đạt C1/C2 nhanh nhất.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-6 py-4 bg-white text-emerald-700 font-semibold rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Đặt lịch tư vấn chuyên sâu
            </NuxtLink>
            <NuxtLink
              to="#courses"
              class="inline-flex items-center justify-center px-6 py-4 border border-white/60 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Xem khoá C1/C2
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
