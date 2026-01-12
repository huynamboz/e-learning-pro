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
        { property: 'og:locale', content: 'it_IT' },
        { property: 'og:image', content: 'https://italianolive.com/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'ItalianoLive - Học Tiếng Ý Trực Tuyến' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/logo.webp' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.webp' },
        { rel: 'canonical', href: 'https://italianolive.com' },

        // Preconnect to external domains
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://api.hoctiengycungphantam.com' },
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

  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/google-fonts', '@nuxt/icon', '@nuxtjs/i18n', '@pinia/nuxt', 'nuxt-vue3-google-signin', 'nuxt-gtag', '@sentry/nuxt'],

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
      apiBase: process.env.API_BASE_URL || 'https://api.hoctiengycungphantam.com/api/v1',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    },
  },

  // @ts-ignore - nuxt-gtag module configuration
  gtag: {
    id: 'G-PBKR19PGSP',
  },

  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  i18n: {
    vueI18n: './i18n.config.ts',
  },

  // Sentry configuration
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Disable Sentry in development by default
    enabled: process.env.SENTRY_ENABLED !== 'false',
    // Client-side configuration
    clientInitOptions: {
      beforeSend(event: any, hint: any) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException
          // Ignore network errors that are expected
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message)
            if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
              return null
            }
          }
        }
        return event
      },
      integrations: [],
    },
    // Server-side configuration
    serverInitOptions: {
      beforeSend(event: any, hint: any) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = hint.originalException
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message)
            if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
              return null
            }
          }
        }
        return event
      },
    },
  },

  ssr: true,

  routeRules: {
    '/learning/**': { ssr: false },
    '/auth/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/quizz/**': { ssr: false },
  },
})
