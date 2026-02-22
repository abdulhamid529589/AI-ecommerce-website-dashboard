import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTopProducts, fetchCategoryPerformance } from '../../../store/slices/analyticsSlice'
import '../styles/ProductPerformance.css'

const ProductPerformance = ({ dateRange }) => {
  const dispatch = useDispatch()
  const { topProducts, categoryPerformance, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchTopProducts({ ...dateRange, limit: 20, metric: 'revenue' }))
    dispatch(fetchCategoryPerformance(dateRange))
  }, [dispatch, dateRange])

  if (loading) return <div className="loading">Loading product data...</div>

  return (
    <div className="product-performance">
      <div className="products-container">
        <h3>Top Products by Revenue</h3>
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Units Sold</th>
              <th>Revenue</th>
              <th>Avg Rating</th>
              <th>Reviews</th>
            </tr>
          </thead>
          <tbody>
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.units_sold || 0}</td>
                  <td>${parseFloat(product.revenue).toFixed(2)}</td>
                  <td>{product.avg_rating ? product.avg_rating.toFixed(2) : 'N/A'}</td>
                  <td>{product.review_count || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="categories-container">
        <h3>Category Performance</h3>
        <div className="categories-grid">
          {categoryPerformance && categoryPerformance.length > 0 ? (
            categoryPerformance.map((category, index) => (
              <div key={index} className="category-card">
                <h4>{category.category || 'Uncategorized'}</h4>
                <p>
                  <strong>Products:</strong> {category.total_products}
                </p>
                <p>
                  <strong>Orders:</strong> {category.total_orders}
                </p>
                <p>
                  <strong>Revenue:</strong> ${parseFloat(category.revenue).toFixed(2)}
                </p>
                <p>
                  <strong>Avg Rating:</strong>{' '}
                  {category.avg_rating ? category.avg_rating.toFixed(2) : 'N/A'}
                </p>
              </div>
            ))
          ) : (
            <p>No categories found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPerformance
