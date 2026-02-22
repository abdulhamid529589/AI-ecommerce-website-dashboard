import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  GripVertical,
  Copy,
  MoreVertical,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { toast } from 'react-toastify'

export default function ContentPagesManagement() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    description: '',
    keywords: '',
    image_url: '',
    is_published: false,
    template: 'default',
  })

  // Fetch pages
  const fetchPages = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/content/pages')
      setPages(data.data)
    } catch (error) {
      toast.error('Failed to fetch pages')
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPages()
  }, [])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPage) {
        await api.put(`/content/pages/${editingPage.id}`, formData)
        toast.success('Page updated successfully')
      } else {
        await api.post('/content/pages', formData)
        toast.success('Page created successfully')
      }
      setShowModal(false)
      setEditingPage(null)
      setFormData({
        title: '',
        slug: '',
        content: '',
        description: '',
        keywords: '',
        image_url: '',
        is_published: false,
        template: 'default',
      })
      fetchPages()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving page')
      console.error(error)
    }
  }

  // Delete page
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return
    try {
      await api.delete(`/content/pages/${id}`)
      toast.success('Page deleted successfully')
      fetchPages()
    } catch (error) {
      toast.error('Failed to delete page')
      console.error(error)
    }
  }

  // Edit page
  const handleEdit = (page) => {
    setEditingPage(page)
    setFormData(page)
    setShowModal(true)
  }

  // Generate slug
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Pages Management</h1>
          <p className="text-slate-400 mt-1">Create and manage custom pages for your store</p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null)
            setFormData({
              title: '',
              slug: '',
              content: '',
              description: '',
              keywords: '',
              image_url: '',
              is_published: false,
              template: 'default',
            })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          <Plus size={20} />
          New Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pages Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading pages...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 mb-4">No pages found</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Create your first page
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Views</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-700 transition">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{page.title}</p>
                    <p className="text-slate-400 text-sm">{page.description?.substring(0, 50)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-slate-700 text-blue-300 px-2 py-1 rounded text-sm">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                      {page.template}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {page.is_published ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <Eye size={16} />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-400">
                        <EyeOff size={16} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{page.views || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="p-2 hover:bg-slate-700 rounded transition"
                        title="Edit"
                      >
                        <Edit2 size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 hover:bg-slate-700 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (for SEO)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
                  required
                  placeholder="Enter page content (HTML supported)"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Template */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Template</label>
                <select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="fullwidth">Full Width</option>
                  <option value="sidebar">With Sidebar</option>
                  <option value="hero">Hero Section</option>
                </select>
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                />
                <label htmlFor="published" className="text-slate-300 cursor-pointer">
                  Publish this page
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingPage ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
