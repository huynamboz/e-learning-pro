/**
 * Generate a unique slug from a title with timestamp
 * @param title - The title to convert to slug
 * @returns A unique slug with timestamp
 */
export function generateSlug(title: string): string {
  if (!title) return ''
  
  // Convert title to slug format
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  
  // Add timestamp
  const timestamp = Date.now()
  
  return `${slug}-${timestamp}`
}
