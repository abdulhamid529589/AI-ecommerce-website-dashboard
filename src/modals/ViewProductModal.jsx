import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Copy, Check, Star, User } from 'lucide-react'
import { parseProductImages } from '../utils/imageParser'
import './ViewProductModal.css'

const ViewProductModal = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  const images = parseProductImages(product)
  const currentImage =
    images.length > 0 ? images[currentImageIndex]?.url || images[currentImageIndex] : product?.image

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStockStatus = (stock) => {
    if (stock > 20) return { label: 'In Stock', color: '#10b981' }
    if (stock > 0) return { label: 'Low Stock', color: '#f59e0b' }
    return { label: 'Out of Stock', color: '#ef4444' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const stockStatus = getStockStatus(product?.stock || 0)
  const price = product?.price ? parseFloat(product.price).toLocaleString('en-BD') : '0'
  const rating = product?.ratings ? parseFloat(product.ratings).toFixed(1) : '0'

  return (
    <div className="product-modal-overlay">
      <div className="product-modal-container">
        <button className="product-modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="product-modal-content">
          {/* Image Section */}
          <div className="product-modal-gallery">
            <div className="product-modal-image-main">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product?.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'
                  }}
                />
              ) : (
                <div className="product-modal-no-image">No image available</div>
              )}

              {images.length > 1 && (
                <>
                  <button className="product-modal-nav prev" onClick={handlePrevImage}>
                    <ChevronLeft size={20} />
                  </button>
                  <button className="product-modal-nav next" onClick={handleNextImage}>
                    <ChevronRight size={20} />
                  </button>
                  <div className="product-modal-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`product-modal-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img src={img?.url || img} alt={`Product ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="product-modal-details">
            {/* Header */}
            <div className="product-modal-header">
              <div>
                <h2 className="product-modal-title">{product?.name || 'Product'}</h2>
                <p className="product-modal-category">{product?.category || 'Category'}</p>
              </div>
              <span className="product-modal-badge" style={{ backgroundColor: '#10b981' }}>
                Active
              </span>
            </div>

            {/* Price & Stock */}
            <div className="product-modal-price-stock">
              <div className="product-modal-price">
                <span className="label">Price</span>
                <span className="value">৳ {price}</span>
              </div>
              <div className="product-modal-stock" style={{ borderColor: stockStatus.color }}>
                <span className="label">Stock</span>
                <div className="stock-info">
                  <span className="dot" style={{ backgroundColor: stockStatus.color }}></span>
                  <span className="stock-text">{product?.stock || 0} units</span>
                </div>
                <span className="status" style={{ color: stockStatus.color }}>
                  {stockStatus.label}
                </span>
              </div>
            </div>

            {/* Rating */}
            {product?.ratings && (
              <div className="product-modal-rating">
                <span className="rating-label">Rating</span>
                <div className="rating-display">
                  <div className="rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(parseFloat(product.ratings)) ? 'filled' : ''}
                      />
                    ))}
                  </div>
                  <span className="rating-value">{rating} / 5</span>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="product-modal-info">
              <div className="info-card">
                <span className="info-label">Product ID</span>
                <div className="info-content">
                  <code>{product?.id || 'N/A'}</code>
                  <button
                    className={`copy-btn ${copiedField === 'id' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(product?.id, 'id')}
                  >
                    {copiedField === 'id' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="info-card">
                <span className="info-label">Category</span>
                <span className="info-value">{product?.category || 'N/A'}</span>
              </div>

              {product?.created_at && (
                <div className="info-card">
                  <span className="info-label">Added On</span>
                  <span className="info-value">{formatDate(product.created_at)}</span>
                </div>
              )}

              {product?.created_by && (
                <div className="info-card">
                  <span className="info-label">Created By</span>
                  <div className="info-content">
                    <div className="creator-info">
                      <User size={16} />
                      <code>{product.created_by || 'N/A'}</code>
                    </div>
                    <button
                      className={`copy-btn ${copiedField === 'creator' ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(product?.created_by, 'creator')}
                    >
                      {copiedField === 'creator' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product?.description && (
              <div className="product-modal-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Product Summary */}
            <div className="product-modal-summary">
              <div className="summary-item">
                <span className="summary-label">Total Price Range</span>
                <span className="summary-value">৳ {price}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Stock Status</span>
                <span className="summary-value" style={{ color: stockStatus.color }}>
                  {stockStatus.label}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Images</span>
                <span className="summary-value">
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button className="product-modal-btn-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewProductModal
