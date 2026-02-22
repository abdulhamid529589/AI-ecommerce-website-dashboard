import { createSlice } from '@reduxjs/toolkit'

const extraSlice = createSlice({
  name: 'extra',
  initialState: {
    openedComponent: 'Dashboard',
    isNavbarOpened: false,
    isViewProductModalOpened: false,
    isCreateProductModalOpened: false,
    isUpdateProductModalOpened: false,
  },
  reducers: {
    toggleCreateProductModal: (state) => {
      state.isCreateProductModalOpened = !state.isCreateProductModalOpened
    },
    toggleViewProductModal: (state) => {
      state.isViewProductModalOpened = !state.isViewProductModalOpened
    },
    toggleUpdateProductModal: (state) => {
      state.isUpdateProductModalOpened = !state.isUpdateProductModalOpened
    },
    toggleNavbar: (state) => {
      state.isNavbarOpened = !state.isNavbarOpened
    },
  },
})

export const {
  toggleCreateProductModal,
  toggleViewProductModal,
  toggleUpdateProductModal,
  toggleNavbar,
} = extraSlice.actions

export default extraSlice.reducer
