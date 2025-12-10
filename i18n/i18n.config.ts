import en from './locales/en.json'
import vi from './locales/vi.json'
import it from './locales/it.json'

export default defineI18nConfig(() => {
    const currentLocale = useCookie('locale', {
        default: () => 'it',
    })
    console.log(currentLocale.value)
    return {
        locale: currentLocale.value,
        messages: {
            en,
            vi,
            it,
        },
    }
})
