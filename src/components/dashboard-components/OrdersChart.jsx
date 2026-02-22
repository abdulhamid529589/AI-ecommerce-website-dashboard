import { useSelector } from 'react-redux'
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const OrdersChart = () => {
  const { orderStatusCounts = {} } = useSelector((state) => state.admin || {})

  const statusColors = {
    Processing: '#facc15', // yellow
    Shipped: '#3b82f6', // blue
    Delivered: '#22c55e', // green
    Cancelled: '#ef4444', // red
  }

  const orderStatusData = Object.keys(statusColors)
    .map((status) => ({
      status,
      count: parseInt(orderStatusCounts[status] || 0),
    }))
    .filter((item) => item.count > 0)

  return (
    <div className="chart-container">
      <h3 className="chart-title">Order Status Distribution</h3>
      <div className="pie-chart-responsive">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={orderStatusData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, count }) => `${name}: ${count}`}
              labelLine={false}
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#ccc'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value} orders`}
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OrdersChart
