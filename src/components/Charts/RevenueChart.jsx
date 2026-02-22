import React, { useEffect, useState } from 'react'
import api from '../../lib/axios'

const RevenueChart = ({ isDark }) => {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const response = await api.get('/analytics/revenue/metrics')
      if (response.data.success) {
        setChartData(response.data.data)
      } else {
        throw new Error(response.data.message)
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      // Mock data for development
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [1200000, 1900000, 1500000, 2200000, 1800000, 2450000],
      })
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

  const maxValue = Math.max(...chartData.data)
  const normalizedData = chartData.data.map((val) => (val / maxValue) * 100)

  return (
    <div
      className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
    >
      <h3 className={`font-semibold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Revenue Trend
      </h3>
      <div className="flex items-end justify-between h-64 gap-2">
        {normalizedData.map((height, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div className="w-full flex items-end justify-center">
              <div
                className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {chartData.labels[idx]}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Total: ৳{chartData.data.reduce((a, b) => a + b, 0).toLocaleString('bn-BD')}
        </p>
      </div>
    </div>
  )
}

export default RevenueChart
