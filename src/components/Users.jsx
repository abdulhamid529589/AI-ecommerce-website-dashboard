import React, { useEffect, useState } from 'react'
import avatar from '../assets/avatar.jpg'
import { useSelector } from 'react-redux'
import Header from './Header'
import Button from './dashboard-components/Button'
import { LoaderCircle, Search, Trash2, Mail, Phone, Edit2 } from 'lucide-react'
import api from '../lib/axios'
import { toast } from 'react-toastify'
import UpdateUserModal from '../modals/UpdateUserModal'
import { getOperationErrorMessage } from '../utils/errorHandler'
import './Users.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const itemsPerPage = 10

  const { user: authUser } = useSelector((state) => state.auth)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/getallusers')
      setUsers(response.data.users || [])
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    ) {
      try {
        await api.delete(`/admin/delete/${userId}`)
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        toast.error(getOperationErrorMessage('deleteUser', error))
        console.error(error)
      }
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowUpdateModal(true)
  }

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false)
    fetchUsers()
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="users-container">
      <Header title="Users Management" />

      <div className="users-content">
        {/* Header Section */}
        <section className="users-header-section">
          <div className="section-header">
            <h1 className="page-title">Users Management</h1>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{users.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Customers</span>
              <span className="stat-value">{users.filter((u) => u.role === 'User').length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Admins</span>
              <span className="stat-value">{users.filter((u) => u.role === 'Admin').length}</span>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="search-bar">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>

          <div className="role-filters">
            <button
              className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilterRole('all')
                setCurrentPage(1)
              }}
            >
              All Users
            </button>
            <button
              className={`filter-btn ${filterRole === 'User' ? 'active' : ''}`}
              onClick={() => {
                setFilterRole('User')
                setCurrentPage(1)
              }}
            >
              Customers
            </button>
            <button
              className={`filter-btn ${filterRole === 'Admin' ? 'active' : ''}`}
              onClick={() => {
                setFilterRole('Admin')
                setCurrentPage(1)
              }}
            >
              Admins
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <div className="users-grid">
          {loading ? (
            <div className="loading-state">
              <LoaderCircle className="w-8 h-8 animate-spin" />
              <p>Loading users...</p>
            </div>
          ) : paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="card-header">
                  <img src={user.avatar || avatar} alt={user.name} className="user-avatar" />
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role}</span>
                </div>

                <div className="card-content">
                  <h3 className="user-name">{user.name}</h3>

                  <div className="contact-info">
                    <div className="info-item">
                      <Mail className="w-3.5 h-3.5" />
                      <span title={user.email}>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="info-item">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="user-stats">
                    <div className="stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-number">{user.totalOrders || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Spent</span>
                      <span className="stat-number">
                        ৳{(user.totalSpent || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="card-meta">
                    Joined{' '}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div className="card-footer">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="edit-btn"
                    title="Edit user"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedUsers.length > 0 && (
          <div className="pagination mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <div className="pagination-info">
              Page {currentPage} of {totalPages} ({filteredUsers.length} users)
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Update User Modal */}
      {showUpdateModal && selectedUser && (
        <UpdateUserModal
          user={selectedUser}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  )
}

export default Users
