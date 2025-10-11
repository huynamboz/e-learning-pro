import tailwindcss from '@tailwindcss/vite'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'ItalianoLive - Học Tiếng Ý Trực Tuyến',
      titleTemplate: '%s | ItalianoLive',
      htmlAttrs: {
        lang: 'vi',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Học tiếng Ý trực tuyến với ItalianoLive. Khóa học tiếng Ý chất lượng cao, giáo viên bản ngữ, phương pháp học hiện đại. Bắt đầu hành trình chinh phục tiếng Ý ngay hôm nay!',
        },
        {
          name: 'keywords',
          content: 'học tiếng Ý, tiếng Ý online, khóa học tiếng Ý, giáo viên tiếng Ý, học tiếng Ý miễn phí, tiếng Ý cơ bản, tiếng Ý nâng cao, ItalianoLive',
        },
        { name: 'author', content: 'ItalianoLive Team' },
        { name: 'robots', content: 'index, follow' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'ItalianoLive - Học Tiếng Ý Trực Tuyến' },
        {
          property: 'og:description',
          content: 'Học tiếng Ý trực tuyến với ItalianoLive. Khóa học tiếng Ý chất lượng cao, giáo viên bản ngữ, phương pháp học hiện đại.',
        },
        { property: 'og:url', content: 'https://italianolive.com' },
        { property: 'og:site_name', content: 'ItalianoLive' },
        { property: 'og:locale', content: 'vi_VN' },
        { property: 'og:image', content: 'https://italianolive.com/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'ItalianoLive - Học Tiếng Ý Trực Tuyến' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'canonical', href: 'https://italianolive.com' },

        // Preconnect to external domains
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://elearning.genfash.online' },
      ],
    },
  },

  css: [
    // 'ant-design-vue/dist/reset.css',
    '~/assets/css/custom.css',
    '~/assets/css/main.css',
    '~/assets/css/nuxt-google-fonts.css',
    'highlight.js/styles/atom-one-dark.css',
  ],

  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/google-fonts', '@nuxt/icon', '@nuxtjs/i18n', '@pinia/nuxt'],

  devtools: { enabled: true },
  compatibilityDate: '2025-05-15',
  eslint: {},

  vite: {
    plugins: [
      tailwindcss as any,
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
  },

  googleFonts: {
    fontsDir: 'fonts',
    outputDir: 'assets',
    preload: true,
    families: {
      Inter: [400, 500, 600, 700, 800],
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  // Icon
  icon: {
    serverBundle: {
      collections: ['solar', 'logos', 'tabler', 'majesticons', 'ri', 'hugeicons'],
    },
  },

  plugins: ['@/plugins/antd'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'https://elearning.genfash.online/api/v1',
    },
  },

  i18n: {
    vueI18n: './i18n.config.ts',
  },

  ssr: true,

  routeRules:{
    '/learning/**': { ssr: false },
  }
})