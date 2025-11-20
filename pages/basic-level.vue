<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const highlights = [
  'Học online linh hoạt',
  'Giáo trình độc quyền từ giảng viên bản xứ',
  'Cam kết đầu ra theo khung CEFR',
]

const stats = [
  { label: 'Học viên hoàn thành', value: '2.350+', icon: 'solar:users-group-rounded-bold' },
  { label: 'Điểm hài lòng trung bình', value: '4.9/5', icon: 'solar:star-bold' },
  { label: 'Buổi học trực tiếp', value: '40+', icon: 'solar:videocamera-record-line-duotone' },
  { label: 'Bài tập thực hành', value: '60+', icon: 'solar:checklist-minimalistic-bold' },
]

const beginnerCourses = [
  {
    key: 'A1',
    level: 'A1',
    title: 'Foundational Italian A1',
    description: 'Học phát âm, từ vựng và cấu trúc câu cơ bản để tự tin giao tiếp trong cuộc sống hàng ngày.',
    duration: '10 tuần · 30 buổi học',
    outcomes: [
      'Tự giới thiệu bản thân, gia đình, sở thích',
      'Hiểu và đặt câu hỏi đơn giản (What, Where, Who...)',
      'Đọc hiểu bảng hiệu, thực đơn, email ngắn',
    ],
    classes: [
      { key: 'A1-1', label: 'Lớp A1 · 1 học viên', href: '/courses?level=beginner&sublevel=A1&class=A1-1', type: '1:1 coaching' },
      { key: 'A1-3', label: 'Lớp A1 · 3 học viên', href: '/courses?level=beginner&sublevel=A1&class=A1-3', type: 'Micro class' },
    ],
  },
  {
    key: 'A2',
    level: 'A2',
    title: 'Applied Italian A2',
    description: 'Tăng tốc kỹ năng giao tiếp, nghe hiểu nội dung dài hơn và phản xạ tự nhiên trong nhiều tình huống.',
    duration: '12 tuần · 36 buổi học',
    outcomes: [
      'Miêu tả trải nghiệm, kể lại kỷ niệm',
      'Tự tin giao tiếp trong du lịch, công việc cơ bản',
      'Viết email, đoạn văn ngắn với ngữ pháp đúng',
    ],
    classes: [
      { key: 'A2-1', label: 'Lớp A2 · 1 học viên', href: '/courses?level=beginner&sublevel=A2&class=A2-1', type: '1:1 coaching' },
      { key: 'A2-3', label: 'Lớp A2 · 3 học viên', href: '/courses?level=beginner&sublevel=A2&class=A2-3', type: 'Micro class' },
    ],
  },
]

const learningJourney = [
  {
    title: 'Khởi động · Tuần 1-2',
    description: 'Làm quen bảng chữ cái, âm vị tiếng Ý, 50 từ vựng nền tảng. Thi speaking demo để kiểm tra khẩu hình.',
  },
  {
    title: 'Xây nền ngữ pháp · Tuần 3-6',
    description: 'Nắm vững cấu trúc câu, thì hiện tại, quá khứ gần. Luyện tập hội thoại với kịch bản thực tế.',
  },
  {
    title: 'Ứng dụng thực tế · Tuần 7-10',
    description: 'Làm dự án mini: đặt vé máy bay, đặt phòng khách sạn, viết email. Feedback 1:1 từng buổi.',
  },
  {
    title: 'Tăng tốc & kiểm tra · Tuần 11-12',
    description: 'Thi thử chuẩn CEFR, đánh giá phát âm bằng AI, tư vấn lộ trình lên A2/B1.',
  },
]

const benefits = [
  {
    title: 'Giảng viên bản xứ & song ngữ',
    description: '100% tutor đạt tối thiểu C2 và có chứng chỉ giảng dạy, hỗ trợ song ngữ Việt - Ý.',
    icon: 'ph:chalkboard-teacher-duotone',
  },
  {
    title: 'Nền tảng học tập thông minh',
    description: 'Học mọi lúc với app: flashcard, bài tập nghe, AI chấm phát âm chuẩn IPA.',
    icon: 'ph:device-mobile-camera-duotone',
  },
  {
    title: 'Bảo trợ đầu ra',
    description: 'Thi thử miễn phí, được học lại miễn phí nếu không đạt target đã cam kết.',
    icon: 'solar:shield-check-bold',
  },
  {
    title: 'Community 24/7',
    description: 'Tham gia câu lạc bộ nói tiếng Ý hàng tuần, nhận mentor đồng hành.',
    icon: 'solar:chat-round-line-bold-duotone',
  },
]

const testimonials = [
  {
    name: 'Nguyễn Thuỳ Linh · Du học sinh Ý',
    quote: 'Sau 8 tuần học A1 mình có thể tự tin phỏng vấn visa bằng tiếng Ý. Giáo viên chỉnh phát âm cực kỳ chi tiết, bài tập nghe rất sát thực tế.',
    avatar: 'https://i.pravatar.cc/100?img=36',
  },
  {
    name: 'Trần Đức Nam · Food blogger',
    quote: 'Đi Ý review ẩm thực mà không biết tiếng bản địa thì thiếu cảm xúc. Nhờ lớp A2 mà mình giao tiếp rất tự nhiên với người dân bản xứ.',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
]

const faqItems = [
  {
    question: 'Tôi chưa biết gì về tiếng Ý có học được không?',
    answer: 'Hoàn toàn được! Khoá cơ bản dành cho người chưa có nền tảng. Bạn sẽ được học phát âm từ đầu và có mentor hỗ trợ khi tự học ở nhà.',
  },
  {
    question: 'Có giáo trình in kèm theo không?',
    answer: 'Học viên nhận bộ giáo trình PDF + vở bài tập + flashcard online. Với lớp 1:1 sẽ được tặng thêm lịch học cá nhân hoá.',
  },
  {
    question: 'Nếu bận thì có thể bảo lưu không?',
    answer: 'Bạn được bảo lưu tối đa 03 tháng và vẫn giữ quyền truy cập tài liệu, app luyện tập trong thời gian này.',
  },
  {
    question: 'Sự khác nhau giữa lớp 1 học viên và 3 học viên?',
    answer: 'Lớp 1:1 cá nhân hoá hoàn toàn và linh hoạt lịch học, trong khi lớp 3 học viên tăng tương tác nhóm và tối ưu chi phí.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
    <!-- Hero Section -->
    <section class="bg-gradient-to-b from-green-700 to-green-600 text-white pt-16 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-green-200 mb-4">
            Level A1 · A2 · CEFR aligned
          </p>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            Khoá học cơ bản cho người mới bắt đầu tiếng Ý
          </h1>
          <p class="text-lg sm:text-xl text-green-100 mb-8 leading-relaxed">
            Học tiếng Ý từ con số 0 với lộ trình 12 tuần: phát âm chuẩn, ngữ pháp nền tảng,
            luyện phản xạ nói theo phương pháp shadowing cùng giảng viên bản xứ.
          </p>
          <div class="flex flex-wrap gap-3 mb-10">
            <span
              v-for="tag in highlights"
              :key="tag"
              class="px-4 py-2 rounded-full border border-white/30 text-sm text-green-50 bg-white/10 backdrop-blur"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-4">
            <NuxtLink
              to="#courses"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-colors shadow-lg"
            >
              Chọn khoá phù hợp
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="w-full sm:w-auto inline-flex justify-center px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Nhận tư vấn lộ trình
            </NuxtLink>
          </div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-2xl" />
          <div class="relative bg-white/10 border border-white/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <h3 class="text-2xl font-bold mb-6">
              Bạn sẽ đạt được
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
                  <p class="text-sm uppercase text-green-100 tracking-wide mb-1">
                    {{ item.title }}
                  </p>
                  <p class="text-sm text-green-50 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3"
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

    <!-- Level Overview -->
    <section id="overview" class="py-12 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest mb-4">
            Tổng quan lộ trình
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Vì sao nên bắt đầu từ khoá học cơ bản?
          </h2>
          <div class="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Khoá học A1-A2 là bước đệm quan trọng giúp bạn nắm chắc nền tảng tiếng Ý trước khi chuyển lên các level cao hơn.
              Chương trình kết hợp giữa giảng dạy trực tiếp, bài tập tương tác và công nghệ chấm phát âm bằng AI.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Xây dựng vốn từ vựng 600+ từ, 60 cấu trúc câu cơ bản</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Làm chủ phát âm chuẩn bản xứ với 1:1 coaching từng buổi</span>
              </li>
              <li class="flex items-start gap-3">
                <Icon name="solar:check-circle-bold" class="text-green-600 mt-1" />
                <span>Ứng dụng ngay qua dự án thực tế: đặt vé, đặt phòng, viết email, gọi điện</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="grid gap-6">
          <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 shadow-lg">
            <p class="text-sm uppercase tracking-[0.3em] text-white/70 mb-3">
              Lộ trình 12 tuần
            </p>
            <h3 class="text-2xl font-bold mb-4">
              70% thời gian dành cho luyện nói và phản xạ
            </h3>
            <p class="text-white/90 leading-relaxed">
              Mỗi buổi học gồm 3 phần: Warm-up speaking · Ngữ pháp áp dụng · Hoạt động mô phỏng tình huống thực tế.
              Cuối tuần có buổi coaching 1:1 để chữa lỗi phát âm.
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
                  18h30 - 21h
                </p>
                <p>Thứ 2 - 4 - 6</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Cuối tuần
                </p>
                <p class="font-semibold text-gray-900">
                  9h - 11h30
                </p>
                <p>Thứ 7 - Chủ nhật</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Hình thức
                </p>
                <p class="font-semibold text-gray-900">
                  Online live
                </p>
                <p>Qua Zoom + LMS</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100">
                <p class="text-gray-400 mb-1">
                  Bài tập
                </p>
                <p class="font-semibold text-gray-900">
                  30 phút/ngày
                </p>
                <p>App luyện tập</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Courses Section -->
    <section id="courses" class="py-12 sm:py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest">
            A1 · A2 Programs
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Chọn khoá học cơ bản phù hợp với mục tiêu của bạn
          </h2>
          <p class="text-gray-600 text-lg">
            Chúng tôi phân tách rõ ràng giữa A1 (foundation) và A2 (applied) để bạn dễ dàng định hướng lộ trình học tiếp theo.
          </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="course in beginnerCourses"
            :key="course.key"
            class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
          >
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
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
                    <Icon name="solar:check-circle-bold" class="text-green-500 mt-1" />
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
    <section class="py-12 sm:py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <p class="text-sm font-semibold text-green-600 uppercase tracking-widest">
            Giá trị khác biệt
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Chúng tôi đồng hành cùng bạn mọi lúc
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
              Học viên nói gì về khoá cơ bản?
            </h2>
            <p class="text-gray-600 mb-6 leading-relaxed">
              98% học viên hoàn thành khoá A1/A2 đạt mục tiêu đầu ra đã đặt ra ban đầu. Họ cảm thấy tự tin hơn khi nói chuyện với người Ý và tiếp tục học lên các level cao hơn.
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
            <p class="text-sm font-semibold text-green-300 uppercase tracking-widest">
              FAQ
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Câu hỏi thường gặp khi học tiếng Ý cơ bản
            </h2>
            <p class="text-white/70 leading-relaxed">
              Nếu còn điều gì băn khoăn, hãy để lại thông tin để mentor tư vấn chi tiết hơn.
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

    <!-- CTA Section -->
    <section class="py-12 sm:py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình tiếng Ý?
          </h2>
          <p class="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
            Đăng ký ngay để giữ chỗ trong lớp khai giảng gần nhất. Bạn sẽ được kiểm tra đầu vào miễn phí và nhận lộ trình cá nhân hóa từ đội ngũ giảng viên.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center px-6 py-4 bg-white text-green-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Đặt lịch tư vấn 1:1
            </NuxtLink>
            <NuxtLink
              to="#courses"
              class="inline-flex items-center justify-center px-6 py-4 border border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Xem lịch khai giảng
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
