/**
 * Get file extension from file_url, file_path, or title
 * @param material - Object with file_url, file_path, or title
 * @returns File extension in lowercase, or empty string if not found
 */
export function getFileExtension(material: any): string {
  // Try to get extension from file_url or file_path first
  const file_url = material.file_url || material.file_path
  if (file_url) {
    const lastDot = file_url.lastIndexOf('.')
    if (lastDot > 0) {
      return file_url.substring(lastDot + 1).toLowerCase()
    }
  }

  // Fallback to title
  if (material.title) {
    const lastDot = material.title.lastIndexOf('.')
    if (lastDot > 0) {
      return material.title.substring(lastDot + 1).toLowerCase()
    }
  }

  return ''
}

