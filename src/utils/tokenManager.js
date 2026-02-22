import api, { API_PREFIX } from '../lib/axios'
let interceptorSet = false

/**
 * Check if access token is expired or about to expire
 * @returns {boolean} true if token is expired or expires within 5 minutes
 */
export const isTokenExpired = () => {
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt')

  if (!tokenExpiresAt) {
    return true
  }

  const expiresAt = parseInt(tokenExpiresAt)
  const now = new Date().getTime()
  const timeUntilExpiry = expiresAt - now

  // Consider token expired if it expires within 5 minutes
  return timeUntilExpiry < 5 * 60 * 1000
}

/**
 * Refresh the access token using refresh token
 * @returns {Promise<boolean>} true if refresh was successful
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      console.log('❌ No refresh token available')
      return false
    }

    console.log('🔁 Attempting token refresh')
    try {
      const response = await api.post(
        '/auth/refresh-token',
        { refreshToken },
        { withCredentials: true },
      )
      console.log('🔁 Refresh response status:', response.status, 'data:', response.data)

      if (response.data && response.data.success) {
        const newAccessToken = response.data.accessToken

        // Update access token
        localStorage.setItem('accessToken', newAccessToken)
        // Update token expiration time (15 minutes from now)
        localStorage.setItem('tokenExpiresAt', new Date(Date.now() + 15 * 60 * 1000).getTime())

        // Update axios default headers
        setAxiosAuthToken(newAccessToken)

        console.log('✅ Access token refreshed successfully')
        return true
      }
      console.warn('⚠️ Refresh did not return success:', response.data)
      return false
    } catch (err) {
      if (err.response) {
        console.error(
          '❌ Refresh failed, server responded with',
          err.response.status,
          err.response.data,
        )
      } else {
        console.error('❌ Refresh request failed:', err.message)
      }
      // If refresh fails, clear tokens and logout
      clearAllTokens()
      return false
    }
  } catch (error) {
    console.error('❌ Failed to refresh access token (outer):', error)
    clearAllTokens()
    return false
  }
}

/**
 * Clear all authentication tokens
 */
export const clearAllTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.removeItem('tokenExpiresAt')
}

/**
 * Set axios default authorization header
 */
export const setAxiosAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

/**
 * Initialize axios with current token from localStorage
 */
export const initializeAxiosToken = () => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    setAxiosAuthToken(accessToken)
    console.log('✅ Axios token initialized')
  }
}

/**
 * Setup axios interceptor to handle token refresh (only once)
 */
export const setupTokenInterceptor = () => {
  if (interceptorSet) {
    console.log('⚠️ Interceptor already set, skipping...')
    return
  }

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const success = await refreshAccessToken()

        if (success) {
          // Retry the original request with new token
          const newToken = localStorage.getItem('accessToken')
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          // Redirect to login if refresh failed
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      return Promise.reject(error)
    },
  )

  interceptorSet = true
  console.log('✅ Axios interceptor setup complete')
}

/**
 * Get authorization header with current access token
 * @returns {Object} Authorization header object
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken')
  return {
    Authorization: token ? `Bearer ${token}` : '',
  }
}
