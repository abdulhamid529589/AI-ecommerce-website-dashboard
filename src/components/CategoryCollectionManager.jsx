import React, { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Grid,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { useSocket } from '../hooks/useSocket'
import io from 'socket.io-client'

export default function CategoryCollectionManager() {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('categories') // categories or collections
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedItem, setExpandedItem] = useState(null)
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    slug: '',
    isVisible: true,
    order: 0,
    icon: '📦',
    parentCategory: null, // for subcategories
    products: [],
  })

  // Load data from API
  useEffect(() => {
    loadCategories()
    loadCollections()

    // Set up Socket.io listener for real-time category updates
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      socket.on('connect', () => {
        console.log('✅ [CategoryManager] Connected to Socket.IO:', socket.id)
        socket.emit('identify', { role: 'dashboard' })
      })

      socket.on('categories:updated', (data) => {
        console.log('🔄 [CategoryManager] Categories updated via Socket.IO:', data)
        if (data.categories) {
          setCategories(data.categories)
        }
      })

      socket.on('categories:changed', (data) => {
        console.log('🔄 [CategoryManager] Category changed:', data)
        // Reload categories when changes occur
        loadCategories()
      })

      return () => {
        socket.off('categories:updated')
        socket.off('categories:changed')
        socket.off('connect')
        socket.disconnect()
      }
    } catch (error) {
      console.warn('⚠️ Socket.io initialization failed:', error.message)
    }
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.get(`/admin/settings/categories?_t=${Date.now()}`)
      const data = Array.isArray(response.data) ? response.data : response.data?.categories || []
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      // Fallback to empty array if API fails
      setCategories([])
      setFilteredCategories([])
    }
  }

  const loadCollections = async () => {
    try {
      // Collections can be managed as featured products or a separate endpoint
      // For now, we'll load them as a section of featured products
      const response = await api.get('/admin/settings/featured-products')
      const collectionsData = Array.isArray(response.data)
        ? response.data
        : response.data?.products || []
      setCollections(collectionsData.slice(0, 5)) // Show first 5 as collections
    } catch (error) {
      console.error('Failed to load collections:', error)
      // Fallback to empty collections if API fails
      setCollections([])
    }
  }

  // Filter categories
  useEffect(() => {
    if (activeTab === 'categories') {
      const filtered = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCategories(filtered)
    }
  }, [searchQuery, categories, activeTab])

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData(item)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      slug: '',
      isVisible: true,
      order: 0,
      icon: '📦',
      parentCategory: null,
      products: [],
    })
    setImagePreview(null)
    setImageUploadLoading(false)
    setModalMode('create')
    setShowModal(true)
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setImageUploadLoading(true)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)

      // Upload to backend (which authenticates with Cloudinary)
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      // axios interceptor handles FormData correctly (removes default Content-Type header)
      const response = await api.post('/admin/upload/image', uploadFormData)

      const data = response.data

      // Set the secure URL from Cloudinary (via backend)
      setFormData((prev) => ({
        ...prev,
        image: data.secure_url,
      }))

      console.log('Image uploaded successfully:', data.secure_url)
    } catch (error) {
      console.error('Image upload error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        error: error.response?.data?.error,
      })
      alert(
        `Upload failed: ${error.response?.data?.message || error.message}\n\nMake sure the image is less than 5MB and in a supported format (JPG, PNG, GIF, WebP).`,
      )
      // Keep the preview even if upload failed
    } finally {
      setImageUploadLoading(false)
    }
  }

  const handleSave = async () => {
    const slug = generateSlug(formData.name)
    const updatedData = { ...formData, slug }

    if (activeTab === 'categories') {
      try {
        if (modalMode === 'create') {
          const newCategory = {
            id: Date.now(), // Use timestamp as temporary ID
            ...updatedData,
            subcategories: formData.subcategories || [],
          }
          const updatedCategories = [...categories, newCategory]

          console.log('Sending categories to API:', {
            count: updatedCategories.length,
            firstItem: updatedCategories[0],
            totalDataSize: JSON.stringify(updatedCategories).length,
          })

          await api.post('/admin/settings/categories', updatedCategories)
          await loadCategories()
          console.log(
            '✅ Category saved successfully! It will appear in the shop within 30 seconds.',
          )
        } else {
          const updated = categories.map((c) => (c.id === selectedItem.id ? updatedData : c))
          await api.post('/admin/settings/categories', updated)
          await loadCategories()
          console.log(
            '✅ Category updated successfully! Changes will appear in the shop within 30 seconds.',
          )
        }
        setShowModal(false)
        setImagePreview(null)
        setImageUploadLoading(false)
        alert('✅ Category saved successfully! It will appear on the shop within 30 seconds.')
      } catch (error) {
        console.error('Failed to save category:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          fullError: error,
        })

        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to save category. Please try again.'

        alert(`Error: ${errorMsg}`)
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'categories') {
        try {
          const updated = categories.filter((c) => c.id !== id)
          await api.post('/admin/settings/categories', updated)
          await loadCategories()
        } catch (error) {
          console.error('Failed to delete category:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          })
          const errorMsg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Failed to delete category. Please try again.'
          alert(`Error: ${errorMsg}`)
        }
      } else {
        setCollections(collections.filter((c) => c.id !== id))
      }
    }
  }

  const toggleVisibility = async (id) => {
    if (activeTab === 'categories') {
      const updated = categories.map((c) => (c.id === id ? { ...c, isVisible: !c.isVisible } : c))
      try {
        await api.post('/admin/settings/categories', updated)
        await loadCategories()
      } catch (error) {
        console.error('Failed to update category visibility:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to update category. Please try again.'
        alert(`Error: ${errorMsg}`)
      }
    }
  }

  const moveCategory = async (id, direction) => {
    const index = categories.findIndex((c) => c.id === id)
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < categories.length - 1)
    ) {
      const newCategories = [...categories]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      ;[newCategories[index], newCategories[newIndex]] = [
        newCategories[newIndex],
        newCategories[index],
      ]
      try {
        await api.post('/admin/settings/categories', newCategories)
        await loadCategories()
      } catch (error) {
        console.error('Failed to reorder categories:', error)
      }
    }
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories & Collections</h1>
          <p className="text-slate-400 mt-1">Organize products into categories and collections</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Plus size={18} />
          New {activeTab === 'categories' ? 'Category' : 'Collection'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'categories'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'collections'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Collections ({collections.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories Grid */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveCategory(category.id, 'up')}
                      disabled={index === 0}
                      className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveCategory(category.id, 'down')}
                      disabled={index === filteredCategories.length - 1}
                      className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 rounded object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-400">{category.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {category.productCount} products • slug: {category.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleVisibility(category.id)}
                    className={`p-2 rounded transition ${
                      category.isVisible
                        ? 'text-green-400 hover:bg-slate-700'
                        : 'text-red-400 hover:bg-slate-700'
                    }`}
                  >
                    {category.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  {category.subcategories.length > 0 && (
                    <button
                      onClick={() =>
                        setExpandedItem(expandedItem === category.id ? null : category.id)
                      }
                      className="p-2 hover:bg-slate-700 rounded transition"
                    >
                      <ChevronDown
                        size={18}
                        className={`transition ${expandedItem === category.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-slate-700 rounded transition text-blue-400"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-slate-700 rounded transition text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedItem === category.id && category.subcategories.length > 0 && (
                <div className="bg-slate-700 bg-opacity-50 border-t border-slate-700 p-4 space-y-2">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2 bg-slate-800 rounded"
                    >
                      <div>
                        <p className="font-semibold ml-4">→ {sub.name}</p>
                        <p className="text-sm text-slate-400 ml-4">{sub.productCount} products</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-400 hover:bg-slate-700 rounded transition">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-red-400 hover:bg-slate-700 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Collections Grid */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{collection.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVisibility(collection.id)}
                    className={`p-2 rounded transition ${
                      collection.isVisible
                        ? 'text-green-400 hover:bg-slate-700'
                        : 'text-red-400 hover:bg-slate-700'
                    }`}
                  >
                    {collection.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-3">{collection.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">
                  <span className="font-semibold text-blue-400">{collection.products}</span>
                  <span className="text-slate-400"> products</span>
                </span>
                {collection.discount && (
                  <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded">
                    {collection.discount} OFF
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(collection)}
                  className="flex-1 p-2 hover:bg-slate-700 rounded transition text-blue-400"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="flex-1 p-2 hover:bg-slate-700 rounded transition text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create'
                ? `New ${activeTab === 'categories' ? 'Category' : 'Collection'}`
                : `Edit ${activeTab === 'categories' ? 'Category' : 'Collection'}`}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />

              {activeTab === 'categories' && (
                <>
                  <input
                    type="text"
                    placeholder="Icon Emoji"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    maxLength="2"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="space-y-3">
                    {/* Image Preview */}
                    {(imagePreview || formData.image) && (
                      <div className="relative w-full h-40 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: '' })
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Image URL Input (optional) */}
                    <input
                      type="text"
                      placeholder="Image URL (optional - paste URL or upload below)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* File Upload Input */}
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-blue-500 rounded-lg cursor-pointer hover:bg-slate-600 transition">
                      <div className="flex flex-col items-center gap-2">
                        {imageUploadLoading ? (
                          <>
                            <div className="animate-spin">
                              <Upload size={20} className="text-blue-400" />
                            </div>
                            <span className="text-sm text-slate-300">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={20} className="text-blue-400" />
                            <span className="text-sm text-slate-300">
                              {formData.image ? 'Change Image' : 'Upload Image'}
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploadLoading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-400">
                      Max file size: 5MB. Supported: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="rounded"
                />
                <span>Visible</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setImagePreview(null)
                    setImageUploadLoading(false)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
