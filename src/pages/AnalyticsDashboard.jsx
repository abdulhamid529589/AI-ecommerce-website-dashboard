import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDashboardSummary,
  fetchRevenueMetrics,
  fetchRevenueChart,
  fetchTopProducts,
  fetchCustomerSegments,
  fetchOrderMetrics,
  fetchOrderStatusDistribution,
  fetchInventoryAnalytics,
  fetchCategoryPerformance,
  fetchReviewAnalytics,
} from '../../store/slices/analyticsSlice'
import RevenueOverview from './components/RevenueOverview'
import ProductPerformance from './components/ProductPerformance'
import CustomerAnalytics from './components/CustomerAnalytics'
import OrderAnalytics from './components/OrderAnalytics'
import InventoryHealth from './components/InventoryHealth'
import ReviewAnalytics from './components/ReviewAnalytics'
import { useSocket } from '../hooks/useSocket'
import './AnalyticsDashboard.css'

const AnalyticsDashboard = () => {
  const dispatch = useDispatch()
  const { socket, isConnected } = useSocket('dashboard')
  const { loading, error, dashboardSummary } = useSelector((state) => state.analytics)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    // Load dashboard summary on component mount
    dispatch(fetchDashboardSummary(dateRange))
  }, [dispatch, dateRange])

  // Socket.IO Listener for Real-Time Analytics Updates
  useEffect(() => {
    if (!socket) return

    socket.on('analytics:updated', (data) => {
      console.log('📱 [Dashboard] Analytics update received')
      dispatch(fetchDashboardSummary(dateRange))
    })

    return () => {
      socket.off('analytics:updated')
    }
  }, [socket, dispatch, dateRange])

  const handleDateChange = (start, end) => {
    setDateRange({
      startDate: start,
      endDate: end,
    })
  }

  if (loading && !dashboardSummary) {
    return (
      <div className="analytics-dashboard loading">
        <div className="spinner">Loading Analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-dashboard error">
        <div className="error-message">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="date-range-picker">
          <input
            type="date"
            value={dateRange.startDate || ''}
            onChange={(e) => handleDateChange(e.target.value, dateRange.endDate)}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate || ''}
            onChange={(e) => handleDateChange(dateRange.startDate, e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && <OverviewTab dateRange={dateRange} />}
        {activeTab === 'revenue' && <RevenueOverview dateRange={dateRange} />}
        {activeTab === 'products' && <ProductPerformance dateRange={dateRange} />}
        {activeTab === 'customers' && <CustomerAnalytics dateRange={dateRange} />}
        {activeTab === 'orders' && <OrderAnalytics dateRange={dateRange} />}
        {activeTab === 'inventory' && <InventoryHealth />}
        {activeTab === 'reviews' && <ReviewAnalytics />}
      </div>
    </div>
  )
}

const OverviewTab = ({ dateRange }) => {
  const { dashboardSummary } = useSelector((state) => state.analytics)

  if (!dashboardSummary) return <div>No data available</div>

  return (
    <div className="overview-grid">
      <div className="metric-card">
        <h3>Total Revenue</h3>
        <div className="metric-value">${(dashboardSummary.revenue?.total || 0).toFixed(2)}</div>
        <p className="metric-label">{dashboardSummary.revenue?.orders} orders</p>
      </div>

      <div className="metric-card">
        <h3>Average Order Value</h3>
        <div className="metric-value">
          ${(dashboardSummary.revenue?.avgOrderValue || 0).toFixed(2)}
        </div>
        <p className="metric-label">AOV</p>
      </div>

      <div className="metric-card">
        <h3>Total Users</h3>
        <div className="metric-value">{dashboardSummary.users?.total || 0}</div>
        <p className="metric-label">{dashboardSummary.users?.newThisWeek} new this week</p>
      </div>

      <div className="metric-card">
        <h3>Products</h3>
        <div className="metric-value">{dashboardSummary.products?.total || 0}</div>
        <p className="metric-label">{dashboardSummary.products?.outOfStock} out of stock</p>
      </div>

      <div className="metric-card">
        <h3>Orders Delivered</h3>
        <div className="metric-value">{dashboardSummary.orders?.delivered || 0}</div>
        <p className="metric-label">{dashboardSummary.orders?.cancelled} cancelled</p>
      </div>

      <div className="metric-card">
        <h3>Average Price</h3>
        <div className="metric-value">${(dashboardSummary.products?.avgPrice || 0).toFixed(2)}</div>
        <p className="metric-label">per product</p>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
