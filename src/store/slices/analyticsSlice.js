import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

// Async thunks for analytics
export const fetchDashboardSummary = createAsyncThunk(
  'analytics/fetchDashboardSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/summary', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary')
    }
  },
)

export const fetchRevenueMetrics = createAsyncThunk(
  'analytics/fetchRevenueMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/revenue/metrics', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue metrics')
    }
  },
)

export const fetchRevenueChart = createAsyncThunk(
  'analytics/fetchRevenueChart',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/revenue/chart', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue chart')
    }
  },
)

export const fetchTopProducts = createAsyncThunk(
  'analytics/fetchTopProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/products/top', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top products')
    }
  },
)

export const fetchCustomerSegments = createAsyncThunk(
  'analytics/fetchCustomerSegments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/customers/segments', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer segments')
    }
  },
)

export const fetchCustomerLTV = createAsyncThunk(
  'analytics/fetchCustomerLTV',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/customers/ltv', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer LTV')
    }
  },
)

export const fetchOrderMetrics = createAsyncThunk(
  'analytics/fetchOrderMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/orders/metrics', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order metrics')
    }
  },
)

export const fetchOrderStatusDistribution = createAsyncThunk(
  'analytics/fetchOrderStatusDistribution',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/orders/status-distribution', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order status distribution',
      )
    }
  },
)

export const fetchInventoryAnalytics = createAsyncThunk(
  'analytics/fetchInventoryAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/inventory', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory analytics')
    }
  },
)

export const fetchCategoryPerformance = createAsyncThunk(
  'analytics/fetchCategoryPerformance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/products/categories/performance', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category performance',
      )
    }
  },
)

export const fetchReviewAnalytics = createAsyncThunk(
  'analytics/fetchReviewAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/reviews', { params })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review analytics')
    }
  },
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    loading: false,
    error: null,
    dashboardSummary: null,
    revenueMetrics: null,
    revenueChart: [],
    topProducts: [],
    customerSegments: [],
    customerLTV: [],
    orderMetrics: null,
    orderStatusDistribution: [],
    inventoryAnalytics: [],
    categoryPerformance: [],
    reviewAnalytics: null,
  },
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null
    },
    resetAnalytics: (state) => {
      state.loading = false
      state.error = null
      state.dashboardSummary = null
      state.revenueMetrics = null
      state.revenueChart = []
      state.topProducts = []
      state.customerSegments = []
      state.customerLTV = []
      state.orderMetrics = null
      state.orderStatusDistribution = []
      state.inventoryAnalytics = []
      state.categoryPerformance = []
      state.reviewAnalytics = null
    },
  },
  extraReducers: (builder) => {
    // Dashboard Summary
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardSummary = action.payload
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Revenue Metrics
    builder
      .addCase(fetchRevenueMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRevenueMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.revenueMetrics = action.payload
      })
      .addCase(fetchRevenueMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Revenue Chart
    builder
      .addCase(fetchRevenueChart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.loading = false
        state.revenueChart = action.payload
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Top Products
    builder
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false
        state.topProducts = action.payload
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Customer Segments
    builder
      .addCase(fetchCustomerSegments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerSegments.fulfilled, (state, action) => {
        state.loading = false
        state.customerSegments = action.payload
      })
      .addCase(fetchCustomerSegments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Customer LTV
    builder
      .addCase(fetchCustomerLTV.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerLTV.fulfilled, (state, action) => {
        state.loading = false
        state.customerLTV = action.payload
      })
      .addCase(fetchCustomerLTV.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Order Metrics
    builder
      .addCase(fetchOrderMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.orderMetrics = action.payload
      })
      .addCase(fetchOrderMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Order Status Distribution
    builder
      .addCase(fetchOrderStatusDistribution.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderStatusDistribution.fulfilled, (state, action) => {
        state.loading = false
        state.orderStatusDistribution = action.payload
      })
      .addCase(fetchOrderStatusDistribution.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Inventory Analytics
    builder
      .addCase(fetchInventoryAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.inventoryAnalytics = action.payload
      })
      .addCase(fetchInventoryAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Category Performance
    builder
      .addCase(fetchCategoryPerformance.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoryPerformance.fulfilled, (state, action) => {
        state.loading = false
        state.categoryPerformance = action.payload
      })
      .addCase(fetchCategoryPerformance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Review Analytics
    builder
      .addCase(fetchReviewAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviewAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.reviewAnalytics = action.payload
      })
      .addCase(fetchReviewAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
