import React, { useEffect, useState } from 'react'
import api from '../../lib/axios'

const ActivityFeed = ({ title, type, isDark }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems()
  }, [type])

  const fetchItems = async () => {
    try {
      const endpoint = type === 'orders' ? '/admin/recent-orders' : '/admin/top-products'
      const response = await api.get(endpoint)
      setItems(response.data[type] || response.data || [])
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err)
      if (type === 'orders') {
        setItems([
          {
            id: 'ORD-001',
            customer: 'Ahmed Hassan',
            amount: 12500,
            status: 'delivered',
            time: '2 hours ago',
          },
          {
            id: 'ORD-002',
            customer: 'Fatima Khan',
            amount: 8900,
            status: 'shipped',
            time: '4 hours ago',
          },
        ])
      } else {
        setItems([
          {
            id: 1,
            name: 'Premium Cotton Sheet Set',
            sales: 342,
            revenue: 450000,
          },
          {
            id: 2,
            name: 'Luxury Pillow',
            sales: 156,
            revenue: 300000,
          },
        ])
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return isDark ? 'text-green-400' : 'text-green-600'
      case 'shipped':
        return isDark ? 'text-blue-400' : 'text-blue-600'
      case 'processing':
        return isDark ? 'text-yellow-400' : 'text-yellow-600'
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600'
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
    <div
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
    >
      <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between pb-3 ${idx < items.length - 1 ? (isDark ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''}`}
          >
            {type === 'orders' ? (
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.id}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.customer}
                </p>
              </div>
            ) : (
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.sales} sales
                </p>
              </div>
            )}
            <div className="text-right">
              {type === 'orders' ? (
                <>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(item.amount)}
                  </p>
                  <p className={`text-xs ${getStatusColor(item.status)}`}>{item.status}</p>
                </>
              ) : (
                <>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>revenue</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
