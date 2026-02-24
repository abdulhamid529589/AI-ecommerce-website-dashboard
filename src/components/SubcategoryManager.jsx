import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import api from '../lib/axios'

/**
 * Subcategory Manager Component
 * Allows admin to manage subcategories within a category
 * Supports real-time sync with frontend
 */
export default function SubcategoryManager({ category, onClose, onUpdate }) {
  const [subcategories, setSubcategories] = useState(category.subcategories || [])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image_url: '',
    position: 0,
    is_active: true,
  })

  useEffect(() => {
    loadSubcategories()
  }, [category.id])

  const loadSubcategories = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/admin/settings/categories/${category.id}/subcategories?_t=${Date.now()}`,
      )
      setSubcategories(response.data?.data || [])
    } catch (error) {
      console.error('Failed to load subcategories:', error)
      // Use fallback to category data
      setSubcategories(category.subcategories || [])
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubcategory = () => {
    setEditingId(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '📦',
      image_url: '',
      position: subcategories.length,
      is_active: true,
    })
    setShowForm(true)
  }

  const handleEditSubcategory = (subcategory) => {
    setEditingId(subcategory.id)
    setFormData(subcategory)
    setShowForm(true)
  }

  const handleSaveSubcategory = async () => {
    if (!formData.name.trim()) {
      alert('Subcategory name is required')
      return
    }

    try {
      setLoading(true)
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')

      if (editingId) {
        // Update existing
        const response = await api.put(`/admin/settings/subcategories/${editingId}`, {
          ...formData,
          slug,
        })
        setSubcategories(subcategories.map((s) => (s.id === editingId ? response.data?.data : s)))
        console.log('✅ Subcategory updated successfully!')
      } else {
        // Create new
        const response = await api.post(`/admin/settings/categories/${category.id}/subcategories`, {
          ...formData,
          slug,
        })
        setSubcategories([...subcategories, response.data?.data])
        console.log('✅ Subcategory created successfully!')
      }

      setShowForm(false)
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '📦',
        image_url: '',
        position: 0,
        is_active: true,
      })

      // Notify parent of update
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to save subcategory:', error)
      alert('Failed to save subcategory: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return

    if (!subcategoryId || subcategoryId.trim() === '') {
      console.error('❌ Invalid subcategoryId:', subcategoryId)
      alert('Error: Invalid subcategory ID')
      return
    }

    try {
      setLoading(true)
      console.log('🗑️ Deleting subcategory:', {
        subcategoryId,
        type: typeof subcategoryId,
        length: subcategoryId?.length,
      })

      const response = await api.delete(`/admin/settings/subcategories/${subcategoryId}`)
      console.log('✅ Delete response:', response.status, response.data)

      setSubcategories(subcategories.filter((s) => s.id !== subcategoryId))
      console.log('✅ Subcategory deleted successfully!')

      // Notify parent of update
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('❌ Failed to delete subcategory:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        subcategoryId,
        errorCode: error.code,
      })
      alert(
        'Failed to delete subcategory: ' +
          (error.response?.data?.message || error.response?.statusText || error.message),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Subcategories: {category.name}</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold hover:bg-blue-800 p-2 rounded transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Button */}
          <button
            onClick={handleAddSubcategory}
            disabled={loading}
            className="mb-6 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Plus size={20} />
            Add Subcategory
          </button>

          {/* Subcategories List */}
          {subcategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No subcategories yet. Click "Add Subcategory" to create one.
            </div>
          ) : (
            <div className="grid gap-4">
              {subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {subcategory.icon} {subcategory.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{subcategory.slug}</p>
                    {subcategory.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                        {subcategory.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {subcategory.is_active ? (
                        <span className="text-green-600 text-xs font-semibold">Active</span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">Inactive</span>
                      )}
                      <span className="text-gray-600 text-xs">
                        Position: {subcategory.position}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubcategory(subcategory)}
                      disabled={loading}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                      disabled={loading}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mt-6 p-6 bg-blue-50 dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingId ? 'Edit' : 'Add'} Subcategory
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Men's Clothing"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., mens-clothing (auto-generated if empty)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this subcategory..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="📦"
                      maxLength="2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                      }
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveSubcategory}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
