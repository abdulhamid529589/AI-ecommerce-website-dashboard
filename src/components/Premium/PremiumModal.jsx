import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import './PremiumModal.css'

/**
 * PREMIUM MODAL COMPONENT
 * Beautiful modal with smooth animations and backdrop blur
 */

export const PremiumModal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  closeButton = true,
  backdrop = true,
  animated = true,
  footer,
  maxHeight,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }

  return (
    <div className={`premium-modal-overlay ${isOpen ? 'open' : ''}`}>
      {/* Backdrop */}
      {backdrop && <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />}

      {/* Modal Container */}
      <div className={`modal-content ${sizeClasses[size]} ${animated ? 'animate-modal-in' : ''}`}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-container">
            {title && <h2 className="modal-title">{title}</h2>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>

          {closeButton && (
            <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={maxHeight ? { maxHeight } : {}}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && <div className="modal-footer">{footer}</div>}

        {/* Glow Effect */}
        <div className="modal-glow" />
      </div>
    </div>
  )
}

export default PremiumModal
