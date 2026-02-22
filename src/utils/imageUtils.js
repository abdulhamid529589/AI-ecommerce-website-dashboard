/**
 * Image utility for dashboard
 * Handles image loading with fallbacks and proper error handling
 */

/**
 * Get placeholder SVG image
 */
export const getPlaceholderImage = (width = 300, height = 300, text = 'No Image') => {
  const encodedText = encodeURIComponent(text.substring(0, 15))

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#475569;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-size="14" fill="#94a3b8" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif">
        ${text}
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Handle image load error
 */
export const handleImageError = (e, fallbackText = 'No Image') => {
  if (e && e.target) {
    e.target.src = getPlaceholderImage(300, 300, fallbackText)
    e.target.classList.add('placeholder-image')
  }
}

/**
 * Get image source with validation
 */
export const getImageSrc = (imageUrl, fallbackText = 'No Image') => {
  // Handle null, undefined, or empty values
  if (!imageUrl) {
    return getPlaceholderImage(300, 300, fallbackText)
  }

  // If it's an object with url property, extract it
  if (typeof imageUrl === 'object' && imageUrl.url) {
    return getImageSrc(imageUrl.url, fallbackText)
  }

  // Convert to string if it's not already
  const urlString = String(imageUrl).trim()

  // Check if string is empty after trimming
  if (!urlString) {
    return getPlaceholderImage(300, 300, fallbackText)
  }

  // If it's already a data URL or blob, use it as-is
  if (urlString.startsWith('data:') || urlString.startsWith('blob:')) {
    return urlString
  }

  // If it's a relative path, try to make it absolute
  if (!urlString.startsWith('http')) {
    // Assume it's from the API
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
    return `${baseUrl}/uploads/${urlString}`.replace(/\/+/g, '/')
  }

  return urlString
}

/**
 * Validate image URL is accessible
 */
export const validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export default {
  getPlaceholderImage,
  handleImageError,
  getImageSrc,
  validateImageUrl,
}
