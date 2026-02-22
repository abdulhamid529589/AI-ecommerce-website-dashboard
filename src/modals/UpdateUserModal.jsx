import React, { useState, useEffect } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import '../styles/modals.css'
import { getOperationErrorMessage } from '../utils/errorHandler'

const UpdateUserModal = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate at least one field is filled
    if (!formData.name && !formData.email && !formData.password) {
      toast.error('Please update at least one field')
      return
    }

    // Validate name
    if (formData.name && formData.name.length < 3) {
      toast.error('Name must be at least 3 characters long')
      return
    }

    // Validate password
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const updateData = {}

      if (formData.name) updateData.name = formData.name
      if (formData.email) updateData.email = formData.email
      if (formData.password) updateData.password = formData.password

      const response = await api.put(`/admin/update/${user.id}`, updateData)

      toast.success('User updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(getOperationErrorMessage('updateUser', error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Update User: {user?.name}</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* User Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter new name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              minLength="3"
            />
            <p className="form-hint">Leave empty to keep current name</p>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter new email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-hint">Leave empty to keep current email</p>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              minLength="6"
            />
            <p className="form-hint">Leave empty to keep current password (min 6 characters)</p>
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
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateUserModal
