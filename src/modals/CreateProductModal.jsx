import React, { useState, useEffect } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import '../styles/modals.css'
import { getOperationErrorMessage } from '../utils/errorHandler'

const CreateProductModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState([])
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
        const response = await api.get('/admin/settings/categories')
        const cats = Array.isArray(response.data) ? response.data : response.data?.categories || []
        const categoryNames = cats.map((cat) => cat.name)
        setCategoryOptions(categoryNames)
        // Set default category
        if (categoryNames.length > 0) {
          setFormData((prev) => ({ ...prev, category: categoryNames[0] }))
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Fallback to basic categories if API fails
        const defaults = [
          'Electronics',
          'Fashion',
          'Home & Garden',
          'Sports',
          'Books',
          'Beauty',
          'Automotive',
          'Kids & Baby',
        ]
        setCategoryOptions(defaults)
        setFormData((prev) => ({ ...prev, category: defaults[0] }))
      }
    }
    loadCategories()
  }, [])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData({
      ...formData,
      images: files,
    })

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.stock) {
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
      data.append('category', formData.category)
      data.append('stock', formData.stock)

      for (let i = 0; i < formData.images.length; i++) {
        data.append('images', formData.images[i])
      }

      const response = await api.post(`/product/admin/create`, data)

      toast.success('Product created successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(getOperationErrorMessage('createProduct', error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create New Product</h2>
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
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
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
            <p className="form-hint">You can upload multiple images</p>
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
                  <span>Creating...</span>
                </>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProductModal
