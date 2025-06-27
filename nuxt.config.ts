import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'NUlive',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  css: [
    '~/assets/css/main.css',
    // font
    '~/assets/css/nuxt-google-fonts.css',
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-05-15',
  eslint: {},
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  googleFonts: {
    fontsDir: 'fonts',
    outputDir: 'assets',
    preload: true,
    families: {
      'Inter': [400, 500, 600, 700, 800],
    }
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  // Icon
  icon: {
    serverBundle: {
      collections: ['solar']
    }
  }
})