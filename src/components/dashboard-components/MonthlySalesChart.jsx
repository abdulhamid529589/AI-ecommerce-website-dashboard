import { useSelector } from 'react-redux'
import {
  XAxis,
  YAxis,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { getLastNMonths } from '../../lib/helper'

const MonthlySalesChart = () => {
  const { monthlySales = [] } = useSelector((state) => state.admin || {})

  // Transform backend data to chart format
  const data =
    monthlySales.length > 0
      ? monthlySales.map((item) => ({
          month: item.month || 'N/A',
          sales: parseFloat(item.totalsales || 0),
          orders: parseInt(item.orders || 0) || 0,
        }))
      : getLastNMonths(6).map((month) => ({
          month,
          sales: Math.floor(Math.random() * 10000) + 5000,
          orders: Math.floor(Math.random() * 100) + 50,
        }))

  return (
    <div className="chart-container">
      <h3 className="chart-title">Monthly Sales</h3>
      <div className="line-chart-responsive">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MonthlySalesChart
