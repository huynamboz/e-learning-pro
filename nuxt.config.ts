import tailwindcss from '@tailwindcss/vite'
import { createStyleImportPlugin } from 'vite-plugin-style-import'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'NUlive',
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  css: [
    'ant-design-vue/dist/reset.css',
    '~/assets/css/custom.css',
    '~/assets/css/main.css',
    '~/assets/css/nuxt-google-fonts.css',
    'highlight.js/styles/atom-one-dark.css',
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
})
