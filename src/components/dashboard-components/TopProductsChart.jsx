import { useSelector } from 'react-redux'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts'

const TopProductsChart = () => {
  const { topSellingProducts = [] } = useSelector((state) => state.admin || {})

  // Transform backend data to chart format
  const data =
    topSellingProducts.length > 0
      ? topSellingProducts.slice(0, 6).map((product) => ({
          name: product.name || 'N/A',
          sales: parseInt(product.total_sold || 0),
        }))
      : [
          { name: 'Product 1', sales: 4000 },
          { name: 'Product 2', sales: 3000 },
          { name: 'Product 3', sales: 2500 },
          { name: 'Product 4', sales: 2200 },
          { name: 'Product 5', sales: 1800 },
          { name: 'Product 6', sales: 1500 },
        ]

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top Selling Products</h3>
      <div className="bar-chart-responsive">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '0.75rem' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TopProductsChart
