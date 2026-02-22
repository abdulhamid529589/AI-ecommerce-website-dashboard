import React, { useEffect, useState } from 'react'
import { formatNumber } from '../../lib/helper'
import { useSelector } from 'react-redux'
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

const Stats = () => {
  const { orderStatusCounts = {}, totalRevenue = 0 } = useSelector((state) => state.admin || {})

  const stats = [
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Processing',
      value: orderStatusCounts?.Processing || 0,
      color: 'bg-yellow-500',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Shipped',
      value: orderStatusCounts?.Shipped || 0,
      color: 'bg-blue-500',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Delivered',
      value: orderStatusCounts?.Delivered || 0,
      color: 'bg-green-500',
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Cancelled',
      value: orderStatusCounts?.Cancelled || 0,
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="stats-row">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className={`stat-item-icon ${stat.color} text-white`}>{stat.icon}</div>
          <div className="stat-item-content">
            <div className="stat-item-label">{stat.label}</div>
            <div className="stat-item-value">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Stats
