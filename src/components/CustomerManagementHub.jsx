import React, { useState, useEffect } from 'react'
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Search,
  MessageSquare,
  Eye,
  UserPlus,
  Filter,
  Download,
  AlertCircle,
} from 'lucide-react'
import api, { API_PREFIX } from '../lib/axios'

export default function CustomerManagementHub() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    totalSpent: 0,
  })

  // Fetch customers
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/customers')
      const users = res.data.users || []

      // Fetch order data for each customer
      const customersWithOrders = await Promise.all(
        users.map(async (user) => {
          try {
            const ordersRes = await api.get(`/admin/customers/${user.id}/orders`)
            const userOrders = ordersRes.data.orders || []
            return {
              ...user,
              totalOrders: userOrders.length,
              totalSpent: userOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
            }
          } catch (error) {
            return {
              ...user,
              totalOrders: 0,
              totalSpent: 0,
            }
          }
        }),
      )

      setCustomers(customersWithOrders)
      calculateStats(customersWithOrders)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (userList) => {
    const totalOrders = userList.reduce((sum, u) => sum + (u.totalOrders || 0), 0)
    const totalSpent = userList.reduce(
      (sum, u) => sum + (typeof u.totalSpent === 'number' ? u.totalSpent : 0),
      0,
    )

    setStats({
      totalCustomers: userList.length,
      activeCustomers: userList.filter((u) => u.status === 'active').length,
      totalOrders: totalOrders,
      totalSpent: typeof totalSpent === 'number' ? parseFloat(totalSpent.toFixed(2)) : 0,
    })
  }

  // Filter customers
  useEffect(() => {
    let filtered = customers

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone?.includes(searchQuery),
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => (c.status || 'active') === statusFilter)
    }

    setFilteredCustomers(filtered)
  }, [searchQuery, statusFilter, customers])

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
  }

  const handleSendMessage = async () => {
    try {
      // Integration point for sending customer messages
      console.log('Sending message to:', selectedCustomer.email, messageText)
      alert('Message sent successfully')
      setMessageText('')
      setShowMessageModal(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/admin/delete/${id}`)
        fetchCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Join Date', 'Status'],
      ...filteredCustomers.map((c) => [
        c.id,
        c.name,
        c.email,
        c.phone || 'N/A',
        new Date(c.created_at).toLocaleDateString(),
        c.status || 'active',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customers.csv'
    a.click()
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Management</h1>
          <p className="text-slate-400 mt-1">Manage customers, view orders, send messages</p>
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
          <p className="text-slate-400 text-sm">Total Customers</p>
          <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-500">{stats.activeCustomers}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Spent</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">${stats.totalSpent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={40} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Customer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Join Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750 bg-opacity-50'}
                  >
                    <td className="px-6 py-4 text-sm font-semibold">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                      <Mail size={14} />
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {customer.phone ? (
                        <span className="flex items-center gap-2">
                          <Phone size={14} />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (customer.status || 'active') === 'active'
                            ? 'bg-green-500 bg-opacity-20 text-green-300'
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                        }`}
                      >
                        {(customer.status || 'active').charAt(0).toUpperCase() +
                          (customer.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowMessageModal(true)
                          }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-green-400"
                          title="Send Message"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Full Name</p>
                <p className="text-lg font-semibold">{selectedCustomer.name}</p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-lg flex items-center gap-2">
                  <Mail size={16} />
                  {selectedCustomer.email}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Phone</p>
                <p className="text-lg">
                  {selectedCustomer.phone ? (
                    <span className="flex items-center gap-2">
                      <Phone size={16} />
                      {selectedCustomer.phone}
                    </span>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-lg">
                  {new Date(selectedCustomer.created_at).toLocaleDateString()}
                </p>
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

      {/* Message Modal */}
      {showMessageModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Send Message</h2>
            <p className="text-slate-400 mb-4">To: {selectedCustomer.email}</p>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
            />

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
