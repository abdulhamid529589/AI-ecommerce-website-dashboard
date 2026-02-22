import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRevenueMetrics, fetchRevenueChart } from '../../../store/slices/analyticsSlice'
import '../styles/RevenueOverview.css'

const RevenueOverview = ({ dateRange }) => {
  const dispatch = useDispatch()
  const { revenueMetrics, revenueChart, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchRevenueMetrics(dateRange))
    dispatch(fetchRevenueChart({ ...dateRange, period: 'daily' }))
  }, [dispatch, dateRange])

  if (loading) return <div className="loading">Loading revenue data...</div>

  return (
    <div className="revenue-overview">
      <div className="metrics-container">
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <div className="metric-value">${(revenueMetrics?.totalRevenue || 0).toFixed(2)}</div>
          <p className="growth-rate">Growth: {revenueMetrics?.growthRate?.toFixed(2)}%</p>
        </div>

        <div className="metric-card">
          <h3>Total Orders</h3>
          <div className="metric-value">{revenueMetrics?.totalOrders || 0}</div>
          <p className="metric-label">orders processed</p>
        </div>

        <div className="metric-card">
          <h3>Average Order Value</h3>
          <div className="metric-value">${(revenueMetrics?.avgOrderValue || 0).toFixed(2)}</div>
          <p className="metric-label">AOV</p>
        </div>

        <div className="metric-card">
          <h3>Unique Customers</h3>
          <div className="metric-value">{revenueMetrics?.uniqueCustomers || 0}</div>
          <p className="metric-label">customers</p>
        </div>
      </div>

      <div className="chart-container">
        <h3>Revenue Over Time</h3>
        <div className="chart">
          {revenueChart && revenueChart.length > 0 ? (
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {revenueChart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.period}</td>
                    <td>${parseFloat(item.revenue).toFixed(2)}</td>
                    <td>{item.orders}</td>
                    <td>${parseFloat(item.avg_order_value).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RevenueOverview
