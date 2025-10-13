/**
 * Format currency based on current locale
 * @param amount - The amount to format
 * @param locale - The locale (default: current i18n locale)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale?: string): string {
  // Get current locale from i18n if not provided
  const currentLocale = locale || useI18n().locale.value || 'vi'
  
  // Determine currency based on locale
  const currency = currentLocale !== 'vi' ? 'USD' : 'VND'
  
  // Format the amount
  if (currency === 'USD') {
    return `${amount} USD`
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
    currency?: 'USD' | 'VND'
    showSymbol?: boolean
  } = {}
): string {
  const { locale, currency, showSymbol = true } = options
  const currentLocale = locale || useI18n().locale.value || 'vi'
  const targetCurrency = currency || (currentLocale === 'en' ? 'USD' : 'VND')
  
  if (targetCurrency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } else {
    const formattedAmount = amount.toLocaleString('vi-VN')
    return showSymbol ? `${formattedAmount} VNĐ` : formattedAmount
  }
}
