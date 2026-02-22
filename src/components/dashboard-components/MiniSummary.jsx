import React from 'react'
import { Wallet, PackageCheck, TrendingUp, UserPlus } from 'lucide-react'
import { useSelector } from 'react-redux'
import KPI from './KPI'

const MiniSummary = () => {
  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalCustomers = 0,
  } = useSelector((state) => state.admin || {})

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPI label="Total Revenue" value={`৳${(totalRevenue || 0).toLocaleString()}`} />
      <KPI label="Total Orders" value={(totalOrders || 0).toLocaleString()} />
      <KPI label="Total Customers" value={(totalCustomers || 0).toLocaleString()} />
      <KPI label="Growth" value={`24.5%`} />
    </div>
  )
}

export default MiniSummary
