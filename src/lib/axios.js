import axios from 'axios'

// Normalize VITE_API_URL so it always points to the API prefix (include /api/v1)
const rawEnv = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_ROOT = String(rawEnv).replace(/\/+$/, '')
const API_PREFIX = API_ROOT.endsWith('/api/v1') ? API_ROOT : `${API_ROOT}/api/v1`

const api = axios.create({
  baseURL: API_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 🔒 CSRF Token handling
let csrfToken = null
let csrfRefreshing = false

/**
 * Initialize CSRF token from server
 * Call this on app startup
 */
export const initializeCsrfToken = async () => {
  try {
    console.log('🔄 Fetching Dashboard CSRF token...')
    const response = await api.get('/csrf-token')
    csrfToken = response.data.csrfToken
    // Add to default headers for all requests
    api.defaults.headers.common['X-CSRF-Token'] = csrfToken
    console.log('✅ Dashboard CSRF token initialized:', csrfToken ? 'SUCCESS' : 'FAILED')
    return csrfToken
  } catch (error) {
    console.error('❌ Failed to fetch dashboard CSRF token:', error.message)
    return null
  }
}

/**
 * Refresh CSRF token when needed
 */
export const refreshCsrfToken = async () => {
  if (csrfRefreshing) {
    console.log('⏳ Dashboard CSRF token already refreshing...')
    return csrfToken
  }

  csrfRefreshing = true
  try {
    console.log('🔄 Refreshing dashboard CSRF token...')
    await initializeCsrfToken()
  } finally {
    csrfRefreshing = false
  }
  return csrfToken
}

let isRefreshing = false
let refreshSubscribers = []

// Subscribe to token refresh
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
}

// Request interceptor - attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
    // DEBUG: Log token info for /order/admin requests
    if (config.url.includes('/order/admin')) {
      const tokenParts = token.split('.')
      try {
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log(`🔐 Sending token for order/admin:`, {
          userId: payload.id,
          userRole: payload.role,
          tokenLength: token.length,
          exp: new Date(payload.exp * 1000).toLocaleString(),
        })
      } catch (e) {
        console.log(`⚠️ Could not decode token:`, e.message)
      }
    }
  }

  // Ensure CSRF token is in headers AND body for state-changing methods
  const isStateChanging = ['POST', 'PUT', 'DELETE'].includes(config.method?.toUpperCase())
  if (isStateChanging && csrfToken) {
    config.headers = config.headers || {}
    config.headers['X-CSRF-Token'] = csrfToken

    // Also send in body as _csrf for fallback (but NOT for arrays)
    // For FormData, append as field; for objects, add as property
    if (config.data instanceof FormData) {
      config.data.append('_csrf', csrfToken)
    } else if (config.data && typeof config.data === 'object' && !Array.isArray(config.data)) {
      config.data._csrf = csrfToken
    }
  }

  // For FormData (file uploads), delete the default Content-Type so axios
  // will automatically set it to multipart/form-data with proper boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

// Response interceptor - handle token refresh on 401 and CSRF errors on 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle CSRF token failures (403 with CSRF_FAILED code)
    if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_FAILED') {
      if (!originalRequest._csrfRetry) {
        originalRequest._csrfRetry = true
        console.log('🔄 Dashboard CSRF token expired, refreshing...')

        // Refresh CSRF token
        await refreshCsrfToken()

        // Retry original request with new token
        return api(originalRequest)
      }
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // If token is already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      // Start token refresh
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        console.log('🔁 Refreshing token...')
        const response = await axios.post(
          `${API_PREFIX}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true },
        )

        if (response.data && response.data.accessToken) {
          const newAccessToken = response.data.accessToken

          // Update stored token
          localStorage.setItem('accessToken', newAccessToken)
          localStorage.setItem('token', newAccessToken)

          // Update token expiration time (15 minutes from now)
          localStorage.setItem('tokenExpiresAt', new Date(Date.now() + 15 * 60 * 1000).getTime())

          // Update axios default header
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`

          // Update original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // Notify all queued requests
          onRefreshed(newAccessToken)
          refreshSubscribers = []

          isRefreshing = false

          console.log('✅ Token refreshed successfully')

          // Retry original request
          return api(originalRequest)
        }

        // Refresh failed
        isRefreshing = false
        console.error('❌ Token refresh failed')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(error)
      } catch (refreshError) {
        // Token refresh failed, clear storage and redirect to login
        isRefreshing = false
        refreshSubscribers = []
        console.error('❌ Token refresh error:', refreshError.message)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // If token is expired/invalid and we can't refresh, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export { API_PREFIX }
export default api
