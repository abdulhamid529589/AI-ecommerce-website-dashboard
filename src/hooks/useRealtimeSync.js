import { useCallback } from 'react'
import { toast } from 'react-toastify'

/**
 * Hook for real-time category synchronization on dashboard
 * Monitors category changes and notifies admins
 */
export const useCategorySync = (setCategories) => {
  const setupCategorySync = useCallback(
    (socket) => {
      if (!socket) return

      // Listen for category updates
      socket.on('categories:updated', (data) => {
        console.log('📦 [Dashboard] Categories updated via Socket.IO:', data)
        if (data.categories) {
          // Extract category names if full objects, or use as-is if already names
          const categoryNames = Array.isArray(data.categories)
            ? data.categories.map((cat) => (typeof cat === 'string' ? cat : cat.name))
            : []
          setCategories(categoryNames)
          toast.info('Categories refreshed')
        }
      })

      // Listen for individual category changes (real-time)
      socket.on('categories:changed', (data) => {
        console.log(`📦 [Dashboard] Category ${data.action}:`, data.category)
        toast.success(`Category ${data.action}: ${data.category.name}`)
        // Could update local state directly here instead of full refresh
      })

      return () => {
        socket.off('categories:updated')
        socket.off('categories:changed')
      }
    },
    [setCategories],
  )

  return { setupCategorySync }
}

/**
 * Hook for real-time product synchronization on dashboard
 * Updates product list, inventory counts, and stock levels
 */
export const useProductSync = (refreshProducts) => {
  const setupProductSync = useCallback(
    (socket) => {
      if (!socket) return

      // Listen for product changes
      socket.on('products:changed', (data) => {
        console.log(`📦 [Dashboard] Product ${data.action}:`, data.product.name)

        const actionMessages = {
          created: `✅ New product created: ${data.product.name}`,
          updated: `📝 Product updated: ${data.product.name}`,
          deleted: `🗑️ Product deleted: ${data.product.name}`,
        }

        toast.info(actionMessages[data.action] || 'Product changed')

        // Refresh product list
        if (refreshProducts) {
          refreshProducts()
        }
      })

      // Listen for stock updates (faster than product update)
      socket.on('stock:updated', (data) => {
        console.log(`📊 [Dashboard] Stock updated for product ${data.productId}`)
        toast.info(`Stock updated: ${data.productId}`)
      })

      return () => {
        socket.off('products:changed')
        socket.off('stock:updated')
      }
    },
    [refreshProducts],
  )

  return { setupProductSync }
}

/**
 * Hook for real-time order notifications on dashboard
 * Alerts admins about new orders and status changes
 */
export const useOrderNotifications = () => {
  const handleOrderNotification = useCallback((data) => {
    console.log(`🛍️ [Dashboard] Order notification:`, data)

    const actionMessages = {
      created: '🎉 New order received!',
      updated: '📝 Order updated',
      paid: '💳 Payment received!',
      shipped: '📦 Order shipped',
    }

    toast.success(actionMessages[data.action] || 'Order updated')
  }, [])

  const setupOrderNotifications = useCallback(
    (socket) => {
      if (!socket) return

      socket.on('orders:changed', handleOrderNotification)

      return () => {
        socket.off('orders:changed')
      }
    },
    [handleOrderNotification],
  )

  return { setupOrderNotifications }
}

/**
 * Hook for analytics updates on dashboard
 * Real-time dashboard stats and metrics
 */
export const useAnalyticsSync = (setAnalytics) => {
  const setupAnalyticsSync = useCallback(
    (socket) => {
      if (!socket) return

      socket.on('analytics:updated', (data) => {
        console.log('📊 [Dashboard] Analytics updated:', data)

        setAnalytics({
          totalProducts: data.totalProducts,
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          lowStockItems: data.lowStockItems,
        })
      })

      return () => {
        socket.off('analytics:updated')
      }
    },
    [setAnalytics],
  )

  return { setupAnalyticsSync }
}

/**
 * Hook for low stock alerts
 * Notifies admin when inventory is running low
 */
export const useLowStockAlerts = () => {
  const handleLowStockAlert = useCallback((data) => {
    console.log('⚠️ [Dashboard] Low stock alert:', data.product.name)
    toast.warning(`Low stock alert: ${data.product.name} (${data.product.stock} remaining)`)
  }, [])

  const setupLowStockAlerts = useCallback(
    (socket) => {
      if (!socket) return

      socket.on('alert:low-stock', handleLowStockAlert)

      return () => {
        socket.off('alert:low-stock')
      }
    },
    [handleLowStockAlert],
  )

  return { setupLowStockAlerts }
}

/**
 * Hook for generic admin notifications
 */
export const useAdminNotifications = () => {
  const handleNotification = useCallback((data) => {
    console.log('🔔 [Dashboard] Admin notification:', data.message)
    toast.info(data.message)
  }, [])

  const setupNotifications = useCallback(
    (socket) => {
      if (!socket) return

      // Listen for all admin-prefixed events
      socket.on('notification:new', handleNotification)

      return () => {
        socket.off('notification:new')
      }
    },
    [handleNotification],
  )

  return { setupNotifications }
}

/**
 * Hook for user activity tracking
 * Monitor user actions for analytics
 */
export const useUserActivityTracking = () => {
  const trackActivity = useCallback((socket, userId, activity) => {
    if (!socket) return

    socket.emit('user:activity', {
      userId,
      activity,
      timestamp: new Date().toISOString(),
    })
  }, [])

  return { trackActivity }
}

export default {
  useCategorySync,
  useProductSync,
  useOrderNotifications,
  useAnalyticsSync,
  useLowStockAlerts,
  useAdminNotifications,
  useUserActivityTracking,
}
