import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'

export default function OrderTransactionManager() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  })

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses = ['unpaid', 'paid', 'refunded']

  // Fetch orders
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/order/admin/getall')
      if (res.data.success) {
        const ordersList = (res.data.data?.orders || []).map((order) => ({
          id: order.id,
          customerName: order.buyer?.name || 'Unknown Customer',
          email: order.buyer?.email || 'N/A',
          items: order.order_items?.length || 0,
          total: parseFloat(order.total_price || 0),
          status: (order.order_status || 'pending').toLowerCase(),
          paymentStatus: (order.payment_status || 'unpaid').toLowerCase(),
          createdAt: new Date(order.created_at).toISOString().split('T')[0],
          deliveredAt: order.delivered_at
            ? new Date(order.delivered_at).toISOString().split('T')[0]
            : null,
          order_items: order.order_items || [],
          shipping_info: order.shipping_info || {},
        }))
        setOrders(ordersList)
        calculateStats(ordersList)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orderList) => {
    const totalOrders = orderList.length
    const pendingOrders = orderList.filter(
      (o) => o.status === 'pending' || o.status === 'processing',
    ).length
    const totalRevenue = orderList.reduce((sum, o) => sum + (o.total || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    setStats({
      totalOrders,
      pendingOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    })
  }

  // Filter orders
  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter((o) => o.createdAt === today)
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      filtered = filtered.filter((o) => o.createdAt >= weekAgo)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, dateFilter, orders])

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = async () => {
    try {
      await api.put(`${API_PREFIX}/order/admin/update/${selectedOrder.id}`, {
        status: newStatus,
      })
      const updated = orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: newStatus } : o,
      )
      setOrders(updated)
      setShowStatusModal(false)
      setShowDetailModal(false)
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order status')
    }
  }

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`${API_PREFIX}/order/admin/delete/${id}`)
        setOrders(orders.filter((o) => o.id !== id))
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500' }
      case 'processing':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500' }
      case 'shipped':
        return { icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500' }
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500' }
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500' }
      default:
        return { icon: ShoppingCart, color: 'text-slate-400', bg: 'bg-slate-500' }
    }
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: { color: 'bg-green-500', text: 'Paid' },
      unpaid: { color: 'bg-yellow-500', text: 'Unpaid' },
      refunded: { color: 'bg-red-500', text: 'Refunded' },
    }
    return badges[status] || { color: 'bg-slate-500', text: status }
  }

  const handleExport = () => {
    const csv = [
      ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date'],
      ...filteredOrders.map((o) => [
        o.id,
        o.customerName,
        o.items,
        `$${o.total}`,
        o.status,
        o.paymentStatus,
        o.createdAt,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    a.click()
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders & Transactions</h1>
          <p className="text-slate-400 mt-1">Manage orders, payments, and shipments</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Pending Orders</p>
          <p className="text-2xl font-bold mt-1 text-yellow-500">{stats.pendingOrders}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-1 text-green-500">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Avg Order Value</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">
            ${stats.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by order ID, customer, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const statusConfig = getStatusIcon(order.status)
                  const StatusIcon = statusConfig.icon
                  const paymentBadge = getPaymentStatusBadge(order.paymentStatus)

                  return (
                    <tr
                      key={order.id}
                      className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750 bg-opacity-50'}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-blue-400">{order.id}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-xs text-slate-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{order.items} items</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-400">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`flex items-center gap-2 ${statusConfig.color}`}>
                          <StatusIcon size={16} />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${paymentBadge.color} bg-opacity-20 text-white`}
                        >
                          {paymentBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{order.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowStatusModal(true)
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-yellow-400"
                            title="Update Status"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Order ID</p>
                <p className="text-lg font-semibold text-blue-400">{selectedOrder.id}</p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Customer</p>
                <p className="text-lg">{selectedOrder.customerName}</p>
                <p className="text-sm text-slate-400">{selectedOrder.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total</p>
                  <p className="text-lg font-semibold text-green-400">${selectedOrder.total}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Items</p>
                  <p className="text-lg font-semibold">{selectedOrder.items}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-lg font-semibold capitalize">{selectedOrder.status}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Update Order Status</h2>
            <p className="text-slate-400 mb-4">Order: {selectedOrder.id}</p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select New Status</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                disabled={!newStatus}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
