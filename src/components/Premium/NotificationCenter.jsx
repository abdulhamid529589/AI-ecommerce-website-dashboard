import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './NotificationCenter.css'

/**
 * NOTIFICATION CENTER
 * Toast notifications with animations and auto-dismiss
 */

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])

  // Show a notification
  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now()
    const notification = { id, message, type }

    setNotifications((prev) => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

    return id
  }

  // Dismiss a notification
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  // Expose global notification function
  useEffect(() => {
    window.showNotification = showNotification
    return () => {
      delete window.showNotification
    }
  }, [])

  return (
    <div className="notification-container fixed top-4 right-4 z-50 pointer-events-none">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          {...notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  )
}

/**
 * Individual Toast Component
 */
const Toast = ({ id, message, type = 'info', onDismiss }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
      default:
        return <Info size={20} />
    }
  }

  const getStyles = () => {
    const baseStyles = 'px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-3 '
    const shadowStyles = 'shadow-lg hover:shadow-xl transition-shadow'

    switch (type) {
      case 'success':
        return baseStyles + 'bg-green-500/90 dark:bg-green-600/90 text-white ' + shadowStyles
      case 'error':
        return baseStyles + 'bg-red-500/90 dark:bg-red-600/90 text-white ' + shadowStyles
      case 'warning':
        return baseStyles + 'bg-orange-500/90 dark:bg-orange-600/90 text-white ' + shadowStyles
      case 'info':
      default:
        return baseStyles + 'bg-blue-500/90 dark:bg-blue-600/90 text-white ' + shadowStyles
    }
  }

  return (
    <div
      key={id}
      className={`toast-notification ${type} pointer-events-auto mb-3 animate-slide-in`}
    >
      <div className={getStyles()}>
        <div className="flex-shrink-0 text-xl">{getIcon()}</div>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 hover:bg-white/20 rounded-full p-1
            transition-colors duration-200"
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default NotificationCenter
