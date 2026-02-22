import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Search, Filter, Eye, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'
import OrderDetailModal from '../modals/OrderDetailModal'
import PremiumTable from '../components/Premium/PremiumTable'

const OrderManagement = () => {
  const isDark = useSelector((state) => state.theme?.isDark) || false
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [filterStatus, sortBy])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      params.append('sortBy', sortBy)

      const response = await api.get(`/order/admin/getall?${params}`)
      if (response.data.success) {
        setOrders(response.data.data?.orders || [])
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error'
      toast.error('Failed to load orders: ' + errorMsg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/order/admin/update/${orderId}`, {
        order_status: newStatus,
      })

      // Verify response was successful before updating UI
      if (response.data.success || response.data.message) {
        setOrders(
          orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
        )
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
        toast.success('Order updated successfully')
      } else {
        toast.error('Failed to update order: ' + (response.data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
      toast.error('Error updating order: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/order/admin/delete/${orderId}`)
        setOrders(orders.filter((order) => order.id !== orderId))
        toast.success('Order deleted successfully')
      } catch (err) {
        console.error('Failed to delete order:', err)
        toast.error('Failed to delete order: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchMatch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    return searchMatch
  })

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
      case 'processing':
        return <Package size={16} className="text-blue-500" />
      case 'shipped':
        return <Truck size={16} className="text-purple-500" />
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />
      default:
        return null
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return isDark
          ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'processing':
        return isDark
          ? 'bg-blue-900/20 text-blue-400 border-blue-800'
          : 'bg-blue-50 text-blue-700 border-blue-200'
      case 'shipped':
        return isDark
          ? 'bg-purple-900/20 text-purple-400 border-purple-800'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      case 'delivered':
        return isDark
          ? 'bg-green-900/20 text-green-400 border-green-800'
          : 'bg-green-50 text-green-700 border-green-200'
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Order Management
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 sm:p-6 mb-6`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search
                size={18}
                className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-2 rounded-lg border appearance-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              <ChevronDown
                size={18}
                className={`absolute right-3 top-3 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border appearance-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="date">Latest First</option>
                <option value="amount">Highest Amount</option>
                <option value="status">By Status</option>
              </select>
              <ChevronDown
                size={18}
                className={`absolute right-3 top-3 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>
          </div>
        </div>

        {/* Premium Table */}
        <PremiumTable
          columns={[
            { id: 'id', label: 'Order ID', type: 'text' },
            { id: 'customer', label: 'Customer', type: 'text' },
            { id: 'total', label: 'Total', type: 'currency' },
            { id: 'status', label: 'Status', type: 'status' },
            { id: 'date', label: 'Date', type: 'date' },
          ]}
          data={paginatedOrders.map((order) => ({
            ...order,
            date: new Date(order.date).toLocaleDateString('bn-BD'),
          }))}
          actions={[
            {
              id: 'view',
              label: 'View',
              icon: Eye,
              onClick: (item) => {
                setSelectedOrder(item)
                setShowDetailModal(true)
              },
              variant: 'primary',
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              onClick: (item) => handleDeleteOrder(item.id),
              variant: 'danger',
            },
          ]}
          loading={loading}
          emptyMessage="No orders found"
        />
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowDetailModal(false)}
          onStatusUpdate={handleStatusUpdate}
          isDark={isDark}
        />
      )}
    </div>
  )
}

export default OrderManagement
