import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOrderMetrics,
  fetchOrderStatusDistribution,
} from '../../../store/slices/analyticsSlice'
import '../styles/OrderAnalytics.css'

const OrderAnalytics = ({ dateRange }) => {
  const dispatch = useDispatch()
  const { orderMetrics, orderStatusDistribution, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchOrderMetrics(dateRange))
    dispatch(fetchOrderStatusDistribution(dateRange))
  }, [dispatch, dateRange])

  if (loading) return <div className="loading">Loading order data...</div>

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#4169E1',
      shipped: '#9370DB',
      delivered: '#2ECC71',
      cancelled: '#E74C3C',
    }
    return colors[status] || '#95a5a6'
  }

  return (
    <div className="order-analytics">
      <div className="metrics-container">
        <div className="metric-card">
          <h3>Total Orders</h3>
          <div className="metric-value">{orderMetrics?.total_orders || 0}</div>
          <p className="metric-label">all time</p>
        </div>

        <div className="metric-card">
          <h3>Unique Customers</h3>
          <div className="metric-value">{orderMetrics?.unique_customers || 0}</div>
          <p className="metric-label">customers</p>
        </div>

        <div className="metric-card">
          <h3>Average Order Value</h3>
          <div className="metric-value">${(orderMetrics?.avg_order_value || 0).toFixed(2)}</div>
          <p className="metric-label">AOV</p>
        </div>

        <div className="metric-card">
          <h3>Total Revenue</h3>
          <div className="metric-value">${(orderMetrics?.total_revenue || 0).toFixed(2)}</div>
          <p className="metric-label">revenue</p>
        </div>
      </div>

      <div className="status-distribution">
        <h3>Order Status Distribution</h3>
        <div className="status-bars">
          {orderStatusDistribution && orderStatusDistribution.length > 0 ? (
            orderStatusDistribution.map((status, index) => {
              const percentage = status.percentage || 0
              return (
                <div key={index} className="status-bar">
                  <div className="status-label">
                    <span>{status.status}</span>
                    <span className="status-count">{status.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor(status.status),
                      }}
                    >
                      {percentage > 5 && (
                        <span className="percentage">{percentage.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="status-revenue">${parseFloat(status.revenue).toFixed(2)}</div>
                </div>
              )
            })
          ) : (
            <p>No order data available</p>
          )}
        </div>
      </div>

      <div className="order-breakdown">
        <h3>Order Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item pending">
            <span className="label">Pending</span>
            <span className="value">{orderMetrics?.pending_orders || 0}</span>
          </div>
          <div className="breakdown-item processing">
            <span className="label">Processing</span>
            <span className="value">{orderMetrics?.processing_orders || 0}</span>
          </div>
          <div className="breakdown-item shipped">
            <span className="label">Shipped</span>
            <span className="value">{orderMetrics?.shipped_orders || 0}</span>
          </div>
          <div className="breakdown-item delivered">
            <span className="label">Delivered</span>
            <span className="value">{orderMetrics?.delivered_orders || 0}</span>
          </div>
          <div className="breakdown-item cancelled">
            <span className="label">Cancelled</span>
            <span className="value">{orderMetrics?.cancelled_orders || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderAnalytics
