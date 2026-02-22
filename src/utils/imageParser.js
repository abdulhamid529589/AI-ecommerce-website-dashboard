/**
 * Image Parser Utility
 * Handles various image formats returned from API
 */

export const parseProductImages = (product) => {
  if (!product) return []

  // If images is a JSON string, parse it
  if (typeof product.images === 'string') {
    try {
      return JSON.parse(product.images)
    } catch (e) {
      console.warn('Failed to parse images string:', product.images)
      return []
    }
  }

  // If images is already an array, return it
  if (Array.isArray(product.images)) {
    return product.images
  }

  // Fallback: return empty array
  return []
}

export const getProductImageUrl = (product) => {
  // Try images array first (preferred)
  const images = parseProductImages(product)
  if (images.length > 0) {
    return images[0].url || images[0]
  }

  // Fallback to single image field
  if (typeof product.image === 'string') {
    return product.image
  }

  // Fallback to image object with url property
  if (product.image && typeof product.image === 'object' && product.image.url) {
    return product.image.url
  }

  return '/placeholder.png'
}

export const getAllProductImages = (product) => {
  const images = parseProductImages(product)
  return images.length > 0 ? images : [{ url: product.image || '/placeholder.png' }]
}
