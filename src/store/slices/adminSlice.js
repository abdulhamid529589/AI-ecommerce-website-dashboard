import { createSlice } from '@reduxjs/toolkit'
import api from '../../lib/axios'

export const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    loading: false,
    totalUsers: 0,
    users: [],
    totalRevenueAllTime: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    totalUsersCount: 0,
    monthlySales: [],
    orderStatusCounts: {},
    topSellingProducts: [],
    lowStockProducts: 0,
    revenueGrowth: '',
    newUsersThisMonth: 0,
    currentMonthSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setDashboardStats: (state, action) => {
      const data = action.payload
      state.totalRevenueAllTime = data.totalRevenueAllTime || 0
      state.todayRevenue = data.todayRevenue || 0
      state.yesterdayRevenue = data.yesterdayRevenue || 0
      state.totalUsersCount = data.totalUsersCount || 0
      state.monthlySales = data.monthlySales || []
      state.orderStatusCounts = data.orderStatusCounts || {}
      state.topSellingProducts = data.topSellingProducts || []
      state.lowStockProducts = data.lowStockProducts || []
      state.revenueGrowth = data.revenueGrowth || ''
      state.newUsersThisMonth = data.newUsersThisMonth || 0
      state.currentMonthSales = data.currentMonthSales || 0

      // Map for mini summary cards
      state.totalRevenue = data.totalRevenueAllTime || 0
      state.totalOrders = Object.values(data.orderStatusCounts || {}).reduce((a, b) => a + b, 0)
      state.totalCustomers = data.totalUsersCount || 0

      state.loading = false
      state.error = null
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

// Async thunk to fetch dashboard stats
export const fetchDashboardStats = () => async (dispatch) => {
  dispatch(adminSlice.actions.setLoading(true))
  try {
    const response = await api.get('/admin/fetch/dashboard-stats')

    console.log('✅ Dashboard stats fetched:', response.data)
    dispatch(adminSlice.actions.setDashboardStats(response.data))
  } catch (error) {
    console.error('❌ Failed to fetch dashboard stats:', error)
    dispatch(
      adminSlice.actions.setError(
        error.response?.data?.message || 'Failed to fetch dashboard stats',
      ),
    )
  }
}

export const { setLoading, setDashboardStats, setError } = adminSlice.actions
export default adminSlice.reducer
