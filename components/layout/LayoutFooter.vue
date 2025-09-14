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
    title: 'Get Help',
    links: [
      { title: 'Contact Us', url: '/contact' },
      { title: 'Latest Articles', url: '/articles' },
      { title: 'FAQ', url: '/faq' },
    ],
  },
  {
    title: 'Programs',
    links: [
      { title: 'Art & Design', url: '/programs/art-design' },
      { title: 'Business', url: '/programs/business' },
      { title: 'IT & Software', url: '/programs/it-software' },
      { title: 'Languages', url: '/programs/languages' },
      { title: 'Programming', url: '/programs/programming' },
    ],
  },
]

const contactInfo: ContactInfo[] = [
  { label: 'Address', value: '123 Main Street' },
  { label: 'Tel', value: '+(123) 456-7890' },
  { label: 'Mail', value: 'unitech-labs@gmail.com' },
]

const socialMedia: SocialMedia[] = [
  { name: 'Facebook', icon: 'logos:facebook', url: 'https://facebook.com' },
  { name: 'GitHub', icon: 'uil:github', url: 'https://github.com' },
  { name: 'Google', icon: 'devicon:google', url: 'https://google.com' },
  { name: 'Twitter', icon: 'devicon:twitter', url: 'https://twitter.com' },
]

const companyInfo = {
  description: 'Empowering learners through accessible and engaging online education. Byway is a leading online learning platform dedicated to providing high-quality, flexible, and affordable educational experiences.',
}
</script>

<template>
  <footer class="bg-green-700 py-20">
    <div class="w-full mx-auto px-20">
      <div class="grid grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-10">
        <!-- Company Info -->
        <div class="space-y-4 col-span-2 lg:col-span-3">
          <div class="flex items-center space-x-2">
            <img src="@/assets/images/logo.webp" alt="Logo" class="w-10 h-10">
          </div>
          <p class="text-white text-sm leading-relaxed max-w-md">
            {{ companyInfo.description }}
          </p>
        </div>

        <!-- Dynamic Footer Sections -->
        <div
          v-for="section in footerSections"
          :key="section.title"
          class="space-y-2"
        >
          <h3 class="text-slate-100 font-semibold text-lg mb-2">
            {{ section.title }}
          </h3>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.title">
              <NuxtLink
                :to="link.url"
                class="text-white text-sm font-medium hover:text-slate-200 transition-colors"
              >
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Section -->
        <div class="space-y-6 col-span-2">
          <div class="space-y-2">
            <h3 class="text-slate-100 font-semibold text-lg mb-2">
              Contact Us
            </h3>
            <ul class="space-y-2">
              <li
                v-for="contact in contactInfo"
                :key="contact.label"
                class="text-white text-sm font-medium"
              >
                {{ contact.label }}: {{ contact.value }}
              </li>
            </ul>
          </div>

          <!-- Social Media Links -->
          <div class="flex space-x-4">
            <a
              v-for="social in socialMedia"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex justify-center items-center w-[46px] h-[46px] bg-white rounded-full hover:bg-gray-100 transition-colors"
              :title="social.name"
            >
              <Icon :name="social.icon" class="text-3xl text-gray-700" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
