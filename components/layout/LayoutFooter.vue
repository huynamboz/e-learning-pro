<script setup lang="ts">
interface FooterLink {
  title: string
  url: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface ContactInfo {
  label: string
  value: string
}

interface SocialMedia {
  name: string
  icon: string
  url: string
}

const footerSections: FooterSection[] = [
  {
    title: 'Hỗ trợ',
    links: [
      { title: 'Trung tâm trợ giúp', url: '#' },
      { title: 'Liên hệ với chúng tôi', url: '#' },
      { title: 'Câu hỏi thường gặp', url: '#' },
      { title: 'Hướng dẫn sử dụng', url: '#' },
    ],
  },
  {
    title: 'Công ty',
    links: [
      { title: 'Về chúng tôi', url: '#' },
      { title: 'Đội ngũ giảng viên', url: '#' },
      { title: 'Tin tức', url: '#' },
      { title: 'Tuyển dụng', url: '#' },
    ],
  },
]

const contactInfo: ContactInfo[] = [
  { label: 'Địa chỉ', value: 'V Novembre 1, Ponderano, Biella, Italia' },
  { label: 'Điện thoại', value: '+39 3926431708' },
  { label: 'Email', value: 'info@cotamitalian.com' },
]

const socialMedia: SocialMedia[] = [
  { name: 'Facebook', icon: 'logos:facebook', url: 'https://facebook.com' },
  { name: 'Instagram', icon: 'logos:instagram-icon', url: 'https://instagram.com' },
  { name: 'YouTube', icon: 'logos:youtube-icon', url: 'https://youtube.com' },
  { name: 'TikTok', icon: 'logos:tiktok-icon', url: 'https://tiktok.com' },
]

const companyInfo = {
  name: 'Phan Tâm',
  description: 'Học tiếng Ý cùng cô Phan Tâm - giảng viên có nhiều năm kinh nghiệm, giúp bạn học ngôn ngữ một cách dễ dàng và thú vị.',
}
</script>

<template>
  <footer class="bg-gradient-to-br from-green-600 to-green-800 text-white">
    <!-- Main Footer Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- Company Info -->
        <div class="lg:col-span-2 space-y-6">
          <div>
            <NuxtLink to="/" class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Icon name="i-heroicons-academic-cap" class="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ companyInfo.name }}
                </h3>
                <p class="text-green-100 text-sm">
                  Học tiếng Ý chuyên nghiệp
                </p>
              </div>
            </NuxtLink>
          </div>

          <p class="text-green-100 leading-relaxed max-w-md">
            {{ companyInfo.description }}
          </p>

          <!-- Contact Info -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <Icon name="i-heroicons-map-pin" class="w-5 h-5 text-green-200" />
              <span class="text-green-100 text-sm">{{ contactInfo[0].value }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <Icon name="i-heroicons-phone" class="w-5 h-5 text-green-200" />
              <span class="text-green-100 text-sm">{{ contactInfo[1].value }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <Icon name="i-heroicons-envelope" class="w-5 h-5 text-green-200" />
              <span class="text-green-100 text-sm">{{ contactInfo[2].value }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Sections -->
        <div
          v-for="section in footerSections"
          :key="section.title"
          class="space-y-4"
        >
          <h3 class="text-white font-semibold text-lg">
            {{ section.title }}
          </h3>
          <ul class="space-y-3">
            <li v-for="link in section.links" :key="link.title">
              <NuxtLink
                :to="link.url"
                class="!text-green-100 text-sm hover:text-white transition-colors duration-200 flex items-center group"
              >
                <Icon name="i-heroicons-chevron-right" class="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="border-t border-green-500/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Copyright -->
          <div class="text-green-100 text-sm">
            © {{ new Date().getFullYear() }} {{ companyInfo.name }}. Tất cả quyền được bảo lưu.
          </div>

          <!-- Social Media Links -->
          <div class="flex items-center space-x-4">
            <span class="text-green-100 text-sm mr-2">Theo dõi chúng tôi:</span>
            <div class="flex space-x-3">
              <a
                v-for="social in socialMedia"
                :key="social.name"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex justify-center items-center w-10 h-10 bg-green-500/20 rounded-full hover:bg-green-500/30 transition-all duration-200 group"
                :title="social.name"
              >
                <Icon :name="social.icon" class="w-5 h-5 text-green-100 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
