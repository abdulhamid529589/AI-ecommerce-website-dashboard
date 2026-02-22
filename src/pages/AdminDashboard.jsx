import React from 'react'
import { useSelector } from 'react-redux'
import EnhancedDashboard from '../components/Dashboard/EnhancedDashboard'

const AdminDashboard = () => {
  const isDark = useSelector((state) => state.theme?.isDark) || false

  // EnhancedDashboard handles all fetching and rendering internally
  return <EnhancedDashboard />
}

export default AdminDashboard
