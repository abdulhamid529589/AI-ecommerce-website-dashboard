import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInventoryAnalytics } from '../../../store/slices/analyticsSlice'
import '../styles/InventoryHealth.css'

const InventoryHealth = () => {
  const dispatch = useDispatch()
  const { inventoryAnalytics, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchInventoryAnalytics())
  }, [dispatch])

  if (loading) return <div className="loading">Loading inventory data...</div>

  const getStockStatus = (status) => {
    const colors = {
      'Out of Stock': '#E74C3C',
      'Low Stock': '#F39C12',
      'Medium Stock': '#F1C40F',
      'Healthy Stock': '#2ECC71',
    }
    return colors[status] || '#95a5a6'
  }

  const getMovementSpeed = (speed) => {
    const colors = {
      'Fast Moving': '#2ECC71',
      Popular: '#3498DB',
      Moderate: '#F39C12',
      'Slow Moving': '#E74C3C',
    }
    return colors[speed] || '#95a5a6'
  }

  const outOfStock = inventoryAnalytics?.filter((p) => p.current_stock === 0) || []
  const lowStock =
    inventoryAnalytics?.filter((p) => p.current_stock > 0 && p.current_stock < 10) || []
  const healthyStock =
    inventoryAnalytics?.filter(
      (p) => p.current_stock >= 10 && p.stock_status === 'Healthy Stock',
    ) || []

  return (
    <div className="inventory-health">
      <div className="inventory-summary">
        <div className="summary-card alert">
          <h3>Out of Stock</h3>
          <p className="count">{outOfStock.length}</p>
          <p className="label">products</p>
        </div>
        <div className="summary-card warning">
          <h3>Low Stock</h3>
          <p className="count">{lowStock.length}</p>
          <p className="label">products</p>
        </div>
        <div className="summary-card success">
          <h3>Healthy Stock</h3>
          <p className="count">{healthyStock.length}</p>
          <p className="label">products</p>
        </div>
      </div>

      <div className="inventory-table-container">
        <h3>Product Inventory Status</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Current Stock</th>
              <th>Times Ordered</th>
              <th>Total Sold</th>
              <th>Avg per Order</th>
              <th>Stock Status</th>
              <th>Movement Speed</th>
            </tr>
          </thead>
          <tbody>
            {inventoryAnalytics && inventoryAnalytics.length > 0 ? (
              inventoryAnalytics.slice(0, 50).map((product, index) => (
                <tr
                  key={index}
                  className={`status-${product.stock_status.toLowerCase().replace(/ /g, '-')}`}
                >
                  <td>{product.name}</td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td className="stock-number">{product.current_stock}</td>
                  <td>{product.times_ordered}</td>
                  <td>{product.total_sold}</td>
                  <td>
                    {product.avg_quantity_per_order ? product.avg_quantity_per_order.toFixed(2) : 0}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStockStatus(product.stock_status) }}
                    >
                      {product.stock_status}
                    </span>
                  </td>
                  <td>
                    <span
                      className="movement-badge"
                      style={{ backgroundColor: getMovementSpeed(product.movement_speed) }}
                    >
                      {product.movement_speed}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No inventory data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {outOfStock.length > 0 && (
        <div className="alert-section">
          <h3>⚠️ Out of Stock Products</h3>
          <div className="product-list">
            {outOfStock.slice(0, 10).map((product, index) => (
              <div key={index} className="product-item">
                <p>
                  <strong>{product.name}</strong> - {product.times_ordered} times ordered
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryHealth
