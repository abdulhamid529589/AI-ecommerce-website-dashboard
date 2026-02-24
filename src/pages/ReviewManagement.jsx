import React, { useEffect, useState } from 'react'
import { Search, MoreVertical, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import api from '../lib/axios'
import { useSocket } from '../hooks/useSocket'
import './ReviewManagement.css'

const ReviewManagement = () => {
  const { socket, isConnected } = useSocket('dashboard')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  // Socket.IO Listener for Real-Time Review Updates
  useEffect(() => {
    if (!socket) return

    socket.on('reviews:changed', (data) => {
      console.log('📱 [Dashboard] Review update received:', data.action)
      fetchReviews()
    })

    return () => {
      socket.off('reviews:changed')
    }
  }, [socket])

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      // This would be the endpoint to get all reviews for admin moderation
      // For now, we'll construct a query to fetch reviews
      const response = await api.get('/product/admin/reviews')
      setReviews(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId) => {
    try {
      await api.patch(`/product/review/${reviewId}/status`, {
        status: 'approved',
      })
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' } : r)))
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, status: 'approved' })
      }
    } catch (err) {
      console.error('Error approving review:', err)
      alert('Failed to approve review')
    }
  }

  const handleReject = async (reviewId) => {
    try {
      await api.patch(`/product/review/${reviewId}/status`, {
        status: 'rejected',
      })
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: 'rejected' } : r)))
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, status: 'rejected' })
      }
    } catch (err) {
      console.error('Error rejecting review:', err)
      alert('Failed to reject review')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      await api.delete(`/product/review/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setShowDetailModal(false)
    } catch (err) {
      console.error('Error deleting review:', err)
      alert('Failed to delete review')
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesFilter = filter === 'all' || review.status === filter
    const matchesSearch =
      searchQuery === '' ||
      review.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="review-management">
      <div className="review-header">
        <h1>Review Moderation</h1>
        <p>Manage and moderate product reviews</p>
      </div>

      {/* Stats */}
      <div className="review-stats">
        <div className="stat-card">
          <span className="stat-label">Total Reviews</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-label">Approved</span>
          <span className="stat-value">{stats.approved}</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-label">Rejected</span>
          <span className="stat-value">{stats.rejected}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="review-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by product, user, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="review-loading">
          <div className="spinner">Loading reviews...</div>
        </div>
      )}

      {/* Reviews Table */}
      {!loading && (
        <div className="reviews-table-container">
          {filteredReviews.length > 0 ? (
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className={`status-${review.status}`}>
                    <td className="product-name">{review.product_name || 'N/A'}</td>
                    <td className="user-name">{review.user_name || 'Anonymous'}</td>
                    <td className="rating">
                      <div className="stars">{'⭐'.repeat(review.rating)}</div>
                    </td>
                    <td className="comment-preview">
                      <div className="comment-text">{review.comment}</div>
                    </td>
                    <td className="status">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="date">{new Date(review.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          setSelectedReview(review)
                          setShowDetailModal(true)
                        }}
                        title="View Details"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-reviews">
              <p>No reviews found</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onApprove={() => handleApprove(selectedReview.id)}
          onReject={() => handleReject(selectedReview.id)}
          onDelete={() => handleDelete(selectedReview.id)}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  )
}

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'orange', icon: AlertCircle, label: 'Pending' },
    approved: { color: 'green', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'red', icon: XCircle, label: 'Rejected' },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className={`status-badge status-${status}`}>
      <Icon size={14} />
      <span>{config.label}</span>
    </div>
  )
}

/**
 * Review Detail Modal
 */
const ReviewDetailModal = ({ review, onApprove, onReject, onDelete, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Review Details</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <label>Product:</label>
            <p>{review.product_name}</p>
          </div>

          <div className="detail-section">
            <label>User:</label>
            <p>{review.user_name || 'Anonymous'}</p>
          </div>

          <div className="detail-section">
            <label>Rating:</label>
            <p className="rating-stars">{'⭐'.repeat(review.rating)}</p>
          </div>

          <div className="detail-section">
            <label>Comment:</label>
            <p className="comment-full">{review.comment}</p>
          </div>

          <div className="detail-section">
            <label>Date:</label>
            <p>{new Date(review.created_at).toLocaleString()}</p>
          </div>

          <div className="detail-section">
            <label>Status:</label>
            <p>
              <StatusBadge status={review.status} />
            </p>
          </div>
        </div>

        <div className="modal-footer">
          {review.status !== 'approved' && (
            <button className="btn btn-approve" onClick={onApprove}>
              <CheckCircle size={16} />
              Approve
            </button>
          )}
          {review.status !== 'rejected' && (
            <button className="btn btn-reject" onClick={onReject}>
              <XCircle size={16} />
              Reject
            </button>
          )}
          <button className="btn btn-delete" onClick={onDelete}>
            <Trash2 size={16} />
            Delete
          </button>
          <button className="btn btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewManagement
