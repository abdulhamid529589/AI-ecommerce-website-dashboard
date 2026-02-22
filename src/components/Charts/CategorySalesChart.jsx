import React, { useEffect, useState } from 'react'
import api from '../../lib/axios'

const CategorySalesChart = ({ isDark }) => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const response = await api.get('/analytics/products/by-category')
      if (response.data.success) {
        setChartData(response.data.data)
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      // Mock data for development
      setChartData([
        { category: 'Bedding', sales: 45, percentage: 45 },
        { category: 'Pillows', sales: 28, percentage: 28 },
        { category: 'Blankets', sales: 18, percentage: 18 },
        { category: 'Comforters', sales: 9, percentage: 9 },
      ])
    }
  }

  if (!chartData) {
    return (
      <div
        className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6 h-80 flex items-center justify-center`}
      >
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    )
  }

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
    >
      <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Sales by Category
      </h3>
      <div className="space-y-3">
        {chartData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.category}
              </p>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.percentage}%
              </p>
            </div>
            <div
              className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: colors[idx % colors.length],
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategorySalesChart
