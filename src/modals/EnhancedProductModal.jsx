import React, { useState, useEffect } from 'react'
import { LoaderCircle, X, Plus, Trash2, Upload } from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { toast } from 'react-toastify'
import '../styles/modals.css'
import { getOperationErrorMessage } from '../utils/errorHandler'

const EnhancedProductModal = ({ product, onClose, onSuccess, isNew = true }) => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [variations, setVariations] = useState([])
  const [attributes, setAttributes] = useState([])

  // Helper function to convert snake_case to camelCase
  const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
  }

  // Helper function to normalize product data from API (snake_case to camelCase)
  const normalizeProduct = (prod) => {
    if (!prod) return prod
    const normalized = {}
    for (const [key, value] of Object.entries(prod)) {
      normalized[toCamelCase(key)] = value
    }
    return normalized
  }

  // Normalize product data from API
  const normalizedProduct = normalizeProduct(product)

  const [formData, setFormData] = useState({
    // General Tab
    name: normalizedProduct?.name || '',
    slug: normalizedProduct?.slug || '',
    shortDescription: normalizedProduct?.shortDescription || '',
    fullDescription: normalizedProduct?.description || '',
    productType: normalizedProduct?.productType || 'simple',
    sku: normalizedProduct?.sku || '',
    barcode: normalizedProduct?.barcode || '',

    // Pricing Tab
    regularPrice: normalizedProduct?.price || '',
    salePrice: normalizedProduct?.salePrice || '',
    salePriceFrom: '',
    salePriceTo: '',
    costPrice: normalizedProduct?.costPrice || '',
    enableBulkPricing: normalizedProduct?.enableBulkPricing || false,

    // Inventory Tab
    stockQuantity: normalizedProduct?.stock || '',
    lowStockThreshold: normalizedProduct?.lowStockThreshold || '10',
    stockStatus: normalizedProduct?.stockStatus || 'in-stock',
    allowBackorders: normalizedProduct?.allowBackorders || false,
    soldIndividually: normalizedProduct?.soldIndividually || false,

    // Categories & Tags (optional - can be empty array)
    selectedCategories: normalizedProduct?.category
      ? [normalizedProduct.category]
      : normalizedProduct?.selectedCategories || [], // Empty array is OK - category is optional
    selectedTags: Array.isArray(normalizedProduct?.tags) ? normalizedProduct.tags : [],
    brand: normalizedProduct?.brand || '',

    // Shipping
    weight: normalizedProduct?.weight || '',
    weightUnit: normalizedProduct?.weightUnit || 'kg',
    length: normalizedProduct?.length || '',
    width: normalizedProduct?.width || '',
    height: normalizedProduct?.height || '',
    shippingClass: normalizedProduct?.shippingClass || 'standard',
    freeShipping: normalizedProduct?.freeShipping || false,

    // SEO
    focusKeyword: normalizedProduct?.focusKeyword || '',
    metaTitle: normalizedProduct?.metaTitle || '',
    metaDescription: normalizedProduct?.metaDescription || '',

    // Advanced
    purchaseNote: normalizedProduct?.purchaseNote || '',
    enableReviews: normalizedProduct?.enableReviews !== false,
    menuOrder: normalizedProduct?.menuOrder || '0',
    status: normalizedProduct?.status || 'published',
    visibility: normalizedProduct?.visibility || 'public',
    catalogVisibility: normalizedProduct?.catalogVisibility || 'visible',
    featured: normalizedProduct?.featured || false,

    // Images
    images: normalizedProduct?.images || [],
    imageAlts: normalizedProduct?.imageAlts || {},
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState(product?.images || [])
  const [newTag, setNewTag] = useState('')

  // Fetch categories and tags on mount
  useEffect(() => {
    fetchCategoriesAndTags()
  }, [])

  const fetchCategoriesAndTags = async () => {
    try {
      // Fetch categories from settings (managed in CategoryCollectionManager) with cache-bust
      const categoriesResponse = await api.get(`/admin/settings/categories?_t=${Date.now()}`)
      const categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : categoriesResponse.data?.categories || []

      // Convert category objects to format with id and name
      const formattedCategories = categoriesData.map((cat, idx) => ({
        id: cat.id || idx,
        name: typeof cat === 'string' ? cat : cat.name,
      }))

      setCategories(formattedCategories.length > 0 ? formattedCategories : [])

      // Extract unique tags from products
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const response = await api.get(
        `${API_PREFIX}/product?limit=100`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      )

      if (response.data.products) {
        // Extract unique tags if available
        const uniqueTags = [...new Set(response.data.products.flatMap((p) => p.tags || []))].filter(
          Boolean,
        )
        setTags(uniqueTags)
      }
    } catch (error) {
      console.error('Failed to fetch categories/tags:', error)
      // Set empty categories on error - optional field
      setCategories([])
      setTags([])
    }
  }

  const handleGenerateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    setFormData({ ...formData, slug })
  }

  const handleGenerateSKU = () => {
    const sku = `${formData.name.substring(0, 3).toUpperCase()}-${Date.now()}`
    setFormData({ ...formData, sku })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviews])
  }

  const handleRemoveImage = (index) => {
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (newTag.trim() && !formData.selectedTags.includes(newTag)) {
      setFormData({
        ...formData,
        selectedTags: [...formData.selectedTags, newTag],
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      selectedTags: formData.selectedTags.filter((t) => t !== tag),
    })
  }

  const handleCategoryToggle = (catId) => {
    if (formData.selectedCategories.includes(catId)) {
      setFormData({
        ...formData,
        selectedCategories: formData.selectedCategories.filter((c) => c !== catId),
      })
    } else {
      setFormData({
        ...formData,
        selectedCategories: [...formData.selectedCategories, catId],
      })
    }
  }

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...variations]
    newVariations[index] = { ...newVariations[index], [field]: value }
    setVariations(newVariations)
  }

  const addVariation = () => {
    setVariations([...variations, { sku: '', price: '', stock: '', enabled: true }])
  }

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.regularPrice || !formData.stockQuantity) {
      toast.error('Please fill in required fields: Name, Price, Stock')
      return
    }

    // Category is now optional - skip validation

    if (!formData.fullDescription) {
      toast.error('Please provide a product description')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const submitData = new FormData()

      // Map all form fields to backend expected field names
      // Required fields
      submitData.append('name', formData.name)
      submitData.append('description', formData.fullDescription)
      submitData.append('price', formData.regularPrice)
      // Category is optional - only append if selected
      if (formData.selectedCategories && formData.selectedCategories.length > 0) {
        const categoryId = formData.selectedCategories[0]
        const selectedCat = categories.find((c) => c.id === categoryId)
        if (selectedCat?.name) {
          submitData.append('category', selectedCat.name)
        }
      }
      submitData.append('stock', formData.stockQuantity)

      // Optional fields - all mapped with correct snake_case names
      if (formData.slug) submitData.append('slug', formData.slug)
      if (formData.shortDescription)
        submitData.append('short_description', formData.shortDescription)
      if (formData.productType) submitData.append('product_type', formData.productType)
      if (formData.sku) submitData.append('sku', formData.sku)
      if (formData.barcode) submitData.append('barcode', formData.barcode)
      if (formData.salePrice) submitData.append('sale_price', formData.salePrice)
      if (formData.costPrice) submitData.append('cost_price', formData.costPrice)
      if (formData.weight) submitData.append('weight', formData.weight)
      if (formData.weightUnit) submitData.append('weight_unit', formData.weightUnit)
      if (formData.length) submitData.append('length', formData.length)
      if (formData.width) submitData.append('width', formData.width)
      if (formData.height) submitData.append('height', formData.height)
      if (formData.lowStockThreshold)
        submitData.append('low_stock_threshold', formData.lowStockThreshold)
      if (formData.stockStatus) submitData.append('stock_status', formData.stockStatus)
      submitData.append('allow_backorders', formData.allowBackorders)
      submitData.append('sold_individually', formData.soldIndividually)
      if (formData.brand) submitData.append('brand', formData.brand)
      if (formData.selectedTags && formData.selectedTags.length > 0) {
        submitData.append('tags', JSON.stringify(formData.selectedTags))
      }
      if (formData.shippingClass) submitData.append('shipping_class', formData.shippingClass)
      submitData.append('free_shipping', formData.freeShipping)
      if (formData.metaTitle) submitData.append('meta_title', formData.metaTitle)
      if (formData.metaDescription) submitData.append('meta_description', formData.metaDescription)
      if (formData.focusKeyword) submitData.append('focus_keyword', formData.focusKeyword)
      if (formData.purchaseNote) submitData.append('purchase_note', formData.purchaseNote)
      submitData.append('enable_reviews', formData.enableReviews)
      submitData.append('featured', formData.featured)
      if (formData.visibility) submitData.append('visibility', formData.visibility)
      if (formData.catalogVisibility)
        submitData.append('catalog_visibility', formData.catalogVisibility)
      if (formData.menuOrder) submitData.append('menu_order', formData.menuOrder)
      if (Object.keys(formData.imageAlts).length > 0) {
        submitData.append('image_alts', JSON.stringify(formData.imageAlts))
      }

      // Append new image files
      imageFiles.forEach((file) => {
        submitData.append('images', file)
      })

      // Use correct endpoints
      const endpoint = isNew
        ? `${API_PREFIX}/product/admin/create`
        : `${API_PREFIX}/product/admin/update/${product.id || product._id}`

      const method = isNew ? api.post : api.put

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      await method(endpoint, submitData, config)

      toast.success(isNew ? 'Product created successfully' : 'Product updated successfully')
      onSuccess()
    } catch (error) {
      const errorMsg = getOperationErrorMessage(isNew ? 'createProduct' : 'updateProduct', error)
      const validationErrors = error.response?.data?.errors
      const detailedMessage = validationErrors
        ? `Validation failed: ${Object.entries(validationErrors)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ')}`
        : errorMsg || error.response?.data?.message || 'Failed to save product'
      toast.error(detailedMessage)
      console.error('Product save error:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isNew ? 'Create New Product' : 'Edit Product'}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          {[
            { id: 'general', label: 'General' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'images', label: 'Images' },
            { id: 'categories', label: 'Categories & Tags' },
            { id: 'variations', label: 'Variations' },
            { id: 'shipping', label: 'Shipping' },
            { id: 'seo', label: 'SEO' },
            { id: 'advanced', label: 'Advanced' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={200}
                  placeholder="Enter product name"
                  className="form-input"
                  required
                />
                <div className="text-xs text-gray-500">{formData.name.length}/200</div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Slug</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="product-slug"
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="btn btn-secondary"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description (optional)</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  maxLength={160}
                  placeholder="Brief product description (160 chars) - optional"
                  className="form-textarea"
                  rows={2}
                />
                <div className="text-xs text-gray-500">{formData.shortDescription.length}/160</div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Description (optional)</label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed product description - optional"
                  className="form-textarea"
                  rows={6}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Product Type</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="form-input"
                  >
                    <option value="simple">Simple</option>
                    <option value="variable">Variable (with variants)</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">SKU</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU"
                      className="form-input flex-1"
                    />
                    <button type="button" onClick={handleGenerateSKU} className="btn btn-secondary">
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Barcode</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Barcode / EAN"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* PRICING TAB */}
          {activeTab === 'pricing' && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Regular Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Sale Price (৳)</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Cost Price (৳)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Sale Price From</label>
                  <input
                    type="date"
                    value={formData.salePriceFrom}
                    onChange={(e) => setFormData({ ...formData, salePriceFrom: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Sale Price To</label>
                  <input
                    type="date"
                    value={formData.salePriceTo}
                    onChange={(e) => setFormData({ ...formData, salePriceTo: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.enableBulkPricing}
                    onChange={(e) =>
                      setFormData({ ...formData, enableBulkPricing: e.target.checked })
                    }
                  />
                  Enable Bulk Pricing
                </label>
              </div>

              {formData.enableBulkPricing && (
                <div className="form-group bg-gray-100 dark:bg-gray-700 p-4 rounded">
                  <p className="text-sm font-medium mb-2">Bulk Pricing Table</p>
                  <p className="text-sm text-gray-600">
                    Quantity ranges and bulk prices can be configured here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="0"
                    className="form-input"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: e.target.value })
                    }
                    placeholder="10"
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Stock Status</label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="form-input"
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="on-backorder">On Backorder</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.allowBackorders}
                    onChange={(e) =>
                      setFormData({ ...formData, allowBackorders: e.target.checked })
                    }
                  />
                  Allow Backorders
                </label>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.soldIndividually}
                    onChange={(e) =>
                      setFormData({ ...formData, soldIndividually: e.target.checked })
                    }
                  />
                  Sold Individually (Limit 1 per order)
                </label>
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {activeTab === 'images' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Product Images (optional)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag & drop images here or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-input"
                    placeholder="Upload images (optional)"
                  />
                  <label htmlFor="image-input" className="btn btn-primary cursor-pointer">
                    Choose Images
                  </label>
                </div>
              </div>

              {imagePreviewUrls.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Image Gallery</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${idx}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Alt text"
                            value={formData.imageAlts[idx] || ''}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                imageAlts: {
                                  ...formData.imageAlts,
                                  [idx]: e.target.value,
                                },
                              })
                            }}
                            className="form-input text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES & TAGS TAB */}
          {activeTab === 'categories' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Categories *</label>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="form-checkbox block mb-2">
                      <input
                        type="checkbox"
                        checked={formData.selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="form-input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  />
                  <button type="button" onClick={handleAddTag} className="btn btn-primary">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-xs hover:font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Product brand"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* VARIATIONS TAB */}
          {activeTab === 'variations' && (
            <div className="tab-content">
              {formData.productType === 'variable' ? (
                <>
                  <button type="button" onClick={addVariation} className="btn btn-primary mb-4">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Variation
                  </button>

                  <div className="space-y-4">
                    {variations.map((variation, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Variation #{idx + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeVariation(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group flex-1">
                            <label className="form-label">SKU</label>
                            <input
                              type="text"
                              value={variation.sku || ''}
                              onChange={(e) => handleVariationChange(idx, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="form-input"
                            />
                          </div>

                          <div className="form-group flex-1">
                            <label className="form-label">Price (৳)</label>
                            <input
                              type="number"
                              value={variation.price || ''}
                              onChange={(e) => handleVariationChange(idx, 'price', e.target.value)}
                              placeholder="0.00"
                              className="form-input"
                              step="0.01"
                            />
                          </div>

                          <div className="form-group flex-1">
                            <label className="form-label">Stock</label>
                            <input
                              type="number"
                              value={variation.stock || ''}
                              onChange={(e) => handleVariationChange(idx, 'stock', e.target.value)}
                              placeholder="0"
                              className="form-input"
                            />
                          </div>
                        </div>

                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={variation.enabled !== false}
                            onChange={(e) =>
                              handleVariationChange(idx, 'enabled', e.target.checked)
                            }
                          />
                          Enabled
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Switch to "Variable" product type to manage variations
                </p>
              )}
            </div>
          )}

          {/* SHIPPING TAB */}
          {activeTab === 'shipping' && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Weight</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="0"
                      className="form-input flex-1"
                      step="0.01"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                      className="form-input"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Length (cm)</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder="0"
                    className="form-input"
                    step="0.01"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Width (cm)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder="0"
                    className="form-input"
                    step="0.01"
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="0"
                    className="form-input"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Shipping Class</label>
                  <select
                    value={formData.shippingClass}
                    onChange={(e) => setFormData({ ...formData, shippingClass: e.target.value })}
                    className="form-input"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="heavy">Heavy</option>
                    <option value="fragile">Fragile</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                  />
                  Free Shipping for this product
                </label>
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {activeTab === 'seo' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Focus Keyword</label>
                <input
                  type="text"
                  value={formData.focusKeyword}
                  onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                  placeholder="e.g., best running shoes"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meta Title (50-60 chars)</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  maxLength={60}
                  placeholder="Page title for search engines"
                  className="form-input"
                />
                <div className="text-xs text-gray-500">{formData.metaTitle.length}/60</div>
              </div>

              <div className="form-group">
                <label className="form-label">Meta Description (150-160 chars)</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  maxLength={160}
                  placeholder="Page description for search engines"
                  className="form-textarea"
                  rows={3}
                />
                <div className="text-xs text-gray-500">{formData.metaDescription.length}/160</div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm text-blue-700 dark:text-blue-300">
                SEO Score: <span className="font-semibold">Good</span> (Needs meta keywords for
                better optimization)
              </div>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="form-group">
                <label className="form-label">Purchase Note</label>
                <textarea
                  value={formData.purchaseNote}
                  onChange={(e) => setFormData({ ...formData, purchaseNote: e.target.value })}
                  placeholder="Note to show customer after purchase"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="form-input"
                  >
                    <option value="public">Public</option>
                    <option value="hidden">Hidden</option>
                    <option value="password">Password Protected</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">Menu Order</label>
                  <input
                    type="number"
                    value={formData.menuOrder}
                    onChange={(e) => setFormData({ ...formData, menuOrder: e.target.value })}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.enableReviews}
                    onChange={(e) => setFormData({ ...formData, enableReviews: e.target.checked })}
                  />
                  Enable Customer Reviews
                </label>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  Featured Product
                </label>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading && <LoaderCircle className="w-4 h-4 animate-spin inline mr-2" />}
              {isNew ? 'Create Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EnhancedProductModal
