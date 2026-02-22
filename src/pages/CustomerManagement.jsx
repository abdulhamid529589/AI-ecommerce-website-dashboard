import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Search, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../lib/axios'
import CustomerDetailModal from '../modals/CustomerDetailModal'
import PremiumTable from '../components/Premium/PremiumTable'

const CustomerManagement = () => {
  const isDark = useSelector((state) => state.theme?.isDark) || false
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSegment, setFilterSegment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    fetchCustomers()
  }, [filterSegment, currentPage])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', currentPage)
      params.append('limit', itemsPerPage)
      if (filterSegment !== 'all') params.append('segment', filterSegment)
      if (searchTerm) params.append('search', searchTerm)

      const response = await api.get(`/admin/customers?${params}`)

      if (response.data.users) {
        setCustomers(response.data.users)
        setTotalCustomers(response.data.totalUsers || 0)
        setTotalPages(Math.ceil((response.data.totalUsers || 0) / itemsPerPage))
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      toast.error('Failed to load customers: ' + (err.message || 'Unknown error'))
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer account?')) {
      try {
        await api.delete(`/admin/delete/${customerId}`)
        setCustomers(customers.filter((c) => c.id !== customerId))
        toast.success('Customer deleted successfully')
      } catch (err) {
        console.error('Failed to delete customer:', err)
        toast.error('Failed to delete customer: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to page 1 when searching
  }

  const getSegmentBadge = (segment) => {
    switch (segment) {
      case 'vip':
        return isDark
          ? 'bg-purple-900/20 text-purple-400 border-purple-800'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      case 'regular':
        return isDark
          ? 'bg-blue-900/20 text-blue-400 border-blue-800'
          : 'bg-blue-50 text-blue-700 border-blue-200'
      case 'new':
        return isDark
          ? 'bg-green-900/20 text-green-400 border-green-800'
          : 'bg-green-50 text-green-700 border-green-200'
      case 'inactive':
        return isDark
          ? 'bg-gray-700 text-gray-300 border-gray-600'
          : 'bg-gray-100 text-gray-700 border-gray-300'
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

  const getStats = () => {
    const totalCustomers = customers.length
    const vipCustomers = customers.filter((c) => c.segment === 'vip').length
    const newCustomers = customers.filter((c) => c.segment === 'new').length
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

    return { totalCustomers, vipCustomers, newCustomers, totalRevenue }
  }

  const stats = getStats()

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
            Customer Management
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your customer base
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div
            className={`p-4 sm:p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Customers
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {stats.totalCustomers}
            </p>
          </div>
          <div
            className={`p-4 sm:p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              VIP Members
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
            >
              {stats.vipCustomers}
            </p>
          </div>
          <div
            className={`p-4 sm:p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              New This Month
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
            >
              {stats.newCustomers}
            </p>
          </div>
          <div
            className={`p-4 sm:p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Revenue
            </p>
            <p
              className={`text-lg sm:text-xl font-bold mt-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
            >
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 sm:p-6 mb-6`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
            </div>

            {/* Segment Filter */}
            <div className="relative">
              <select
                value={filterSegment}
                onChange={(e) => {
                  setFilterSegment(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-2 rounded-lg border appearance-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="all">All Segments</option>
                <option value="vip">VIP Members</option>
                <option value="regular">Regular</option>
                <option value="new">New Customers</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Premium Table */}
        <PremiumTable
          columns={[
            { id: 'name', label: 'Customer', type: 'text' },
            { id: 'email', label: 'Email', type: 'text' },
            { id: 'segment', label: 'Segment', type: 'status' },
            { id: 'orders', label: 'Orders', type: 'number' },
            { id: 'totalSpent', label: 'Total Spent', type: 'currency' },
          ]}
          data={customers}
          actions={[
            {
              id: 'view',
              label: 'View',
              icon: Eye,
              onClick: (item) => {
                setSelectedCustomer(item)
                setShowDetailModal(true)
              },
              variant: 'primary',
            },
            {
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              onClick: (item) => handleDeleteCustomer(item.id),
              variant: 'danger',
            },
          ]}
          loading={loading}
          emptyMessage="No customers found"
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing page {currentPage} of {totalPages} ({totalCustomers} total customers)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === 1
                    ? isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                    : isDark
                      ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === totalPages
                    ? isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                    : isDark
                      ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setShowDetailModal(false)}
          isDark={isDark}
        />
      )}
    </div>
  )
}

export default CustomerManagement
