import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomerSegments, fetchCustomerLTV } from '../../../store/slices/analyticsSlice'
import '../styles/CustomerAnalytics.css'

const CustomerAnalytics = ({ dateRange }) => {
  const dispatch = useDispatch()
  const { customerSegments, customerLTV, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchCustomerSegments())
    dispatch(fetchCustomerLTV({ limit: 20 }))
  }, [dispatch])

  if (loading) return <div className="loading">Loading customer data...</div>

  return (
    <div className="customer-analytics">
      <div className="segments-container">
        <h3>Customer Segments</h3>
        <div className="segments-grid">
          {customerSegments && customerSegments.length > 0 ? (
            customerSegments.map((segment, index) => (
              <div key={index} className="segment-card">
                <h4>{segment.segment}</h4>
                <p className="segment-count">{segment.customer_count} customers</p>
                <p>
                  <strong>Avg Spent:</strong> ${parseFloat(segment.avg_spent).toFixed(2)}
                </p>
                <p>
                  <strong>Avg Orders:</strong> {segment.avg_orders?.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p>No segment data available</p>
          )}
        </div>
      </div>

      <div className="ltv-container">
        <h3>Top Customers by Lifetime Value</h3>
        <table className="ltv-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Avg Order Value</th>
              <th>Last Order</th>
              <th>Reviews Posted</th>
            </tr>
          </thead>
          <tbody>
            {customerLTV && customerLTV.length > 0 ? (
              customerLTV.map((customer, index) => (
                <tr key={index}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.total_orders}</td>
                  <td>${parseFloat(customer.lifetime_value).toFixed(2)}</td>
                  <td>${parseFloat(customer.avg_order_value).toFixed(2)}</td>
                  <td>
                    {customer.last_order_date
                      ? new Date(customer.last_order_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{customer.reviews_posted}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No customer data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CustomerAnalytics
