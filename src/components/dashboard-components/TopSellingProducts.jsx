import React from 'react'
import { useSelector } from 'react-redux'
import { TrendingUp, Package } from 'lucide-react'

const TopSellingProducts = () => {
  const { topSellingProducts = [] } = useSelector((state) => state.admin || {})

  const products =
    topSellingProducts.length > 0
      ? topSellingProducts.slice(0, 5).map((product) => ({
          id: product.name,
          name: product.name || 'N/A',
          category: product.category || 'N/A',
          quantity: parseInt(product.total_sold || 0),
          revenue: (parseFloat(product.total_sold || 0) * 100).toFixed(0), // Estimate or get from backend
        }))
      : [
          {
            id: 1,
            name: 'Wireless Headphones',
            category: 'Electronics',
            quantity: 156,
            revenue: 45000,
          },
          {
            id: 2,
            name: 'Smart Watch',
            category: 'Wearables',
            quantity: 124,
            revenue: 62000,
          },
          {
            id: 3,
            name: 'Phone Case',
            category: 'Accessories',
            quantity: 203,
            revenue: 20300,
          },
          {
            id: 4,
            name: 'USB Cable',
            category: 'Accessories',
            quantity: 456,
            revenue: 13680,
          },
          {
            id: 5,
            name: 'Laptop Stand',
            category: 'Furniture',
            quantity: 87,
            revenue: 35490,
          },
        ]

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top Selling Products</h3>
      <div className="chart-table-wrapper">
        <table className="chart-table">
          <thead>
            <tr>
              <th className="text-left">Product Name</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right">
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {product.quantity}
                  </span>
                </td>
                <td className="text-right font-semibold text-gray-900 dark:text-white">
                  ৳{parseInt(product.revenue).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopSellingProducts
