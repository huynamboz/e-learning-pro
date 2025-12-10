/**
 * Format currency based on current locale
 * @param amount - The amount to format
 * @param locale - The locale (default: current i18n locale)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale?: string): string {
  // Get current locale from i18n if not provided
  // const currentLocale = locale || useI18n().locale.value || 'it'
  
  // Determine currency based on locale
  console.warn('locale', locale)
  const currency = 'EUR'
  
  // Format the amount
  if (currency === 'EUR') {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else {
    // For VND, we don't use Intl.NumberFormat as it doesn't handle VND well
    return `${amount.toLocaleString('vi-VN')} VNĐ`
  }
}

/**
 * Format currency with custom options
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrencyWithOptions(
  amount: number, 
  options: {
    locale?: string
    currency?: 'EUR' | 'VND'
    showSymbol?: boolean
  } = {}
): string {
  const { locale, currency, showSymbol = true } = options
  const currentLocale = locale || useI18n().locale.value || 'it'
  const targetCurrency = currency || (currentLocale === 'vi' ? 'VND' : 'EUR')
  
  if (targetCurrency === 'EUR') {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } else {
    const formattedAmount = amount.toLocaleString('vi-VN')
    return showSymbol ? `${formattedAmount} VNĐ` : formattedAmount
  }
}
