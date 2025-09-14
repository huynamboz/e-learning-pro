import VueCountUp from 'vue-countup-v3'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('CountUp', VueCountUp)
})
