import { useEffect, useRef, useCallback } from 'react'
import io from 'socket.io-client'

/**
 * Custom hook for Socket.io connection management (Dashboard)
 * Handles real-time updates for admin features:
 * - Category management
 * - Product inventory sync
 * - Order notifications
 * - Analytics updates
 * - Low stock alerts
 *
 * Usage:
 * const { socket, isConnected } = useSocket('dashboard')
 *
 * // Listen for category updates
 * socket.on('categories:changed', (data) => {
 *   console.log('Category changed:', data)
 * })
 *
 * // Listen for product updates
 * socket.on('products:changed', (data) => {
 *   console.log('Product changed:', data)
 * })
 *
 * // Listen for analytics
 * socket.on('analytics:updated', (data) => {
 *   console.log('Analytics updated:', data)
 * })
 */
export const useSocket = (clientType = 'dashboard') => {
  const socketRef = useRef(null)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    // Determine socket server URL
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `${window.location.origin}`

    console.log(`[useSocket-Dashboard] Connecting to Socket.io`, {
      url: socketUrl,
      envVar: import.meta.env.VITE_SOCKET_URL,
      clientType,
    })

    // Create socket connection with error handling
    let socket
    try {
      socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        withCredentials: true,
        forceNew: false,
        timeout: 10000,
      })

      // Connection events
      socket.on('connect', () => {
        console.log(`[useSocket] ✅ Dashboard connected to Socket.IO`, {
          socketId: socket.id,
          transport: socket.io.engine.transport.name,
        })
        isConnectedRef.current = true

        // Identify as dashboard
        socket.emit('client-type', clientType)
      })

      socket.on('connection-success', (data) => {
        console.log(`[useSocket] 🎉 Dashboard connection established:`, data)
      })

      socket.on('disconnect', (reason) => {
        console.warn(`[useSocket] ❌ Dashboard disconnected from Socket.IO`, {
          reason,
        })
        isConnectedRef.current = false
      })

      socket.on('connect_error', (error) => {
        console.error(`[useSocket] ⚠️ Connection error:`, {
          message: error?.message,
          type: error?.type,
          code: error?.code,
        })
      })

      socket.on('error', (error) => {
        console.error(`[useSocket] ❌ Socket error:`, error)
      })

      socket.on('reconnect_attempt', () => {
        console.log(`[useSocket] 🔄 Attempting to reconnect`)
      })

      socket.on('reconnect', () => {
        console.log(`[useSocket] ✅ Successfully reconnected`)
      })
    } catch (connectionError) {
      console.error(`[useSocket] ❌ Fatal error creating socket connection:`, connectionError)
    }

    socketRef.current = socket

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [clientType])

  // Get current connection status
  const isConnected = isConnectedRef.current

  // Emit event to server
  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }, [])

  // Listen for event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
  }, [])

  // Unlisten for event
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  }
}

export default useSocket
