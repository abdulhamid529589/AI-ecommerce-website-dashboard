import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    user: null,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.error = action.payload
    },
    logout: (state) => {
      state.loading = false
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
