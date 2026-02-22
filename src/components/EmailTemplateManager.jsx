import React, { useState, useEffect } from 'react'
import { Edit2, Save, X, Eye, Code } from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import { toast } from 'react-toastify'

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    variables: [],
    is_active: true,
  })

  // Fetch templates
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/content/email-templates')
      setTemplates(data.data)
    } catch (error) {
      toast.error('Failed to fetch email templates')
    }
    setLoading(false)
  }

  // Handle edit
  const handleEdit = (template) => {
    setEditingId(template.id)
    setSelectedTemplate(template)
    setFormData({
      subject: template.subject,
      body: template.body,
      variables: template.variables || [],
      is_active: template.is_active,
    })
  }

  // Handle save
  const handleSave = async () => {
    try {
      await api.put(`/content/email-templates/${editingId}`, formData)
      toast.success('Email template updated successfully')
      setEditingId(null)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error) {
      toast.error('Failed to update template')
    }
  }

  // Insert variable
  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea[name="body"]')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end)
      setFormData({ ...formData, body: newText })
    }
  }

  const templateCategories = {
    'Order Management': [
      { id: 'order_confirmation', name: 'Order Confirmation' },
      { id: 'order_shipped', name: 'Order Shipped' },
    ],
    'User Engagement': [
      { id: 'welcome_email', name: 'Welcome Email' },
      { id: 'promotional', name: 'Promotional' },
    ],
    'Account Management': [{ id: 'password_reset', name: 'Password Reset' }],
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Email Templates</h1>
        <p className="text-slate-400 mt-1">
          Manage your transactional and marketing email templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1 space-y-4">
          {Object.entries(templateCategories).map(([category, items]) => (
            <div
              key={category}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
            >
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h3 className="text-sm font-semibold text-slate-300">{category}</h3>
              </div>
              <div className="divide-y divide-slate-700">
                {templates
                  .filter((t) => items.some((item) => item.id === t.name))
                  .map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleEdit(template)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition ${
                        editingId === template.id ? 'bg-blue-600' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-300">
                        {items.find((i) => i.id === template.name)?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {template.is_active ? '✓ Active' : '✗ Inactive'}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editingId && selectedTemplate && (
          <div className="lg:col-span-2 space-y-4">
            {/* Mode Switcher */}
            <div className="flex gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2">
              <button
                onClick={() => setPreviewMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded transition ${
                  !previewMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Code size={16} /> Edit
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded transition ${
                  previewMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Eye size={16} /> Preview
              </button>
            </div>

            {/* Edit Mode */}
            {!previewMode ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-300">Email Body</label>
                    <span className="text-xs text-slate-500">
                      Use {{ variable }} for dynamic content
                    </span>
                  </div>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-96"
                  />
                </div>

                {/* Variables */}
                {formData.variables && formData.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Available Variables
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.variables.map((variable, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertVariable(variable)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition text-left"
                        >
                          {`{{${variable}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                  />
                  <label htmlFor="active" className="text-slate-300 cursor-pointer">
                    Email template is active
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setSelectedTemplate(null)
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <Save size={16} /> Save Template
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="bg-white rounded-lg p-8 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Subject</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">{formData.subject}</h2>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Preview</p>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {formData.body}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Selection */}
        {!editingId && (
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-12 text-center flex items-center justify-center">
            <div>
              <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select an email template to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Icon component
function Mail({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        opacity="0.3"
      />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  )
}
