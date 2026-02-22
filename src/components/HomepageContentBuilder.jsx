import React, { useState, useEffect } from 'react'
import {
  Layout,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  Image,
  Type,
  Grid,
  Sliders,
} from 'lucide-react'
import api from '../lib/axios'

export default function HomepageContentBuilder() {
  const [sections, setSections] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedSection, setSelectedSection] = useState(null)
  const [draggedSection, setDraggedSection] = useState(null)

  const sectionTypes = [
    {
      id: 'hero',
      name: 'Hero Banner',
      icon: Image,
      description: 'Large banner with call-to-action',
    },
    {
      id: 'featured',
      name: 'Featured Products',
      icon: Grid,
      description: 'Showcase featured items',
    },
    { id: 'categories', name: 'Categories', icon: Layout, description: 'Category showcase' },
    { id: 'testimonials', name: 'Testimonials', icon: Type, description: 'Customer reviews' },
    { id: 'newsletter', name: 'Newsletter', icon: Type, description: 'Email signup form' },
    { id: 'banner', name: 'Static Banner', icon: Image, description: 'Simple image banner' },
    { id: 'text', name: 'Text Content', icon: Type, description: 'Rich text section' },
    { id: 'products-grid', name: 'Products Grid', icon: Grid, description: 'Product collection' },
  ]

  const [formData, setFormData] = useState({
    type: 'hero',
    title: '',
    description: '',
    content: '',
    image: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    isVisible: true,
    order: 0,
    settings: {},
  })

  // Load mock sections
  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const response = await api.get('/admin/settings/home-sections')
      const sectionsData = response.data?.sections || response.data || []
      if (Array.isArray(sectionsData)) {
        setSections(sectionsData)
      } else {
        // Fallback to basic sections if data format is unexpected
        setSections([
          {
            id: 1,
            type: 'hero',
            title: 'Welcome to Our Store',
            description: 'Discover amazing products at great prices',
            image: 'https://via.placeholder.com/1200x400',
            isVisible: true,
            order: 1,
            backgroundColor: '#1e293b',
            textColor: '#ffffff',
          },
          {
            id: 2,
            type: 'featured',
            title: 'Featured Products',
            description: 'Check out our bestsellers',
            isVisible: true,
            order: 2,
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to load homepage sections:', error)
      // Fallback to basic sections
      setSections([
        {
          id: 1,
          type: 'hero',
          title: 'Welcome to Our Store',
          description: 'Discover amazing products at great prices',
          image: 'https://via.placeholder.com/1200x400',
          isVisible: true,
          order: 1,
          backgroundColor: '#1e293b',
          textColor: '#ffffff',
        },
        {
          id: 2,
          type: 'featured',
          title: 'Featured Products',
          description: 'Check out our bestsellers',
          isVisible: true,
          order: 2,
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
      ])
    }
  }

  const handleEdit = (section) => {
    setSelectedSection(section)
    setFormData(section)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleCreate = () => {
    setFormData({
      type: 'hero',
      title: '',
      description: '',
      content: '',
      image: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      isVisible: true,
      order: sections.length + 1,
      settings: {},
    })
    setModalMode('create')
    setShowModal(true)
  }

  const handleSave = () => {
    if (modalMode === 'create') {
      const newSection = {
        id: Math.max(...sections.map((s) => s.id || 0)) + 1,
        ...formData,
      }
      setSections([...sections, newSection])
    } else {
      const updated = sections.map((s) => (s.id === selectedSection.id ? formData : s))
      setSections(updated)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter((s) => s.id !== id))
    }
  }

  const toggleVisibility = (id) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    setSections(updated)
  }

  const handleDragStart = (section) => {
    setDraggedSection(section)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetSection) => {
    if (!draggedSection || draggedSection.id === targetSection.id) return

    const draggedIndex = sections.findIndex((s) => s.id === draggedSection.id)
    const targetIndex = sections.findIndex((s) => s.id === targetSection.id)

    const newSections = [...sections]
    newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedSection)

    setSections(newSections.map((s, i) => ({ ...s, order: i + 1 })))
    setDraggedSection(null)
  }

  const getSectionTypeInfo = (typeId) => {
    return sectionTypes.find((t) => t.id === typeId)
  }

  const SortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Homepage Content Builder</h1>
          <p className="text-slate-400 mt-1">Drag, edit, and arrange homepage sections</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Plus size={18} />
          Add Section
        </button>
      </div>

      {/* Available Sections */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Available Section Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sectionTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => {
                  setFormData({ ...formData, type: type.id })
                  handleCreate()
                }}
                className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-left"
              >
                <Icon className="mb-2" size={24} />
                <p className="font-semibold text-sm">{type.name}</p>
                <p className="text-xs text-slate-400 mt-1">{type.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Homepage Sections</h3>

        {SortedSections.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <Layout size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No sections yet. Add one to get started!</p>
          </div>
        ) : (
          SortedSections.map((section, index) => {
            const typeInfo = getSectionTypeInfo(section.type)
            const SectionIcon = typeInfo?.icon || Layout

            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(section)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-move hover:border-blue-500 transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="pt-1 opacity-0 group-hover:opacity-100 transition">
                    <GripVertical size={20} className="text-slate-500" />
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <SectionIcon size={20} className="text-blue-400 flex-shrink-0" />
                      <h4 className="text-lg font-semibold">
                        {section.title || typeInfo?.name || section.type}
                      </h4>
                      <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-300 text-xs rounded ml-auto">
                        {typeInfo?.name}
                      </span>
                    </div>

                    {section.description && (
                      <p className="text-sm text-slate-400 mb-3">{section.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      {section.image && (
                        <span className="px-2 py-1 bg-slate-700 rounded flex items-center gap-1">
                          <Image size={14} />
                          Has Image
                        </span>
                      )}
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: section.backgroundColor,
                          color: section.textColor,
                        }}
                      >
                        Color Preview
                      </span>
                      <span className="px-2 py-1 bg-slate-700 rounded">Order: {section.order}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(section.id)}
                      className={`p-2 rounded-lg transition ${
                        section.isVisible
                          ? 'text-green-400 hover:bg-slate-700'
                          : 'text-red-400 hover:bg-slate-700'
                      }`}
                      title={section.isVisible ? 'Hide' : 'Show'}
                    >
                      {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button
                      onClick={() => handleEdit(section)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full border border-slate-700 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Add Section' : 'Edit Section'}
            </h2>

            <div className="space-y-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sectionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Section Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />

              <input
                type="text"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Background Color</label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Text Color</label>
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="rounded"
                />
                <span>Visible on Homepage</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {modalMode === 'create' ? 'Add' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Info */}
      <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 text-blue-300">
        <p className="text-sm">
          💡 Drag sections to reorder them. Changes are live on your homepage. Use the visibility
          toggle to show/hide sections without deleting them.
        </p>
      </div>
    </div>
  )
}
