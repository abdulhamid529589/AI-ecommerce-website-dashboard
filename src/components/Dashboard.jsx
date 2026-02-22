import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Header from './Header'
import MiniSummary from './dashboard-components/MiniSummary'
import TopSellingProducts from './dashboard-components/TopSellingProducts'
import Stats from './dashboard-components/Stats'
import MonthlySalesChart from './dashboard-components/MonthlySalesChart'
import OrdersChart from './dashboard-components/OrdersChart'
import TopProductsChart from './dashboard-components/TopProductsChart'
import { fetchDashboardStats } from '../store/slices/adminSlice'
import '../styles/dashboard.css'
import QuickActions from './Dashboard/QuickActions'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.admin || {})

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        {/* Mini Summary Cards */}
        <div className="dashboard-section">
          <MiniSummary />
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <QuickActions />
        </div>

        {/* Stats Section */}
        <div className="dashboard-section">
          <Stats />
        </div>

        {/* Charts Grid */}
        <div className="charts-container">
          <div className="chart-box">
            <MonthlySalesChart />
          </div>
          <div className="chart-box">
            <OrdersChart />
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="charts-bottom-container">
          <div className="chart-box">
            <TopProductsChart />
          </div>
          <div className="chart-box">
            <TopSellingProducts />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
