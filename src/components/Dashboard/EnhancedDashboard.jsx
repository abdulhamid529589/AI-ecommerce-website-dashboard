import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  RefreshCw,
  MoreVertical,
  Calendar,
  Download,
} from 'lucide-react'
import api from '../../lib/axios'
import PremiumCard from './Premium/PremiumCard'
import './EnhancedDashboard.css'

/**
 * INSANE-LEVEL DASHBOARD HOME
 * Premium design with glass morphism, real-time stats, and smooth animations
 */

export const EnhancedDashboard = () => {
  const [stats, setStats] = useState({
    revenue: { total: 0, trend: 0, lastMonth: 0 },
    orders: { total: 0, pending: 0, trend: 0 },
    customers: { total: 0, newThisMonth: 0, trend: 0 },
    conversionRate: { rate: 0, trend: 0 },
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('month')

  // Fetch Dashboard Stats
  useEffect(() => {
    fetchDashboardStats()
  }, [timeRange])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/dashboard`)
      if (response.data.success) {
        setStats(response.data.data)
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardStats()
    setRefreshing(false)
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="enhanced-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Header Section */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back! Here's your business overview.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex gap-2">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-300
                      ${
                        timeRange === range
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300/50'
                      }
                    `}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-lg bg-gray-200/50 dark:bg-gray-700/50
                  hover:bg-gray-300/50 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {/* Download Button */}
              <button
                className="p-2.5 rounded-lg bg-gray-200/50 dark:bg-gray-700/50
                hover:bg-gray-300/50 transition-all duration-300"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PremiumCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue.total)}
            trend={stats.revenue.trend}
            trendLabel="vs last month"
            icon={DollarSign}
            color="blue"
            loading={loading}
            details={[
              { label: 'This Month', value: formatCurrency(stats.revenue.total) },
              { label: 'Last Month', value: formatCurrency(stats.revenue.lastMonth) },
            ]}
          />

          <PremiumCard
            title="Total Orders"
            value={stats.orders.total || 0}
            trend={stats.orders.trend}
            trendLabel="vs last month"
            icon={ShoppingCart}
            color="green"
            loading={loading}
            details={[
              { label: 'Pending', value: stats.orders.pending || 0 },
              { label: 'Completed', value: stats.orders.total - (stats.orders.pending || 0) },
            ]}
          />

          <PremiumCard
            title="Total Customers"
            value={stats.customers.total || 0}
            trend={stats.customers.trend}
            trendLabel="vs last month"
            icon={Users}
            color="purple"
            loading={loading}
            details={[
              { label: 'New This Month', value: stats.customers.newThisMonth || 0 },
              {
                label: 'Returning',
                value: stats.customers.total - (stats.customers.newThisMonth || 0),
              },
            ]}
          />

          <PremiumCard
            title="Conversion Rate"
            value={`${stats.conversionRate.rate || 0}%`}
            trend={stats.conversionRate.trend}
            trendLabel="vs last month"
            icon={TrendingUp}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Charts & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div
            className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80
            border border-gray-200/20 dark:border-gray-700/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Trend</h2>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Placeholder Chart */}
            <div
              className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl
              flex items-center justify-center"
            >
              <p className="text-gray-500 dark:text-gray-400">
                Chart Component (Integration Ready)
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div
            className="rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80
            border border-gray-200/20 dark:border-gray-700/20 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>

            <div className="space-y-3">
              {[
                { id: '#1001', customer: 'Ahmed Khan', amount: '৳2,500', status: 'Delivered' },
                { id: '#1000', customer: 'Fatima Ali', amount: '৳1,200', status: 'Processing' },
                { id: '#999', customer: 'Hassan Ali', amount: '৳3,800', status: 'Pending' },
                { id: '#998', customer: 'Zainab Hassan', amount: '৳950', status: 'Delivered' },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3
                  rounded-lg bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50
                  dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{order.id}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {order.amount}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                          : order.status === 'Processing'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
