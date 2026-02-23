import React, { useState, useEffect } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import { useSocket } from '../hooks/useSocket'
import { useCategorySync } from '../hooks/useRealtimeSync'
import '../styles/modals.css'
import { getOperationErrorMessage } from '../utils/errorHandler'

const UpdateProductModal = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState([])
  const { socket, isConnected } = useSocket('dashboard')
  const { setupCategorySync } = useCategorySync(setCategoryOptions)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  })

  const [imagePreview, setImagePreview] = useState([])

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(`/admin/settings/categories?_t=${Date.now()}`)
        const cats = Array.isArray(response.data) ? response.data : response.data?.categories || []
        const categoryNames = cats.map((cat) => cat.name)
        setCategoryOptions(categoryNames)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to basic categories if API fails
        setCategoryOptions([
          'Electronics',
          'Fashion',
          'Home & Garden',
          'Sports',
          'Books',
          'Beauty',
          'Automotive',
          'Kids & Baby',
        ])
      }
    }
    loadCategories()

    // Set up real-time category sync
    if (socket && isConnected) {
      setupCategorySync(socket)
    }
  }, [socket, isConnected, setupCategorySync])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '', // Keep existing or empty - category is optional now
        stock: product.stock || '',
        images: [],
      })
      // Set existing image preview if available
      if (product.image) {
        setImagePreview([product.image])
      }
    }
  }, [product, categoryOptions])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({
      ...formData,
      images: files,
    })

    // Create preview URLs for new images
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price === undefined || !formData.stock === undefined) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', formData.price)
      // Category is optional - only append if selected
      if (formData.category) {
        data.append('category', formData.category)
      }
      data.append('stock', formData.stock)

      for (let i = 0; i < formData.images.length; i++) {
        data.append('images', formData.images[i])
      }

      const response = await api.put(`/product/admin/update/${product.id}`, data)

      toast.success('Product updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.errogetOperationErrorMessage('updateProduct', error)
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Update Product</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Product Name */}
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="form-input"
              required
            />
          </div>

          {/* Category & Price */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category (Optional)</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">No Category</option>
                {categoryOptions.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (৳) *</label>
              <input
                type="number"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div className="form-group">
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              placeholder="Enter stock quantity"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: e.target.value,
                })
              }
              className="form-input"
              min="0"
              required
            />
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">Product Images (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="form-input file-input"
              placeholder="Upload images (optional)"
            />
            <p className="form-hint">You can upload multiple images to replace existing ones</p>
            {imagePreview.length > 0 && (
              <div className="image-preview">
                {imagePreview.map((preview, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={preview} alt={`Preview ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              placeholder="Enter product description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateProductModal
