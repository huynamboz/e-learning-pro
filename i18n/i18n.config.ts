import en from './locales/en.json'
// import it from './locales/it.json'
import vi from './locales/vi.json'

export default defineI18nConfig(() => {
    const currentLocale = useCookie('locale', {
        default: () => 'vi',
    })
    console.log(currentLocale.value)
    return {
        locale: currentLocale.value,
        messages: {
            en,
            vi,
            // it,
        },
    }
})
