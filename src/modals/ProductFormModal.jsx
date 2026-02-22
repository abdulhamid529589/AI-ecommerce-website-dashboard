import React, { useState, useEffect } from 'react'
import { X, AlertCircle, Check } from 'lucide-react'

const ProductFormModal = ({ product, categories, onClose, onSave, isDark }) => {
  const [formData, setFormData] = useState(
    product || {
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      sku: '',
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'Product name is required'
    if (!formData.category?.trim()) newErrors.category = 'Category is required'
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = 'Valid price is required'
    if (!formData.stock || parseFloat(formData.stock) < 0)
      newErrors.stock = 'Valid stock quantity is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    await onSave(formData)
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {product ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {product ? 'Update product details' : 'Create a new product listing'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                  errors.name
                    ? isDark
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500 bg-red-50'
                    : isDark
                      ? 'border-slate-600 bg-slate-700 focus:border-blue-500'
                      : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg border-2 appearance-none transition-all focus:outline-none ${
                  errors.category
                    ? isDark
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500 bg-red-50'
                    : isDark
                      ? 'border-slate-600 bg-slate-700 focus:border-blue-500'
                      : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.category}
                </p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                SKU (Optional)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${isDark ? 'border-slate-600 bg-slate-700 focus:border-blue-500 text-white' : 'border-slate-300 bg-white focus:border-blue-500 text-slate-900'}`}
                placeholder="SKU code"
              />
            </div>

            {/* Price */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Price (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                  errors.price
                    ? isDark
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500 bg-red-50'
                    : isDark
                      ? 'border-slate-600 bg-slate-700 focus:border-blue-500'
                      : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                  errors.stock
                    ? isDark
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500 bg-red-50'
                    : isDark
                      ? 'border-slate-600 bg-slate-700 focus:border-blue-500'
                      : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.stock}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none resize-none ${
                  errors.description
                    ? isDark
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-red-500 bg-red-50'
                    : isDark
                      ? 'border-slate-600 bg-slate-700 focus:border-blue-500'
                      : 'border-slate-300 bg-white focus:border-blue-500'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
                placeholder="Enter detailed product description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex items-center gap-3 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${isDark ? 'border-2 border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal
