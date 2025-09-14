export function useGlobalLoading() {
  const isLoading = useState<boolean>('global.loading', () => false)
  const message = useState<string>('global.loading.message', () => 'Loading...')

  function showLoading(loadingMessage = 'Loading...') {
    message.value = loadingMessage
    isLoading.value = true
  }

  function hideLoading() {
    isLoading.value = false
  }

  return {
    isLoading: readonly(isLoading),
    message: readonly(message),
    showLoading,
    hideLoading,
  }
}
