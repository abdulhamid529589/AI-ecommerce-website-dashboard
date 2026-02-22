import React, { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import api from '../lib/axios'

const CustomerDetailModal = ({ customer, onClose, isDark }) => {
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    fetchCustomerOrders()
  }, [customer.id])

  const fetchCustomerOrders = async () => {
    try {
      setLoadingOrders(true)
      const response = await api.get(`/admin/customers/${customer.id}/orders`)
      setOrders(response.data.orders || [])
    } catch (err) {
      console.error('Failed to fetch customer orders:', err)
      // Mock data for development
      setOrders([
        {
          id: 'ORD-001',
          date: '2024-01-14',
          total: 5000,
          status: 'delivered',
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          total: 3900,
          status: 'delivered',
        },
      ])
    } finally {
      setLoadingOrders(false)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {customer.name}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Basic Information
            </h3>
            <div className={`space-y-3 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {customer.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {customer.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>City:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {customer.city}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Member Since:</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(customer.joinDate).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {customer.orders}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Orders
              </p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {formatCurrency(customer.totalSpent)}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Spent
              </p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {customer.orders > 0 ? formatCurrency(customer.totalSpent / customer.orders) : '০'}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Order
              </p>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Order History
            </h3>
            {loadingOrders ? (
              <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading orders...
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {order.id}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(order.date).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(order.total)}
                      </p>
                      <p
                        className={`text-xs capitalize ${order.status === 'delivered' ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No orders yet
              </div>
            )}
          </div>

          {/* Last Order */}
          {customer.lastOrder && (
            <div
              className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <p
                className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Last Order Date
              </p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(customer.lastOrder).toLocaleDateString('bn-BD')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerDetailModal
