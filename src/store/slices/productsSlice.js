import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'product',
  initialState: {
    loading: false,
    products: [],
    totalProducts: 0,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setProducts: (state, action) => {
      state.products = action.payload
    },
    createNewProduct: (state, action) => {
      state.products.push(action.payload)
      state.totalProducts += 1
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload)
      state.totalProducts -= 1
    },
  },
})

export const { setLoading, setProducts, createNewProduct, updateProduct, deleteProduct } =
  productSlice.actions

export default productSlice.reducer
