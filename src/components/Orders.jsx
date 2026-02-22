import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Header from './Header'
import { LoaderCircle, Eye, Truck, CheckCircle, XCircle, Search, Trash2 } from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'
import Button from './dashboard-components/Button'
import { toast } from 'react-toastify'
import { getAuthHeader } from '../utils/tokenManager'
import './Orders.css'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const itemsPerPage = 10

  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      console.log('🔑 Token from localStorage:', token ? 'Found' : 'NOT FOUND')

      if (!token) {
        toast.error('No authentication token found. Please login again.')
        return
      }

      // DEBUG: Decode token locally to see what user ID is in it
      try {
        const tokenParts = token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('🔐 Token payload:', {
          userId: payload.id,
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        })
      } catch (e) {
        console.log('⚠️ Could not decode token:', e.message)
      }

      // DEBUG: Check token role before fetching orders
      try {
        const debugRes = await api.get('/debug/token-role')
        console.log('🔐 Token Role Check:', debugRes.data)
        if (debugRes.data.dbRole !== 'Admin') {
          console.error(`❌ Token role is "${debugRes.data.dbRole}", not "Admin"!`)
          console.error(
            `   Your user: ${debugRes.data.userName} (ID: ${debugRes.data.userId?.substring(0, 8)}...)`,
          )
          toast.error(
            `Your current role is "${debugRes.data.dbRole}", not "Admin". Please log in with an Admin account.`,
          )
          return
        }
      } catch (debugError) {
        console.log('ℹ️ Debug endpoint not available, continuing with order fetch...')
      }

      const response = await api.get('/order/admin/getall')
      console.log('✅ Orders fetched successfully:', response.data)
      setOrders(response.data.data?.orders || [])
    } catch (error) {
      console.error('❌ Error fetching orders:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      })
      toast.error(`Failed to fetch orders: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/order/admin/update/${orderId}`, { status: newStatus })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update order status')
      console.error(error)
    }
  }

  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      await api.put(`/order/admin/payment/${orderId}`, {
        paymentStatus: newPaymentStatus,
      })
      toast.success('Payment status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update payment status')
      console.error(error)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm('Are you sure you want to delete this order? This action cannot be undone.')
    ) {
      try {
        await api.delete(`/order/admin/delete/${orderId}`)
        toast.success('Order deleted successfully')
        fetchOrders()
      } catch (error) {
        toast.error('Failed to delete order')
        console.error(error)
      }
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending'
      case 'Processing':
        return 'status-processing'
      case 'Shipped':
        return 'status-shipped'
      case 'Delivered':
        return 'status-delivered'
      case 'Cancelled':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
  }

  return (
    <div className="orders-container">
      <Header title="Orders Management" />

      <div className="orders-content">
        {/* Header Section */}
        <section className="orders-header-section">
          <div className="section-header">
            <h1 className="page-title">All Orders</h1>
          </div>
          <div className="stats-grid">
            <div className="stat-card bg-card card-shadow p-4 radius-md">
              <span className="text-xs text-muted-foreground">Total Orders</span>
              <div className="text-2xl font-bold text-foreground">{orders.length}</div>
            </div>
            <div className="stat-card bg-card card-shadow p-4 radius-md">
              <span className="text-xs text-muted-foreground">Processing</span>
              <div className="text-2xl font-bold text-foreground">
                {orders.filter((o) => o.order_status === 'Processing').length}
              </div>
            </div>
            <div className="stat-card bg-card card-shadow p-4 radius-md">
              <span className="text-xs text-muted-foreground">Delivered</span>
              <div className="text-2xl font-bold text-foreground">
                {orders.filter((o) => o.order_status === 'Delivered').length}
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="search-bar">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>

          <div className="status-filters">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('all')
                setCurrentPage(1)
              }}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('Pending')
                setCurrentPage(1)
              }}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Processing' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('Processing')
                setCurrentPage(1)
              }}
            >
              Processing
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Shipped' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('Shipped')
                setCurrentPage(1)
              }}
            >
              Shipped
            </button>
            <button
              className={`filter-btn ${filterStatus === 'Delivered' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('Delivered')
                setCurrentPage(1)
              }}
            >
              Delivered
            </button>
          </div>
        </section>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state">
              <LoaderCircle className="w-8 h-8 animate-spin" />
              <p>Loading orders...</p>
            </div>
          ) : paginatedOrders.length > 0 ? (
            <>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" aria-label="Select all orders" />
                    </th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <input type="checkbox" aria-label={`Select order ${order.id}`} />
                      </td>
                      <td className="font-semibold">#{order.id?.slice(-8) || order.id}</td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.user_info?.name || order.shipping_info?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.user_info?.email || order.shipping_info?.phone || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="font-semibold">৳ {order.total_price}</td>
                      <td>
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`status-select ${getStatusColor(order.order_status)}`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={order.paid_at ? 'Paid' : 'Pending'}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className={`status-select ${order.paid_at ? 'paid' : 'pending'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetails(true)
                            }}
                            className="action-btn view-btn"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="action-btn delete-btn"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="table-cards-container">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="table-card">
                    <div className="card-header">
                      <div className="card-title">Order #{order.id?.slice(-8) || order.id}</div>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Customer</span>
                      <span className="card-value">
                        <div>
                          <p className="font-medium">
                            {order.user_info?.name || order.shipping_info?.full_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.user_info?.email || order.shipping_info?.phone || 'N/A'}
                          </p>
                        </div>
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Date</span>
                      <span className="card-value">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Amount</span>
                      <span className="card-value font-semibold">৳ {order.total_price}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Status</span>
                      <span className="card-value">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`status-select ${getStatusColor(order.order_status)}`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Payment</span>
                      <span className="card-value">
                        <select
                          value={order.paid_at ? 'Paid' : 'Pending'}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className={`status-select ${order.paid_at ? 'paid' : 'pending'}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </span>
                    </div>
                    <div className="card-footer">
                      <div className="card-actions">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowDetails(true)
                          }}
                          className="action-btn view-btn"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="action-btn delete-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} ({filteredOrders.length} items)
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div
            className="modal-content max-w-2xl max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div>
                <h2 className="text-2xl font-bold">
                  Order #{selectedOrder.id?.slice(-8) || selectedOrder.id}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="modal-close text-2xl hover:bg-blue-800 rounded-full p-1 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="modal-body p-6 space-y-6">
              {/* Quick Stats */}
              <div className="modal-stats-section">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-green-600 text-xs font-semibold uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      ৳ {selectedOrder.total_price}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide">
                      Status
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${selectedOrder.order_status === 'Delivered' ? 'text-green-600' : selectedOrder.order_status === 'Processing' ? 'text-yellow-600' : 'text-blue-600'}`}
                    >
                      {selectedOrder.order_status}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-purple-600 text-xs font-semibold uppercase tracking-wide">
                      Items
                    </p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                      {selectedOrder.order_items?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="modal-customer-section">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    👤
                  </span>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Customer Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">
                      {selectedOrder.user_info?.name ||
                        selectedOrder.shipping_info?.full_name ||
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">
                      {selectedOrder.user_info?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">
                      {selectedOrder.shipping_info?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="modal-shipping-section">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    📍
                  </span>
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  {/* Full Address */}
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Full Shipping Address
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium mt-2">
                      {selectedOrder.shipping_info?.address || 'N/A'}
                    </p>
                  </div>

                  {/* Location Details - Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* City */}
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">
                        City
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.shipping_info?.city || 'N/A'}
                      </p>
                    </div>

                    {/* State */}
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">
                        State
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.shipping_info?.state || 'N/A'}
                      </p>
                    </div>

                    {/* Country */}
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">
                        Country
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.shipping_info?.country || 'N/A'}
                      </p>
                    </div>

                    {/* Postal Code */}
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide block mb-2">
                        Postal Code
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedOrder.shipping_info?.pincode || 'N/A'}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                        Phone
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedOrder.shipping_info?.phone || 'N/A'}
                      </p>
                    </div>

                    {/* Full Name (From Shipping) */}
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                        Recipient Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedOrder.shipping_info?.full_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="modal-items-section">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    📦
                  </span>
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.length > 0 ? (
                    selectedOrder.order_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                            <span>
                              Qty:{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                            </span>
                            <span>
                              Price:{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                ৳ {item.price}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ৳ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No items in this order
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="modal-summary-section">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ৳{' '}
                      {(
                        selectedOrder.total_price -
                        (selectedOrder.tax_price || 0) *
                          (selectedOrder.total_price / (1 + (selectedOrder.tax_price || 0))) -
                        (selectedOrder.shipping_price || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Tax (18%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ৳{' '}
                      {(
                        (selectedOrder.tax_price || 0) *
                        (selectedOrder.total_price / (1 + (selectedOrder.tax_price || 0)))
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Shipping:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ৳ {selectedOrder.shipping_price || 0}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-400 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ৳ {selectedOrder.total_price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
