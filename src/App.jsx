import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import SideBar from './components/SideBar'
import Dashboard from './components/Dashboard'
import ProductManagement from './pages/ProductManagement'
import Orders from './components/Orders'
import Users from './components/Users'
import Settings from './components/Settings'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotificationCenter from './components/Premium/NotificationCenter'
// Phase 2 Components - Product & Inventory Management
import ProductInventoryManager from './components/ProductInventoryManager'
import CustomerManagementHub from './components/CustomerManagementHub'
import PromotionDiscountManager from './components/PromotionDiscountManager'
import CategoryCollectionManager from './components/CategoryCollectionManager'
import OrderTransactionManager from './components/OrderTransactionManager'
import HomepageContentBuilder from './components/HomepageContentBuilder'
// Phase 2 - Review & Settings Management
import ReviewManagement from './pages/ReviewManagement'
import SettingsManagement from './pages/SettingsManagement'
// Phase 3 - Performance Optimization
import PerformanceDashboard from './pages/PerformanceDashboard'
import { loginSuccess, logout } from './store/slices/authSlice'
import { ToastContainer } from 'react-toastify'
import {
  refreshAccessToken,
  setupTokenInterceptor,
  initializeAxiosToken,
} from './utils/tokenManager'
// Security
import { initializeCsrfToken } from './lib/axios'

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  // Force dark mode on app load
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
    document.body.style.backgroundColor = '#1a1a2e'
  }, [])

  // Load auth state from localStorage and setup token refresh on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      // 🔒 Initialize CSRF protection
      await initializeCsrfToken()

      const storedUser = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')

      console.log('🔍 Initializing auth...', {
        storedUser: !!storedUser,
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
      })

      // DEBUG: Check token role mismatch
      if (accessToken) {
        try {
          const tokenParts = accessToken.split('.')
          const payload = JSON.parse(atob(tokenParts[1]))
          const storedUserObj = storedUser ? JSON.parse(storedUser) : null
          console.log('🔐 Auth State Check:', {
            tokenUserId: payload.id?.substring(0, 8) + '...',
            storedUserRole: storedUserObj?.role,
            storedUserName: storedUserObj?.name,
            match: payload.id === storedUserObj?.id,
          })
        } catch (e) {
          console.log('ℹ️ Could not decode token in App.jsx')
        }
      }

      // Setup axios interceptor for token refresh (only once)
      setupTokenInterceptor()

      if (storedUser && accessToken && refreshToken) {
        try {
          // Set axios token immediately
          initializeAxiosToken()

          const userData = JSON.parse(storedUser)

          // Check if token is expired and refresh if needed
          const tokenExpiresAt = localStorage.getItem('tokenExpiresAt')
          if (tokenExpiresAt) {
            const timeUntilExpiry = parseInt(tokenExpiresAt) - new Date().getTime()

            // If token expires within 5 minutes, refresh it
            if (timeUntilExpiry < 5 * 60 * 1000) {
              console.log('⏰ Token expiring soon, refreshing...')
              const refreshSuccess = await refreshAccessToken()
              if (!refreshSuccess) {
                console.log('❌ Token refresh failed, logging out')
                dispatch(logout())
                setLoading(false)
                return
              }
            }
          }

          console.log('✅ Auth restored successfully')
          dispatch(loginSuccess(userData))
        } catch (error) {
          console.error('Error loading stored user:', error)
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('tokenExpiresAt')
          dispatch(logout())
        }
      } else {
        console.log('⚠️ No stored tokens found')
      }

      setLoading(false)
    }

    initializeAuth()
  }, [dispatch])

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const ProtectedLayout = ({ children }) => {
    console.log('🔐 ProtectedLayout Check:', { isAuthenticated, user, role: user?.role })

    if (isAuthenticated && user?.role === 'Admin') {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
          <SideBar />
          <main className="flex-1 md:ml-[260px] overflow-auto md:min-h-screen pt-16 md:pt-0">
            {children}
          </main>
        </div>
      )
    }

    console.log('❌ Not authenticated or not admin - redirecting to login')
    return <Navigate to="/login" replace />
  }

  return (
    <Router>
      <NotificationCenter />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedLayout>
              <ProductManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedLayout>
              <Orders />
            </ProtectedLayout>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedLayout>
              <Users />
            </ProtectedLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Phase 2 Routes - Advanced Admin Features */}
        <Route
          path="/products/inventory"
          element={
            <ProtectedLayout>
              <ProductInventoryManager />
            </ProtectedLayout>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedLayout>
              <CustomerManagementHub />
            </ProtectedLayout>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedLayout>
              <PromotionDiscountManager />
            </ProtectedLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedLayout>
              <CategoryCollectionManager />
            </ProtectedLayout>
          }
        />
        <Route
          path="/orders/manage"
          element={
            <ProtectedLayout>
              <OrderTransactionManager />
            </ProtectedLayout>
          }
        />
        <Route
          path="/content/homepage"
          element={
            <ProtectedLayout>
              <HomepageContentBuilder />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedLayout>
              <ReviewManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedLayout>
              <PerformanceDashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedLayout>
              <SettingsManagement />
            </ProtectedLayout>
          }
        />
      </Routes>
      <ToastContainer theme="dark" />
    </Router>
  )
}

export default App
