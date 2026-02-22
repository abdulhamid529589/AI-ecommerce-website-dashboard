/**
 * Security-focused error message handler
 * Returns user-friendly messages instead of exposing API/server errors
 */

export const getSafeErrorMessage = (
  error,
  defaultMessage = 'Something went wrong. Please try again.',
) => {
  // Log the actual error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  // Don't expose server/API details to the user
  // Instead, return generic, user-friendly messages based on status code
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Please check your input and try again.'
      case 401:
        return 'Your session has expired. Please login again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'This action conflicts with existing data. Please refresh and try again.'
      case 422:
        return 'Please check your input and try again.'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Server error. Please try again later.'
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return defaultMessage
    }
  }

  // Network errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection and try again.'
  }

  if (!window.navigator.onLine) {
    return 'No internet connection. Please check your network.'
  }

  // Default fallback
  return defaultMessage
}

/**
 * Special handler for specific operations
 */
export const getOperationErrorMessage = (operation, error) => {
  const messages = {
    login: 'Unable to login. Please check your credentials.',
    register: 'Unable to create account. Please try again.',
    logout: 'Logout successful.',
    updateProfile: 'Unable to update profile. Please try again.',
    changePassword: 'Unable to change password. Please try again.',
    resetPassword: 'Unable to send reset email. Please try again.',
    placeOrder: 'Unable to place order. Please try again.',
    payment: 'Payment processing failed. Please try again.',
    uploadFile: 'Unable to upload file. Please try again.',
    deleteUser: 'Unable to delete user. Please try again.',
    updateUser: 'Unable to update user. Please try again.',
    createProduct: 'Unable to create product. Please try again.',
    updateProduct: 'Unable to update product. Please try again.',
    deleteProduct: 'Unable to delete product. Please try again.',
    saveShopInfo: 'Unable to save shop information. Please try again.',
    saveSlide: 'Unable to save slide. Please try again.',
    fetchData: 'Unable to load data. Please try again.',
  }

  return messages[operation] || getSafeErrorMessage(error)
}
